# Diagrama de Secuencia - Módulo de Autenticación

## 1. Registro de Usuario

```mermaid
---
title: Registro de Usuario
---
sequenceDiagram
    autonumber
    actor Cliente
    participant Controller as AuthController
    participant Service as AuthService
    participant UserRepo as UserRepository
    participant RoleRepo as RoleRepository
    participant UserRoleRepo as UserRoleRepository
    participant JWT as JwtService
    participant Hash as bcrypt

    Cliente->>+Controller: POST /auth/register (registerDto)
    Controller->>+Service: register(data)
    
    Service->>+UserRepo: findOne({where: {email}})
    UserRepo-->>-Service: User | null
    
    alt Usuario ya existe
        Service-->>Controller: UnauthorizedException
        Controller-->>Cliente: 401 - User already exists
    else Usuario no existe
        Service->>+Hash: hash(password, 10)
        Hash-->>-Service: hashedPassword
        
        Service->>+UserRepo: save({email, password: hashedPassword, name, phone})
        UserRepo-->>-Service: User
        
        Service->>+Service: getDefaultRole(roleId)
        alt roleId provided
            Service-->>-Service: roleId
        else no roleId
            Service->>+RoleRepo: findOne({where: {name: 'cliente'}})
            RoleRepo-->>-Service: Role
            Service-->>Service: defaultRole.id
        end
        
        Service->>+UserRoleRepo: save({userId, roleId, assignedBy: 'system'})
        UserRoleRepo-->>-Service: UserRole
        
        Service->>+Service: getUserWithRoles(user.id)
        Service->>+UserRepo: findOne({where: {id}, relations: {userRoles: {role: {permissions: {permission}}}}})
        UserRepo-->>-Service: User with roles
        Service-->>-Service: userWithRoles
        
        Service->>+Service: getTokens(user.id, user.email)
        Service->>+JWT: signAsync(payload, {secret, expiresIn: '15m'})
        JWT-->>-Service: accessToken
        Service->>+JWT: signAsync(payload, {secret, expiresIn: '7d'})
        JWT-->>-Service: refreshToken
        Service-->>-Service: {accessToken, refreshToken}
        
        Service->>+Service: updateRefreshToken(user.id, refreshToken)
        Service->>+Hash: hash(refreshToken, 10)
        Hash-->>-Service: hashedRefreshToken
        Service->>+UserRepo: update(userId, {refreshToken: hashedRefreshToken})
        UserRepo-->>-Service: UpdateResult
        Service-->>-Service: void
        
        Service->>Service: transformUserResponse(userWithRoles, tokens)
        
        Service-->>-Controller: AuthResponseDto
        Controller-->>-Cliente: 201 - User registered with tokens
    end
```

## 2. Inicio de Sesión (Login)

