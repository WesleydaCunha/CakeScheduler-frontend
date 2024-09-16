import { useState, useEffect, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch } from "react-icons/fa";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { deleteFile } from "@/lib/azureblob";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { FileUploadDropzone } from "@/components/pages/models/FileUploadDropzone";
import { Complement } from "@/pages/home/complement";

interface ListComplementProps {
    refreshKey: number;
}

interface Complement {
    id: number;
    complement_name: string;
    image_url: string;
    price: number;
}

export function ListComplements({ refreshKey }: ListComplementProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [complements, setComplements] = useState<Complement[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedComplement, setSelectedComplement] = useState<Complement | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [imageURL, setImageURL] = useState<string | null>(null);

    // Estados para armazenar os dados do formulário
    const [complementName, setComplementName] = useState("");
    const [complementImageUrl, setComplementImageUrl] = useState("");
    const [price, setPrice] = useState("")

    const deleteComplement = async (id: number, imageUrl: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }


            const response = await api_axios.delete(`cake/complements/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if ((await response).status === 200) {
                toast({
                    title: "Complemento excluído",
                    description: "O complemento e a imagem foram excluídos com sucesso.",
                    variant: "default",
                });
                const url = new URL(imageUrl);
                const fileName = decodeURIComponent(url.pathname.split('/').pop() || '');
                const uploadType: 'complement' | 'model' = 'complement';
                if (fileName) {
                    await deleteFile(fileName, uploadType );
                }
            }

            setComplements(prevComplements => prevComplements.filter(c => c.id !== id));
            
        } catch (error) {
            console.error('Failed to delete complement:', error);
            toast({
                variant: "destructive",
                title: "Erro ao excluir complemento",
                description: "Não foi possível excluir o complemento. Tente novamente mais tarde.",
            });
        }
    };

    useEffect(() => {
        const fetchComplements = async () => {
            try {
                const token = localStorage.getItem('token');
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
            } catch (error) {
                console.error('Failed to fetch complements:', error);
            }
        };

        fetchComplements();
    }, [refreshKey]);

    useEffect(() => {
        if (selectedComplement) {
            setComplementName(selectedComplement.complement_name);
            setComplementImageUrl(selectedComplement.image_url);
            setPrice(selectedComplement.price.toString());
        }
    }, [selectedComplement]);

    const filteredComplements = useMemo(() => complements.filter(c =>
        c.id.toString().includes(searchTerm.toLowerCase()) ||
        c.complement_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.price.toString().includes(searchTerm.toLowerCase())
    ), [searchTerm, complements]);

    const columns: ColumnDef<Complement>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
        },
        {
            accessorKey: "complement_name",
            header: "Nome",
            enableSorting: true,
        },
        {
            id: "image_url",
            header: "Imagem",
            accessorKey: "image_url",
            enableSorting: false,
            cell: info => {
                const imageUrl = info.getValue<string>();
                return (
                    <img
                        src={imageUrl}
                        alt={info.getValue<string>()}
                        className="w-16 h-16 object-cover rounded"
                    />
                );
            }
        },
        {
            accessorKey: "price",
            header: "Preço",
            enableSorting: true,
            cell: info => {
                const price = info.getValue<number>();
                return (
                    <span>R$ {price.toFixed(2)}</span>
                );
            }
        },
        {
            id: "edit",
            header: "Editar",
            cell: info => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        setSelectedComplement(info.row.original);
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
                            <AlertDialogTitle>Deseja excluir esse complemento?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteComplement(info.row.original.id, info.row.original.image_url)}>Deletar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        },
    ], [selectedComplement]);

    const table = useReactTable({
        data: filteredComplements,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    const updateComplement = async (_id: number, previousImageUrl: string) => {
        if (selectedComplement) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

            
                const payload = {
                    complement_name: complementName,
                    image_url: imageURL || complementImageUrl,
                    price: parseFloat(price) 
                };

                
                const response = await api_axios.put(`cake/complements/${selectedComplement.id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if ((await response).status === 200) {
                    if (imageURL && complementImageUrl !== previousImageUrl) {
                    toast({
                        title: "Complemento atualizado",
                        description: "O complemento foi atualizado com sucesso.",
                        variant: "default",
                    });
                        const url = new URL(previousImageUrl);
                    const uploadType: 'complement' | 'model' = 'complement';
                    const fileName = decodeURIComponent(url.pathname.split('/').pop() || '');
                    if (fileName) {
                        await deleteFile(fileName, uploadType);
                    }
                    }
                }

                // Atualiza a lista de complementos localmente
                setComplements(prevComplements => prevComplements.map(complement =>
                    complement.id === selectedComplement.id
                        ? { ...complement, ...payload }
                        : complement
                ));

                

                setIsSheetOpen(false);
            } catch (error) {
                console.error('Failed to update complement:', error);
                toast({
                    variant: "destructive",
                    title: "Erro ao atualizar complemento",
                    description: "Não foi possível atualizar o complemento. Tente novamente mais tarde.",
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
                                                <span>
                                                    {header.column.getIsSorted() === 'asc' ? <IoIosArrowUp /> : header.column.getIsSorted() === 'desc' ? <IoIosArrowDown /> : ''}
                                                </span>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length > 0 ? (
                                    table.getRowModel().rows.map(row => (
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
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">
                                            Nenhum complemento encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                        </Table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </Card>

            {/* Componente Sheet para editar o complemento */}
            {selectedComplement && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent className="p-6">
                        <SheetHeader>
                            <SheetTitle className="text-center">Editar Complemento</SheetTitle>
                            <SheetDescription>
                                <Separator className="border-b bg-gray-200 my-4" />
                            </SheetDescription>
                        </SheetHeader>

                        <form onSubmit={(e) => { e.preventDefault(); updateComplement(selectedComplement.id, selectedComplement.image_url); }}>
                            <div className="flex flex-col gap-6 py-4">
                                <div>
                                    <Label htmlFor="name_complement" className="block text-sm font-medium">Nome do complemento</Label>
                                    <Input
                                        id="name_complement"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        value={complementName}
                                        onChange={(e) => setComplementName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="upload_image" className="block text-sm font-medium pb-1">Upload da Imagem</Label>
                                    <div>
                                        <FileUploadDropzone onUploadURLChange={setImageURL} uploadType="complement" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="price" className="block text-sm font-medium">Preço</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        value={price ?? ''}
                                        onChange={(e) => setPrice(e.target.value.toString())}
                                        required
                                    />
                                </div>
                            </div>

                            <SheetFooter className="flex justify-center">
                                <Button
                                    className="bg-blue-500 ms-auto mr-auto hover:bg-blue-600 p-6 mt-1 text-xl text-white"
                                    type="submit"
                                >
                                    Salvar
                                </Button>
                            </SheetFooter>
                        </form>
                    </SheetContent>
                </Sheet>
            )}
        </>
    );
}
