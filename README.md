  # API REST - Planificación de Viajes (NestJS)

## Instalación y Ejecución

  ### 1. Requisitos Previos
  - Node.js (v18 o superior)
  - MongoDB (local o Docker)
  - npm o yarn

  ### 2. Instalación

  ```bash
  # Instalar dependencias
  npm install
  ```

  ### 3. Configuración de MongoDB

  **Opción A: Usar MongoDB local**
  - Asegúrate de que MongoDB está ejecutándose en `mongodb://localhost:27017`

  **Opción B: Usar Docker**
  ```bash
  docker run -d --name mongo -p 27017:27017 mongo:6.0
  ```

  ### 4. Ejecución

  ```bash
  # Modo desarrollo (con hot-reload)
  npm run start:dev

  # Modo producción
  npm run build
  npm run start
  ```

  El servidor estará disponible en `http://localhost:3000`

  ---

## Arquitectura Interna

  #### **CountriesModule** (Lógica Interna)
  - **Responsabilidad**: Gestión de datos geográficos para uso exclusivo interno
  - **Característica Principal**: NO expone controladores HTTP
  - **Componentes**:
    - `CountriesService`: Implementa la lógica de caché
    - `CountriesApiProvider`: Encapsula la comunicación con la API externa (RestCountries)
    - `Country Schema`: Modelo de datos para países

  **Flujo de Caché**:
  1. Cliente solicita crear un plan con código de país (ej: "COL")
  2. `CountriesService.resolveCountry()` busca en MongoDB primero
  3. Si no existe: consulta la API RestCountries
  4. Almacena la respuesta en MongoDB para futuras solicitudes
  5. Retorna el país resuelto

  #### **TravelPlansModule** (Interfaz Pública)
  - **Responsabilidad**: Gestión completa de planes de viaje
  - **Característica Principal**: Único módulo con exposición HTTP
  - **Componentes**:
    - `TravelPlansController`: Define los 4 endpoints públicos
    - `TravelPlansService`: Lógica de negocio + integración con CountriesService
    - `TravelPlan Schema`: Modelo de datos para planes
    - `CreateTravelPlanDto`: Validación de entrada

  ### Flujo de Petición

  ```
  Cliente (HTTP)
      ↓
  TravelPlansController (Validación con ValidationPipe)
      ↓
  TravelPlansService
      ├→ Llamar CountriesService.resolveCountry()
      │   ├→ Buscar en MongoDB (caché local)
      │   └→ Si no existe → API externa → Guardar en MongoDB
      └→ Guardar TravelPlan en MongoDB
      ↓
  Respuesta HTTP (Mongoose Document)
  ```

  ---

  ## Ejemplos de Peticiones

  ### 1. Crear un Plan de Viaje
  ```http
  POST http://localhost:3000/travel-plans
  Content-Type: application/json

  {
    "title": "Vacaciones en Colombia",
    "startDate": "2024-12-01",
    "endDate": "2024-12-15",
    "countryAlpha3": "COL"
  }
  ```

  **Respuesta (201 Created)**:
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Vacaciones en Colombia",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-15T00:00:00.000Z",
    "countryAlpha3": "COL",
    "createdAt": "2024-05-14T10:30:00.000Z",
    "updatedAt": "2024-05-14T10:30:00.000Z"
  }
  ```

  **Nota**: En la primera solicitud con "COL", la API:
  - Busca "COL" en MongoDB (no encuentra)
  - Consulta RestCountries API
  - Guarda el país en MongoDB
  - Retorna el plan creado

  En la segunda solicitud con "COL", la API:
  - Busca "COL" en MongoDB (lo encuentra)
  - No consulta la API externa
  - Retorna el plan creado (más rápido)

  ---

  ### 2. Listar Todos los Planes
  ```http
  GET http://localhost:3000/travel-plans
  ```

  **Respuesta (200 OK)**:
  ```json
  [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Vacaciones en Colombia",
      "startDate": "2024-12-01T00:00:00.000Z",
      "endDate": "2024-12-15T00:00:00.000Z",
      "countryAlpha3": "COL"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Viaje a Japón",
      "startDate": "2025-03-10T00:00:00.000Z",
      "endDate": "2025-03-20T00:00:00.000Z",
      "countryAlpha3": "JPN"
    }
  ]
  ```

  ---

  ### 3. Obtener Detalle de un Plan
  ```http
  GET http://localhost:3000/travel-plans/507f1f77bcf86cd799439011
  ```

  **Respuesta (200 OK)**:
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Vacaciones en Colombia",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-15T00:00:00.000Z",
    "countryAlpha3": "COL"
  }
  ```

  ---

  ### 4. Eliminar un Plan
  ```http
  DELETE http://localhost:3000/travel-plans/507f1f77bcf86cd799439011
  ```

  **Respuesta (200 OK)**:
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Vacaciones en Colombia",
    "startDate": "2024-12-01T00:00:00.000Z",
    "endDate": "2024-12-15T00:00:00.000Z",
    "countryAlpha3": "COL"
  }
  ```

  ---

## Validación de Datos

  ### Validaciones en CreateTravelPlanDto:
  - `title`: Debe ser un string
  - `startDate`: Debe ser una fecha en formato ISO (YYYY-MM-DD)
  - `endDate`: Debe ser una fecha en formato ISO (YYYY-MM-DD)
  - `countryAlpha3`: Debe ser exactamente 3 caracteres alfabéticos MAYÚSCULAS

  **Ejemplo de error de validación**:
  ```http
  POST http://localhost:3000/travel-plans
  Content-Type: application/json

  {
    "title": 123,
    "startDate": "01-12-2024",
    "endDate": "15-12-2024",
    "countryAlpha3": "col"
  }
  ```

  **Respuesta (400 Bad Request)**:
  ```json
  {
    "message": [
      "title must be a string",
      "startDate must be a valid ISO 8601 date string",
      "countryAlpha3 must match /^[A-Z]{3}$/ regular expression"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

  ---

## Limpieza de Base de Datos (Pre-Entrega)

  ### Opción A: MongoDB Shell
  ```bash
  mongo
  use travel-plans-db
  db.countries.deleteMany({})
  db.travelplans.deleteMany({})
  exit
  ```

  ### Opción B: Compass (GUI)
  1. Conéctate a `mongodb://localhost:27017`
  2. Selecciona la base de datos `travel-plans-db`
  3. Elimina las colecciones `countries` y `travelplans`

  ---

  ## Estructura del Proyecto

  ```
  src/
  ├── main.ts                                      # Configuración global (ValidationPipe)
  ├── app.module.ts                                # Módulo raíz
  ├── countries/
  │   ├── countries.module.ts                      # Módulo interno
  │   ├── schemas/
  │   │   └── country.schema.ts                    # Modelo Country
  │   ├── providers/
  │   │   └── countries-api.provider.ts            # Proveedor para API RestCountries
  │   └── services/
  │       └── countries.service.ts                 # Servicio con lógica de caché
  ├── travel-plans/
  │   ├── travel-plans.module.ts                   # Módulo público
  │   ├── controllers/
  │   │   └── travel-plans.controller.ts           # Endpoints públicos
  │   ├── schemas/
  │   │   └── travel-plan.schema.ts                # Modelo TravelPlan
  │   ├── dto/
  │   │   └── create-travel-plan.dto.ts            # Validación DTO
  │   └── services/
  │       └── travel-plans.service.ts              # Lógica de negocio
  ```

  ---

  ## Conceptos Clave Implementados

  | Concepto | Implementación |
  |----------|-----------------|
  | **Módulos NestJS** | CountriesModule (interno) y TravelPlansModule (público) |
  | **Inyección de Dependencias** | Services inyectados vía constructor |
  | **DTOs y Validación** | CreateTravelPlanDto + ValidationPipe global |
  | **Caché Local** | CountriesService busca en MongoDB antes de API externa |
  | **Provider Externo** | CountriesApiProvider encapsula HttpService |
  | **Mongoose ORM** | Esquemas Country y TravelPlan |
  | **Encapsulamiento** | CountriesModule sin @Controller() |
  | **Comunicación entre Módulos** | TravelPlansModule importa CountriesModule |

  ---

  ## Notas Adicionales

  - **Códigos de País**: Usa códigos Alpha-3 ISO (ej: COL, JPN, USA, ESP)
  - **API Externa**: RestCountries (sin costo, sin autenticación)
  - **Base de Datos**: MongoDB (flexible, sin migraciones)
  - **Validación**: Automática con class-validator y ValidationPipe
  - **Hot-Reload**: Disponible en `npm run start:dev`

  ---

## Características Destacadas

- API modular y bien organizada  
- Caché inteligente de países  
- Validación automática de entrada  
- Comunicación entre módulos correcta  
- Sin exposición de servicios internos  
- Código limpio y mantenible  
- Alineado 100% con conceptos del curso

  ## Soporte

  Si encuentras problemas:
  1. Verifica que MongoDB está corriendo: `mongosh` o `mongo`
  2. Revisa los logs en la consola: `npm run start:dev`
  3. Limpia la base de datos: `db.travelplans.deleteMany({})`
  4. Reinicia el servidor

¡Éxito con tu preparcial!

  ## Resources

  Check out a few resources that may come in handy when working with NestJS:

  - Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
  - For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
  - To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
  - Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
  - Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
  - Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
  - To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
  - Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

  ## Support

  Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

  ## Stay in touch

  - Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
  - Website - [https://nestjs.com](https://nestjs.com/)
  - Twitter - [@nestframework](https://twitter.com/nestframework)

  ## License

  Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
