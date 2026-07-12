import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout } from '../../src/components/AuthLayout';
import { AuthInput } from '../../src/components/AuthInput';
import { AuthButton } from '../../src/components/AuthButton';
import { useAuth } from '../../src/context/AuthContext';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';
import { ApiError, getApiErrorMessage } from '../../src/api/client';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginDashboard, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) newErrors.email = 'صيغة البريد غير صحيحة';
    if (!password) newErrors.password = 'كلمة المرور مطلوبة';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login({ login: email.trim(), password });
      router.replace('/(tabs)');
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        try {
          await loginDashboard({ login: email.trim(), password });
          router.replace('/dashboard' as never);
          return;
        } catch (dashboardError) {
          Alert.alert('ط®ط·ط£', getApiErrorMessage(dashboardError));
          return;
        }
      }

      if (e instanceof ApiError && e.fields) {
        setErrors({
          email: e.fields.login ?? e.fields.email,
          password: e.fields.password,
        });
      }

      Alert.alert('خطأ', getApiErrorMessage(e));
    }
  };

  return (
    <AuthLayout>
      <View style={{ alignItems: 'center' }}>
        <Text style={[typography.displayLg, { color: colors.onPrimary, marginBottom: 24 }]}>أخضر</Text>
        <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginBottom: 32 }]}>مرحباً بك في نظام الرعاية المتكامل</Text>
      </View>
      <AuthInput
        label="البريد الإلكتروني"
        icon="mail"
        value={email}
        onChangeText={setEmail}
        placeholder="example@health.com"
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthInput
        label="كلمة المرور"
        icon="lock"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        error={errors.password}
        isPassword
      />
      <Pressable onPress={() => router.push('/(auth)/forgotPassword')} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
        <Text style={[typography.labelCaps, { color: colors.secondary }]}>نسيت كلمة المرور؟</Text>
      </Pressable>
      <AuthButton title="تسجيل الدخول" onPress={handleLogin} isLoading={isLoading} variant="primary" />
      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>ليس لديك حساب؟ </Text>
        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={[typography.bodySm, { color: colors.secondary, fontWeight: '600' }]}>إنشاء حساب جديد</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