```mermaid
---
title: Inicio de Sesión
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as AuthController
    participant Service as AuthService
    participant UserRepo as UserRepository
    participant Hash as bcrypt
    participant JWT as JwtService

    Usuario->>+Controller: POST /auth/login (loginDto)
    Controller->>+Service: login(loginDto)
    
    Service->>+Service: getUserWithRolesAndPassword(email)
    Service->>+UserRepo: findOne({where: {email}, select: {password: true}, relations: {userRoles: {role: {permissions: {permission}}}}})
    UserRepo-->>-Service: User with password
    Service-->>-Service: user
    
    alt Usuario no encontrado o inactivo
        Service-->>Controller: UnauthorizedException
        Controller-->>Usuario: 401 - Invalid credentials
    else Usuario encontrado
        Service->>+Hash: compare(password, user.password)
        Hash-->>-Service: isPasswordValid
        
        alt Contraseña inválida
            Service-->>Controller: UnauthorizedException
            Controller-->>Usuario: 401 - Invalid credentials
        else Contraseña válida
            Service->>+Service: getTokens(user.id, user.email)
            Service->>+JWT: signAsync(payload, {secret, expiresIn: '15m'})
            JWT-->>-Service: accessToken
            Service->>+JWT: signAsync(payload, {secret, expiresIn: '7d'})
            JWT-->>-Service: refreshToken
            Service-->>-Service: {accessToken, refreshToken}
            
            Service->>+Service: updateRefreshToken(user.id, refreshToken)
            Service->>+Hash: hash(refreshToken, 10)
            Hash-->>-Service: hashedRefreshToken
            Service->>+UserRepo: update(userId, {refreshToken: hashedRefreshToken})
            UserRepo-->>-Service: UpdateResult
            Service-->>-Service: void
            
            Service->>+UserRepo: update(user.id, {lastLogin: new Date()})
            UserRepo-->>-Service: UpdateResult
            
            Service->>+Service: getUserPermissions(user.id)
            Service->>+Service: getUserWithRoles(user.id)
            Service->>+UserRepo: findOne({where: {id}, relations: {userRoles: {role: {permissions: {permission}}}}})
            UserRepo-->>-Service: User with roles
            Service-->>-Service: user
            Service->>Service: extractPermissions(user.userRoles)
            Note over Service: Format: resource:action<br/>(e.g., "ROOM:CREATE")
            Service-->>-Service: permissions[]
            
            Service->>Service: transformUserResponse(user, tokens, permissions)
            
            Service-->>-Controller: AuthResponseDto
            Controller-->>-Usuario: 200 - Login successful with tokens
        end
    end
```

## 3. Cerrar Sesión (Logout)

```mermaid
---
title: Cerrar Sesión
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as AuthController
    participant Guard as JwtAuthGuard
    participant Service as AuthService
    participant UserRepo as UserRepository

    Usuario->>+Controller: POST /auth/logout (Bearer token)
    Controller->>+Guard: validate(token)
    Guard-->>-Controller: JwtUser
    
    Controller->>+Service: logout(user.id)
    
    Service->>+UserRepo: update(userId, {refreshToken: undefined})
    UserRepo-->>-Service: UpdateResult
    
    Service-->>-Controller: LogoutResponseDto
    Controller-->>-Usuario: 200 - Logged out successfully
```

## 4. Refrescar Tokens

```mermaid
---
title: Refrescar Tokens
---
sequenceDiagram
    autonumber
    actor Cliente
    participant Controller as AuthController
    participant Guard as JwtRefreshGuard
    participant Service as AuthService
    participant UserRepo as UserRepository
    participant Hash as bcrypt
    participant JWT as JwtService

    Cliente->>+Controller: POST /auth/refresh (refreshToken)
    Controller->>+Guard: validate(refreshToken)
    Guard-->>-Controller: JwtRefreshUser
    
    Controller->>+Service: refreshTokens(sub, refreshToken)
    
    Service->>+Service: getUserWithRefreshToken(userId)
    Service->>+UserRepo: findOne({where: {id}, select: {refreshToken: true}})
    UserRepo-->>-Service: User
    Service-->>-Service: user
    
    alt Usuario no encontrado o sin refreshToken
        Service-->>Controller: ForbiddenException
        Controller-->>Cliente: 403 - Access Denied
    else Usuario encontrado
        Service->>+Hash: compare(refreshToken, user.refreshToken)
        Hash-->>-Service: refreshTokenMatches
        
        alt Refresh token no coincide
            Service-->>Controller: ForbiddenException
            Controller-->>Cliente: 403 - Access Denied
        else Refresh token válido
            Service->>+Service: getTokens(user.id, user.email)
            Service->>+JWT: signAsync(payload, {secret, expiresIn: '15m'})
            JWT-->>-Service: accessToken
            Service->>+JWT: signAsync(payload, {secret, expiresIn: '7d'})
            JWT-->>-Service: refreshToken
            Service-->>-Service: {accessToken, refreshToken}
            
            Service->>+Service: updateRefreshToken(user.id, refreshToken)
            Service->>+Hash: hash(refreshToken, 10)
            Hash-->>-Service: hashedRefreshToken
            Service->>+UserRepo: update(userId, {refreshToken: hashedRefreshToken})
            UserRepo-->>-Service: UpdateResult
            Service-->>-Service: void
            
            Service-->>-Controller: TokenResponseDto
            Controller-->>-Cliente: 200 - Tokens refreshed
        end
    end
```

