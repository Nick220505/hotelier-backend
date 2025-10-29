# Diagrama de Secuencia - Módulo de Permisos

## 1. Crear Permiso del Sistema

```mermaid
---
title: Crear Permiso del Sistema
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as PermissionsController
    participant Service as PermissionsService
    participant PermissionRepo as SystemPermissionRepository

    Admin->>+Controller: POST /permissions (createPermissionDto)
    Controller->>+Service: create(data)
    
    Service->>+PermissionRepo: save({resource, action, description})
    PermissionRepo-->>-Service: SystemPermission
    
    alt Error: Permiso duplicado
        Service-->>Controller: Error: Permission already exists
        Controller-->>Admin: 400 - Permission already exists
    else Permiso creado
        Service-->>-Controller: SystemPermission
        Controller-->>-Admin: 201 - Permission created
    end
```

## 2. Listar Todos los Permisos

```mermaid
---
title: Listar Todos los Permisos
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as PermissionsController
    participant Service as PermissionsService
    participant PermissionRepo as SystemPermissionRepository

    Admin->>+Controller: GET /permissions
    Controller->>+Service: findAll()
    
    Service->>+PermissionRepo: find({order: {resource: ASC, action: ASC}})
    PermissionRepo-->>-Service: SystemPermission[]
    
    Service-->>-Controller: SystemPermission[]
    Controller-->>-Admin: 200 - All permissions
```

## 3. Listar Permisos por Recurso

```mermaid
---
title: Listar Permisos por Recurso
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as PermissionsController
    participant Service as PermissionsService
    participant PermissionRepo as SystemPermissionRepository

    Admin->>+Controller: GET /permissions/resource/:resource
    Controller->>+Service: findByResource(resource)
    
    Service->>+PermissionRepo: find({where: {resource}, order: {action: ASC}})
    PermissionRepo-->>-Service: SystemPermission[]
    
    Service-->>-Controller: SystemPermission[]
    Controller-->>-Admin: 200 - Permissions by resource
```

## 4. Actualizar Permiso

```mermaid
---
title: Actualizar Permiso
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as PermissionsController
    participant Service as PermissionsService
    participant PermissionRepo as SystemPermissionRepository

    Admin->>+Controller: PATCH /permissions/:id (updatePermissionDto)
    Controller->>+Service: update(id, data)
    
    Service->>+PermissionRepo: findOne({where: {id}})
    PermissionRepo-->>-Service: SystemPermission | null
    
    alt Permiso no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Admin: 404 - Permission not found
    else Permiso encontrado
        Service->>+PermissionRepo: update(id, data)
        PermissionRepo-->>-Service: UpdateResult
        
        Service->>+PermissionRepo: findOne({where: {id}})
        PermissionRepo-->>-Service: SystemPermission
        
        Service-->>-Controller: SystemPermission
        Controller-->>-Admin: 200 - Permission updated
    end
```

## Patrones Implementados

- **Repository Pattern**: Acceso a datos
- **Resource-Action Pattern**: Permisos basados en recurso:acción
- **RBAC Pattern**: Control de acceso basado en roles
