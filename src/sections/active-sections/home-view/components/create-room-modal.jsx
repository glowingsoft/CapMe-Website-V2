import { Alert } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { useEffect, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import Snackbar from '@mui/material/Snackbar';

function toSlug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function Field({ label, hint, children }) {
  return (
    <Box>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Typography fontSize={13} fontWeight={700} color="#111">{label}</Typography>
        {hint && <Typography fontSize={11} color="#bdbdbd">{hint}</Typography>}
      </Stack>
      {children}
    </Box>
  );
}

const VISIBILITY_OPTIONS = [
  { id: 'public', icon: 'solar:global-bold', label: 'Public', note: 'Anyone in the workspace can join' },
  { id: 'private', icon: 'solar:lock-bold', label: 'Private', note: 'Only invited members can see this room' },
  { id: 'friends', icon: 'solar:users-group-rounded-bold', label: 'Friends', note: 'Only your friends can see and join this room' },
];

// Mock user suggestions for invite
const MOCK_USERS = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', avatar: '' },
  { id: 'u2', name: 'Bob Smith', email: 'bob@example.com', avatar: '' },
  { id: 'u3', name: 'Carol Williams', email: 'carol@example.com', avatar: '' },
  { id: 'u4', name: 'David Brown', email: 'david@example.com', avatar: '' },
  { id: 'u5', name: 'Eva Martinez', email: 'eva@example.com', avatar: '' },
  { id: 'u6', name: 'Frank Lee', email: 'frank@example.com', avatar: '' },
];

