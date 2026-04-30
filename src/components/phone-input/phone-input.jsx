import { forwardRef, useState, useRef, useEffect } from 'react';
import PhoneInputBase, { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { useTheme } from '@mui/material/styles';
import 'react-phone-number-input/style.css';
import { Iconify } from 'src/components/iconify';


// ----------------------------------------------------------------------

const getFlagUrl = (code) => `https://flagcdn.com/w20/${code.toLowerCase()}.png`;

const countryList = getCountries().map((code) => ({
  code,
  callingCode: `+${getCountryCallingCode(code)}`,
  label: new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code,
}));

// ----------------------------------------------------------------------

const StyledInput = forwardRef(({ value, onChange, ...props }, ref) => (
  <input
    ref={ref}
    value={value}
    onChange={onChange}
    {...props}
    style={{
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: 15,
      background: 'transparent',
      color: 'inherit',
      width: '100%',
      padding: 0,
    }}
  />
));
StyledInput.displayName = 'StyledInput';

// ----------------------------------------------------------------------

export const PhoneInput = forwardRef(
  ({ value, onChange, placeholder, defaultCountry = 'PK', sx, ...other }, ref) => {
    const theme = useTheme();
    const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [search, setSearch] = useState('');
    const anchorRef = useRef(null);

    const selected = countryList.find((c) => c.code === selectedCountry);

    const filtered = countryList.filter(
      (c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.callingCode.includes(search)
    );

    const handleToggle = () => {
      setDropdownOpen((prev) => !prev);
      setSearch('');
    };

    const handleClose = () => {
      setDropdownOpen(false);
      setSearch('');
    };

    const handleSelect = (code) => {
      setSelectedCountry(code);
      handleClose();
    };

    return (
      <Box ref={anchorRef} sx={{ position: 'relative' }}>
        {/* Input row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            border: `1px solid #e8e8e8`,
            borderRadius: 2.5,
            bgcolor: '#fafbfc',
            px: 1.5,
            gap: 1,
            transition: 'border-color 0.2s',
            '&:hover': { borderColor: 'rgba(0,0,0,0.87)' },
            '&:focus-within': { borderColor: 'rgba(0,0,0,0.87)' },
            ...sx,
          }}
        >
          {/* Trigger */}
          <Box
            onClick={handleToggle}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              cursor: 'pointer',
              userSelect: 'none',
              pr: 1,
              borderRight: '1px solid #e8e8e8',
              mr: 0.5,
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={getFlagUrl(selectedCountry)}
              alt={selectedCountry}
              onError={(e) => { e.target.style.display = 'none'; }}
              sx={{ width: 22, height: 15, borderRadius: '3px', objectFit: 'cover' }}
            />
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {selected?.callingCode}
            </Typography>
            <Typography sx={{ fontSize: 10, color: 'text.disabled' }}>▼</Typography>
          </Box>

          {/* Phone input — flex:1 makes the root div fill remaining width */}
          <PhoneInputBase
            ref={ref}
            value={value}
            onChange={onChange}
            country={selectedCountry}
            defaultCountry={selectedCountry}
            placeholder={placeholder ?? 'Enter phone number'}
            inputComponent={StyledInput}
            countrySelectComponent={() => null}
            style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}
            {...other}
          />
        </Box>

        {/* Popper dropdown — renders outside Dialog stacking context */}
        <Popper
          open={dropdownOpen}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 9999 }}
          modifiers={[
            { name: 'flip', enabled: true, options: { fallbackPlacements: ['top-start'] } },
            { name: 'offset', options: { offset: [0, 4] } },
          ]}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <Paper
              elevation={8}
              sx={{
                mt: 0.5,
                width: 280,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0px 8px 32px rgba(0,0,0,0.14)',
                border: '1px solid #f0f0f0',
              }}
            >
              {/* Search */}
              <Box sx={{ p: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                <InputBase
                  autoFocus
                  fullWidth
                  placeholder="Search country or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{
                    bgcolor: '#f5f6f8',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.6,
                    fontSize: 13,
                  }}
                  startAdornment={
                    <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.disabled', mr: 1, flexShrink: 0 }} />
                  }
                />
              </Box>

              {/* Country list */}
              <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
                {filtered.length === 0 ? (
                  <Typography sx={{ px: 2, py: 2, fontSize: 13, color: 'text.secondary' }}>
                    No results found
                  </Typography>
                ) : (
                  filtered.map((c) => {
                    const isSelected = c.code === selectedCountry;
                    return (
                      <Box
                        key={c.code}
                        onClick={() => handleSelect(c.code)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          px: 2,
                          py: 1,
                          cursor: 'pointer',
                          bgcolor: isSelected ? '#f0f0ff' : 'transparent',
                          '&:hover': { bgcolor: '#f5f6f8' },
                          transition: 'background 0.15s',
                        }}
                      >
                        <Box
                          component="img"
                          src={getFlagUrl(c.code)}
                          alt={c.code}
                          onError={(e) => { e.target.style.display = 'none'; }}
                          sx={{
                            width: 22,
                            height: 15,
                            borderRadius: '3px',
                            objectFit: 'cover',
                            flexShrink: 0,
                          }}
                        />
                        <Typography sx={{ fontSize: 13, color: 'text.secondary', minWidth: 42 }}>
                          {c.callingCode}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: isSelected ? 600 : 400,
                            color: 'text.primary',
                            flex: 1,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {c.label}
                        </Typography>
                        {isSelected && (
                          <Typography sx={{ fontSize: 14, color: '#4C4EFF' }}>✓</Typography>
                        )}
                      </Box>
                    );
                  })
                )}
              </Box>
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';