import { useLocation, useNavigate } from 'react-router-dom';
import {AppProviderRouter} from '../types';

export function useDemoRouter(defaultPath: string): AppProviderRouter {
  const location = useLocation();
  const navigate = useNavigate();

  return {
    pathname: location.pathname || defaultPath,
    navigate: (path: string) => navigate(path),
    searchParams: new URLSearchParams(location.search),
  };
}
