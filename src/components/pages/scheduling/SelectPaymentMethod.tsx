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

export interface PaymentMethod {
    id: string;
    payment_type: string;
}

export function SelectPaymentMethod({ onSelect }: { onSelect?: (selected: PaymentMethod[]) => void }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<string | null>(null);
    const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
    const [filteredPaymentMethods, setFilteredPaymentMethods] = React.useState<PaymentMethod[]>([]);

    React.useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                let token = localStorage.getItem('token');
                if (!token) {
                    token = localStorage.getItem('token_client');
                    if (!token) {
                        return;
                    }
                }
                
                

                const response = await api_axios.get('/cake/payment-methods', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const fetchedPaymentMethods: PaymentMethod[] = await response.data;
                setPaymentMethods(fetchedPaymentMethods);
                setFilteredPaymentMethods(fetchedPaymentMethods);
            } catch (error) {
                console.error('Failed to fetch payment methods:', error);
            }
        };

        fetchPaymentMethods();
    }, []);

    const handleSelect = (selectedValue: string) => {
        setValue(selectedValue);
        setOpen(false);
        const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedValue);
        if (selectedPaymentMethod) {
            onSelect?.([selectedPaymentMethod]);
        }
        // Reseta a lista filtrada quando um método de pagamento é selecionado
        setFilteredPaymentMethods(paymentMethods);
    };

    const handleInputChange = (searchValue: string) => {
        setFilteredPaymentMethods(
            paymentMethods.filter(pm =>
                pm.payment_type.toLowerCase().includes(searchValue.toLowerCase())
            )
        );
    };

    const handlePopoverChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // Reseta a lista filtrada e o valor do input quando o Popover fecha
            setFilteredPaymentMethods(paymentMethods);
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
                        ? paymentMethods.find(pm => pm.id === value)?.payment_type
                        : "Selecione um método de pagamento..."}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="min-w-full p-0">
                <Command>
                    <CommandInput
                        placeholder="Pesquisar método de pagamento..."
                        className="h-9"
                        onValueChange={handleInputChange}
                    />
                    <CommandList>
                        <CommandEmpty>Nenhum método de pagamento encontrado.</CommandEmpty>
                        <CommandGroup>
                            {filteredPaymentMethods.map(pm => (
                                <CommandItem
                                    key={pm.id}
                                    value={pm.id}
                                    onSelect={() => handleSelect(pm.id)}
                                >
                                    {pm.payment_type}
                                    <CheckIcon
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === pm.id ? "opacity-100" : "opacity-0"
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
