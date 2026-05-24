import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout } from '../../src/components/AuthLayout';
import { AuthInput } from '../../src/components/AuthInput';
import { AuthButton } from '../../src/components/AuthButton';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    agree?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!fullName) newErrors.fullName = 'الاسم الكامل مطلوب';
    if (!email) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) newErrors.email = 'صيغة البريد غير صحيحة';
    if (!phone) newErrors.phone = 'رقم الجوال مطلوب';
    if (!password) newErrors.password = 'كلمة المرور مطلوبة';
    if (password && password.length < 6) newErrors.password = 'يجب أن تكون كلمة المرور 6 خانات على الأقل';
    if (confirmPassword !== password) newErrors.confirmPassword = 'كلمتا المرور غير متطابقتين';
    if (!agree) newErrors.agree = 'يجب قبول الشروط';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    // Simulate successful registration
    Alert.alert('تم التسجيل', 'تم إنشاء حسابك بنجاح', [
      { text: 'حسناً', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  return (
    <AuthLayout>
      <View style={{ alignItems: 'center' }}>
        <Text style={[typography.displayLg, { color: colors.onPrimary, marginBottom: 24 }]}>أخضر</Text>
        <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginBottom: 32 }]}>أنشئ حسابك الطبي الجديد</Text>
      </View>

      <AuthInput
        label="الاسم الكامل"
        icon="person"
        value={fullName}
        onChangeText={setFullName}
        placeholder="أدخل اسمك الثلاثي"
        error={errors.fullName}
      />
      <AuthInput
        label="البريد الإلكتروني"
        icon="mail"
        value={email}
        onChangeText={setEmail}
        placeholder="example@domain.com"
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthInput
        label="رقم الجوال"
        icon="call"
        value={phone}
        onChangeText={setPhone}
        placeholder="+966 5x xxxx xxx"
        error={errors.phone}
        keyboardType="phone-pad"
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
      <AuthInput
        label="تأكيد كلمة المرور"
        icon="lock"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="••••••••"
        error={errors.confirmPassword}
        isPassword
      />
      {/* Terms agreement */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, marginHorizontal: 4 }}>
        <Pressable onPress={() => setAgree(!agree)} style={{ marginRight: 8 }}>
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: colors.outlineVariant,
            backgroundColor: agree ? colors.primary : 'transparent',
          }} />
        </Pressable>
        <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, flex: 1 }]}>أوافق على 
          <Text style={{ color: colors.primary, fontWeight: '600' }}>شروط الاستخدام</Text> و 
          <Text style={{ color: colors.primary, fontWeight: '600' }}>سياسة الخصوصية</Text> الطبية.
        </Text>
      </View>
      {errors.agree && <Text style={{ color: colors.error, marginHorizontal: 4 }}>{errors.agree}</Text>}

      <AuthButton title="إنشاء الحساب" onPress={handleRegister} variant="primary" />
      <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={[typography.bodySm, { color: colors.onSurfaceVariant }]}>لديك حساب بالفعل؟ </Text>
        <Pressable onPress={() => router.replace('/(auth)/login')}>
          <Text style={[typography.bodySm, { color: colors.secondary, fontWeight: '600' }]}>تسجيل الدخول</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
