export type RecordType = "Lab Report" | "Prescription" | "Scan" | "Discharge Summary";

export interface MedicalRecord {
  id: string;
  name: string;
  type: RecordType;
  hospital: string;
  doctor: string;
  date: string;
  fileSize: string;
  fileName: string;
  aiSummary: string;
  details: { label: string; value: string }[];
  treatmentNotes?: { id: string; doctor: string; date: string; note: string }[];
}

export const medicalRecords: MedicalRecord[] = [
  {
    id: "rec_001",
    name: "Complete Blood Count",
    type: "Lab Report",
    hospital: "Mount Sinai Medical Center",
    doctor: "Dr. Sarah Chen",
    date: "2025-04-12",
    fileSize: "1.2 MB",
    fileName: "CBC_Report_Apr2025.pdf",
    aiSummary:
      "Hemoglobin and platelet counts are within normal range. White blood cell count is slightly elevated (11.4 K/µL), which may indicate a mild inflammatory response or recent infection. Recommend follow-up in 2 weeks if symptoms persist.",
    details: [
      { label: "Hemoglobin", value: "14.2 g/dL" },
      { label: "WBC", value: "11.4 K/µL ↑" },
      { label: "Platelets", value: "245 K/µL" },
      { label: "Hematocrit", value: "42.1%" },
    ],
  },
  {
    id: "rec_002",
    name: "Lipid Panel",
    type: "Lab Report",
    hospital: "Cleveland Clinic",
    doctor: "Dr. Michael Patel",
    date: "2025-04-08",
    fileSize: "890 KB",
    fileName: "Lipid_Panel_Apr2025.pdf",
    aiSummary:
      "Total cholesterol is elevated at 245 mg/dL with LDL at 165 mg/dL. HDL is borderline low. Triglycerides are within range. Recommend dietary intervention and consider statin therapy. Schedule follow-up in 3 months.",
    details: [
      { label: "Total Cholesterol", value: "245 mg/dL ↑" },
      { label: "LDL", value: "165 mg/dL ↑" },
      { label: "HDL", value: "38 mg/dL ↓" },
      { label: "Triglycerides", value: "142 mg/dL" },
    ],
  },
  {
    id: "rec_003",
    name: "Chest X-Ray",
    type: "Scan",
    hospital: "Johns Hopkins Hospital",
    doctor: "Dr. Emily Rodriguez",
    date: "2025-03-28",
    fileSize: "8.4 MB",
    fileName: "ChestXray_Mar2025.dcm",
    aiSummary:
      "Lung fields appear clear with no evidence of consolidation, effusion, or pneumothorax. Cardiac silhouette is normal in size. No acute cardiopulmonary findings. Bone structures appear intact.",
    details: [
      { label: "Modality", value: "X-Ray" },
      { label: "View", value: "PA + Lateral" },
      { label: "Findings", value: "Normal" },
    ],
  },
  {
    id: "rec_004",
    name: "Atorvastatin 20mg",
    type: "Prescription",
    hospital: "Mayo Clinic",
    doctor: "Dr. Michael Patel",
    date: "2025-04-10",
    fileSize: "120 KB",
    fileName: "Rx_Atorvastatin.pdf",
    aiSummary:
      "Atorvastatin 20mg once daily for cholesterol management. Take in the evening with or without food. Monitor liver function tests at 6-week intervals. Watch for muscle pain or weakness.",
    details: [
      { label: "Medication", value: "Atorvastatin" },
      { label: "Dosage", value: "20 mg daily" },
      { label: "Duration", value: "90 days" },
      { label: "Refills", value: "3" },
    ],
  },
  {
    id: "rec_005",
    name: "MRI Brain - Contrast",
    type: "Scan",
    hospital: "Massachusetts General",
    doctor: "Dr. James Thornton",
    date: "2025-03-15",
    fileSize: "42.1 MB",
    fileName: "MRI_Brain_Mar2025.dcm",
    aiSummary:
      "No acute intracranial abnormality. Ventricles and sulci are normal in size and configuration. No mass effect, midline shift, or abnormal enhancement. Vascular structures appear patent.",
    details: [
      { label: "Modality", value: "MRI w/ Contrast" },
      { label: "Region", value: "Brain" },
      { label: "Findings", value: "No abnormalities" },
    ],
  },
  {
    id: "rec_006",
    name: "Annual Physical Discharge",
    type: "Discharge Summary",
    hospital: "Stanford Health Care",
    doctor: "Dr. Sarah Chen",
    date: "2025-02-20",
    fileSize: "2.1 MB",
    fileName: "Discharge_Feb2025.pdf",
    aiSummary:
      "Patient discharged in stable condition following routine annual examination. Vitals within normal limits. Follow-up scheduled in 12 months. Continue current medications and lifestyle recommendations.",
    details: [
      { label: "Admission", value: "2025-02-19" },
      { label: "Discharge", value: "2025-02-20" },
      { label: "Status", value: "Stable" },
    ],
  },
  {
    id: "rec_007",
    name: "HbA1c Test",
    type: "Lab Report",
    hospital: "Cleveland Clinic",
    doctor: "Dr. Michael Patel",
    date: "2025-04-15",
    fileSize: "640 KB",
    fileName: "HbA1c_Apr2025.pdf",
    aiSummary:
      "HbA1c level at 6.1%, indicating prediabetic range. Recommend lifestyle modifications including diet and exercise. Re-test in 3 months to monitor progression.",
    details: [
      { label: "HbA1c", value: "6.1% ↑" },
      { label: "Fasting Glucose", value: "108 mg/dL" },
    ],
  },
];

