import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Field, Booking } from '../types';
import { INITIAL_FIELDS, INITIAL_BOOKINGS } from '../constants/initialData';

const STORAGE_KEYS = {
  FIELDS: '@fields',
  BOOKINGS: '@bookings',
};

interface AppContextType {
  fields: Field[];
  bookings: Booking[];
  isLoading: boolean;
  addField: (fieldData: Omit<Field, 'id'>) => Promise<Field>;
  updateField: (field: Field) => Promise<void>;
  deleteField: (fieldId: string) => Promise<{ success: boolean; message?: string }>;
  addBooking: (bookingData: Omit<Booking, 'id'>) => Promise<{ success: boolean; message?: string }>;
  cancelBooking: (bookingId: string) => Promise<void>;
  getFieldBookings: (fieldId: string) => Booking[];
  isTimeOverlapping: (
    fieldId: string,
    date: string,
    startHour: number,
    hours: number,
    excludeBookingId?: string
  ) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khởi tạo dữ liệu ban đầu từ AsyncStorage hoặc Seed Data
  useEffect(() => {
    const initializeData = async () => {
      try {
        const storedFields = await AsyncStorage.getItem(STORAGE_KEYS.FIELDS);
        const storedBookings = await AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS);

        let currentFields: Field[] = INITIAL_FIELDS;
        let currentBookings: Booking[] = INITIAL_BOOKINGS;

        if (storedFields !== null) {
          currentFields = JSON.parse(storedFields);
        } else {
          // Lần đầu chạy: nạp 4 sân mẫu
          await AsyncStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(INITIAL_FIELDS));
        }

        if (storedBookings !== null) {
          currentBookings = JSON.parse(storedBookings);
        } else {
          // Lần đầu chạy: nạp 3 lượt đặt mẫu
          await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
        }

        setFields(currentFields);
        setBookings(currentBookings);
      } catch (error) {
        console.error('Lỗi khi đọc dữ liệu từ AsyncStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Thêm sân mới
  const addField = async (fieldData: Omit<Field, 'id'>): Promise<Field> => {
    const newField: Field = {
      ...fieldData,
      id: Date.now().toString(),
    };
    const updated = [newField, ...fields];
    setFields(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(updated));
    return newField;
  };

  // Cập nhật sân
  const updateField = async (updatedField: Field): Promise<void> => {
    const updated = fields.map(f => (f.id === updatedField.id ? updatedField : f));
    setFields(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(updated));
  };

  // Xóa sân (Câu 3: Không cho xóa sân đang có lượt đặt)
  const deleteField = async (fieldId: string): Promise<{ success: boolean; message?: string }> => {
    const hasBookings = bookings.some(b => b.fieldId === fieldId);
    if (hasBookings) {
      return {
        success: false,
        message: 'Không thể xoá sân đang có lượt đặt!',
      };
    }

    const updated = fields.filter(f => f.id !== fieldId);
    setFields(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(updated));
    return { success: true };
  };

  // Kiểm tra trùng lịch (Câu 5)
  // Hai khoảng thời gian [start1, end1) và [start2, end2) giao nhau khi: start1 < end2 && start2 < end1
  const isTimeOverlapping = (
    fieldId: string,
    date: string,
    startHour: number,
    hours: number,
    excludeBookingId?: string
  ): boolean => {
    const newStart = Number(startHour);
    const newEnd = newStart + Number(hours);

    return bookings.some(b => {
      if (excludeBookingId && b.id === excludeBookingId) return false;
      if (b.fieldId !== fieldId || b.date.trim() !== date.trim()) return false;

      const existStart = Number(b.startHour);
      const existEnd = existStart + Number(b.hours);

      return newStart < existEnd && existStart < newEnd;
    });
  };

  // Thêm lượt đặt sân
  const addBooking = async (
    bookingData: Omit<Booking, 'id'>
  ): Promise<{ success: boolean; message?: string }> => {
    // Kiểm tra trùng lịch trước khi thêm
    if (isTimeOverlapping(bookingData.fieldId, bookingData.date, bookingData.startHour, bookingData.hours)) {
      return {
        success: false,
        message: 'Khung giờ này đã có khách đặt. Vui lòng chọn giờ hoặc ngày khác!',
      };
    }

    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
    };
    const updated = [newBooking, ...bookings];
    setBookings(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
    return { success: true };
  };

  // Hủy lượt đặt sân
  const cancelBooking = async (bookingId: string): Promise<void> => {
    const updated = bookings.filter(b => b.id !== bookingId);
    setBookings(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
  };

  // Lấy các lượt đặt của một sân cụ thể
  const getFieldBookings = (fieldId: string): Booking[] => {
    return bookings.filter(b => b.fieldId === fieldId);
  };

  return (
    <AppContext.Provider
      value={{
        fields,
        bookings,
        isLoading,
        addField,
        updateField,
        deleteField,
        addBooking,
        cancelBooking,
        getFieldBookings,
        isTimeOverlapping,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp phải được sử dụng bên trong AppProvider');
  }
  return context;
};