## 5. Obtener Perfil de Usuario

```mermaid
---
title: Obtener Perfil de Usuario
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as AuthController
    participant Service as AuthService
    participant UserRepo as UserRepository

    Usuario->>+Controller: POST /auth/me (Bearer token)
    Controller->>+Service: validateUser(user.id)
    
    Service->>+Service: getUserWithRoles(userId)
    Service->>+UserRepo: findOne({where: {id}, relations: {userRoles: {role: {permissions: {permission}}}}})
    UserRepo-->>-Service: User | null
    Service-->>-Service: user
    
    alt Usuario no encontrado o inactivo
        Service-->>-Controller: null
        Controller-->>Usuario: null
    else Usuario encontrado
        Service->>+Service: getUserPermissions(user.id)
        Service->>Service: extractPermissions(user.userRoles)
        Service-->>-Service: permissions[]
        
        Service->>Service: transformProfileResponse(user, permissions)
        
        Service-->>-Controller: ProfileResponseDto
        Controller-->>-Usuario: 200 - User profile
    end
```

## 6. Validar Token JWT (Test)

```mermaid
---
title: Validar Token JWT
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as AuthController
    participant Guard as JwtAuthGuard

    Usuario->>+Controller: GET /auth/test (Bearer token)
    Controller->>+Guard: validate(token)
    Guard-->>-Controller: JwtUser
    
    Controller->>Controller: buildTestResponse(user)
    
    Controller-->>-Usuario: 200 - Authentication successful
```

## Descripción de Flujos

### 1. Registro de Usuario

- Valida que el email no exista
- Hashea la contraseña con bcrypt (10 rounds)
- Crea el usuario en la base de datos
- Asigna rol por defecto ('cliente') si no se especifica
- Genera access token (15 min) y refresh token (7 días)
- Hashea y guarda el refresh token
- Retorna usuario con tokens

### 2. Inicio de Sesión (Login)

- Busca usuario por email (incluyendo password)
- Verifica que el usuario esté activo
- Compara contraseña con bcrypt
- Genera nuevos tokens
- Actualiza refresh token hasheado
- Actualiza fecha de último login
- Obtiene permisos del usuario (formato: resource:action)
- Retorna usuario con roles, permisos y tokens

### 3. Cerrar Sesión (Logout)

- Valida JWT token actual
- Elimina refresh token de la base de datos
- Invalida sesión del usuario

### 4. Refrescar Tokens

- Valida refresh token mediante JWT guard
- Verifica que el refresh token coincida (bcrypt compare)
- Genera nuevos access y refresh tokens
- Actualiza refresh token hasheado en BD
- Retorna nuevos tokens

### 5. Obtener Perfil de Usuario

- Valida JWT token
- Obtiene usuario con roles y permisos
- Verifica que esté activo
- Transforma permisos a formato resource:action
- Retorna perfil completo con roles y permisos

### 6. Validar Token JWT (Test)

- Endpoint de prueba para validar autenticación
- Útil para debugging y verificación de tokens
- Retorna información del usuario autenticado

## Patrones Implementados

- **JWT Strategy**: Autenticación basada en tokens
- **Guard Pattern**: Protección de rutas con AuthGuards
- **Repository Pattern**: Acceso a datos a través de repositorios
- **Decorator Pattern**: @CurrentUser para inyectar usuario autenticado
- **DTO Pattern**: Transformación de datos (AuthResponseDto, TokenResponseDto, etc.)
- **Security Pattern**: Hash de contraseñas y refresh tokens con bcrypt
- **Token Refresh Pattern**: Refresh tokens de larga duración para renovar access tokens
- **Role-Based Access Control**: Asignación de roles y permisos a usuarios
