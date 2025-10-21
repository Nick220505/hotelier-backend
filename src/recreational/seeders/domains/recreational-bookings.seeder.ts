import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecreationalBooking } from '../../entities/recreational-booking.entity';
import { RecreationalFacility } from '../../entities/recreational-facility.entity';
import { RecreationalBookingStatus } from '../../enums/booking-status.enum';
import { BookingPriority } from '../../enums/booking-priority.enum';

@Injectable()
export class RecreationalBookingsSeeder {
  constructor(
    @InjectRepository(RecreationalBooking)
    private readonly bookingRepository: Repository<RecreationalBooking>,
    @InjectRepository(RecreationalFacility)
    private readonly facilityRepository: Repository<RecreationalFacility>,
  ) {}

  async seed() {
    const existingCount = await this.bookingRepository.count();
    if (existingCount > 0) {
      console.log('⏭️ Las reservas recreativas ya existen, saltando seeding');
      return;
    }

    const facilities = await this.facilityRepository.find();
    if (facilities.length === 0) {
      console.log(
        '⚠️ No se encontraron instalaciones, saltando seeding de reservas',
      );
      return;
    }

    // Create bookings for the next 30 days
    const today = new Date();
    const bookings: any[] = [];

    // Sample guest data - Colombian context
    const guests = [
      {
        name: 'María Alejandra Rodríguez',
        email: 'maria.rodriguez@gmail.com',
        phone: '+573125678901',
        room: '301',
      },
      {
        name: 'Carlos Andrés Martínez',
        email: 'carlos.martinez@hotmail.com',
        phone: '+573145678902',
        room: '205',
      },
      {
        name: 'Ana Sofía López',
        email: 'ana.lopez@yahoo.es',
        phone: '+573165678903',
        room: '412',
      },
      {
        name: 'Juan Pablo García',
        email: 'juan.garcia@outlook.com',
        phone: '+573185678904',
        room: '308',
      },
      {
        name: 'Valentina Moreno',
        email: 'valentina.moreno@gmail.com',
        phone: '+573205678905',
        room: '506',
      },
      {
        name: 'Santiago Hernández',
        email: 'santiago.hernandez@une.net.co',
        phone: '+573225678906',
        room: '203',
      },
      {
        name: 'Isabella Jiménez',
        email: 'isabella.jimenez@gmail.com',
        phone: '+573245678907',
        room: '711',
      },
      {
        name: 'Sebastián Vargas',
        email: 'sebastian.vargas@outlook.es',
        phone: '+573265678908',
        room: '115',
      },
      {
        name: 'Camila Torres',
        email: 'camila.torres@hotmail.com',
        phone: '+573285678909',
        room: '609',
      },
      {
        name: 'Diego Fernando Castro',
        email: 'diego.castro@gmail.com',
        phone: '+573305678910',
        room: '404',
      },
      {
        name: 'Sofía Alejandra Díaz',
        email: 'sofia.diaz@yahoo.com',
        phone: '+573325678911',
        room: '512',
      },
      {
        name: 'Alejandro Mejía',
        email: 'alejandro.mejia@gmail.com',
        phone: '+573345678912',
        room: '208',
      },
      {
        name: 'Natalia Restrepo',
        email: 'natalia.restrepo@outlook.com',
        phone: '+573365678913',
        room: '315',
      },
      {
        name: 'Andrés Felipe Gómez',
        email: 'andres.gomez@hotmail.com',
        phone: '+573385678914',
        room: '420',
      },
      {
        name: 'Paula Andrea Ruiz',
        email: 'paula.ruiz@gmail.com',
        phone: '+573405678915',
        room: '607',
      },
    ];

    // Time slots for bookings
    const timeSlots = [
      { start: '09:00', end: '10:00', duration: 1 },
      { start: '10:00', end: '12:00', duration: 2 },
      { start: '14:00', end: '15:00', duration: 1 },
      { start: '15:00', end: '17:00', duration: 2 },
      { start: '17:00', end: '18:00', duration: 1 },
      { start: '18:00', end: '20:00', duration: 2 },
      { start: '20:00', end: '21:00', duration: 1 },
    ];

    const statuses = [
      RecreationalBookingStatus.PENDING,
      RecreationalBookingStatus.CONFIRMED,
      RecreationalBookingStatus.CHECKED_IN,
      RecreationalBookingStatus.COMPLETED,
    ];

    const priorities = [
      BookingPriority.NORMAL,
      BookingPriority.HIGH,
      BookingPriority.VIP,
    ];

    const specialRequests = [
      'Por favor proporcionar toallas para 3 huéspedes',
      'Primera vez usando la instalación - necesita orientación',
      'Huésped VIP - brindar servicio premium',
      'Celebrando aniversario - configuración especial solicitada',
      'Condición médica - necesita asistencia',
      'Reserva grupal - evento corporativo',
      'Familia con niños pequeños - supervisión especial',
      'Solicita música relajante durante la sesión',
      'Prefiere agua fría adicional',
      'Necesita equipo de ejercicio adaptado',
      'Huésped extranjero - atención en inglés',
      'Celebración de cumpleaños - decoración solicitada',
      null,
      null, // La mayoría de reservas no tendrán solicitudes especiales
      null,
    ];

    // Generate bookings for each day
    for (let dayOffset = -7; dayOffset <= 30; dayOffset++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() + dayOffset);
      bookingDate.setHours(0, 0, 0, 0);

      // Create 2-5 random bookings per day
      const bookingsPerDay = Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < bookingsPerDay; i++) {
        const facility =
          facilities[Math.floor(Math.random() * facilities.length)];
        const guest = guests[Math.floor(Math.random() * guests.length)];
        const timeSlot =
          timeSlots[Math.floor(Math.random() * timeSlots.length)];
        const participants =
          Math.floor(Math.random() * Math.min(facility.capacity, 6)) + 1;

        // Calculate cost
        let totalCost = Number(facility.hourlyRate) * timeSlot.duration;

        // Apply random discount sometimes
        const discountPercent =
          Math.random() > 0.8 ? Math.floor(Math.random() * 20) + 5 : 0;
        const discountAmount =
          Math.random() > 0.9 ? Math.floor(Math.random() * 10) + 5 : 0;

        if (discountPercent > 0) {
          totalCost = totalCost * (1 - discountPercent / 100);
        }
        if (discountAmount > 0) {
          totalCost = Math.max(0, totalCost - discountAmount);
        }

        // Determine status based on date
        let status;
        let actualCheckIn: Date | null = null;
        let actualCheckOut: Date | null = null;

        if (dayOffset < -2) {
          // Past bookings are mostly completed
          status =
            Math.random() > 0.1
              ? RecreationalBookingStatus.COMPLETED
              : RecreationalBookingStatus.CANCELLED;
          if (status === RecreationalBookingStatus.COMPLETED) {
            actualCheckIn = new Date(bookingDate);
            actualCheckIn.setHours(
              parseInt(timeSlot.start.split(':')[0]),
              parseInt(timeSlot.start.split(':')[1]),
            );
            actualCheckOut = new Date(bookingDate);
            actualCheckOut.setHours(
              parseInt(timeSlot.end.split(':')[0]),
              parseInt(timeSlot.end.split(':')[1]),
            );
          }
        } else if (dayOffset < 0) {
          // Recent past bookings
          status = statuses[Math.floor(Math.random() * statuses.length)];
        } else if (dayOffset === 0) {
          // Today's bookings - mix of statuses
          const todayStatuses = [
            RecreationalBookingStatus.CONFIRMED,
            RecreationalBookingStatus.CHECKED_IN,
          ];
          status =
            todayStatuses[Math.floor(Math.random() * todayStatuses.length)];
        } else {
          // Future bookings are pending or confirmed
          status =
            Math.random() > 0.3
              ? RecreationalBookingStatus.CONFIRMED
              : RecreationalBookingStatus.PENDING;
        }

        const booking = {
          guestName: guest.name,
          guestEmail: guest.email,
          guestPhone: guest.phone,
          roomNumber: guest.room,
          bookingDate,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          duration: timeSlot.duration,
          participants,
          totalCost: Math.round(totalCost * 100) / 100,
          status: status as RecreationalBookingStatus,
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          specialRequests:
            specialRequests[
              Math.floor(Math.random() * specialRequests.length)
            ] || undefined,
          staffNotes:
            status === RecreationalBookingStatus.CANCELLED
              ? 'Huésped solicitó cancelación'
              : undefined,
          actualCheckIn: actualCheckIn || undefined,
          actualCheckOut: actualCheckOut || undefined,
          discountPercent: discountPercent > 0 ? discountPercent : undefined,
          discountAmount: discountAmount > 0 ? discountAmount : undefined,
          facilityId: facility.id,
        };

        bookings.push(booking);
      }
    }

    // Save bookings in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < bookings.length; i += batchSize) {
      const batch = bookings.slice(i, i + batchSize);
      for (const booking of batch) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const bookingEntity = this.bookingRepository.create(booking);
        await this.bookingRepository.save(bookingEntity);
      }
    }

    console.log(
      `✨ Creadas ${bookings.length} reservas recreativas en múltiples instalaciones y fechas`,
    );
  }
}
