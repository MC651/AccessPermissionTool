import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Logout: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('fiscal_code');
        localStorage.removeItem('user_name');
        navigate("/login");
    }, [navigate]);

    // No es necesario renderizar nada
    return null;
};

export default Logout;
