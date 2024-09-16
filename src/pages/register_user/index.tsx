import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { api_axios } from '@/lib/axios';
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { useNavigate } from 'react-router-dom'; 
import { PhoneInput } from '@/components/custom/phone-input';
import { IoSunny } from 'react-icons/io5';
import { AiFillMoon } from 'react-icons/ai';


//import { PhoneInput } from '@/components/custom/phone-input';


export function RegisterUser() {
    const themeContext = useContext(ThemeContext);
    
    const navigate = useNavigate(); 
    const { toast } = useToast()

    if (!themeContext) {
        throw new Error('ThemeContext must be used within a ThemeProvider');
    }

    const { isDarkMode, toggleDarkMode } = themeContext;

    const formik = useFormik({
        initialValues: {
            nome: '',
            telefone: '',
            email: '',
            senha: '',
            confirmarSenha: ''
        },
        validationSchema: Yup.object({
            nome: Yup.string().required('Nome é obrigatório'),
            telefone: Yup.string()
                .matches(/^\+55\d{11}$/, 'Telefone inválido')
                .required('Telefone é obrigatório'),
            email: Yup.string().email('Email inválido').required('Email é obrigatório'),
            senha: Yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória'),
            confirmarSenha: Yup.string()
                .oneOf([Yup.ref('senha')], 'As senhas devem ser iguais')
                .required('Confirmação de senha é obrigatória')
        }),
        onSubmit: async values => {
            try {
                    
                
                    const response = await api_axios.post('/auth/register_client', {
                        name: values.nome,
                        phone: values.telefone,
                        email: values.email,
                        password: values.senha
                    });
                    if (response.status === 200) {
                        toast({
                            title: "Sucesso!",
                            description: "Usuário registrado com sucesso."

                        });
                        navigate('/')
                    }

                
            
            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: "Erro ao registrar o usuário",
                     description: "Ocorreu um problema ao registrar o usuário. Tente novamente mais tarde, se persistir contate o suporte!",
                    action: <ToastAction altText="Tente novemente">Tente novamente</ToastAction>,
                })
                
            }   
        }
    });

    

    return (
        <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen flex items-center justify-center transition-colors duration-300`}>
            <div className="p-6 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between mb-4 items-center">
                    <div className="text-xl m-auto font-bold"><span className='ms-10'>Cadastrar</span></div>
                    <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-800">
                        {isDarkMode ? <IoSunny className='text-yellow-200 text-2xl' /> : <AiFillMoon className='text-2xl  text-yellow-500' />
                        }
                    </button>
                </div>
                <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="nome" className="block text-sm font-medium mb-1">Nome</label>
                        <input
                            type="text"
                            id="nome"
                            placeholder="Ex: João Silva"
                            className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            {...formik.getFieldProps('nome')}
                        />
                        {formik.touched.nome && formik.errors.nome ? (
                            <div className="text-red-500 text-sm">{formik.errors.nome}</div>
                        ) : null}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="telefone" className="block text-sm font-medium mb-1">Telefone</label>
                        <PhoneInput defaultCountry='BR'
                            value={formik.values.telefone}
                            onChange={(value) => formik.setFieldValue('telefone', value)}
                            placeholder="Ex: (28) 99999-9999"

                        >
                        </PhoneInput>
                        {formik.touched.telefone && formik.errors.telefone ? (
                            <div className="text-red-500 text-sm">{formik.errors.telefone}</div>
                        ) : null}
                    </div>

                    <div>
                        
                        
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                          
                            placeholder="Ex: exemplo@dominio.com"
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
                           
                            placeholder="Sua senha"
                            className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            {...formik.getFieldProps('senha')}
                        />
                        {formik.touched.senha && formik.errors.senha ? (
                            <div className="text-red-500 text-sm">{formik.errors.senha}</div>
                        ) : null}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="confirmarSenha" className="block text-sm font-medium mb-1">Confirmação da Senha</label>
                        <input
                            type="password"
                            id="confirmarSenha"
                    
                            placeholder="Confirme sua senha"
                            className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            {...formik.getFieldProps('confirmarSenha')}
                        />
                        {formik.touched.confirmarSenha && formik.errors.confirmarSenha ? (
                            <div className="text-red-500 text-sm">{formik.errors.confirmarSenha}</div>
                        ) : null}
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300">Registrar</button>
                </form>
                <div className="mt-4 text-center">
                    <a href="/" className="text-blue-500 hover:underline">Já tem uma conta? Faça login</a>
                </div>

                
            </div>
        </div>
    );
}
