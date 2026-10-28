import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { FieldCard } from '../components/FieldCard';
import { EmptyState } from '../components/EmptyState';
import { COLORS } from '../constants/colors';
import { Field } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FieldList'>;

export const FieldListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { fields, deleteField } = useApp();

  // Đếm số sân đang hoạt động trên tổng số sân (Câu 1)
  const activeCount = fields.filter(f => f.status === 'Hoạt động').length;
  const totalCount = fields.length;
  const statusSummaryText = `${activeCount}/${totalCount} sân hoạt động`;

  // Xử lý Xoá sân (Câu 3: Có Alert xác nhận & không cho xoá nếu có lượt đặt)
  const handleDeleteField = (field: Field) => {
    Alert.alert(
      'Xác nhận xoá',
      `Bạn có chắc chắn muốn xoá "${field.name}" không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteField(field.id);
            if (!result.success) {
              // Báo lỗi bằng Alert nếu sân đang có lượt đặt (Câu 3)
              Alert.alert('Không thể xoá', result.message || 'Sân đang có lượt đặt.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header thống kê & Nút thêm sân */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appTitle}>Sân Bóng Mini</Text>
          {/* Đầu màn hình hiển thị tỉ lệ hoạt động (Câu 1) */}
          <Text style={styles.summaryText}>{statusSummaryText}</Text>
        </View>

        {/* Nút "+ Thêm sân" (Câu 2) */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('FieldForm')}
          activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ Thêm sân</Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách sân bóng dùng FlatList (Câu 1) */}
      <FlatList
        data={fields}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FieldCard
            field={item}
            onPress={() => navigation.navigate('FieldDetail', { fieldId: item.id })}
            onEdit={() => navigation.navigate('FieldForm', { field: item })}
            onDelete={() => handleDeleteField(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState message="Chưa có sân bóng nào trong hệ thống" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  summaryText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
});

