//import { useContext, useState } from 'react';

import { Sidebar } from '@/components/pages/global/Sidebar';
//import { Toolbar } from '@material-ui/core';
import { Separator } from "@/components/ui/separator";

//import { Button } from '@/components/ui/button';
//import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ListPaymentMethods } from '@/components/pages/payments/ListPaymentMethod';
//import { useDate } from '@/context/DateContext';
//import { IoAddCircleOutline } from "react-icons/io5";
import { Navbar } from "@/components/pages/global/Navbar";

import { useState } from 'react';
import { CreatePaymentMethod } from '@/components/pages/payments/CreatePaymentMethod';



export function PaymentMethod() {

    const [refreshKey, setRefreshKey] = useState(0);

    const handlePaymentCreated = () => {
        setRefreshKey(prevKey => prevKey + 1);  
    };
    
    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar />
            <main className="flex-1 border-s align-top mb-2 bg-secondary-color">
                <Navbar />
                <Separator className='mb-1 bgc' />
                <div className="flex p-3">
                    <CreatePaymentMethod onPaymentMethodCreated={handlePaymentCreated} />
                </div>
                <div className='p-4'>
                    <ListPaymentMethods refreshKey={refreshKey} />
                </div>
                
            </main>
        </div>
    );
}