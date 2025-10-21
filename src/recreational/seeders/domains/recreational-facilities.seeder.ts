import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecreationalFacility } from '../../entities/recreational-facility.entity';
import { FacilityType } from '../../enums/facility-type.enum';
import { FacilityStatus } from '../../enums/facility-status.enum';

@Injectable()
export class RecreationalFacilitiesSeeder {
  constructor(
    @InjectRepository(RecreationalFacility)
    private readonly facilityRepository: Repository<RecreationalFacility>,
  ) {}

  async seed() {
    const existingCount = await this.facilityRepository.count();
    if (existingCount > 0) {
      console.log(
        '⏭️ Las instalaciones recreativas ya existen, saltando seeding',
      );
      return;
    }

    const facilities = [
      {
        name: 'Piscina Olímpica',
        type: FacilityType.SWIMMING_POOL,
        status: FacilityStatus.AVAILABLE,
        capacity: 25,
        area: 500.0,
        location: 'Centro de Bienestar - Planta Baja',
        description:
          'Piscina profesional de 50 metros con 8 carriles, agua climatizada y amenidades junto a la piscina. Perfecta para natación, aqua aeróbicos y recreación.',
        hourlyRate: 45000.0,
        isAvailable: true,
        openingTime: '06:00',
        closingTime: '22:00',
        minimumBookingHours: 1,
        maximumBookingHours: 4,
        amenities: [
          'Toallas de piscina',
          'Vestidores',
          'Duchas',
          'Sillas de piscina',
          'Salvavidas de servicio',
        ],
        rules: [
          'Gorro de baño obligatorio',
          'Niños menores de 12 años deben estar supervisados',
          'No se permite comida o bebidas externas',
          'Máximo 2 horas continuas durante horas pico',
        ],
        advanceBookingHours: 2,
        availableDays: [1, 2, 3, 4, 5, 6, 0], // All days
        maintenanceNotes:
          'Limpieza diaria 5:00-6:00 AM, revisión química semanal domingos 5:00-7:00 AM',
      },
      {
        name: 'Gimnasio Completo',
        type: FacilityType.GYM,
        status: FacilityStatus.AVAILABLE,
        capacity: 15,
        area: 300.0,
        location: 'Centro de Bienestar - Segundo Piso',
        description:
          'Gimnasio completamente equipado con máquinas de cardio, pesas libres y equipos de entrenamiento de fuerza. Entrenamiento personal disponible.',
        hourlyRate: 35000.0,
        isAvailable: true,
        openingTime: '05:00',
        closingTime: '23:00',
        minimumBookingHours: 1,
        maximumBookingHours: 3,
        amenities: [
          'Servicio de toallas',
          'Estación de agua',
          'Vestidores',
          'Lockers',
          'Sistema de sonido',
        ],
        rules: [
          'Ropa deportiva apropiada obligatoria',
          'Limpiar equipos después del uso',
          'No música personal sin audífonos',
          'Sesiones máximas de 3 horas',
        ],
        advanceBookingHours: 1,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Mantenimiento de equipos todos los martes 2:00-4:00 AM',
      },
      {
        name: 'Cancha de Tenis Profesional',
        type: FacilityType.TENNIS_COURT,
        status: FacilityStatus.AVAILABLE,
        capacity: 4,
        area: 648.0,
        location: 'Complejo Deportivo - Exterior',
        description:
          'Cancha de tenis profesional de superficie dura con iluminación nocturna. Alquiler de equipos disponible en recepción.',
        hourlyRate: 60000.0,
        isAvailable: true,
        openingTime: '07:00',
        closingTime: '21:00',
        minimumBookingHours: 1,
        maximumBookingHours: 3,
        amenities: [
          'Iluminación nocturna',
          'Alquiler de equipos',
          'Dispensador de agua',
          'Área de descanso',
        ],
        rules: [
          'Zapatos de tenis obligatorios',
          'Solo zapatos de cancha (no de correr)',
          'Máximo 4 jugadores',
          'No se permite comida en la cancha',
        ],
        advanceBookingHours: 4,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Renovación de superficie anual, inspección de red semanal',
      },
      {
        name: 'Spa de Lujo Premium',
        type: FacilityType.SPA,
        status: FacilityStatus.AVAILABLE,
        capacity: 2,
        area: 80.0,
        location: 'Centro de Bienestar - Tercer Piso',
        description:
          'Suite privada de spa con mesa de masajes, área de relajación y amenidades premium para parejas o tratamientos individuales.',
        hourlyRate: 120000.0,
        isAvailable: true,
        openingTime: '09:00',
        closingTime: '20:00',
        minimumBookingHours: 1,
        maximumBookingHours: 4,
        amenities: [
          'Mesa de masajes',
          'Aceites esenciales',
          'Música relajante',
          'Batas y pantuflas',
          'Servicio de té herbal',
        ],
        rules: [
          'Reserva anticipada requerida',
          'Llegar 10 minutos antes',
          'No teléfonos móviles',
          'Ambiente silencioso',
        ],
        advanceBookingHours: 24,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Limpieza profunda después de cada sesión, sanitización de equipos',
      },
      {
        name: 'Sauna Finlandés Tradicional',
        type: FacilityType.SAUNA,
        status: FacilityStatus.AVAILABLE,
        capacity: 8,
        area: 25.0,
        location: 'Centro de Bienestar - Planta Baja',
        description:
          'Sauna finlandés tradicional con terapia de calor seco. Toallas y área de enfriamiento incluidas.',
        hourlyRate: 40000.0,
        isAvailable: true,
        openingTime: '08:00',
        closingTime: '22:00',
        minimumBookingHours: 1,
        maximumBookingHours: 2,
        amenities: [
          'Servicio de toallas',
          'Ducha de enfriamiento',
          'Asientos de relajación',
          'Control de temperatura',
        ],
        rules: [
          'Toallas requeridas en todo momento',
          'Máximo 2 horas de uso continuo',
          'Ducharse antes de entrar',
          'No dispositivos electrónicos',
        ],
        advanceBookingHours: 2,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Revisión diaria de temperatura y limpieza, sanitización profunda semanal',
      },
      {
        name: 'Jacuzzi Terraza con Vista',
        type: FacilityType.JACUZZI,
        status: FacilityStatus.AVAILABLE,
        capacity: 6,
        area: 15.0,
        location: 'Terraza de Azotea',
        description:
          'Jacuzzi al aire libre con impresionantes vistas de la ciudad. Perfecto para relajación y veladas románticas.',
        hourlyRate: 55000.0,
        isAvailable: true,
        openingTime: '10:00',
        closingTime: '23:00',
        minimumBookingHours: 1,
        maximumBookingHours: 3,
        amenities: [
          'Vistas de la ciudad',
          'Iluminación subacuática',
          'Control de temperatura',
          'Servicio de toallas',
        ],
        rules: [
          'Traje de baño obligatorio',
          'Máximo 6 personas',
          'No recipientes de vidrio',
          'Niños bajo supervisión',
        ],
        advanceBookingHours: 3,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Balance químico revisado dos veces al día, limpieza de filtro semanal',
      },
      {
        name: 'Sala de Juegos Multifuncional',
        type: FacilityType.GAME_ROOM,
        status: FacilityStatus.AVAILABLE,
        capacity: 12,
        area: 120.0,
        location: 'Centro Recreativo - Planta Baja',
        description:
          'Sala de entretenimiento con mesa de billar, hockey de aire, ping pong, consolas de videojuegos y área de descanso cómoda.',
        hourlyRate: 25000.0,
        isAvailable: true,
        openingTime: '09:00',
        closingTime: '24:00',
        minimumBookingHours: 1,
        maximumBookingHours: 4,
        amenities: [
          'Mesa de billar',
          'Hockey de aire',
          'Mesa de ping pong',
          'Consolas de juego',
          'Asientos cómodos',
          'Área de snacks',
        ],
        rules: [
          'Mantener área limpia',
          'Devolver equipos después del uso',
          'Respetar otros huéspedes',
          'No comida externa',
        ],
        advanceBookingHours: 1,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Revisión de equipos semanal, limpieza profunda diaria',
      },
      {
        name: 'Estudio de Yoga y Meditación',
        type: FacilityType.YOGA_STUDIO,
        status: FacilityStatus.AVAILABLE,
        capacity: 20,
        area: 150.0,
        location: 'Centro de Bienestar - Segundo Piso',
        description:
          'Estudio tranquilo de yoga y meditación con espejos, tapetes y accesorios. Perfecto para clases grupales o práctica privada.',
        hourlyRate: 38000.0,
        isAvailable: true,
        openingTime: '06:00',
        closingTime: '21:00',
        minimumBookingHours: 1,
        maximumBookingHours: 3,
        amenities: [
          'Tapetes de yoga',
          'Cojines de meditación',
          'Espejos',
          'Sistema de sonido',
          'Accesorios disponibles',
        ],
        rules: [
          'Ambiente silencioso',
          'No zapatos sobre tapetes',
          'Limpiar tapetes después del uso',
          'Comportamiento respetuoso',
        ],
        advanceBookingHours: 2,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Sanitización de tapetes después de cada sesión, limpieza profunda semanal',
      },
      {
        name: 'Zona de Juegos Infantiles',
        type: FacilityType.KIDS_PLAY_AREA,
        status: FacilityStatus.AVAILABLE,
        capacity: 15,
        area: 100.0,
        location: 'Centro Familiar - Planta Baja',
        description:
          'Área de juegos segura y divertida para niños con toboganes, piscina de pelotas, juguetes y actividades supervisadas.',
        hourlyRate: 20000.0,
        isAvailable: true,
        openingTime: '09:00',
        closingTime: '19:00',
        minimumBookingHours: 1,
        maximumBookingHours: 3,
        amenities: [
          'Equipos de juego',
          'Juguetes',
          'Alfombras de seguridad',
          'Estaciones de gel antibacterial',
          'Asientos para padres',
        ],
        rules: [
          'Niños deben estar supervisados',
          'Límite de edad 12 años',
          'No comida en área de juegos',
          'Medias obligatorias',
        ],
        advanceBookingHours: 1,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Sanitización diaria, revisión de seguridad de equipos semanal',
      },
      {
        name: 'Centro de Negocios Ejecutivo',
        type: FacilityType.BUSINESS_CENTER,
        status: FacilityStatus.AVAILABLE,
        capacity: 8,
        area: 60.0,
        location: 'Edificio Principal - Entrepiso',
        description:
          'Centro de negocios completamente equipado con computadores, impresoras, espacio de reunión e internet de alta velocidad.',
        hourlyRate: 28000.0,
        isAvailable: true,
        openingTime: '06:00',
        closingTime: '22:00',
        minimumBookingHours: 1,
        maximumBookingHours: 8,
        amenities: [
          'Computadores',
          'Impresoras',
          'Escáner',
          'WiFi alta velocidad',
          'Mesa de juntas',
          'Materiales de oficina',
        ],
        rules: [
          'Solo uso profesional',
          'No comida cerca de equipos',
          'Guardar trabajo antes de salir',
          'Respetar otros trabajando',
        ],
        advanceBookingHours: 1,
        availableDays: [1, 2, 3, 4, 5, 6, 0],
        maintenanceNotes:
          'Actualización de equipos mensual, limpieza dos veces al día',
      },
    ];

    for (const facilityData of facilities) {
      const facility = this.facilityRepository.create(facilityData);
      await this.facilityRepository.save(facility);
    }

    console.log(`✨ Creadas ${facilities.length} instalaciones recreativas`);
  }
}
