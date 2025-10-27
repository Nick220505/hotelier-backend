# Diagrama de Clases - Módulo de Facturación

```mermaid
classDiagram
    %% Controllers
    class BillingController {
        -BillingService billingService
        +getInvoices(status) Promise~Invoice[]~
        +getOverdueInvoices() Promise~Invoice[]~
        +getBillingStatistics() Promise~FinancialSummaryResponseDto~
        +getInvoicesByDateRange(startDate, endDate) Promise~Invoice[]~
        +getInvoiceById(id) Promise~Invoice~
        +createInvoice(invoiceData) Promise~Invoice~
        +updateInvoice(id, updateData) Promise~Invoice~
        +markInvoiceAsPaid(id, paymentData) Promise~Invoice~
        +deleteInvoice(id) Promise~Invoice~
        +getPayments() Promise~Payment[]~
        +getPaymentStatistics() Promise~PaymentStatisticsResponseDto~
        +getPaymentsByInvoice(id) Promise~Payment[]~
        +downloadInvoice(id) Promise~StreamableFile~
    }

    %% Services
    class BillingService {
        -Repository~Invoice~ invoiceRepository
        -Repository~Payment~ paymentRepository
        +findAll() Promise~Invoice[]~
        +findOne(id) Promise~Invoice~
        +create(data) Promise~Invoice~
        +updateInvoice(id, data) Promise~Invoice~
        +getInvoicesByStatus(status) Promise~Invoice[]~
        +getInvoicesByCustomer(userId) Promise~Invoice[]~
        +getInvoicesByDateRange(startDate, endDate) Promise~Invoice[]~
        +getOverdueInvoices() Promise~Invoice[]~
        +getFinancialSummary(startDate, endDate) Promise~FinancialSummaryResponseDto~
        +markAsPaid(id, paymentMethod) Promise~Invoice~
        +markAsVoid(id) Promise~Invoice~
        +generateMonthlyReport(year, month) Promise~object~
        +remove(id) Promise~Invoice~
        +getAllPayments() Promise~Payment[]~
        +getPaymentStatistics() Promise~PaymentStatisticsResponseDto~
        +getPaymentsByInvoiceId(invoiceId) Promise~Payment[]~
        +generateInvoicePdf(id) Promise~StreamableFile~
    }

    %% Entities
    class Invoice {
        +int id
        +string number
        +string guestName
        +Date issueDate
        +Date dueDate
        +decimal subtotal
        +decimal taxes
        +decimal total
        +string currency
        +InvoiceStatus status
        +PaymentMethod paymentMethod
        +Date createdAt
        +Date updatedAt
        +int reservationId
        +int userId
    }

    class InvoiceItem {
        +int id
        +string description
        +int quantity
        +decimal price
        +decimal total
        +int invoiceId
    }

    class Payment {
        +int id
        +string reference
        +decimal amount
        +PaymentMethod method
        +PaymentStatus status
        +string notes
        +Date processedAt
        +Date createdAt
        +Date updatedAt
        +int invoiceId
    }

    %% DTOs
    class CreateInvoiceDto {
        +string guestName
        +Date issueDate
        +Date dueDate
        +decimal subtotal
        +decimal taxes
        +decimal total
        +string currency
        +int reservationId
        +int userId
    }

    class UpdateInvoiceDto {
        +string guestName
        +Date issueDate
        +Date dueDate
        +decimal subtotal
        +decimal taxes
        +decimal total
        +string currency
        +InvoiceStatus status
        +PaymentMethod paymentMethod
    }

    class CreateInvoiceItemDto {
        +string description
        +int quantity
        +decimal price
        +decimal total
        +int invoiceId
    }

    class MarkAsPaidRequestDto {
        +PaymentMethod paymentMethod
    }

    class FinancialSummaryResponseDto {
        +decimal totalRevenue
        +decimal paidAmount
        +decimal pendingAmount
        +decimal overdueAmount
        +int totalPaidInvoices
        +int totalPendingInvoices
        +int totalOverdueInvoices
    }

    class PaymentStatisticsResponseDto {
        +int totalPayments
        +decimal totalAmount
        +decimal averagePayment
        +int completedPayments
        +int pendingPayments
    }

    class DownloadInvoiceDto {
        +string format
    }

    %% Enumerations
    class InvoiceStatus {
        <<enumeration>>
        PENDING
        PAID
        OVERDUE
        CANCELLED
        REFUNDED
    }

    class PaymentMethod {
        <<enumeration>>
        CASH
        CREDIT_CARD
        DEBIT_CARD
        BANK_TRANSFER
        ONLINE
    }

    class PaymentStatus {
        <<enumeration>>
        PENDING
        COMPLETED
        FAILED
        REFUNDED
    }

    %% Interfaces
    class InvoiceTotalResultInterface {
        <<interface>>
        +string total
    }

    %% Relationships
    BillingController --> BillingService : uses
    BillingController ..> CreateInvoiceDto : uses
    BillingController ..> UpdateInvoiceDto : uses
    BillingController ..> MarkAsPaidRequestDto : uses
    BillingController ..> FinancialSummaryResponseDto : returns
    BillingController ..> PaymentStatisticsResponseDto : returns
    BillingController ..> DownloadInvoiceDto : uses
    
    BillingService --> Invoice : manages
    BillingService --> Payment : manages
    BillingService ..> CreateInvoiceDto : creates from
    BillingService ..> UpdateInvoiceDto : updates from
    BillingService ..> CreateInvoiceItemDto : creates from
    BillingService ..> MarkAsPaidRequestDto : processes
    BillingService ..> FinancialSummaryResponseDto : returns
    BillingService ..> PaymentStatisticsResponseDto : returns
    BillingService ..> InvoiceTotalResultInterface : uses
    
    Invoice "1" *-- "1..*" InvoiceItem : contains
    Invoice "1" *-- "0..*" Payment : receives
    Invoice --> InvoiceStatus : status
    Invoice --> PaymentMethod : paymentMethod
    Payment --> PaymentMethod : method
    Payment --> PaymentStatus : status
    
    CreateInvoiceItemDto --> Invoice : belongs to
    CreateInvoiceDto --> InvoiceStatus : default status
    UpdateInvoiceDto --> InvoiceStatus : status
    UpdateInvoiceDto --> PaymentMethod : paymentMethod
    MarkAsPaidRequestDto --> PaymentMethod : method
    
    %% Notas de Patrones GoF
    note for Invoice "Composite Pattern (GoF)<br/>Contiene items que se suman<br/>para calcular total"
    note for InvoiceStatus "State Pattern (GoF)<br/>Ciclo de vida:<br/>PENDING→PAID→OVERDUE"
    note for PaymentMethod "Strategy Pattern (GoF)<br/>Diferentes estrategias<br/>según método de pago"
```

