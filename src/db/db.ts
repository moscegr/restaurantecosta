import Dexie, { type Table } from 'dexie';
import type { Product, Sale, Room, Transaction, BusinessConfig } from '../types';

export class TimonDatabase extends Dexie {
  products!: Table<Product, number>;
  sales!: Table<Sale, number>;
  rooms!: Table<Room, number>;
  transactions!: Table<Transaction, number>;
  businessConfig!: Table<BusinessConfig, number>;

  constructor() {
    super('TimonCostaChicaDB');
    this.version(1).stores({
      products: '++id, name, category, stock, active',
      sales: '++id, dateString, date, status, destination',
      rooms: '++id, number, status, type',
      transactions: '++id, dateString, date, type, category',
      businessConfig: '++id',
    });
  }
}

export const db = new TimonDatabase();
