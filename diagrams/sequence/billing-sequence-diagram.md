# Diagrama de Secuencia - Módulo de Facturación

## 1. Crear Factura

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as BillingController
    participant Service as BillingService
    participant InvoiceRepo as InvoiceRepository

    Usuario->>+Controller: POST /billing/invoices (createInvoiceDto)
    Controller->>+Service: create(data)
    
    Service->>Service: generateInvoiceNumber()
    Note over Service: Format: INV-{timestamp}
    
    Service->>Service: setStatus(PENDING)
    Service->>Service: setIssueDate(now)
    
    Service->>+InvoiceRepo: save(invoiceData)
    InvoiceRepo-->>-Service: Invoice
    
    Service-->>-Controller: Invoice
    Controller-->>-Usuario: 201 - Invoice created
```

## 2. Marcar Factura como Pagada

```mermaid
sequenceDiagram
    autonumber
    actor Cajero
    participant Controller as BillingController
    participant Service as BillingService
    participant InvoiceRepo as InvoiceRepository
    participant PaymentRepo as PaymentRepository

    Cajero->>+Controller: POST /billing/invoices/:id/mark-as-paid (paymentData)
    Controller->>+Service: markAsPaid(id, paymentMethod)
    
    Service->>+InvoiceRepo: findOne({where: {id}})
    InvoiceRepo-->>-Service: Invoice
    
    alt Factura no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Cajero: 404 - Invoice not found
    else Factura encontrada
        Service->>Service: validateInvoiceStatus()
        
        alt Ya está pagada
            Service-->>Controller: BadRequestException
            Controller-->>Cajero: 400 - Invoice already paid
        else Pendiente de pago
            Service->>+PaymentRepo: create(paymentData)
            Note over PaymentRepo: amount = invoice.total<br/>method = paymentMethod<br/>status = COMPLETED
            PaymentRepo-->>-Service: Payment
            
            Service->>+InvoiceRepo: update(id, {status: PAID, paymentMethod})
            InvoiceRepo-->>-Service: UpdateResult
            
            Service->>+InvoiceRepo: findOne({where: {id}})
            InvoiceRepo-->>-Service: Updated Invoice
            
            Service-->>-Controller: Invoice
            Controller-->>-Cajero: 200 - Invoice marked as paid
        end
    end
```

## 3. Generar Reporte Financiero

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as BillingController
    participant Service as BillingService
    participant InvoiceRepo as InvoiceRepository

    Admin->>+Controller: GET /billing/statistics?startDate&endDate
    Controller->>+Service: getFinancialSummary(startDate, endDate)
    
    Service->>+InvoiceRepo: find({where: {issueDate: Between(startDate, endDate)}})
    InvoiceRepo-->>-Service: Invoice[]
    
    Service->>Service: calculateTotalRevenue()
    Note over Service: SUM(total) de todas las facturas
    
    Service->>Service: filterByStatus(PAID)
    Service->>Service: calculatePaidAmount()
    
    Service->>Service: filterByStatus(PENDING)
    Service->>Service: calculatePendingAmount()
    
    Service->>Service: filterOverdueInvoices()
    Service->>Service: calculateOverdueAmount()
    
    Service->>Service: countByStatus()
    Note over Service: Cuenta facturas por estado
    
    Service-->>-Controller: FinancialSummaryResponseDto
    Note over Controller: {totalRevenue, paidAmount,<br/>pendingAmount, overdueAmount,<br/>counts by status}
    Controller-->>-Admin: 200 - Financial summary
```

## 4. Consultar Facturas Vencidas

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as BillingController
    participant Service as BillingService
    participant InvoiceRepo as InvoiceRepository

    Admin->>+Controller: GET /billing/invoices/overdue
    Controller->>+Service: getOverdueInvoices()
    
    Service->>+InvoiceRepo: find({where: {dueDate: LessThan(today), status: PENDING}})
    InvoiceRepo-->>-Service: Invoice[]
    
    loop Para cada factura vencida
        Service->>Service: updateStatus(OVERDUE)
    end
    
    Service->>+InvoiceRepo: bulkUpdate(invoices, status: OVERDUE)
    InvoiceRepo-->>-Service: UpdateResult
    
    Service->>+InvoiceRepo: find({where: {status: OVERDUE}})
    InvoiceRepo-->>-Service: Overdue invoices[]
    
    Service-->>-Controller: Invoice[]
    Controller-->>-Admin: 200 - Overdue invoices
