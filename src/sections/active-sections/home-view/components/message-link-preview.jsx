import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useGetUrlMetaMutation } from 'src/store/Reducer/rooms-api';

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/;

// Module-level cache — same URL is never fetched twice across all components
const urlMetaCache = {};

/**
 * MessageLinkPreview
 * Renders a link-meta preview block (image + title + URL).
 * Props:
 *   meta    — { url, image, title }
 *   compact — true for drawer (comments), false/omit for full-width post card
 */
export default function MessageLinkPreview({ meta, compact = false }) {
  const imageUrl = typeof meta?.image === 'string' ? meta.image.trim() : '';
  const hasImageUrl = imageUrl && !['null', 'undefined'].includes(imageUrl.toLowerCase());
  const [showImage, setShowImage] = useState(Boolean(hasImageUrl));

  useEffect(() => {
    setShowImage(Boolean(hasImageUrl));
  }, [hasImageUrl, imageUrl]);

  if (!meta?.url) return null;

  return (
    <Box
      component="a"
      href={meta.url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        mt: compact ? 1 : 0,
        borderRadius: compact ? 2 : 0,
        overflow: 'hidden',
        border: compact ? '1px solid #e8e8e8' : 'none',
      }}
    >
      {showImage && (
        <Box
          component="img"
          src={imageUrl}
          alt={meta.title || 'Link preview'}
          loading="lazy"
          onError={() => setShowImage(false)}
          sx={{ width: '100%', maxHeight: compact ? 180 : 360, objectFit: 'cover', display: 'block' }}
        />
      )}
      <Box sx={{ px: compact ? 1.5 : 2.5, pt: compact ? 0.8 : 1, pb: compact ? 1 : 0.5 }}>
        {meta.title && (
          <Typography fontSize={compact ? 12 : 13} fontWeight={700} color="#1a1a2e" sx={{ mb: 0.3 }}>
            {meta.title}
          </Typography>
        )}
        {meta.description && (
          <Typography
            fontSize={compact ? 11 : 12}
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: compact ? 2 : 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.45,
              mb: 0.3,
            }}
          >
            {meta.description}
          </Typography>
        )}
        <Typography fontSize={compact ? 11 : 12} color="#4C4EFF">
          {meta.url}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * AutoLinkPreview
 * Uses stored meta if present; otherwise detects a URL in `text` and
 * lazy-fetches the preview once (cached globally).
 * Props:
 *   text    — raw message/comment content
 *   meta    — { url, image, title } stored with the message
 *   compact — passed through to MessageLinkPreview
 */
/**
 * noAutoFetch — when true, only renders stored meta from DB; never calls the meta API.
 *               Use this for feed views where meta is already persisted on the message.
 */
export function AutoLinkPreview({ text, meta, compact = false, noAutoFetch = false }) {
  const [fetchedMeta, setFetchedMeta] = useState(null);
  const [fetchUrlMeta] = useGetUrlMetaMutation();

  const textUrl = (text || '').match(URL_REGEX)?.[0] ?? null;
  const storedMeta = meta?.url ? meta : null;

  useEffect(() => {
    if (storedMeta || noAutoFetch) return;
    const url = textUrl;
    if (!url) return;
    if (urlMetaCache[url]) { setFetchedMeta(urlMetaCache[url]); return; }
    fetchUrlMeta(url).unwrap()
      .then((result) => { if (result?.url) { urlMetaCache[url] = result; setFetchedMeta(result); } })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textUrl, noAutoFetch]);

  const displayMeta = storedMeta
    ? { ...storedMeta, url: textUrl ?? storedMeta.url }
    : fetchedMeta;
  return <MessageLinkPreview meta={displayMeta} compact={compact} />;
}
