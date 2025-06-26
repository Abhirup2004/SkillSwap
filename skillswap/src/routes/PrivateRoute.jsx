// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('token'); // You can later replace with AuthContext or Redux

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
