import type { Customer, Product, Order, Vehicle } from './types';

export const mockCustomers: Customer[] = [
  { id: '1', name: 'Alice Johnson', phone: '555-0101', address: '123 Maple St, Springfield', createdAt: '2023-01-15', referredBy: 'Bob Smith', aadhar: '1234 5678 9012' },
  { id: '2', name: 'Bob Smith', phone: '555-0102', address: '456 Oak Ave, Shelbyville', createdAt: '2023-02-20', aadhar: '2345 6789 0123' },
  { id: '3', name: 'Charlie Brown', phone: '555-0103', address: '789 Pine Ln, Capital City', createdAt: '2023-03-10', referredBy: 'Alice Johnson' },
  { id: '4', name: 'Diana Prince', phone: '555-0104', address: '101 Wonder Way, Themyscira', createdAt: '2023-04-05', aadhar: '4567 8901 2345' },
  { id: '5', name: 'Ethan Hunt', phone: '555-0105', address: '21 Jump Street, Langley', createdAt: '2023-05-12' },
];

export const mockProducts: Product[] = [
  { id: '1', name: "Chef's Knife", quantity: 15, rate: 50, rate_unit: 'day' },
  { id: '2', name: 'Cutting Board', quantity: 30, rate: 20, rate_unit: 'day' },
  { id: '3', name: 'Mixing Bowl Set', quantity: 20, rate: 35, rate_unit: 'day' },
  { id: '4', name: 'Measuring Spoons', quantity: 50, rate: 10, rate_unit: 'day' },
  { id: '5', name: 'Frying Pan', quantity: 25, rate: 75, rate_unit: 'day' },
  { id: '6', name: 'Stockpot', quantity: 10, rate: 80, rate_unit: 'day' },
];

export const mockOrders: Order[] = [
  { id: 'ORD001', customerName: 'Alice Johnson', deliveryDate: '2023-10-01', returnDate: '2023-10-05', totalAmount: 25.50, status: 'Returned' },
  { id: 'ORD002', customerName: 'Bob Smith', deliveryDate: '2023-10-02', returnDate: '2023-10-07', totalAmount: 45.00, status: 'Active' },
  { id: 'ORD003', customerName: 'Charlie Brown', deliveryDate: '2023-10-03', returnDate: '2023-10-04', totalAmount: 12.75, status: 'Returned' },
  { id: 'ORD004', customerName: 'Diana Prince', deliveryDate: '2023-10-04', returnDate: '2023-10-09', totalAmount: 88.20, status: 'Active' },
  { id: 'ORD005', customerName: 'Alice Johnson', deliveryDate: '2023-10-05', returnDate: '2023-10-10', totalAmount: 15.00, status: 'Cancelled' },
  { id: 'ORD006', customerName: 'Ethan Hunt', deliveryDate: '2023-10-06', returnDate: '2023-10-12', totalAmount: 150.00, status: 'Active' },
];

export const mockVehicles: Vehicle[] = [
  { id: '1', number: 'MH 12 AB 1234' },
  { id: '2', number: 'MH 12 CD 5678' },
  { id: '3', number: 'MH 14 EF 9012' },
];
