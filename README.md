# API Rest NestJS Rick and Morty

Bienvenido a la NestJS Rick and Morty consumer API.

## Prerrequisitos

Antes de empezar, asegurate de tener lo siguiente instalado: 
* Node.js (version >= 16) 
* npm (con Node.js)
* PostgreSQL
* Git 

## Configuración

Clona el repositorio

```
git clone https://github.com/jorge-ld8/nestjs-api-rick-morty nestjs-api-rick-morty
cd nestjs-api-rick-morty
```

Instala las  Dependencias
```
npm install
```

Setup variables de entorno
Crea un archivo .env en la raiz de tu proyecto y configura las siguientes variables de entorno.

```
cp .env.example .env

```

Configura la string de conexion de acuerdo a tus credenciales

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mydb

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public
```

Ejecuta las migraciones de la base de datos

```
npx prisma migrate dev
```

Corre el seed para llenar la base de datos
```
npx prisma db seed
```

Ejecute la aplicacion
```
npm run start
```

## Documentacion
Para ver e interactuar con la API usando Swagger: 
http://localhost:3000/api-docs





