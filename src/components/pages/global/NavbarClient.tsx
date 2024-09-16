import {  useNavigate } from 'react-router-dom';
import { toast, useToast } from '@/components/ui/use-toast';
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { AiFillMoon } from "react-icons/ai";
import { IoSunny } from "react-icons/io5";
import { HiUserCircle } from 'react-icons/hi';
import { FaHome } from "react-icons/fa";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button"
import {Dialog, DialogContent,DialogDescription, DialogFooter,DialogHeader, DialogTitle,DialogTrigger,} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { api_axios } from '@/lib/axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaCartShopping } from "react-icons/fa6";
//import { IoNotifications } from "react-icons/io5";



import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { PhoneInput } from '@/components/custom/phone-input';


//import { ListItem } from "@/components/pages/global/ListItem";
//import { Separator } from '@/components/ui/separator';

interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
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

interface NavbarProps {
    onCategoryClick: (category: string) => void;
}


export function EditProfileDialog() {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (open) {
            getUser();
        }
    }, [open]);


    



    

    const getUser = async () => {
        try {
            const token = localStorage.getItem('token_client');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await api_axios.get('/user/profile/client', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Erro ao obter usuário'
            });
        }
    };

    const formik = useFormik({
        initialValues: {
            name: user?.name || '',
            phone: user?.phone || '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Nome é obrigatório'),
            phone: Yup.string().matches(/^\+55\d{11}$/, 'Número de telefone inválido').required('Telefone é obrigatório'),
            password: Yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password')], 'As senhas devem ser iguais')
                .required('Confirmação de senha é obrigatória')
        }),
        onSubmit: async (values) => {
            try {
                const token = localStorage.getItem('token_client');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await api_axios.patch(`/user/profile/client/${user?.id}`, {
                    name: values.name,
                    phone: values.phone,
                    password: values.password
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    toast({
                        title: 'Perfil atualizado',
                        description: 'Suas informações foram atualizadas com sucesso.',
                    });
                    setOpen(false);
                }
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Erro ao atualizar perfil'
                });
            }
        }
    });

    useEffect(() => {
        if (user) {
            formik.setValues({
                name: user.name,
                phone: user.phone,
                password: '',
                confirmPassword: '',
            });
        }
    }, [user]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Editar perfil
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>Atualize suas informações pessoais abaixo:</DialogDescription>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nome</Label>
                        <Input
                            id="name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            placeholder="Digite seu nome"
                        />
                        {formik.touched.name && formik.errors.name ? (
                            <div className="text-red-500 text-sm">{formik.errors.name}</div>
                        ) : null}
                    </div>
                    <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <PhoneInput defaultCountry='BR'
                            value={formik.values.phone}
                            onChange={(value) => formik.setFieldValue('phone', value)}
                            placeholder="Ex: (28) 99999-9999"

                        >
                        </PhoneInput>
                        {formik.touched.phone && formik.errors.phone ? (
                            <div className="text-red-500 text-sm">{formik.errors.phone}</div>
                        ) : null}
                    </div>
                    <div>
                        <Label htmlFor="password">Senha</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            placeholder="Digite sua nova senha"
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <div className="text-red-500 text-sm">{formik.errors.password}</div>
                        ) : null}
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            placeholder="Confirme sua senha"
                        />
                        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                            <div className="text-red-500 text-sm">{formik.errors.confirmPassword}</div>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button type="submit">Salvar alterações</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function Navbar({ onCategoryClick }: NavbarProps) {
    const [categories, setCategories] = useState<{ category: string, models: Model[] }[]>([]);
    const navigate = useNavigate();


    function navigateToMyOrders() {
        navigate('/my_orders');
    }

    function navigateToHome() {
        navigate('/home');
    }


  

  const handleLogout = async () => {
      try {
          localStorage.removeItem('token_client');
          navigate('/');
      } catch (error) {
          toast({
              variant: 'destructive',
              title: 'Erro ao sair',
              description: 'Ocorreu um problema ao sair. Tente novamente mais tarde, se persistir contate o suporte!',
          });
      }
  };




  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
      throw new Error('ThemeContext must be used within a ThemeProvider');
      
  }

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token_client');
            if (!token) {
                console.error('No token found');
                return;
            }
            const response = await api_axios.get('/cake/models/category', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const models = response.data;

            if (!Array.isArray(models)) {
                throw new Error('Data format is incorrect');
            }

            const groupedModels = models.reduce((acc: any, model: Model) => {
                const category = model.category?.category_name;
                if (!category) {
                    console.warn('Category name is missing in model', model);
                    return acc;
                }
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(model);
                return acc;
            }, {});

            const formattedCategories = Object.keys(groupedModels).map(category => ({
                category,
                models: groupedModels[category]
            }));

            setCategories(formattedCategories);
        } catch (error) {
            console.error('Failed to fetch categories and models', error);
        }
    };
  

    useEffect(() => {
        fetchCategories();
    }, []);


    


  const { isDarkMode, toggleDarkMode } = themeContext;

    
    
  return(
    <nav className="flex justify-between items-center p-2">
          {location.pathname === '/my_orders' ? (
              <Button className=' hover:text-blue-500' onClick={navigateToHome} variant="link">
                  <FaHome className="text-2xl" /> 
                  <span className='ms-1'>
                      Home
                  </span>
              </Button>
          ) : (
              <NavigationMenu>
                  <NavigationMenuList>
                      <NavigationMenuItem>
                          <NavigationMenuTrigger className='flex font-bold'>
                              Categorias
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                              <ul className="space-y-2 p-4">
                                  {categories.map((categoryGroup) => (
                                      <li key={categoryGroup.category} className="flex items-center hover:bg-blue-500 p-2 rounded-md">
                                          {categoryGroup.models.length > 0 && (
                                              <button
                                                  onClick={() => onCategoryClick(categoryGroup.category)}
                                                  className="flex items-center hover:bg-blue-500 p-2 rounded-md w-full text-left"
                                              >
                                                  <img
                                                      src={categoryGroup.models[0].image}
                                                      alt={categoryGroup.category}
                                                      className="h-12 w-20 object-cover"
                                                  />
                                                  <span className="mr-24 ms-2 text-lg capitalize">
                                                      {categoryGroup.category}
                                                  </span>
                                              </button>
                                          )}
                                      </li>
                                  ))}
                              </ul>
                          </NavigationMenuContent>
                      </NavigationMenuItem>
                  </NavigationMenuList>
              </NavigationMenu>
          )}
          
        <Button className='ms-auto hover:text-blue-500'  onClick={navigateToMyOrders}  variant="link">
                  <FaCartShopping />
                  <span className='ms-1'>
                      Meus Pedidos
                  </span> 
        </Button>
          {/* <Button className='hover:text-blue-500' variant="link">
              <IoNotifications className='text-xl'/>
          </Button> */}
        
        <button onClick={toggleDarkMode} className="ms-1 p-2 bg-zinc-600  rounded-full  dark:bg-gray-800">

            {isDarkMode ? <IoSunny className='text-yellow-200 text-2xl'/> :  <AiFillMoon className='text-2xl  text-gray-50' /> 
            }
        </button>
        
        <DropdownMenu>
            <DropdownMenuTrigger>
                <HiUserCircle className='hover:text-slate-600 text-5xl' />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <EditProfileDialog />
                <DropdownMenuItem  onClick={handleLogout}>
                    Sair
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </nav>
  )
}