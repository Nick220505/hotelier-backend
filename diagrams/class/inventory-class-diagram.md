# Diagrama de Clases - Módulo de Inventario

```mermaid
classDiagram
    %% Controllers
    class InventoryController {
        -InventoryService inventoryService
        +getInventoryItems(category, status) Promise~Inventory[]~
        +getLowStockItems() Promise~Inventory[]~
        +createInventoryItem(itemData) Promise~Inventory~
        +updateInventoryItem(id, updateData) Promise~Inventory~
        +deleteInventoryItem(id) Promise~Inventory~
        +getInventoryMovements() Promise~InventoryMovement[]~
        +createInventoryMovement(movementData) Promise~InventoryMovement~
        +getSuppliers() Promise~SupplierResponseDto[]~
        +getSupplierById(id) Promise~SupplierResponseDto~
        +createSupplier(supplierData) Promise~SupplierResponseDto~
        +updateSupplier(id, updateData) Promise~SupplierResponseDto~
        +deleteSupplier(id) Promise~SupplierResponseDto~
    }

    %% Services
    class InventoryService {
        -Repository~Inventory~ inventoryRepository
        -Repository~InventoryMovement~ movementRepository
        -Repository~Supplier~ supplierRepository
        -NotificationsService notificationsService
        +getInventoryItems() Promise~Inventory[]~
        +getInventoryByCategory(category) Promise~Inventory[]~
        +getInventoryByStatus(status) Promise~Inventory[]~
        +getLowStockItems() Promise~Inventory[]~
        +createInventoryItem(itemData) Promise~Inventory~
        +updateInventoryItem(id, updateData) Promise~Inventory~
        +deleteInventoryItem(id) Promise~Inventory~
        +getInventoryMovements() Promise~InventoryMovement[]~
        +createInventoryMovement(movementData) Promise~InventoryMovement~
        +getSupplierList() Promise~SupplierResponseDto[]~
        +getSupplierById(id) Promise~SupplierResponseDto~
        +createSupplier(supplierData) Promise~SupplierResponseDto~
        +updateSupplier(id, updateData) Promise~SupplierResponseDto~
        +deleteSupplier(id) Promise~SupplierResponseDto~
        -calculateItemStatus(currentStock, minimumStock) InventoryStatus
    }

    %% Entities
    class Inventory {
        +int id
        +string name
        +InventoryCategory category
        +number currentStock
        +number minimumStock
        +string unit
        +number unitCost
        +InventoryStatus status
        +int supplierId
        +Date lastRestockDate
        +Date createdAt
        +Date updatedAt
        +Supplier supplier
        +InventoryMovement[] movements
    }

    class InventoryMovement {
        +int id
        +int inventoryId
        +MovementType movementType
        +number quantity
        +string reason
        +string performedBy
        +Date movementDate
        +Date createdAt
        +Inventory inventory
    }

    class Supplier {
        +int id
        +string name
        +string contactPerson
        +string email
        +string phone
        +string address
        +boolean isActive
        +Date createdAt
        +Date updatedAt
        +Inventory[] inventoryItems
    }

    %% DTOs
    class CreateInventoryItemDto {
        +string name
        +InventoryCategory category
        +number currentStock
        +number minimumStock
        +string unit
        +number unitCost
        +int supplierId
        +Date lastRestockDate
    }

    class UpdateInventoryItemDto {
        +string name
        +InventoryCategory category
        +number currentStock
        +number minimumStock
        +string unit
        +number unitCost
        +InventoryStatus status
        +int supplierId
        +Date lastRestockDate
    }

    class CreateInventoryMovementDto {
        +int inventoryId
        +MovementType movementType
        +number quantity
        +string reason
        +string performedBy
    }

    class CreateSupplierDto {
        +string name
        +string contactPerson
        +string email
        +string phone
        +string address
    }

    class UpdateSupplierDto {
        +string name
        +string contactPerson
        +string email
        +string phone
        +string address
        +boolean isActive
    }

    class SupplierResponseDto {
        +int id
        +string name
        +string contactPerson
        +string email
        +string phone
        +string address
        +boolean isActive
        +Date createdAt
        +Date updatedAt
    }

    %% Enumerations
    class InventoryCategory {
        <<enumeration>>
        LINENS
        AMENITIES
        CLEANING_SUPPLIES
        FOOD_BEVERAGE
        MAINTENANCE
        OFFICE_SUPPLIES
        FURNITURE
        ELECTRONICS
    }

    class InventoryStatus {
        <<enumeration>>
        AVAILABLE
        LOW_STOCK
        OUT_OF_STOCK
        DISCONTINUED
    }

    class MovementType {
        <<enumeration>>
        IN
        OUT
        ADJUSTMENT
        TRANSFER
        DAMAGE
        EXPIRATION
    }

    %% Relationships
    InventoryController --> InventoryService : uses
    InventoryController ..> CreateInventoryItemDto : receives
    InventoryController ..> UpdateInventoryItemDto : receives
    InventoryController ..> CreateInventoryMovementDto : receives
    InventoryController ..> CreateSupplierDto : receives
    InventoryController ..> UpdateSupplierDto : receives
    InventoryController ..> SupplierResponseDto : returns
    
    InventoryService --> Inventory : manages
    InventoryService --> InventoryMovement : manages
    InventoryService --> Supplier : manages
    InventoryService ..> CreateInventoryItemDto : creates from
    InventoryService ..> UpdateInventoryItemDto : updates from
    InventoryService ..> CreateInventoryMovementDto : creates from
    InventoryService ..> CreateSupplierDto : creates from
    InventoryService ..> UpdateSupplierDto : updates from
    InventoryService ..> SupplierResponseDto : builds
    
    Inventory --> InventoryCategory : category
    Inventory --> InventoryStatus : status
    Inventory --> Supplier : belongs to
    Inventory "1" --o "0..*" InventoryMovement : has movements
    
    InventoryMovement --> Inventory : references
    InventoryMovement --> MovementType : type
    
    Supplier "1" --o "0..*" Inventory : supplies
    
    CreateInventoryItemDto --> InventoryCategory : category
    UpdateInventoryItemDto --> InventoryCategory : category
    UpdateInventoryItemDto --> InventoryStatus : status
    CreateInventoryMovementDto --> MovementType : type
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de inventario:

### Controllers
- **InventoryController**: Maneja peticiones HTTP para gestión de inventario, movimientos y proveedores

### Services
- **InventoryService**: Lógica de negocio para inventario
  - Gestión de items de inventario
  - Tracking de movimientos (entradas/salidas/ajustes)
  - Gestión de proveedores
  - Alertas automáticas de stock bajo
  - Cálculo de estado de inventario

### Entities
- **Inventory**: Item de inventario del hotel
  - Nombre y categoría
  - Stock actual y mínimo
  - Costo unitario
  - Estado (disponible, bajo stock, agotado)
  - Proveedor asociado
  - Fecha de último reabastecimiento
- **InventoryMovement**: Movimiento de inventario
  - Tipo de movimiento (IN, OUT, ADJUSTMENT, etc.)
  - Cantidad y razón
  - Quién realizó el movimiento
  - Fecha del movimiento
- **Supplier**: Proveedor de inventario
  - Información de contacto completa
  - Estado activo/inactivo
  - Relación con items suministrados

### DTOs
- **CreateInventoryItemDto**: Datos para crear item de inventario
- **UpdateInventoryItemDto**: Datos para actualizar item
- **CreateInventoryMovementDto**: Datos para registrar movimiento
- **CreateSupplierDto**: Datos para crear proveedor
- **UpdateSupplierDto**: Datos para actualizar proveedor
- **SupplierResponseDto**: Respuesta con datos de proveedor

### Enumerations
- **InventoryCategory**: Categorías de inventario
  - LINENS: Ropa de cama y toallas
  - AMENITIES: Amenidades para huéspedes
  - CLEANING_SUPPLIES: Suministros de limpieza
  - FOOD_BEVERAGE: Alimentos y bebidas
  - MAINTENANCE: Mantenimiento
  - OFFICE_SUPPLIES: Suministros de oficina
  - FURNITURE: Muebles
  - ELECTRONICS: Electrónicos
- **InventoryStatus**: Estados de inventario
  - AVAILABLE: Disponible
  - LOW_STOCK: Stock bajo
  - OUT_OF_STOCK: Agotado
  - DISCONTINUED: Descontinuado
- **MovementType**: Tipos de movimiento
  - IN: Entrada (compra, recepción)
  - OUT: Salida (uso, venta)
  - ADJUSTMENT: Ajuste de inventario
  - TRANSFER: Transferencia
  - DAMAGE: Daño/pérdida
  - EXPIRATION: Expiración

### Funcionalidades Principales
- Gestión completa de inventario del hotel
- Tracking en tiempo real de stock
- Alertas automáticas de stock bajo/agotado (integración con notificaciones)
- Historial de movimientos de inventario
- Gestión de proveedores
- Filtrado por categoría y estado
- Cálculo automático de estado basado en stock actual vs. mínimo
- Control de última fecha de reabastecimiento
- Múltiples tipos de movimientos para tracking detallado
