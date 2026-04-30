import Box from '@mui/material/Box';
import noDataSvg from '../images/noData.svg';

export default function NoDataIllustration({ sx }) {
  return (
    <Box sx={{ width: 220, height: 'auto', ...sx }}>
      <img src={noDataSvg} alt="No data" style={{ width: '100%', height: 'auto', display: 'block' }} />
    </Box>
  );
}