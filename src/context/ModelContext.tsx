// contexts/ModelContext.tsx
import React, { createContext, useState, useContext, useCallback } from 'react';
import { api_axios } from '@/lib/axios';

interface Model {
    id: number;
    cake_name: string;
    image: string;
}

interface ModelContextType {
    models: Model[];
    fetchModels: () => Promise<void>;
    addModel: (newModel: Model) => Promise<void>;
    deleteModel: (modelId: number) => Promise<void>;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [models, setModels] = useState<Model[]>([]);

    const fetchModels = useCallback(async () => {
        try {
            const response = await api_axios.get("cake/models");
            setModels(response.data);
        } catch (error) {
            console.error('Failed to fetch models:', error);
        }
    }, []);

    const addModel = useCallback(async (newModel: Model) => {
        try {
            await api_axios.post('cake/models/register', newModel);
            await fetchModels(); 
        } catch (error) {
            console.error('Failed to add model:', error);
        }
    }, [fetchModels]);

    const deleteModel = useCallback(async (modelId: number) => {
        try {
            await api_axios.delete(`cake/models/${modelId}`);
            await fetchModels(); 
        } catch (error) {
            console.error('Failed to delete model:', error);
        }
    }, [fetchModels]);

    return (
        <ModelContext.Provider value={{ models, fetchModels, addModel, deleteModel }}>
            {children}
        </ModelContext.Provider>
    );
};

export const useModelContext = () => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error('useModelContext must be used within a ModelProvider');
    }
    return context;
};
