import React, { useState } from 'react';
import { Box, Typography, Chip, Stack, Tooltip, Collapse } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';

const getFullMessageContent = (messageNode) => {
  if (!messageNode) return '';
  const content = messageNode.data?.content?.trim();
  if (content) return content;
  const caption = messageNode.data?.caption?.trim();
  if (caption) return caption;
  return messageNode.name || '';
};

const importanceColor = (level) => {
  if (level === 'high') return { bg: 'rgba(239,68,68,0.08)', color: '#ef4444' };
  if (level === 'medium') return { bg: 'rgba(245,158,11,0.08)', color: '#f59e0b' };
  return { bg: 'rgba(0,0,0,0.05)', color: 'text.secondary' };
};

const MessageItem = React.memo(({ msg, topics, onNodeClick }) => {
  const { t } = useTranslate('common');
  const [open, setOpen] = useState(false);
  const fullMessageContent = getFullMessageContent(msg);
  const hasExtras = fullMessageContent.length > 0 || topics.length > 0;
  const imp = msg.data?.importance;

  return (
    <Box
      sx={{
        mb: 0.75,
        borderRadius: 2,
        bgcolor: open ? 'rgba(76,78,255,0.03)' : '#fafafa',
        border: '1px solid',
        borderColor: open ? 'rgba(76,78,255,0.15)' : 'rgba(0,0,0,0.07)',
        overflow: 'hidden',
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 1.5, py: 0.875, cursor: hasExtras ? 'pointer' : 'default' }}
        onClick={() => hasExtras && setOpen((v) => !v)}
      >
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '7px',
            bgcolor: 'rgba(76,78,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Iconify icon="solar:chat-round-dots-bold" width={14} sx={{ color: '#4C4EFF' }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <Tooltip
            title={fullMessageContent}
            arrow
            placement="top"
            enterDelay={300}
            disableHoverListener={!fullMessageContent}
            slotProps={{
              tooltip: { sx: { maxWidth: 480, fontSize: '0.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' } },
            }}
          >
            <Typography
              sx={{
                fontSize: '0.82rem',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'help',
              }}
            >
              {msg.name}
            </Typography>
          </Tooltip>
        </Box>

        {imp && (
          <Chip
            label={imp}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.6rem',
              flexShrink: 0,
              bgcolor: importanceColor(imp).bg,
              color: importanceColor(imp).color,
              fontWeight: 700,
              '&:hover': { bgcolor: importanceColor(imp).bg },
            }}
          />
        )}

        {topics.length > 0 && !open && (
          <Stack direction="row" alignItems="center" spacing={0.3} sx={{ flexShrink: 0, bgcolor: 'rgba(76,78,255,0.07)', borderRadius: 1, px: 0.75, py: 0.3 }}>
            <Iconify icon="solar:tag-bold" width={11} sx={{ color: '#4C4EFF' }} />
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#4C4EFF', lineHeight: 1 }}>
              {topics.length}
            </Typography>
          </Stack>
        )}

        {hasExtras && (
          <Iconify
            icon={open ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
            width={14}
            sx={{ color: 'text.disabled', flexShrink: 0 }}
          />
        )}
      </Stack>

      {hasExtras && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box sx={{ px: 1.5, pb: 1.25, pt: 0.75, borderTop: '1px solid rgba(0,0,0,0.06)' }}>

            {/* Full message text */}
            {fullMessageContent && (
              <Box sx={{ mb: topics.length > 0 ? 1.25 : 0 }}>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', display: 'block', mb: 0.5, color: '#64748b', fontWeight: 600 }}>
                  {t('knowledge_graph.msg_full_message')}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', lineHeight: 1.6, color: '#1e293b', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {fullMessageContent}
                </Typography>
              </Box>
            )}

            {/* Topics */}
            {topics.length > 0 && (
              <>
                <Typography variant="caption" sx={{ fontSize: '0.68rem', display: 'block', mb: 0.6, color: '#64748b', fontWeight: 600 }}>
                  {t('knowledge_graph.msg_topics')}
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {topics.map((t) => (
                    <Chip
                      key={t.id}
                      icon={<Iconify icon="solar:tag-bold" width={11} sx={{ color: '#4C4EFF' }} />}
                      label={t.name}
                      size="small"
                      onClick={(e) => { e.stopPropagation(); onNodeClick(t); }}
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        bgcolor: 'rgba(76,78,255,0.07)',
                        color: '#4C4EFF',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(76,78,255,0.07)' },
                      }}
                    />
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
});

export default MessageItem;
