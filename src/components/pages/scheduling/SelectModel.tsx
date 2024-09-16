'use client'

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { api_axios } from '@/lib/axios';

export interface Model {
    id: string;
    cake_name: string;
    image: string;
}

export function SelectModel({ onSelect }: { onSelect?: (selected: Model[]) => void }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<string>("");
    const [models, setModels] = React.useState<Model[]>([]);
    const [filteredModels, setFilteredModels] = React.useState<Model[]>([]);

    React.useEffect(() => {
        const fetchModels = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await api_axios.get('/cake/models', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const fetchedModels: Model[] = await response.data;
                setModels(fetchedModels);
                setFilteredModels(fetchedModels);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            }
        };

        fetchModels();
    }, []);

    const handleSelect = (selectedValue: string) => {
        setValue(selectedValue);
        setOpen(false);
        const selectedModel = models.find(model => model.id === selectedValue);
        if (selectedModel) {
            onSelect?.([selectedModel]);
        }
        setFilteredModels(models);
    };

    const handleInputChange = (searchValue: string) => {
        setFilteredModels(
            models.filter(model =>
                model.cake_name.toLowerCase().includes(searchValue.toLowerCase())
            )
        );
    };

    const handlePopoverChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            
            setFilteredModels(models);
        }
    };

    return (
        <Popover open={open} onOpenChange={handlePopoverChange}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? models.find(model => model.id === value)?.cake_name
                        : "Selecione um modelo..."}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="min-w-full p-0">
                <Command>
                    <CommandInput
                        placeholder="Pesquisar modelo..."
                        className="h-9"
                        onValueChange={handleInputChange}
                    />
                    <CommandList>
                        <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
                        <CommandGroup>
                            {filteredModels.map(model => (
                                <CommandItem
                                    key={model.id}
                                    value={model.id}
                                    onSelect={() => handleSelect(model.id)}
                                >
                                    {model.cake_name}
                                    <CheckIcon
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === model.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
