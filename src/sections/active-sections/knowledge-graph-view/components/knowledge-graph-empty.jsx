import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';
import { paths } from 'src/routes/paths';

const FLOAT_NODES = [
  { size: 10, top: '14%', left: '10%',  color: '#6366f1', delay: '0s',    dur: '3.2s' },
  { size: 7,  top: '20%', right: '12%', color: '#818cf8', delay: '0.6s',  dur: '2.8s' },
  { size: 12, top: '70%', left: '8%',   color: '#4C4EFF', delay: '1.1s',  dur: '3.6s' },
  { size: 6,  top: '75%', right: '10%', color: '#a78bfa', delay: '0.3s',  dur: '2.5s' },
  { size: 9,  top: '42%', left: '5%',   color: '#6366f1', delay: '1.5s',  dur: '3s'   },
  { size: 8,  top: '55%', right: '6%',  color: '#818cf8', delay: '0.8s',  dur: '3.4s' },
  { size: 6,  top: '30%', left: '22%',  color: '#c4b5fd', delay: '2s',    dur: '2.6s' },
  { size: 7,  top: '85%', left: '40%',  color: '#4C4EFF', delay: '0.4s',  dur: '3.1s' },
];

const STEPS = [
  { icon: 'solar:chat-round-dots-bold', color: '#6366f1', bg: 'rgba(99,102,241,0.10)' },
  { icon: 'solar:graph-bold',           color: '#4C4EFF', bg: 'rgba(76,78,255,0.10)'  },
  { icon: 'solar:tag-bold',             color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
];

export default function KnowledgeGraphEmpty() {
  const { t } = useTranslate('common');
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        background: 'linear-gradient(160deg, #f8f8ff 0%, #eef0ff 50%, #f5f3ff 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Soft radial glow behind center */}
      <Box
        sx={{
          position: 'absolute',
          width: 480,
          height: 480,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(76,78,255,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Dot grid */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(76,78,255,0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }}
      />

      {/* Floating node dots */}
      {FLOAT_NODES.map((d, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            bgcolor: d.color,
            opacity: 0.35,
            top: d.top,
            left: d.left,
            right: d.right,
            boxShadow: `0 0 ${d.size * 2}px ${d.color}`,
            animation: `emptyFloat ${d.dur} ${d.delay} ease-in-out infinite alternate`,
            '@keyframes emptyFloat': {
              from: { transform: 'translateY(0px)' },
              to:   { transform: 'translateY(-10px)' },
            },
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Center card */}
      <Stack
        alignItems="center"
        sx={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 360,
          px: 4,
          py: 5,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.60) 0%, rgba(238,240,255,0.45) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.70)',
          borderBottom: '1px solid rgba(76,78,255,0.12)',
          borderRight: '1px solid rgba(76,78,255,0.08)',
          borderRadius: 5,
          boxShadow: '0 8px 32px rgba(76,78,255,0.10), inset 0 1px 0 rgba(255,255,255,0.90)',
          textAlign: 'center',
          // top highlight shimmer
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '15%',
            right: '15%',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)',
            borderRadius: '0 0 4px 4px',
          },
        }}
      >
        {/* Graph icon with pulsing ring */}
        <Box
          sx={{
            position: 'relative',
            width: 88,
            height: 88,
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
              border: '2px dashed rgba(76,78,255,0.25)',
              animation: 'emptyRingSpin 12s linear infinite',
              '@keyframes emptyRingSpin': {
                from: { transform: 'rotate(0deg)' },
                to:   { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(76,78,255,0.12) 0%, rgba(139,92,246,0.12) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px solid rgba(76,78,255,0.18)',
            }}
          >
            <Iconify icon="solar:graph-bold" width={30} sx={{ color: '#4C4EFF' }} />
          </Box>
        </Box>

        {/* Headline */}
        <Typography
          sx={{
            fontSize: 20,
            fontWeight: 900,
            lineHeight: 1.25,
            mb: 1,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #4C4EFF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('knowledge_graph.empty_title')}
        </Typography>

        <Typography
          sx={{ color: 'text.secondary', fontSize: 13.5, lineHeight: 1.65, mb: 3 }}
        >
          {t('knowledge_graph.empty_subtitle')}
        </Typography>

        {/* Step icons */}
        <Stack direction="row" spacing={1.25} sx={{ mb: 3 }}>
          {STEPS.map((s, i) => (
            <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: s.bg,
                  border: `1.5px solid ${s.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Iconify icon={s.icon} width={18} sx={{ color: s.color }} />
              </Box>
            </Box>
          ))}
        </Stack>

        {/* CTA */}
        <Button
          variant="contained"
          onClick={() => navigate(paths.dashboard.root)}
          startIcon={<Iconify icon="solar:chat-round-dots-bold" width={16} />}
          sx={{
            background: 'linear-gradient(135deg, #4C4EFF 0%, #7B5EA7 100%)',
            color: '#fff',
            borderRadius: 2.5,
            px: 3.5,
            py: 1.2,
            fontWeight: 700,
            fontSize: 13.5,
            boxShadow: '0 8px 24px rgba(76,78,255,0.30)',
            textTransform: 'none',
            transition: 'all 0.2s',
            '&:hover': {
              background: 'linear-gradient(135deg, #3739b7 0%, #5f4690 100%)',
              boxShadow: '0 12px 32px rgba(76,78,255,0.40)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          {t('knowledge_graph.empty_cta')}
        </Button>
      </Stack>
    </Box>
  );
}
