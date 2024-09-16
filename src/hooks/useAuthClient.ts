import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api_axios } from '@/lib/axios';


export function useAuthClient() {
    const [isAuthenticatedClient, setIsAuthenticatedClient] = useState<boolean>(false);
    const [isCheckingClient, setIsCheckingClient] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('token_client');
                if (!token) {
                    setIsAuthenticatedClient(false);
                    setIsCheckingClient(false);
                    navigate('/');
                    return;
                }

                const response = await api_axios.get('/user', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 200) {
                    setIsAuthenticatedClient(true);
                    setIsCheckingClient(false);
                } else {
                    setIsAuthenticatedClient(false);
                    localStorage.removeItem('token_client');
                    setIsCheckingClient(false);
                    navigate('/');
                }
            } catch (error) {
                setIsAuthenticatedClient(false);
                localStorage.removeItem('token_client');
                setIsCheckingClient(false);
                navigate('/');
            }
        };

        checkAuth();
    }, [navigate]);


    return { isAuthenticatedClient, isCheckingClient };
}


