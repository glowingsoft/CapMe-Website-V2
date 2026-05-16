import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';

const DATE_OPTIONS = [
  { value: 'today', labelKey: 'explore_filter.today' },
  { value: 'thisWeek', labelKey: 'explore_filter.this_week' },
  { value: 'thisMonth', labelKey: 'explore_filter.this_month' },
  { value: 'thisYear', labelKey: 'explore_filter.this_year' },
];

const MEMBER_OPTIONS = [
  { value: 'small', labelKey: 'explore_filter.small' },
  { value: 'medium', labelKey: 'explore_filter.medium' },
  { value: 'large', labelKey: 'explore_filter.large' },
];

const CONTENT_OPTIONS = [
  { value: 'image', labelKey: 'explore_filter.image' },
  { value: 'video', labelKey: 'explore_filter.video' },
  { value: 'audio', labelKey: 'explore_filter.audio' },
  { value: 'file', labelKey: 'explore_filter.file' },
];

function FilterChipGroup({ label, options, value, onChange }) {
  const { t } = useTranslate('common');
  return (
    <Box sx={{ mb: 3 }}>
      <Typography fontSize={13} fontWeight={600} color="text.primary" sx={{ mb: 1.5 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Chip
              key={opt.value}
              label={t(opt.labelKey)}
              onClick={() => onChange(selected ? null : opt.value)}
              sx={{
                borderRadius: '20px',
                fontWeight: 500,
                fontSize: 13,
                height: 34,
                cursor: 'pointer',
                bgcolor: selected ? '#4C4EFF' : 'transparent',
                color: selected ? '#fff' : 'text.primary',
                border: `1.5px solid ${selected ? '#4C4EFF' : 'rgba(0,0,0,0.15)'}`,
                '&:hover': {
                  bgcolor: selected ? '#3739b7' : 'rgba(76,78,255,0.06)',
                },
                '& .MuiChip-label': { px: 1.5 },
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default function ExploreFilter({ filters, onChange, onClearAll, showHeader = true }) {
  const { t } = useTranslate('common');
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {showHeader && (
        <>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 2,
              flexShrink: 0,
            }}
          >
            <Typography fontSize={16} fontWeight={700} color="text.primary">
              {t('explore_filter.title')}
            </Typography>
            <Button
              size="small"
              onClick={onClearAll}
              sx={{
                fontSize: 13,
                color: '#4C4EFF',
                p: 0,
                minWidth: 0,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              {t('explore_filter.clear_all')}
            </Button>
          </Box>

          <Divider />
        </>
      )}

      {/* Filter groups */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, pt: 2.5 }}>
        {!showHeader && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button
              size="small"
              onClick={onClearAll}
              sx={{
                fontSize: 13,
                color: '#4C4EFF',
                p: 0,
                minWidth: 0,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
              }}
            >
              {t('explore_filter.clear_all')}
            </Button>
          </Box>
        )}

        {/* Search */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.25,
            py: 0.9,
            mb: 2.5,
            borderRadius: 2,
            border: '1px solid rgba(0,0,0,0.12)',
            bgcolor: '#fff',
          }}
        >
          <Iconify icon="solar:magnifer-linear" width={18} style={{ color: '#9e9e9e', flexShrink: 0 }} />
          <InputBase
            value={filters.query ?? ''}
            onChange={(e) => onChange('query', e.target.value)}
            placeholder={t('explore_filter.search_placeholder')}
            sx={{ fontSize: 14, flex: 1 }}
          />
          {!!filters.query && (
            <IconButton
              size="small"
              onClick={() => onChange('query', '')}
              sx={{ p: 0.5, color: '#9e9e9e' }}
              aria-label="Clear search"
            >
              <Iconify icon="mingcute:close-line" width={16} />
            </IconButton>
          )}
        </Box>

        <FilterChipGroup
          label={t('explore_filter.date_created')}
          options={DATE_OPTIONS}
          value={filters.date}
          onChange={(val) => onChange('date', val)}
        />

        <FilterChipGroup
          label={t('explore_filter.member_count')}
          options={MEMBER_OPTIONS}
          value={filters.memberCount}
          onChange={(val) => onChange('memberCount', val)}
        />

        <FilterChipGroup
          label={t('explore_filter.content_type')}
          options={CONTENT_OPTIONS}
          value={filters.contentType}
          onChange={(val) => onChange('contentType', val)}
        />
      </Box>
    </Box>
  );
}
