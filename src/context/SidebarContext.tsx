import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface SidebarContextType {
    selectedButton: string;
    setSelectedButton: (button: string) => void;
}

interface SidebarProviderProps {
    children: ReactNode;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
    
    const [selectedButton, setSelectedButton] = useState<string>(() => {
       
        const savedButton = localStorage.getItem('selectedButton');
        return savedButton ? savedButton : ''; 
    });

    
    useEffect(() => {
        localStorage.setItem('selectedButton', selectedButton);
    }, [selectedButton]);

    return (
        <SidebarContext.Provider value={{ selectedButton, setSelectedButton }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebarContext = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebarContext must be used within a SidebarProvider');
    }
    return context;
};
