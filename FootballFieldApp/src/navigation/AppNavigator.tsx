import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FieldListScreen } from '../screens/FieldListScreen';
import { FieldFormScreen } from '../screens/FieldFormScreen';
import { FieldDetailScreen } from '../screens/FieldDetailScreen';
import { Field } from '../types';
import { COLORS } from '../constants/colors';

export type RootStackParamList = {
  FieldList: undefined;
  FieldForm: { field?: Field } | undefined;
  FieldDetail: { fieldId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="FieldList"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.card,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}>
      <Stack.Screen
        name="FieldList"
        component={FieldListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FieldForm"
        component={FieldFormScreen}
        options={({ route }) => ({
          title: route.params?.field ? 'Chỉnh sửa sân' : 'Thêm sân bóng',
        })}
      />
      <Stack.Screen
        name="FieldDetail"
        component={FieldDetailScreen}
        options={{
          title: 'Chi tiết sân bóng',
        }}
      />
    </Stack.Navigator>
  );
};

