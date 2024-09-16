import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { Separator } from "@/components/ui/separator";
import { useDate } from '@/context/DateContext';
import { Navbar } from '@/components/pages/global/NavbarClient';
import { api_axios } from '@/lib/axios';
import { useToast } from "@/components/ui/use-toast";
import OrderCard from '@/components/OrderCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { fetchUserWithFallback } from '@/hooks/setUser'; // Importe a função aqui

interface Order {
    id: string;
    weight: number;
    deliveryDate: string;
    userClient: User;
    cakeModel: Model;
    complements: Complement[];
    fillings: Filling[];
    paymentMethod: PaymentMethod;
    observation_client: string | null;
    observation_employee: string | null;
    totalValue: number;
    orderStatus: "PENDING" | "ACCEPTED" | "DELIVERY" | "CANCELLED";
}

interface Model {
    id: number;
    cake_name: string;
    image: string;
    category: Category;
}

interface Category {
    id: string;
    category_name: string;
}

interface Filling {
    id: number;
    filling_name: string;
    pricePerKg: number;
}

interface Complement {
    id: number;
    complement_name: string;
    image_url: string;
    price: number;
}

interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
}

interface PaymentMethod {
    id: string;
    name: string;
}

export function MyOrders() {
    const { toast } = useToast();
    const { date } = useDate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [user, setUser] = useState<User | null>(null);

    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext must be used within a ThemeProvider');
    }

    const fetchOrders = async (userId: string) => {
        try {
            const token = localStorage.getItem('token_client');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await api_axios.get(`/orders/by-user?userId=${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const fetchedOrders = response.data;
            console.log('Fetched orders:', fetchedOrders);
            setOrders(fetchedOrders);
        } catch (error) {
            console.error('Failed to fetch Orders:', error);
            setOrders([]);
        }
    };

    const getUser = async () => {
        try {
            const token = localStorage.getItem('token_client');
            if (!token) {
                console.error('No token found');
                return;
            }

            const userData = await fetchUserWithFallback(token);
            setUser(userData);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao obter usuário'
            });
            console.error('Failed to get user:', error);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        if (user?.id) {
            fetchOrders(user.id);
        }
    }, [user, date]); 

    useEffect(() => {
        const interval = setInterval(() => {
            if (user?.id) {
                fetchOrders(user.id);
            }
        }, 30000); 

        return () => clearInterval(interval);
    }, [user]);

    const groupOrdersByDate = (orders: Order[]) => {
        const sortedOrders = orders.sort((a, b) => {
            const dateA = new Date(a.deliveryDate).getTime();
            const dateB = new Date(b.deliveryDate).getTime();
            return dateB - dateA;
        });

        return sortedOrders.reduce((groupedOrders: Record<string, Order[]>, order) => {
            const dateObj = new Date(order.deliveryDate);
            if (isNaN(dateObj.getTime())) {
                console.error('Invalid date format:', order.deliveryDate);
                return groupedOrders;
            }

            const dateKey = format(dateObj, "dd-MMMM-yyyy HH:mm");

            if (!groupedOrders[dateKey]) {
                groupedOrders[dateKey] = [];
            }
            groupedOrders[dateKey].push(order);
            return groupedOrders;
        }, {});
    };

    const formatDateToFullMonth = (dateStr: string) => {
        const dateObj = new Date(dateStr);

        if (isNaN(dateObj.getTime())) {
            console.error('Invalid date:', dateStr);
            return 'Data inválida';
        }
        return format(dateObj, "dd MMMM yyyy, EEEE, HH:mm", { locale: ptBR });
    };

    const groupedOrders = groupOrdersByDate(orders);

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <main className="flex-1 border-s align-top mb-2">
                <Navbar onCategoryClick={() => { /* Implementar se necessário */ }} />
                <Separator className='mb-1' />
                <div className="p-6">
                    {Object.entries(groupedOrders).map(([date, ordersForDate]) => (
                        <article key={date} className="mb-6">
                            <h2 className="text-xl font-bold mb-2">{formatDateToFullMonth(date)}</h2>
                            <Separator className="mb-4" />
                            <div>
                                {ordersForDate.map(order => (
                                    <OrderCard key={order.id} order={order} />
                                ))}
                            </div>
                        </article>
                    ))}
                    {orders.length === 0 && (
                        <p className="text-center text-gray-600">Você ainda não tem pedidos.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
