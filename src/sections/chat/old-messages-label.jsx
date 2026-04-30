import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function OldMessagesLabel({ label }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                my: 2,
                width: '100%',
            }}
        >
            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider', mx: 1, borderRadius: 2 }} />
            <Typography
                sx={{
                    px: 2.5,
                    py: 0.5,
                    borderRadius: 10,
                    bgcolor: '#fff',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: 14,
                    boxShadow: 1,
                    border: '1px solid #eee',
                }}
            >
                {label}
            </Typography>
            <Box sx={{ flex: 1, height: 1, bgcolor: 'divider', mx: 1, borderRadius: 2 }} />
        </Box>
    );
}
