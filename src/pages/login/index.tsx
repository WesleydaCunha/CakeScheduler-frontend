import { useContext, useEffect, useState } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { api_axios } from '@/lib/axios';
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useLocation, useNavigate } from 'react-router-dom'; 
import { IoSunny } from 'react-icons/io5';
import { AiFillMoon } from 'react-icons/ai';





export function Login() {
    const { toast } = useToast();
    const navigate = useNavigate(); 
    const location = useLocation();
    const [, setIsAuthenticated] = useState<boolean>(false);
    const [, setIsAuthenticatedClient] = useState<boolean>(false);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
            if (location.pathname === '/') {
                navigate('/agendamentos');
            }
        } 
        const token_client = localStorage.getItem('token_client');
        if (token_client) {
            setIsAuthenticatedClient(true);
            if (location.pathname === '/') {
                navigate('/home');
            }
        }
    }, [navigate, location.pathname]);
        

    
    

    const themeContext = useContext(ThemeContext);

    if (!themeContext) {
        throw new Error('ThemeContext must be used within a ThemeProvider');
    }

    const { isDarkMode, toggleDarkMode } = themeContext;
    const [userType, setUserType] = useState<'cliente' | 'funcionario'>('cliente');

    const handleUserTypeChange = (type: 'cliente' | 'funcionario') => {
        setUserType(type);
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            senha: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Email inválido').required('Email é obrigatório'),
            senha: Yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
        }),


        onSubmit: async (values) => {
            try {
                if (userType === 'cliente') {
                    const response = await api_axios.post('/auth/login_client', {
                        email: values.email,
                        password: values.senha,
                    });

                    const { token } = response.data;
                    localStorage.setItem('token_client', token);
                    localStorage.removeItem('token');
                } else if (userType === 'funcionario') {
                    const response = await api_axios.post('/auth/login', {
                        email: values.email,
                        password: values.senha,
                    });
                    const { token } = response.data;
                    localStorage.setItem('token', token);
                    localStorage.removeItem('token_client');
                }

                navigate('/home'); 
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Erro ao logar com usuário',
                    description: 'Ocorreu um problema logar com usuário. Tente novamente mais tarde, se persistir contate o suporte!',
                    action: <ToastAction altText="Recuperar Senha">Recuperar Senha</ToastAction>,
                });
            }
        },
    });

    return (
        <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen flex items-center justify-center transition-colors duration-300`}>
            <div className="p-6 border-slate-150 border-2 rounded-lg shadow-lg w-full max-w-md">
                <div className='flex justify-between mb-6'>
                    <div className="text-2xl m-auto font-bold"><span className='ms-10'>Login</span></div>
                    <div className=''>
                        <button onClick={toggleDarkMode} className="p-2 justify-end rounded-full bg-gray-200 dark:bg-gray-800">
                            {isDarkMode ? <IoSunny className='text-yellow-200 text-2xl' /> : <AiFillMoon className='text-2xl  text-yellow-500' />
                            }
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleUserTypeChange('cliente')}
                            className={`flex-1 p-2 rounded ${userType === 'cliente' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
                        >
                            Sou Cliente
                        </button>
                        <button
                            onClick={() => handleUserTypeChange('funcionario')}
                            className={`flex-1 p-2 rounded ${userType === 'funcionario' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-800'}`}
                        >
                            Sou Funcionário
                        </button>
                    </div>
                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="exemplo@dominio.com"
                            className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            {...formik.getFieldProps('email')}
                        />
                        {formik.touched.email && formik.errors.email ? (
                            <div className="text-red-500 text-sm">{formik.errors.email}</div>
                        ) : null}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="senha" className="block text-sm font-medium mb-1">Senha</label>
                        <input
                            type="password"
                            id="senha"
                            placeholder="********"
                            className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            {...formik.getFieldProps('senha')}
                        />
                        {formik.touched.senha && formik.errors.senha ? (
                            <div className="text-red-500 text-sm">{formik.errors.senha}</div>
                        ) : null}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300">Entrar</button>
                </form>
                <div className="mt-4 text-center">
                    <a href="/reset-password" className="text-blue-500 hover:underline">Esqueceu sua senha?</a>
                </div>
                <div className="mt-2 text-center">
                    <a href="/register" className="text-blue-500 hover:underline">Não tem uma conta? Cadastre-se</a>    
                </div>
            </div>
        </div>
    );
}
