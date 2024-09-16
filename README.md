# Cake-Scheduler

**Cake-Scheduler** é um aplicativo desenvolvido em **Vitejs** e **Java Spring** para cadastro e agendamento de bolos. A plataforma permite que funcionários cadastrem bolos com diversos recheios e métodos de pagamento, enquanto os clientes podem fazer pedidos de maneira fácil e intuitiva.

## Tecnologias Utilizadas

- **Vite.js**: Framework React para desenvolvimento de aplicações web modernas.
- **React**: Biblioteca JavaScript para construção de interfaces de usuário.
- **Tailwind CSS**: Framework CSS para estilização rápida e eficiente.
- **TypeScript**: Superconjunto de JavaScript que adiciona tipos estáticos.
- **Azure Storage**: Serviço de armazenamento usado para gerenciar imagens e outros recursos estáticos.


## Funcionalidades
- **Cadastro de bolos com opções de recheios e complementos.**
- **Gerenciamento de agendamentos para pedidos de bolos.**
- **Interface de cliente para visualizar e fazer pedidos.**
- **Rota de agendamentos para funcionários gerenciarem pedidos.**




## Como Rodar o Projeto

### Pré-requisitos

- Node.js v14+ e npm instalados.


### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/WesleydaCunha/CakeScheduler-frontend
   cd CakeScheduler-frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```
3. Configure o Back-end:
   - Acesse e configure o [Back-end](https://github.com/WesleydaCunha/CakeScheduler-backend)
   


5. Configure as variáveis de ambiente:

   Renomeie o arquivo `.env.exemple`  na raiz do projeto para `.env` com as seguintes variáveis:

   ```bash
   VITE_AZURE_STORAGE_SAS_TOKEN_COMPLEMENT=your_sas_token_for_complements_here
   VITE_AZURE_STORAGE_SAS_TOKEN_MODEL=your_sas_token_for_models_here
   VITE_ACCOUNT_NAME=your_azure_account_name_here
   VITE_BASE_URL=your_backend_url
   ```


6. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

7. Acesse o app em `http://localhost:5173`.

## Contribuição

Se você deseja contribuir com o desenvolvimento do CakeScheduler, siga as etapas abaixo:

1. Faça um fork deste repositório.
2. Crie uma nova branch para a sua feature/bugfix (`git checkout -b feature/nome-da-feature`).
3. Commit suas alterações (`git commit -m 'Add some feature'`).
4. Faça o push para a branch (`git push origin feature/nome-da-feature`).
5. Abra um Pull Request.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---


