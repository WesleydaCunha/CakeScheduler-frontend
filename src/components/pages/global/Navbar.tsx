import { useNavigate } from 'react-router-dom';
import { toast, useToast } from '@/components/ui/use-toast';
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { AiFillMoon } from "react-icons/ai";
import { IoSunny } from "react-icons/io5";
import { HiUserCircle } from 'react-icons/hi';
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
import { PhoneInput } from '@/components/custom/phone-input';

interface User {
    id: string;
    name: string;
    phone: string;
    email: string;
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
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }

            const response = await api_axios.get('/user/profile', {
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
            phone: Yup.string().matches(/^\+55\d{11}$/, 'Telefone inválido')
                .required('Telefone é obrigatório'),
            password: Yup.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password')], 'As senhas devem ser iguais')
                .required('Confirmação de senha é obrigatória')
        }),
        onSubmit: async (values) => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No token found');
                    return;
                }

                const response = await api_axios.patch(`/user/profile/${user?.id}`, {
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

export function Navbar() {

  const navigate = useNavigate();

  const handleLogout = async () => {
      try {
          localStorage.removeItem('token');
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

  const { isDarkMode, toggleDarkMode } = themeContext;
  
  return(
    <nav className="flex justify-between items-center p-2">
        <button onClick={toggleDarkMode} className="p-2 bg-zinc-600 ms-auto rounded-full  dark:bg-gray-800">

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