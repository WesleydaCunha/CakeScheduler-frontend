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
import { SelectUser } from '@/components/pages/scheduling/SelectUser';
import { SelectFilling } from '@/components/pages/scheduling/SelectFilling';
import { SelectComplement } from "@/components/pages/scheduling/SelectComplement";
import { useState } from "react";
import { User } from '@/components/pages/scheduling/SelectUser';
import { Filling } from '@/components/pages/scheduling/SelectFilling';
import { Complements } from '@/components/pages/scheduling/SelectComplement';
import { Model } from '@/components/pages/scheduling/SelectModel'
import { SelectModel } from "@/components/pages/scheduling/SelectModel";
import { SelectPaymentMethod, PaymentMethod } from "@/components/pages/scheduling/SelectPaymentMethod";
import { DatePickerDemo } from "@/components/datetime";
import { Input } from "@/components/ui/input";
import { useToast } from '@/components/ui/use-toast'; 

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import { api_axios } from "@/lib/axios";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea"


interface CreateShedulingProps {
    onOrderCreated: () => void;
}

export function SheetDemo({ onOrderCreated }: CreateShedulingProps) {
    const [selectedUser, setSelectedUser] = useState<User | undefined>();
    const [selectedFillings, setSelectedFillings] = useState<Filling[]>([]);
    const [selectedComplement, setSelectedComplement] = useState<Complements[]>([]);
    const [selectedModel, setSelectedModel] = useState<Model[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod[]>([]);
    const [cakeWeight, setCakeWeight] = useState<number>(0);
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());

    const [observation_client, setObservation_client] = useState<String>('');

    
    

    const [api, setApi] = React.useState<CarouselApi>();
    const [, setCurrent] = React.useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (!api) {
            return;
        }
        setCurrent(api.selectedScrollSnap() + 1);

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    function resetState() {
        setSelectedUser(undefined);
        setSelectedFillings([]);
        setSelectedComplement([]);
        setSelectedModel([]);
        setSelectedPaymentMethod([]);
    }

    const handleSheetOpenChange = (open: boolean) => {
        if (!open) {
            resetState();
        }
        setIsOpen(open);
    };

    function validateFields(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedUser) {
            toast({
                variant: 'destructive',
                title: "Cliente é obrigatório.",
            });
            return false;
        }
        if (selectedFillings.length === 0) {
            toast({
                variant: 'destructive',
                title: "Pelo menos um recheio é obrigatório.",
            });
            return false;
        }
        if (selectedModel.length === 0) {
            toast({
                variant: 'destructive',
                title: "Modelo é obrigatório.",
            });
            return false;
        }
        if (selectedPaymentMethod.length === 0) {
            toast({
                variant: 'destructive',
                title: "Método de pagamento é obrigatório.",
            });
            return false;
        }
        if (cakeWeight <= 0) {
            toast({
                variant: 'destructive',
                title: "Peso do bolo deve ser maior que zero.",
            });
            return false;
        }
        if (!deliveryDate) {
            toast({
                variant: 'destructive',
                title: "Data de entrega é obrigatória.",
            });
            return false;
        }
        return handleSave(e);
    
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        

        try {
            const formattedDeliveryDate = deliveryDate ? format(deliveryDate, "yyyy-MM-dd'T'HH:mm:ss") : "";

            const requestData = {
                weight: cakeWeight,
                delivery_date: formattedDeliveryDate,
                user: selectedUser?.id,
                cake_model: selectedModel[0]?.id?.toString(),
                complements: selectedComplement.map(complement => complement.id.toString()),
                fillings: selectedFillings.map(filling => filling.id.toString()),
                payment_method: selectedPaymentMethod[0]?.id?.toString(),
                observation_client: observation_client,
                order_status: 'ACCEPTED'
            };
           

            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = api_axios.post("/orders/register", requestData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if ((await response).status === 200) {
                toast({
                    variant: 'default',
                    title: "Agendamento realizado com sucesso.",
                });
                resetState();
                setIsOpen(false);
                onOrderCreated()
            }

        } catch (error) {
            console.error('Failed to save scheduling:', error);
            toast({
                variant: 'destructive',
                title: "Erro ao salvar agendamento.",
            });
        }
    }


    return (
        <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
                <Button className="p-4 hover:bg-slate-600 mt-16 rounded-xl flex items-center">
                    <IoAddCircleOutline className='text-xl mr-2' />
                    Novo Agendamento
                </Button>
            </SheetTrigger>

            <SheetContent className="min-w-full">
                <SheetHeader>
                    <SheetTitle>Realizar Agendamento</SheetTitle>
                    <SheetDescription>
                        <Separator className="border-b bg-white" />
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[450px] p-2 ">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Seção do Cliente */}
                        <div className="flex flex-col">
                            <Label htmlFor="name" className="p-2.5">Cliente</Label>
                            <div className="ms-2">
                                <SelectUser onSelect={setSelectedUser} />
                            </div>
                            {selectedUser && (
                                <div className="mt-2">
                                    <div className="ms-2">Email: {selectedUser.email}</div>
                                    <div className="ms-2">Telefone: {selectedUser.phone}</div>
                                </div>
                            )}
                        </div>

                        {/* Seção de Recheios */}
                        <div className="flex flex-col">
                            <Label htmlFor="filling" className="p-2.5">Recheios</Label>
                            <div className="ms-2">
                                <SelectFilling onSelect={setSelectedFillings} />
                            </div>
                            {selectedFillings.length > 0 && (
                                <div className="mt-2">
                                    {selectedFillings.map(filling => (
                                        <div key={filling.id}>
                                            <div className="ms-2 font-semibold">{filling.id} -- {filling.filling_name}</div>
                                            <div className="ms-2 ">Preço por Kg: R$ {filling.pricePerKg}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Seção de Complementos */}
                        <div className="flex flex-col">
                            <Label htmlFor="complement" className="p-2.5">Complementos</Label>
                            <div className="ms-2">
                                <SelectComplement onSelect={setSelectedComplement} />
                            </div>
                            {selectedComplement.length > 0 && (
                                <div className="mt-2">
                                    <Carousel setApi={setApi} className="ms-10 max-w-xs">
                                        <CarouselContent>
                                            {selectedComplement.map(complement => (
                                                <CarouselItem key={complement.id}>
                                                    <Card>
                                                        <CardContent className="flex flex-col items-center justify-center p-4">
                                                            <img
                                                                src={complement.image_url}
                                                                alt={complement.complement_name}
                                                                className="w-full object-cover"
                                                            />
                                                            <div className="mt-1 text-center">
                                                                <span className="text-sm font-semibold">  {complement.complement_name}</span>
                                                            </div>
                                                            <div className="text-center">
                                                                <span className="text-sm font-semibold">R$ {complement.price}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </div>
                            )}
                        </div>

                        {/* Seção de Modelos */}
                        <div className="flex flex-col">
                            <Label htmlFor="model" className="p-2.5">Modelo</Label>
                            <div className="ms-2">
                                <SelectModel onSelect={setSelectedModel} />
                            </div>
                            {selectedModel.length > 0 && (
                                <div className="mt-2">
                                    <Carousel setApi={setApi} className="ms-10 max-w-xs">
                                        <CarouselContent>
                                            {selectedModel.map(model => (
                                                <CarouselItem key={model.id}>
                                                    <Card>
                                                        <CardContent className="flex flex-col items-center justify-center p-4">
                                                            <img
                                                                src={model.image}
                                                                alt={model.cake_name}
                                                                className="w-full object-cover"
                                                            />
                                                            <div className="mt-1 text-center">
                                                                <span className="text-sm font-semibold">{model.cake_name}</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </CarouselItem>
                                            ))}
                                        </CarouselContent>
                                        <CarouselPrevious />
                                        <CarouselNext />
                                    </Carousel>
                                </div>
                            )}
                        </div>

                        {/* Seção de Método de Pagamento */}
                        <div className="flex flex-col">
                            <Label htmlFor="payment" className="p-2.5">Método de Pagamento</Label>
                            <div className="ms-2">
                                <SelectPaymentMethod onSelect={setSelectedPaymentMethod} />
                            </div>
                        </div>

                        {/* Seção de Peso do Bolo */}
                        <div className="flex flex-col">
                            <Label htmlFor="weight" className="p-2.5">Peso do bolo (KG)</Label>
                            <Input
                                type="number"
                                min="0"
                                max="10000"
                                step="0.10"
                                className="w-36 ms-2"
                                placeholder="Exemplo: 2,5 kg"
                                onChange={(e) => setCakeWeight(Number(e.target.value))}
                            />
                        </div>

                        {/* Seção de Data de Entrega */}
                        <div className="flex flex-col">
                            <Label htmlFor="delivery" className="p-2.5">Data da entrega</Label>
                            <div className=" ms-2 x">
                                <DatePickerDemo
                                    selected={deliveryDate}
                                    setDate={setDeliveryDate}

                                />
                            </div>
                            
                        </div>
                        <div className="flex flex-col">
                            <Label htmlFor="delivery" className="p-2.5">Observação</Label>
                            <div className=" ms-2 x">
                                <Textarea onChange={(e) => setObservation_client(String(e.target.value))} placeholder="Observação sobre o pedido..." />
                            </div>

                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter>
                    <SheetClose onClick={resetState} asChild>
                        <Button onClick={validateFields} className="ms-auto mt-2 text-xl mr-auto p-6" type="submit">Salvar</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
