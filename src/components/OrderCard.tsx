import React from 'react';
import { Order } from '@/types/types'; // Import the centralized type

interface OrderCardProps {
    order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
    // Function to get the status label with color
    const getStatusLabel = (status: Order['orderStatus']) => {
        switch (status) {
            case 'PENDING':
                return { label: 'Pendente', color: 'text-yellow-500' };
            case 'ACCEPTED':
                return { label: 'Aceito', color: 'text-blue-500' };
            case 'DELIVERY':
                return { label: 'Entregue', color: 'text-green-500' };
            case 'CANCELLED':
                return { label: 'Cancelado', color: 'text-red-500' };
            default:
                return { label: 'Desconhecido', color: 'text-gray-500' };
        }
    };

    // Get the status object (label and color)
    const status = getStatusLabel(order.orderStatus);

    return (
        <div className="border rounded-lg p-4 shadow-md mb-2">
            <div className="flex items-center mb-4">
                {/* Display the cake model image */}
                <img
                    src={order.cakeModel.image}
                    alt={order.cakeModel.cake_name}
                    className="w-24 h-24 object-cover rounded-sm mr-4"
                />
                <div className="flex-1">
                    <span className='font-semibold' >
                        Status:&nbsp;
                        <span className={`${status.color}`}>
                             {status.label}
                        </span>
                        
                    </span>
                    <p className="text-lg ">Id_Pedido: #{order.id} </p>
                    <p className="text-sm mt-1">
                        <span className="font-semibold">Modelo Escolhido:</span> {order.cakeModel.cake_name}
                    </p>
                    <p>
                        <span className="font-semibold">Peso:</span> {order.weight} kg
                    </p>
                    <p>
                        <span className="font-semibold">Recheios:</span> {order.fillings.map((filling) => {
                            return "R$" + filling.pricePerKg.toFixed(2) + ' - ' + filling.filling_name;
                        }).join(', ')}
                    </p>
                </div>
            </div>
            <div className="mt-2">
                <p className="text-lg flex justify-end items-end font-bold mt-1">
                    <span className="font-semibold">Total:&nbsp;</span>
                    R$ {order.totalValue.toFixed(2)}
                </p>

                {order.complements.length > 0 && (
                    <div className="mt-2">
                        <span className="font-semibold">Complementos:</span>
                        <ul className="list-disc list-inside">
                            {order.complements.map((complement) => (
                                <li key={complement.id} className="flex items-center mt-1">
                                    <img
                                        src={complement.image_url}
                                        alt={complement.complement_name}
                                        className="w-12 h-12 object-cover rounded mr-2"
                                    />
                                    {complement.complement_name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
