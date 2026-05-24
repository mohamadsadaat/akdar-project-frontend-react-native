export const mockData = {
  user: {
    name: 'أحمد',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVzExAQ6Pe3Cn2uqH1w11vwJGlppvVy5wrp-DesTOAW49S113FafWj7MQveP08G8KbRa0pHq5X42AIFWAYce5W4qJSH7GZSi537CW4EStKWVqzxaDawD9Wcski9sfQVlmhcRhGV8FBA6jvPhlShjaZTJmRX4uguRWZy6NVx4dsCmRYt8DlhGox4QGNxY6EbT2dMZzrLJZvT4jnJb5vr8DYXR-L_s5HIACqpHUIvl44WKiPVmRGTlgEQjJIqgLldnF5fmCzQ2zEcWx-',
  },
  upcomingAppointment: {
    doctor: 'د. سارة المنصور',
    specialty: 'استشاري باطنية',
    date: '15 أكتوبر',
    time: '10:30 صباحاً',
  },
  activitySummary: {
    steps: '8,432',
    heartRate: '72',
  },
  recentAlerts: [
    {
      id: '1',
      title: 'رسالة جديدة من الطبيب',
      message: 'د. أحمد قام بالرد على استفسارك بخصوص نتائج التحاليل الأخيرة. يمكنك الاطلاع عليها الآن.',
      icon: 'message-circle', // feather equivalent of chat_bubble
      type: 'primary',
      time: 'منذ دقيقتين',
      isUnread: true,
    },
    {
      id: '2',
      title: 'موعد الدواء',
      message: 'حان الوقت لتناول جرعة الصباح من "ليبيتور 20 ملجم". يرجى تأكيد التناول.',
      icon: 'activity', // medical_services
      type: 'secondary',
      time: '8:00 ص',
      isUnread: false,
    },
    {
      id: '3',
      title: 'تأكيد موعد',
      message: 'تم تأكيد موعدك مع عيادة القلب يوم الثلاثاء القادم الساعة 10:00 صباحاً.',
      icon: 'calendar',
      type: 'tertiary',
      time: 'أمس',
      isUnread: true,
    },
    {
      id: '4',
      title: 'نتائج المختبر',
      message: 'نتائج تحليل الدم أصبحت متوفرة في ملفك الطبي. الرجاء مراجعتها مع الطبيب.',
      icon: 'file-text',
      type: 'primary',
      time: 'منذ يومين',
      isUnread: false,
    },
  ],
  appointments: [
    {
      id: 'a1',
      doctor: 'د. سمير المنصور',
      specialty: 'استشاري أمراض القلب',
      date: '12 أكتوبر، 2023',
      time: '10:30 صباحاً',
      status: 'confirmed',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxFRIaq-8xfJq5d_5MOhODlLQ7XHd2EIiA8Xc8x7z2dvLVntp6z7cZjjOYIqf9GlUEUOtbhuhqiI6-BCNmcts7jvbtDyxh9n_EhOeeJEF8fLkN1kTVHTyt0t4Bz6U11zXoAViPyb0uNUdhR-sgfhPFAkPHFCZ4Vd2DtJ5TT9Nj5XBLCsCaSVKgcBqAJinIH7pfPw5lw60b1atyq6XJ-9bKlG2DZHd_uIec0Aj1MHJcdpEcougviRgpOSxhZPUDaRCam1_QZRfWpsGR'
    },
    {
      id: 'a2',
      doctor: 'د. ليلى حسن',
      specialty: 'أخصائية طب الأطفال',
      date: '15 أكتوبر، 2023',
      time: '04:15 مساءً',
      status: 'pending',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChknUXvES7tx-H20hQNp9T6-3hkThRffv1KJM_R6unJdFF0SPeG1TC_utHHEDeQ2_jgqV98xI0YeITTnDNCNI_QuulB-MpReIPFgxgD2Jt4OReuMG7lrvsPcdPfoQkVimuMszcLQ4k87-zq5lfUZSB5ExtTq7mkB8QI10adKZtwiAAv_kldZg6-YHylbxYLMHAQyy5_0hrLn868jGmB5eHBfWpMi8jtaIb1nqOPMb523RwxECVuAPOwjpLcmn2fk0CwPuT1hkrGt4S'
    },
    {
      id: 'a3',
      doctor: 'د. يوسف خالد',
      specialty: 'جراحة العظام',
      date: '20 أكتوبر، 2023',
      time: '09:00 صباحاً',
      status: 'confirmed',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKAG1rvKsKbnuHxhYwe_7KFSInOOJnBHhPUjU4OuKCyhQaMg-tcqCEftJYn1pt_qAKxoHcHRHbhuK7TpMXQljGNa51NlIeEawY4eO6Rf6iqpdK0TCaXMVCjsYqf_61ERzxCkVHxf_j3JHe6qYmRBQ7p-XO7I1scADFN2H8o7_ZS06sFB3gq4qJf8SgDr6rhG-c7Dr4X3JPimeYedLZoP-QAMF8o8TCIZ6SyTpCz4toGq3436Zv8udylqBlwaPVkws7THWa5k4OdDko'
    }
  ],
  healthRecords: [
    {
      id: 'hr1',
      type: 'recent',
      tag: 'زيارة حديثة',
      title: 'التهاب الجيوب الأنفية الحاد',
      date: '١٢ أكتوبر ٢٠٢٣',
      doctor: 'د. أحمد محمود - أخصائي أنف وأذن',
      location: 'مستشفى أخضر التخصصي',
      hasPrescription: true,
      hasAttachment: false,
    },
    {
      id: 'hr2',
      type: 'checkup',
      tag: 'فحص دوري',
      title: 'فحص ضغط الدم والكوليسترول',
      date: '٠٥ أغسطس ٢٠٢٣',
      doctor: 'د. سارة خالد - طب عام',
      location: 'مستشفى أخضر التخصصي',
      hasPrescription: false,
      hasAttachment: true,
      attachmentName: 'النتائج المخبرية.pdf',
    },
    {
      id: 'hr3',
      type: 'vaccine',
      tag: 'لقاح',
      title: 'لقاح الإنفلونزا الموسمي',
      date: '١٥ ديسمبر ٢٠٢٢',
      doctor: 'ممرض الطوارئ',
      location: 'مركز اللقاحات المعتمد',
      hasPrescription: false,
      hasAttachment: false,
    }
  ],
};
