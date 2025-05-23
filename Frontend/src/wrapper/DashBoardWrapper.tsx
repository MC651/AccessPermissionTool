// @ts-nocheck
import { createTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TimelineIcon from '@mui/icons-material/Timeline';
import { AppProvider,type Navigation } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';
import { useDemoRouter } from './useDemoRouter';
import { DashboardWrapperProps } from '../types';

const userType = localStorage.getItem("user_type")

const NAVIGATION: Navigation = [
    {
        kind: 'header',
        title: 'Menu',
    },
    {
        segment: 'home',
        title: 'Home',
        icon: <DashboardIcon />,
    },
    ...(userType === 'admin'
        ? [
            {
                segment: 'admin',
                title: 'Admin Page',
                icon: <DashboardIcon />, // Un icono de admin
            },
            {
                segment: 'add_user',
                title: 'Add User',
                icon: <TimelineIcon />
            }
        ]
        : []),
    {
        segment: 'logout',
        title: 'Logout',
        icon: <TimelineIcon />,
    }
];


const demoTheme = createTheme({
    cssVariables: {
      colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { light: true, dark: true },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 600,
        lg: 1200,
        xl: 1536,
      },
    },
  });

function DashboardWrapper({ children }: DashboardWrapperProps) {
    const router = useDemoRouter('/home');
    return (
        <AppProvider 
        navigation={NAVIGATION} 
        router={router} 
        theme={demoTheme} 
        branding={{
            logo: <img src="images\logo_corporate.png" alt="logo" />,
            title: ''
        }}>

        <DashboardLayout>   
            {children}
        </DashboardLayout>

        </AppProvider>
    );
}

export default DashboardWrapper;
