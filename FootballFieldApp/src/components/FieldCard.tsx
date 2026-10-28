import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Field } from '../types';
import { COLORS } from '../constants/colors';

interface FieldCardProps {
  field: Field;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  onPress,
  onEdit,
  onDelete,
}) => {
  const isActive = field.status === 'Hoạt động';

  // Định dạng giá tiền: ví dụ 200000 -> 200.000 đ/giờ
  const formattedPrice = `${Number(field.pricePerHour).toLocaleString('vi-VN')} đ/giờ`;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={onPress}>
      {/* Hàng trên: Tên sân & Nhãn trạng thái màu */}
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.fieldName}>{field.name}</Text>
          <Text style={styles.fieldType}>Loại: {field.type}</Text>
        </View>

        {/* Nhãn màu trạng thái (Câu 1: Xanh cho Hoạt động, Cam cho Bảo trì) */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isActive ? COLORS.activeStatusBg : COLORS.maintenanceStatusBg },
          ]}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isActive ? COLORS.activeStatus : COLORS.maintenanceStatus },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isActive ? COLORS.activeStatus : COLORS.maintenanceStatus },
            ]}>
            {field.status}
          </Text>
        </View>
      </View>

      {/* Đường phân cách nhẹ */}
      <View style={styles.divider} />

      {/* Hàng dưới: Giá thuê & Các nút thao tác (Sửa, Xóa) */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.priceLabel}>Giá thuê:</Text>
          <Text style={styles.priceValue}>{formattedPrice}</Text>
        </View>

        <View style={styles.actionButtons}>
          {/* Nút Sửa */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={onEdit}
            activeOpacity={0.7}>
            <Text style={styles.editBtnText}>Sửa</Text>
          </TouchableOpacity>

          {/* Nút Xóa (Câu 3) */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            activeOpacity={0.7}>
            <Text style={styles.deleteBtnText}>Xoá</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Đổ bóng chuẩn giao diện (Câu 7)
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  fieldName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  fieldType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.dangerBg,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
});

