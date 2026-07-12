export type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  avatar_url: string | null;
};

export type ApiAllergy = {
  id: number;
  name: string;
  reaction: string | null;
  severity: string | null;
  notes: string | null;
};

export type ApiProfile = {
  id: number;
  patient_number: string;
  avatar_url: string | null;
  birth_date: string | null;
  gender: string | null;
  blood_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  allergies?: ApiAllergy[];
};

export type AuthPayload = {
  user: ApiUser;
  profile: ApiProfile | null;
  doctor?: ApiDoctor | null;
};

export type AuthResponse = {
  token: string;
  token_type: 'Bearer';
  data: AuthPayload;
};

export type DataResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
};

export type ApiSpecialty = {
  id: number;
  name_ar: string;
  description: string | null;
};

export type ApiFacility = {
  id: number;
  name: string;
  type: string | null;
  address?: string | null;
  phone?: string | null;
  location?: string | null;
};

export type ApiDoctor = {
  id: number;
  name: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  rating_average: number;
  reviews_count: number;
  is_active: boolean;
  specialty: Pick<ApiSpecialty, 'id' | 'name_ar'> | null;
  facility: ApiFacility | null;
  schedule_rules?: {
    weekday: number;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
  }[];
};

export type ApiAppointment = {
  id: number;
  doctor: ApiDoctor | null;
  patient?: ApiPatientSummary | null;
  facility: Pick<ApiFacility, 'id' | 'name' | 'type' | 'address'> | null;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
};

export type ApiPatientSummary = {
  id: number;
  patient_number: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  gender: string | null;
  blood_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
};

export type ApiMedicalRecord = {
  id: number;
  recorded_at: string;
  type: string;
  title: string;
  diagnosis: string | null;
  notes: string | null;
  doctor: ApiDoctor | null;
  facility: Pick<ApiFacility, 'id' | 'name'> | null;
  attachments?: ApiRecordAttachment[];
};

export type ApiRecordAttachment = {
  id: number;
  original_name: string;
  mime_type: string;
  size: number;
  download_url: string;
};

export type ApiPrescription = {
  id: number;
  issued_at: string;
  notes: string | null;
  doctor: ApiDoctor | null;
  items: {
    id: number;
    medicine_name: string;
    dose: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
  }[];
};

export type ApiVitalMeasurement = {
  id: number;
  type: string;
  value: number;
  unit: string;
  measured_at: string;
  source: string | null;
};

export type ApiNotification = {
  id: string;
  type: string;
  data: {
    title?: string;
    body?: string;
    message?: string;
    icon?: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
};

export type DashboardResponse = {
  user: ApiUser;
  upcoming_appointment: ApiAppointment | null;
  activity_summary: {
    steps: number | null;
    heart_rate: number | null;
  };
  recent_notifications: ApiNotification[];
};

export type DoctorAvailability = {
  doctor_id: number;
  date: string;
  duration_minutes: number;
  slots: string[];
};
