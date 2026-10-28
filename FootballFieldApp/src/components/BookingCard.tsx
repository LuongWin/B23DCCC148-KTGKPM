import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Booking } from '../types';
import { COLORS } from '../constants/colors';

interface BookingCardProps {
  booking: Booking;
  onCancel: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel }) => {
  const startHour = Number(booking.startHour);
  const endHour = startHour + Number(booking.hours);
  const timeRange = `${startHour}:00 - ${endHour}:00 (${booking.hours} tiếng)`;

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        {/* Hàng 1: Tên khách & Badge thời gian */}
        <View style={styles.topRow}>
          <Text style={styles.customerName}>{booking.customerName}</Text>
          <View style={styles.timeBadge}>
            <Text style={styles.timeBadgeText}>{timeRange}</Text>
          </View>
        </View>

        {/* Hàng 2: Số điện thoại & Ngày đặt */}
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>📞 {booking.phone}</Text>
          <Text style={styles.infoText}>📅 {booking.date}</Text>
        </View>
      </View>

      {/* Nút Huỷ lượt đặt (Câu 5) */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onCancel}
        activeOpacity={0.7}>
        <Text style={styles.cancelBtnText}>Huỷ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
    marginRight: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  timeBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cancelBtn: {
    backgroundColor: COLORS.dangerBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.danger,
  },
});

