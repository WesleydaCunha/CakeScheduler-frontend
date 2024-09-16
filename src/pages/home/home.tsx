import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { Separator } from "@/components/ui/separator";
import { useDate } from '@/context/DateContext';
import { Navbar } from '@/components/pages/global/NavbarClient';
import { Button } from '@/components/ui/button';
import { api_axios } from '@/lib/axios';

import {
    AlertDialog,
    
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    
} from "@/components/ui/alert-dialog"

import { FcCalculator } from "react-icons/fc";


import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
//import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from '@/components/ui/textarea';
import { DatePickerDemo } from '@/components/datetime';
import { format } from 'date-fns';
import { SelectPaymentMethod, PaymentMethod } from "@/components/pages/scheduling/SelectPaymentMethod";
import { useNavigate } from 'react-router-dom';
import { Model, Filling, Complement, User} from '@/types/types';





export function Home() {
    useDate();
    const { toast } = useToast();

    const [categories, setCategories] = useState<{ category: string, models: Model[] }[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<{ category: string, models: Model[] }[]>([]);
    const [IsModelDialogOpen, setIsModelDialogOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<{ id: number, image: string, cake_name: string } | null>(null);
    const [IsFillingDialogOpen, setIsFillingDialogOpen] = useState(false);
    const [fillings, setFillings] = useState<Filling[]>([]);
    const [selectedFillings, setSelectedFillings] = useState<Filling[]>([]);
    const [IsWeightDialogOpen, setIsWeightDialogOpen] = useState(false);
    const [selectedWeight, setselectedWeight] = useState<number>(0);
    const [IsWeightCalculatorDialogOpen, setIsWeightCalculatorDialogOpen] = useState(false);
    const [IsComplementDialogOpen, setIsComplementDialogOpen] = useState(false);
    const [complements, setComplements] = useState<Complement[]>([]);
    const [selectedComplements, setSelectedComplements] = useState<Complement[]>([]);
    const [IsObservationDialogOpen, setIsObservationDialogOpen] = useState(false);
    const [observation_client, setObservation_client] = useState<String>('');
    const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(new Date());
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod[]>([]);
    const [totalValue, setTotalValue] = useState<number>(0);
    const [user, setUser] = useState<User | null>(null);
    const [IsResumeOpen, setIsResumeOpen] = useState(false);
    const navigate = useNavigate();




    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext must be used within a ThemeProvider');
    }


    const [numberOfPeople, setNumberOfPeople] = useState(0);
    const [piecesPerPerson, setPiecesPerPerson] = useState(0);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);



    function resetState() {
        setselectedWeight(0);
        setNumberOfPeople(0);
        setPiecesPerPerson(0);
        setDeliveryDate(new Date());
        setSelectedModel(null);
        setSelectedFillings([]);
        setSelectedComplements([]);
        setSelectedPaymentMethod([]);
        setTotalValue(0);
    }

   
    

    const getUser = async () => {
        try {
            const token = localStorage.getItem('token_client');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await api_axios.get('/user/profile/client', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data);
            
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao obter usuário'
            });
            console.error('Failed to get user:', error);
        }
    };

        useEffect(() => {
        if (!user) {
            getUser(); 
        }
        }, [user]);

        


        async function handleSave() {
            

            try {
                const formattedDeliveryDate = deliveryDate ? format(deliveryDate, "yyyy-MM-dd'T'HH:mm:ss") : "";

                const requestData = {
                    weight: selectedWeight,
                    delivery_date: formattedDeliveryDate,
                    user: user?.id,
                    cake_model: selectedModel?.id?.toString(),
                    complements: selectedComplements.map(complement => complement.id.toString()),
                    fillings: selectedFillings.map(filling => filling.id.toString()),
                    payment_method: selectedPaymentMethod[0]?.id?.toString(),
                    observation_client: observation_client,
                    status: 'PENDING',
                };
                
                console.log('Request data:', requestData);

                const token = localStorage.getItem('token_client');
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
                    navigate('/my_orders');
                }

            } catch (error) {
                console.error('Failed to save scheduling:', error);
                toast({
                    variant: 'destructive',
                    title: "Erro ao salvar agendamento.",
                });
            }
        }
    
    

    useEffect(() => {
        const weight = numberOfPeople * piecesPerPerson * 0.1;  
        setselectedWeight(weight);
    }, [numberOfPeople, piecesPerPerson]);


    const calculateTotalValue = () => {
        // Find the maximum filling price
        const maxFillingPrice = selectedFillings.reduce((max, filling) =>
            filling.pricePerKg > max ? filling.pricePerKg : max, 0);

        // Calculate the total value of selected complements
        const totalComplementValue = selectedComplements.reduce((total, complement) =>
            total + complement.price, 0);

        // Calculate the total value
        const total = (maxFillingPrice * selectedWeight) + totalComplementValue;

        setTotalValue(total);
    };

    useEffect(() => {
        calculateTotalValue();
    }, [selectedFillings, selectedWeight, selectedComplements]);

    

    const selectComplement = (complement: Complement) => {
        let updatedComplements = [...selectedComplements];

        if (updatedComplements.some(c => c.id === complement.id)) {
            updatedComplements = updatedComplements.filter(c => c.id !== complement.id);
        } else {
            updatedComplements.push(complement);
        }

        setSelectedComplements(updatedComplements);
    };


    

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token_client');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await api_axios.get('/cake/models/category', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const models = response.data;

                if (!Array.isArray(models)) {
                    throw new Error('Data format is incorrect');
                }

                const groupedModels = models.reduce((acc: any, model: Model) => {
                    const category = model.category?.category_name;
                    if (!category) {
                        console.warn('Category name is missing in model', model);
                        return acc;
                    }
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(model);
                    return acc;
                }, {});

                const formattedCategories = Object.keys(groupedModels).map(category => ({
                    category,
                    models: groupedModels[category]
                }));

                setCategories(formattedCategories);
                setFilteredCategories(formattedCategories);

            } catch (error) {
                console.error('Failed to fetch categories and models', error);
            }
        };

        fetchCategories(); 

        const intervalId = setInterval(fetchCategories, 30000); 

        return () => clearInterval(intervalId); 
    }, []);


    


    
    const groupedFillings = fillings.reduce((acc: { [key: string]: Filling[] }, filling: Filling) => {
        const price = filling.pricePerKg;

        const priceKey = Number(price);

        if (!acc[priceKey]) {
            acc[priceKey] = [];
        }
        acc[priceKey].push(filling);
        return acc;
    }, {});


    useEffect(() => {
        const fetchFillings = async () => {
            try {
                const token = localStorage.getItem('token_client');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await api_axios.get("cake/fillings", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFillings(response.data);
            } catch (error) {
                console.error('Failed to fetch Fillings:', error);
            }
        };

        fetchFillings();
    }, []);


    useEffect(() => {
        const fetchComplements = async () => {
            try {
                const token = localStorage.getItem('token_client');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await api_axios.get("cake/complements", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setComplements(response.data);
                console.log('Complements fetched:', response.data); // Adicione este log
            } catch (error) {
                console.error('Failed to fetch complements:', error);
            }
        };

        fetchComplements();
    }, []);


    const handleSchedule = (modelId: number, modelImage: string, cake_name: string) => {
        setSelectedModel({ id: modelId, image: modelImage, cake_name: cake_name });
        setIsModelDialogOpen(true);
    };

    const handleCategoryClick = (category: string) => {
        const filtered = categories.filter(categoryGroup => categoryGroup.category === category);
        setFilteredCategories(filtered);
    };

    const selectFilling = (filling: Filling) => {
        let updatedFillings = [...selectedFillings];

        if (updatedFillings.some(f => f.id === filling.id)) {
            updatedFillings = updatedFillings.filter(f => f.id !== filling.id);
        } else {
            if (updatedFillings.length >= 3) {
                toast({
                    title: "Limite de recheios excedido",
                    description: "Você pode selecionar no máximo 3 recheios.",
                    variant: "destructive",
                });
                return;
            }
            updatedFillings.push(filling);
        }

        setSelectedFillings(updatedFillings);
    };



    
    
    const isWeigthpositive = selectedWeight > 0.099;

    const canProceed = selectedFillings.length >= 1 && selectedFillings.length <= 3;

    
    

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <main className="flex-1 border-s align-top mb-2 bg-secondary-color">
                <Navbar  onCategoryClick={handleCategoryClick} />
                <Separator className='mb-1 bgc' />
                <div className="flex flex-col lg:flex-row gap-6 p-4">
                    <div>
                        <div className='grid'>
                            {filteredCategories.map((categoryGroup) => (
                                <div key={categoryGroup.category} className="mb-8">
                                    <span className="text-xl font-light capitalize  ms-4"> Categoria:
                                        <span className='font-semibold'> {categoryGroup.category}</span></span>
                                    <div className="grid space-x-2 grid-cols-1 sm:grid-cols-2  md:grid-cols-3  xl:grid-cols-4 2xl:grid-cols-5">
                                        {categoryGroup.models.map((model) => (
                                            <div key={model.id} className="border mt-4 rounded-lg p-8 flex flex-col items-center">
                                                <img
                                                    src={model.image}
                                                    alt={model.cake_name}
                                                    className="h-36 w-64 object-cover mb-4"
                                                />
                                                <h3 className="text-lg font-semibold mb-2">{model.cake_name}</h3>
                                                <Button onClick={() => handleSchedule(model.id, model.image, model.cake_name)}  >
                                                    Agendar
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <AlertDialog open={IsModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
                            <AlertDialogContent className="max-h-[90vh] 2lx:min-h-[80%] 2xl:min-w-[50%]  overflow-y-auto">
                                
                                <div className="space-y-4 ">

                                    <Label className='text-xl' htmlFor="model">Deseja escolher esse Modelo ?</Label>
                                    <Separator className='bgc' />
                                    <div className='bg-gray-900 opacity-85 rounded-lg'>
                                        {selectedModel && (
                                            <img className='max-w-72 ms-auto mr-auto ' src={selectedModel.image} alt={`Model ${selectedModel.id}`} />
                                        )}
                                    </div>
                                    

                                </div>
                                <AlertDialogFooter>
                                    <Button variant='destructive' className='mt-2 hover:bg-red-600 p-4 text-md' onClick={() => {
                                        setIsModelDialogOpen(false);
                                    }}>Cancelar</Button>
                                    <Button className='mt-2 text-white bg-blue-600 hover:bg-blue-800 p-4 text-md' onClick={() => {
                                        setIsModelDialogOpen(false),
                                        setIsFillingDialogOpen(true);
                                        
                                    }}>Seguinte</Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog> 

                        <AlertDialog open={IsFillingDialogOpen} onOpenChange={setIsFillingDialogOpen}>
                            <AlertDialogContent className="2lx:min-h-[80%] 2xl:min-w-[50%] max-h-[80vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <Label className='text-xl' htmlFor="fillings">Escolha entre os recheios listados</Label>
                                    <Separator className='bgc' />
                                    <AlertDialogFooter>
                                        <Button variant='destructive' className='mt-2 hover:bg-red-600 p-4 text-md' onClick={() => {
                                            setIsModelDialogOpen(true);
                                            setIsFillingDialogOpen(false);
                                        }}>Voltar</Button>
                                        <Button disabled={!canProceed} className='mt-2 text-md p-4 text-white bg-blue-600 hover:bg-blue-800' onClick={() => {
                                            setIsFillingDialogOpen(false);
                                            setIsWeightDialogOpen(true);
                                        }}>Seguinte</Button>
                                    </AlertDialogFooter>

                                    <div className="flex flex-wrap gap-x-3 ">
                                        {/* Render each price group as a column with a border */}
                                        {Object.keys(groupedFillings).map((price) => (
                                            <div
                                                key={price}
                                                className="flex flex-col  items-start mb-4 border rounded-lg  p-4"
                                            >
                                                <h2 className="text-lg font-semibold mb-2">Valor: R$ {parseFloat(price).toFixed(2)}</h2>
                                                <div className='space-y-2'>
                                                    {groupedFillings[price].map((filling) => (
                                                        <div key={filling.id} className="flex items-center">
                                                            <Checkbox
                                                                id={`filling-${filling.id}`}
                                                                onCheckedChange={() => selectFilling(filling)}
                                                                checked={selectedFillings.some(selected => selected.id === filling.id)}
                                                            />
                                                            <span className='ms-2'>{filling.filling_name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog open={IsWeightDialogOpen} onOpenChange={setIsWeightDialogOpen}>
                            <AlertDialogContent className="2lx:min-h-[80%] 2xl:min-w-[50%] max-h-[80vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <Label className='text-xl' htmlFor="fillings">Defina o peso do bolo</Label>
                                    <Separator className='bgc' />

                                    <div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="weight">Digite o peso do bolo em (KG)</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="10000"
                                                step="0.10"
                                                defaultValue={selectedWeight.toString()}
                                                placeholder="Exemplo: 2,5"
                                                onChange={(e) => setselectedWeight(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className='mt-2'>
                                            <Label className='text-md' htmlFor="calculator">Calculadora de peso</Label>
                                            
                                        </div>
                                        <Button
                                            className='mt-1 bg-slate-300 hover:bg-slate-700 p-6'
                                            onClick={() => {
                                                setIsWeightDialogOpen(false);
                                                setIsWeightCalculatorDialogOpen(true);  
                                            }}
                                            onMouseEnter={() => setIsTooltipVisible(true)}
                                            onMouseLeave={() => setIsTooltipVisible(false)}
                                        >
                                            <FcCalculator className='text-5xl' />
                                        </Button>

                                        {isTooltipVisible && (
                                            <div className="relative">
                                                <span
                                                    className='ms-28 absolute bottom-full left-0 mb-2 p-1 text-sm text-white rounded-xl bg-slate-900  transition-opacity duration-200 hover:opacity-100'
                                                >
                                                    Clique para calcular o peso ideal com base no número de pessoas e pedaços de bolo por pessoa.
                                                </span>
                                            </div>
                                        )}
                                        
                                    </div>
                                </div>

                                <AlertDialogFooter>
                                    <Button
                                        variant='destructive'
                                        className='mt-2 hover:bg-red-600 p-4 text-md'
                                        onClick={() => {
                                            setIsFillingDialogOpen(true);
                                            setIsWeightDialogOpen(false);
                                        }}
                                    >
                                        Voltar
                                    </Button>
                                    <Button
                                        disabled={!isWeigthpositive}
                                        className='mt-2 text-md p-4 text-white bg-blue-600 hover:bg-blue-800'
                                        onClick={() => {
                                            setIsWeightDialogOpen(false);
                                            setIsComplementDialogOpen(true);
                                        }}
                                    >
                                        Seguinte
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                                  
                        <AlertDialog open={IsWeightCalculatorDialogOpen} onOpenChange={setIsWeightCalculatorDialogOpen}>
                            <AlertDialogContent className="2lx:min-h-[80%] 2xl:min-w-[50%] max-h-[80vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <Label className='text-xl' htmlFor="fillings"> Calculadora do peso do bolo</Label>
                                    <Separator className='bgc' />

                                    <div>
                                        <div className="flex flex-col gap-2">
                                            <Label className='text-md' htmlFor="people">Número de Pessoas</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Exemplo: 10"
                                                defaultValue={numberOfPeople}
                                                onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                                            />

                                            <Label className='text-md' htmlFor="piecesPerPerson">Pedaços de bolo por Pessoa</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Exemplo: 2"
                                                defaultValue={piecesPerPerson}
                                                onChange={(e) => setPiecesPerPerson(Number(e.target.value))}
                                            />

                                            <div className="flex flex-col gap-2">
                                                <Label className='text-md' htmlFor="weight">Peso calculado (KG)</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="10000"
                                                    step="0.1"
                                                    value={selectedWeight.toFixed(2)}
                                                    placeholder="Peso calculado"
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                        <div className='mt-4'>
                                            
                                            <div className='mt-2'>
                                                <span className='text-md font-semibold '>Nota: </span>
                                                <span>
                                                     O peso do bolo é calculado com base no número de pessoas e pedaços de bolo por pessoa, multiplicado por 100 gramas(0,1kg) por pedaço.
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <Button variant='destructive' className='mt-2 hover:bg-red-600 p-4 text-md' onClick={() => {
                                        setIsWeightCalculatorDialogOpen(false);
                                        setIsWeightDialogOpen(true);
                                    }}>Voltar</Button>
                                    <Button className='mt-2 text-md p-4 text-white bg-blue-600 hover:bg-blue-800' disabled={!isWeigthpositive} onClick={() => {
                                        setIsComplementDialogOpen(true);
                                        setIsWeightCalculatorDialogOpen(false);
                                    }}>Seguinte</Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        
                        <AlertDialog open={IsComplementDialogOpen} onOpenChange={setIsComplementDialogOpen}>
                            <AlertDialogContent className="2lx:min-h-[80%] 2xl:min-w-[50%] max-h-[80vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <Label className='text-xl' htmlFor="complements">Deseja adicionar algum complemento?</Label>
                                    <Separator className='bgc' />

                                    <AlertDialogFooter>
                                        <Button variant='destructive' className='mt-2 hover:bg-red-600 p-4 text-md' onClick={() => {
                                            setIsComplementDialogOpen(false);
                                            setIsWeightDialogOpen(true);
                                        }}>Voltar</Button>
                                        <Button className='mt-2 text-md p-4 text-white bg-blue-600 hover:bg-blue-800' onClick={() => {
                                            setIsComplementDialogOpen(false);
                                            setIsObservationDialogOpen(true);
                                        }}>Seguinte</Button>
                                    </AlertDialogFooter>

                                    <div className="flex flex-wrap gap-x-3">
                                        {complements.length > 0 ? (
                                            complements.map((complement) => (
                                                <div
                                                    key={complement.id}
                                                    className="flex flex-col  items-start mb-4 border rounded-lg  p-4"
                                                >
                                                    <div className="flex items-center mb-2">
                                                        <Checkbox
                                                            id={`complement-${complement.id}`}
                                                            onCheckedChange={() => selectComplement(complement)}
                                                            checked={selectedComplements.some(selected => selected.id === complement.id)}
                                                        />
                                                        <span className='ms-2'>{complement.complement_name}</span>
                                                    </div>
                                                    <img
                                                        src={complement.image_url}
                                                        alt={complement.complement_name}
                                                        className="h-24 w-24 object-cover rounded-lg"
                                                    />
                                                    <span className='text-sm mt-2'>R$ {complement.price.toFixed(2)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div>Nenhum complemento disponível</div> // 
                                        )}
                                    </div>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog open={IsObservationDialogOpen} onOpenChange={setIsObservationDialogOpen}>
                            <AlertDialogContent className="2lx:min-h-[80%] 2xl:min-w-[50%] max-h-[80vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <Label className='text-xl' htmlFor="complements">Selecione a data de entrega e o Mètodo de pagamento</Label>
                                    <Separator className='bgc' />

                                    {/* Seção de Data de Entrega */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="delivery" className="mb-2">Data da entrega</Label>
                                        <div >
                                            <DatePickerDemo
                                                selected={deliveryDate}
                                                setDate={setDeliveryDate}
                                            />
                                        </div>

                                    </div>
                                    <div>
                                        <Label htmlFor="observation">Observação</Label>
                                        
                                        <Textarea className='mt-2' defaultValue={observation_client.toString()} onChange={(e) => setObservation_client(String(e.target.value))} placeholder="Exemplo: De cor rosa" />
                                    </div>

                                    
                                        {/* Seção de Método de Pagamento */}
                                        <div className="flex flex-col">
                                            <Label htmlFor="payment" className="">Método de Pagamento</Label>
                                            <div className="mt-2">
                                                <SelectPaymentMethod onSelect={setSelectedPaymentMethod} />
                                            </div>
                                        </div>
                                    
                                    
                                    
                                    <AlertDialogFooter>
                                        <Button variant='destructive' className='mt-2 hover:bg-red-600 p-4 text-md' onClick={() => {
                                            setIsObservationDialogOpen(false);
                                            setIsComplementDialogOpen(true);
                                        }}>Voltar</Button>
                                        <Button className='mt-2 text-md p-4 text-white bg-blue-600 hover:bg-blue-800' disabled={selectedPaymentMethod.length === 0} onClick={() => {
                                            setIsObservationDialogOpen(false);
                                            setIsResumeOpen(true);
                                        }}>Seguinte</Button>
                                    </AlertDialogFooter>

                                </div>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog open={IsResumeOpen} onOpenChange={setIsResumeOpen}>
                            <AlertDialogContent className="2lx:min-h-[80%] 2xl:min-w-[50%] max-h-[80vh] overflow-y-auto">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Detalhes do Pedido</AlertDialogTitle>
                                </AlertDialogHeader>
                                <div className="space-y-4">
                                    <Separator />
                                    <AlertDialogFooter>
                                        <Button variant='destructive' className='mt-2 hover:bg-red-600 p-4 text-md' onClick={() => {
                                            setIsResumeOpen(false);
                                            setIsObservationDialogOpen(true);
                                        }}>Voltar</Button>
                                        <Button className='mt-2 text-md p-4 text-white bg-blue-600 hover:bg-blue-800' onClick={() => {
                                            setIsResumeOpen(false);
                                            handleSave();
                                            
                                            
                                        }}>Gerar pedido</Button>
                                    </AlertDialogFooter>

                                    {/* Modelo + Peso + Data de Entrega */}
                                    <div>
                                        <h3 className="text-lg font-semibold">Modelo e Data de Entrega</h3>
                                        <div className="mt-2 flex items-center space-x-4">
                                            <img
                                                src={selectedModel?.image}
                                                alt={selectedModel?.cake_name}
                                                className="w-24 h-24 rounded-lg object-cover"
                                            />
                                            <div className="text-sm text-gray-600">
                                                <p>Modelo: {selectedModel?.cake_name}</p>
                                                <p>Peso: {selectedWeight} kg</p>
                                                <p className="text-sm text-gray-600">
                                                    Recheios:
                                                    {selectedFillings.map((filling, index) => (
                                                        <span key={index}>
                                                            {' '}{filling.filling_name}
                                                            {index < selectedFillings.length - 1 ? ',' : ''}
                                                        </span>
                                                    ))}
                                                </p>
                                                <p>Data de Entrega: {format(new Date(deliveryDate ?? ''), 'dd/MM/yyyy HH:mm')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Complementos */}
                                    {selectedComplements.length > 0 && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h3 className="text-lg font-semibold">Complementos</h3>
                                                <div className="mt-2 space-y-2">
                                                    {selectedComplements.map((complement, index) => (
                                                        <div key={index} className="flex items-center space-x-4">
                                                            <img
                                                                src={complement.image_url}
                                                                alt={complement.complement_name}
                                                                className="w-16 h-16 rounded-lg object-cover"
                                                            />
                                                            <p className="text-sm text-gray-500">
                                                                {complement.complement_name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(complement.price)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {/* Observações do Cliente */}
                                    {observation_client && (
                                        <>
                                            <Separator />
                                            <div>
                                                <h3 className="text-lg font-semibold">Observações</h3>
                                                <p className="mt-2 text-sm text-gray-600">{observation_client}</p>
                                            </div>
                                        </>
                                    )}
                                    {/* Método de Pagamento e Valor Total */}
                                    <Separator />
                                    <div>
                                        <h3 className="text-lg font-semibold">Pagamento</h3>
                                        <div className="mt-2 text-sm text-gray-600">
                                            <p className='text-base'>Método de Pagamento: {String(selectedPaymentMethod[0]?.payment_type)}</p>
                                            <p className='text-base font-semibold'>Valor Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}</p>
                                        </div>
                                    </div>
                                    
                                      
                                </div>
                                
                            </AlertDialogContent>
                        </AlertDialog>


                    </div>

                </div>
            </main>
        </div>
    );
}
    