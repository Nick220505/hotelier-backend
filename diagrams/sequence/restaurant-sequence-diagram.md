# Diagrama de Secuencia - Módulo de Restaurante

## 1. Crear Orden de Servicio a Habitación

```mermaid
---
title: Crear Orden de Servicio a Habitación
---
sequenceDiagram
    autonumber
    actor Huésped
    participant Controller as RestaurantController
    participant Service as RestaurantService
    participant OrderRepo as RoomServiceOrderRepository
    participant MenuRepo as MenuItemRepository

    Huésped->>+Controller: POST /restaurant/room-service (createOrderDto)
    Controller->>+Service: createRoomServiceOrder(orderData)
    
    Service->>+OrderRepo: count()
    OrderRepo-->>-Service: orderCount
    
    Service->>Service: generateOrderNumber(count + 1)
    Note over Service: Format: RS001, RS002, etc.
    
    Service->>Service: setOrderTime(now)
    Service->>Service: setStatus(PENDING)
    
    Service->>+OrderRepo: save(orderData)
    OrderRepo-->>-Service: RoomServiceOrder
    
    Service-->>-Controller: RoomServiceOrder
    Controller-->>-Huésped: 201 - Order created
```

## 2. Actualizar Estado de Orden

```mermaid
---
title: Actualizar Estado de Orden
---
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as RestaurantController
    participant Service as RestaurantService
    participant OrderRepo as RoomServiceOrderRepository

    Personal->>+Controller: PATCH /restaurant/room-service/:id (updateDto)
    Controller->>+Service: updateRoomServiceOrder(id, orderData)
    
    Service->>+OrderRepo: getRoomServiceOrderById(id)
    OrderRepo-->>-Service: RoomServiceOrder
    
    alt Orden no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Personal: 404 - Order not found
    else Orden encontrada
        alt Status = PREPARING
            Note over Service: Orden en preparación
        else Status = READY
            Note over Service: Orden lista para entrega
        else Status = DELIVERED
            Note over Service: Orden entregada
        else Status = CANCELLED
            Note over Service: Orden cancelada
        end
        
        Service->>+OrderRepo: update(id, orderData)
        OrderRepo-->>-Service: UpdateResult
        
        Service->>+OrderRepo: getRoomServiceOrderById(id)
        OrderRepo-->>-Service: RoomServiceOrder
        
        Service-->>-Controller: RoomServiceOrder
        Controller-->>-Personal: 200 - Order updated
    end
```

## 3. Gestión de Menú - Crear Item

```mermaid
---
title: Crear Item del Menú
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RestaurantController
    participant Service as RestaurantService
    participant MenuRepo as MenuItemRepository

    Admin->>+Controller: POST /restaurant/menu (createMenuItemDto)
    Controller->>+Service: createMenuItem(itemData)
    
    Service->>+MenuRepo: count()
    MenuRepo-->>-Service: itemCount
    
    Service->>Service: generateItemCode(count + 1)
    Note over Service: Format: MENU001, MENU002, etc.
    
    Service->>+MenuRepo: save(itemData)
    MenuRepo-->>-Service: MenuItem
    
    Service-->>-Controller: MenuItem
    Controller-->>-Admin: 201 - Menu item created
```

## 4. Actualizar Item del Menú

```mermaid
---
title: Actualizar Item del Menú
---
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as RestaurantController
    participant Service as RestaurantService
    participant MenuRepo as MenuItemRepository

    Admin->>+Controller: PATCH /restaurant/menu/:id (updateDto)
    Controller->>+Service: updateMenuItem(id, itemData)
    
    Service->>+MenuRepo: getMenuItemById(id)
    MenuRepo-->>-Service: MenuItem
    
    alt Item no encontrado
        Service-->>Controller: NotFoundException
        Controller-->>Admin: 404 - Menu item not found
    else Item encontrado
        Service->>+MenuRepo: update(id, itemData)
        MenuRepo-->>-Service: UpdateResult
        
        Service->>+MenuRepo: getMenuItemById(id)
        MenuRepo-->>-Service: Updated MenuItem
        
        Service-->>-Controller: MenuItem
        Controller-->>-Admin: 200 - Menu item updated
    end
```

## 5. Gestión de Inventario de Bebidas

