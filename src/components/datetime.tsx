import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";


import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export interface DatePickerProps {
    selected: Date | undefined;
    setDate: (date: Date) => void;
    initialFocus?: boolean;
}

import { DatetimePicker } from "@/components/ui/datetime-picker";
import { Separator } from "./ui/separator";


export function DatePickerDemo({ selected, setDate }: DatePickerProps) {

    const formatDate = (date: Date) => {
        return format(date, "dd MMMM yyyy, EEEE, HH:mm", { locale: ptBR });
    };

    

    return (
        <AlertDialog >
            <AlertDialogTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[290px] justify-start text-left font-normal",
                        !selected && "text-muted-foreground",
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selected ? formatDate(selected) : <span>Escolha uma data</span>}
                </Button>
            </AlertDialogTrigger>
                
            <AlertDialogContent
                
                className="max-w-[400px] ms-auto p-4 max-h-[650px] "
            >
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-center">Defina a data de entrega</AlertDialogTitle>
                    <Separator/>
                </AlertDialogHeader>
                <div className="rounded-xl" >

                    <DatetimePicker
                        selected={selected}
                        setDate={setDate}
                        initialFocus
                    />
                </div>
                <AlertDialogFooter className="w-full flex justify-center">
                    <AlertDialogAction className="w-full  max-w-[350px]">Salvar</AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
}
