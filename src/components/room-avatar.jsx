import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

export default function RoomAvatar({ image, name, size = 38, bgcolor = '#4C4EFF', color = '#fff' }) {
  const validSrc = typeof image === 'string' && image.startsWith('http') ? image : null;
  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <Avatar sx={{ width: size, height: size, bgcolor, color, fontSize: size * 0.42, fontWeight: 700 }}>
        {name?.charAt(0).toUpperCase()}
      </Avatar>
      {validSrc && (
        <Box
          component="img"
          src={validSrc}
          alt={name}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
        />
      )}
    </Box>
  );
}
