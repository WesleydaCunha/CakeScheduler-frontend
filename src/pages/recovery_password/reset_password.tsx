
export function ResetPassword() {

    const handleContactSupport = () => {
        window.location.href = "mailto:202303975198@alunos.estacio.br";
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <div className="text-center p-6 bg-white shadow-md rounded-lg w-full max-w-md">
                <img 
                    width={100}
                    height={100}
                    src="https://cdn-icons-png.flaticon.com/512/1082/1082458.png"
                    alt="Under Construction"
                    className="mx-auto mb-4"
                />
                <h1 className="text-2xl font-bold mb-4">Em Desenvolvimento</h1>
                <p className="text-gray-700 mb-4">
                    Esta funcionalidade está em desenvolvimento. No momento, você pode entrar em contato com o suporte para alterar a senha.
                </p>
                <button
                    onClick={handleContactSupport}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
                >
                    Enviar Email para Suporte
                </button>
                <p className="text-gray-500 mt-4">
                    Caso tenha outras dúvidas, sinta-se à vontade para nos contatar por e-mail.
                </p>
            </div>
        </div>
    );
}
