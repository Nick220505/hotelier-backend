import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomServiceOrder } from '../../entities/room-service-order.entity';
import { RoomServiceStatus } from '../../enums/room-service-status.enum';

@Injectable()
export class RoomServiceOrdersSeeder {
  constructor(
    @InjectRepository(RoomServiceOrder)
    private orderRepository: Repository<RoomServiceOrder>,
  ) {}

  async seed() {
    const orders = [
      {
        orderNumber: 'RS-2024-001',
        room: '201',
        guest: 'John Smith',
        items: [
          {
            item: 'Club Sandwich',
            quantity: 1,
            price: 77700,
            notes: 'No tomatoes',
          },
          {
            item: 'French Fries',
            quantity: 1,
            price: 33600,
          },
          {
            item: 'Coca Cola',
            quantity: 2,
            price: 14700,
          },
        ],
        total: 140700,
        orderTime: '14:30',
        estimatedTime: '25 minutes',
        status: RoomServiceStatus.DELIVERED,
        waiter: 'Sofia Herrera',
        specialInstructions: 'Guest has nut allergy',
      },
      {
        orderNumber: 'RS-2024-002',
        room: '305',
        guest: 'Maria Garcia',
        items: [
          {
            item: 'Caesar Salad',
            quantity: 1,
            price: 63000,
          },
          {
            item: 'Grilled Chicken',
            quantity: 1,
            price: 94500,
          },
          {
            item: 'White Wine',
            quantity: 1,
            price: 50400,
          },
        ],
        total: 207900,
        orderTime: '19:15',
        estimatedTime: '35 minutes',
        status: RoomServiceStatus.PREPARING,
        waiter: 'Carlos Martinez',
        specialInstructions: 'Birthday celebration - add candle to dessert',
      },
      {
        orderNumber: 'RS-2024-003',
        room: '108',
        guest: 'Robert Johnson',
        items: [
          {
            item: 'Room Service Breakfast',
            quantity: 2,
            price: 105000,
          },
          {
            item: 'Orange Juice',
            quantity: 2,
            price: 18900,
          },
          {
            item: 'Coffee',
            quantity: 2,
            price: 12600,
          },
        ],
        total: 273000,
        orderTime: '08:00',
        estimatedTime: '20 minutes',
        status: RoomServiceStatus.PENDING,
        specialInstructions: 'Please deliver at exactly 8:30 AM',
      },
    ];

    for (const orderData of orders) {
      const existing = await this.orderRepository.findOne({
        where: { orderNumber: orderData.orderNumber },
      });

      if (!existing) {
        await this.orderRepository.save(orderData);
      }
    }
  }
}