export const bloodPressureData = [
  { date: "Nov", systolic: 122, diastolic: 78 },
  { date: "Dec", systolic: 128, diastolic: 82 },
  { date: "Jan", systolic: 132, diastolic: 84 },
  { date: "Feb", systolic: 130, diastolic: 83 },
  { date: "Mar", systolic: 126, diastolic: 80 },
  { date: "Apr", systolic: 124, diastolic: 79 },
];

export const heartRateData = [
  { date: "Nov", bpm: 72 },
  { date: "Dec", bpm: 75 },
  { date: "Jan", bpm: 78 },
  { date: "Feb", bpm: 74 },
  { date: "Mar", bpm: 71 },
  { date: "Apr", bpm: 70 },
];

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: "access" | "upload" | "share" | "alert";
}

export const recentActivity: ActivityItem[] = [
  { id: "a1", actor: "Dr. Sarah Chen", action: "accessed", target: "your CBC Lab Report", time: "12 min ago", type: "access" },
  { id: "a2", actor: "You", action: "uploaded", target: "MRI Brain Scan", time: "2 hours ago", type: "upload" },
  { id: "a3", actor: "Dr. Michael Patel", action: "downloaded", target: "Lipid Panel results", time: "5 hours ago", type: "access" },
  { id: "a4", actor: "AI Assistant", action: "flagged", target: "elevated cholesterol levels", time: "1 day ago", type: "alert" },
  { id: "a5", actor: "You", action: "granted access to", target: "Dr. Emily Rodriguez", time: "2 days ago", type: "share" },
  { id: "a6", actor: "Dr. James Thornton", action: "added a note to", target: "MRI Brain Report", time: "3 days ago", type: "access" },
];

export interface DoctorAccess {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  avatarColor: string;
  canView: boolean;
  canDownload: boolean;
  grantedDate: string;
  patientId?: string;
  doctorId?: string;
  accessLevel: "view" | "download";
  startTime?: string;
  endTime?: string;
  emergencyAccess: boolean;
  verified?: boolean;
}

export const doctorAccessList: DoctorAccess[] = [
  { id: "d1", name: "Dr. Sarah Chen", specialty: "Internal Medicine", hospital: "Mount Sinai Medical Center", avatarColor: "oklch(0.45 0.14 255)", canView: true, canDownload: true, grantedDate: "2024-11-12", patientId: "PAT-001", doctorId: "DOC-001", accessLevel: "download", startTime: "2024-11-12T00:00", endTime: "2025-11-12T23:59", emergencyAccess: false, verified: true },
  { id: "d2", name: "Dr. Michael Patel", specialty: "Cardiology", hospital: "Cleveland Clinic", avatarColor: "oklch(0.62 0.14 235)", canView: true, canDownload: true, grantedDate: "2024-12-03", patientId: "PAT-001", doctorId: "DOC-002", accessLevel: "download", startTime: "2024-12-03T00:00", endTime: "2025-12-03T23:59", emergencyAccess: true, verified: true },
  { id: "d3", name: "Dr. Emily Rodriguez", specialty: "Radiology", hospital: "Johns Hopkins Hospital", avatarColor: "oklch(0.65 0.15 155)", canView: true, canDownload: false, grantedDate: "2025-01-18", patientId: "PAT-001", doctorId: "DOC-003", accessLevel: "view", startTime: "2025-01-18T00:00", endTime: "2025-07-18T23:59", emergencyAccess: false, verified: true },
  { id: "d4", name: "Dr. James Thornton", specialty: "Neurology", hospital: "Massachusetts General", avatarColor: "oklch(0.78 0.15 75)", canView: true, canDownload: true, grantedDate: "2025-02-22", patientId: "PAT-001", doctorId: "DOC-004", accessLevel: "download", startTime: "2025-02-22T00:00", endTime: "2026-02-22T23:59", emergencyAccess: false, verified: false },
  { id: "d5", name: "Dr. Aisha Williams", specialty: "Endocrinology", hospital: "Stanford Health Care", avatarColor: "oklch(0.58 0.21 25)", canView: false, canDownload: false, grantedDate: "2025-04-15", patientId: "PAT-001", doctorId: "DOC-005", accessLevel: "view", startTime: "2025-04-15T00:00", endTime: "2025-10-15T23:59", emergencyAccess: false, verified: false },
];

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  condition: string;
  lastVisit: string;
  status: "Stable" | "Monitoring" | "Critical";
  riskScore: number;
}

