import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../entities/supplier.entity';

@Injectable()
export class SuppliersSeeder {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async seed(): Promise<void> {
    const existingSuppliers = await this.supplierRepository.count();
    if (existingSuppliers > 0) {
      console.log('Suppliers already exist, skipping...');
      return;
    }

    const suppliers = [
      {
        name: 'Proveedores de Lencería',
        contact: 'María González',
        email: 'contacto@proveedoreslenceria.com',
        phone: '+34 912 345 678',
        address: 'Calle Textil 123, Madrid, España',
        category: 'General',
        rating: 4.0,
        deliveryTime: '3-5 días',
        paymentTerms: '30 días',
      },
      {
        name: 'Amenidades Hoteleras SA',
        contact: 'Carlos Rodríguez',
        email: 'ventas@amenidadeshoteleras.com',
        phone: '+34 913 456 789',
        address: 'Avenida Hotelera 456, Barcelona, España',
        category: 'General',
        rating: 4.0,
        deliveryTime: '3-5 días',
        paymentTerms: '30 días',
      },
      {
        name: 'Suministros LimpiezaPro',
        contact: 'Ana Martínez',
        email: 'pedidos@limpiezapro.com',
        phone: '+34 914 567 890',
        address: 'Polígono Industrial Sur 789, Valencia, España',
        category: 'General',
        rating: 4.0,
        deliveryTime: '3-5 días',
        paymentTerms: '30 días',
      },
      {
        name: 'Electrónicos Directos',
        contact: 'José García',
        email: 'info@electronicosdirectos.com',
        phone: '+34 915 678 901',
        address: 'Centro Comercial Tech 321, Sevilla, España',
        category: 'General',
        rating: 4.0,
        deliveryTime: '3-5 días',
        paymentTerms: '30 días',
      },
    ];

    for (const supplierData of suppliers) {
      const existingSupplier = await this.supplierRepository.findOne({
        where: { name: supplierData.name },
      });

      if (!existingSupplier) {
        await this.supplierRepository.save(supplierData);
      }
    }

    console.log('✅ Suppliers seeded');
  }
}
