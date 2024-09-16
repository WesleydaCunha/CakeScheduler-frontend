import { createContext, useContext, useState, ReactNode } from 'react';

interface DateContextProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    formatDate: (date: Date) => string;
}

const DateContext = createContext<DateContextProps | undefined>(undefined);

export const DateProvider = ({ children }: { children: ReactNode }) => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    const formatDate = (date: Date): string => {
        const daysOfWeek = [
            'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
            'Quinta-feira', 'Sexta-feira', 'Sábado'
        ];
        const monthsOfYear = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        const dayOfWeek = daysOfWeek[date.getDay()];
        const dayOfMonth = date.getDate();
        const month = monthsOfYear[date.getMonth()];
        const year = date.getFullYear();

        return `${dayOfWeek}, ${dayOfMonth} de ${month} de ${year}`;
    };

    return (
        <DateContext.Provider value={{ date, setDate, formatDate }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDate = (): DateContextProps => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error('useDate must be used within a DateProvider');
    }
    return context;
};
