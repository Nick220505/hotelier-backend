# Diagrama de Secuencia - Módulo de Usuarios

## 1. Crear Usuario

```mermaid
---
title: Crear Usuario
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as UsersController
    participant Service as UsersService
    participant UserRepo as UserRepository
    participant RoleRepo as RoleRepository
    participant Hash as PasswordHasher

    Admin->>+Controller: POST /users (createUserDto)
    Controller->>+Service: create(userData)
    
    Service->>+UserRepo: findByEmail(email)
    UserRepo-->>-Service: User | null
    
    alt Email ya existe
        Service-->>Controller: ConflictException
        Controller-->>Admin: 409 - Email already exists
    else Email disponible
        Service->>+Hash: hash(password)
        Hash-->>-Service: hashedPassword
        
        Service->>Service: setDefaultValues()
        Note over Service: loyaltyLevel = BRONZE<br/>loyaltyPoints = 0<br/>isActive = true
        
        Service->>+UserRepo: save(userData)
        UserRepo-->>-Service: User
        
        opt Si se especifican roles
            Service->>+RoleRepo: findByIds(roleIds)
            RoleRepo-->>-Service: Role[]
            
            Service->>UserRepo: assignRoles(userId, roles)
        end
        
        Service-->>-Controller: User
        Controller-->>-Admin: 201 - User created
    end
```

## 2. Autenticación y Login (Integración con Auth)

```mermaid
---
title: Autenticación y Login
---
sequenceDiagram
    autonumber
    actor Cliente
    participant AuthController
    participant AuthService
    participant UserService as UsersService
    participant UserRepo as UserRepository
    participant Hash as PasswordHasher
    participant JWT as JWTService

    Cliente->>+AuthController: POST /auth/login (email, password)
    AuthController->>+AuthService: validateUser(email, password)
    
    AuthService->>+UserService: findByEmail(email)
    UserService->>+UserRepo: findOne({where: {email}, relations: ['roles']})
    UserRepo-->>-UserService: User with roles
    UserService-->>-AuthService: User
    
    alt Usuario no encontrado
        AuthService-->>AuthController: UnauthorizedException
        AuthController-->>Cliente: 401 - Invalid credentials
    else Usuario encontrado
        AuthService->>+Hash: compare(password, user.hashedPassword)
        Hash-->>-AuthService: isValid
        
        alt Password inválida
            AuthService-->>AuthController: UnauthorizedException
            AuthController-->>Cliente: 401 - Invalid credentials
        else Password válida
            alt Usuario inactivo
                AuthService-->>AuthController: UnauthorizedException
                AuthController-->>Cliente: 401 - Account inactive
            else Usuario activo
                AuthService->>+JWT: generateAccessToken(user)
                JWT-->>-AuthService: accessToken
                
                AuthService->>+JWT: generateRefreshToken(user)
                JWT-->>-AuthService: refreshToken
                
                AuthService->>+UserService: updateRefreshToken(userId, refreshToken)
                UserService->>UserRepo: update(userId, {refreshToken, lastLogin})
                UserService-->>-AuthService: Updated
                
                AuthService-->>-AuthController: {accessToken, refreshToken, user}
                AuthController-->>-Cliente: 200 - Login successful
            end
        end
    end
```

## 3. Actualizar Perfil de Usuario

```mermaid
---
title: Actualizar Perfil de Usuario
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as UsersController
    participant Service as UsersService
    participant UserRepo as UserRepository
    participant Hash as PasswordHasher

    Usuario->>+Controller: PATCH /users/me (updateUserDto)
    Note over Controller: Request incluye JWT<br/>con id del usuario
    Controller->>+Service: update(userId, userData)
    
    Service->>+UserRepo: findOne({where: {id: userId}, relations: {userRoles: {role: true}}})
    UserRepo-->>-Service: User
    
    alt Usuario no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Usuario: 404 - User not found
    else Usuario encontrado
        opt Si actualiza password
            Service->>+Hash: hash(newPassword)
            Hash-->>-Service: hashedPassword
            Service->>Service: updateDto.password = hashedPassword
        end
        
        opt Si actualiza email
            Service->>+UserRepo: findByEmail(newEmail)
            UserRepo-->>-Service: ExistingUser | null
            
            alt Email ya existe
                Service-->>Controller: ConflictException
                Controller-->>Usuario: 409 - Email already exists
            end
        end
        
        Service->>+UserRepo: update(userId, userData)
        UserRepo-->>-Service: UpdateResult
        
        Service->>+UserRepo: findOne({where: {id: userId}, relations: {userRoles: {role: true}}})
        UserRepo-->>-Service: Updated User
        
        Service-->>-Controller: User
        Controller-->>-Usuario: 200 - Profile updated
    end
```

## 4. Sistema de Lealtad - Actualizar Puntos

