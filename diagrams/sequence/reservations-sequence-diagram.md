# Diagrama de Secuencia - Módulo de Reservaciones

## 1. Crear Reserva

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant Controller as ReservationsController
    participant Service as ReservationsService
    participant RoomRepo as RoomRepository
    participant ReservationRepo as ReservationRepository
    participant Notifications as NotificationsService

    Cliente->>+Controller: POST /reservations (createReservationDto)
    Controller->>+Service: create(data)
    
    Service->>+RoomRepo: findOne({where: {id: data.roomId}})
    RoomRepo-->>-Service: Room
    
    alt Habitación no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Cliente: 404 - Room not found
    else Habitación encontrada
        Service->>Service: calculateNights(checkIn, checkOut)
        Service->>Service: calculateTotalAmount(room.price, nights, discount)
        
        Service->>+ReservationRepo: save(reservationData)
        ReservationRepo-->>-Service: Reservation
        
        Service->>+Notifications: createSystemAlert(title, message, refId, refType)
        Notifications-->>-Service: Notification created
        
        Service-->>-Controller: Reservation
        Controller-->>-Cliente: 201 - Reservation created
    end
```

## 2. Consultar Disponibilidad

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant Controller as ReservationsController
    participant Service as ReservationsService
    participant DB as Database

    Cliente->>+Controller: GET /reservations/availability?startDate&endDate&type&guests
    Controller->>+Service: getAvailability(startDate, endDate, type, guests)
    
    Service->>Service: validateDateRange(startDate, endDate)
    
    alt Rango de fechas inválido
        Service-->>Controller: BadRequestException
        Controller-->>Cliente: 400 - Invalid date range
    else Rango válido
        Service->>+DB: Query available rooms<br/>(exclude blocked reservations)
        Note over Service,DB: Excluye habitaciones con<br/>reservas PENDING, CONFIRMED<br/>o CHECKED_IN en el rango
        DB-->>-Service: Available rooms[]
        
        opt Filtrar por tipo
            Service->>Service: filter(type)
        end
        
        opt Filtrar por capacidad
            Service->>Service: filter(capacity >= guests)
        end
        
        Service-->>-Controller: Room[]
        Controller-->>-Cliente: 200 - Available rooms
    end
```

## 3. Proceso de Check-out

```mermaid
sequenceDiagram
    autonumber
    actor Recepcionista
    participant Controller as ReservationsController
    participant Service as ReservationsService
    participant ReservationRepo as ReservationRepository
    participant RoomRepo as RoomRepository
    participant InvoiceRepo as InvoiceRepository
    participant InvoiceItemRepo as InvoiceItemRepository
    participant RoomServiceRepo as RoomServiceOrderRepository
    participant HousekeepingService
    participant Notifications as NotificationsService

    Recepcionista->>+Controller: POST /reservations/:id/checkout
    Controller->>+Service: checkoutReservation(id)
    
    Service->>+Service: findOne(id)
    Service->>+ReservationRepo: findOne({where: {id}, relations: {guest, room, user}})
    ReservationRepo-->>-Service: Reservation
    Service-->>-Service: Reservation
    
    alt Reserva no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Recepcionista: 404 - Reservation not found
    else Ya está en checkout
        Service-->>Controller: {reservation}
        Controller-->>Recepcionista: 200 - Already checked out
    else Procesar checkout
        Service->>+ReservationRepo: update(id, {status: CHECKED_OUT})
        ReservationRepo-->>-Service: UpdateResult
        
        Service->>+RoomRepo: update(roomId, {isAvailable: false})
        RoomRepo-->>-Service: UpdateResult
        
        Service->>+HousekeepingService: createCleaningAssignment(cleaningDto)
        Note over Service,HousekeepingService: roomId, notes, employeeId
        HousekeepingService-->>-Service: CleaningAssignment
        
        Service->>+Notifications: createSystemAlert(title, message, refId, refType)
        Notifications-->>-Service: Notification created
        
        Service->>+InvoiceRepo: findOne({where: {reservationId: id}})
        InvoiceRepo-->>-Service: Invoice | null
        
        alt Factura no existe
            Service->>+RoomServiceRepo: createQueryBuilder().where(...).getMany()
            Note over Service,RoomServiceRepo: Orders between checkIn and checkOut
            RoomServiceRepo-->>-Service: RoomServiceOrder[]
            
            Service->>Service: calculateCharges(room, nights, orders)
            
            Service->>+InvoiceRepo: save(invoiceData)
            InvoiceRepo-->>-Service: Invoice
            
            Service->>+InvoiceItemRepo: save(roomItemData)
            InvoiceItemRepo-->>-Service: InvoiceItem (room)
            
            opt Restaurant charges exist
                Service->>+InvoiceItemRepo: save(restaurantItemData)
                InvoiceItemRepo-->>-Service: InvoiceItem (restaurant)
            end
        end
        
        Service->>+Service: findOne(id)
        Service->>+ReservationRepo: findOne({where: {id}, relations: {guest, room, user}})
        ReservationRepo-->>-Service: Updated Reservation
        Service-->>-Service: Updated Reservation
        
        Service-->>-Controller: CheckoutReservationResponseDto
        Note over Controller: {reservation, assignmentId, invoiceId}
        Controller-->>-Recepcionista: 200 - Checkout successful
    end
```

