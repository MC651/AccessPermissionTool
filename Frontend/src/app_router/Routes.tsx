import { createBrowserRouter, Navigate } from "react-router-dom"
import Login from "../login/Login";
import ErrorPage from "../error/ErrorPage";
import {EmployeeProvider} from "../contexts/EmployeeContext";
import EditInformation from "../employee_view/EditInformation";
import Register from "../register/Register";
import Autorized_Route from "../auth/Authorization";
import UserInfo from "../employee_view/Information"
import Unauthorized from "../unauthorized/Unauthorized"
import AdminDashboard from "../admin_view/AdminDashboard";
import DashboardWrapper from "../wrapper/DashBoardWrapper"
import Logout from "../logout/Logout";

export const Router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to={"/login"} replace={true} />,
        errorElement: <ErrorPage />
    },
    {
        path: "/login",
        element: <Login/>,
        errorElement: <ErrorPage />
    },
    {
        path: "/register",
        element: <Register elevation_level={15} isRegister={true} marginTop={10} maxWidth={"md"}/>,
        errorElement: <ErrorPage />
    },
    {
        path: "/home",
        element:
            <Autorized_Route allowed_roles={['admin','user']}>
                <DashboardWrapper>
                    <EmployeeProvider>
                        <UserInfo/>
                    </EmployeeProvider>
                </DashboardWrapper>
            </Autorized_Route>,
        errorElement: <ErrorPage />
    },
    {
        path: "/edit_info",
        element:
            <Autorized_Route allowed_roles={['admin','user']}>
                <DashboardWrapper>
                    <EmployeeProvider>
                        <EditInformation />
                    </EmployeeProvider>
                </DashboardWrapper>
            </Autorized_Route>,
        errorElement: <ErrorPage />
    },
    {
        path: "/admin",
        element: 
                <Autorized_Route allowed_roles={['admin']}>
                    <DashboardWrapper>
                            <AdminDashboard/>
                    </DashboardWrapper>
                </Autorized_Route>,
        errorElement: <ErrorPage />
    },
    {
        path: "/add_user",
        element:
            <Autorized_Route allowed_roles={['admin']}>
                <DashboardWrapper>
                        <Register elevation_level={0} isRegister={false}  maxWidth="lg" marginLeft={10}/>
                </DashboardWrapper>
            </Autorized_Route>,
    },
    {
        path: "/unauthorized",
        element: <Unauthorized />,
        errorElement: <ErrorPage />
    },
    {
        path: "/logout",
        element:<Logout/>,
        errorElement: <ErrorPage />
    }
]);