import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Login } from './pages/login/index';
import { RegisterUser } from "./pages/register_user";
import { Scheduling } from "./pages/home";
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProtectedRouteClient } from '@/components/ProtectedRouteClient';
import { DateProvider } from '@/context/DateContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { Model } from "./pages/home/model";
import { Filling } from "./pages/home/filling";
import { Complement } from "./pages/home/complement";
import { PaymentMethod } from "./pages/home/payment_method";
import { Home } from "./pages/home/home";
import { MyOrders } from "./pages/home/my_orders";
import { ResetPassword } from "./pages/recovery_password/reset_password";





const router = createBrowserRouter([
  {
    path: "/",
    element: 
      <Login/>
  },
  {
    path: "/register",
    element: <RegisterUser />
  },
  {
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/agendamentos",
    element: (
      <ProtectedRoute>
        <Scheduling/>
      </ProtectedRoute>
    )
  },
  
  
  {
    path: "/models",
    element: (
      <ProtectedRoute>
        <Model />
      </ProtectedRoute>
    )
  },
  {
    path: "/recheios",
    element: (
      <ProtectedRoute>
        <Filling />
      </ProtectedRoute>
    )
  },
  {
    path: "/complementos",
    element: (
      <ProtectedRoute>
        <Complement />
      </ProtectedRoute>
    )
  },
  {
    path: "/payment-methods",
    element: (
      <ProtectedRoute>
        <PaymentMethod />
      </ProtectedRoute>
    )
  },
  {
    path: "/home",
    element: (
      <ProtectedRouteClient>
        <Home />
      </ProtectedRouteClient>
    )
  },
  {
    path: "/my_orders",
    element: (
      <ProtectedRouteClient>
        <MyOrders  />
      </ProtectedRouteClient>
    )
  },


]);

export function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <DateProvider>
          
          <RouterProvider router={router} />
          
        </DateProvider>
      </SidebarProvider>
      <Toaster />
    </ThemeProvider>
  );
}
