import React, { useEffect, useState } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import InputBase from '@mui/material/InputBase';
import CircularProgress from '@mui/material/CircularProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import { toast } from 'src/components/snackbar';
import { useLazyGetRoomRequestsQuery, useUpdateRoomRequestPermissionMutation } from 'src/store/Reducer/rooms-api';

import DrawerHeader from './drawer-header';

function RequestSkeleton() {
    return (
        <Box sx={{ bgcolor: '#fff', borderRadius: 2, px: 1.5, py: 1.5, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="55%" height={16} />
                    <Skeleton variant="text" width="35%" height={13} />
                </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" height={38} sx={{ flex: 1, borderRadius: 2 }} />
                <Skeleton variant="rounded" height={38} sx={{ flex: 1, borderRadius: 2 }} />
            </Stack>
        </Box>
    );
}

const normalizePermission = (permission) => {
    const value = String(permission ?? '').toLowerCase();
    if (value === 'editor') return 'edit';
    if (value === 'viewer') return 'view';
    return value || 'view';
};

const permissionLabel = (permission) => {
    const value = normalizePermission(permission);
    if (value === 'edit') return 'Editor';
    if (value === 'view') return 'Viewer';
    return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function RoomRequestDrawer({
    open,
    onClose,
    roomId,
    isRoomAdmin = false,
    permissionOverrides = {},
    onMemberPermissionUpdate,
    onApprove,
    onReject,
}) {
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [members, setMembers] = useState([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [updatingAccess, setUpdatingAccess] = useState(null);
    const [updateRoomRequestPermission] = useUpdateRoomRequestPermissionMutation();
    const [fetchRoomRequests] = useLazyGetRoomRequestsQuery();
    const currentUser = useSelector(selectUser);
    const currentUserId = String(currentUser?.basicInfo?._id ?? currentUser?.id ?? currentUser?._id ?? currentUser?.userId ?? currentUser?.user?._id ?? '');

    const [requestSearch, setRequestSearch] = useState('');
    const [memberSearch, setMemberSearch] = useState('');

    // Fetch requests when drawer opens
    useEffect(() => {
        if (!open || !roomId) return;
        setIsLoadingRequests(true);
        fetchRoomRequests({ roomId, type: 'requests' })
            .unwrap()
            .then((data) => setRequests(data ?? []))
            .catch(() => setRequests([]))
            .finally(() => setIsLoadingRequests(false));
    }, [open, roomId, fetchRoomRequests]);

    // Fetch members when members tab is opened
    useEffect(() => {
        if (!open || !roomId || activeTab !== 'members' || !isRoomAdmin) return;
        fetchRoomRequests({ roomId, type: 'members' })
            .unwrap()
            .then((data) => {
                const normalized = (data ?? [])
                    .filter((m) => String(m.userId) !== currentUserId)
                    .map((m) => ({
                        ...m,
                        role: permissionOverrides[m.userId] ?? normalizePermission(m.role),
                    }));
                setMembers(normalized);
            })
            .catch(() => setMembers([]))
            .finally(() => setIsLoadingMembers(false));
    }, [open, roomId, activeTab, isRoomAdmin, fetchRoomRequests, currentUserId, permissionOverrides]);

    useEffect(() => {
        if (!open) {
            setActiveTab('requests');
            setRequestSearch('');
            setMemberSearch('');
        }
    }, [open]);

    const [processingIds, setProcessingIds] = useState(() => new Set());

    const handleApproveRequest = async (request) => {
        if (processingIds.has(request.id)) return;
        setProcessingIds((prev) => { const next = new Set(prev); next.add(request.id); return next; });
        try {
            await updateRoomRequestPermission({ roomId, userId: request.id, permission: 'view' }).unwrap();
            setRequests((prev) => prev.filter((item) => item.id !== request.id));
            onApprove?.(request);
            toast.success(`${request.name} approved`);
        } catch {
            toast.error('Failed to approve request');
        } finally {
            setProcessingIds((prev) => { const next = new Set(prev); next.delete(request.id); return next; });
        }
    };

    const handleRejectRequest = async (request) => {
        if (processingIds.has(request.id)) return;
        setProcessingIds((prev) => { const next = new Set(prev); next.add(request.id); return next; });
        try {
            await updateRoomRequestPermission({ roomId, userId: request.id, permission: 'decline' }).unwrap();
            setRequests((prev) => prev.filter((item) => item.id !== request.id));
            onReject?.(request);
            toast.success(`${request.name} rejected`);
        } catch {
            toast.error('Failed to reject request');
        } finally {
            setProcessingIds((prev) => { const next = new Set(prev); next.delete(request.id); return next; });
        }
    };

    const handleSetMemberRole = async (memberId, role) => {
        const permission = normalizePermission(role);
        const previousMembers = members;

        if (updatingAccess || !isRoomAdmin || !['view', 'edit'].includes(permission)) return;
        if (!roomId || !memberId) {
            toast.error(!roomId ? 'Missing room id' : 'Missing member id');
            return;
        }

        setUpdatingAccess(`${memberId}:${permission}`);
        setMembers((prev) => prev.map((member) => (
            member.id === memberId ? { ...member, role: permission } : member
        )));

        try {
            const response = await updateRoomRequestPermission({ roomId, userId: memberId, permission }).unwrap();
            const updatedPermission = normalizePermission(response?.body?.permission ?? response?.permission ?? permission);
            const updatedUserId = response?.body?.user ?? response?.user ?? memberId;

            onMemberPermissionUpdate?.({ userId: updatedUserId, permission: updatedPermission });
            onMemberPermissionUpdate?.({ userId: memberId, permission: updatedPermission });

            setMembers((prev) => prev.map((member) => (
                member.id === memberId || member.id === updatedUserId ? { ...member, role: updatedPermission } : member
            )));
            toast.success('Member access updated');
        } catch (error) {
            setMembers(previousMembers);
            toast.error('Failed to update member access');
        } finally {
            setUpdatingAccess(null);
        }
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
        || permissionLabel(member.role).toLowerCase().includes(normalizedMemberSearch)
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
                                bgcolor: activeTab === 'requests' ? '#4C4EFF' : '#F3F4F6',
                                '&:hover': {
                                    bgcolor: activeTab === 'requests' ? '#4C4EFF' : '#E5E7EB',
                                },
                            }}
                        >
                            Requests ({requestsCount})
                        </Button>

                        {isRoomAdmin ? (
                            <Button
                                onClick={() => { setIsLoadingMembers(true); setActiveTab('members'); }}
                                sx={{
                                    minWidth: 0,
                                    px: 2,
                                    height: 40,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: activeTab === 'members' ? '#fff' : '#6B7280',
                                    bgcolor: activeTab === 'members' ? '#4C4EFF' : '#F3F4F6',
                                    '&:hover': {
                                        bgcolor: activeTab === 'members' ? '#4C4EFF' : '#E5E7EB',
                                    },
                                }}
                            >
                                Members ({membersCount})
                            </Button>
                        ) : null}
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
                                Pending approvals for this room
                            </Typography>

                            <Stack spacing={1.5}>
                                {isLoadingRequests && (
                                    <>
                                        <RequestSkeleton />
                                        <RequestSkeleton />
                                        <RequestSkeleton />
                                    </>
                                )}

                                {!isLoadingRequests && filteredRequests.length === 0 && (
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

                                {!isLoadingRequests && filteredRequests.map((request) => (
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
                                                disabled={processingIds.has(request.id)}
                                                onClick={() => handleRejectRequest(request)}
                                                sx={{
                                                    height: 30,
                                                    borderRadius: 2,
                                                    bgcolor: '#F3F4F6',
                                                    color: '#111827',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    '&:hover': { bgcolor: '#E5E7EB' },
                                                    '&.Mui-disabled': { opacity: 0.6 },
                                                }}
                                            >
                                                {processingIds.has(request.id)
                                                    ? <CircularProgress size={12} sx={{ color: '#111827' }} />
                                                    : 'Reject'}
                                            </Button>

                                            <Button
                                                fullWidth
                                                disabled={processingIds.has(request.id)}
                                                onClick={() => handleApproveRequest(request)}
                                                sx={{
                                                    height: 30,
                                                    borderRadius: 2,
                                                    bgcolor: '#4C4EFF',
                                                    color: '#fff',
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    textTransform: 'none',
                                                    '&:hover': { bgcolor: '#3f41dc' },
                                                    '&.Mui-disabled': { opacity: 0.6 },
                                                }}
                                            >
                                                {processingIds.has(request.id)
                                                    ? <CircularProgress size={12} color="inherit" />
                                                    : 'Approve'}
                                            </Button>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        </>
                    )}

                    {activeTab === 'members' && isRoomAdmin && (
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

                            {isLoadingMembers && (
                                <>
                                    <RequestSkeleton />
                                    <RequestSkeleton />
                                    <RequestSkeleton />
                                </>
                            )}

                            {!isLoadingMembers && filteredMembers.length === 0 && (
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

                            {!isLoadingMembers && filteredMembers.map((member) => {
                                const isAdminMember = member.role === 'admin';
                                const isEditor = member.role === 'edit';
                                const isViewer = member.role === 'view';
                                const isUpdatingEditor = updatingAccess === `${member.id}:edit`;
                                const isUpdatingViewer = updatingAccess === `${member.id}:view`;
                                const isAccessDisabled = isAdminMember || Boolean(updatingAccess);

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
                                                    Current access: {permissionLabel(member.role)}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1}>
                                            <Button
                                                fullWidth
                                                disabled={isAccessDisabled}
                                                onClick={() => handleSetMemberRole(member.id, 'edit')}
                                                startIcon={isEditor ? <Iconify icon="mingcute:check-fill" width={16} /> : null}
                                                sx={{
                                                    height: 30,
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
                                                {isUpdatingEditor ? 'Saving...' : 'Editor'}
                                            </Button>

                                            <Button
                                                fullWidth
                                                disabled={isAccessDisabled}
                                                onClick={() => handleSetMemberRole(member.id, 'view')}
                                                startIcon={isViewer ? <Iconify icon="mingcute:check-fill" width={16} /> : null}
                                                sx={{
                                                    height: 30,
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
                                                {isUpdatingViewer ? 'Saving...' : 'Viewer'}
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
