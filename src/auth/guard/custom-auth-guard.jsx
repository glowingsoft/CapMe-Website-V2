import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredPermission }) => {

    const { user } = useSelector((state) => state.user);

    if (!user) {
        return <Navigate to="/" replace />;
    }

    const hasPermission = Array.isArray(requiredPermission) ? requiredPermission.includes(user?.permission) : user?.permission === requiredPermission;

    if (!hasPermission) {
        return <Navigate to="/404" replace />;
    }

    // Render children or nested routes if all checks pass
    return children || <Outlet />;
};

export default ProtectedRoute;
