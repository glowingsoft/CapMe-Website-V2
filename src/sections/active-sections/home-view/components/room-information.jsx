import { useState, useEffect } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Skeleton from '@mui/material/Skeleton';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useTranslate } from 'src/locales';
import { toast } from 'src/components/snackbar';
import { fDate } from 'src/utils/format-time';
import { ConfirmModal } from 'src/components/custom-dialog';
import { useSelector } from 'react-redux';
import { selectUser } from 'src/store/slices/userSlice';
import DrawerHeader from './drawer-header';
import RoomInfoSkeleton from './room-info-skeleton';

const VISIBILITY_CONFIG = {
    public: { icon: 'solar:global-bold', labelKey: 'search.visibility_public', color: '#43a047', bg: 'rgba(67,160,71,0.1)' },
    friends: { icon: 'solar:users-group-rounded-bold', labelKey: 'search.visibility_private_friends', color: '#4C4EFF', bg: 'rgba(76,78,255,0.1)' },
    private: { icon: 'solar:lock-bold', labelKey: 'search.visibility_private', color: '#29b6f6', bg: 'rgba(41,182,246,0.1)' },
    private_friends: { icon: 'solar:users-group-rounded-bold', labelKey: 'search.visibility_private_friends', color: '#7b5ea7', bg: 'rgba(123,94,167,0.1)' },
    personal: { icon: 'solar:garage-bold', labelKey: 'search.visibility_personal', color: '#4C4EFF', bg: 'rgba(76,78,255,0.1)' },
};
import RoomMediaPanel from './room-media-panel';
import UnfollowModal from './unfollow-modal';
import { DRAWER_EVENTS } from 'src/utils/drawer-events';
import { useRemoveRoomMemberMutation, useDeleteRoomMutation, useGetRoomByIdQuery, useLazyGetRoomMembersQuery, useSubmitRoomReportMutation } from 'src/store/Reducer/rooms-api';

const cleanUrl = (s) => {
    if (!s || typeof s !== 'string') return '';
    return s.replace(/^https?:\/\/[^/]+(\/https?:\/\/.+)$/, (_, rest) => rest.slice(1)).trim();
};

const cleanAvatar = (url) => {
    if (!url || typeof url !== 'string') return '';
    if (url.includes('noImg')) return '';
    return url;
};

const getMemberUserId = (member) => {
    if (!member) return '';
    // Flat shape from room API: { _id, name, image }
    if (member._id && !member.user) return String(member._id);
    // Nested shape: { user: { _id } } or { user: "id-string" }
    const user = typeof member.user === 'object' && member.user !== null ? member.user : null;
    const id = user?._id ?? user?.id ?? (typeof member.user === 'string' ? member.user : null) ?? member.userId ?? member.id ?? member._id;
    return String(id ?? '');
};

const getMemberProfile = (member) => {
    const user = typeof member?.user === 'object' && member.user !== null ? member.user : null;
    return {
        name: member?.name ?? user?.name ?? user?.email ?? member?.email ?? '',
        email: member?.email ?? user?.email ?? '',
        avatar: cleanAvatar(member?.image ?? member?.avatar ?? user?.image ?? user?.avatar ?? ''),
    };
};

const normalizePermission = (permission) => {
    const value = String(permission ?? '').toLowerCase();
    if (value === 'editor') return 'edit';
    if (value === 'viewer') return 'view';
    return value || 'view';
};


