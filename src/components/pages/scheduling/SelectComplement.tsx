import MultipleSelector, { Option } from '@/components/custom/multiple-selector';
import { useEffect, useState } from 'react';
import { api_axios } from '@/lib/axios';
import { useToast } from '@/components/ui/use-toast'; 

export interface Complements {
    id: string;
    complement_name: string;
    price: string;
    image_url: string;
}

export function SelectComplement({ onSelect }: { onSelect?: (selected: Complements[]) => void }) {
    const [options, setOptions] = useState<Option[]>([]);
    const [complements, setcomplements] = useState<Complements[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchcomplements = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await api_axios.get('/cake/complements', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const fetchedcomplements: Complements[] = await response.data;
                const complementsOptions: Option[] = fetchedcomplements.map((complements) => ({
                    label: complements.complement_name,
                    value: complements.id,
                }));

                setOptions(complementsOptions);
                setcomplements(fetchedcomplements);
            } catch (error) {
                console.error('Failed to fetch complements:', error);
            }
        };

        fetchcomplements();
    }, []);

    const handleChange = (selected: Option[]) => {
        if (selected.length === 10) {
            toast({
                variant: 'default',
                title: "Você atingiu o limite de complementos selecionados. (10)",
            });
        }

        const selectedcomplements = selected.map(option => complements.find(complements => complements.id === option.value)).filter((complements): complements is Complements => !!complements);

        onSelect?.(selectedcomplements);
    };

    return (
        <div className="flex">
            <MultipleSelector
                maxSelected={10}
                options={options}
                onChange={handleChange}
                placeholder="Selecione os complementos adicionais..."
                emptyIndicator={
                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        Resultados não encontrados.
                    </p>
                }
            />
        </div>
    );
}