## Descripción

Este diagrama muestra la arquitectura completa del módulo de facturación:

### Controllers
- **BillingController**: Maneja las peticiones HTTP para facturas, pagos y reportes financieros

### Services
- **BillingService**: Lógica de negocio para gestión de facturas, pagos, estadísticas y generación de PDFs

### Entities
- **Invoice**: Factura principal con totales, impuestos y estado
- **InvoiceItem**: Líneas de detalle de la factura (servicios, productos, etc.)
- **Payment**: Pagos asociados a una factura con método y estado

### DTOs
- **CreateInvoiceDto**: Datos para crear una nueva factura
- **UpdateInvoiceDto**: Datos para actualizar una factura
- **CreateInvoiceItemDto**: Datos para crear un ítem de factura
- **MarkAsPaidRequestDto**: Datos para marcar factura como pagada
- **FinancialSummaryResponseDto**: Resumen financiero con ingresos, pagos y vencidos
- **PaymentStatisticsResponseDto**: Estadísticas de pagos
- **DownloadInvoiceDto**: Configuración para descarga de factura

### Enumerations
- **InvoiceStatus**: Estados de factura (PENDING, PAID, OVERDUE, CANCELLED, REFUNDED)
- **PaymentMethod**: Métodos de pago (CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, ONLINE)
- **PaymentStatus**: Estados de pago (PENDING, COMPLETED, FAILED, REFUNDED)

### Interfaces
- **InvoiceTotalResultInterface**: Interface para resultados de totales de facturas

## Patrones de Diseño GoF Implementados

### 1. Composite Pattern (Estructural)
**Aplicación**: `Invoice` con `InvoiceItem[]`
- **Beneficio**: Trata objetos individuales y composiciones de manera uniforme
- **Estructura**: Invoice actúa como composite que contiene múltiples InvoiceItems
- **Implementación**: El total de la factura se calcula sumando todos los items

### 2. State Pattern (Comportamiento)
**Aplicación**: `InvoiceStatus` enum
- **Beneficio**: Gestión clara del ciclo de vida de la factura
- **Estados**: PENDING → PAID, OVERDUE, CANCELLED, REFUNDED
- **Implementación**: Transiciones controladas mediante métodos del servicio

### 3. Strategy Pattern (Comportamiento)
**Aplicación**: `PaymentMethod` enum
- **Beneficio**: Diferentes algoritmos de procesamiento según método de pago
- **Estrategias**: CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, ONLINE
- **Implementación**: Permite variar el procesamiento de pagos dinámicamente
