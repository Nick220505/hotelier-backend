# Diagrama de Secuencia - Módulo de Inventario

## 1. Crear Item de Inventario

```mermaid
sequenceDiagram
    autonumber
    actor Administrador
    participant Controller as InventoryController
    participant Service as InventoryService
    participant InventoryRepo as InventoryRepository
    participant SupplierRepo as SupplierRepository

    Administrador->>+Controller: POST /inventory (createInventoryItemDto)
    Controller->>+Service: createInventoryItem(itemData)
    
    Service->>+SupplierRepo: findOne({where: {id: supplierId}})
    SupplierRepo-->>-Service: Supplier
    
    alt Proveedor no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Administrador: 404 - Supplier not found
    else Proveedor encontrado
        Service->>Service: calculateItemStatus(currentStock, minimumStock)
        
        alt currentStock = 0
            Service->>Service: status = OUT_OF_STOCK
        else currentStock < minimumStock
            Service->>Service: status = LOW_STOCK
        else currentStock >= minimumStock
            Service->>Service: status = AVAILABLE
        end
        
        Service->>+InventoryRepo: save(inventoryItemData)
        InventoryRepo-->>-Service: Inventory
        
        Service-->>-Controller: Inventory
        Controller-->>-Administrador: 201 - Inventory item created
    end
```

## 2. Actualizar Stock de Item

```mermaid
sequenceDiagram
    autonumber
    actor Encargado
    participant Controller as InventoryController
    participant Service as InventoryService
    participant InventoryRepo as InventoryRepository
    participant Notifications as NotificationsService

    Encargado->>+Controller: PATCH /inventory/:id (updateDto)
    Controller->>+Service: updateInventoryItem(id, updateData)
    
    Service->>+InventoryRepo: findOne({where: {id}})
    InventoryRepo-->>-Service: Inventory
    
    alt Item no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Encargado: 404 - Item not found
    else Item encontrado
        Service->>Service: calculateItemStatus(newStock, minimumStock)
        
        alt newStock = 0
            Service->>Service: status = OUT_OF_STOCK
            Service->>+Notifications: createSystemAlert(title, message, refId, refType)
            Note over Notifications: CRITICAL: Out of stock
            Notifications-->>-Service: Alert sent
        else newStock < minimumStock
            Service->>Service: status = LOW_STOCK
            Service->>+Notifications: createSystemAlert(title, message, refId, refType)
            Note over Notifications: WARNING: Low stock
            Notifications-->>-Service: Alert sent
        else newStock >= minimumStock
            Service->>Service: status = AVAILABLE
        end
        
        Service->>+InventoryRepo: update(id, {stock, status})
        InventoryRepo-->>-Service: UpdateResult
        
        Service->>+InventoryRepo: findOne({where: {id}})
        InventoryRepo-->>-Service: Updated Inventory
        
        Service-->>-Controller: Inventory
        Controller-->>-Encargado: 200 - Stock updated
    end
```

## 3. Registrar Movimiento de Inventario

```mermaid
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as InventoryController
    participant Service as InventoryService
    participant InventoryRepo as InventoryRepository
    participant MovementRepo as InventoryMovementRepository

    Personal->>+Controller: POST /inventory/movements (createMovementDto)
    Controller->>+Service: createInventoryMovement(createMovementDto)
    
    Service->>+InventoryRepo: findOne(inventoryId)
    InventoryRepo-->>-Service: Inventory
    
    alt Item no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Personal: 404 - Inventory item not found
    else Item encontrado
        Service->>Service: calculateNewStock(movement)
        
        alt movementType = IN
            Service->>Service: newStock = current + quantity
        else movementType = OUT
            Service->>Service: newStock = current - quantity
        else movementType = ADJUSTMENT
            Service->>Service: newStock = quantity (absolute)
        else movementType = DAMAGE || EXPIRATION
            Service->>Service: newStock = current - quantity
        end
        
        Service->>+MovementRepo: save(movementData)
        MovementRepo-->>-Service: InventoryMovement
        
        Service->>Service: calculateItemStatus(newStock, minimumStock)
        
        Service->>+InventoryRepo: update(inventoryId, {currentStock, status})
        InventoryRepo-->>-Service: UpdateResult
        
        Service-->>-Controller: InventoryMovement
        Controller-->>-Personal: 201 - Movement registered
    end
```

## 4. Consultar Items con Stock Bajo

```mermaid
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as InventoryController
    participant Service as InventoryService
    participant InventoryRepo as InventoryRepository

    Gerente->>+Controller: GET /inventory/low-stock
    Controller->>+Service: getLowStockItems()
    
    Service->>+InventoryRepo: find(currentStock < minimumStock)
    InventoryRepo-->>-Service: Inventory[]
    
    Service->>Service: filterByStatus(LOW_STOCK, OUT_OF_STOCK)
    Service->>Service: sortByCriticality()
    Note over Service: Prioriza OUT_OF_STOCK<br/>luego LOW_STOCK
    
    Service-->>-Controller: Inventory[]
    Controller-->>-Gerente: 200 - Low stock items
```

## 5. Filtrar Inventario por Categoría

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as InventoryController
    participant Service as InventoryService
    participant InventoryRepo as InventoryRepository

    Usuario->>+Controller: GET /inventory?category=LINENS
    Controller->>+Service: getInventoryByCategory(category)
    
    Service->>+InventoryRepo: find(category = LINENS, relations: supplier)
    InventoryRepo-->>-Service: Inventory[]
    
    Service-->>-Controller: Inventory[]
    Controller-->>-Usuario: 200 - Inventory items by category