```

## 5. Generar PDF de Factura

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Controller as BillingController
    participant Service as BillingService
    participant InvoiceRepo as InvoiceRepository
    participant PDFGenerator

    Usuario->>+Controller: GET /billing/invoices/:id/download
    Controller->>+Service: generateInvoicePdf(id)
    
    Service->>+InvoiceRepo: findOne({where: {id}, relations: ['invoiceItems']})
    InvoiceRepo-->>-Service: Invoice with items
    
    alt Factura no encontrada
        Service-->>Controller: NotFoundException
        Controller-->>Usuario: 404 - Invoice not found
    else Factura encontrada
        Service->>+PDFGenerator: createDocument()
        PDFGenerator-->>-Service: PDFDocument
        
        Service->>PDFGenerator: addHeader(invoice.number, date)
        Service->>PDFGenerator: addCustomerInfo(invoice.guestName)
        Service->>PDFGenerator: addInvoiceItems(invoice.items)
        Service->>PDFGenerator: addTotals(subtotal, taxes, total)
        Service->>PDFGenerator: addFooter()
        
        Service->>PDFGenerator: finalize()
        PDFGenerator-->>Service: Buffer
        
        Service->>Service: createStreamableFile(buffer)
        
        Service-->>-Controller: StreamableFile
        Controller-->>-Usuario: 200 - PDF file
        Note over Usuario: Content-Type: application/pdf
    end
```

## 6. Obtener Estadísticas de Pagos

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant Controller as BillingController
    participant Service as BillingService
    participant PaymentRepo as PaymentRepository

    Admin->>+Controller: GET /billing/payments/statistics
    Controller->>+Service: getPaymentStatistics()
    
    Service->>+PaymentRepo: count()
    PaymentRepo-->>-Service: totalPayments
    
    Service->>+PaymentRepo: sum(amount)
    PaymentRepo-->>-Service: totalAmount
    
    Service->>Service: calculateAverage(totalAmount / totalPayments)
    
    Service->>+PaymentRepo: count(status = COMPLETED)
    PaymentRepo-->>-Service: completedPayments
    
    Service->>+PaymentRepo: count(status = PENDING)
    PaymentRepo-->>-Service: pendingPayments
    
    Service-->>-Controller: PaymentStatisticsResponseDto
    Controller-->>-Admin: 200 - Payment statistics
```

## 7. Consultar Facturas por Cliente

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant Controller as BillingController
    participant Service as BillingService
    participant InvoiceRepo as InvoiceRepository

    Cliente->>+Controller: GET /billing/invoices/customer/:userId
    Controller->>+Service: getInvoicesByCustomer(userId)
    
    Service->>+InvoiceRepo: find(userId, order by createdAt DESC)
    InvoiceRepo-->>-Service: Invoice[]
    
    Service-->>-Controller: Invoice[]
    Controller-->>-Cliente: 200 - Customer invoices
```

## Descripción de Flujos

### 1. Crear Factura

- Se genera número de factura único basado en timestamp
- Estado inicial siempre es PENDING
- Se registra fecha de emisión automáticamente
- Incluye subtotal, impuestos y total

### 2. Marcar Factura como Pagada

- Validación de estado de la factura
- Creación de registro de pago
- Actualización de estado a PAID
- Registro de método de pago utilizado

### 3. Generar Reporte Financiero

- Consulta facturas en rango de fechas
- Calcula métricas financieras agregadas
- Incluye ingresos totales, pagados, pendientes y vencidos
- Cuenta facturas por estado

### 4. Consultar Facturas Vencidas

- Identifica facturas con fecha de vencimiento pasada
- Actualiza automáticamente estado a OVERDUE
- Retorna lista de facturas vencidas
- Útil para gestión de cobranza

### 5. Generar PDF de Factura

- Recupera factura con todos sus items
- Genera documento PDF profesional
- Incluye header, información del cliente, items, totales
- Retorna archivo descargable

### 6. Obtener Estadísticas de Pagos

- Calcula métricas de pagos
- Total de pagos, monto total, promedio
- Desglose por estado (completados, pendientes)

### 7. Consultar Facturas por Cliente

- Lista facturas de un cliente específico
- Ordenadas por fecha de creación (más recientes primero)
- Incluye todas las relaciones necesarias

## Patrones Implementados

- **State Pattern**: Estados de factura (PENDING, PAID, OVERDUE, CANCELLED, REFUNDED)
- **Strategy Pattern**: Diferentes métodos de pago
- **Repository Pattern**: Acceso a datos a través de repositorios
- **Factory Pattern**: Generación automática de números de factura
- **Builder Pattern**: Construcción de PDF paso a paso
- **Aggregate Pattern**: Cálculo de totales y estadísticas
