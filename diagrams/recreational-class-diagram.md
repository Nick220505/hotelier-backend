# Diagrama de Clases - Módulo Recreacional

```mermaid
classDiagram
    %% Controllers
    class RecreationalController {
        -RecreationalService recreationalService
        +createFacility(createFacilityDto) Promise~RecreationalFacility~
        +findAllFacilities() Promise~RecreationalFacility[]~
        +findFacilityById(id) Promise~RecreationalFacility~
        +updateFacility(id, updateFacilityDto) Promise~RecreationalFacility~
        +deleteFacility(id) Promise~RecreationalFacility~
        +createBooking(createBookingDto) Promise~RecreationalBooking~
        +findAllBookings() Promise~RecreationalBooking[]~
        +findBookingById(id) Promise~RecreationalBooking~
        +updateBooking(id, updateBookingDto) Promise~RecreationalBooking~
        +deleteBooking(id) Promise~RecreationalBooking~
        +getAvailability(facilityId, date) Promise~FacilityAvailabilityDto~
        +getStatistics() Promise~BookingStatisticsDto~
    }

    %% Services
    class RecreationalService {
        -Repository~RecreationalFacility~ facilityRepository
        -Repository~RecreationalBooking~ bookingRepository
        +createFacility(data) Promise~RecreationalFacility~
        +findAllFacilities() Promise~RecreationalFacility[]~
        +findFacilityById(id) Promise~RecreationalFacility~
        +updateFacility(id, data) Promise~RecreationalFacility~
        +deleteFacility(id) Promise~RecreationalFacility~
        +createBooking(data) Promise~RecreationalBooking~
        +findAllBookings() Promise~RecreationalBooking[]~
        +findBookingById(id) Promise~RecreationalBooking~
        +updateBooking(id, data) Promise~RecreationalBooking~
        +deleteBooking(id) Promise~RecreationalBooking~
        +checkAvailability(facilityId, date, startTime, endTime) Promise~boolean~
        +getBookingStatistics() Promise~BookingStatisticsDto~
    }

    %% Entities
    class RecreationalFacility {
        +int id
        +string name
        +FacilityType type
        +string description
        +FacilityStatus status
        +int capacity
        +number pricePerHour
        +string operatingHours
        +string[] amenities
        +boolean requiresBooking
        +Date createdAt
        +Date updatedAt
        +RecreationalBooking[] bookings
    }

    class RecreationalBooking {
        +int id
        +int facilityId
        +int guestId
        +Date bookingDate
        +string startTime
        +string endTime
        +RecreationalBookingStatus status
        +number totalPrice
        +int numberOfGuests
        +string notes
        +Date createdAt
        +Date updatedAt
        +RecreationalFacility facility
    }

    %% DTOs
    class CreateRecreationalFacilityDto {
        +string name
        +FacilityType type
        +string description
        +int capacity
        +number pricePerHour
        +string operatingHours
        +string[] amenities
        +boolean requiresBooking
    }

    class UpdateRecreationalFacilityDto {
        +string name
        +FacilityType type
        +string description
        +FacilityStatus status
        +int capacity
        +number pricePerHour
        +string operatingHours
        +string[] amenities
        +boolean requiresBooking
    }

    class CreateRecreationalBookingDto {
        +int facilityId
        +int guestId
        +Date bookingDate
        +string startTime
        +string endTime
        +int numberOfGuests
        +string notes
    }

    class UpdateRecreationalBookingDto {
        +int facilityId
        +int guestId
        +Date bookingDate
        +string startTime
        +string endTime
        +RecreationalBookingStatus status
        +int numberOfGuests
        +string notes
    }

    class FacilityAvailabilityDto {
        +int facilityId
        +Date date
        +TimeSlot[] availableSlots
        +TimeSlot[] bookedSlots
    }

    class BookingStatisticsDto {
        +int totalBookings
        +int activeBookings
        +int completedBookings
        +number totalRevenue
        +PopularFacility[] popularFacilities
    }

    %% Enumerations
    class FacilityType {
        <<enumeration>>
        GYM
        SWIMMING_POOL
        TENNIS_COURT
        SPA
        SAUNA
        JACUZZI
        GAME_ROOM
        FITNESS_STUDIO
        YOGA_STUDIO
        BASKETBALL_COURT
        VOLLEYBALL_COURT
        MINI_GOLF
        KIDS_PLAY_AREA
        BUSINESS_CENTER
        LIBRARY
        ROOFTOP_TERRACE
    }

    class FacilityStatus {
        <<enumeration>>
        AVAILABLE
        OCCUPIED
        MAINTENANCE
        OUT_OF_ORDER
        RESERVED
        CLEANING
    }

    class RecreationalBookingStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        CHECKED_IN
        COMPLETED
        CANCELLED
        NO_SHOW
    }

    %% Relationships
    RecreationalController --> RecreationalService : uses
    RecreationalController ..> CreateRecreationalFacilityDto : receives
    RecreationalController ..> UpdateRecreationalFacilityDto : receives
    RecreationalController ..> CreateRecreationalBookingDto : receives
    RecreationalController ..> UpdateRecreationalBookingDto : receives
    RecreationalController ..> FacilityAvailabilityDto : returns
    RecreationalController ..> BookingStatisticsDto : returns
    
    RecreationalService --> RecreationalFacility : manages
    RecreationalService --> RecreationalBooking : manages
    RecreationalService ..> CreateRecreationalFacilityDto : creates from
    RecreationalService ..> UpdateRecreationalFacilityDto : updates from
    RecreationalService ..> CreateRecreationalBookingDto : creates from
    RecreationalService ..> UpdateRecreationalBookingDto : updates from
    RecreationalService ..> FacilityAvailabilityDto : builds
    RecreationalService ..> BookingStatisticsDto : builds
    
    RecreationalFacility --> FacilityType : type
    RecreationalFacility --> FacilityStatus : status
    RecreationalFacility "1" --o "0..*" RecreationalBooking : has bookings
    
    RecreationalBooking --> RecreationalFacility : facility
    RecreationalBooking --> RecreationalBookingStatus : status
    
    CreateRecreationalFacilityDto --> FacilityType : type
    UpdateRecreationalFacilityDto --> FacilityType : type
    UpdateRecreationalFacilityDto --> FacilityStatus : status
    UpdateRecreationalBookingDto --> RecreationalBookingStatus : status
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo recreacional:

### Controllers
- **RecreationalController**: Maneja peticiones HTTP para gestión de instalaciones recreacionales y reservas

### Services
- **RecreationalService**: Lógica de negocio para instalaciones recreacionales
  - Gestión de instalaciones (CRUD)
  - Gestión de reservas (CRUD)
  - Verificación de disponibilidad
  - Estadísticas de uso

### Entities
- **RecreationalFacility**: Instalación recreacional
  - Nombre y tipo (gimnasio, piscina, spa, etc.)
  - Estado y capacidad
  - Precio por hora
  - Horarios de operación
  - Amenidades incluidas
  - Requiere reserva o no
- **RecreationalBooking**: Reserva de instalación recreacional
  - Instalación asociada
  - Huésped que reserva
  - Fecha y horario (inicio/fin)
  - Estado de la reserva
  - Precio total
  - Número de huéspedes

### DTOs
- **CreateRecreationalFacilityDto**: Datos para crear instalación
- **UpdateRecreationalFacilityDto**: Datos para actualizar instalación
- **CreateRecreationalBookingDto**: Datos para crear reserva
- **UpdateRecreationalBookingDto**: Datos para actualizar reserva
- **FacilityAvailabilityDto**: Disponibilidad de instalación
- **BookingStatisticsDto**: Estadísticas de reservas

### Enumerations
- **FacilityType**: Tipos de instalaciones (16 tipos diferentes)
- **FacilityStatus**: Estados de instalación
  - AVAILABLE: Disponible
  - OCCUPIED: Ocupada
  - MAINTENANCE: En mantenimiento
  - OUT_OF_ORDER: Fuera de servicio
  - RESERVED: Reservada
  - CLEANING: En limpieza
- **RecreationalBookingStatus**: Estados de reserva
  - PENDING: Pendiente
  - CONFIRMED: Confirmada
  - CHECKED_IN: Check-in realizado
  - COMPLETED: Completada
  - CANCELLED: Cancelada
  - NO_SHOW: No se presentó

### Funcionalidades Principales
- Gestión de instalaciones recreacionales del hotel
- Sistema de reservas para instalaciones
- Control de disponibilidad por horario
- Pricing por hora
- Capacidad máxima por instalación
- Tracking de amenidades incluidas
- Estadísticas de uso y popularidad
- Gestión de múltiples estados de instalaciones
- Horarios de operación configurables
