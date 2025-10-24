# Diagrama de Clases - Módulo de Reservaciones

```mermaid
classDiagram
    %% Controllers
    class ReservationsController {
        -ReservationsService reservationsService
        +getCurrentGuests() Promise~Reservation[]~
        +create(createDto) Promise~Reservation~
        +createSelf(body, req) Promise~Reservation~
        +findAll() Promise~Reservation[]~
        +getReservationsWithBillingDetails() Promise~any[]~
        +getAvailability(startDate, endDate, type, guests) Promise~Room[]~
        +findMine(req) Promise~Reservation[]~
        +findOne(id) Promise~Reservation~
        +update(id, updateDto) Promise~Reservation~
        +remove(id) Promise~Reservation~
        +checkout(id) Promise~CheckoutReservationResponseDto~
    }

    %% Services
    class ReservationsService {
        -Repository~Reservation~ reservationRepository
        -Repository~Room~ roomRepository
        -Repository~Invoice~ invoiceRepository
        -Repository~InvoiceItem~ invoiceItemRepository
        -Repository~RoomServiceOrder~ roomServiceOrderRepository
        -HousekeepingService housekeepingService
        -NotificationsService notificationsService
        -DataSource dataSource
        +getCurrentGuests() Promise~Reservation[]~
        +findAll() Promise~Reservation[]~
        +getAvailability(startDate, endDate, type, minGuests) Promise~Room[]~
        +findMine(userId) Promise~Reservation[]~
        +findOne(id) Promise~Reservation~
        +create(data) Promise~Reservation~
        +update(id, data) Promise~Reservation~
        +checkoutReservation(id) Promise~CheckoutReservationResponseDto~
        +remove(id) Promise~Reservation~
        +getUpcomingReservations() Promise~UpcomingReservationInterface[]~
        +getOccupancyStats(startDate, endDate) Promise~OccupancyStatsInterface~
        +getReservationsWithBillingDetails() Promise~any[]~
    }

    %% Entities
    class Reservation {
        +int id
        +string guestName
        +string guestEmail
        +string guestPhone
        +Date checkInDate
        +Date checkOutDate
        +int nights
        +int guests
        +decimal totalAmount
        +decimal discountPercent
        +decimal discountAmount
        +ReservationStatus status
        +BookingChannel channel
        +string notes
        +Date createdAt
        +Date updatedAt
        +int userId
        +int roomId
        +int guestId
    }

    class Guest {
        +int id
        +string name
        +string email
        +string phone
        +string document
        +string address
        +string nationality
        +Date birthDate
        +string preferences
        +boolean vip
        +Date createdAt
        +Date updatedAt
    }

    %% DTOs
    class CreateReservationDto {
        +string guestName
        +string guestEmail
        +string guestPhone
        +Date checkInDate
        +Date checkOutDate
        +int guests
        +decimal discountPercent
        +decimal discountAmount
        +BookingChannel channel
        +string notes
        +int roomId
        +int guestId
        +int userId
    }

    class UpdateReservationDto {
        +string guestName
        +string guestEmail
        +string guestPhone
        +Date checkInDate
        +Date checkOutDate
        +int guests
        +decimal discountPercent
        +decimal discountAmount
        +ReservationStatus status
        +BookingChannel channel
        +string notes
        +int roomId
        +int guestId
    }

    class CheckoutReservationResponseDto {
        +Reservation reservation
        +number assignmentId
        +number invoiceId
    }

    class ReservationBillingDetailsDto {
        +Reservation reservation
        +decimal roomCharges
        +RoomServiceChargeDto[] roomServiceCharges
        +decimal roomServiceTotal
        +EventChargeDto[] eventCharges
        +decimal eventTotal
        +decimal grandTotal
    }

    class RoomServiceChargeDto {
        +int orderId
        +string orderNumber
        +string orderTime
        +decimal total
        +string status
        +object[] items
    }

    class EventChargeDto {
        +int bookingId
        +string title
        +Date eventDate
        +decimal total
        +string status
        +int attendees
    }

    %% Enumerations
    class ReservationStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        CHECKED_IN
        CHECKED_OUT
        CANCELLED
    }

    class BookingChannel {
        <<enumeration>>
        DIRECT
        ONLINE
        PHONE
        EMAIL
        THIRD_PARTY
    }

    %% Interfaces
    class OccupancyStatsInterface {
        <<interface>>
        +int totalReservations
        +int confirmedReservations
        +int cancelledReservations
        +decimal occupancyRate
    }

    class UpcomingReservationInterface {
        <<interface>>
        +int id
        +string room
        +string guestName
        +string roomType
        +string checkIn
        +string checkOut
        +int totalGuests
    }

    %% Relationships
    ReservationsController --> ReservationsService : uses
    ReservationsController ..> CreateReservationDto : uses
    ReservationsController ..> UpdateReservationDto : uses
    ReservationsController ..> CheckoutReservationResponseDto : returns
    
    ReservationsService --> Reservation : manages
    ReservationsService --> Guest : manages
    ReservationsService ..> CreateReservationDto : creates from
    ReservationsService ..> UpdateReservationDto : updates from
    ReservationsService ..> OccupancyStatsInterface : returns
    ReservationsService ..> UpcomingReservationInterface : returns
    ReservationsService ..> ReservationBillingDetailsDto : returns
    
    Guest "1" --o "0..*" Reservation : has
    Reservation --> ReservationStatus : status
    Reservation --> BookingChannel : channel
    
    CreateReservationDto --> BookingChannel : channel
    UpdateReservationDto --> ReservationStatus : status
    UpdateReservationDto --> BookingChannel : channel
    
    CheckoutReservationResponseDto --> Reservation : contains
    ReservationBillingDetailsDto --> Reservation : contains
    ReservationBillingDetailsDto --> RoomServiceChargeDto : contains
    ReservationBillingDetailsDto --> EventChargeDto : contains
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de reservaciones:

### Controllers
- **ReservationsController**: Maneja las peticiones HTTP para reservaciones

### Services
- **ReservationsService**: Lógica de negocio para gestión de reservaciones, disponibilidad, facturación y estadísticas

### Entities
- **Reservation**: Entidad principal que representa una reserva de habitación
- **Guest**: Representa a un huésped que puede tener múltiples reservas

### DTOs
- **CreateReservationDto**: Datos para crear una nueva reserva
- **UpdateReservationDto**: Datos para actualizar una reserva existente
- **CheckoutReservationResponseDto**: Respuesta del proceso de checkout
- **ReservationBillingDetailsDto**: Detalles de facturación de reservaciones
- **RoomServiceChargeDto**: Cargos de servicio a habitación
- **EventChargeDto**: Cargos por eventos

### Enumerations
- **ReservationStatus**: Estados posibles de una reserva (PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)
- **BookingChannel**: Canales de reserva (DIRECT, ONLINE, PHONE, EMAIL, THIRD_PARTY)

### Interfaces
- **OccupancyStatsInterface**: Estadísticas de ocupación
- **UpcomingReservationInterface**: Reservaciones próximas
