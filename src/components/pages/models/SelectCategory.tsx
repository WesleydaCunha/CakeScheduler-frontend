import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { IoAddOutline } from "react-icons/io5";
import { AiFillDelete } from "react-icons/ai";
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
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

export interface Category {
    id: string;
    category_name: string;
}

export function SelectCategory({ onSelect }: { onSelect?: (selected: Category[]) => void }) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<string>("");
    const [category, setCategory] = React.useState<Category[]>([]);
    const [filteredCategory, setFilteredCategory] = React.useState<Category[]>([]);

    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const fetchCategory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await api_axios.get('/cake/category', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const fetchedCategory: Category[] = await response.data;
            setCategory(fetchedCategory);
            setFilteredCategory(fetchedCategory);
        } catch (error) {
            console.error('Failed to fetch category:', error);
        }
    };

    React.useEffect(() => {
        fetchCategory();
    }, []);

    const handleSelect = (selectedValue: string) => {
        setValue(selectedValue);
        setOpen(false);
        const selectedCategory = category.find(Category => Category.id === selectedValue);
        if (selectedCategory) {
            onSelect?.([selectedCategory]);
        }
        setFilteredCategory(category);
    };

    const handleInputChange = (searchValue: string) => {
        setFilteredCategory(
            category.filter(Category =>
                Category.category_name.toLowerCase().includes(searchValue.toLowerCase())
            )
        );
    };

    const handlePopoverChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setFilteredCategory(category);
        }
    };

    const createCategory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await api_axios.post('/cake/category/register',
                { category_name: newCategoryName },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

            if (response.status === 200) {
                setIsDialogOpen(false);
                setNewCategoryName("");
                await fetchCategory(); 
                toast({
                    title: "Sucesso!",
                    description: "Categoria criada com sucesso!"
                });
            }
        } catch (error) {
            console.error('Failed to create category:', error);
            toast({
                variant: "destructive",
                title: "Erro ao cadastrar categoria",
            });
        }
    };

    const deleteCategory = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await api_axios.delete(`/cake/category/${value}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                setIsDeleteAlertOpen(false);
                await fetchCategory(); 
                setValue(""); 
                toast({
                    title: "Sucesso!",
                    description: "Categoria deletada com sucesso!"
                });
            }
        } catch (error) {
            console.error('Failed to delete category:', error);
            toast({
                variant: "destructive",
                title: "Erro ao deletar categoria",
            });
        }
    };

    return (
        <div>
            <Popover open={open} onOpenChange={handlePopoverChange}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="2xl:w-[70%] xl:w-[50%] over md:w-[60%] sm:w-[50%]  w-[55%] justify-between"
                    >   
                        <span >
                            {value
                                ? category.find(Category => Category.id === value)?.category_name
                                : "Selecione a categoria..."}
                        </span>
                            
                        
                        
                        <CaretSortIcon className="mt-1 h-4 w-4 ms-auto opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                    <Command>
                        <CommandInput
                            placeholder="Pesquisar Categoria..."
                            className="h-9"
                            onValueChange={handleInputChange}
                        />
                        <CommandList>
                            <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                            <CommandGroup>
                                {filteredCategory.map(Category => (
                                    <CommandItem
                                        key={Category.id}
                                        value={Category.id}
                                        onSelect={() => handleSelect(Category.id)}
                                    >
                                        {Category.category_name}
                                        <CheckIcon
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                value === Category.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <HoverCard>
                <HoverCardTrigger>
                    <Button
                        onClick={() => {
                            setIsDialogOpen(true);
                        }}
                        variant="ghost"
                        className="ms-1"
                    >
                        <IoAddOutline className="text-sm md:text-md xl:text-xl 2xl:text-xl text-green-500" />
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent>Clique para criar uma nova categoria.</HoverCardContent>
            </HoverCard>

            <HoverCard>
                <HoverCardTrigger>
                    <Button
                        onClick={() => {
                            setIsDeleteAlertOpen(true);
                        }}
                        variant="ghost"
                        className="ms-1"
                        disabled={!value}
                    >
                        <AiFillDelete className="text-sm md:text-md xl:text-xl 2xl:text-xl text-red-500" />
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent>Clique para deletar a categoria.</HoverCardContent>
            </HoverCard>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Criar Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Separator />
                        <div>
                            <label htmlFor="category_name" className="block mb-2 text-sm font-medium">
                                Nome da Categoria
                            </label>
                            <Input
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button disabled={!newCategoryName} onClick={createCategory}>Criar Categoria</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deletar Categoria</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja deletar essa categoria?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteCategory}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
