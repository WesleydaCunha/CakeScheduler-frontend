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

//import { Trash2 as RemoveIcon } from "lucide-react";

import { FileUploadDropzone } from "@/components/pages/models/FileUploadDropzone";
import { Category } from "@/components/pages/models/SelectCategory";
import { SelectCategory } from "@/components/pages/models/SelectCategory";
interface ListModelsProps {
    refreshKey: number;
}

interface Model {
    id: number;
    cake_name: string;
    image: string;
    category: Category;
}

export function ListModels({ refreshKey }: ListModelsProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [models, setModels] = useState<Model[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedModel, setSelectedModel] = useState<Model | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category[]>([]);


    
    

    
    // Estados para armazenar os dados do formulário
    const [cakeName, setCakeName] = useState("");
    const [imageUrl, setImageUrl] = useState("");


    const deleteModel = async (id: number, imageUrl: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const url = new URL(imageUrl);
            const fileName = decodeURIComponent(url.pathname.split('/').pop() || '');
            const uploadType: 'complement' | 'model' = 'model';
            if (fileName) {
                await deleteFile(fileName, uploadType);
            }

            await api_axios.delete(`cake/models/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setModels(prevModels => prevModels.filter(model => model.id !== id));
            toast({
                title: "Modelo excluído",
                description: "O modelo e a imagem foram excluídos com sucesso.",
                variant: "default",
            });
        } catch (error) {
            console.error('Failed to delete model:', error);
            toast({
                variant: "destructive",
                title: "Erro ao excluir modelo",
                description: "Não foi possível excluir o modelo. Tente novamente mais tarde.",
            });
        }
    };

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }
                const response = await api_axios.get("cake/models", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setModels(response.data);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            }
        };

        fetchModels();
    }, [refreshKey]);

    useEffect(() => {
        if (selectedModel) {
            setCakeName(selectedModel.cake_name);
            setImageUrl(selectedModel.image);
            setSelectedCategory([selectedModel.category]);
        }
    }, [selectedModel]);

    const filteredModels = useMemo(() => models.filter(model =>
        model.id.toString().includes(searchTerm.toLowerCase()) ||
        model.cake_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.category.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm, models]);

    const columns: ColumnDef<Model>[] = useMemo(() => [
        {
            accessorKey: "id",
            header: "ID",
            enableSorting: true,
        },
        {
            accessorKey: "cake_name",
            header: "Nome",
            enableSorting: true,
        },
        {
            accessorKey: "category.category_name",
            header: "Categoria",
            enableSorting: true,
        },
        {
            id: "image",
            header: "Imagem",
            accessorKey: "image",
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
            id: "edit",
            header: "Editar",
            cell: info => (
                <Button
                    variant="ghost"
                    onClick={() => {
                        setSelectedModel(info.row.original);
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
                            <AlertDialogTitle>Deseja excluir esse Modelo?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteModel(info.row.original.id, info.row.original.image)}>Deletar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )
        },
    ], [selectedModel]);

  

    const table = useReactTable({
        data: filteredModels,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    // Função para atualizar o modelo
    const updateModel = async (_id: number, previousImageUrl: string) => {
        if (selectedModel) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await api_axios.put(`cake/models/${selectedModel.id}`, {
                    cake_name: cakeName,
                    image: imageURL || imageUrl,
                    category: selectedCategory[0]?.id?.toString(),
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    // Verifica se há uma nova URL de imagem e se é diferente da imagem anterior
                    if (imageURL && imageURL !== previousImageUrl) {
                        const url = new URL(previousImageUrl);
                        const fileName = decodeURIComponent(url.pathname.split('/').pop() || '');
                        const uploadType: 'complement' | 'model' = 'model';
                        if (fileName) {
                            await deleteFile(fileName, uploadType);
                        }
                    }

                    toast({
                        title: "Modelo atualizado",
                        description: "O modelo foi atualizado com sucesso.",
                        variant: "default",
                    });

                    // Atualiza a lista de modelos no estado
                    setModels(prevModels => prevModels.map(model =>
                        model.id === selectedModel.id
                            ? { ...model, cake_name: cakeName, image: imageURL || previousImageUrl, category: selectedCategory[0] }
                            : model
                    ));

                    // Reseta os estados relacionados ao formulário de edição
                    setIsSheetOpen(false);
                    setSelectedModel(null);
                    setCakeName("");
                    setImageURL(null);
                    setSelectedCategory([]);
                }
            } catch (error) {
                console.error('Erro ao atualizar o modelo:', error);
                toast({
                    variant: "destructive",
                    title: "Erro ao atualizar modelo",
                    description: "Não foi possível atualizar o modelo. Tente novamente mais tarde.",
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
                                            Nenhum modelo encontrado.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>

                            
                        </Table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
            </Card>

            {/* Componente Sheet para editar o modelo */}
            {selectedModel && (
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent className="p-6">
                        <SheetHeader>
                            <SheetTitle className="text-center">Editar Modelo</SheetTitle>
                            <SheetDescription>
                                <Separator className="border-b bg-gray-200 my-4" />
                            </SheetDescription>
                        </SheetHeader>

                        
                            <div className="flex flex-col gap-6 py-4">
                                <div>
                                    <Label htmlFor="name_model" className="block text-sm font-medium">Nome do bolo</Label>
                                    <Input
                                        id="name_model"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                                        value={cakeName}
                                        onChange={(e) => setCakeName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="upload_image" className="block text-sm font-medium pb-1">Upload da Imagem</Label>
                                    

                                    <div >
                                        <FileUploadDropzone onUploadURLChange={setImageURL}  uploadType = "model" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="upload_image" className="block text-sm font-medium pb-1">Selecione uma categoria</Label>
                                <SelectCategory onSelect={setSelectedCategory} />
                                </div>
                            </div>

                            <SheetFooter className="flex justify-center">
                            <Button onClick={(e) => {e.preventDefault(); updateModel(selectedModel.id, selectedModel.image) }}
                                    disabled={!cakeName || !selectedCategory}
                                    className="bg-blue-500 ms-auto mr-auto hover:bg-blue-600 p-6 mt-1 text-xl text-white"
                                    type="submit"
                                >
                                    Salvar
                                </Button>
                            </SheetFooter>
                        
                    </SheetContent>
                </Sheet>
            )}
        </>
    );
}
