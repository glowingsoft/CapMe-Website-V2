import { useEffect, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function OtpTimer({ onResend, seconds = 30 }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef(null);

  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(seconds);
    setIsRunning(true);
    let remaining = seconds;
    intervalRef.current = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(intervalRef.current);
        setIsRunning(false);
      }
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = () => {
    onResend?.();
    startTimer();
  };

  return (
    <Typography align="center" fontSize={13} color="text.secondary">
      {isRunning ? (
        <>
          Resend code in{' '}
          <Box component="span" sx={{ fontWeight: 700, color: '#4C4EFF' }}>
            {timeLeft}s
          </Box>
        </>
      ) : (
        <>
          Didn&apos;t receive the code?{' '}
          <Box
            component="span"
            onClick={handleResend}
            sx={{ fontWeight: 700, color: '#4C4EFF', cursor: 'pointer', userSelect: 'none' }}
          >
            Resend
          </Box>
        </>
      )}
    </Typography>
  );
}
