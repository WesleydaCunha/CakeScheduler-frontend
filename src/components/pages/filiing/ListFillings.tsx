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
//import { deleteFile } from "@/lib/azureblob";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,

} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

interface ListFillingsProps {
    refreshKey: number;
}
interface Filling {
    id: number;
    filling_name: string;
    pricePerKg: number;
}

export function ListFillings({ refreshKey }: ListFillingsProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [Fillings, setFillings] = useState<Filling[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedFilling, setSelectedFilling] = useState<Filling | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [fillingName, setFillingName] = useState("");
    const [FillingPrice, setFillingPrice] = useState("");

    const deleteFilling = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            await api_axios.delete(`cake/fillings/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setFillings(prevFillings => prevFillings.filter(Filling => Filling.id !== id));

            toast({
                title: "Recheio excluído",
                description: "O recheio e a imagem foram excluídos com sucesso.",
                variant: "default",
            });
        } catch (error) {
            console.error('Failed to delete Filling:', error);
            toast({
                variant: "destructive",
                title: "Erro ao excluir recheio",
                description: "Não foi possível excluir o recheio. Tente novamente mais tarde.",
            });
        }
    };

    useEffect(() => {
        const fetchFillings = async () => {
            try {
                const token = localStorage.getItem('token');
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
    }, [refreshKey]);

    useEffect(() => {
        if (selectedFilling) {
            setFillingName(selectedFilling.filling_name);
            setFillingPrice(selectedFilling.pricePerKg.toString());
        }
    }, [selectedFilling]);

    const filteredFillings = useMemo(() => Fillings.filter(Filling =>
        Filling.id.toString().includes(searchTerm.toLowerCase()) ||
        Filling.filling_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Filling.pricePerKg.toString().includes(searchTerm.toLowerCase())

    ), [searchTerm, Fillings]);

    const columns: ColumnDef<Filling>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
        },
        {
            accessorKey: "filling_name",
            header: "Nome",
            enableSorting: true,
        },
        {
            accessorKey: "pricePerKg",
            header: "Preço por Kg",
            enableSorting: true,
            cell: info => (
                <span>R$ {info.row.original.pricePerKg.toFixed(2)}</span>
            )
        },
        {
            id: "edit",
            header: "Editar",
            cell: info => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        setSelectedFilling(info.row.original);
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
                            <AlertDialogTitle>Deseja excluir esse recheio?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteFilling(info.row.original.id)}>Deletar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        },
    ], [selectedFilling]);

    const table = useReactTable({
        data: filteredFillings,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    // Função para atualizar o Fillingo
    const updateFilling = async () => {
        if (selectedFilling) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                await api_axios.put(`cake/fillings/${selectedFilling.id}`, {
                    filling_name: fillingName,
                    pricePerKg: parseFloat(FillingPrice),
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setFillings(prevFillings => prevFillings.map(Filling =>
                    Filling.id === selectedFilling.id
                        ? { ...Filling, filling_name: fillingName, pricePerKg: parseFloat(FillingPrice) }
                        : Filling
                ));

                toast({
                    title: "Recheio atualizado",
                    description: "O recheio foi atualizado com sucesso.",
                    variant: "default",
                });

                setIsSheetOpen(false);
            } catch (error) {
                console.error('Failed to update Filling:', error);
                toast({
                    variant: "destructive",
                    title: "Erro ao atualizar recheio",
                    description: "Não foi possível atualizar o recheio. Tente novamente mais tarde.",
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
                                            Nenhum recheio encontrado.
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
                        <SheetTitle className="text-center">Editar Recheio</SheetTitle>
                        <SheetDescription>
                            <Separator className="border-b bg-gray-200 my-4" />
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="filling_name">Nome do Recheio</Label>
                            <Input
                                id="filling_name"
                                value={fillingName}
                                onChange={(e) => setFillingName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="filling_price">Preço por Kg</Label>
                            <Input
                                id="filling_price" type="number"
                                step="0.01"
                                min="0"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                value={FillingPrice}
                                onChange={(e) => setFillingPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button onClick={updateFilling}
                            className="bg-blue-500 ms-auto mr-auto hover:bg-blue-600 p-6 mt-5 text-xl text-white"
                            type="submit"
                        >
                            Salvar
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
