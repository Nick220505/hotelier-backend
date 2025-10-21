import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';
import { AttendanceStatus } from '../../enums/attendance-status.enum';
import { Employee } from '../../../employees/entities/employee.entity';

@Injectable()
export class AttendanceSeeder {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async seed() {
    // Get existing employees to create attendance records for
    const employees = await this.employeeRepository.find();

    if (employees.length === 0) {
      return;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(today.getDate() - 2);

    const attendanceRecords = [
      // Today's records (some ongoing)
      {
        date: today,
        checkIn: '08:00',
        checkOut: undefined, // Still working
        status: AttendanceStatus.PRESENT,
        notes: 'Entrada puntual - turno en curso',
        hoursWorked: 0,
        overtimeHours: 0,
        employeeId: employees[0].id, // Maria Rodriguez
      },
      {
        date: today,
        checkIn: '09:10',
        checkOut: undefined, // Still working
        status: AttendanceStatus.LATE,
        notes: 'Llegada tarde por tráfico',
        hoursWorked: 0,
        overtimeHours: 0,
        employeeId: employees[1].id, // Carlos Martinez
      },
      {
        date: today,
        checkIn: '08:30',
        checkOut: undefined, // Still working
        status: AttendanceStatus.PRESENT,
        notes: 'Turno matutino normal',
        hoursWorked: 0,
        overtimeHours: 0,
        employeeId: employees[2]?.id || employees[0].id, // Ana Garcia
      },
      {
        date: today,
        checkIn: undefined,
        checkOut: undefined,
        status: AttendanceStatus.SICK_LEAVE,
        notes: 'Incapacidad médica - gripe',
        hoursWorked: 0,
        overtimeHours: 0,
        employeeId: employees[3]?.id || employees[0].id, // Luis Fernandez
      },

      // Yesterday's completed records
      {
        date: yesterday,
        checkIn: '08:00',
        checkOut: '16:30',
        status: AttendanceStatus.PRESENT,
        notes: 'Jornada completa',
        hoursWorked: 8.5,
        overtimeHours: 0.5,
        employeeId: employees[0].id, // Maria Rodriguez
      },
      {
        date: yesterday,
        checkIn: '09:00',
        checkOut: '17:00',
        status: AttendanceStatus.PRESENT,
        notes: 'Turno regular',
        hoursWorked: 8.0,
        overtimeHours: 0,
        employeeId: employees[1].id, // Carlos Martinez
      },
      {
        date: yesterday,
        checkIn: '08:30',
        checkOut: '16:30',
        status: AttendanceStatus.PRESENT,
        notes: 'Limpieza de habitaciones completada',
        hoursWorked: 8.0,
        overtimeHours: 0,
        employeeId: employees[2]?.id || employees[0].id, // Ana Garcia
      },
      {
        date: yesterday,
        checkIn: '14:00',
        checkOut: '22:30',
        status: AttendanceStatus.PRESENT,
        notes: 'Turno vespertino - mantenimiento',
        hoursWorked: 8.5,
        overtimeHours: 0.5,
        employeeId: employees[3]?.id || employees[0].id, // Luis Fernandez
      },
      {
        date: yesterday,
        checkIn: '18:00',
        checkOut: '02:00',
        status: AttendanceStatus.PRESENT,
        notes: 'Turno nocturno - servicio de cena',
        hoursWorked: 8.0,
        overtimeHours: 0,
        employeeId: employees[4]?.id || employees[0].id, // Sofia Herrera
      },
      {
        date: yesterday,
        checkIn: '22:00',
        checkOut: '06:00',
        status: AttendanceStatus.PRESENT,
        notes: 'Vigilancia nocturna',
        hoursWorked: 8.0,
        overtimeHours: 0,
        employeeId: employees[5]?.id || employees[0].id, // Roberto Silva
      },

      // Day before yesterday
      {
        date: dayBeforeYesterday,
        checkIn: '08:15',
        checkOut: '16:00',
        status: AttendanceStatus.EARLY_LEAVE,
        notes: 'Salida temprana por cita médica',
        hoursWorked: 7.75,
        overtimeHours: 0,
        employeeId: employees[0].id, // Maria Rodriguez
      },
      {
        date: dayBeforeYesterday,
        checkIn: undefined,
        checkOut: undefined,
        status: AttendanceStatus.VACATION,
        notes: 'Día de vacaciones programado',
        hoursWorked: 0,
        overtimeHours: 0,
        employeeId: employees[1].id, // Carlos Martinez
      },
      {
        date: dayBeforeYesterday,
        checkIn: '08:30',
        checkOut: '17:30',
        status: AttendanceStatus.PRESENT,
        notes: 'Jornada extendida - evento especial',
        hoursWorked: 9.0,
        overtimeHours: 1.0,
        employeeId: employees[2]?.id || employees[0].id, // Ana Garcia
      },
      {
        date: dayBeforeYesterday,
        checkIn: undefined,
        checkOut: undefined,
        status: AttendanceStatus.ABSENT,
        notes: 'Ausencia no justificada',
        hoursWorked: 0,
        overtimeHours: 0,
        employeeId: employees[3]?.id || employees[0].id, // Luis Fernandez
      },
    ];

    for (const recordData of attendanceRecords) {
      const existingRecord = await this.attendanceRepository.findOne({
        where: {
          employeeId: recordData.employeeId,
          date: recordData.date,
        },
      });

      if (!existingRecord) {
        const attendance = this.attendanceRepository.create(recordData);
        await this.attendanceRepository.save(attendance);
      }
    }
  }
}
