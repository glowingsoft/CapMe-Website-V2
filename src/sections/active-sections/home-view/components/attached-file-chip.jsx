import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import ImagePreviewDialog, {
    AudioPreviewDialog,
    PdfPreviewDialog,
    VideoPreviewDialog,
} from './image-preview-dialog';

// ─── File-type icon mapping ───────────────────────────────────────────────────
function getFileIconConfig(type, name) {
    if (type?.startsWith('audio/')) return { icon: 'solar:music-note-bold', color: '#7c3aed' };

    const ext = name?.split('.').pop()?.toLowerCase();

    if (type === 'application/pdf' || ext === 'pdf')
        return { icon: 'solar:file-text-bold', color: '#e53935' };

    if (['doc', 'docx'].includes(ext))
        return { icon: 'solar:file-text-bold', color: '#1565c0' };

    if (['xls', 'xlsx', 'csv'].includes(ext))
        return { icon: 'solar:file-bold', color: '#2e7d32' };

    if (['ppt', 'pptx'].includes(ext))
        return { icon: 'solar:file-bold', color: '#e65100' };

    if (['zip', 'rar', '7z', 'gz', 'tar'].includes(ext))
        return { icon: 'solar:archive-bold', color: '#f57c00' };

    return { icon: 'solar:file-bold', color: '#9e9e9e' };
}

// Preview dialogs are imported from image-preview-dialog.jsx

// ─── 36×36 thumbnail ──────────────────────────────────────────────────────────
function Thumbnail({ file, onPreview }) {
    const { url, type, name } = file;

    const isImage = type?.startsWith('image/');
    const isVideo = type?.startsWith('video/');
    const { icon, color } = getFileIconConfig(type, name);

    if (isImage) {
        return (
            <Box
                component="img"
                src={url}
                alt={name || 'Attachment'}
                onClick={onPreview}
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    objectFit: 'cover',
                    border: '1px solid rgba(76,78,255,0.25)',
                    cursor: 'zoom-in',
                    flexShrink: 0,
                }}
            />
        );
    }

    if (isVideo) {
        return (
            <Box
                onClick={onPreview}
                sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '1px solid rgba(76,78,255,0.25)',
                    bgcolor: '#0b1020',
                    position: 'relative',
                    cursor: 'pointer',
                    flexShrink: 0,
                }}
            >
                <Box
                    component="video"
                    src={url}
                    muted
                    playsInline
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.22)',
                    }}
                >
                    <Iconify icon="solar:play-bold" width={14} style={{ color: '#fff' }} />
                </Box>
            </Box>
        );
    }

    // Audio, PDF, generic — coloured icon square
    return (
        <Box
            onClick={onPreview}
            sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: `${color}18`,
                border: `1px solid ${color}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                cursor: 'pointer',
            }}
        >
            <Iconify icon={icon} width={20} style={{ color }} />
        </Box>
    );
}

// ─── Public component ─────────────────────────────────────────────────────────
/**
 * AttachedFileChip
 * Shows a pre-send attachment row with a type-aware thumbnail/icon and a
 * click-to-preview dialog.  Manages its own preview state internally.
 *
 * Props:
 *   file     – { url, type, name, size }
 *   onRemove – called when the × button is clicked
 */
export default function AttachedFileChip({ file, onRemove }) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const { url, type, name } = file;

    const isImage = type?.startsWith('image/');
    const isVideo = type?.startsWith('video/');
    const isAudio = type?.startsWith('audio/');
    const isPdf = type === 'application/pdf' || name?.toLowerCase().endsWith('.pdf');

    const handlePreview = () => {
        if (isImage || isVideo || isAudio || isPdf) {
            setPreviewOpen(true);
        } else {
            // For generic files, open in a new tab for download / browser preview
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.8,
                    mb: 0.5,
                    bgcolor: '#f0f1ff',
                    border: '1px solid #d0d2ff',
                    borderRadius: 2,
                }}
            >
                <Thumbnail file={file} onPreview={handlePreview} />

                <Iconify icon="solar:paperclip-bold" width={16} style={{ color: '#4C4EFF', flexShrink: 0 }} />

                <Typography fontSize={13} fontWeight={500} color="#4C4EFF" noWrap sx={{ flex: 1 }}>
                    {name}
                </Typography>

                <IconButton size="small" onClick={onRemove} sx={{ p: 0.2, color: '#9e9e9e' }}>
                    <Iconify icon="mingcute:close-line" width={14} />
                </IconButton>
            </Box>

            {/* Preview dialogs — only one can be open at a time */}
            {isImage && (
                <ImagePreviewDialog
                    open={previewOpen}
                    src={url}
                    alt={name || 'Preview'}
                    onClose={() => setPreviewOpen(false)}
                />
            )}

            {isVideo && (
                <VideoPreviewDialog
                    open={previewOpen}
                    url={url}
                    name={name}
                    onClose={() => setPreviewOpen(false)}
                />
            )}

            {isAudio && (
                <AudioPreviewDialog
                    open={previewOpen}
                    url={url}
                    name={name}
                    onClose={() => setPreviewOpen(false)}
                />
            )}

            {isPdf && (
                <PdfPreviewDialog
                    open={previewOpen}
                    url={url}
                    name={name}
                    onClose={() => setPreviewOpen(false)}
                />
            )}
        </>
    );
}
