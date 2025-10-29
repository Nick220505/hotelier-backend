# Diagrama de Secuencia - Módulo de Roles

## 1. Crear Rol

```mermaid
---
title: Crear Rol
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RolesController
    participant Service as RolesService
    participant RoleRepo as RoleRepository

    Admin->>+Controller: POST /roles (createRoleDto)
    Controller->>+Service: createRole(data)
    
    Service->>+RoleRepo: save({name, description})
    RoleRepo-->>-Service: Role
    
    alt Error: Nombre duplicado (código 23505)
        Service-->>Controller: Error: Role already exists
        Controller-->>Admin: 400 - Role with name already exists
    else Rol creado
        Service-->>-Controller: Role
        Controller-->>-Admin: 201 - Role created
    end
```

## 2. Listar Todos los Roles

```mermaid
---
title: Listar Todos los Roles
---
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as RolesController
    participant Service as RolesService
    participant RoleRepo as RoleRepository

    Usuario->>+Controller: GET /roles
    Controller->>+Service: findAllRoles()
    
    Service->>+RoleRepo: find({relations: {permissions: {permission: true}}, order: {name: ASC}})
    RoleRepo-->>-Service: Role[]
    
    Service-->>-Controller: Role[]
    Controller-->>-Usuario: 200 - Roles with permissions
```

## 3. Actualizar Rol

```mermaid
---
title: Actualizar Rol
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RolesController
    participant Service as RolesService
    participant RoleRepo as RoleRepository

    Admin->>+Controller: PUT /roles/:id (updateRoleDto)
    Controller->>+Service: updateRole(id, data)
    
    Service->>+Service: findRoleById(id)
    Service->>+RoleRepo: findOne({where: {id}, relations: {permissions: {permission}}})
    RoleRepo-->>-Service: Role | null
    Service-->>-Service: role
    
    alt Rol no encontrado
        Service-->>Controller: Error: Role not found
        Controller-->>Admin: 404 - Role not found
    else Rol encontrado
        Service->>+RoleRepo: update(id, data)
        RoleRepo-->>-Service: UpdateResult
        
        alt Error: Nombre duplicado
            Service-->>Controller: Error: Role already exists
            Controller-->>Admin: 400 - Role with name already exists
        else Actualizado
            Service->>+Service: findRoleById(id)
            Service->>+RoleRepo: findOne({where: {id}, relations: {permissions: {permission}}})
            RoleRepo-->>-Service: Role
            Service-->>-Service: updated role
            
            Service-->>-Controller: Role
            Controller-->>-Admin: 200 - Role updated
        end
    end
```

## 4. Eliminar Rol

```mermaid
---
title: Eliminar Rol
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RolesController
    participant Service as RolesService
    participant RoleRepo as RoleRepository
    participant UserRoleRepo as UserRoleRepository

    Admin->>+Controller: DELETE /roles/:id
    Controller->>+Service: deleteRole(id)
    
    Service->>+Service: findRoleById(id)
    Service->>+RoleRepo: findOne({where: {id}, relations: {permissions: {permission}}})
    RoleRepo-->>-Service: Role | null
    Service-->>-Service: role
    
    alt Rol no encontrado
        Service-->>Controller: Error: Role not found
        Controller-->>Admin: 404 - Role not found
    else Rol es del sistema
        Service-->>Controller: Error: Cannot delete system role
        Controller-->>Admin: 400 - Cannot delete system role
    else Rol asignado a usuarios
        Service->>+UserRoleRepo: count({where: {roleId: id}})
        UserRoleRepo-->>-Service: userCount > 0
        Service-->>Controller: Error: Role is assigned to users
        Controller-->>Admin: 400 - Cannot delete role assigned to users
    else Puede eliminar
        Service->>+RoleRepo: remove(role)
        RoleRepo-->>-Service: Role
        
        Service-->>-Controller: Role
        Controller-->>-Admin: 200 - Role deleted
    end
```

## 5. Asignar Permisos a Rol

```mermaid
---
title: Asignar Permisos a Rol
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RolesController
    participant Service as RolesService
    participant RolePermissionRepo as RolePermissionRepository
    participant PermissionRepo as SystemPermissionRepository

    Admin->>+Controller: POST /roles/:roleId/permissions (permissionIds[])
    Controller->>+Service: assignPermissionsToRole(roleId, permissionIds)
    
    loop Para cada permissionId
        Service->>+PermissionRepo: findOne({where: {id: permissionId}})
        PermissionRepo-->>-Service: Permission | null
        
        alt Permiso no encontrado
            Service->>Service: skip this permission
        else Permiso encontrado
            Service->>+RolePermissionRepo: save({roleId, permissionId})
            RolePermissionRepo-->>-Service: RolePermission
        end
    end
    
    Service->>+Service: findRoleById(roleId)
    Service-->>-Service: updated role
    
    Service-->>-Controller: Role with permissions
    Controller-->>-Admin: 200 - Permissions assigned
```

## 6. Obtener Todos los Permisos

```mermaid
---
title: Obtener Todos los Permisos
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RolesController
    participant Service as RolesService
    participant PermissionRepo as SystemPermissionRepository

    Admin->>+Controller: GET /roles/permissions
    Controller->>+Service: findAllPermissions()
    
    Service->>+PermissionRepo: find({order: {resource: ASC, action: ASC}})
    PermissionRepo-->>-Service: SystemPermission[]
    
    Service-->>-Controller: SystemPermission[]
    Controller-->>-Admin: 200 - All permissions
```

## Descripción de Flujos

### 1. Crear Rol

- Crea nuevo rol con nombre y descripción
- Valida unicidad del nombre
- Maneja constraint violations (código 23505)

### 2. Listar Todos los Roles

- Recupera todos los roles con sus permisos
- Incluye relaciones: permissions.permission
- Ordenado alfabéticamente por nombre

### 3. Actualizar Rol

- Valida existencia del rol
- Actualiza nombre y/o descripción
- Valida unicidad del nuevo nombre
- Retorna rol actualizado con permisos

### 4. Eliminar Rol

- Validaciones múltiples:
  - Rol existe
  - No es rol del sistema (isSystem: false)
  - No está asignado a usuarios
- Elimina rol si pasa validaciones

### 5. Asignar Permisos a Rol

- Asigna múltiples permisos a un rol
- Valida existencia de cada permiso
- Crea relaciones RolePermission
- Retorna rol con permisos actualizados

### 6. Obtener Todos los Permisos

- Lista todos los permisos del sistema
- Ordenados por recurso y acción
- Útil para UI de asignación de permisos

## Patrones Implementados

- **Repository Pattern**: Acceso a datos
- **Validation Pattern**: Múltiples validaciones de negocio
- **Constraint Handling**: Manejo de unique constraints
- **System Protection**: Protección de roles del sistema
- **Many-to-Many Pattern**: Relación roles-permisos
