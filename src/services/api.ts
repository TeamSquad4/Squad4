import { getToken, clearAuth } from "@/lib/auth-state";

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export interface TokenResponse {
  token: string;
  role: string;
  user_id: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface RecordResponse {
  id: number;
  patient_id: number;
  record_name: string;
  record_type: string;
  file_path: string;
  doctor_name: string;
  hospital: string;
  record_date: string;
  description: string;
  notes: string;
  blockchain_hash?: string | null;
  blockchain_tx?: string | null;
}

export interface AccessRequestResponse {
  id: number;
  patient_id: number;
  doctor_id: number;
  status: string;
}

export interface PatientResponse {
  id: number;
  name: string;
  email: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuth();
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;

    try {
      const json = await res.json();
      detail = json.detail || detail;
    } catch {
      // ignore JSON parse error
    }

    throw new Error(detail);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register(name: string, email: string, password: string, role: string) {
      return request<UserResponse>(
        "/users/register",
        {
          method: "POST",
          body: JSON.stringify({ name, email, password, role }),
        },
        false
      );
    },

    login(email: string, password: string) {
      return request<TokenResponse>(
        "/users/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
        false
      );
    },
  },

  profile: {
    getProfile() {
      return request<UserResponse>("/users/me");
    },
  },

  records: {
    getRecords(patientId: number) {
      return request<RecordResponse[]>(`/records/${patientId}`);
    },

    upload(formData: FormData) {
      return request<RecordResponse>(
        "/records/upload",
        {
          method: "POST",
          body: formData,
        }
      );
    },
  },

  access: {
    getMyRequests() {
      return request<AccessRequestResponse[]>("/access/my-requests");
    },

    getMyPatients() {
      return request<PatientResponse[]>("/access/my-patients");
    },

    requestAccess(patientId: number) {
      return request<AccessRequestResponse>(
        `/access/request-access?patient_id=${patientId}`,
        {
          method: "POST",
        }
      );
    },

    approve(requestId: number) {
      return request<AccessRequestResponse>(
        `/access/approve/${requestId}`,
        {
          method: "POST",
        }
      );
    },

    reject(requestId: number) {
      return request<AccessRequestResponse>(
        `/access/reject/${requestId}`,
        {
          method: "POST",
        }
      );
    },
  },
};