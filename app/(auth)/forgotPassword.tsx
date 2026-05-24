import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLayout } from '../../src/components/AuthLayout';
import { AuthInput } from '../../src/components/AuthInput';
import { AuthButton } from '../../src/components/AuthButton';
import { typography } from '../../src/theme/typography';
import { colors } from '../../src/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!email) {
      setError('البريد الإلكتروني مطلوب');
      return false;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('صيغة البريد غير صحيحة');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSend = async () => {
    if (!validate()) return;
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'تم الإرسال',
        'تم إرسال تعليمات إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.',
        [{ text: 'حسناً', onPress: () => router.replace('/(auth)/login') }]
      );
    }, 1500);
  };

  return (
    <AuthLayout>
      <View style={{ alignItems: 'center' }}>
        <Text style={[typography.displayLg, { color: colors.onPrimary, marginBottom: 24 }]}>أخضر</Text>
        <Text style={[typography.bodySm, { color: colors.onSurfaceVariant, marginBottom: 32 }]}>استعادة كلمة المرور</Text>
      </View>

      <AuthInput
        label="البريد الإلكتروني"
        icon="mail"
        value={email}
        onChangeText={setEmail}
        placeholder="example@health.com"
        error={error}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <AuthButton
        title="إرسال رابط إعادة تعيين"
        onPress={handleSend}
        isLoading={isLoading}
        variant="primary"
      />

      <Pressable onPress={() => router.replace('/(auth)/login')} style={{ marginTop: 20, alignItems: 'center' }}>
        <Text style={[typography.bodySm, { color: colors.secondary }]}>{'← العودة إلى تسجيل الدخول'}</Text>
      </Pressable>
    </AuthLayout>
  );
}
