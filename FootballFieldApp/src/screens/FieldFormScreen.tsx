import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { FieldType, FieldStatus } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'FieldForm'>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'FieldForm'>;

export const FieldFormScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRouteProp>();
  const { fields, addField, updateField } = useApp();

  // Nhận dữ liệu cũ nếu đang ở chế độ Sửa (Câu 2)
  const editingField = route.params?.field;
  const isEditing = !!editingField;

  // Khởi tạo state form
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<FieldType>('5 người');
  const [pricePerHour, setPricePerHour] = useState<string>('');
  const [status, setStatus] = useState<FieldStatus>('Hoạt động');

  // Quản lý thông báo lỗi hiển thị ngay dưới ô nhập (Câu 2)
  const [errors, setErrors] = useState<{ name?: string; pricePerHour?: string }>({});

  // Nếu là sửa, điền sẵn dữ liệu cũ vào các ô
  useEffect(() => {
    if (editingField) {
      setName(editingField.name);
      setType(editingField.type);
      setPricePerHour(editingField.pricePerHour.toString());
      setStatus(editingField.status);
    }
  }, [editingField]);

  // Kiểm tra tính hợp lệ dữ liệu (Validate)
  const validate = (): boolean => {
    const newErrors: { name?: string; pricePerHour?: string } = {};

    // 1. Kiểm tra Tên sân: không trống và không trùng
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Tên sân không được để trống!';
    } else {
      const isDuplicate = fields.some(
        f =>
          f.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!isEditing || f.id !== editingField?.id)
      );
      if (isDuplicate) {
        newErrors.name = 'Tên sân đã tồn tại, vui lòng chọn tên khác!';
      }
    }

    // 2. Kiểm tra Giá thuê: là số và > 0
    const trimmedPrice = pricePerHour.trim();
    if (!trimmedPrice) {
      newErrors.pricePerHour = 'Vui lòng nhập giá thuê mỗi giờ!';
    } else {
      const numPrice = Number(trimmedPrice);
      if (isNaN(numPrice) || numPrice <= 0) {
        newErrors.pricePerHour = 'Giá thuê phải là một số lớn hơn 0!';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lưu thông tin Sân
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const priceNum = Number(pricePerHour.trim());

    if (isEditing && editingField) {
      await updateField({
        id: editingField.id,
        name: name.trim(),
        type,
        pricePerHour: priceNum,
        status,
      });
    } else {
      await addField({
        name: name.trim(),
        type,
        pricePerHour: priceNum,
        status,
      });
    }

    // Quay lại màn hình danh sách sau khi lưu
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        
        {/* Khối 1: Tên sân */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tên sân <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.name ? styles.inputError : null]}
            placeholder="Ví dụ: Sân A1, Sân Cỏ 1"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={text => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
            }}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
        </View>

        {/* Khối 2: Chọn Loại sân bằng nút bấm (Câu 2) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Loại sân</Text>
          <View style={styles.buttonGroup}>
            {(['5 người', '7 người'] as FieldType[]).map(item => {
              const isSelected = type === item;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  style={[
                    styles.choiceButton,
                    isSelected && styles.choiceButtonActive,
                  ]}
                  onPress={() => setType(item)}>
                  <Text
                    style={[
                      styles.choiceButtonText,
                      isSelected && styles.choiceButtonTextActive,
                    ]}>
                    Sân {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Khối 3: Giá thuê mỗi giờ */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Giá thuê mỗi giờ (VNĐ) <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, errors.pricePerHour ? styles.inputError : null]}
            placeholder="Ví dụ: 250000"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric" // Đúng loại bàn phím số (Câu 7)
            value={pricePerHour}
            onChangeText={text => {
              setPricePerHour(text);
              if (errors.pricePerHour) setErrors(prev => ({ ...prev, pricePerHour: undefined }));
            }}
          />
          {errors.pricePerHour ? (
            <Text style={styles.errorText}>{errors.pricePerHour}</Text>
          ) : null}
        </View>

        {/* Khối 4: Chọn Trạng thái bằng nút bấm (Câu 2) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Trạng thái</Text>
          <View style={styles.buttonGroup}>
            {(['Hoạt động', 'Bảo trì'] as FieldStatus[]).map(item => {
              const isSelected = status === item;
              const isItemActive = item === 'Hoạt động';
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.8}
                  style={[
                    styles.choiceButton,
                    isSelected && {
                      backgroundColor: isItemActive ? COLORS.activeStatusBg : COLORS.maintenanceStatusBg,
                      borderColor: isItemActive ? COLORS.activeStatus : COLORS.maintenanceStatus,
                    },
                  ]}
                  onPress={() => setStatus(item)}>
                  <Text
                    style={[
                      styles.choiceButtonText,
                      isSelected && {
                        color: isItemActive ? COLORS.activeStatus : COLORS.maintenanceStatus,
                        fontWeight: '700',
                      },
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Nút Submit Lưu thông tin */}
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.85}
          onPress={handleSave}>
          <Text style={styles.submitBtnText}>
            {isEditing ? 'Cập nhật thông tin' : 'Thêm sân bóng'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.borderError, // Viền đỏ khi lỗi (Câu 7)
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 5,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceButtonActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  choiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  choiceButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
