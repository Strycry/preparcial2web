  # API REST - Planificación de Viajes (NestJS)

  Este repositorio contiene una API REST en NestJS para gestionar planes de viaje. El proyecto incluye:
  - Módulo interno `CountriesModule` con caché local de países (MongoDB).
  - Módulo público `TravelPlansModule` para crear/listar/consultar/eliminar planes y añadir gastos embebidos.
  - Módulo `UsersModule` para gestionar propietarios de planes.

  ## Guía de instalación y ejecución

  Requisitos: Node.js, npm, Docker (opcional) y MongoDB.

  1. Instalar dependencias:

  ```bash
  npm install
  ```

  2. Levantar MongoDB (opcional con Docker):

  ```bash
  docker run -d --name mongo -p 27017:27017 mongo:6.0
  ```

  3. Ejecutar la API en modo desarrollo:

  ```bash
  npm run start:dev
  ```

  El servidor escucha por defecto en `http://localhost:3000`.

  ## Arquitectura y flujo de caché

  - `CountriesModule` (sin controladores HTTP): mantiene una colección `countries` en MongoDB. Cuando se necesita un país por código Alpha-3 el flujo es: buscar en la colección local -> si no existe, consumir RestCountries API -> guardar resultado en `countries` -> retornar datos al consumidor.
  - `TravelPlansModule`: expone endpoints públicos y al crear un plan solicita a `CountriesService` resolver el país antes de persistir el plan.
  - `UsersModule`: colección `users` para validar la existencia del propietario (`userId`) al crear planes.

  ## Endpoints principales (resumen)

  - `POST /users` -> crear usuario (body: `{ "name": "...", "email": "..." }`).
  - `POST /travel-plans` -> crear plan (body incluye `userId` y `countryAlpha3`).
  - `POST /travel-plans/:id/expenses` -> añadir gasto embebido al plan (body: `{ description, amount, category }`).
  - `GET /travel-plans` -> listar planes.
  - `GET /travel-plans/:id` -> detalle de plan (incluye `expenses`).
  - `DELETE /travel-plans/:id` -> eliminar plan.

  Para las rutas que afectan datos se recomienda enviar el header `x-user-id` con el id del usuario que realiza la petición (el middleware registra accesos).

  ## Ejemplos JSON para Postman

  1) Crear usuario

  POST http://localhost:3000/users
  Body (JSON):
  ```json
  {
    "name": "Juan Perez",
    "email": "juan@example.com"
  }
  ```

  2) Crear plan (usar `userId` devuelto al crear usuario)

  POST http://localhost:3000/travel-plans
  Headers:
  ```
  x-user-id: <USER_ID>
  Content-Type: application/json
  ```
  Body (JSON):
  ```json
  {
    "title": "Vacaciones en Colombia",
    "startDate": "2024-12-01",
    "endDate": "2024-12-15",
    "countryAlpha3": "COL",
    "userId": "<USER_ID>"
  }
  ```

  3) Añadir gasto embebido

  POST http://localhost:3000/travel-plans/:id/expenses
  Headers:
  ```
  x-user-id: <USER_ID>
  Content-Type: application/json
  ```
  Body (JSON):
  ```json
  {
    "description": "Transporte local",
    "amount": 120.5,
    "category": "Transporte"
  }
  ```

  4) Consultar plan (ver gastos)

  GET http://localhost:3000/travel-plans/:id

  5) Eliminar plan

  DELETE http://localhost:3000/travel-plans/:id

  ## Reporte de cambios (Parte 3)

  Se implementó la inserción individual de gastos como un arreglo embebido `expenses` dentro del documento `TravelPlan` en MongoDB. La operación para añadir un gasto utiliza la actualización atómica de MongoDB con `$push` (ej. `findByIdAndUpdate(id, { $push: { expenses: expense } }, { new: true })`), lo que garantiza que los gastos se agregan incrementalmente sin sobrescribir el arreglo existente.

  ## Cómo comprobar que el parcial funciona (pasos en Postman)

  1. Levanta MongoDB y la API (`npm run start:dev`).
  2. Crear un usuario con `POST /users`. Anota el `_id` del usuario.
  3. Crear un plan con `POST /travel-plans` usando `userId` y `countryAlpha3` válidos. Verifica respuesta 201 y copia el `_id` del plan.
  4. Repetir la creación del mismo plan con el mismo `countryAlpha3` y observar que la colección `countries` en MongoDB queda con una sola entrada para ese país (cache). Puedes comprobar con `mongosh`:

  ```js
  use travel-plans-db
  db.countries.find({ alpha3: 'COL' }).pretty()
  ```

  5. Añadir un gasto con `POST /travel-plans/:id/expenses`. Verifica que la respuesta incluye el gasto añadido en `expenses`.
  6. Obtener el plan con `GET /travel-plans/:id` y confirmar que `expenses` contiene todos los gastos añadidos.
  7. Eliminar el plan con `DELETE /travel-plans/:id` y comprobar respuesta 200.



