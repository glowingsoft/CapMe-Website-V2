import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function KnowledgeGraphView() {
    const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
    const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);

    useEffect(() => {
        const onAccountChange = (e) => setAccountDrawerOpen(e.detail);
        const onProfileChange = (e) => setProfileDrawerOpen(e.detail);
        window.addEventListener('accountDrawerChange', onAccountChange);
        window.addEventListener('profileDrawerChange', onProfileChange);
        return () => {
            window.removeEventListener('accountDrawerChange', onAccountChange);
            window.removeEventListener('profileDrawerChange', onProfileChange);
        };
    }, []);

    const anyRightDrawerOpen = accountDrawerOpen || profileDrawerOpen;

    return (
        <Box sx={{ minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mr: anyRightDrawerOpen ? { md: '90px' } : 0, transition: 'margin-right 0.3s cubic-bezier(.4,0,.2,1)' }}>
            <Typography variant="h3" color="text.secondary" sx={{ mb: 2 }}>
                Knowledge Graph
            </Typography>
            <Typography variant="h5" color="text.disabled">
                Coming Soon
            </Typography>
        </Box>
    );
}
