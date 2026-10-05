
# Saber+ Biblioteca

Sistema para gerenciamento interno de uma biblioteca
## Tecnologias utilizadas

- Node
- Express
- prisma
- postgres
- swagger
- bcrypt
- jsonwebtoken
- cors

## Como rodar o projeto

Clone o projeto

```bash
  git clone https://github.com/henriqu3x/biblioteca_simulado_frontend_vf
```

Va para o diretorio do projeto

```bash
  cd biblioteca
```

Instale as dependencias

```bash
  npm install
```

Inicie o servidor

```bash
  npm run dev
```


## Variaveis de ambiente

Para executar esse projeto você precisa adicionar as seguintes variaveis no arquivo .env

`DATABASE_URL`

`JWT_SECRET`


## Iniciação

Para iniciar o projeto rode

```bash
  npm run dev
```


## Arquitetura de pastas

```bash
  /prisma
  /src
    /database
    /middlewares
    /repositories
    /services
    /controllers
    /routes
    /errors
    /models
```
    
## API swagger

#### EndPoint para acessar a documentação

```http
  GET /api/v1/api-docs
```




