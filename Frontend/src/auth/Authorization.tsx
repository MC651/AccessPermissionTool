import { Navigate,useLocation } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import { Token, AutorizedRoles } from '../types';

const Autorized_Route: React.FC<AutorizedRoles> = ({ children,allowed_roles }) => {
  
  const token = localStorage.getItem('access_token');
  const location = useLocation();
 
  if (!token) {
    return <Navigate to="/login" />;
  }

  const decodedToken = jwtDecode<Token>(token);
  const currentTime = Date.now() / 1000;

  if (decodedToken.exp < currentTime) {
    //console.log("Token expirado, redirigiendo a /login");
    localStorage.removeItem('access_token');
    return <Navigate to="/login" />;
  }

  const user_type = decodedToken.ut;

  if(!allowed_roles.includes(user_type)) {
    return <Navigate to="/unauthorized" state={{from: location}} replace/>;
  } 

  return children;
};

export default Autorized_Route;
