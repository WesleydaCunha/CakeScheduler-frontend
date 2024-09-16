import { useContext, useState } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { Sidebar } from '@/components/pages/global/Sidebar';
//import { Toolbar } from '@material-ui/core';
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { AcceptedOrder } from '@/components/pages/scheduling/AcceptedOrder';
import { PendingOrder } from '@/components/pages/scheduling/PendingOrder';
import { CanceledOrder } from '@/components/pages/scheduling/CanceledOrder';
import { DeliveredOrder } from '@/components/pages/scheduling/DeliveredOrder';
import { useDate } from '@/context/DateContext';
import { SheetDemo } from '@/components/pages/scheduling/CreateScheduling';
import { Navbar } from '@/components/pages/global/Navbar';


export function Scheduling() {
    const { date, setDate} = useDate();

    const [refreshKey, setRefreshKey] = useState(0);

    const handleOrderCreated = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext must be used within a ThemeProvider');
    }

   

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar />
            <main className="flex-1 border-s align-top mb-2 bg-secondary-color">
                <Navbar />
                <Separator className='mb-1 bgc' />
                <div className="flex flex-col lg:flex-row gap-6 p-4">
                    <div className='flex flex-col lg:w-1/4'>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                        />
                        <SheetDemo onOrderCreated={handleOrderCreated}/>
                        
                    </div>
                    <div className='flex flex-col lg:flex-3 border rounded-lg p-4'>
                        <Tabs defaultValue="pendente" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="pendente">Pendente</TabsTrigger>
                                <TabsTrigger value="concluido">Aceito</TabsTrigger>
                                <TabsTrigger value="entregue">Entregue</TabsTrigger>
                                <TabsTrigger value="cancelada">Cancelado</TabsTrigger>
                            </TabsList>
                            <TabsContent value="pendente"><PendingOrder refreshKey={refreshKey} /></TabsContent>
                            <TabsContent value="concluido"><AcceptedOrder refreshKey={refreshKey} /></TabsContent>
                            <TabsContent value="entregue"><DeliveredOrder refreshKey={refreshKey} /></TabsContent>
                            <TabsContent value="cancelada"><CanceledOrder refreshKey={refreshKey} /></TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
