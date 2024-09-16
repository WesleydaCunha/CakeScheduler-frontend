import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api_axios } from '@/lib/axios'; 


export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsAuthenticated(false);
                    setIsChecking(false);
                    navigate('/');
                    return;
                }
                
                const response = await api_axios.get('/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 200) {
                    setIsAuthenticated(true);
                    setIsChecking(false);
                } else {
                    setIsAuthenticated(false);
                    localStorage.removeItem('token');
                    setIsChecking(false);
                    navigate('/');
                }
            } catch (error) {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                setIsChecking(false);
                navigate('/');
            }
        };

        checkAuth();
    }, [navigate]);


    return { isAuthenticated, isChecking };
}


