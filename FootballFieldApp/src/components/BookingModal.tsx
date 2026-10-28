import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Field, Booking } from '../types';

interface BookingModalProps {
  visible: boolean;
  field: Field;
  onClose: () => void;
  onSubmit: (bookingData: Omit<Booking, 'id'>) => Promise<{ success: boolean; message?: string }>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  field,
  onClose,
  onSubmit,
}) => {
  // Hàm lấy ngày hôm nay dạng dd/mm/yyyy
  const getTodayString = (): string => {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, '0');
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const y = today.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const [customerName, setCustomerName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());
  const [startHour, setStartHour] = useState<string>('17');
  const [hours, setHours] = useState<number>(1); // Mặc định 1 giờ

  const [errors, setErrors] = useState<{
    customerName?: string;
    phone?: string;
    date?: string;
    startHour?: string;
    hours?: string;
  }>({});

  // Reset form khi đóng
  const handleClose = () => {
    setCustomerName('');
    setPhone('');
    setDate(getTodayString());
    setStartHour('17');
    setHours(1);
    setErrors({});
    onClose();
  };

  // Tính thành tiền tự động realtime (Câu 4: pricePerHour * hours)
  const totalPrice = field.pricePerHour * hours;
  const formattedTotalPrice = `${totalPrice.toLocaleString('vi-VN')} đ`;

  // Kiểm tra dữ liệu hợp lệ (Câu 5)
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // 1. Tên khách không rỗng
    if (!customerName.trim()) {
      newErrors.customerName = 'Tên khách không được để trống!';
    }

    // 2. Số điện thoại: 10 chữ số, bắt đầu bằng 0
    const phoneRegex = /^0\d{9}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại!';
    } else if (!phoneRegex.test(phone.trim())) {
      newErrors.phone = 'SĐT phải gồm đúng 10 chữ số và bắt đầu bằng số 0!';
    }

    // 3. Định dạng ngày dd/mm/yyyy
    const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!date.trim()) {
      newErrors.date = 'Vui lòng nhập ngày thuê!';
    } else if (!dateRegex.test(date.trim())) {
      newErrors.date = 'Ngày phải có định dạng dd/mm/yyyy!';
    }

    // 4. Giờ bắt đầu từ 6 đến 22
    const startNum = Number(startHour);
    if (!startHour.trim() || isNaN(startNum)) {
      newErrors.startHour = 'Vui lòng nhập giờ bắt đầu!';
    } else if (startNum < 6 || startNum > 22) {
      newErrors.startHour = 'Giờ bắt đầu phải từ 6 đến 22!';
    } else if (startNum + hours > 23) {
      // Giờ kết thúc không quá 23h (Câu 5)
      newErrors.startHour = `Giờ kết thúc (${startNum + hours}h) không được quá 23h!`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBooking = async () => {
    if (!validate()) return;

    const result = await onSubmit({
      fieldId: field.id,
      customerName: customerName.trim(),
      phone: phone.trim(),
      date: date.trim(),
      startHour: Number(startHour),
      hours,
    });

    if (!result.success) {
      // Báo lỗi trùng lịch (Câu 5)
      Alert.alert('Không thể đặt sân', result.message || 'Lịch đặt bị trùng!');
    } else {
      Alert.alert('Thành công', 'Đặt sân thành công!', [
        { text: 'Đóng', onPress: handleClose },
      ]);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.modalContent}>
          {/* Header Modal */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Đặt Sân Bóng</Text>
              <Text style={styles.modalSubtitle}>{field.name} ({field.type})</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Ô 1: Tên khách hàng */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên khách <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.customerName ? styles.inputError : null]}
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor={COLORS.textMuted}
                value={customerName}
                onChangeText={text => {
                  setCustomerName(text);
                  if (errors.customerName) setErrors(prev => ({ ...prev, customerName: undefined }));
                }}
              />
              {errors.customerName ? <Text style={styles.errorText}>{errors.customerName}</Text> : null}
            </View>

            {/* Ô 2: Số điện thoại (Câu 5) */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Số điện thoại (10 số, bắt đầu bằng 0) <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.phone ? styles.inputError : null]}
                placeholder="Ví dụ: 0912345678"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad" // Đúng loại bàn phím (Câu 7)
                maxLength={10}
                value={phone}
                onChangeText={text => {
                  setPhone(text);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            {/* Ô 3: Ngày đặt sân */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngày đặt (dd/mm/yyyy) <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.date ? styles.inputError : null]}
                placeholder="dd/mm/yyyy"
                placeholderTextColor={COLORS.textMuted}
                value={date}
                onChangeText={text => {
                  setDate(text);
                  if (errors.date) setErrors(prev => ({ ...prev, date: undefined }));
                }}
              />
              {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
            </View>

            {/* Ô 4: Khung giờ & Số giờ thuê */}
            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Giờ bắt đầu (6 - 22) <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.startHour ? styles.inputError : null]}
                  placeholder="Ví dụ: 17"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="numeric"
                  maxLength={2}
                  value={startHour}
                  onChangeText={text => {
                    setStartHour(text);
                    if (errors.startHour) setErrors(prev => ({ ...prev, startHour: undefined }));
                  }}
                />
              </View>

              {/* Chọn số giờ thuê (1, 2, 3 tiếng) */}
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Số giờ thuê (1-3h)</Text>
                <View style={styles.hoursButtonGroup}>
                  {[1, 2, 3].map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.hourBtn,
                        hours === h && styles.hourBtnActive,
                      ]}
                      onPress={() => setHours(h)}>
                      <Text
                        style={[
                          styles.hourBtnText,
                          hours === h && styles.hourBtnTextActive,
                        ]}>
                        {h}h
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            {errors.startHour ? <Text style={styles.errorText}>{errors.startHour}</Text> : null}

            {/* Khối hiển thị Thành tiền Realtime (Câu 4: pricePerHour × hours) */}
            <View style={styles.priceSummaryBox}>
              <View style={styles.priceSummaryRow}>
                <Text style={styles.priceSummaryLabel}>Đơn giá:</Text>
                <Text style={styles.priceSummaryValue}>
                  {Number(field.pricePerHour).toLocaleString('vi-VN')} đ/h
                </Text>
              </View>
              <View style={styles.priceSummaryRow}>
                <Text style={styles.priceSummaryLabel}>Thời lượng:</Text>
                <Text style={styles.priceSummaryValue}>{hours} giờ</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceSummaryRow}>
                <Text style={styles.totalPriceLabel}>Thành tiền:</Text>
                <Text style={styles.totalPriceValue}>{formattedTotalPrice}</Text>
              </View>
            </View>

            {/* Nút xác nhận đặt sân */}
            <TouchableOpacity
              style={styles.confirmBtn}
              activeOpacity={0.85}
              onPress={handleBooking}>
              <Text style={styles.confirmBtnText}>Xác nhận đặt sân</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Nền mờ Playtomic
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  formGroup: {
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  required: {
    color: COLORS.danger,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.borderError,
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '500',
  },
  hoursButtonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  hourBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  hourBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  hourBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  priceSummaryBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  priceSummaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  priceSummaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  totalPriceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
});

