import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedersService } from './seeders.service';
import { MaintenanceRequestSeeder } from './domains/maintenance-requests.seeder';
import { GeneralMaintenanceRequest } from '../entities/maintenance-request.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { User } from '../../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GeneralMaintenanceRequest, Employee, User]),
  ],
  providers: [SeedersService, MaintenanceRequestSeeder],
  exports: [SeedersService],
})
export class SeedersModule {}
