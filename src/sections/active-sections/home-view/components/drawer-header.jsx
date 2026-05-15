import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

const btnSx = {
    width: 36,
    height: 36,
    borderRadius: 1.5,
    bgcolor: 'rgba(255,255,255,0.14)',
    color: '#fff',
    flexShrink: 0,
    '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
};

export default function DrawerHeader({
    title,
    onBack,
    onEdit,
    onShare,
    onChangePassword,
    showEdit = true,
    showShare = true,
    backIcon = 'mingcute:left-line',
    editIcon = 'solar:pen-bold',
}) {
    return (
        <Box
            sx={{
                flexShrink: 0,
                bgcolor: '#050511',
                px: 2,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={onBack} sx={btnSx}>
                    <Iconify icon={backIcon} width={20} />
                </IconButton>

                <Typography
                    sx={{
                        color: '#fff',
                        fontSize: 18,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </Typography>
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ flexShrink: 0 }}>
                {onChangePassword && (
                    <IconButton onClick={onChangePassword} sx={btnSx}>
                        <Iconify icon="solar:lock-password-bold" width={20} />
                    </IconButton>
                )}

                {showEdit && (
                    <IconButton onClick={onEdit} sx={btnSx}>
                        <Iconify icon={editIcon} width={20} />
                    </IconButton>
                )}

                {showShare && (
                    <IconButton onClick={onShare} sx={btnSx}>
                        <Iconify icon="solar:share-bold" width={20} />
                    </IconButton>
                )}
            </Stack>
        </Box>
    );
}