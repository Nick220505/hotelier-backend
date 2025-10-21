import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../../entities/shift.entity';
import { ShiftType } from '../../enums/shift-type.enum';
import { ShiftStatus } from '../../enums/shift-status.enum';
import { Employee } from '../../../employees/entities/employee.entity';

@Injectable()
export class ShiftsSeeder {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async seed() {
    // Get existing employees to assign shifts to
    const employees = await this.employeeRepository.find();

    if (employees.length === 0) {
      return;
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const shiftsData = [
      // Today's shifts
      {
        date: today,
        startTime: '08:00',
        endTime: '16:00',
        type: ShiftType.MORNING,
        status: ShiftStatus.ACTIVE,
        position: 'Supervisor Limpieza',
        department: 'Limpieza',
        notes: 'Turno matutino - supervisión general',
        employeeId: employees[0].id,
      },
      {
        date: today,
        startTime: '09:00',
        endTime: '17:00',
        type: ShiftType.MORNING,
        status: ShiftStatus.ACTIVE,
        position: 'Agente Mostrador',
        department: 'Recepción',
        notes: 'Atención al cliente matutina',
        employeeId: employees[1]?.id || employees[0].id,
      },
      {
        date: today,
        startTime: '08:30',
        endTime: '16:30',
        type: ShiftType.MORNING,
        status: ShiftStatus.COMPLETED,
        position: 'Camarera',
        department: 'Limpieza',
        notes: 'Limpieza de habitaciones - turno completado',
        employeeId: employees[2]?.id || employees[0].id,
      },
      {
        date: today,
        startTime: '22:00',
        endTime: '06:00',
        type: ShiftType.NIGHT,
        status: ShiftStatus.SCHEDULED,
        position: 'Guardia Seguridad',
        department: 'Seguridad',
        notes: 'Vigilancia nocturna',
        employeeId: employees[5]?.id || employees[0].id,
      },

      // Tomorrow's shifts
      {
        date: tomorrow,
        startTime: '08:00',
        endTime: '16:00',
        type: ShiftType.MORNING,
        status: ShiftStatus.SCHEDULED,
        position: 'Supervisor Limpieza',
        department: 'Limpieza',
        notes: 'Turno matutino programado',
        employeeId: employees[0].id,
      },
      {
        date: tomorrow,
        startTime: '09:00',
        endTime: '17:00',
        type: ShiftType.MORNING,
        status: ShiftStatus.SCHEDULED,
        position: 'Agente Mostrador',
        department: 'Recepción',
        notes: 'Turno matutino recepción',
        employeeId: employees[1]?.id || employees[0].id,
      },
      {
        date: tomorrow,
        startTime: '14:00',
        endTime: '22:00',
        type: ShiftType.EVENING,
        status: ShiftStatus.SCHEDULED,
        position: 'Técnico Mantenimiento',
        department: 'Mantenimiento',
        notes: 'Mantenimiento tarde',
        employeeId: employees[3]?.id || employees[0].id,
      },
      {
        date: tomorrow,
        startTime: '18:00',
        endTime: '02:00',
        type: ShiftType.EVENING,
        status: ShiftStatus.SCHEDULED,
        position: 'Mesera',
        department: 'Restaurante',
        notes: 'Servicio de cena',
        employeeId: employees[4]?.id || employees[0].id,
      },

      // Day after tomorrow's shifts
      {
        date: dayAfterTomorrow,
        startTime: '08:00',
        endTime: '16:00',
        type: ShiftType.MORNING,
        status: ShiftStatus.SCHEDULED,
        position: 'Camarera',
        department: 'Limpieza',
        notes: 'Limpieza matutina',
        employeeId: employees[2]?.id || employees[0].id,
      },
      {
        date: dayAfterTomorrow,
        startTime: '16:00',
        endTime: '00:00',
        type: ShiftType.EVENING,
        status: ShiftStatus.SCHEDULED,
        position: 'Guardia Seguridad',
        department: 'Seguridad',
        notes: 'Turno vespertino seguridad',
        employeeId: employees[5]?.id || employees[0].id,
      },
    ];

    for (const shiftData of shiftsData) {
      const existingShift = await this.shiftRepository.findOne({
        where: {
          employeeId: shiftData.employeeId,
          date: shiftData.date,
          startTime: shiftData.startTime,
        },
      });

      if (!existingShift) {
        const shift = this.shiftRepository.create(shiftData);
        await this.shiftRepository.save(shift);
      }
    }
  }
}
