import { useState, useEffect, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api_axios } from "@/lib/axios";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

interface ListPaymentMethodsProps {
    refreshKey: number;
}

interface PaymentMethod {
    id: number;
    payment_type: string;
}

export function ListPaymentMethods({ refreshKey }: ListPaymentMethodsProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [paymentType, setPaymentType] = useState("");

    const deletePaymentMethod = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            await api_axios.delete(`cake/payment-methods/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setPaymentMethods(prevPaymentMethods => prevPaymentMethods.filter(method => method.id !== id));
            toast({
                title: "Método de pagamento excluído",
                description: "O método de pagamento foi excluído com sucesso.",
                variant: "default",
            });
        } catch (error) {
            console.error('Failed to delete Payment Method:', error);
            toast({
                variant: "destructive",
                title: "Erro ao excluir método de pagamento",
                description: "Não foi possível excluir o método de pagamento. Tente novamente mais tarde.",
            });
        }
    };

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await api_axios.get("cake/payment-methods", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPaymentMethods(response.data);
            } catch (error) {
                console.error('Failed to fetch Payment Methods:', error);
            }
        };

        fetchPaymentMethods();
    }, [refreshKey]);

    useEffect(() => {
        if (selectedPaymentMethod) {
            setPaymentType(selectedPaymentMethod.payment_type);
        }
    }, [selectedPaymentMethod]);

    const filteredPaymentMethods = useMemo(() => paymentMethods.filter(method =>
        method.id.toString().includes(searchTerm.toLowerCase()) ||
        method.payment_type.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm, paymentMethods]);

    const columns: ColumnDef<PaymentMethod>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
        },
        {
            accessorKey: "payment_type",
            header: "Tipo de Pagamento",
            enableSorting: true,
        },
        {
            id: "edit",
            header: "Editar",
            cell: info => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        setSelectedPaymentMethod(info.row.original);
                        setIsSheetOpen(true);
                    }}
                    className="text-green-500 hover:text-green-700"
                >
                    <FaEdit className="text-xl" />
                </Button>
            )
        },
        {
            id: "delete",
            header: "Excluir",
            cell: info => (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="text-red-500 hover:text-red-700">
                            <FaTrashAlt className="text-xl" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Deseja excluir esse método de pagamento?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePaymentMethod(info.row.original.id)}>Deletar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        },
    ], [selectedPaymentMethod]);

    const table = useReactTable({
        data: filteredPaymentMethods,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    // Função para atualizar o método de pagamento
    const updatePaymentMethod = async () => {
        if (selectedPaymentMethod) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                await api_axios.put(`cake/payment-methods/${selectedPaymentMethod.id}`, {
                    payment_type: paymentType,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setPaymentMethods(prevPaymentMethods => prevPaymentMethods.map(method =>
                    method.id === selectedPaymentMethod.id
                        ? { ...method, payment_type: paymentType }
                        : method
                ));

                toast({
                    title: "Método de pagamento atualizado",
                    description: "O método de pagamento foi atualizado com sucesso.",
                    variant: "default",
                });

                setIsSheetOpen(false);
            } catch (error) {
                console.error('Failed to update Payment Method:', error);
                toast({
                    variant: "destructive",
                    title: "Erro ao atualizar método de pagamento",
                    description: "Não foi possível atualizar o método de pagamento. Tente novamente mais tarde.",
                });
            }
        }
    };

    return (
        <>
            <Card className="p-4 shadow-lg">
                <div className="p-4">
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
                    <ScrollArea className="sm:min-w-[650px] lg:min-w-[550px] xl:min-w-[700px] 2xl:min-w-[950px] h-[350px]">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableHead
                                                key={header.id}
                                                onClick={header.column.getToggleSortingHandler()}
                                                className="cursor-pointer"
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: <IoIosArrowUp className="inline-block ml-2" />,
                                                    desc: <IoIosArrowDown className="inline-block ml-2" />,
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length ? (
                                    table.getRowModel().rows.map(row => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            Nenhum método de pagamento encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            </Card>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Editar Método de Pagamento</SheetTitle>
                        <SheetDescription>
                            Atualize as informações do método de pagamento.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="paymentType">Tipo de Pagamento</Label>
                            <Input
                                id="paymentType"
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                            />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button className="mt-2" onClick={() => setIsSheetOpen(false)} variant="outline">
                            Cancelar
                        </Button>
                        <Button className="mt-2" onClick={updatePaymentMethod}>Salvar</Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
