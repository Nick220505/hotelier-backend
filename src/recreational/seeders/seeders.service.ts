import { Injectable } from '@nestjs/common';
import { RecreationalFacilitiesSeeder } from './domains/recreational-facilities.seeder';
import { RecreationalBookingsSeeder } from './domains/recreational-bookings.seeder';

@Injectable()
export class SeedersService {
  constructor(
    private recreationalFacilitiesSeeder: RecreationalFacilitiesSeeder,
    private recreationalBookingsSeeder: RecreationalBookingsSeeder,
  ) {}

  async seed() {
    console.log('🌱 Iniciando seeding del módulo Recreational...');

    // Seed facilities first
    await this.recreationalFacilitiesSeeder.seed();
    console.log('✅ Instalaciones recreativas sembradas');

    // Then seed bookings
    await this.recreationalBookingsSeeder.seed();
    console.log('✅ Reservas recreativas sembradas');

    console.log('🎉 Seeding del módulo Recreational completado!');
  }
}
