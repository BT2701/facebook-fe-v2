import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { getStoredUser } from '../../config/auth';

export default function PrivateRoute() {
  const { currentUser } = useUser();
  const user = currentUser || getStoredUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
