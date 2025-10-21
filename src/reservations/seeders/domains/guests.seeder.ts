import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from '../../entities/guest.entity';

@Injectable()
export class GuestsSeeder {
  constructor(
    @InjectRepository(Guest)
    private guestRepository: Repository<Guest>,
  ) {}

  async seed() {
    const guests = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1234567890',
        document: 'ABC123456',
        address: '123 Main St, New York, NY',
        nationality: 'American',
        vip: false,
      },
      {
        name: 'Maria Garcia',
        email: 'maria.garcia@example.com',
        phone: '+1987654321',
        document: 'XYZ789012',
        address: '456 Oak Ave, Los Angeles, CA',
        nationality: 'Mexican',
        vip: true,
      },
      {
        name: 'David Johnson',
        email: 'david.johnson@example.com',
        phone: '+1555123456',
        document: 'DEF456789',
        address: '789 Pine Rd, Chicago, IL',
        nationality: 'Canadian',
        vip: false,
      },
      {
        name: 'Carlos Rodríguez',
        email: 'carlos.rodriguez@email.com',
        phone: '+57 301 987 6543',
        document: 'CC12345678',
        address: 'Carrera 15 #85-40, Bogotá',
        nationality: 'Colombian',
        vip: false,
      },
      {
        name: 'Ana López',
        email: 'ana.lopez@email.com',
        phone: '+57 302 456 7890',
        document: 'CC87654321',
        address: 'Calle 72 #10-20, Medellín',
        nationality: 'Colombian',
        vip: true,
      },
      {
        name: 'Pedro Martínez',
        email: 'pedro.martinez@email.com',
        phone: '+57 304 567 8901',
        document: 'CC11223344',
        address: 'Avenida 19 #120-30, Cali',
        nationality: 'Colombian',
        vip: false,
      },
    ];

    for (const guestData of guests) {
      const existingGuest = await this.guestRepository.findOne({
        where: { email: guestData.email },
      });

      if (!existingGuest) {
        await this.guestRepository.save(guestData);
      }
    }
  }
}
