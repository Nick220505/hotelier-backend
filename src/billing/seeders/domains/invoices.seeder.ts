import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { InvoiceItem } from '../../entities/invoice-item.entity';
import { Reservation } from '../../../reservations/entities/reservation.entity';
import { User } from '../../../auth/entities/user.entity';
import { InvoiceStatus } from '../../enums/invoice-status.enum';
import { PaymentMethod } from '../../enums/payment-method.enum';

@Injectable()
export class InvoicesSeeder {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    const existingInvoicesCount = await this.invoiceRepository.count();

    if (existingInvoicesCount > 0) {
      console.log('⏭️ Invoices already exist, skipping seeding');
      return;
    }

    const reservations = await this.reservationRepository.find();
    const users = await this.userRepository.find({ take: 2 });

    if (reservations.length === 0) {
      console.log('Skipping invoice seeds - no reservations found');
      return;
    }

    console.log('📄 Creating predefined invoices...');

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Helper function to create a date
    const createDate = (year: number, month: number, day: number) => {
      return new Date(year, month - 1, day);
    };

    const invoices = [
      // Recent invoices
      {
        number: 'INV-2025-0001',
        guestName: 'Diego Vargas',
        issueDate: oneWeekAgo,
        dueDate: new Date(oneWeekAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación Deluxe (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },
      {
        number: 'INV-2025-0002',
        guestName: 'Carolina Pérez',
        issueDate: oneWeekAgo,
        dueDate: new Date(oneWeekAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[1]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación Standard (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },
      {
        number: 'INV-2025-0003',
        guestName: 'Fernando Gómez',
        issueDate: twoWeeksAgo,
        dueDate: new Date(twoWeeksAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 2940000.0,
        taxes: 294000.0,
        total: 3234000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[2]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite Familiar (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Servicios de Restaurante',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
        ],
      },
      {
        number: 'INV-2025-0004',
        guestName: 'Sofía Ramírez',
        issueDate: twoWeeksAgo,
        dueDate: new Date(twoWeeksAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 315000.0,
        taxes: 31500.0,
        total: 346500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[3]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación Standard (1 noche)',
            quantity: 1,
            price: 315000.0,
            total: 315000.0,
          },
        ],
      },

      // One month ago invoices
      {
        number: 'INV-2024-0101',
        guestName: 'Andrés Castro',
        issueDate: oneMonthAgo,
        dueDate: new Date(oneMonthAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 3990000.0,
        taxes: 399000.0,
        total: 4389000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[4]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Ejecutiva (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Servicios de Restaurante',
            quantity: 1,
            price: 525000.0,
            total: 525000.0,
          },
          {
            description: 'Lavandería y otros servicios',
            quantity: 1,
            price: 315000.0,
            total: 315000.0,
          },
        ],
      },
      {
        number: 'INV-2024-0102',
        guestName: 'Patricia Morales',
        issueDate: oneMonthAgo,
        dueDate: new Date(oneMonthAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 1260000.0,
        taxes: 126000.0,
        total: 1386000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[5]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación Deluxe (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
          {
            description: 'Servicios de Restaurante',
            quantity: 1,
            price: 315000.0,
            total: 315000.0,
          },
        ],
      },
      {
        number: 'INV-2024-0103',
        guestName: 'Ricardo Torres',
        issueDate: oneMonthAgo,
        dueDate: new Date(oneMonthAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[6]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación Standard (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },

      // Two months ago invoices
      {
        number: 'INV-2024-0081',
        guestName: 'Valentina Ríos',
        issueDate: twoMonthsAgo,
        dueDate: new Date(twoMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 5250000.0,
        taxes: 525000.0,
        total: 5775000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[7]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Familiar (6 noches)',
            quantity: 6,
            price: 630000.0,
            total: 3780000.0,
          },
          {
            description: 'Servicios de Restaurante',
            quantity: 1,
            price: 840000.0,
            total: 840000.0,
          },
          {
            description: 'Spa y servicios adicionales',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
        ],
      },
      {
        number: 'INV-2024-0082',
        guestName: 'Miguel Ángel Díaz',
        issueDate: twoMonthsAgo,
        dueDate: new Date(twoMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[8]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación Ejecutiva (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },
      {
        number: 'INV-2024-0083',
        guestName: 'Laura Mendoza',
        issueDate: twoMonthsAgo,
        dueDate: new Date(twoMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 840000.0,
        taxes: 84000.0,
        total: 924000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[9]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación Deluxe (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
          {
            description: 'Servicios de Restaurante',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },

      // Three months ago invoices
      {
        number: 'INV-2024-0061',
        guestName: 'Jorge Hernández',
        issueDate: threeMonthsAgo,
        dueDate: new Date(threeMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 3360000.0,
        taxes: 336000.0,
        total: 3696000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[10]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Familiar (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Servicios de Restaurante',
            quantity: 1,
            price: 525000.0,
            total: 525000.0,
          },
          {
            description: 'Servicios adicionales',
            quantity: 1,
            price: 315000.0,
            total: 315000.0,
          },
        ],
      },
      {
        number: 'INV-2024-0062',
        guestName: 'Camila Ortiz',
        issueDate: threeMonthsAgo,
        dueDate: new Date(threeMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 2730000.0,
        taxes: 273000.0,
        total: 3003000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[11]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite Luna de Miel (5 noches)',
            quantity: 5,
            price: 315000.0,
            total: 1575000.0,
          },
          {
            description: 'Paquete romántico',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
          {
            description: 'Servicios de Restaurante',
            quantity: 1,
            price: 525000.0,
            total: 525000.0,
          },
          {
            description: 'Spa para parejas',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2024-0063',
        guestName: 'Esteban Ruiz',
        issueDate: threeMonthsAgo,
        dueDate: new Date(threeMonthsAgo.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 315000.0,
        taxes: 31500.0,
        total: 346500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[12]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación Standard (1 noche)',
            quantity: 1,
            price: 315000.0,
            total: 315000.0,
          },
        ],
      },

      // Some pending invoices
      {
        number: 'INV-2025-0005',
        guestName: 'Ana López',
        issueDate: now,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PENDING,
        currency: 'COP',
        reservationId: reservations[13]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación Standard (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },
      {
        number: 'INV-2025-0006',
        guestName: 'Pedro Martínez',
        issueDate: now,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 2100000.0,
        taxes: 210000.0,
        total: 2310000.0,
        status: InvoiceStatus.PENDING,
        currency: 'COP',
        reservationId: reservations[14]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite Premium (3 noches)',
            quantity: 3,
            price: 630000.0,
            total: 1890000.0,
          },
          {
            description: 'Servicios de Restaurante',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },

      // Overdue invoice
      {
        number: 'INV-2024-0104',
        guestName: 'Cliente Moroso',
        issueDate: oneMonthAgo,
        dueDate: new Date(oneMonthAgo.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days (overdue)
        subtotal: 1575000.0,
        taxes: 157500.0,
        total: 1732500.0,
        status: InvoiceStatus.OVERDUE,
        currency: 'COP',
        reservationId: reservations[15]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación Deluxe (5 noches)',
            quantity: 5,
            price: 315000.0,
            total: 1575000.0,
          },
        ],
      },

      // === 2025 Historical Invoices (January to current month) ===
      // January 2025
      {
        number: 'INV-2025-01-001',
        guestName: 'Daniela Ortega',
        issueDate: createDate(2025, 1, 11),
        dueDate: createDate(2025, 2, 10),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },
      {
        number: 'INV-2025-01-002',
        guestName: 'Eduardo Salinas',
        issueDate: createDate(2025, 1, 25),
        dueDate: createDate(2025, 2, 24),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[1]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // February 2025
      {
        number: 'INV-2025-02-001',
        guestName: 'Fernanda Campos',
        issueDate: createDate(2025, 2, 15),
        dueDate: createDate(2025, 3, 17),
        subtotal: 1155000.0,
        taxes: 115500.0,
        total: 1270500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[2]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
          {
            description: 'Cena romántica',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2025-02-002',
        guestName: 'Gustavo Robles',
        issueDate: createDate(2025, 2, 26),
        dueDate: createDate(2025, 3, 28),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[3]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },

      // March 2025
      {
        number: 'INV-2025-03-001',
        guestName: 'Helena Vega',
        issueDate: createDate(2025, 3, 14),
        dueDate: createDate(2025, 4, 13),
        subtotal: 2940000.0,
        taxes: 294000.0,
        total: 3234000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[4]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
        ],
      },
      {
        number: 'INV-2025-03-002',
        guestName: 'Ignacio Bravo',
        issueDate: createDate(2025, 3, 28),
        dueDate: createDate(2025, 4, 27),
        subtotal: 1890000.0,
        taxes: 189000.0,
        total: 2079000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[5]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (3 noches)',
            quantity: 3,
            price: 630000.0,
            total: 1890000.0,
          },
        ],
      },

      // April 2025
      {
        number: 'INV-2025-04-001',
        guestName: 'Julia Santana',
        issueDate: createDate(2025, 4, 12),
        dueDate: createDate(2025, 5, 12),
        subtotal: 1260000.0,
        taxes: 126000.0,
        total: 1386000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[6]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
        ],
      },
      {
        number: 'INV-2025-04-002',
        guestName: 'Kevin Montes',
        issueDate: createDate(2025, 4, 25),
        dueDate: createDate(2025, 5, 25),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[7]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // May 2025
      {
        number: 'INV-2025-05-001',
        guestName: 'Lorena Figueroa',
        issueDate: createDate(2025, 5, 15),
        dueDate: createDate(2025, 6, 14),
        subtotal: 3990000.0,
        taxes: 399000.0,
        total: 4389000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[8]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Ejecutiva (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 525000.0,
            total: 525000.0,
          },
          {
            description: 'Spa',
            quantity: 1,
            price: 315000.0,
            total: 315000.0,
          },
        ],
      },
      {
        number: 'INV-2025-05-002',
        guestName: 'Manuel Cardenas',
        issueDate: createDate(2025, 5, 28),
        dueDate: createDate(2025, 6, 27),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[9]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },

      // June 2025
      {
        number: 'INV-2025-06-001',
        guestName: 'Natalia Herrera',
        issueDate: createDate(2025, 6, 13),
        dueDate: createDate(2025, 7, 13),
        subtotal: 3150000.0,
        taxes: 315000.0,
        total: 3465000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[10]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
        ],
      },
      {
        number: 'INV-2025-06-002',
        guestName: 'Óscar Villegas',
        issueDate: createDate(2025, 6, 28),
        dueDate: createDate(2025, 7, 28),
        subtotal: 2520000.0,
        taxes: 252000.0,
        total: 2772000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[11]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
        ],
      },

      // July 2025
      {
        number: 'INV-2025-07-001',
        guestName: 'Paola Bermúdez',
        issueDate: createDate(2025, 7, 13),
        dueDate: createDate(2025, 8, 12),
        subtotal: 4200000.0,
        taxes: 420000.0,
        total: 4620000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[12]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Familiar (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 840000.0,
            total: 840000.0,
          },
          {
            description: 'Tours',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2025-07-002',
        guestName: 'Quintín Acosta',
        issueDate: createDate(2025, 7, 26),
        dueDate: createDate(2025, 8, 25),
        subtotal: 1680000.0,
        taxes: 168000.0,
        total: 1848000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[13]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
        ],
      },

      // August 2025
      {
        number: 'INV-2025-08-001',
        guestName: 'Rosa Maldonado',
        issueDate: createDate(2025, 8, 10),
        dueDate: createDate(2025, 9, 9),
        subtotal: 3990000.0,
        taxes: 399000.0,
        total: 4389000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[14]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
          {
            description: 'Spa',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2025-08-002',
        guestName: 'Sergio Luna',
        issueDate: createDate(2025, 8, 27),
        dueDate: createDate(2025, 9, 26),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[15]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // September 2025
      {
        number: 'INV-2025-09-001',
        guestName: 'Teresa Palacios',
        issueDate: createDate(2025, 9, 13),
        dueDate: createDate(2025, 10, 13),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[16]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },
      {
        number: 'INV-2025-09-002',
        guestName: 'Ulises Castro',
        issueDate: createDate(2025, 9, 29),
        dueDate: createDate(2025, 10, 29),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[17]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // October 2025 (current month)
      {
        number: 'INV-2025-10-001',
        guestName: 'Verónica Solis',
        issueDate: createDate(2025, 10, 9),
        dueDate: createDate(2025, 11, 8),
        subtotal: 1680000.0,
        taxes: 168000.0,
        total: 1848000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[18]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
        ],
      },

      // === 2024 Historical Invoices (all months) ===
      // January 2024
      {
        number: 'INV-2024-01-001',
        guestName: 'Carlos Mendoza',
        issueDate: createDate(2024, 1, 8),
        dueDate: createDate(2024, 2, 7),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },
      {
        number: 'INV-2024-01-002',
        guestName: 'Ana Beltrán',
        issueDate: createDate(2024, 1, 18),
        dueDate: createDate(2024, 2, 17),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[1]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // February 2024
      {
        number: 'INV-2024-02-001',
        guestName: 'María Ángeles',
        issueDate: createDate(2024, 2, 14),
        dueDate: createDate(2024, 3, 15),
        subtotal: 3150000.0,
        taxes: 315000.0,
        total: 3465000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[2]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Cena romántica',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
        ],
      },
      {
        number: 'INV-2024-02-002',
        guestName: 'José Ramírez',
        issueDate: createDate(2024, 2, 22),
        dueDate: createDate(2024, 3, 23),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[3]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },

      // March 2024
      {
        number: 'INV-2024-03-001',
        guestName: 'Sandra Pinto',
        issueDate: createDate(2024, 3, 12),
        dueDate: createDate(2024, 4, 11),
        subtotal: 2940000.0,
        taxes: 294000.0,
        total: 3234000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[4]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Familiar (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
        ],
      },
      {
        number: 'INV-2024-03-002',
        guestName: 'Luis Arias',
        issueDate: createDate(2024, 3, 25),
        dueDate: createDate(2024, 4, 24),
        subtotal: 1890000.0,
        taxes: 189000.0,
        total: 2079000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[5]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (3 noches)',
            quantity: 3,
            price: 630000.0,
            total: 1890000.0,
          },
        ],
      },

      // April 2024
      {
        number: 'INV-2024-04-001',
        guestName: 'Diana Salazar',
        issueDate: createDate(2024, 4, 9),
        dueDate: createDate(2024, 5, 9),
        subtotal: 1260000.0,
        taxes: 126000.0,
        total: 1386000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[6]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
        ],
      },
      {
        number: 'INV-2024-04-002',
        guestName: 'Héctor Muñoz',
        issueDate: createDate(2024, 4, 21),
        dueDate: createDate(2024, 5, 21),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[7]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // May 2024
      {
        number: 'INV-2024-05-001',
        guestName: 'Paula Cortés',
        issueDate: createDate(2024, 5, 15),
        dueDate: createDate(2024, 6, 14),
        subtotal: 3990000.0,
        taxes: 399000.0,
        total: 4389000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[8]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Ejecutiva (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 525000.0,
            total: 525000.0,
          },
          { description: 'Spa', quantity: 1, price: 315000.0, total: 315000.0 },
        ],
      },
      {
        number: 'INV-2024-05-002',
        guestName: 'Germán Soto',
        issueDate: createDate(2024, 5, 26),
        dueDate: createDate(2024, 6, 25),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[9]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },

      // June 2024
      {
        number: 'INV-2024-06-001',
        guestName: 'Claudia Rojas',
        issueDate: createDate(2024, 6, 11),
        dueDate: createDate(2024, 7, 11),
        subtotal: 3360000.0,
        taxes: 336000.0,
        total: 3696000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[10]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
          {
            description: 'Tours',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2024-06-002',
        guestName: 'Alberto Vega',
        issueDate: createDate(2024, 6, 24),
        dueDate: createDate(2024, 7, 24),
        subtotal: 2520000.0,
        taxes: 252000.0,
        total: 2772000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[11]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
        ],
      },

      // July 2024
      {
        number: 'INV-2024-07-001',
        guestName: 'Beatriz Luna',
        issueDate: createDate(2024, 7, 10),
        dueDate: createDate(2024, 8, 9),
        subtotal: 4830000.0,
        taxes: 483000.0,
        total: 5313000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[12]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Familiar (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 1050000.0,
            total: 1050000.0,
          },
          {
            description: 'Actividades',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
        ],
      },
      {
        number: 'INV-2024-07-002',
        guestName: 'Felipe Navarro',
        issueDate: createDate(2024, 7, 22),
        dueDate: createDate(2024, 8, 21),
        subtotal: 1680000.0,
        taxes: 168000.0,
        total: 1848000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[13]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
        ],
      },

      // August 2024
      {
        number: 'INV-2024-08-001',
        guestName: 'Gloria Medina',
        issueDate: createDate(2024, 8, 7),
        dueDate: createDate(2024, 9, 6),
        subtotal: 3990000.0,
        taxes: 399000.0,
        total: 4389000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[14]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
          { description: 'Spa', quantity: 1, price: 210000.0, total: 210000.0 },
        ],
      },
      {
        number: 'INV-2024-08-002',
        guestName: 'Iván Paredes',
        issueDate: createDate(2024, 8, 23),
        dueDate: createDate(2024, 9, 22),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[15]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // September 2024
      {
        number: 'INV-2024-09-001',
        guestName: 'Juliana Cruz',
        issueDate: createDate(2024, 9, 9),
        dueDate: createDate(2024, 10, 9),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[16]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },
      {
        number: 'INV-2024-09-002',
        guestName: 'Mauricio Rivas',
        issueDate: createDate(2024, 9, 25),
        dueDate: createDate(2024, 10, 25),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[17]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // October 2024
      {
        number: 'INV-2024-10-001',
        guestName: 'Nora Campos',
        issueDate: createDate(2024, 10, 14),
        dueDate: createDate(2024, 11, 13),
        subtotal: 1680000.0,
        taxes: 168000.0,
        total: 1848000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[18]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
        ],
      },
      {
        number: 'INV-2024-10-002',
        guestName: 'Oscar Fuentes',
        issueDate: createDate(2024, 10, 28),
        dueDate: createDate(2024, 11, 27),
        subtotal: 2100000.0,
        taxes: 210000.0,
        total: 2310000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[19]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (3 noches)',
            quantity: 3,
            price: 630000.0,
            total: 1890000.0,
          },
          {
            description: 'Decoración Halloween',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },

      // November 2024
      {
        number: 'INV-2024-11-001',
        guestName: 'Patricia Duarte',
        issueDate: createDate(2024, 11, 12),
        dueDate: createDate(2024, 12, 12),
        subtotal: 2520000.0,
        taxes: 252000.0,
        total: 2772000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[20]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
        ],
      },
      {
        number: 'INV-2024-11-002',
        guestName: 'Rodrigo Peña',
        issueDate: createDate(2024, 11, 25),
        dueDate: createDate(2024, 12, 25),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[21]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // December 2024
      {
        number: 'INV-2024-12-001',
        guestName: 'Silvia Mejía',
        issueDate: createDate(2024, 12, 20),
        dueDate: createDate(2025, 1, 19),
        subtotal: 4200000.0,
        taxes: 420000.0,
        total: 4620000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[22]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Familiar (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Cena Navideña',
            quantity: 1,
            price: 840000.0,
            total: 840000.0,
          },
          {
            description: 'Decoración',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2024-12-002',
        guestName: 'Tomás Ortega',
        issueDate: createDate(2024, 12, 31),
        dueDate: createDate(2025, 1, 30),
        subtotal: 2100000.0,
        taxes: 210000.0,
        total: 2310000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[23]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (3 noches)',
            quantity: 3,
            price: 630000.0,
            total: 1890000.0,
          },
          {
            description: 'Fiesta Año Nuevo',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },

      // === 2023 Historical Invoices (all months) ===
      // January 2023
      {
        number: 'INV-2023-01-001',
        guestName: 'Adriana Castro',
        issueDate: createDate(2023, 1, 10),
        dueDate: createDate(2023, 2, 9),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },
      {
        number: 'INV-2023-01-002',
        guestName: 'Bruno Vargas',
        issueDate: createDate(2023, 1, 23),
        dueDate: createDate(2023, 2, 22),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[1]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // February 2023
      {
        number: 'INV-2023-02-001',
        guestName: 'Carolina Flores',
        issueDate: createDate(2023, 2, 15),
        dueDate: createDate(2023, 3, 17),
        subtotal: 1155000.0,
        taxes: 115500.0,
        total: 1270500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[2]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
          {
            description: 'Cena romántica',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2023-02-002',
        guestName: 'David Montes',
        issueDate: createDate(2023, 2, 27),
        dueDate: createDate(2023, 3, 29),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[3]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },

      // March 2023
      {
        number: 'INV-2023-03-001',
        guestName: 'Elena Sandoval',
        issueDate: createDate(2023, 3, 14),
        dueDate: createDate(2023, 4, 13),
        subtotal: 2940000.0,
        taxes: 294000.0,
        total: 3234000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[4]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 420000.0,
            total: 420000.0,
          },
        ],
      },
      {
        number: 'INV-2023-03-002',
        guestName: 'Francisco León',
        issueDate: createDate(2023, 3, 27),
        dueDate: createDate(2023, 4, 26),
        subtotal: 1890000.0,
        taxes: 189000.0,
        total: 2079000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[5]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (3 noches)',
            quantity: 3,
            price: 630000.0,
            total: 1890000.0,
          },
        ],
      },

      // April 2023
      {
        number: 'INV-2023-04-001',
        guestName: 'Gabriela Suárez',
        issueDate: createDate(2023, 4, 12),
        dueDate: createDate(2023, 5, 12),
        subtotal: 1260000.0,
        taxes: 126000.0,
        total: 1386000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[6]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
        ],
      },
      {
        number: 'INV-2023-04-002',
        guestName: 'Hugo Gallego',
        issueDate: createDate(2023, 4, 25),
        dueDate: createDate(2023, 5, 25),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[7]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // May 2023
      {
        number: 'INV-2023-05-001',
        guestName: 'Inés Prieto',
        issueDate: createDate(2023, 5, 17),
        dueDate: createDate(2023, 6, 16),
        subtotal: 3150000.0,
        taxes: 315000.0,
        total: 3465000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[8]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
        ],
      },
      {
        number: 'INV-2023-05-002',
        guestName: 'Javier Parra',
        issueDate: createDate(2023, 5, 28),
        dueDate: createDate(2023, 6, 27),
        subtotal: 630000.0,
        taxes: 63000.0,
        total: 693000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[9]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (2 noches)',
            quantity: 2,
            price: 315000.0,
            total: 630000.0,
          },
        ],
      },

      // June 2023
      {
        number: 'INV-2023-06-001',
        guestName: 'Karina Blanco',
        issueDate: createDate(2023, 6, 13),
        dueDate: createDate(2023, 7, 13),
        subtotal: 3150000.0,
        taxes: 315000.0,
        total: 3465000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[10]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
        ],
      },
      {
        number: 'INV-2023-06-002',
        guestName: 'Leonardo Cano',
        issueDate: createDate(2023, 6, 27),
        dueDate: createDate(2023, 7, 27),
        subtotal: 2520000.0,
        taxes: 252000.0,
        total: 2772000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[11]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
        ],
      },

      // July 2023
      {
        number: 'INV-2023-07-001',
        guestName: 'Mariana Reyes',
        issueDate: createDate(2023, 7, 12),
        dueDate: createDate(2023, 8, 11),
        subtotal: 4200000.0,
        taxes: 420000.0,
        total: 4620000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[12]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Familiar (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Restaurante',
            quantity: 1,
            price: 840000.0,
            total: 840000.0,
          },
          {
            description: 'Tours',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2023-07-002',
        guestName: 'Nicolás Aguilar',
        issueDate: createDate(2023, 7, 24),
        dueDate: createDate(2023, 8, 23),
        subtotal: 1260000.0,
        taxes: 126000.0,
        total: 1386000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[13]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
        ],
      },

      // August 2023
      {
        number: 'INV-2023-08-001',
        guestName: 'Olga Serrano',
        issueDate: createDate(2023, 8, 9),
        dueDate: createDate(2023, 9, 8),
        subtotal: 3150000.0,
        taxes: 315000.0,
        total: 3465000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[14]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
        ],
      },
      {
        number: 'INV-2023-08-002',
        guestName: 'Pablo Rincón',
        issueDate: createDate(2023, 8, 25),
        dueDate: createDate(2023, 9, 24),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[15]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // September 2023
      {
        number: 'INV-2023-09-001',
        guestName: 'Quetzali Mora',
        issueDate: createDate(2023, 9, 11),
        dueDate: createDate(2023, 10, 11),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[16]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },
      {
        number: 'INV-2023-09-002',
        guestName: 'Ramiro Villegas',
        issueDate: createDate(2023, 9, 27),
        dueDate: createDate(2023, 10, 27),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[17]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // October 2023
      {
        number: 'INV-2023-10-001',
        guestName: 'Sara Escobar',
        issueDate: createDate(2023, 10, 16),
        dueDate: createDate(2023, 11, 15),
        subtotal: 1260000.0,
        taxes: 126000.0,
        total: 1386000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[18]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Habitación (4 noches)',
            quantity: 4,
            price: 315000.0,
            total: 1260000.0,
          },
        ],
      },
      {
        number: 'INV-2023-10-002',
        guestName: 'Tadeo Ibáñez',
        issueDate: createDate(2023, 10, 30),
        dueDate: createDate(2023, 11, 29),
        subtotal: 1890000.0,
        taxes: 189000.0,
        total: 2079000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[19]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Suite (3 noches)',
            quantity: 3,
            price: 630000.0,
            total: 1890000.0,
          },
        ],
      },

      // November 2023
      {
        number: 'INV-2023-11-001',
        guestName: 'Úrsula Bravo',
        issueDate: createDate(2023, 11, 14),
        dueDate: createDate(2023, 12, 14),
        subtotal: 2520000.0,
        taxes: 252000.0,
        total: 2772000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[20]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite (4 noches)',
            quantity: 4,
            price: 630000.0,
            total: 2520000.0,
          },
        ],
      },
      {
        number: 'INV-2023-11-002',
        guestName: 'Víctor Pinto',
        issueDate: createDate(2023, 11, 27),
        dueDate: createDate(2023, 12, 27),
        subtotal: 945000.0,
        taxes: 94500.0,
        total: 1039500.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.DEBIT_CARD,
        currency: 'COP',
        reservationId: reservations[21]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (3 noches)',
            quantity: 3,
            price: 315000.0,
            total: 945000.0,
          },
        ],
      },

      // December 2023
      {
        number: 'INV-2023-12-001',
        guestName: 'Wendy Alvarado',
        issueDate: createDate(2023, 12, 21),
        dueDate: createDate(2024, 1, 20),
        subtotal: 3990000.0,
        taxes: 399000.0,
        total: 4389000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        currency: 'COP',
        reservationId: reservations[22]?.id || reservations[0]?.id,
        userId: users[0]?.id,
        items: [
          {
            description: 'Suite Familiar (5 noches)',
            quantity: 5,
            price: 630000.0,
            total: 3150000.0,
          },
          {
            description: 'Cena Navideña',
            quantity: 1,
            price: 630000.0,
            total: 630000.0,
          },
          {
            description: 'Decoración',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
      {
        number: 'INV-2023-12-002',
        guestName: 'Xavier Zambrano',
        issueDate: createDate(2023, 12, 31),
        dueDate: createDate(2024, 1, 30),
        subtotal: 1470000.0,
        taxes: 147000.0,
        total: 1617000.0,
        status: InvoiceStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        currency: 'COP',
        reservationId: reservations[23]?.id || reservations[0]?.id,
        userId: users[1]?.id,
        items: [
          {
            description: 'Habitación (2 noches)',
            quantity: 2,
            price: 630000.0,
            total: 1260000.0,
          },
          {
            description: 'Fiesta Año Nuevo',
            quantity: 1,
            price: 210000.0,
            total: 210000.0,
          },
        ],
      },
    ];

    for (const invoiceData of invoices) {
      const existingInvoice = await this.invoiceRepository.findOne({
        where: { number: invoiceData.number },
      });

      if (!existingInvoice) {
        const { items, ...invoiceInfo } = invoiceData;
        const invoice = await this.invoiceRepository.save(invoiceInfo);

        // Create invoice items
        for (const itemData of items) {
          await this.invoiceItemRepository.save({
            ...itemData,
            invoiceId: invoice.id,
          });
        }
      }
    }

    console.log(`✅ Seeded ${invoices.length} predefined invoices`);
  }
}
