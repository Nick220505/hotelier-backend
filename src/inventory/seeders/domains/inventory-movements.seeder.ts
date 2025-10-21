import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryMovement } from '../../entities/inventory-movement.entity';
import { Inventory } from '../../entities/inventory.entity';
import { MovementType } from '../../enums/movement-type.enum';

@Injectable()
export class InventoryMovementsSeeder {
  constructor(
    @InjectRepository(InventoryMovement)
    private movementRepository: Repository<InventoryMovement>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async seed() {
    const inventoryItems = await this.inventoryRepository.find({ take: 5 });

    if (inventoryItems.length === 0) {
      console.log(
        'Skipping inventory movement seeds - no inventory items found',
      );
      return;
    }

    const movements = [
      {
        type: MovementType.IN,
        inventoryId: inventoryItems[0].id,
        quantity: 50,
        previousStock: 50,
        newStock: 100,
        reason: 'Compra de stock inicial',
        cost: 1275.0, // 50 * 25.50
        user: 'system',
        responsible: 'Gerente de Inventario',
        notes: 'Configuración inicial del inventario',
      },
      {
        type: MovementType.OUT,
        inventoryId: inventoryItems[0].id,
        quantity: 10,
        previousStock: 100,
        newStock: 90,
        reason: 'Uso para limpieza de habitaciones',
        user: 'housekeeping_staff',
        responsible: 'Maria Rodriguez',
        notes: 'Utilizado para habitaciones 201-210',
      },
      {
        type: MovementType.IN,
        inventoryId: inventoryItems[1].id,
        quantity: 25,
        previousStock: 50,
        newStock: 75,
        reason: 'Reabastecimiento semanal',
        cost: 468.75, // 25 * 18.75
        user: 'inventory_manager',
        responsible: 'John Smith',
        notes: 'Pedido semanal #WK2024-01',
      },
      {
        type: MovementType.ADJUSTMENT,
        inventoryId: inventoryItems[2].id,
        quantity: -5,
        previousStock: 505,
        newStock: 500,
        reason: 'Ajuste de inventario',
        user: 'inventory_manager',
        responsible: 'John Smith',
        notes:
          'Ajuste por conteo físico - botellas dañadas durante el transporte',
      },
    ];

    for (const movementData of movements) {
      const existing = await this.movementRepository.findOne({
        where: {
          inventoryId: movementData.inventoryId,
          type: movementData.type,
          quantity: movementData.quantity,
          reason: movementData.reason,
        },
      });

      if (!existing) {
        await this.movementRepository.save(movementData);
      }
    }
  }
}
