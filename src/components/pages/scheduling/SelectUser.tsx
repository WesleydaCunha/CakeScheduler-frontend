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

export interface User {
    id: string;
    email: string;
    name: string;
    phone: string;
}

export function SelectUser({ onSelect }: { onSelect?: (selected: User | undefined) => void }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("");
    const [users, setUsers] = React.useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);

    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await api_axios.get('/user/get', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const fetchedUsers: User[] = response.data;
                setUsers(fetchedUsers);
                setFilteredUsers(fetchedUsers);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        fetchUsers();
    }, []);

    const handleSelect = (currentValue: string) => {
        setValue(currentValue === value ? "" : currentValue);
        setOpen(false);
        const selectedUser = users.find(user => user.email === currentValue);
        onSelect?.(selectedUser);
        // Reseta a lista filtrada quando um usuário é selecionado
        setFilteredUsers(users);
    };

    const handleInputChange = (searchValue: string) => {
        setFilteredUsers(
            users.filter(user =>
                user.name.toLowerCase().includes(searchValue.toLowerCase())
            )
        );
    };

    const handlePopoverChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // Reseta a lista filtrada e o valor do input quando o Popover fecha
            setFilteredUsers(users);
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
                        ? users.find(user => user.email === value)?.name
                        : "Selecione um usuário..."}
                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="min-w-full p-0">
                <Command>
                    <CommandInput
                        placeholder="Pesquisar usuário..."
                        className="h-9"
                        onValueChange={handleInputChange}
                    />
                    <CommandList>
                        <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        <CommandGroup>
                            {filteredUsers.map(user => (
                                <CommandItem
                                    key={user.email}
                                    value={user.email}
                                    onSelect={() => handleSelect(user.email)}
                                >
                                    {user.name}
                                    <CheckIcon
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === user.email ? "opacity-100" : "opacity-0"
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
