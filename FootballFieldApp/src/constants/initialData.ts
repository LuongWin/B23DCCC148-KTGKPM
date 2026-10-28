import { Field, Booking } from '../types';

export const INITIAL_FIELDS: Field[] = [
  {
    id: 'f1',
    name: 'Sân A1',
    type: '5 người',
    pricePerHour: 200000,
    status: 'Hoạt động',
  },
  {
    id: 'f2',
    name: 'Sân A2',
    type: '5 người',
    pricePerHour: 200000,
    status: 'Bảo trì',
  },
  {
    id: 'f3',
    name: 'Sân B1',
    type: '7 người',
    pricePerHour: 350000,
    status: 'Hoạt động',
  },
  {
    id: 'f4',
    name: 'Sân B2',
    type: '7 người',
    pricePerHour: 350000,
    status: 'Hoạt động',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    fieldId: 'f1',
    customerName: 'Nguyễn Văn An',
    phone: '0912345678',
    date: '28/10/2026',
    startHour: 17,
    hours: 2, // 17h - 19h
  },
  {
    id: 'b2',
    fieldId: 'f3',
    customerName: 'Trần Văn Bình',
    phone: '0987654321',
    date: '28/10/2026',
    startHour: 8,
    hours: 1, // 8h - 9h
  },
  {
    id: 'b3',
    fieldId: 'f4',
    customerName: 'Lê Hoàng Cường',
    phone: '0901234567',
    date: '29/10/2026',
    startHour: 19,
    hours: 2, // 19h - 21h
  },
];

