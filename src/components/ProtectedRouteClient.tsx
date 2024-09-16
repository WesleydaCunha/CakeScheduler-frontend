import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthClient } from '@/hooks/useAuthClient';

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRouteClient = ({ children }: ProtectedRouteProps) => {
    const isAuthenticatedClient = useAuthClient();
    
    if (!isAuthenticatedClient) {
        return <Navigate to="/" />;
    }
    

    
    return <>{children}</>;
};