## 4. Actualizar Estado de Reserva

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as ReservationsController
    participant Service as ReservationsService
    participant ReservationRepo as ReservationRepository
    participant Notifications as NotificationsService

    Usuario->>+Controller: PATCH /reservations/:id (updateDto)
    Controller->>+Service: update(id, data)
    
    Service->>+Service: findOne(id)
    Service->>+ReservationRepo: findOne({where: {id}, relations: {guest, room, user}})
    ReservationRepo-->>-Service: Reservation
    Service-->>-Service: existingReservation
    
    alt Reserva no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Usuario: 404 - Not found
    else Reserva encontrada
        Service->>Service: mergeData(existingReservation, data)
        
        opt Cambio de fechas
            Service->>Service: convertDateStrings()
            Service->>Service: recalculateNights()
        end
        
        opt Cambio de habitación, fechas o descuento
            Service->>+RoomRepo: findOne({where: {id: roomId}})
            RoomRepo-->>-Service: Room
            Service->>Service: validateCapacity(guests, room.capacity)
            Service->>Service: recalculateTotalAmount()
        end
        
        opt Cambio de habitación o fechas
            Service->>+ReservationRepo: createQueryBuilder().where(...).getCount()
            Note over Service,ReservationRepo: Check for overbooking conflicts
            ReservationRepo-->>-Service: conflictCount
            
            alt Conflicto detectado
                Service-->>Controller: BadRequestException
                Controller-->>Usuario: 400 - Room not available
            end
        end
        
        opt Cambio de estado
            alt Estado = CONFIRMED o CHECKED_IN
                Service->>+RoomRepo: update(roomId, {isAvailable: false})
                RoomRepo-->>-Service: UpdateResult
            else Estado = CANCELLED
                Service->>+RoomRepo: update(roomId, {isAvailable: true})
                RoomRepo-->>-Service: UpdateResult
            end
        end
        
        Service->>+ReservationRepo: save(updatedData)
        ReservationRepo-->>-Service: Reservation
        
        Service-->>-Controller: Reservation
        Controller-->>-Usuario: 200 - Updated
    end
```

## 5. Obtener Estadísticas de Ocupación

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as ReservationsController
    participant Service as ReservationsService
    participant DB as Database

    Admin->>+Controller: GET /reservations/occupancy-stats?startDate&endDate
    Controller->>+Service: getOccupancyStats(startDate, endDate)
    
    Service->>+DB: count(reservations in date range)
    DB-->>-Service: Total reservations
    
    Service->>+DB: count(status = CONFIRMED)
    DB-->>-Service: Confirmed count
    
    Service->>+DB: count(status = CANCELLED)
    DB-->>-Service: Cancelled count
    
    Service->>+DB: count(total rooms)
    DB-->>-Service: Total rooms
    
    Service->>Service: calculateOccupancyRate()
    Note over Service: (Confirmed / Total Rooms) * 100
    
    Service-->>-Controller: OccupancyStatsInterface
    Controller-->>-Admin: 200 - Occupancy statistics
```

## Descripción de Flujos

### 1. Crear Reserva
- El cliente envía datos de la reserva
- Se valida la existencia de la habitación
- Se calculan las noches y el monto total (incluyendo descuentos)
- Se guarda la reserva
- Se envía notificación al cliente

### 2. Consultar Disponibilidad
- Se valida el rango de fechas
- Se consultan habitaciones excluyendo las que tienen reservas activas
- Se filtran por tipo y capacidad si se especifica
- Se retorna lista de habitaciones disponibles

### 3. Proceso de Check-out
- Proceso transaccional complejo
- Se calculan todos los cargos (habitación, servicios, eventos)
- Se genera la factura con todos los items
- Se actualiza el estado de la reserva a CHECKED_OUT
- Se crea asignación de limpieza automáticamente
- Se envía notificación de check-out

### 4. Actualizar Estado de Reserva
- Permite cambiar el estado de la reserva
- Validaciones específicas para cada transición de estado
- Notificación automática del cambio de estado

### 5. Obtener Estadísticas de Ocupación
- Consulta reservas en un rango de fechas
- Calcula totales por estado
- Calcula tasa de ocupación
- Retorna estadísticas agregadas

## Patrones Implementados

- **Transaction Script**: Check-out utiliza transacciones para garantizar consistencia
- **Repository Pattern**: Acceso a datos a través de repositorios
- **Service Layer**: Lógica de negocio centralizada en el servicio
- **Observer Pattern**: Sistema de notificaciones para eventos importantes
