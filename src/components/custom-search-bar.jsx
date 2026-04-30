import React from 'react';
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import { Icon } from '@iconify/react';

const SearchBarRoot = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  background: '#232323',
  borderRadius: 8,
  color: '#fff',
  width: '100%',
  height: 44,
  paddingLeft: theme.spacing(5),
  fontSize: 16,
  border: '1px solid #232323',
  boxShadow: 'none',
  '& input': {
    color: '#fff',
    '::placeholder': {
      color: '#bdbdbd',
      opacity: 1,
    },
  },
}));

const IconWrapper = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 18,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#bdbdbd',
  pointerEvents: 'none',
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
}));

export default function CustomSearchBar({ placeholder = 'Search Here..', value, onChange, ...props }) {
  return (
    <SearchBarRoot>
      <IconWrapper>
        <Icon icon="mdi:magnify" width={20} height={20} />
      </IconWrapper>
      <StyledInput placeholder={placeholder} value={value} onChange={onChange} inputProps={{ 'aria-label': 'search' }} {...props} />
    </SearchBarRoot>
  );
}
