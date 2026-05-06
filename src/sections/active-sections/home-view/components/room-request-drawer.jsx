import { useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { MOCK_ROOM_MEMBERS, MOCK_ROOM_REQUESTS } from '../mock';

import DrawerHeader from './drawer-header';

export default function RoomRequestDrawer({
    open,
    onClose,
    room,
    requests: requestsProp,
    onApprove,
    onReject,
}) {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState(requestsProp || room?.requests || MOCK_ROOM_REQUESTS);
    const [members, setMembers] = useState(room?.members || MOCK_ROOM_MEMBERS);
    const [requestSearch, setRequestSearch] = useState('');
    const [memberSearch, setMemberSearch] = useState('');

    useEffect(() => {
        setRequests(requestsProp || room?.requests || MOCK_ROOM_REQUESTS);
    }, [requestsProp, room]);

    useEffect(() => {
        setMembers(room?.members || MOCK_ROOM_MEMBERS);
    }, [room]);

    useEffect(() => {
        if (!open) {
            setActiveTab('requests');
            setRequestSearch('');
            setMemberSearch('');
        }
    }, [open]);

    const handleApproveRequest = (request) => {
        setRequests((prev) => prev.filter((item) => item.id !== request.id));
        onApprove?.(request);
    };

    const handleRejectRequest = (request) => {
        setRequests((prev) => prev.filter((item) => item.id !== request.id));
        onReject?.(request);
    };

    const handleSetMemberRole = (memberId, role) => {
        setMembers((prev) => prev.map((member) => (
            member.id === memberId ? { ...member, role } : member
        )));
    };

    const requestsCount = requests.length;
    const membersCount = members.length;

    const normalizedRequestSearch = requestSearch.trim().toLowerCase();
    const normalizedMemberSearch = memberSearch.trim().toLowerCase();

    const filteredRequests = requests.filter((request) => (
        request.name.toLowerCase().includes(normalizedRequestSearch)
        || request.requestedAt.toLowerCase().includes(normalizedRequestSearch)
    ));

    const filteredMembers = members.filter((member) => (
        member.name.toLowerCase().includes(normalizedMemberSearch)
        || member.role.toLowerCase().includes(normalizedMemberSearch)
    ));

    return (
        <Drawer
            open={open}
            onClose={onClose}
            anchor="right"
            hideBackdrop
            disableEnforceFocus
            disableAutoFocus
            disableScrollLock
            ModalProps={{ sx: { pointerEvents: 'none' } }}
            PaperProps={{
                sx: {
                    width: 420,
                    maxWidth: '100%',
                    borderTopLeftRadius: 20,
                    overflow: 'hidden',
                    bgcolor: '#fff',
                    mt: '105px',
                    height: 'calc(100vh - 105px)',
                    pointerEvents: 'auto',
                },
            }}
        >
            <DrawerHeader
                title="Room Requests"
                onBack={onClose}
                showEdit={false}
                showShare={false}
            />

            <Scrollbar>
                <Box sx={{ px: 2, py: 2 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Button
                            onClick={() => setActiveTab('requests')}
                            sx={{
                                minWidth: 0,
                                px: 2,
                                height: 40,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: 14,
                                fontWeight: 700,
                                color: activeTab === 'requests' ? '#fff' : '#6B7280',
                                bgcolor: activeTab === 'requests' ? '#050511' : '#F3F4F6',
                                '&:hover': {
                                    bgcolor: activeTab === 'requests' ? '#050511' : '#E5E7EB',
                                },
                            }}
                        >
                            Requests ({requestsCount})
                        </Button>

                        <Button
                            onClick={() => setActiveTab('members')}
                            sx={{
                                minWidth: 0,
                                px: 2,
                                height: 40,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: 14,
                                fontWeight: 700,
                                color: activeTab === 'members' ? '#fff' : '#6B7280',
                                bgcolor: activeTab === 'members' ? '#050511' : '#F3F4F6',
                                '&:hover': {
                                    bgcolor: activeTab === 'members' ? '#050511' : '#E5E7EB',
                                },
                            }}
                        >
                            Members ({membersCount})
                        </Button>
                    </Stack>

                    {activeTab === 'requests' && (
                        <>
                            <Box
                                sx={{
                                    height: 48,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.5,
                                    mb: 1.5,
                                    borderRadius: 3,
                                    bgcolor: '#F3F4F6',
                                }}
                            >
                                <Iconify icon="eva:search-fill" width={20} sx={{ color: '#6B7280' }} />
                                <InputBase
                                    fullWidth
                                    placeholder="Search requests..."
                                    value={requestSearch}
                                    onChange={(e) => setRequestSearch(e.target.value)}
                                    sx={{ fontSize: 14, color: '#111827' }}
                                />
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Pending approvals for {room?.name || 'this room'}
                            </Typography>

                            <Stack spacing={1.5}>
                                {filteredRequests.length === 0 && (
                                    <Box
                                        sx={{
                                            borderRadius: 2,
                                            border: '1px dashed #d8d8d8',
                                            py: 4,
                                            px: 2,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                                            {requestSearch ? 'No matching requests' : 'No pending requests'}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            {requestSearch ? 'Try another search term.' : 'New join requests will appear here.'}
                                        </Typography>
                                    </Box>
                                )}

                                {filteredRequests.map((request) => (
                                    <Box
                                        key={request.id}
                                        sx={{
                                            bgcolor: '#fff',
                                            borderRadius: 2,
                                            px: 1.5,
                                            py: 1.5,
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
                                            <Avatar src={request.avatar} sx={{ width: 44, height: 44 }} />

                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography fontSize={15} fontWeight={700} noWrap>
                                                    {request.name}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary">
                                                    Requested {request.requestedAt}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                fullWidth
                                                onClick={() => handleRejectRequest(request)}
                                                sx={{
                                                    height: 38,
                                                    borderRadius: 2,
                                                    bgcolor: '#F3F4F6',
                                                    color: '#111827',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    '&:hover': { bgcolor: '#E5E7EB' },
                                                }}
                                            >
                                                Reject
                                            </Button>

                                            <Button
                                                fullWidth
                                                onClick={() => handleApproveRequest(request)}
                                                sx={{
                                                    height: 38,
                                                    borderRadius: 2,
                                                    bgcolor: '#4C4EFF',
                                                    color: '#fff',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    '&:hover': { bgcolor: '#3f41dc' },
                                                }}
                                            >
                                                Approve
                                            </Button>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </>
                    )}

                    {activeTab === 'members' && (
                        <Stack spacing={1.5}>
                            <Box
                                sx={{
                                    height: 48,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1.5,
                                    borderRadius: 3,
                                    bgcolor: '#F3F4F6',
                                }}
                            >
                                <Iconify icon="eva:search-fill" width={20} sx={{ color: '#6B7280' }} />
                                <InputBase
                                    fullWidth
                                    placeholder="Search members..."
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    sx={{ fontSize: 14, color: '#111827' }}
                                />
                            </Box>

                            {filteredMembers.length === 0 && (
                                <Box
                                    sx={{
                                        borderRadius: 2,
                                        border: '1px dashed #d8d8d8',
                                        py: 4,
                                        px: 2,
                                        textAlign: 'center',
                                    }}
                                >
                                    <Typography fontWeight={700} sx={{ mb: 0.5 }}>
                                        {memberSearch ? 'No matching members' : 'No members found'}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {memberSearch ? 'Try another search term.' : 'Members will appear here once they join.'}
                                    </Typography>
                                </Box>
                            )}

                            {filteredMembers.map((member) => {
                                const isEditor = member.role === 'editor';
                                const isViewer = member.role === 'viewer';

                                return (
                                    <Box
                                        key={member.id}
                                        sx={{
                                            bgcolor: '#fff',
                                            borderRadius: 2,
                                            px: 1.5,
                                            py: 1.5,
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                        }}
                                    >
                                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
                                            <Avatar src={member.avatar} sx={{ width: 44, height: 44 }} />

                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography fontSize={15} fontWeight={700} noWrap>
                                                    {member.name}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                    Current access: {member.role}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                fullWidth
                                                onClick={() => handleSetMemberRole(member.id, 'editor')}
                                                startIcon={isEditor ? <Iconify icon="mingcute:check-fill" width={16} /> : null}
                                                sx={{
                                                    height: 38,
                                                    borderRadius: 2,
                                                    bgcolor: isEditor ? '#4C4EFF' : '#F3F4F6',
                                                    color: isEditor ? '#fff' : '#111827',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        bgcolor: isEditor ? '#3f41dc' : '#E5E7EB',
                                                    },
                                                }}
                                            >
                                                Editor
                                            </Button>

                                            <Button
                                                fullWidth
                                                onClick={() => handleSetMemberRole(member.id, 'viewer')}
                                                startIcon={isViewer ? <Iconify icon="mingcute:check-fill" width={16} /> : null}
                                                sx={{
                                                    height: 38,
                                                    borderRadius: 2,
                                                    bgcolor: isViewer ? '#4C4EFF' : '#F3F4F6',
                                                    color: isViewer ? '#fff' : '#111827',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    '&:hover': {
                                                        bgcolor: isViewer ? '#3f41dc' : '#E5E7EB',
                                                    },
                                                }}
                                            >
                                                Viewer
                                            </Button>
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Scrollbar>
        </Drawer>
    );
}
