// setUser.ts

import { api_axios } from '@/lib/axios';

export const fetchUserWithFallback = async (token: string) => {
    
    try {
        const response = await api_axios.get('/user/profile/client', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch user with token:', error);
        throw error;
    }
};
