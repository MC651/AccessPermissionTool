import { useState, useEffect } from 'react';
import axios from 'axios';

export const UserInfo = <T,>():[boolean, T | null] => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error("No token found!");
        //setError("No token found");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get('http://localhost:8000/my_info/', {
          headers: {
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
          }
        });
        setUserInfo(response.data); // Usamos axios para obtener los datos directamente
        //setError(null); // Limpiamos cualquier error anterior
      } catch (error) {
        //setError(error?.response?.data?.message || 'Error fetching user info'); // Capturamos el mensaje de error, si existe
        console.error(error);
      } finally {
        setLoading(false); // Terminamos la carga
      }
    };

    fetchUserInfo(); // Ejecutamos la función
    }, []); // El efecto se ejecutará cada vez que la URL cambie
    return [loading, userInfo]; // El arreglo vacío asegura que solo se ejecute cuando el componente se monte
};