```mermaid
---
title: Gestión de Inventario de Bebidas
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as RestaurantController
    participant Service as RestaurantService
    participant BeverageRepo as BeverageInventoryRepository

    Gerente->>+Controller: PATCH /restaurant/beverages/:id/stock (updateStockDto)
    Controller->>+Service: updateBeverageStock(id, stock)
    
    Service->>+BeverageRepo: getBeverageItemById(id)
    BeverageRepo-->>-Service: BeverageInventory
    
    alt Bebida no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Gerente: 404 - Beverage not found
    else Bebida encontrada
        Service->>Service: calculateStatus(stock, minimumStock)
        
        alt stock = 0
            Service->>Service: setStatus(OUT_OF_STOCK)
        else stock < minimumStock
            Service->>Service: setStatus(LOW_STOCK)
        else stock >= minimumStock
            Service->>Service: setStatus(AVAILABLE)
        end
        
        Service->>+BeverageRepo: update(id, {stock, status})
        BeverageRepo-->>-Service: UpdateResult
        
        Service->>+BeverageRepo: getBeverageItemById(id)
        BeverageRepo-->>-Service: Updated BeverageInventory
        
        Service-->>-Controller: BeverageInventory
        Controller-->>-Gerente: 200 - Stock updated
    end
```

## 6. Consultar Bebidas con Stock Bajo

```mermaid
---
title: Consultar Bebidas con Stock Bajo
---
sequenceDiagram
    autonumber
    actor Gerente
    participant Controller as RestaurantController
    participant Service as RestaurantService
    participant BeverageRepo as BeverageInventoryRepository

    Gerente->>+Controller: GET /restaurant/beverages/low-stock
    Controller->>+Service: getLowStockBeverages()
    
    Service->>+BeverageRepo: find({where: {status: LOW_STOCK}})
    BeverageRepo-->>-Service: BeverageInventory[]
    
    Service-->>-Controller: BeverageInventory[]
    Controller-->>-Gerente: 200 - Low stock beverages
```

## 7. Consultar Órdenes de Servicio a Habitación

```mermaid
---
title: Consultar Órdenes de Servicio a Habitación
---
sequenceDiagram
    autonumber
    actor Personal
    participant Controller as RestaurantController
    participant Service as RestaurantService
    participant OrderRepo as RoomServiceOrderRepository

    Personal->>+Controller: GET /restaurant/room-service
    Controller->>+Service: getRoomServiceOrders()
    
    Service->>+OrderRepo: find({order: {createdAt: DESC}})
    OrderRepo-->>-Service: RoomServiceOrder[]
    
    Service-->>-Controller: RoomServiceOrder[]
    Controller-->>-Personal: 200 - Room service orders
```

## Descripción de Flujos

### 1. Crear Orden de Servicio a Habitación

- Huésped solicita servicio a habitación
- Se genera número de orden automáticamente
- Se establece hora de pedido y estado inicial (PENDING)
- Se guarda la orden con items y total

### 2. Actualizar Estado de Orden

- Personal actualiza estado de la orden
- Ciclo: PENDING → PREPARING → READY → DELIVERED
- También permite CANCELLED en cualquier momento
- Tracking del progreso de la orden

### 3. Gestión de Menú - Crear Item

- Administrador agrega nuevo item al menú
- Se genera código único automáticamente
- Se incluyen precio, ingredientes, alérgenos
- Se define disponibilidad y tiempo de preparación

### 4. Actualizar Item del Menú

- Permite modificar cualquier atributo del item
- Útil para cambios de precio, disponibilidad
- Actualización de ingredientes o alérgenos

### 5. Gestión de Inventario de Bebidas

- Actualización de stock de bebidas
- Cálculo automático de estado según stock
- Alertas de stock bajo o agotado

### 6. Consultar Bebidas con Stock Bajo

- Consulta rápida de bebidas que necesitan reabastecimiento
- Filtra por stock menor al mínimo
- Útil para planificación de compras

### 7. Consultar Órdenes de Servicio a Habitación

- Lista todas las órdenes
- Ordenadas por fecha de creación (más recientes primero)
- Permite monitoring de servicio a habitación

## Patrones Implementados

- **State Pattern**: Estados de orden (PENDING, PREPARING, READY, DELIVERED, CANCELLED)
- **Factory Pattern**: Generación automática de códigos y números de orden
- **Repository Pattern**: Acceso a datos a través de repositorios
- **Service Layer**: Lógica de negocio en el servicio
- **Strategy Pattern**: Cálculo de estado de bebidas según stock