```

## 6. Gestión de Proveedores - Crear Proveedor

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as InventoryController
    participant Service as InventoryService
    participant SupplierRepo as SupplierRepository

    Admin->>+Controller: POST /inventory/suppliers (createSupplierDto)
    Controller->>+Service: createSupplier(createSupplierDto)
    
    Service->>+SupplierRepo: findByEmail(email)
    SupplierRepo-->>-Service: Supplier | null
    
    alt Email ya existe
        Service-->>Controller: ConflictException
        Controller-->>Admin: 409 - Supplier email already exists
    else Email disponible
        Service->>Service: setDefaultStatus(isActive: true)
        
        Service->>+SupplierRepo: save(supplierData)
        SupplierRepo-->>-Service: Supplier
        
        Service->>Service: transformToResponse(supplier)
        
        Service-->>-Controller: SupplierResponseDto
        Controller-->>-Admin: 201 - Supplier created
    end
```

## 7. Actualizar Proveedor

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as InventoryController
    participant Service as InventoryService
    participant SupplierRepo as SupplierRepository

    Admin->>+Controller: PATCH /inventory/suppliers/:id (updateSupplierDto)
    Controller->>+Service: updateSupplier(id, updateSupplierDto)
    
    Service->>+SupplierRepo: findOne(id)
    SupplierRepo-->>-Service: Supplier
    
    alt Proveedor no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Admin: 404 - Supplier not found
    else Proveedor encontrado
        opt Si actualiza email
            Service->>+SupplierRepo: findByEmail(newEmail)
            SupplierRepo-->>-Service: ExistingSupplier | null
            
            alt Email ya existe
                Service-->>Controller: ConflictException
                Controller-->>Admin: 409 - Email already in use
            end
        end
        
        Service->>+SupplierRepo: update(id, updateDto)
        SupplierRepo-->>-Service: UpdateResult
        
        Service->>+SupplierRepo: findOne(id)
        SupplierRepo-->>-Service: Updated Supplier
        
        Service->>Service: transformToResponse(supplier)
        
        Service-->>-Controller: SupplierResponseDto
        Controller-->>-Admin: 200 - Supplier updated
    end
```

## 8. Consultar Historial de Movimientos

```mermaid
sequenceDiagram
    autonumber
    actor Auditor
    participant Controller as InventoryController
    participant Service as InventoryService
    participant MovementRepo as InventoryMovementRepository

    Auditor->>+Controller: GET /inventory/movements
    Controller->>+Service: getInventoryMovements()
    
    Service->>+MovementRepo: find(relations: inventory, order by date DESC)
    MovementRepo-->>-Service: InventoryMovement[]
    
    Service-->>-Controller: InventoryMovement[]
    Note over Controller: Incluye: tipo, cantidad,<br/>razón, fecha, responsable
    Controller-->>-Auditor: 200 - Movement history
```

## Descripción de Flujos

### 1. Crear Item de Inventario

- Validación de proveedor existente
- Cálculo automático de estado según stock
- Registro del item con categoría y unidad
- Establecimiento de stock mínimo para alertas

### 2. Actualizar Stock de Item

- Actualización de cantidad en stock
- Recalculo automático de estado
- Envío de notificaciones si stock bajo o agotado
- Tracking de cambios de estado

### 3. Registrar Movimiento de Inventario

- Registro de entrada/salida/ajuste de stock
- Actualización automática del stock actual
- Tipos: IN (entrada), OUT (salida), ADJUSTMENT (ajuste), DAMAGE (daño), EXPIRATION (vencimiento)
- Mantiene historial completo de movimientos

### 4. Consultar Items con Stock Bajo

- Identificación rápida de items críticos
- Filtrado por estado LOW_STOCK y OUT_OF_STOCK
- Ordenamiento por criticidad
- Útil para planificación de compras

### 5. Filtrar Inventario por Categoría

- Consulta de items por categoría específica
- Categorías: LINENS, AMENITIES, CLEANING_SUPPLIES, FOOD_BEVERAGE, etc.
- Incluye información del proveedor
- Facilita gestión departamental

### 6. Gestión de Proveedores - Crear Proveedor

- Registro de nuevo proveedor
- Validación de email único
- Información de contacto completa
- Estado activo por defecto

### 7. Actualizar Proveedor

- Modificación de datos del proveedor
- Validación de email único si cambia
- Permite activar/desactivar proveedor
- Transformación segura de respuesta

### 8. Consultar Historial de Movimientos

- Auditoría completa de movimientos
- Trazabilidad de cambios de stock
- Incluye responsable y razón
- Ordenado cronológicamente

## Patrones Implementados

- **State Pattern**: Estados de inventario (AVAILABLE, LOW_STOCK, OUT_OF_STOCK, DISCONTINUED)
- **Observer Pattern**: Sistema de notificaciones para stock bajo
- **Strategy Pattern**: Diferentes tipos de movimientos con comportamiento específico
- **Repository Pattern**: Acceso a datos a través de repositorios
- **Factory Pattern**: Cálculo de estado según reglas de negocio
- **Audit Pattern**: Tracking completo de movimientos para trazabilidad
- **DTO Pattern**: Transformación segura de datos (SupplierResponseDto)
