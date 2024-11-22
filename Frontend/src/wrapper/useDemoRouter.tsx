import { useLocation, useNavigate } from 'react-router-dom';
import {AppProviderRouter} from '../types';

export function useDemoRouter(defaultPath: string): AppProviderRouter {
  const location = useLocation();
  const navigate = useNavigate();

  return {
    // Devuelve la ruta actual o la predeterminada
    pathname: location.pathname || defaultPath,
    // Función para navegar a una nueva ruta
    navigate: (path: string) => navigate(path),
    // Devuelve los parámetros de búsqueda de la URL
    searchParams: new URLSearchParams(location.search),
  };
}