```mermaid
---
title: Sistema de Lealtad - Actualizar Puntos
---
sequenceDiagram
    autonumber
    actor Sistema
    participant UserService as UsersService
    participant UserRepo as UserRepository

    Sistema->>+UserService: addLoyaltyPoints(userId, points)
    
    UserService->>+UserRepo: findOne(userId)
    UserRepo-->>-UserService: User
    
    UserService->>UserService: calculateNewPoints(current + points)
    UserService->>UserService: calculateLoyaltyLevel(totalPoints)
    
    alt 0-999 puntos
        UserService->>UserService: setLevel(BRONZE)
    else 1000-2999 puntos
        UserService->>UserService: setLevel(SILVER)
    else 3000-4999 puntos
        UserService->>UserService: setLevel(GOLD)
    else 5000+ puntos
        UserService->>UserService: setLevel(PLATINUM)
    end
    
    UserService->>+UserRepo: update(userId, {points, level})
    UserRepo-->>-UserService: UpdateResult
    
    UserService-->>-Sistema: Updated User
```

## 5. Activar/Desactivar Usuario

```mermaid
---
title: Activar/Desactivar Usuario
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as UsersController
    participant Service as UsersService
    participant UserRepo as UserRepository

    alt Activar usuario
        Admin->>+Controller: POST /users/:id/activate
        Controller->>+Service: activate(id)
    else Desactivar usuario
        Admin->>+Controller: POST /users/:id/deactivate
        Controller->>+Service: deactivate(id)
    end
    
    Service->>+UserRepo: findOne({where: {id}, relations: {userRoles: {role: true}}})
    UserRepo-->>-Service: User
    
    alt Usuario no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Admin: 404 - User not found
    else Usuario encontrado
        alt Activar
            Service->>+UserRepo: update(id, {isActive: true})
            UserRepo-->>-Service: UpdateResult
        else Desactivar
            Service->>+UserRepo: update(id, {isActive: false})
            UserRepo-->>-Service: UpdateResult
            Service->>UserRepo: update(id, {refreshToken: null})
            Note over Service: Invalida tokens al desactivar
        end
        
        Service->>+UserRepo: findOne({where: {id}, relations: {userRoles: {role: true}}})
        UserRepo-->>-Service: Updated User
        
        Service-->>-Controller: User
        Controller-->>-Admin: 200 - User updated
    end
```

## 6. Consultar Perfil Propio

```mermaid
---
title: Consultar Perfil Propio
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as UsersController
    participant Service as UsersService
    participant UserRepo as UserRepository

    Usuario->>+Controller: GET /users/me
    Note over Controller: JWT contiene userId
    Controller->>+Service: findOne(userId)
    
    Service->>+UserRepo: findOne(userId, relations: roles, permissions)
    UserRepo-->>-Service: User with roles and permissions
    
    Service->>Service: transformUserForApi(user)
    Note over Service: Excluye: password,<br/>refreshToken
    
    Service-->>-Controller: UserResponseDto
    Controller-->>-Usuario: 200 - User profile
```

## 7. Listar Todos los Usuarios (Admin)

```mermaid
---
title: Listar Todos los Usuarios
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as UsersController
    participant Service as UsersService
    participant UserRepo as UserRepository

    Admin->>+Controller: GET /users
    Controller->>+Service: findAll()
    
    Service->>+UserRepo: find(relations: roles, order by createdAt DESC)
    UserRepo-->>-Service: User[]
    
    Service->>Service: transformUsersForApi(users)
    Note over Service: Excluye campos sensibles<br/>de cada usuario
    
    Service-->>-Controller: UserResponseDto[]
    Controller-->>-Admin: 200 - Users list
```

## Descripción de Flujos

### 1. Crear Usuario

- Validación de email único
- Hash seguro de contraseña
- Asignación de valores por defecto (BRONZE, 0 puntos)
- Asignación opcional de roles
- Usuario activo por defecto

### 2. Autenticación y Login (Integración con Auth)

- Validación de credenciales
- Verificación de estado activo
- Generación de access y refresh tokens
- Actualización de último login
- Gestión segura de tokens

### 3. Actualizar Perfil de Usuario

- Usuario puede actualizar su propio perfil
- Validación de email único si cambia
- Hash de nueva contraseña si se actualiza
- Protección contra campos sensibles

### 4. Sistema de Lealtad - Actualizar Puntos

- Cálculo automático de nivel según puntos
- Niveles: BRONZE → SILVER → GOLD → PLATINUM
- Actualización atómica de puntos y nivel

### 5. Activar/Desactivar Usuario

- Control administrativo de acceso
- Desactivación invalida tokens
- Activación restaura acceso
- Útil para suspensiones temporales

### 6. Consultar Perfil Propio

- Usuario consulta su propia información
- Incluye roles y permisos
- Excluye datos sensibles
- Basado en JWT del usuario autenticado

### 7. Listar Todos los Usuarios (Admin)

- Solo para administradores
- Lista completa con roles
- Ordenada por fecha de creación
- Datos transformados (sin información sensible)

## Patrones Implementados

- **Repository Pattern**: Acceso a datos a través de repositorios
- **DTO Pattern**: Transformación de datos para API (UserResponseDto)
- **Strategy Pattern**: Niveles de lealtad con diferentes beneficios
- **Observer Pattern**: Sistema de notificaciones en cambios importantes
- **Security Pattern**: Hash de contraseñas, validación de tokens
- **Soft Delete Pattern**: Desactivación en lugar de eliminación
