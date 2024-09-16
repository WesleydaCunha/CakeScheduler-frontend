import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@radix-ui/react-separator";
import { IoAddCircleOutline } from "react-icons/io5";

import { Input } from "@/components/ui/input";
import { api_axios } from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';


interface CreateFillingProps {
    onFillingCreated: () => void;
}

export function CreateFilling({ onFillingCreated }: CreateFillingProps) {
    const [nameFilling, setnameFilling] = useState<string>('');
    const [pricePerKg, setpricePerKg] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameFilling || !pricePerKg) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Por favor, preencha todos os campos."
            });
            return;
        }
        setSubmitError(null);


        try {

            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            await api_axios.post('cake/fillings/register', {
                filling_name: nameFilling,
                pricePerKg: pricePerKg,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast({
                title: "Sucesso!",
                description: "Modelo cadastrado com sucesso"
            });

            setnameFilling('');
            setpricePerKg(null);
            onFillingCreated();
        } catch (error) {
            setSubmitError('Ocorreu um problema ao registrar o Modelo. Tente novamente mais tarde, se persistir contate o suporte!');
            toast({
                variant: "destructive",
                title: "Erro ao cadastrar modelo",
                description: submitError
            });
        }
    };

    return (

        <Sheet>
            <SheetTrigger asChild>
                <Button className="ms-auto hover:bg-slate-600 rounded-xl flex items-center">
                    <IoAddCircleOutline className='text-xl mr-2' />
                    Novo Recheio
                </Button>
            </SheetTrigger>

            <SheetContent className="p-6">

                <SheetHeader>
                    <SheetTitle className="text-center">Cadastrar Recheio</SheetTitle>
                    <SheetDescription>
                        <Separator className="border-b bg-gray-200 my-4" />
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6 py-4">
                        <div>
                            <Label htmlFor="filling_name" className="block text-sm font-medium">Nome do recheio</Label>
                            <Input
                                id="filling_name" placeholder='Ex: Brigadeiro'
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                required
                                value={nameFilling}
                                onChange={(e) => setnameFilling(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="pricePerKG" className="block text-sm font-medium pb-1">Preço por KG</Label>
                            <Input id="pricePerKg" type="number" placeholder='0.00'
                                min="0"
                                max="10000" step="0.01"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                defaultValue={pricePerKg || ''}
                                onChange={(e) => setpricePerKg(e.target.value)}
                                required
                                >
                                
                            </Input>
                        </div>
                    </div>

                    <SheetFooter className="flex justify-center">
                        <SheetClose asChild>
                            <Button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 ms-auto mr-auto p-6 mt-5 text-xl text-white"
                                disabled={!nameFilling || !pricePerKg}
                            >
                                Salvar
                            </Button>

                        </SheetClose>
                    </SheetFooter>
                </form>

            </SheetContent>

        </Sheet>
    );
}
