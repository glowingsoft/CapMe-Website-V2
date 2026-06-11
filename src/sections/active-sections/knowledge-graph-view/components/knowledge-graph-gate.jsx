import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { paths } from 'src/routes/paths';

const GLOWS = [
  { size: 180, top: '8%',   left: '5%',   color: 'rgba(76,78,255,0.18)' },
  { size: 120, top: '60%',  left: '2%',   color: 'rgba(123,94,167,0.14)' },
  { size: 200, top: '15%',  right: '4%',  color: 'rgba(99,102,241,0.15)' },
  { size: 100, top: '70%',  right: '8%',  color: 'rgba(76,78,255,0.12)' },
  { size: 140, bottom: '5%', left: '30%', color: 'rgba(139,92,246,0.13)' },
];

const NODE_DOTS = [
  { size: 8,  top: '18%', left: '12%',  opacity: 0.45, color: '#6366f1' },
  { size: 5,  top: '32%', left: '20%',  opacity: 0.3,  color: '#818cf8' },
  { size: 10, top: '22%', right: '14%', opacity: 0.4,  color: '#4C4EFF' },
  { size: 6,  top: '72%', left: '15%',  opacity: 0.35, color: '#a78bfa' },
  { size: 7,  top: '65%', right: '12%', opacity: 0.4,  color: '#6366f1' },
  { size: 5,  top: '80%', right: '25%', opacity: 0.3,  color: '#818cf8' },
  { size: 8,  top: '15%', left: '45%',  opacity: 0.35, color: '#4C4EFF' },
];

export default function KnowledgeGraphGate() {
  const { t } = useTranslate('common');
  const navigate = useNavigate();

  const features = [
    { icon: 'solar:graph-bold',     label: t('knowledge_graph.feature_graph') },
    { icon: 'solar:buildings-bold', label: t('knowledge_graph.feature_rooms') },
    { icon: 'solar:tag-bold',       label: t('knowledge_graph.feature_topics') },
  ];

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        background: 'linear-gradient(145deg, #0d0d1a 0%, #1a1040 45%, #0d0d1a 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Blurred glow orbs */}
      {GLOWS.map((d, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: d.color,
            filter: 'blur(48px)',
            top: d.top,
            left: d.left,
            right: d.right,
            bottom: d.bottom,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Dot grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      {/* Scattered node dots */}
      {NODE_DOTS.map((d, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            bgcolor: d.color,
            opacity: d.opacity,
            top: d.top,
            left: d.left,
            right: d.right,
            boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Center frosted card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          maxWidth: 380,
          px: 4,
          py: 4.5,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
        }}
      >
        {/* Glowing crown */}
        <Box
          sx={{
            position: 'relative',
            width: 80,
            height: 80,
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(76,78,255,0.35) 0%, transparent 70%)',
              animation: 'graphGatePulse 2.4s ease-in-out infinite',
              '@keyframes graphGatePulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.8 },
                '50%':       { transform: 'scale(1.25)', opacity: 0.4 },
              },
            }}
          />
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(76,78,255,0.55)',
              zIndex: 1,
            }}
          >
            <Iconify icon="solar:crown-bold" width={28} sx={{ color: '#fff' }} />
          </Box>
        </Box>

        {/* Gradient headline */}
        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 900,
            lineHeight: 1.2,
            mb: 1.25,
            background: 'linear-gradient(135deg, #fff 30%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('knowledge_graph.subscribe_title')}
        </Typography>

        <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 13.5, lineHeight: 1.65, mb: 2.5 }}>
          {t('knowledge_graph.subscribe_subtitle')}
        </Typography>

        {/* Feature chips */}
        <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ mb: 3 }}>
          {features.map((f) => (
            <Box
              key={f.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.5,
                py: 0.6,
                borderRadius: 10,
                background: 'rgba(76,78,255,0.18)',
                border: '1px solid rgba(99,102,241,0.35)',
              }}
            >
              <Iconify icon={f.icon} width={13} sx={{ color: '#818cf8' }} />
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: '#a5b4fc' }}>{f.label}</Typography>
            </Box>
          ))}
        </Stack>

        {/* CTA */}
        <Button
          variant="contained"
          onClick={() => navigate(paths.dashboard.settings.subscription)}
          startIcon={<Iconify icon="solar:crown-bold" width={16} />}
          sx={{
            background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
            color: '#fff',
            borderRadius: 2.5,
            px: 3.5,
            py: 1.2,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: '0 8px 24px rgba(76,78,255,0.45)',
            textTransform: 'none',
            transition: 'all 0.2s',
            '&:hover': {
              background: 'linear-gradient(135deg, #3739b7 0%, #5f4690 100%)',
              boxShadow: '0 12px 32px rgba(76,78,255,0.55)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          {t('knowledge_graph.subscribe_cta')}
        </Button>
      </Box>
    </Box>
  );
}
