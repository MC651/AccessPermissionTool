import { useEffect, useState } from "react";
import axios from "axios";

const useAdminDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllUsers = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:8000/all');
                setUserInfo(response.data);
                //console.log(response.data);
                setLoading(false);
                setError(null);
            }
            catch (error) {
                setLoading(false);
                setError(error?.response?.data?.detail || "Error on fetching users");
            }
            finally {
                setLoading(false);
            }
        };
        fetchAllUsers();
    }, []);

    return { loading, userInfo, error };
}

export default useAdminDashboard;