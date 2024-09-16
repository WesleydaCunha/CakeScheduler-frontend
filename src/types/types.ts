// types.ts
export interface Order {
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

export interface Model {
    id: number;
    cake_name: string;
    image: string;
    category: Category;
}

export interface Category {
    id: string;
    category_name: string;
}

export interface Filling {
    id: number;
    filling_name: string;
    pricePerKg: number;
}

export interface Complement {
    id: number;
    complement_name: string;
    image_url: string;
    price: number;
}

export interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
}
