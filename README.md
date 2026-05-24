# مشروع أخضر (Expo + React Native)

هذا المشروع مبني باستخدام Expo مع دعم TypeScript و `expo-router`. واجهته باللغة العربية مع دعم RTL (اتجاه من اليمين لليسار).

موجز تقني:
- منصة: Expo
- لغة: TypeScript + React Native
- Router: `expo-router` (file-based routing)
- إدارة التوثيق البسيطة: `src/context/AuthContext.tsx`

---

## تشغيل المشروع محليًا

1. تثبيت الحزم:

```bash
npm install
```

2. بدء سيرفر التطوير (Metro / Expo):

```bash
npx expo start -c
```

3. أو تشغيل على أندرويد/آي أو إس:

```bash
npx expo run:android
npx expo run:ios
```

ملاحظة: استخدم `expo start` ثم افتح عبر Expo Go أو المحاكي/الجهاز الفعلي.

---

## بنية المشروع (موجز)

- `app/` — مجلد الصفحات وملفات التوجيه (file-based routes). كل ملف هنا يمثل شاشة أو مجموعة شاشات.
- `src/` — مكونات قابلة لإعادة الاستخدام، سياق التطبيق، بيانات وهمية، والمواضيع (theme).
  - `src/components/` — مكونات واجهة المستخدم (Buttons, Inputs, Cards, Screen, AuthLayout...)
  - `src/context/` — مزود السياق للمصادقة (`AuthContext.tsx`).
  - `src/theme/` — الألوان، الطباعة، المسافات، والظلال.
  - `src/data/mockData.ts` — بيانات وهمية للاختبار.
- `assets/` — صور وأيقونات.
- `android/` — إعدادات بناء Android (مدفوع بـ Expo config / bare workflow جزئياً).

---

## وصف الصفحات (Screens)

الصفحات موجودة داخل `app/` باستعمال بنية `expo-router`:

- `app/index.tsx` — شاشة البداية (Splash). تعرض شعار التطبيق ثم توجه المستخدم بناءً على حالة المصادقة.

- `app/(auth)/login.tsx` — شاشة تسجيل الدخول. تستعمل `AuthLayout` و`AuthInput` و`AuthButton` مع تحقق بسيط من الحقول.

- `app/(auth)/register.tsx` — شاشة تسجيل مستخدم جديد (نموذج التسجيل مع تحقق مبدئي).

- `app/(auth)/forgotPassword.tsx` — استعادة كلمة المرور (محاكاة إرسال رابط إعادة التعيين).

- `app/(tabs)/_layout.tsx` — تخطيط علامات التبويب (Tabs) ويستخدم `BottomTabBar` المخصص.

- `app/(tabs)/index.tsx` — الشاشة الرئيسية (Home). تعرض ملخص النشاط، بطاقة الموعد القادم، وصول سريع وتنبيهات.

- `app/(tabs)/appointments.tsx` — شاشة المواعيد: تعرض قائمة المواعيد، أزرار الإجراء (إلغاء/إعادة جدولة) وزر FAB (`+`) لإضافة حجز جديد.

- `app/(tabs)/healthRecord.tsx` — السجل الصحي: يعرض السجل الطبي في شكل خط زمني، ويمكن الضغط على زر FAB (`+`) لإنشاء إدخال/حجز جديد.

- `app/(tabs)/notifications.tsx` — صفحة التنبيهات: قوائم تنبيهات قابلة للتعليم كمقروء.

- `app/(tabs)/profile.tsx` — صفحة الملف الشخصي وإعدادات الحساب.

- `app/BookAppointment.tsx` — شاشة حجز موعد (تفتح حالياً من FAB في الصفحات أعلاه).

- `app/modal.tsx` — مثال على شاشة مودال تستخدم `ThemedText`/`ThemedView`.

ملاحظات: قمت مؤخرًا بربط أزرار FAB في `app/(tabs)/appointments.tsx` و`app/(tabs)/healthRecord.tsx` للتنقّل إلى `/BookAppointment`.

---

## مكونات مهمة داخل `src/components`

- `AuthLayout` — تخطيط شاشات المصادقة (خلفية مزخرفة وبطاقة مدخلات).
- `AuthInput`, `AuthButton` — عناصر إدخال وزر متوافقة مع التصميم العربي.
- `BottomTabBar` — شريط التنقل السفلي المخصص.
- `Screen` — مكون غلاف للشاشات مع `SafeAreaView` و`StatusBar`.
- `Card`, `CustomModal`, `AppointmentCard` — مكونات مستخدمة عبر الشاشات.

---

## ملاحظات تطويرية وتوصيات مستقبلية

- لا يوجد API حقيقي حالياً — أنصح بإنشاء `src/api/` يحتوي على `client.ts` (axios أو fetch wrapper) وملفات خدمة لكل مورد (appointments, auth, profile).
- حفظ حالة المصادقة بشكل دائم: استخدم `expo-secure-store` أو `AsyncStorage` لحفظ التوكن وإعادة استرداده عند بدء التطبيق.
- نمذجة النماذج: استبدال التحققات اليدوية بمزيج `react-hook-form` + `yup` لتبسيط إدارة الأخطاء.
- i18n: حالياً التطبيق بالعربية مع RTL مفروض. لإضافة لغات أخرى استعمل `react-i18next` أو مكتبة مماثلة.
- تحسين الصور: تحويل الصور الكبيرة إلى webp وLazy-loading للصور في القوائم.
- اختبارات: إضافة اختبارات وحدة ومكونات (`jest` + `@testing-library/react-native`).
- CI: أضِف GitHub Actions لفحص `npm install`, `npm run lint`, و`npx expo prebuild` أو بناء التجارب.

---

## تغييرات وشغل قمت به مؤخراً

- ربطت زرّ FAB في `app/(tabs)/appointments.tsx` و`app/(tabs)/healthRecord.tsx` ليقومان بالتنقّل إلى شاشة `app/BookAppointment.tsx` عند الضغط.

---

## ماذا أستطيع أن أفعل بعد ذلك؟

- إنشاء مجلد `src/api` مع `client.ts` وملف مثال لنداء تسجيل الدخول.
- إضافة حفظ حالة جلسة المصادقة باستخدام `expo-secure-store`.
- إعداد قالب `react-hook-form` في شاشة `BookAppointment` كمثال.

أخبرني أي خيار تريدني أن أبدأ به.
