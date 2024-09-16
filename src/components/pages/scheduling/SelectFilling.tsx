import MultipleSelector, { Option } from '@/components/custom/multiple-selector'
import { useEffect, useState } from 'react';
import { api_axios } from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast'; // Adiciona o hook de toast

export interface Filling {
    id: string;
    filling_name: string;
    pricePerKg: string;
}

export function SelectFilling({ onSelect }: { onSelect?: (selected: Filling[]) => void }) {
    const [options, setOptions] = useState<Option[]>([]);
    const [fillings, setFillings] = useState<Filling[]>([]);
    const { toast } = useToast(); 

    useEffect(() => {
        const fetchFillings = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await api_axios.get('/cake/fillings', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const fetchedFillings: Filling[] = await response.data;
                const fillingOptions: Option[] = fetchedFillings.map((filling) => ({
                    label: filling.filling_name,
                    value: filling.id,
                }));

                setOptions(fillingOptions);
                setFillings(fetchedFillings);
            } catch (error) {
                console.error('Failed to fetch fillings:', error);
            }
        };

        fetchFillings();
    }, []);

    const handleChange = (selected: Option[]) => {
        if (selected.length === 3) {
            toast({
                variant: 'default',
                title: "Você atingiu o limite de recheios selecionados. (3)",
            });
        }

        const selectedFillings = selected.map(option => fillings.find(filling => filling.id === option.value)).filter((filling): filling is Filling => !!filling);

        onSelect?.(selectedFillings);
    };

    return (
        <div className="flex">
            <MultipleSelector
                maxSelected={3}
                options={options}
                onChange={handleChange}
                placeholder="Selecione os recheios do bolo..."
                emptyIndicator={
                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        Resultados não encontrados.
                    </p>
                }
            />
        </div>
    );
}
