# Diagrama de Clases - Módulo de Autenticación

```mermaid
classDiagram
    %% Controllers
    class AuthController {
        -AuthService authService
        +register(registerDto) Promise~AuthResponseDto~
        +login(data) Promise~AuthResponseDto~
        +logout(user) Promise~LogoutResponseDto~
        +refreshTokens(payload) Promise~TokenResponseDto~
        +testAuth(user) object
        +getProfile(user) Promise~ProfileResponseDto~
    }

    %% Services
    class AuthService {
        -Repository~User~ userRepository
        -Repository~Role~ roleRepository
        -Repository~UserRole~ userRoleRepository
        -JwtService jwtService
        -ConfigService configService
        +register(data) Promise~AuthResponseDto~
        +login(loginDto) Promise~AuthResponseDto~
        +logout(userId) Promise~LogoutResponseDto~
        +refreshTokens(userId, refreshToken) Promise~TokenResponseDto~
        +validateUser(userId) Promise~ProfileResponseDto~
        +getTokens(userId, email) Promise~TokenResponseDto~
        +updateRefreshToken(userId, refreshToken) Promise~void~
        +getDefaultRole(roleId) Promise~number~
        +getUserPermissions(userId) Promise~string[]~
        -getUserWithRoles(identifier) Promise~User~
        -getUserWithRolesAndPassword(identifier) Promise~User~
        -getUserWithRefreshToken(userId) Promise~User~
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

    class Role {
        +int id
        +string name
        +string description
        +Date createdAt
        +Date updatedAt
    }

    class UserRole {
        +int id
        +int userId
        +int roleId
        +string assignedBy
        +Date createdAt
    }

    class SystemPermission {
        +int id
        +string resource
        +string action
        +string description
        +Date createdAt
        +Date updatedAt
    }

    class RolePermission {
        +int id
        +int roleId
        +int permissionId
        +Date createdAt
    }

    %% DTOs
    class RegisterDto {
        +string email
        +string password
        +string name
        +string phone
        +int roleId
    }

    class LoginDto {
        +string email
        +string password
    }

    class AuthResponseDto {
        +UserWithRolesDto user
        +string accessToken
        +string refreshToken
    }

    class TokenResponseDto {
        +string accessToken
        +string refreshToken
    }

    class LogoutResponseDto {
        +string message
    }

    class ProfileResponseDto {
        +int id
        +string email
        +string name
        +string phone
        +int loyaltyPoints
        +LoyaltyLevel loyaltyLevel
        +RoleDto[] roles
        +string[] permissions
    }

    class CreateRoleDto {
        +string name
        +string description
    }

    class UpdateRoleDto {
        +string name
        +string description
    }

    class CreatePermissionDto {
        +string resource
        +string action
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

    class JwtRefreshUser {
        <<interface>>
        +int sub
        +string email
        +string refreshToken
    }

    %% Relationships
    AuthController --> AuthService : uses
    AuthController ..> RegisterDto : uses
    AuthController ..> LoginDto : uses
    AuthController ..> AuthResponseDto : returns
    AuthController ..> TokenResponseDto : returns
    AuthController ..> LogoutResponseDto : returns
    AuthController ..> ProfileResponseDto : returns
    AuthController ..> JwtUser : uses
    AuthController ..> JwtRefreshUser : uses
    
    AuthService --> User : manages
    AuthService --> Role : manages
    AuthService --> UserRole : manages
    AuthService ..> RegisterDto : creates from
    AuthService ..> LoginDto : validates
    AuthService ..> AuthResponseDto : returns
    AuthService ..> TokenResponseDto : returns
    AuthService ..> ProfileResponseDto : returns
    
    User "1" --o "0..*" UserRole : has
    UserRole "0..*" --> "1" Role : references
    Role "1" --o "0..*" RolePermission : has
    RolePermission "0..*" --> "1" SystemPermission : references
    User --> LoyaltyLevel : loyaltyLevel
    
    AuthResponseDto --> User : contains
    ProfileResponseDto --> LoyaltyLevel : loyaltyLevel
    
    %% Notas de Patrones GoF
    note for UserRole "Bridge Pattern (GoF)<br/>Desacopla Users y Roles<br/>con tabla intermedia"
    note for SystemPermission "Composite Pattern (GoF)<br/>Jerarquía de permisos<br/>con padre-hijo"
    note for LoyaltyLevel "State Pattern (GoF)<br/>Estados de lealtad:<br/>BRONZE→SILVER→GOLD→PLATINUM"
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de autenticación:

### Controllers
- **AuthController**: Maneja las peticiones HTTP para registro, login, logout, refresh tokens y perfil

### Services
- **AuthService**: Lógica de negocio para autenticación JWT, gestión de tokens, roles y permisos

### Entities
- **User**: Usuario del sistema con credenciales y perfil
- **Role**: Roles del sistema (admin, cliente, etc.)
- **UserRole**: Relación Many-to-Many entre usuarios y roles
- **SystemPermission**: Permisos disponibles en el sistema
- **RolePermission**: Relación Many-to-Many entre roles y permisos

### DTOs
- **RegisterDto**: Datos para registro de usuario
- **LoginDto**: Credenciales de login
- **AuthResponseDto**: Respuesta con usuario y tokens
- **TokenResponseDto**: Par de tokens (access y refresh)
- **LogoutResponseDto**: Confirmación de logout
- **ProfileResponseDto**: Perfil completo del usuario
- **CreateRoleDto**: Datos para crear rol
- **UpdateRoleDto**: Datos para actualizar rol
- **CreatePermissionDto**: Datos para crear permiso

### Enumerations
- **LoyaltyLevel**: Niveles de lealtad (BRONZE, SILVER, GOLD, PLATINUM)

### Interfaces
- **JwtUser**: Datos del usuario en JWT
- **JwtRefreshUser**: Datos para refresh token

### Funcionalidades Principales
- Registro de usuarios con asignación de roles
- Login con JWT (access y refresh tokens)
- Logout e invalidación de tokens
- Refresh de tokens
- Validación de usuarios
- Gestión de permisos basada en roles
- Sistema de lealtad integrado
