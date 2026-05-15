import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';

import { Iconify } from 'src/components/iconify';
import HashtagSuggestions from 'src/components/hashtags/hashtag-suggestions';
import { HASHTAGS } from 'src/sections/active-sections/home-view/hashtags-mock';
import InterestsTab from './interests';
import SummaryTab from './summary';
import ChatHistoryDrawer from './components/chat-history-drawer';
import { useLazyGetAiChatDetailQuery, useLazyGetAiChatQuery, useLazyGetAiHistoryQuery } from 'src/store/Reducer/ai-api';
import { closeChatHistoryDrawer } from 'src/utils/drawer-events';

const CHAT_HISTORY_DRAWER_WIDTH = 420;

const TABS = [
  { value: 'prompts', label: 'Prompts' },
  { value: 'interests', label: 'Interests' },
  { value: 'summary', label: 'Summary' },
];

const CARDS = [
  {
    title: 'Emotional Needs Decoder',
    subtitle: 'If this journal were a world, what would it look like?',
  },
  {
    title: 'World of ME',
    subtitle: 'If this journal were a world, what would it look like?',
  },
  {
    title: 'Top Content Type',
    subtitle: 'Type of content I share the most.',
  },
];


function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Box component="img" src="/logo/logo-single.svg" sx={{ width: 18, height: 18 }} />
      </Box>
      <Box
        sx={{
          bgcolor: '#f7f7f8',
          border: '1px solid rgba(0,0,0,0.06)',
          px: 1.35,
          py: 1,
          borderRadius: '14px 14px 14px 4px',
          display: 'flex',
          gap: 0.45,
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#bbb',
              animation: 'typingBounce 1.2s infinite',
              animationDelay: `${i * 0.2}s`,
              '@keyframes typingBounce': {
                '0%, 60%, 100%': { transform: 'translateY(0)' },
                '30%': { transform: 'translateY(-6px)' },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

function PromptCardSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: '#f7f7f8',
        borderRadius: 4,
        px: { xs: 2.5, md: 4 },
        py: { xs: 2.5, md: 3 },
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Skeleton variant="text" width="34%" height={26} sx={{ mx: 'auto' }} />
      <Skeleton variant="text" width="46%" height={18} sx={{ mx: 'auto' }} />
    </Box>
  );
}

function ChatMessageSkeleton() {
  return (
    <Stack spacing={2.5}>
      {[0, 1, 2].map((item) => (
        <Box
          key={item}
          sx={{
            display: 'flex',
            justifyContent: item % 2 ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end',
            gap: 1.5,
          }}
        >
          {item % 2 === 0 && <Skeleton variant="circular" width={32} height={32} />}
          <Skeleton
            variant="rounded"
            width={item % 2 ? '42%' : '58%'}
            height={item === 2 ? 92 : 54}
            sx={{ borderRadius: 3 }}
          />
        </Box>
      ))}
    </Stack>
  );
}

function sanitizeAssistantHtml(value) {
  const html = String(value ?? '');
  if (typeof window === 'undefined' || !window.DOMParser) return html;

  const doc = new window.DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, iframe, object, embed').forEach((node) => node.remove());
  doc.body.querySelectorAll('*').forEach((node) => {
    [...node.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const val = attr.value.trim().toLowerCase();
      if (name.startsWith('on') || (['href', 'src'].includes(name) && val.startsWith('javascript:'))) {
        node.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

const assistantHtmlSx = {
  color: 'inherit',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  animation: 'assistantFadeIn 180ms ease-out',
  '@keyframes assistantFadeIn': {
    from: { opacity: 0, transform: 'translateY(3px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
  '& p': { m: 0, fontSize: 14, lineHeight: 1.65 },
  '& p + p': { mt: 1 },
  '& strong': { fontWeight: 800, color: '#111827' },
  '& ol, & ul': { pl: 2.2, my: 0.75 },
  '& li': { pl: 0.3, mb: 0.6, fontSize: 14, lineHeight: 1.65 },
  '& li:last-of-type': { mb: 0 },
};

const shouldTypeResponse = (value) => {
  const text = String(value ?? '');
  return text.trim().length > 0;
};

const tokenizeAssistantResponse = (value) => {
  const text = String(value ?? '');
  const tokens = text.match(/<[^>]+>|\s+|[^\s<]+/g) ?? [];
  const frames = [];
  let buffer = '';

  tokens.forEach((token) => {
    buffer += token;
    if (token.startsWith('<') && token.endsWith('>')) return;
    frames.push(buffer);
  });

  return frames.length ? frames : [text];
};

export default function ChatMeView() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tab = searchParams.get('tab') || 'prompts';
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [typewriterId, setTypewriterId] = React.useState(null);
  const [typewriterText, setTypewriterText] = React.useState('');
  const [aiChatId, setAiChatId] = React.useState('');
  const [chatDetailPage, setChatDetailPage] = React.useState(1);
  const [chatDetailTotalPages, setChatDetailTotalPages] = React.useState(1);
  const [isLoadingHistoryChat, setIsLoadingHistoryChat] = React.useState(false);
  const [isLoadingOlderChat, setIsLoadingOlderChat] = React.useState(false);
  const [fetchAiPrompts, { data: aiPromptsData, isLoading: isPromptsLoading, isFetching: isPromptsFetching, isUninitialized: isPromptsUninitialized }] = useLazyGetAiHistoryQuery();
  const [fetchAiChat] = useLazyGetAiChatQuery();
  const [fetchAiChatDetail] = useLazyGetAiChatDetailQuery();
  const inputRef = React.useRef(null);
  const messagesContainerRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);
  const typewriterRef = React.useRef(null);
  const isLoadingOlderChatRef = React.useRef(false);
  const olderScrollHeightRef = React.useRef(0);
  const skipAutoScrollRef = React.useRef(false);
  const pendingBottomScrollRef = React.useRef(false);

  const [accountDrawerOpen, setAccountDrawerOpen] = React.useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = React.useState(false);
  const [chatHistoryDrawerOpen, setChatHistoryDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
    const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
    const onChatHistoryChange = (e) => setChatHistoryDrawerOpen(e.detail);
    window.addEventListener('accountDrawerChange', onAccountChange);
    window.addEventListener('profileDrawerChange', onProfileChange);
    window.addEventListener('chatHistoryChange', onChatHistoryChange);
    return () => {
      window.removeEventListener('accountDrawerChange', onAccountChange);
      window.removeEventListener('profileDrawerChange', onProfileChange);
      window.removeEventListener('chatHistoryChange', onChatHistoryChange);
    };
  }, []);

  React.useEffect(() => {
    if (skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false;
      return;
    }
    if (messages.length > 0 || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: pendingBottomScrollRef.current || typewriterId ? 'auto' : 'smooth' });
      pendingBottomScrollRef.current = false;
    }
  }, [messages, isTyping, isLoadingHistoryChat, typewriterText, typewriterId]);

  React.useLayoutEffect(() => {
    if (!olderScrollHeightRef.current || !messagesContainerRef.current) return;
    const el = messagesContainerRef.current;
    el.scrollTop = el.scrollHeight - olderScrollHeightRef.current;
    olderScrollHeightRef.current = 0;
    isLoadingOlderChatRef.current = false;
    setIsLoadingOlderChat(false);
  }, [messages]);

  React.useEffect(() => {
    if (tab !== 'prompts') return;
    fetchAiPrompts({ pageno: 1 });
  }, [tab, fetchAiPrompts]);

  // Typewriter: animate character by character using elapsed time so it continues in background tabs
  React.useEffect(() => {
    if (!typewriterId) return;
    const msg = messages.find((m) => m.id === typewriterId);
    if (!msg) return;
    const frames = tokenizeAssistantResponse(msg.content);
    let frameIndex = 0;
    setTypewriterText('');
    clearInterval(typewriterRef.current);
    typewriterRef.current = setInterval(() => {
      setTypewriterText(frames[frameIndex] ?? msg.content);
      frameIndex += 1;
      if (frameIndex >= frames.length) {
        clearInterval(typewriterRef.current);
        setTypewriterId(null);
      }
    }, msg.content.length > 1200 ? 26 : 36);
    return () => clearInterval(typewriterRef.current);
  }, [typewriterId]);

  const anyRightDrawerOpen = accountDrawerOpen || profileDrawerOpen || chatHistoryDrawerOpen;
  const contentRightOffset = chatHistoryDrawerOpen
    ? { md: `${CHAT_HISTORY_DRAWER_WIDTH}px` }
    : anyRightDrawerOpen
      ? { md: '90px' }
      : 0;

  const handleCloseChatHistory = React.useCallback(() => {
    setChatHistoryDrawerOpen(false);
    closeChatHistoryDrawer();
  }, []);

  const setTabWithUrl = React.useCallback((nextTab) => {
    const next = new URLSearchParams(location.search);
    if (nextTab === 'prompts') next.delete('tab');
    else next.set('tab', nextTab);
    navigate({ pathname: location.pathname, search: next.toString() ? `?${next.toString()}` : '' }, { replace: true });
  }, [location.pathname, location.search, navigate]);

  const handleNewChat = React.useCallback(() => {
    handleCloseChatHistory();
    setTabWithUrl('prompts');
    setAiChatId('');
    setMessages([]);
    setMessage('');
    setIsTyping(false);
    setIsLoadingHistoryChat(false);
    setChatDetailPage(1);
    setChatDetailTotalPages(1);
    setIsLoadingOlderChat(false);
    isLoadingOlderChatRef.current = false;
    olderScrollHeightRef.current = 0;
    skipAutoScrollRef.current = false;
    pendingBottomScrollRef.current = false;
    setTypewriterId(null);
    setTypewriterText('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [handleCloseChatHistory, setTabWithUrl]);

  const normalizeLoadedChatMessage = React.useCallback((msg) => ({
    id: msg.id ?? msg._id ?? `${msg.role}-${Date.now()}-${Math.random()}`,
    role: msg.role === 'assistant' ? 'assistant' : 'user',
    content: msg.content ?? '',
    time: msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  }), []);

  const handleHistoryChatSelect = React.useCallback(async (chat) => {
    const chatId = chat?.id ?? chat?._id;
    if (!chatId) return;

    handleCloseChatHistory();
    setTabWithUrl('prompts');
    setAiChatId(chatId);
    setMessages([]);
    setMessage('');
    setIsTyping(false);
    setIsLoadingHistoryChat(true);
    setChatDetailPage(1);
    setChatDetailTotalPages(1);
    setIsLoadingOlderChat(false);
    isLoadingOlderChatRef.current = false;
    olderScrollHeightRef.current = 0;
    skipAutoScrollRef.current = false;
    pendingBottomScrollRef.current = true;
    setTypewriterId(null);
    setTypewriterText('');

    try {
      const result = await fetchAiChatDetail({ chatId, pageno: 1 }).unwrap();
      setAiChatId(result?.chatId || chatId);
      setMessages((result?.messages ?? []).map(normalizeLoadedChatMessage));
      setChatDetailPage(result?.currentPage ?? 1);
      setChatDetailTotalPages(result?.totalPages ?? 1);
    } catch {
      setMessages([{
        id: `load-error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I could not load this chat. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoadingHistoryChat(false);
    }
  }, [fetchAiChatDetail, handleCloseChatHistory, normalizeLoadedChatMessage, setTabWithUrl]);

  const loadOlderChatMessages = React.useCallback(async () => {
    if (!aiChatId || isLoadingOlderChatRef.current || chatDetailPage >= chatDetailTotalPages) return;
    const el = messagesContainerRef.current;
    if (!el) return;

    isLoadingOlderChatRef.current = true;
    setIsLoadingOlderChat(true);
    olderScrollHeightRef.current = el.scrollHeight;
    const nextPage = chatDetailPage + 1;

    try {
      const result = await fetchAiChatDetail({ chatId: aiChatId, pageno: nextPage }).unwrap();
      const olderMessages = (result?.messages ?? []).map(normalizeLoadedChatMessage);
      setMessages((prev) => {
        const seen = new Set(prev.map((item) => String(item.id)));
        return [...olderMessages.filter((item) => !seen.has(String(item.id))), ...prev];
      });
      setChatDetailPage(result?.currentPage ?? nextPage);
      setChatDetailTotalPages(result?.totalPages ?? chatDetailTotalPages);
      skipAutoScrollRef.current = true;
    } catch {
      olderScrollHeightRef.current = 0;
      isLoadingOlderChatRef.current = false;
      setIsLoadingOlderChat(false);
    }
  }, [aiChatId, chatDetailPage, chatDetailTotalPages, fetchAiChatDetail, normalizeLoadedChatMessage]);

  const sendMessage = React.useCallback(async (text, messageId = '') => {
    const trimmed = text.trim();
    if (!trimmed || isTyping || typewriterId) return;

    const userMessageId = Date.now();
    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: 'user',
        content: trimmed,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessage('');
    setIsTyping(true);

    try {
      const result = await fetchAiChat({
        chatId: aiChatId,
        messageId,
        query: trimmed,
      }).unwrap();
      if (result?.chatId) setAiChatId(result.chatId);

      const id = Date.now();
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: 'assistant',
          content: result?.response || 'I could not generate a response right now.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      if (shouldTypeResponse(result?.response)) setTypewriterId(id);
    } catch {
      const id = Date.now();
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: 'assistant',
          content: 'Sorry, I could not reach AI chat. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setTypewriterId(id);
    }
  }, [aiChatId, fetchAiChat, isTyping, typewriterId]);

  const handleCardClick = React.useCallback((card) => {
    sendMessage(card.subtitle, card.id);
  }, [sendMessage]);

  const handleSend = React.useCallback(() => {
    sendMessage(message);
  }, [message, sendMessage]);

  const handlePickHashtag = React.useCallback((tag) => {
    const value = message || '';
    const next = value.replace(/(?:^|\s)#([\p{L}\p{N}_]{0,32})$/u, (m, q) => m.replace(`#${q}`, `#${tag}`)) + ' ';
    setMessage(next);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [message]);

  const hasMessages = messages.length > 0 || isTyping || isLoadingHistoryChat;
  const promptCards = React.useMemo(() => {
    const prompts = (aiPromptsData?.items ?? []).filter((item) => item.group === 'prompts');
    if (!prompts.length) return CARDS;
    return prompts.map((item) => ({
      id: item.id,
      title: item.text,
      subtitle: item.description,
    }));
  }, [aiPromptsData]);
  const showPromptSkeleton = tab === 'prompts' && (isPromptsUninitialized || isPromptsLoading || isPromptsFetching);

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#fff', height: 'calc(100vh - 105px)', display: 'flex', overflow: 'hidden', mr: contentRightOffset, transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Tabs */}
        <Box sx={{ flexShrink: 0, px: { xs: 2, md: 4 }, pt: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTabWithUrl(v)}
            sx={{
              minHeight: 34,
              '& .MuiTabs-indicator': { bgcolor: '#4C4EFF', height: 3, borderRadius: 2 },
            }}
          >
            {TABS.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                label={t.label}
                sx={{
                  minHeight: 34,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  px: 2,
                  borderRadius: 1,
                  alignItems: 'flex-start',
                  '&.Mui-selected': { color: '#4C4EFF' },
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Scrollable body */}
        <Box
          ref={messagesContainerRef}
          onScroll={(event) => {
            if (tab !== 'prompts' || !hasMessages) return;
            if (event.currentTarget.scrollTop > 48) return;
            loadOlderChatMessages();
          }}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            px: { xs: 2, md: 4 },
            pt: hasMessages ? 3 : 3,
            pb: tab === 'prompts' ? 2 : 4,
            display: 'flex',
            justifyContent: 'center',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.12) transparent',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: '10px' },
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 920 }}>

            {/* ── Prompts: initial suggestion state ── */}
            {tab === 'prompts' && !hasMessages && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box component="img" src="/logo/logo-single.svg" alt="Capme" sx={{ width: 70, height: 70 }} />
                </Box>

                <Stack spacing={2.5} sx={{ mb: 3 }}>
                  {showPromptSkeleton ? (
                    [0, 1, 2].map((item) => <PromptCardSkeleton key={item} />)
                  ) : (
                    promptCards.map((c) => (
                      <Box
                        key={c.id ?? c.title}
                        onClick={() => handleCardClick(c)}
                        sx={{
                          bgcolor: '#f7f7f8',
                          borderRadius: 4,
                          px: { xs: 2.5, md: 4 },
                          py: { xs: 2.5, md: 3 },
                          textAlign: 'center',
                          border: '1px solid rgba(0,0,0,0.06)',
                          cursor: 'pointer',
                          transition: 'transform 0.12s, box-shadow 0.12s, border-color 0.12s',
                          '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0px 10px 30px rgba(0,0,0,0.10)',
                          borderColor: '#4C4EFF',
                        },
                        }}
                      >
                        <Typography fontSize={16} fontWeight={750} color="#111827" sx={{ mb: 0.45 }}>{c.title}</Typography>
                        <Typography fontSize={12.5} color="text.secondary">{c.subtitle}</Typography>
                      </Box>
                    ))
                  )}
                </Stack>

                <Typography textAlign="center" fontSize={14} color="text.secondary" sx={{ mb: 2 }}>
                  These are just a few recommended examples of what we can do!
                </Typography>
              </>
            )}

            {/* ── Prompts: chat messages ── */}
            {tab === 'prompts' && hasMessages && (
              <Stack spacing={2.5}>
                {isLoadingHistoryChat ? (
                  <ChatMessageSkeleton />
                ) : (
                  <>
                    {isLoadingOlderChat && (
                      <Typography textAlign="center" fontSize={12} color="text.disabled">
                        Loading older messages...
                      </Typography>
                    )}

                    {messages.map((msg) => {
                      const isAnimating = msg.id === typewriterId;
                      const displayText = isAnimating ? typewriterText : msg.content;
                      return (
                        <Box
                          key={msg.id}
                          sx={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-end',
                            gap: 1.5,
                          }}
                        >
                          {msg.role === 'assistant' && (
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                mb: 0.5,
                              }}
                            >
                              <Box component="img" src="/logo/logo-single.svg" sx={{ width: 18, height: 18 }} />
                            </Box>
                          )}

                          <Box
                            sx={{
                              maxWidth: '72%',
                              px: 2,
                              py: 1.3,
                              bgcolor: msg.role === 'user' ? '#4C4EFF' : '#f7f7f8',
                              color: msg.role === 'user' ? '#fff' : 'text.primary',
                              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              border: msg.role === 'assistant' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                              fontSize: 14,
                              lineHeight: 1.65,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {msg.role === 'assistant' ? (
                              <Box
                                dangerouslySetInnerHTML={{ __html: sanitizeAssistantHtml(displayText) }}
                                sx={assistantHtmlSx}
                              />
                            ) : (
                              displayText
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </>
                )}

                {isTyping && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </Stack>
            )}

            {tab === 'interests' && <Box sx={{ pt: 3, pb: 6 }}><InterestsTab /></Box>}
            {tab === 'summary' && <Box sx={{ pt: 3, pb: 6 }}><SummaryTab /></Box>}

          </Box>
        </Box>

        {/* Bottom input */}
        {tab === 'prompts' && (
          <Box sx={{ flexShrink: 0, px: { xs: 2, md: 4 }, pb: 2, pt: 1, bgcolor: '#fff' }}>
            <Box
              sx={{
                width: '100%',
                maxWidth: 980,
                mx: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: 2.5,
                px: 1.25,
                py: 0.75,
                position: 'relative',
              }}
            >
              <InputBase
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type here..."
                inputRef={inputRef}
                multiline
                maxRows={4}
                sx={{ fontSize: 14, flex: 1 }}
              />
              <Box sx={{ position: 'absolute', left: 12, right: 12, bottom: 52 }}>
                <HashtagSuggestions value={message} hashtags={HASHTAGS} onPick={handlePickHashtag} />
              </Box>
              <IconButton
                size="small"
                onClick={handleSend}
                disabled={!message.trim() || isTyping || !!typewriterId}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  bgcolor: '#4C4EFF',
                  color: '#fff',
                  '&:hover': { bgcolor: '#3b3bd6' },
                  '&.Mui-disabled': { bgcolor: '#c5c6ff', color: '#fff' },
                }}
              >
                <Iconify icon="mingcute:send-line" width={18} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      <ChatHistoryDrawer
        open={chatHistoryDrawerOpen}
        onClose={handleCloseChatHistory}
        onChatSelect={handleHistoryChatSelect}
        onNewChat={handleNewChat}
        onHistoryCleared={handleNewChat}
      />
    </Box>
  );
}