export default function CreateRoomModal({ open, onClose, onCreate, editMode = false, initialValues = null }) {
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [inviteInput, setInviteInput] = useState('');
  const [invited, setInvited] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const photoInputRef = useRef(null);
  const tagInputRef = useRef(null);
  const [toast, setToast] = useState({
    open: false,
    message: '',
  });

  useEffect(() => {
    if (open && editMode && initialValues) {
      setPhoto(initialValues.image || null);
      setName(initialValues.name || '');
      setSlug(toSlug(initialValues.name || ''));
      setDescription(initialValues.description || '');
      setTags(initialValues.tags || []);
      setVisibility((initialValues.visibility || 'public').toLowerCase());
      setInvited([]);
    } else if (!open) {
      setPhoto(null);
      setName('');
      setSlug('');
      setDescription('');
      setTags([]);
      setTagInput('');
      setVisibility('public');
      setInviteInput('');
      setInvited([]);
      setSuggestions([]);
    }
    setToast({ open: false, message: '' });
  }, [open]);

  // --- Photo ---
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  // --- Name / slug ---
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    setSlug(toSlug(val));
  };

  // --- Tags ---
  const commitTag = () => {
    const trimmed = tagInput.trim().replace(/^#+/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      commitTag();
    } else if (e.key === 'Backspace' && !tagInput) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  // --- Invite ---
  const handleInviteInput = (e) => {
    const val = e.target.value;
    setInviteInput(val);
    if (val.length >= 1) {
      const q = val.toLowerCase();
      setSuggestions(
        MOCK_USERS.filter(
          (u) =>
            !invited.find((i) => i.id === u.id) &&
            (u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
        ).slice(0, 5)
      );
    } else {
      setSuggestions([]);
    }
  };

  const addInvitee = (user) => {
    setInvited((prev) => [...prev, user]);
    setInviteInput('');
    setSuggestions([]);
  };

  const handleInviteKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        addInvitee(suggestions[0]);
      } else if (inviteInput.trim()) {
        // bare email invite
        const email = inviteInput.trim();
        if (!invited.find((i) => i.email === email)) {
          setInvited((prev) => [...prev, { id: email, email, name: email, avatar: '' }]);
        }
        setInviteInput('');
        setSuggestions([]);
      }
    }
  };

  const removeInvitee = (id) => setInvited((prev) => prev.filter((i) => i.id !== id));


  const showToast = (message) => setToast({ open: true, message });
  const hideToast = () =>
    setToast((prev) => ({
      ...prev,
      open: false,
    }));


  const handleCreate = () => {
    if (!name.trim()) return;

    onCreate?.({
      photo,
      name: name.trim(),
      slug,
      description: description.trim(),
      tags,
      visibility,
      invited,
    });

    showToast(editMode ? 'Room updated successfully' : 'Room created successfully');

    setTimeout(() => {
      onClose();
    }, 300);
  };

  const selectedVisibility = VISIBILITY_OPTIONS.find((o) => o.id === visibility);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', overflow: 'hidden' },

      }}
    >
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={hideToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={hideToast}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <DialogContent sx={{ p: 0 }}>

        {/* Header */}
        <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
              <Box component="span" sx={{ color: '#4C4EFF' }}>{editMode ? 'Edit' : 'Create'}</Box>
              {editMode ? ' Room' : ' a Room'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {editMode ? 'Update the details for this room.' : 'Set up a space for your team to connect.'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: '#9e9e9e', mt: 0.5, '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <Iconify icon="mingcute:close-line" width={20} />
          </IconButton>
        </Box>

        {/* Scrollable form */}
        <Box
          sx={{
            px: 3,
            pb: 3,
            maxHeight: 'calc(100vh - 220px)',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.12) transparent',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.12)', borderRadius: '10px' },
          }}
        >
          <Stack spacing={2.5}>

            {/* Room Photo */}
            <Field label="Room Photo" hint="Optional">
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                  onClick={() => photoInputRef.current?.click()}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                    flexShrink: 0,
                    border: '2px dashed rgba(76,78,255,0.35)',
                    bgcolor: '#f4f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '&:hover .overlay': { opacity: 1 },
                  }}
                >
                  {photo ? (
                    <Box
                      component="img"
                      src={photo}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Iconify icon="solar:camera-add-bold" width={26} style={{ color: '#9e9e9e' }} />
                  )}
                  <Box
                    className="overlay"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: photo ? 0 : 0,
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <Iconify icon="solar:camera-add-bold" width={22} style={{ color: '#fff' }} />
                  </Box>
                </Box>
                <Box>
                  <Typography fontSize={13} color="text.secondary" lineHeight={1.5}>
                    Upload a photo to represent your room.
                    <br />
                    JPG, PNG or GIF — max 5 MB.
                  </Typography>
                  {photo && (
                    <Button
                      size="small"
                      onClick={() => setPhoto(null)}
                      sx={{ mt: 0.5, p: 0, minWidth: 0, fontSize: 12, color: '#e53935', textTransform: 'none' }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
              </Stack>
            </Field>

            {/* Room Name */}
            <Field label="Room Name" hint="Required">
              <Box
                sx={{
                  bgcolor: '#f4f5f9',
                  border: '1.5px solid #f0f0f0',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1.25,
                  '&:focus-within': { borderColor: '#4C4EFF', bgcolor: '#fff' },
                  transition: 'all 0.15s',
                }}
              >
                <InputBase
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. design-talk"
                  fullWidth
                  autoFocus
                  sx={{ fontSize: 14, '& input': { p: 0 } }}
                />
              </Box>
              {slug && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.75 }}>
                  <Iconify icon="mingcute:hashtag-line" width={13} style={{ color: '#4C4EFF' }} />
                  <Typography fontSize={12} color="#4C4EFF" fontWeight={600}>{slug}</Typography>
                </Stack>
              )}
            </Field>

            {/* Description */}
            <Field label="Description" hint="Optional">
              <Box
                sx={{
                  bgcolor: '#f4f5f9',
                  border: '1.5px solid #f0f0f0',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1.25,
                  '&:focus-within': { borderColor: '#4C4EFF', bgcolor: '#fff' },
                  transition: 'all 0.15s',
                }}
              >
                <InputBase
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this room about?"
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ fontSize: 14, '& textarea': { p: 0 } }}
                />
              </Box>
            </Field>

            {/* Tags */}
            <Field label="Tags" hint="Space or Enter to add">
              <Box
                onClick={() => tagInputRef.current?.focus()}
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  alignItems: 'center',
                  bgcolor: '#f4f5f9',
                  border: '1.5px solid #f0f0f0',
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  minHeight: 48,
                  cursor: 'text',
                  '&:focus-within': { borderColor: '#4C4EFF', bgcolor: '#fff' },
                  transition: 'all 0.15s',
                }}
              >
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    onDelete={() => removeTag(tag)}
                    sx={{
                      bgcolor: 'rgba(76,78,255,0.1)',
                      color: '#4C4EFF',
                      fontWeight: 600,
                      fontSize: 12,
                      height: 26,
                      '& .MuiChip-deleteIcon': { color: '#4C4EFF', fontSize: 14 },
                    }}
                  />
                ))}
                <InputBase
                  inputRef={tagInputRef}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value.replace(/\s/, ''))}
                  onKeyDown={handleTagKeyDown}
                  onBlur={commitTag}
                  placeholder={tags.length === 0 ? 'e.g. design, ux, frontend' : ''}
                  sx={{ fontSize: 13, flex: '1 1 80px', minWidth: 80, '& input': { p: 0 } }}
                />
              </Box>
            </Field>

            {/* Visibility */}
            <Field label="Visibility">
              <Stack direction="row" spacing={1}>
                {VISIBILITY_OPTIONS.map((opt) => {
                  const isActive = visibility === opt.id;
                  return (
                    <Box
                      key={opt.id}
                      onClick={() => setVisibility(opt.id)}
                      sx={{
                        flex: 1,
                        border: isActive ? '2px solid #4C4EFF' : '1.5px solid #e0e0e0',
                        borderRadius: 2.5,
                        bgcolor: isActive ? 'rgba(76,78,255,0.05)' : '#fff',
                        px: 1.25,
                        py: 1.25,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        textAlign: 'center',
                        '&:hover': { borderColor: '#4C4EFF' },
                      }}
                    >
                      <Iconify
                        icon={opt.icon}
                        width={18}
                        style={{ color: isActive ? '#4C4EFF' : '#9e9e9e', display: 'block', margin: '0 auto 4px' }}
                      />
                      <Typography
                        fontSize={12}
                        fontWeight={700}
                        sx={{ color: isActive ? '#4C4EFF' : '#111' }}
                      >
                        {opt.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
              <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.75 }}>
                {selectedVisibility?.note}
              </Typography>
            </Field>

            {/* Invite People */}
            <Field label="Invite People" hint="Optional">
              {/* Invited chips */}
              {invited.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1 }}>
                  {invited.map((u) => (
                    <Chip
                      key={u.id}
                      avatar={
                        <Avatar src={u.avatar || undefined} sx={{ bgcolor: '#4C4EFF', fontSize: 11, color: '#fff' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                      label={u.name === u.email ? u.email : u.name}
                      size="small"
                      onDelete={() => removeInvitee(u.id)}
                      sx={{
                        bgcolor: '#f0f1ff',
                        color: '#4C4EFF',
                        fontWeight: 600,
                        fontSize: 12,
                        height: 28,
                        '& .MuiChip-deleteIcon': { color: '#4C4EFF', fontSize: 14 },
                      }}
                    />
                  ))}
                </Stack>
              )}

              {/* Input + dropdown */}
              <Box sx={{ position: 'relative' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: '#f4f5f9',
                    border: '1.5px solid #f0f0f0',
                    borderRadius: 2,
                    px: 1.5,
                    py: 1.25,
                    '&:focus-within': { borderColor: '#4C4EFF', bgcolor: '#fff' },
                    transition: 'all 0.15s',
                  }}
                >
                  <Iconify icon="solar:user-plus-bold" width={16} style={{ color: '#9e9e9e', flexShrink: 0 }} />
                  <InputBase
                    value={inviteInput}
                    onChange={handleInviteInput}
                    onKeyDown={handleInviteKeyDown}
                    placeholder="Enter email or name..."
                    fullWidth
                    sx={{ fontSize: 14, '& input': { p: 0 } }}
                  />
                </Box>

                {/* Suggestions dropdown */}
                {suggestions.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      bgcolor: '#fff',
                      border: '1.5px solid #e8e8e8',
                      borderRadius: 2,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                      zIndex: 10,
                      overflow: 'hidden',
                    }}
                  >
                    {suggestions.map((u) => (
                      <Stack
                        key={u.id}
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        onClick={() => addInvitee(u)}
                        sx={{
                          px: 1.5,
                          py: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#f4f5f9' },
                        }}
                      >
                        <Avatar
                          src={u.avatar || undefined}
                          sx={{ width: 30, height: 30, bgcolor: '#4C4EFF', fontSize: 12, color: '#fff' }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontSize={13} fontWeight={600}>{u.name}</Typography>
                          <Typography fontSize={11} color="text.secondary">{u.email}</Typography>
                        </Box>
                      </Stack>
                    ))}
                  </Box>
                )}
              </Box>
            </Field>

          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                borderColor: 'rgba(0,0,0,0.15)',
                color: 'text.primary',
                borderRadius: 2,
                py: 1.2,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: '#4C4EFF', color: '#4C4EFF', bgcolor: 'transparent' },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              disabled={!name.trim()}
              onClick={handleCreate}
              endIcon={<Iconify icon="mingcute:arrow-right-line" width={18} />}
              sx={{
                bgcolor: '#4C4EFF',
                color: '#fff',
                borderRadius: 2,
                py: 1.2,
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#3739b7', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#c5c6ff', color: '#fff' },
              }}
            >
              {editMode ? 'Save Changes' : 'Create Room'}
            </Button>
          </Stack>
        </Box>

      </DialogContent>
    </Dialog>
  );
}
