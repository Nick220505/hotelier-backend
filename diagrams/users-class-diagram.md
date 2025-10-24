# Diagrama de Clases - Módulo de Usuarios

```mermaid
classDiagram
    %% Controllers
    class UsersController {
        -UsersService usersService
        +findAll() Promise~UserResponseDto[]~
        +findOne(id) Promise~UserResponseDto~
        +create(createUserDto) Promise~User~
        +update(id, updateUserDto) Promise~User~
        +remove(id) Promise~User~
        +activate(id) Promise~User~
        +deactivate(id) Promise~User~
        +getMyProfile(user) Promise~UserResponseDto~
        +updateMyProfile(user, updateUserDto) Promise~User~
    }

    %% Services
    class UsersService {
        -Repository~User~ userRepository
        +findAll() Promise~UserResponseDto[]~
        +findOne(id) Promise~UserResponseDto~
        +create(userData) Promise~User~
        +update(id, userData) Promise~User~
        +remove(id) Promise~User~
        +updateRefreshToken(id, refreshToken) Promise~void~
        +activate(id) Promise~User~
        +deactivate(id) Promise~User~
        -transformUserForApi(user) UserResponseDto
        -transformUsersForApi(users) UserResponseDto[]
    }

    %% Entities
    class User {
        +int id
        +string email
        +string password
        +string name
        +string phone
        +int loyaltyPoints
        +LoyaltyLevel loyaltyLevel
        +string preferences
        +Date registrationDate
        +Date lastVisit
        +Date createdAt
        +Date updatedAt
        +Date firstVisit
        +boolean isActive
        +Date lastLogin
        +string refreshToken
    }

    class UserRole {
        +int id
        +int userId
        +int roleId
        +Date createdAt
    }

    class Role {
        +int id
        +string name
        +string description
        +Date createdAt
        +Date updatedAt
    }

    %% DTOs
    class CreateUserDto {
        +string email
        +string password
        +string name
        +string phone
        +int loyaltyPoints
        +LoyaltyLevel loyaltyLevel
        +string preferences
        +boolean isActive
    }

    class UpdateUserDto {
        +string email
        +string password
        +string name
        +string phone
        +int loyaltyPoints
        +LoyaltyLevel loyaltyLevel
        +string preferences
        +boolean isActive
    }

    class UserResponseDto {
        +int id
        +string email
        +string name
        +string phone
        +int loyaltyPoints
        +LoyaltyLevel loyaltyLevel
        +string preferences
        +Date registrationDate
        +Date lastVisit
        +Date createdAt
        +Date updatedAt
        +Date firstVisit
        +boolean isActive
        +Date lastLogin
        +UserRoleDto[] roles
        +string[] permissions
    }

    class UserRoleDto {
        +int id
        +string name
        +string description
    }

    %% Enumerations
    class LoyaltyLevel {
        <<enumeration>>
        BRONZE
        SILVER
        GOLD
        PLATINUM
    }

    %% Interfaces
    class JwtUser {
        <<interface>>
        +int id
        +string email
        +string name
        +string[] roles
        +string[] permissions
    }

    %% Relationships
    UsersController --> UsersService : uses
    UsersController ..> CreateUserDto : uses
    UsersController ..> UpdateUserDto : uses
    UsersController ..> UserResponseDto : returns
    UsersController ..> JwtUser : uses
    
    UsersService --> User : manages
    UsersService ..> CreateUserDto : creates from
    UsersService ..> UpdateUserDto : updates from
    UsersService ..> UserResponseDto : returns
    UsersService ..> UserRoleDto : uses
    
    User "1" --o "0..*" UserRole : has
    UserRole "0..*" --> "1" Role : references
    User --> LoyaltyLevel : loyaltyLevel
    
    CreateUserDto --> LoyaltyLevel : loyaltyLevel
    UpdateUserDto --> LoyaltyLevel : loyaltyLevel
    UserResponseDto --> UserRoleDto : contains
    UserResponseDto --> LoyaltyLevel : loyaltyLevel
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de usuarios:

### Controllers
- **UsersController**: Maneja las peticiones HTTP para gestión de usuarios, activación/desactivación y perfil

### Services
- **UsersService**: Lógica de negocio para CRUD de usuarios, gestión de tokens de refresco y transformación de datos para API

### Entities
- **User**: Entidad principal que representa un usuario del sistema
  - Contiene credenciales (email, password encriptada)
  - Información personal (nombre, teléfono)
  - Sistema de lealtad (puntos y nivel)
  - Preferencias del usuario
  - Estado de la cuenta (activo/inactivo)
  - Tokens de autenticación

- **UserRole**: Tabla intermedia que relaciona usuarios con roles (Many-to-Many)

- **Role**: Define los roles disponibles en el sistema

### DTOs
- **CreateUserDto**: Datos para crear un nuevo usuario
- **UpdateUserDto**: Datos para actualizar un usuario existente
- **UserResponseDto**: Respuesta de API sin datos sensibles (password, refreshToken)
- **UserRoleDto**: Información simplificada de un rol

### Enumerations
- **LoyaltyLevel**: Niveles de lealtad del usuario
  - BRONZE: Nivel inicial
  - SILVER: Nivel intermedio
  - GOLD: Nivel avanzado
  - PLATINUM: Nivel premium

### Interfaces
- **JwtUser**: Datos del usuario en el token JWT para autenticación

### Funcionalidades Principales
- Gestión completa de usuarios (CRUD)
- Sistema de activación/desactivación de cuentas
- Gestión de perfil propio
- Sistema de puntos y niveles de lealtad
- Gestión de roles y permisos
- Transformación segura de datos (exclusión de campos sensibles)
- Manejo de tokens de refresco para autenticación
