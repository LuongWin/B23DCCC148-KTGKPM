import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { BookingCard } from '../components/BookingCard';
import { BookingModal } from '../components/BookingModal';
import { EmptyState } from '../components/EmptyState';
import { COLORS } from '../constants/colors';
import { RootStackParamList } from '../navigation/AppNavigator';

type ScreenRouteProp = RouteProp<RootStackParamList, 'FieldDetail'>;

export const FieldDetailScreen: React.FC = () => {
  const route = useRoute<ScreenRouteProp>();
  const { fieldId } = route.params;
  const { fields, getFieldBookings, addBooking, cancelBooking } = useApp();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Tìm sân tương ứng
  const currentField = fields.find(f => f.id === fieldId);

  if (!currentField) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy thông tin sân bóng!</Text>
      </View>
    );
  }

  const isMaintenance = currentField.status === 'Bảo trì';
  const fieldBookings = getFieldBookings(fieldId);

  // Xử lý Huỷ lượt đặt sân (Câu 5: Có hỏi xác nhận bằng Alert)
  const handleCancelBooking = (bookingId: string, customerName: string) => {
    Alert.alert(
      'Xác nhận huỷ đặt sân',
      `Bạn có chắc chắn muốn huỷ lượt đặt của "${customerName}" không?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Huỷ đặt',
          style: 'destructive',
          onPress: async () => {
            await cancelBooking(bookingId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Khối thông tin chi tiết Sân bóng (Câu 4) */}
      <View style={styles.fieldInfoCard}>
        <View style={styles.infoHeaderRow}>
          <View>
            <Text style={styles.fieldName}>{currentField.name}</Text>
            <Text style={styles.fieldType}>Sân bóng {currentField.type}</Text>
          </View>

          {/* Badge trạng thái */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: !isMaintenance
                  ? COLORS.activeStatusBg
                  : COLORS.maintenanceStatusBg,
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: !isMaintenance
                    ? COLORS.activeStatus
                    : COLORS.maintenanceStatus,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color: !isMaintenance
                    ? COLORS.activeStatus
                    : COLORS.maintenanceStatus,
                },
              ]}>
              {currentField.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoFooterRow}>
          <Text style={styles.priceLabel}>Đơn giá thuê:</Text>
          <Text style={styles.priceValue}>
            {Number(currentField.pricePerHour).toLocaleString('vi-VN')} đ/giờ
          </Text>
        </View>
      </View>

      {/* 2. Tiêu đề danh sách lượt đặt */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Lịch đặt sân ({fieldBookings.length})
        </Text>
      </View>

      {/* 3. Danh sách các lượt đặt của riêng sân đó (Câu 4) */}
      <FlatList
        data={fieldBookings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onCancel={() => handleCancelBooking(item.id, item.customerName)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState message="Chưa có lượt đặt nào cho sân này" />
        }
      />

      {/* 4. Nút "Đặt sân" cố định ở chân màn hình (Câu 4) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.bookBtn,
            isMaintenance && styles.bookBtnDisabled, // Vô hiệu hoá khi Bảo trì
          ]}
          disabled={isMaintenance} // Không cho đặt sân khi Bảo trì (Câu 4)
          activeOpacity={0.85}
          onPress={() => setModalVisible(true)}>
          <Text
            style={[
              styles.bookBtnText,
              isMaintenance && styles.bookBtnTextDisabled,
            ]}>
            {isMaintenance ? 'Sân đang bảo trì - Không thể đặt' : '+ Đặt sân bóng'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal nhập thông tin đặt sân (Câu 4 + Câu 5) */}
      <BookingModal
        visible={modalVisible}
        field={currentField}
        onClose={() => setModalVisible(false)}
        onSubmit={addBooking}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  notFoundText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  fieldInfoCard: {
    backgroundColor: COLORS.card,
    margin: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  fieldName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  fieldType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  bookBtnDisabled: {
    backgroundColor: COLORS.disabledBg, // Trông khác biệt khi vô hiệu hoá (Câu 7)
    elevation: 0,
  },
  bookBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  bookBtnTextDisabled: {
    color: COLORS.disabled,
  },
});
