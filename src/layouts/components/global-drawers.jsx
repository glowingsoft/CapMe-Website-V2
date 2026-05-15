import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserProfileDrawer from 'src/sections/active-sections/home-view/components/user-profile-drawer';
import { closeAllDrawers, emitProfileDrawerChange, DRAWER_EVENTS } from 'src/utils/drawer-events';
import { selectUser } from 'src/store/slices/userSlice';

export default function GlobalDrawers() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector(selectUser);

  useEffect(() => {
    if (!profileOpen) return;

    setProfileOpen(false);
    emitProfileDrawerChange(false);
  }, [location.pathname]);

  useEffect(() => {
    const onOpenUserProfile = (e) => {
      const targetUser = e.detail;
      const currentUserId = currentUser?._id ?? currentUser?.id ?? '';
      const targetUserId = targetUser?._id ?? targetUser?.id ?? '';

      if (currentUserId && targetUserId && String(targetUserId) === String(currentUserId)) {
        window.dispatchEvent(new Event('openAccountDrawer'));
        return;
      }

      closeAllDrawers();
      setProfileUser(targetUser);
      setProfileOpen(true);
      emitProfileDrawerChange(true);
    };

    const onCloseProfileDrawer = () => {
      setProfileOpen(false);
      emitProfileDrawerChange(false);
    };

    const onOpenRoom = (e) => {
      // Only home-index (/home) and explore (/home/explore) have local openRoom handlers
      if (!/^\/home(\/explore)?\/?$/.test(location.pathname)) {
        navigate('/home', { state: { pendingRoom: e.detail } });
      }
    };

    window.addEventListener('openUserProfile', onOpenUserProfile);
    window.addEventListener('openRoom', onOpenRoom);
    window.addEventListener('accountDrawerOpened', onCloseProfileDrawer);
    window.addEventListener(DRAWER_EVENTS.profileClose, onCloseProfileDrawer);
    return () => {
      window.removeEventListener('openUserProfile', onOpenUserProfile);
      window.removeEventListener('openRoom', onOpenRoom);
      window.removeEventListener('accountDrawerOpened', onCloseProfileDrawer);
      window.removeEventListener(DRAWER_EVENTS.profileClose, onCloseProfileDrawer);
    };
  }, [location.pathname, navigate, currentUser]);

  const handleClose = () => {
    setProfileOpen(false);
    emitProfileDrawerChange(false);
  };

  return (
    <UserProfileDrawer
      open={profileOpen}
      onClose={handleClose}
      user={profileUser}
    />
  );
}