export default function RoomInformation({
    open,
    onClose,
    room,
    roomId: roomIdProp,
    enrichedMembers = null,
    isLoading = false,
    isRoomAdmin = false,
    permissionOverrides = {},
    refreshKey = 0,
    onEdit,
    onShare,
    onDownloadMedia,
    onDeleteRoom,
    onRemoveFollower,
    onMembersLoaded,
}) {
    const { t } = useTranslate('common');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);
    const [removingFollower, setRemovingFollower] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportFeedback, setReportFeedback] = useState('');
    const [showMedia, setShowMedia] = useState(false);
    const [removedMemberIds, setRemovedMemberIds] = useState([]);
    const [apiMembers, setApiMembers] = useState([]);
    const [membersPage, setMembersPage] = useState(1);
    const [membersTotal, setMembersTotal] = useState(0);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [removeRoomMember, { isLoading: isRemovingMember }] = useRemoveRoomMemberMutation();
    const [deleteRoom, { isLoading: isDeletingRoom }] = useDeleteRoomMutation();
    const [fetchRoomMembers] = useLazyGetRoomMembersQuery();
    const [submitRoomReport, { isLoading: isSubmittingReport }] = useSubmitRoomReportMutation();
    const currentUser = useSelector(selectUser);
    const currentUserId = String(currentUser?.basicInfo?._id ?? currentUser?._id ?? currentUser?.id ?? currentUser?.userId ?? currentUser?.user?._id ?? '');

    const roomId = roomIdProp ?? room?.roomId ?? room?._id ?? room?.id;
    const { data: freshRoomData, isFetching: isFetchingRoom } = useGetRoomByIdQuery(roomId, {
        skip: !roomId || !open,
        refetchOnMountOrArgChange: true,
    });
    const freshRoom = freshRoomData?.body?.room ?? freshRoomData?.room ?? freshRoomData?.body ?? freshRoomData;

    const roomTags = (freshRoom?.tags ?? room?.tags ?? []).filter(Boolean);

    useEffect(() => {
        if (!open) {
            setShowMedia(false);
            setRemovedMemberIds([]);
            setApiMembers([]);
            setMembersPage(1);
            setMembersTotal(0);
            setIsLoadingMembers(false);
        }
    }, [open]);

    useEffect(() => {
        setRemovedMemberIds([]);
        setMembersPage(1);
    }, [roomId]);

    useEffect(() => {
        if (!open || !roomId || !isRoomAdmin) {
            setApiMembers([]);
            setIsLoadingMembers(false);
            return undefined;
        }

        let isActive = true;
        setIsLoadingMembers(true);
        setMembersPage(1);

        fetchRoomMembers({ roomId, page: 1, limit: 10 })
            .unwrap()
            .then(({ members, total }) => {
                if (isActive) {
                    setApiMembers(members);
                    setMembersTotal(total);
                    onMembersLoaded?.(members);
                }
            })
            .catch(() => {
                if (isActive) setApiMembers([]);
            })
            .finally(() => {
                if (isActive) setIsLoadingMembers(false);
            });

        return () => {
            isActive = false;
        };
    }, [open, roomId, refreshKey, isRoomAdmin, fetchRoomMembers]);

    useEffect(() => {
        if (!open || !roomId || membersPage === 1) return undefined;

        let isActive = true;
        setIsLoadingMembers(true);

        fetchRoomMembers({ roomId, page: membersPage, limit: 10 })
            .unwrap()
            .then(({ members, total }) => {
                if (isActive) {
                    setApiMembers((prev) => [...prev, ...members]);
                    setMembersTotal(total);
                }
            })
            .catch(() => { })
            .finally(() => {
                if (isActive) setIsLoadingMembers(false);
            });

        return () => {
            isActive = false;
        };
    }, [membersPage]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const closeDownloadedMedia = () => setShowMedia(false);

        window.addEventListener(DRAWER_EVENTS.downloadedMediaClose, closeDownloadedMedia);

        return () => {
            window.removeEventListener(DRAWER_EVENTS.downloadedMediaClose, closeDownloadedMedia);
        };
    }, []);


    const roomName = freshRoom?.name ?? room?.name ?? 'Creative Rooms';
    const roomDescription = freshRoom?.description ?? room?.description ?? 'This is new room';
    const visibility = freshRoom?.visibility ?? room?.visibility ?? 'Friends';
    const createdAt = fDate(freshRoom?.createdAt ?? room?.createdAt);

    const rawMembers = apiMembers.length > 0 ? apiMembers : (freshRoom?.members ?? room?.members ?? enrichedMembers ?? []);
    const members = (Array.isArray(rawMembers) ? rawMembers : [])
        .map((m) => {
            if (!m) return null;
            // New API shape: { memberId, name, email, image, status, permission }
            const isNewShape = !!m.memberId && !m._id && !m.user;
            const userId = isNewShape
                ? String(m.memberId)
                : String(m.userId || getMemberUserId(m) || '');
            const memberId = m.memberId ?? m.id ?? m.membershipId ?? m._id ?? userId;
            const id = userId || String(memberId ?? '');
            const profile = getMemberProfile(m);
            const permissionKey = userId || id;
            return {
                id,
                userId,
                memberId: memberId ?? id,
                name: profile.name,
                email: profile.email,
                avatar: profile.avatar,
                status: m.status ?? 'active',
                permission: permissionOverrides[String(permissionKey)] ?? normalizePermission(m.permission ?? m.role),
            };
        })
        .filter((member) => (
            member
            && String(member.id) !== currentUserId
            && (!member.userId || String(member.userId) !== currentUserId)
            && !removedMemberIds.includes(String(member.memberId))
            && !removedMemberIds.includes(String(member.id))
        ))
        .filter((member, index, arr) => arr.findIndex((m) => m.id === member.id) === index);

    const roomInitial = roomName?.charAt(0)?.toUpperCase() || 'R';

    const handleDeleteRoom = () => {
        if (!isRoomAdmin) return;
        setDeleteModalOpen(true);
    };

    const handleRemoveFollower = (follower) => {
        if (!isRoomAdmin) return;
        setRemovingFollower(follower);
        setRemoveModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!roomId || isDeletingRoom) return;
        setDeleteModalOpen(false);
        try {
            await deleteRoom(roomId).unwrap();
            toast.success(t('room_info.toast_deleted'));
            onDeleteRoom?.();
            onClose?.();
        } catch (err) {
            toast.error(err?.data?.message ?? 'Failed to delete room');
        }
    };

    const handleConfirmRemove = async () => {
        if (!isRoomAdmin || isRemovingMember) return;

        const memberId = removingFollower?.memberId ?? removingFollower?.id;
        if (!roomId || !memberId) {
            toast.error(!roomId ? 'Missing room id' : 'Missing member id');
            return;
        }

        setRemoveModalOpen(false);

        try {
            console.log('removeRoomMember payload', { roomId, memberId });
            await removeRoomMember({ roomId, memberId }).unwrap();
            setRemovedMemberIds((prev) => [...prev, String(memberId), String(removingFollower?.id ?? '')].filter(Boolean));
            onRemoveFollower?.(removingFollower);
            setRemovingFollower(null);
            toast.success(t('room_info.toast_removed'));
        } catch (error) {
            console.error('removeRoomMember failed', {
                payload: { roomId, memberId },
                error,
            });
            toast.error(error?.data?.message ?? 'Failed to remove member');
        }
    };

    const handleConfirmReport = async () => {
        if (isSubmittingReport) return;
        try {
            await submitRoomReport({ roomId, message: reportFeedback }).unwrap();
            toast.success(t('room_info.toast_reported'));
        } catch (err) {
            toast.error(err?.data?.message ?? 'Failed to submit report');
        } finally {
            setReportOpen(false);
            setReportFeedback('');
        }
    };

    return (
        <>
            <Drawer
                open={open && !showMedia}
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
                {/* Header */}
                <DrawerHeader
                    title={roomName}
                    onBack={onClose}
                    onEdit={onEdit}
                    onShare={onShare}
                    showEdit={isRoomAdmin}
                />

                <Scrollbar>
                    {/* Skeleton while loading */}
                    {(isLoading || isFetchingRoom) && <RoomInfoSkeleton />}

                    {/* Content — hidden while loading */}
                    {!isLoading && !isFetchingRoom && <>

                        {/* Avatar + Basic Info */}
                        <Stack alignItems="center" sx={{ pt: 4, pb: 2, px: 2 }}>
                            <Avatar
                                src={cleanUrl(freshRoom?.image ?? freshRoom?.icon ?? freshRoom?.photo ?? room?.image ?? room?.icon ?? room?.photo ?? '') || undefined}
                                alt={roomName}
                                sx={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: 4,
                                    bgcolor: '#4C4EFF',
                                    fontSize: 72,
                                    fontWeight: 700,
                                }}
                            >
                                {roomInitial}
                            </Avatar>

                            <Typography variant="h6" fontWeight={700} sx={{ mt: 2 }}>
                                {roomName}
                            </Typography>

                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 1 }}>
                                <Iconify icon="solar:calendar-bold" width={18} sx={{ color: 'text.primary' }} />

                                <Typography variant="body2" color="text.secondary">
                                    {t('room_info.created_on')}&nbsp; {createdAt}
                                </Typography>
                            </Stack>
                        </Stack>

                        {/* Description */}
                        <Box sx={{ px: 2, pb: 2 }}>
                            <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                                {t('room_info.description')}
                            </Typography>

                            <Box
                                sx={{
                                    minHeight: 120,
                                    border: '1px solid #e0e0e0',
                                    borderRadius: 2,
                                    bgcolor: '#fff',
                                    px: 2,
                                    py: 1.5,
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    {roomDescription}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Visibility */}
                        {(() => {
                            const key = visibility?.toLowerCase();
                            const cfg = VISIBILITY_CONFIG[key];
                            if (!cfg) return null;
                            return (
                                <Box sx={{ px: 2, pb: 2 }}>
                                    <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                                        {t('room_info.visibility')}
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1.25}
                                        sx={{
                                            px: 1.5,
                                            py: 1.25,
                                            bgcolor: cfg.bg,
                                            borderRadius: 2,
                                            border: `1.5px solid ${cfg.color}30`,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 30,
                                                height: 30,
                                                borderRadius: '50%',
                                                bgcolor: `${cfg.color}18`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Iconify icon={cfg.icon} width={15} style={{ color: cfg.color }} />
                                        </Box>
                                        <Box>
                                            <Typography fontSize={13} fontWeight={700} sx={{ color: cfg.color }}>
                                                {t(cfg.labelKey)}
                                            </Typography>
                                            <Typography fontSize={11} color="text.secondary">
                                                {key === 'public' && t('room_info.visibility_public_note')}
                                                {key === 'private' && t('room_info.visibility_private_note')}
                                                {(key === 'friends' || key === 'private_friends') && t('room_info.visibility_friends_note')}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            );
                        })()}


                        {/* Tags */}
                        {roomTags.length > 0 && (
                            <Box sx={{ px: 2, pb: 2 }}>
                                <Typography fontWeight={700} fontSize={14} sx={{ mb: 1 }}>
                                    {t('room_info.tags')}
                                </Typography>

                                <Stack direction="row" flexWrap="wrap" gap={0.75}>
                                    {roomTags.map((tag) => {
                                        const label = typeof tag === 'string' ? tag : (tag.tag ?? tag.name ?? tag.label ?? '');
                                        if (!label) return null;
                                        const display = label.replace(/^#+/, '');
                                        return (
                                            <Box
                                                key={label}
                                                sx={{
                                                    px: 1.25,
                                                    py: 0.4,
                                                    borderRadius: 10,
                                                    bgcolor: 'rgba(76,78,255,0.10)',
                                                    border: '1px solid rgba(76,78,255,0.20)',
                                                }}
                                            >
                                                <Typography fontSize={12} fontWeight={600} color="#4C4EFF">
                                                    {display}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        )}

                        {/* Actions */}
                        <Stack spacing={1} sx={{ px: 2, pb: 3 }}>
                            <Box
                                onClick={() => setShowMedia(true)}
                                sx={{
                                    height: 48,
                                    bgcolor: '#fff',
                                    borderRadius: 2,
                                    px: 1.75,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    cursor: 'pointer',
                                    border: '1px solid #f0f0f0',
                                    '&:hover': { bgcolor: '#f7f7f7' },
                                }}
                            >
                                <Iconify icon="solar:download-minimalistic-bold" width={19} sx={{ color: '#555' }} />
                                <Typography fontSize={14} fontWeight={600} color="#111">
                                    {t('room_info.downloaded_media')}
                                </Typography>
                            </Box>

                            {isRoomAdmin && (
                                <Box
                                    onClick={handleDeleteRoom}
                                    sx={{
                                        height: 48,
                                        bgcolor: '#fff',
                                        borderRadius: 2,
                                        px: 1.75,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        cursor: 'pointer',
                                        border: '1px solid #f0f0f0',
                                        '&:hover': { bgcolor: '#f7f7f7' },
                                    }}
                                >
                                    <Iconify icon="solar:trash-bin-trash-bold" width={19} sx={{ color: '#555' }} />
                                    <Typography fontSize={14} fontWeight={600} color="#111">
                                        {t('room_info.delete_room')}
                                    </Typography>
                                </Box>
                            )}

                            <Box
                                onClick={() => setReportOpen(true)}
                                sx={{
                                    height: 48,
                                    bgcolor: '#fff',
                                    borderRadius: 2,
                                    px: 1.75,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    cursor: 'pointer',
                                    border: '1px solid #f0f0f0',
                                    '&:hover': { bgcolor: '#fff5f5' },
                                }}
                            >
                                <Iconify icon="material-symbols:report-rounded" width={19} sx={{ color: '#C40000' }} />

                                <Typography fontSize={14} fontWeight={600} color="#C40000">
                                    {t('room_info.report')}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Members — admin only */}
                        {isRoomAdmin && <Box sx={{ px: 2, pb: 3 }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                <Typography fontWeight={700} fontSize={14}>{t('room_info.members')}</Typography>
                            </Stack>

                            {isLoadingMembers ? (
                                <Stack spacing={1}>
                                    {[0, 1, 2].map((item) => (
                                        <Box
                                            key={item}
                                            sx={{
                                                bgcolor: '#fff',
                                                borderRadius: 2.5,
                                                px: 1.5,
                                                py: 1.25,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                border: '1px solid #f0f0f0',
                                            }}
                                        >
                                            <Skeleton variant="circular" width={40} height={40} />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Skeleton variant="text" width="55%" height={18} />
                                                <Skeleton variant="text" width="38%" height={14} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Stack>
                            ) : members.length === 0 ? (
                                <Typography fontSize={14} color="text.disabled" textAlign="center" sx={{ py: 3 }}>
                                    {t('room_info.no_members')}
                                </Typography>
                            ) : (
                                <Stack spacing={1}>
                                    {members.map((member) => {
                                        const perm = String(member.permission ?? '').toLowerCase();
                                        const isAdmin = perm === 'admin' || perm.includes('admin');
                                        const isEdit = perm === 'edit' || perm.includes('edit');
                                        const permColor = isAdmin ? '#4C4EFF' : isEdit ? '#f59e0b' : '#29b6f6';
                                        const permBg = isAdmin ? 'rgba(76,78,255,0.1)' : isEdit ? 'rgba(245,158,11,0.1)' : 'rgba(41,182,246,0.1)';
                                        const isBlocked = String(member.status ?? '').toLowerCase() === 'blocked';
                                        return (
                                            <Box
                                                key={member.id}
                                                sx={{
                                                    bgcolor: '#fff',
                                                    borderRadius: 2.5,
                                                    px: 1.5,
                                                    py: 1.25,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    border: isBlocked ? '1px solid rgba(185,0,0,0.18)' : '1px solid #f0f0f0',
                                                    opacity: isBlocked ? 0.85 : 1,
                                                }}
                                            >
                                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                                                    <Avatar
                                                        src={member.avatar || undefined}
                                                        sx={{ width: 40, height: 40, flexShrink: 0, bgcolor: '#4C4EFF', fontSize: 15, fontWeight: 700 }}
                                                    >
                                                        {(member.name?.charAt(0) ?? roomInitial)?.toUpperCase()}
                                                    </Avatar>

                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
                                                            <Typography fontSize={14} fontWeight={700} color="#111" noWrap>
                                                                {member.name}
                                                            </Typography>
                                                            <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: permBg, flexShrink: 0 }}>
                                                                <Typography fontSize={10} fontWeight={700} sx={{ color: permColor, textTransform: 'capitalize', lineHeight: 1.2 }}>
                                                                    {member.permission ?? 'view'}
                                                                </Typography>
                                                            </Box>
                                                            {isBlocked && (
                                                                <Box sx={{ px: 1, py: 0.25, borderRadius: 1, bgcolor: 'rgba(185,0,0,0.08)', flexShrink: 0 }}>
                                                                    <Typography fontSize={10} fontWeight={700} sx={{ color: '#B90000', lineHeight: 1.2 }}>
                                                                        Blocked
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Stack>
                                                        {member.email ? (
                                                            <Typography fontSize={12} color="text.secondary" noWrap>
                                                                {member.email}
                                                            </Typography>
                                                        ) : null}
                                                    </Box>
                                                </Stack>

                                                {isRoomAdmin && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveFollower(member)}
                                                        sx={{
                                                            flexShrink: 0,
                                                            ml: 1,
                                                            color: '#B90000',
                                                            bgcolor: 'rgba(185,0,0,0.06)',
                                                            borderRadius: 1.5,
                                                            '&:hover': { bgcolor: 'rgba(185,0,0,0.14)' },
                                                        }}
                                                    >
                                                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        );
                                    })}
                                    {apiMembers.length < membersTotal && (
                                        <Button
                                            size="small"
                                            variant="text"
                                            disabled={isLoadingMembers}
                                            onClick={() => setMembersPage((p) => p + 1)}
                                            sx={{ alignSelf: 'center', mt: 0.5, fontSize: 13, fontWeight: 600 }}
                                        >
                                            {isLoadingMembers ? 'Loading…' : 'Load more'}
                                        </Button>
                                    )}
                                </Stack>
                            )}
                        </Box>}

                    </>}
                </Scrollbar>
            </Drawer>

            <RoomMediaPanel
                open={open && showMedia}
                onBack={() => setShowMedia(false)}
                roomId={roomId}
            />

            {/* Delete Room Modal */}
            {isRoomAdmin && (
                <ConfirmModal
                    open={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    loading={isDeletingRoom}
                    title={t('room_info.delete_modal_title')}
                    description={t('room_info.delete_modal_description', { roomName })}
                    confirmLabel={t('room_info.delete_modal_confirm')}
                    confirmColor="#C40000"
                    icon="solar:trash-bin-trash-bold"
                    iconColor="#C40000"
                />
            )}

            {/* Remove Follower Modal */}
            {isRoomAdmin && (
                <ConfirmModal
                    open={removeModalOpen}
                    onClose={() => setRemoveModalOpen(false)}
                    onConfirm={handleConfirmRemove}
                    loading={isRemovingMember}
                    title={t('room_info.remove_modal_title')}
                    description={removingFollower ? t('room_info.remove_modal_description', { memberName: removingFollower.name }) : ''}
                    confirmLabel={t('room_info.remove_modal_confirm')}
                    confirmColor="#B90000"
                    icon="solar:user-minus-bold"
                    iconColor="#B90000"
                />
            )}

            {/* Report Modal */}
            <UnfollowModal
                open={reportOpen}
                onClose={() => { setReportOpen(false); setReportFeedback(''); }}
                onConfirm={handleConfirmReport}
                roomName={roomName}
                title={t('room_info.report_modal_title')}
                icon="material-symbols:report-rounded"
                iconBgColor="#4C4EFF"
                confirmLabel={t('room_info.report_modal_confirm')}
                confirmColor="#4C4EFF"
                feedback={reportFeedback}
                onFeedbackChange={setReportFeedback}
            />

        </>
    );
}