export const patientRoster: Patient[] = [
  { id: "p1", name: "John Doe", age: 54, gender: "Male", condition: "Hypertension, Hyperlipidemia", lastVisit: "2025-04-12", status: "Monitoring", riskScore: 72 },
  { id: "p2", name: "Maria Gonzalez", age: 61, gender: "Female", condition: "Type 2 Diabetes", lastVisit: "2025-04-10", status: "Stable", riskScore: 45 },
  { id: "p3", name: "Liam O'Brien", age: 38, gender: "Male", condition: "Asthma", lastVisit: "2025-04-08", status: "Stable", riskScore: 22 },
  { id: "p4", name: "Priya Sharma", age: 47, gender: "Female", condition: "Migraine, Anxiety", lastVisit: "2025-04-14", status: "Monitoring", riskScore: 58 },
  { id: "p5", name: "Robert Kim", age: 67, gender: "Male", condition: "CAD, Post-MI", lastVisit: "2025-04-15", status: "Critical", riskScore: 89 },
  { id: "p6", name: "Emma Johnson", age: 29, gender: "Female", condition: "Routine Check-up", lastVisit: "2025-04-11", status: "Stable", riskScore: 12 },
];

export interface AIAlert {
  id: string;
  patient: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail: string;
  time: string;
}

export const aiAlerts: AIAlert[] = [
  { id: "al1", patient: "Robert Kim", severity: "critical", title: "Abnormal ECG pattern detected", detail: "ST-segment depression observed in latest ECG. Recommend immediate cardiology consult.", time: "8 min ago" },
  { id: "al2", patient: "John Doe", severity: "warning", title: "High cholesterol detected", detail: "LDL at 165 mg/dL in recent lipid panel — consider statin adjustment.", time: "1 hour ago" },
  { id: "al3", patient: "Priya Sharma", severity: "warning", title: "Medication interaction risk", detail: "Sumatriptan + SSRI combination flagged for serotonin syndrome risk.", time: "3 hours ago" },
  { id: "al4", patient: "Maria Gonzalez", severity: "info", title: "HbA1c trending upward", detail: "3-month moving average increased from 6.8% to 7.2%. Monitor closely.", time: "Yesterday" },
];

export interface EmergencyRequest {
  id: string;
  patientName: string;
  doctorName: string;
  hospital: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  time: string;
}

export const emergencyRequests: EmergencyRequest[] = [
  { id: "er1", patientName: "Robert Kim", doctorName: "Dr. James Thornton", hospital: "Massachusetts General", reason: "Unconscious patient, suspected cardiac arrest", status: "pending", time: "5 min ago" },
  { id: "er2", patientName: "John Doe", doctorName: "Dr. Sarah Chen", hospital: "Mount Sinai Medical Center", reason: "Severe allergic reaction, no history available", status: "approved", time: "2 hours ago" },
];

export interface SystemLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  status: "success" | "failure" | "warning";
  timestamp: string;
  ip: string;
}

export const systemLogs: SystemLog[] = [
  { id: "l1", user: "Admin", action: "Verify Doctor", resource: "Dr. Sarah Chen", status: "success", timestamp: "2025-04-24 10:30:15", ip: "192.168.1.1" },
  { id: "l2", user: "Dr. Michael Patel", action: "Access Record", resource: "PAT-001 (Lipid Panel)", status: "success", timestamp: "2025-04-24 09:45:22", ip: "10.0.0.42" },
  { id: "l3", user: "Unknown", action: "Login Attempt", resource: "Admin Account", status: "failure", timestamp: "2025-04-24 08:12:05", ip: "45.12.88.3" },
  { id: "l4", user: "System", action: "Blockchain Sync", resource: "All Records", status: "success", timestamp: "2025-04-24 00:00:01", ip: "localhost" },
];
