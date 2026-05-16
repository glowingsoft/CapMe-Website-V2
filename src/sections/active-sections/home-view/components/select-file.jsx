import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import { useTranslate } from 'src/locales';

const getOptions = (t) => [
  {
    id: 'photo_video',
    label: t('select_file.attach_photo_video'),
    icon: 'solar:gallery-add-bold',
    accept: 'image/*,video/*',
  },
  {
    id: 'audio',
    label: t('select_file.record_audio'),
    icon: 'solar:microphone-bold',
    accept: 'audio/*',
  },
  {
    id: 'file',
    label: t('select_file.upload_file'),
    icon: 'solar:folder-open-bold',
    accept: '*/*',
  },
];

export default function SelectFile({ anchorEl, onClose, onFileSelected, onAudioRecord }) {
  const { t } = useTranslate('common');
  const options = getOptions(t);

  const handleSelect = (option) => {
    onClose();

    if (option.id === 'audio') {
      onAudioRecord?.();
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = option.accept;
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) onFileSelected?.(file);
    };
    input.click();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        paper: {
          elevation: 4,
          sx: {
            borderRadius: 3,
            minWidth: 220,
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid #f0f0f0',
            overflow: 'hidden',
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem
          key={option.id}
          onClick={() => handleSelect(option)}
          sx={{
            gap: 1.5,
            py: 1.4,
            px: 2,
            fontSize: 14,
            fontWeight: 500,
            color: 'text.primary',
            '&:hover': { bgcolor: '#f5f6f8' },
          }}
        >
          <Iconify icon={option.icon} width={20} style={{ color: '#4C4EFF', flexShrink: 0 }} />
          {option.label}
        </MenuItem>
      ))}
    </Menu>
  );
}
