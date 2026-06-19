import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import { useTranslate } from 'src/locales';
import { getSocket } from 'src/socket/socket';
import { chatSocketService } from 'src/socket/chatSocketService';
import { useUploadChatFilesMutation } from 'src/store/Reducer/auth';
import { useGetUrlMetaMutation, useGetPopularTagsQuery } from 'src/store/Reducer/rooms-api';
import { getHashtagQuery } from 'src/components/hashtags/hashtag-utils';
import HashtagSuggestions from 'src/components/hashtags/hashtag-suggestions';
import SelectFile from './select-file';
import FileUploadProgress from './file-upload-progress';
import AttachedFileChip from './attached-file-chip';
import AudioRecorder from './audio-recorder';
import LinkPreview from './link-preview';

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/;

export default function ChatInputBar({ activeRoom, onOptimisticMessage, dropFile }) {
  const { t } = useTranslate('common');
  const inputRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const [message, setMessage] = React.useState('');
  const [fileMenuAnchor, setFileMenuAnchor] = React.useState(null);
  const [upload, setUpload] = React.useState({ file: null, progress: 0 });
  const [attachedFile, setAttachedFile] = React.useState(null);
  const [audioRecorderOpen, setAudioRecorderOpen] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const uploadTimerRef = React.useRef(null);
  const [isSending, setIsSending] = React.useState(false);
  const [linkMeta, setLinkMeta] = React.useState(null);
  const [linkMetaDismissed, setLinkMetaDismissed] = React.useState(false);
  const lastFetchedUrlRef = React.useRef(null);
  const linkDebounceRef = React.useRef(null);
  const fetchGenerationRef = React.useRef(0);

  const [uploadChatFiles] = useUploadChatFilesMutation();
  const [fetchUrlMeta] = useGetUrlMetaMutation();

  const hashtagQuery = React.useMemo(() => getHashtagQuery(message), [message]);
  const { data: popularHashtags = [] } = useGetPopularTagsQuery(
    { search: hashtagQuery?.query ?? '' },
    { skip: !activeRoom?.id || !hashtagQuery }
  );

  // Just store the file locally — no upload yet. Upload happens on send.
  const handleFileSelected = (fileInput) => {
    const file = fileInput?.file ?? fileInput;
    if (!(file instanceof File)) {
      toast.error(t('chat_input.toast_file_read_error'));
      return;
    }
    // Revoke any previous preview URL to avoid memory leaks
    if (attachedFile?.url) URL.revokeObjectURL(attachedFile.url);
    setAttachedFile({
      file,
      url: URL.createObjectURL(file),
      type: file.type,
      name: file.name,
      size: file.size,
    });
  };

  const cancelUpload = () => {
    clearInterval(uploadTimerRef.current);
    setUpload({ file: null, progress: 0 });
    if (attachedFile?.url) URL.revokeObjectURL(attachedFile.url);
    setAttachedFile(null);
  };

  // URL detection — debounced 700ms, skip if dismissed or already fetched
  React.useEffect(() => {
    clearTimeout(linkDebounceRef.current);
    const match = message.match(URL_REGEX);
    const detected = match?.[0] ?? null;

    if (!detected) {
      setLinkMeta(null);
      setLinkMetaDismissed(false);
      lastFetchedUrlRef.current = null;
      return;
    }

    if (detected === lastFetchedUrlRef.current || linkMetaDismissed) return;

    linkDebounceRef.current = setTimeout(async () => {
      const generation = fetchGenerationRef.current;
      try {
        lastFetchedUrlRef.current = detected;
        const meta = await fetchUrlMeta(detected).unwrap();
        if (fetchGenerationRef.current !== generation) return;
        if (meta && Object.values(meta).some(Boolean)) {
          setLinkMeta({ ...meta, url: meta.url ?? detected });
        }
      } catch {
        // silently ignore — preview is non-critical
      }
    }, 700);

    return () => clearTimeout(linkDebounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  // File dropped on the messages area (passed down from home-view)
  React.useEffect(() => {
    if (dropFile?.file) handleFileSelected(dropFile.file);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropFile]);

  // Paste image — scoped to the input container so it doesn't fire on other inputs
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handleFileSelected(file);
          break;
        }
      }
    };

    el.addEventListener('paste', handlePaste);
    return () => el.removeEventListener('paste', handlePaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag & drop image onto the input bar
  const handleDragOver = (e) => {
    e.preventDefault();
    if (e.dataTransfer.items.length > 0) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // only clear when leaving the container entirely, not a child element
    if (!containerRef.current?.contains(e.relatedTarget)) setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelected(file);
  };

  const handleSend = async () => {
    const rawText = message.trim();
    if (!rawText && !attachedFile && !linkMeta) return;

    const socket = getSocket();
    if (!socket?.connected) {
      toast.error(t('chat_input.toast_not_connected'));
      return;
    }

    setIsSending(true);
    try {
      let attachments = [];

      // Upload the file now, at send time
      if (attachedFile?.file) {
        setUpload({ file: attachedFile.file, progress: 0 });
        let fakeProgress = 0;
        uploadTimerRef.current = setInterval(() => {
          fakeProgress = Math.min(85, fakeProgress + Math.floor(Math.random() * 12) + 4);
          setUpload((prev) => ({ ...prev, progress: fakeProgress }));
        }, 200);

        try {
          const result = await uploadChatFiles(attachedFile.file).unwrap();
          clearInterval(uploadTimerRef.current);
          setUpload({ file: null, progress: 0 });
          const data = Array.isArray(result) ? result[0] : result;
          const { fileName, fileType, originalFileName } = data;
          attachments = [{ fileName, fileType, originalFileName }];
        } catch (err) {
          clearInterval(uploadTimerRef.current);
          setUpload({ file: null, progress: 0 });
          console.error('[Upload] ✗ upload failed:', err);
          toast.error(t('chat_input.toast_upload_failed'));
          return;
        }
      }

      chatSocketService.sendMessage({
        roomId: activeRoom.id,
        content: rawText,
        attachments,
        meta: linkMeta ?? {},
      });
      onOptimisticMessage?.({ content: rawText, attachedFile, meta: linkMeta ?? {} });
      window.dispatchEvent(new CustomEvent('roomListUpdate', {
        detail: {
          roomId: activeRoom.id,
          lastMessage: { content: rawText, createdAt: new Date().toISOString(), attachments },
        },
      }));

      clearTimeout(linkDebounceRef.current);
      fetchGenerationRef.current += 1;
      setMessage('');
      if (attachedFile?.url) URL.revokeObjectURL(attachedFile.url);
      setAttachedFile(null);
      setLinkMeta(null);
      setLinkMetaDismissed(false);
      lastFetchedUrlRef.current = null;
    } catch (err) {
      console.error('Send message error:', err);
      toast.error(t('chat_input.toast_send_failed'));
    } finally {
      setIsSending(false);
    }
  };

  const handlePickHashtag = (tag) => {
    const value = message || '';
    const next = value.replace(/(?:^|\s)#([\p{L}\p{N}_]{0,32})$/u, (m, q) => m.replace(`#${q}`, `#${tag}`)) + ' ';
    setMessage(next);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <Box
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{ flexShrink: 0, mt: 1.5 }}
    >
      {upload.file && (
        <FileUploadProgress
          file={upload.file}
          progress={upload.progress}
          onCancel={cancelUpload}
        />
      )}

      {attachedFile && !upload.file && (
        <AttachedFileChip file={attachedFile} onRemove={() => setAttachedFile(null)} />
      )}

      {linkMeta && !linkMetaDismissed && (
        <LinkPreview
          meta={linkMeta}
          onDismiss={() => { setLinkMetaDismissed(true); setLinkMeta(null); }}
        />
      )}

      {audioRecorderOpen ? (
        <AudioRecorder
          onDone={(fileData) => {
            setAudioRecorderOpen(false);
            handleFileSelected(fileData);
          }}
          onCancel={() => setAudioRecorderOpen(false)}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: isDragOver ? '#f0f0ff' : '#fff',
            border: isDragOver ? '1.5px dashed #4C4EFF' : '1px solid #e8e8e8',
            borderRadius: 3,
            px: 1.5,
            py: 0.75,
            boxShadow: '0px 1px 8px rgba(0,0,0,0.06)',
            position: 'relative',
            transition: 'border 0.15s, background-color 0.15s',
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => setFileMenuAnchor(e.currentTarget)}
            sx={{ color: '#9e9e9e', flexShrink: 0 }}
          >
            <Iconify icon="mingcute:add-line" width={22} />
          </IconButton>

          <SelectFile
            anchorEl={fileMenuAnchor}
            onClose={() => setFileMenuAnchor(null)}
            onFileSelected={handleFileSelected}
            onAudioRecord={() => setAudioRecorderOpen(true)}
          />

          <InputBase
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !upload.file && !isSending) { e.preventDefault(); handleSend(); } }}
            placeholder={t('chat_input.placeholder')}
            inputRef={inputRef}
            fullWidth
            multiline
            maxRows={4}
            sx={{
              flex: 1,
              fontSize: 14,
              color: 'text.primary',
              '& textarea': { p: 0 },
            }}
          />

          <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 52 }}>
            <HashtagSuggestions value={message} hashtags={popularHashtags} onPick={handlePickHashtag} />
          </Box>

          <IconButton
            onClick={handleSend}
            disabled={isSending || !!upload.file || (!message.trim() && !attachedFile && !linkMeta)}
            size="small"
            sx={{
              flexShrink: 0,
              bgcolor: '#4C4EFF',
              color: '#fff',
              width: 34,
              height: 34,
              borderRadius: '50%',
              '&:hover': { bgcolor: '#3739b7' },
              '&.Mui-disabled': { bgcolor: '#c5c6ff', color: '#fff' },
            }}
          >
            {isSending
              ? <CircularProgress size={16} sx={{ color: '#fff' }} />
              : <Iconify icon="mingcute:send-line" width={18} />
            }
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
