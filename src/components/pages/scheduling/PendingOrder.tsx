import { useState, useMemo, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { TbListDetails } from "react-icons/tb";
import { BsFillChatTextFill } from "react-icons/bs";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { api_axios } from "@/lib/axios";
import { useDate } from '@/context/DateContext';
import { format } from 'date-fns';
import { toast } from "@/components/ui/use-toast";

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



interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
}

interface CakeModel {
    id: number;
    cake_name: string;
    image: string;
}

interface Filling {
    id: number;
    filling_name: string;
    pricePerKg: number;
}

interface PaymentMethod {
    id: number;
    payment_type: string;
}

interface Order {
    id: string;
    weight: number;
    deliveryDate: string;
    userClient: User;
    cakeModel: CakeModel;
    complements: any[];
    fillings: Filling[];
    paymentMethod: PaymentMethod;
    observation_client: string | null;
    observation_employee: string | null;
    totalValue: number;
    orderStatus: "PENDING" | "ACCEPTED" | "DELIVERY" | "CANCELLED";
}

interface ListOrderProps {
    refreshKey: number;
}

export function PendingOrder({ refreshKey }: ListOrderProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const { date, formatDate } = useDate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [hasResults, setHasResults] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);


    const fetchOrderDetails = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await api_axios.get(`/orders/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSelectedOrder(response.data);
            setIsDialogOpen(true);
        } catch (error) {
            toast({
                title: "Erro ao buscar os detalhes do pedido.",
                variant: "destructive",
            });
            console.error('Failed to fetch order details:', error);
        }
    };
    
    

    function acceptedOrder(id: string) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        api_axios.patch(`orders/update-status/${id}`, null, {
            params: { status: "ACCEPTED" },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(() => {
                toast({
                    title: "Pedido aceito com sucesso!",
                    variant: "default"
                });
              
                setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
            })
            .catch(error => {
                toast({
                    title: "Erro ao aceitar o pedido.",
                    variant: "destructive",
                    description: error.message
                });
                console.error('Failed to update order status:', error);
            });
    }

    function CancelOrder(id: string) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        api_axios.patch(`orders/update-status/${id}`, null, {
            params: { status: "CANCELLED" },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(() => {
                toast({
                    title: "Pedido cancelado com sucesso!",
                    variant: "default"
                });

                setOrders(prevOrders => prevOrders.filter(order => order.id !== id));
            })
            .catch(error => {
                toast({
                    title: "Erro ao cancelar o pedido.",
                    variant: "destructive",
                    description: error.message
                });
                console.error('Failed to update order status:', error);
            });
    }


    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            if (!date) {

                // modificar rota e logica no back
                const response = await api_axios.get(`orders/by-status?status=PENDING`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const fetchedOrders = response.data;
                setOrders(fetchedOrders);
                setHasResults(fetchedOrders.length > 0);
                return;
            }
            const formattedDate = format(date || new Date(), 'yyyy-MM-dd');
            const response = await api_axios.get(`orders/by-delivery-date?date=${formattedDate}&status=PENDING`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const fetchedOrders = response.data;
            setOrders(fetchedOrders);
            setHasResults(fetchedOrders.length > 0);
        } catch (error) {
            console.error('Failed to fetch Orders:', error);
            setOrders([]);
            setHasResults(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [date, refreshKey]);

    useEffect(() => {
        // Polling para verificar atualizações a cada 30 segundos
        const interval = setInterval(() => {
            fetchOrders();
        }, 30000); // 30 segundos

        // Limpa o intervalo ao desmontar o componente
        return () => clearInterval(interval);
    }, [date, orders]);

    const filteredOrders = useMemo(() =>
        orders.filter(order =>
            order.userClient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userClient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.deliveryDate).toLowerCase().includes(searchTerm.toLowerCase())
        ), [searchTerm, orders]);

    const columns: ColumnDef<Order>[] = useMemo(() => [
        {
            accessorKey: "userClient.name",
            header: "Nome",
        },
        {
            accessorKey: "userClient.phone",
            header: "Telefone",
            cell: info => (
                <div className="flex items-center space-x-3">
                    <span>{info.getValue() as React.ReactNode}</span>
                    <button className="text-blue-500 hover:text-blue-700">
                        <BsFillChatTextFill />
                    </button>
                </div>
            )
        },
        {
            accessorKey: "deliveryDate",
            header: "Horário",
            cell: info => {
                const deliveryDate = info.getValue() as string;
                const dateObj = new Date(deliveryDate);
                return (
                    <span className="text-center justify-center items-center">
                        {date ? format(dateObj, 'HH:mm') : format(dateObj, 'dd-MM-yyyy HH:mm')}
                    </span>
                );
            }
        },
        {
            accessorKey: "totalValue",
            header: "Valor",
            cell: info => (
                <span>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(info.getValue() as number)}
                </span>
            )
        },
        {
            id: "details",
            header: "Detalhes",
            cell: (info) => (
                <button onClick={() => fetchOrderDetails(info.row.original.id)}
                    className="text-blue-500 hover:text-blue-700">
                    <TbListDetails className="text-2xl" />
                </button>
            )
        },
        {
            id: "action",
            header: "Ação",
            cell: (info) => (
                <div className="flex space-x-2">
                    
                        <Button className="text-sm w-full " onClick={() => {
                            setSelectedOrder(info.row.original);
                            setIsAlertOpen(true);
                        }}>
                            Aceitar
                        </Button><Button className="text-sm w-full  bg-red-600 text-white hover:bg-red-800" onClick={() => {
                            setSelectedOrder(info.row.original);
                            setIsCancelAlertOpen(true);
                        }}>Cancelar</Button>
                    
                </div>
            )
        },
    ], [date, refreshKey]);

    

    const table = useReactTable({
        data: filteredOrders,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <TabsContent value="pendente">
            <Card className="p-6 shadow-lg">
                <div>
                    <h2 className="text-2xl font-bold mb-4">{date ? formatDate(date) : 'Nenhuma data selecionada'}</h2>
                    <div className="flex pb-2 w-full max-w-sm items-center space-x-2">
                        <Input
                            type="search"
                            placeholder="Pesquisar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="button">
                            <FaSearch />
                        </Button>
                    </div>

                    <Separator className="mb-2" />
                    <ScrollArea className=" sm:min-w-[650px] lg:min-w-[550px] xl:min-w-[700px] 2xl:min-w-[950px]  h-[350px] ">                
                        {hasResults && filteredOrders.length > 0 ? (
                            <>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id}>
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                        <ScrollBar orientation="horizontal" />
                    </>
                ) : (
                                <div className="text-center text-gray-500">Nenhum pedido encontrado</div>
                )}
                    </ScrollArea>
                </div>
                
            </Card>
            {selectedOrder && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Detalhes do Pedido</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Separator />
                            {/* Usuário */}
                            <div>
                                <h3 className="text-lg font-semibold ">Usuário</h3>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Nome: {selectedOrder.userClient.name}</p>
                                    <p>Telefone: {selectedOrder.userClient.phone}</p>
                                    <p>Email: {selectedOrder.userClient.email}</p>
                                </div>
                            </div>
                            <Separator />
                            {/* Modelo + Peso + Data de Entrega */}
                            <div>
                                <h3 className="text-lg font-semibold">Modelo e Data de Entrega</h3>
                                <div className="mt-2 flex items-center space-x-4">
                                    <img
                                        src={selectedOrder.cakeModel.image}
                                        alt={selectedOrder.cakeModel.cake_name}
                                        className="w-24 h-24 rounded-lg object-cover"
                                    />
                                    <div className="text-sm text-gray-600">
                                        <p>Modelo: {selectedOrder.cakeModel.cake_name}</p>
                                        <p>Peso: {selectedOrder.weight} kg</p>
                                        <p className="text-sm text-gray-600">
                                            Recheios:
                                            {selectedOrder.fillings.map((filling, index) => (
                                                <span key={index}>
                                                    {' '}{filling.filling_name}
                                                    {index < selectedOrder.fillings.length - 1 ? ',' : ''}
                                                </span>
                                            ))}
                                        </p>
                                        <p>Data de Entrega: {format(new Date(selectedOrder.deliveryDate), 'dd/MM/yyyy HH:mm')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Complementos */}
                            {selectedOrder.complements.length > 0 && (
                                <><Separator /><div>
                                    <h3 className="text-lg font-semibold ">Complementos</h3>
                                    <div className="mt-2 space-y-2">
                                        {selectedOrder.complements.map((complement, index) => (
                                            <div key={index} className="flex items-center space-x-4">
                                                <img
                                                    src={complement.image_url}
                                                    alt={complement.complement_name}
                                                    className="w-16 h-16 rounded-lg object-cover" />
                                                <p className="text-sm text-gray-500">
                                                    {complement.complement_name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(complement.price)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div></>
                            )}
                            {/* Observações do Cliente */}
                            {selectedOrder.observation_client && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-lg font-semibold">Observações do Cliente</h3>
                                        <p className="mt-2 text-sm text-gray-600">{selectedOrder.observation_client}</p>
                                    </div>
                                </>
                            )}
                            {/* Observação do Funcionário */}
                            {selectedOrder.observation_employee && (
                                <>
                                    <Separator />
                                    <div>
                                        <h3 className="text-lg font-semibold ">Observação do Funcionário</h3>
                                        <p className="mt-2 text-sm ">{selectedOrder.observation_employee}</p>
                                    </div>
                                </>
                            )}
                            <Separator />
                            {/* Método de Pagamento e Valor Total */}
                            <div>
                                <h3 className="text-lg font-semibold ">Pagamento</h3>
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>Método de Pagamento: {selectedOrder.paymentMethod.payment_type}</p>
                                    <p>Valor Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.totalValue)}</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button className='mt-1' onClick={() => {
                                setIsDialogOpen(false);
                                setIsAlertOpen(true)
                            }}>Aceitar</Button>
                            <Button  onClick={() => {
                                setIsDialogOpen(false);
                                setIsCancelAlertOpen(true)
                            }} className="mt-1 bg-red-600 text-white  hover:bg-red-700">Cancelar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deseja aceitar esse pedido?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação será permanente e não poderar ser alterada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (selectedOrder) {
                                    acceptedOrder(selectedOrder.id);
                                }
                                setIsAlertOpen(false);
                            }}
                        >
                            Aceitar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Deseja cancelar esse pedido?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação será permanente e não poderar ser alterada.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsCancelAlertOpen(false)}>Fechar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (selectedOrder) {
                                    CancelOrder(selectedOrder.id);
                                }
                                setIsCancelAlertOpen(false);
                            }}
                        >
                            Cancelar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
        </TabsContent>
    );
}
