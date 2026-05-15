import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';

function getDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export default function LinkPreview({ meta, onDismiss }) {
  const imageUrl = typeof meta?.image === 'string' ? meta.image.trim() : '';
  const hasImageUrl = imageUrl && !['null', 'undefined'].includes(imageUrl.toLowerCase());
  const [showImage, setShowImage] = useState(Boolean(hasImageUrl));

  useEffect(() => {
    setShowImage(Boolean(hasImageUrl));
  }, [hasImageUrl, imageUrl]);

  if (!meta || !Object.values(meta).some(Boolean)) return null;

  const { title, description, url } = meta;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 1.5,
        mb: 0.5,
        bgcolor: '#f0f1ff',
        border: '1px solid #d0d2ff',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left accent bar */}
      <Box sx={{ width: 3, bgcolor: '#4C4EFF', flexShrink: 0 }} />

      {/* Thumbnail */}
      {showImage && (
        <Box
          component="img"
          src={imageUrl}
          alt={title || 'Link preview'}
          onError={() => setShowImage(false)}
          sx={{
            width: 72,
            height: 72,
            objectFit: 'cover',
            flexShrink: 0,
            alignSelf: 'center',
            borderRadius: 1,
            my: 1,
          }}
        />
      )}

      {/* Text */}
      <Box sx={{ flex: 1, minWidth: 0, py: 1.2, pr: 4 }}>
        {title && (
          <Typography
            fontSize={13}
            fontWeight={700}
            color="#1a1a2e"
            noWrap
            sx={{ mb: 0.3 }}
          >
            {title}
          </Typography>
        )}
        {description && (
          <Typography
            fontSize={12}
            color="#555"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              mb: 0.4,
            }}
          >
            {description}
          </Typography>
        )}
        {url && (
          <Typography
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            fontSize={11}
            noWrap
            sx={{ color: '#555', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {getDomain(url)}
          </Typography>
        )}
      </Box>

      {/* Dismiss */}
      <IconButton
        size="small"
        onClick={onDismiss}
        sx={{ position: 'absolute', top: 4, right: 4, p: 0.3, color: '#9e9e9e' }}
      >
        <Iconify icon="mingcute:close-line" width={14} />
      </IconButton>
    </Box>
  );
}
