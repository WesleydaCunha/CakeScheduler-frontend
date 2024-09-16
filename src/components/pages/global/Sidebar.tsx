import { useEffect } from "react";
import {
    HiCalendar,
    HiCamera,
    HiSparkles,
    HiCake,
} from "react-icons/hi";
import { Separator } from "@/components/ui/separator";
import { useSidebarContext } from "@/context/SidebarContext";
import { useNavigate, useLocation } from "react-router-dom";
import { HiCurrencyDollar } from "react-icons/hi2";

export function Sidebar() {
    
    const { selectedButton, setSelectedButton } = useSidebarContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        switch (location.pathname) {
            case "/agendamentos":
                setSelectedButton("Agendamentos");
                break;
            case "/models":
                setSelectedButton("Modelos");
                break;
            case "/recheios":
                setSelectedButton("Recheios");
                break;
            case "/complementos":
                setSelectedButton("Complementos");
                break;
            case "/payment-methods":
                setSelectedButton("PaymentMethod");
                break;
            default:
                setSelectedButton("");
                break;
        }
    }, [location.pathname, setSelectedButton]);



    const handleButtonClick = (buttonName: string) => {
        setSelectedButton(buttonName);

        switch (buttonName) {
            case "Agendamentos":
                navigate("/agendamentos");
                break;
            case "Modelos":
                navigate("/models");
                break;
            case "Recheios":
                navigate("/recheios");
                break;
            case "Complementos":
                navigate("/complementos");
                break;
            case "PaymentMethod":
                navigate("/payment-methods");
                break;
            default:
                navigate("/");
                break;
        }
    };

    return (
        <div>
            <aside className={`bg-primary-color p-2`}>
                <div className={`pt-2 ps-2`}>
                    <span className={` text- flex font-bold pb-4 pt-1 `}>CakeSched  D'Longhi 
                    </span>
                </div>

                <div className="text-secondary-color text-2xl font-bold"></div>
                <Separator className="mb-2" />
                <div className="mt-auto"></div>
                <div className="space-y-4 flex-col flex-1 h-full p-2">
                    <div className="flex items-center">
                        <button
                            className={`flex rounded-lg flex-1 p-2 ${selectedButton === "Agendamentos" ? "bg-blue-500" : "hover:bg-slate-400"} `}
                            onClick={() => handleButtonClick("Agendamentos")}
                        >
                            <HiCalendar className="text-2xl text-secondary-color" />
                            <span  className="ms-2 text-secondary-color">
                                Agendamentos
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center">
                        <button
                            className={`flex rounded-lg flex-1 p-2 ${selectedButton === "Modelos" ? "bg-blue-500" : ""} hover:bg-slate-400`}
                            onClick={() => handleButtonClick("Modelos")}
                        >
                            <HiCamera className="text-2xl text-secondary-color" />
                            <span className="ms-2 text-secondary-color">
                                Modelos
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center">
                        <button
                            className={`flex rounded-lg flex-1 p-2 ${selectedButton === "Recheios" ? "bg-blue-500" : "hover:bg-slate-400"} `}
                            onClick={() => handleButtonClick("Recheios")}
                        >
                            <HiCake className="text-2xl text-secondary-color" />
                            <span className="ms-2 text-secondary-color">
                                Recheios
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center">
                        <button
                            className={`flex rounded-lg flex-1 p-2 ${selectedButton === "Complementos" ? "bg-blue-500" : "hover:bg-slate-400"} `}
                            onClick={() => handleButtonClick("Complementos")}
                        >
                            <HiSparkles className="text-2xl text-secondary-color" />
                            <span className="ms-2 text-secondary-color">
                                Complementos
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center">
                        <button
                            className={`flex rounded-lg flex-1 p-2 ${selectedButton === "PaymentMethod" ? "bg-blue-500" : "hover:bg-slate-400"} `}
                            onClick={() => handleButtonClick("PaymentMethod")}
                        >
                            <HiCurrencyDollar className="text-2xl text-secondary-color" />
                            <span className="ms-2 text-secondary-color">
                                 Pagamentos
                            </span>
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}
