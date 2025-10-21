import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneralMaintenanceRequest } from '../../entities/maintenance-request.entity';
import { MaintenanceType } from '../../enums/maintenance-type.enum';
import { MaintenancePriority } from '../../enums/maintenance-priority.enum';
import { MaintenanceStatus } from '../../enums/maintenance-status.enum';
import { User } from '../../../auth/entities/user.entity';

@Injectable()
export class MaintenanceRequestSeeder {
  constructor(
    @InjectRepository(GeneralMaintenanceRequest)
    private maintenanceRequestRepository: Repository<GeneralMaintenanceRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed() {
    // Crear algunos registros de mantenimiento básicos
    const requests = [
      this.maintenanceRequestRepository.create({
        title: 'Reparación Sistema de Aire Acondicionado - Habitación 301',
        description:
          'El aire acondicionado de la habitación 301 no enfría correctamente. Los huéspedes se han quejado de la temperatura alta.',
        type: MaintenanceType.CORRECTIVE,
        priority: MaintenancePriority.HIGH,
        status: MaintenanceStatus.SCHEDULED,
        location: 'Habitación 301 - Piso 3',
        equipment: 'Unidad de Aire Acondicionado Samsung AR24',
        scheduledDate: new Date('2024-12-08'),
        scheduledStartTime: '09:00',
        estimatedDuration: 120,
        estimatedCost: 250.0,
      }),
      this.maintenanceRequestRepository.create({
        title: 'Inspección Mensual Sistema Eléctrico - Lobby Principal',
        description:
          'Inspección programada del sistema eléctrico del lobby principal para garantizar la seguridad y funcionamiento óptimo.',
        type: MaintenanceType.PREVENTIVE,
        priority: MaintenancePriority.MEDIUM,
        status: MaintenanceStatus.COMPLETED,
        location: 'Lobby Principal - Planta Baja',
        equipment: 'Panel Eléctrico Principal PE-001',
        scheduledDate: new Date('2024-12-01'),
        scheduledStartTime: '06:00',
        estimatedDuration: 180,
        estimatedCost: 300.0,
        workPerformed:
          'Inspección completa del panel eléctrico, limpieza de contactos, verificación de voltajes y corrientes.',
        materialsUsed: 'Fusible 20A, limpiador de contactos, cinta aislante',
        startedAt: new Date('2024-12-01T06:00:00'),
        completedAt: new Date('2024-12-01T08:30:00'),
        actualCost: 285.0,
      }),
      this.maintenanceRequestRepository.create({
        title: 'Fuga de Agua - Baño Habitación 205',
        description: 'Reportada fuga de agua en el baño de la habitación 205.',
        type: MaintenanceType.EMERGENCY,
        priority: MaintenancePriority.CRITICAL,
        status: MaintenanceStatus.IN_PROGRESS,
        location: 'Habitación 205 - Piso 2',
        equipment: 'Tubería Principal Baño',
        scheduledDate: new Date('2024-12-07'),
        scheduledStartTime: '14:30',
        estimatedDuration: 240,
        estimatedCost: 450.0,
        workPerformed:
          'Localización de la fuga en junta de tubería. Reparación en progreso.',
        materialsUsed: 'Tubo PVC 1/2", codos, pegamento PVC',
        startedAt: new Date('2024-12-07T14:30:00'),
      }),
      this.maintenanceRequestRepository.create({
        title: 'Mantenimiento Preventivo Ascensor Principal',
        description:
          'Mantenimiento programado trimestral del ascensor principal del hotel.',
        type: MaintenanceType.PREVENTIVE,
        priority: MaintenancePriority.HIGH,
        status: MaintenanceStatus.SCHEDULED,
        location: 'Ascensor Principal - Todos los pisos',
        equipment: 'Ascensor Otis Gen2-MRL',
        scheduledDate: new Date('2024-12-10'),
        scheduledStartTime: '05:00',
        estimatedDuration: 360,
        estimatedCost: 800.0,
      }),
      this.maintenanceRequestRepository.create({
        title: 'Mejora Iluminación LED - Pasillo Piso 4',
        description:
          'Actualización del sistema de iluminación del pasillo del piso 4.',
        type: MaintenanceType.UPGRADE,
        priority: MaintenancePriority.LOW,
        status: MaintenanceStatus.SCHEDULED,
        location: 'Pasillo Principal - Piso 4',
        equipment: 'Luminarias Corredor',
        scheduledDate: new Date('2024-12-12'),
        scheduledStartTime: '10:00',
        estimatedDuration: 480,
        estimatedCost: 1200.0,
      }),
    ];

    await this.maintenanceRequestRepository.save(requests);
  }
}
