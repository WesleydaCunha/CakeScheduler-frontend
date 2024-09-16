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
import { FileUploadDropzone } from "@/components/pages/models/FileUploadDropzone";
import { Input } from "@/components/ui/input";
import { api_axios } from '@/lib/axios';
import { toast } from '@/components/ui/use-toast';

interface CreateComplementProps {
    onComplementCreated: () => void;
}

export function CreateComplement({ onComplementCreated }: CreateComplementProps) {
    const [complementName, setComplementName] = useState<string>('');
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [price, setPrice] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!complementName || !imageURL || price === null) {
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

            const response = await api_axios.post('cake/complement/register', {
                complement_name: complementName,
                image_url: imageURL,
                price: price,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status == 200) {
                toast({
                title: "Sucesso!",
                description: "Complemento cadastrado com sucesso"
                });
                setComplementName('');
                setImageURL(null);
                setPrice(null);
                onComplementCreated()
            }
            
            
        } catch (error) {
            setSubmitError('Ocorreu um problema ao registrar o complemento. Tente novamente mais tarde, se persistir contate o suporte!');
            toast({
                variant: "destructive",
                title: "Erro ao cadastrar complemento",
                description: submitError || 'Erro desconhecido. Tente novamente.'
            });
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button className="ms-auto hover:bg-slate-600 rounded-xl flex items-center">
                    <IoAddCircleOutline className='text-xl mr-2' />
                    Novo Complemento
                </Button>
            </SheetTrigger>

            <SheetContent className="p-6">
                <SheetHeader>
                    <SheetTitle className="text-center">Cadastrar Complemento</SheetTitle>
                    <SheetDescription>
                        <Separator className="border-b bg-gray-200 my-4" />
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6 py-4">
                        <div>
                            <Label htmlFor="complement_name" className="block text-sm font-medium">Nome do Complemento</Label>
                            <Input
                                id="complement_name"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                value={complementName}
                                onChange={(e) => setComplementName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="upload_image" className="block text-sm font-medium pb-1">Upload da Imagem</Label>
                            <FileUploadDropzone onUploadURLChange={setImageURL} uploadType="complement" />
                        </div>
                        <div>
                            <Label htmlFor="price" className="block text-sm font-medium">Preço</Label>
                            <Input
                                id="price"
                                type="number"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                required
                                defaultValue={price || ''}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    <SheetFooter className="flex justify-center">
                        <SheetClose asChild>
                            <Button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 ms-auto mr-auto p-6 mt-5 text-xl text-white"
                                disabled={!complementName || !imageURL || price === null}
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
