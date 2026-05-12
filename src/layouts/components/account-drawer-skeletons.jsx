import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export function AccountProfileHeaderSkeleton() {
    return (
        <>
            <Skeleton variant="rounded" width={200} height={200} sx={{ borderRadius: 4 }} />
            <Skeleton variant="text" width={170} height={36} sx={{ mt: 2 }} />
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 1 }}>
                <Skeleton variant="text" width={190} height={22} />
                <Skeleton variant="text" width={120} height={22} />
            </Stack>
        </>
    );
}

export function AccountStatsSkeleton() {
    return (
        <Stack direction="row" justifyContent="space-around" alignItems="center" sx={{ px: 2, pb: 3 }}>
            <Stack alignItems="center" sx={{ flex: 1 }}>
                <Skeleton variant="text" width={28} height={34} />
                <Skeleton variant="text" width={48} height={22} />
            </Stack>

            <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />

            <Stack alignItems="center" sx={{ flex: 1 }}>
                <Skeleton variant="text" width={28} height={34} />
                <Skeleton variant="text" width={52} height={22} />
            </Stack>

            <Box sx={{ height: 36, borderLeft: '1px dashed #ccc' }} />

            <Stack alignItems="center" sx={{ flex: 1 }}>
                <Skeleton variant="text" width={28} height={34} />
                <Skeleton variant="text" width={62} height={22} />
            </Stack>
        </Stack>
    );
}

export function AccountConnectionListSkeleton({ showButton = true }) {
    return (
        <Stack spacing={1}>
            {[0, 1, 2].map((idx) => (
                <Stack key={idx} direction="row" alignItems="center" spacing={1.5} sx={{ p: 1 }}>
                    <Skeleton variant="circular" width={42} height={42} />
                    <Stack sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" height={22} />
                        <Skeleton variant="text" width="40%" height={18} />
                    </Stack>
                    {showButton && <Skeleton variant="rounded" width={100} height={30} />}
                </Stack>
            ))}
        </Stack>
    );
}