import { log } from "console";
import { users, recruitments, applications, promotions } from "./data";
import type { User, Recruitment, Application, Promotion } from "./types";

const API_BASE_URL = "http://localhost:3005/api";

// async function apiFetch(endpoint: string, options: RequestInit = {}) {
//   try {
//     const token = sessionStorage.getItem("unirecruits_token");

//     const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         ...options.headers,
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`API call failed: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.warn(
//       `API call to ${endpoint} failed, falling back to mock data. Error:`,
//       error
//     );
//     throw error; // so caller can decide whether to use mock data
//   }
// }
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const token = sessionStorage.getItem("unirecruits_token");

    // ✅ If body is FormData, don't force Content-Type (browser sets it with boundary)
    const isFormData = options.body instanceof FormData;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn(
      `API call to ${endpoint} failed, falling back to mock data. Error:`,
      error
    );
    throw error; // caller decides how to handle
  }
}

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> => {
  try {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // Assuming your API response looks like: { data: { user, token } }
    const { user, token } = response.data;
    return { user, token };
  } catch (error) {
    return null;
  }
};

// --- Users ---
export const fetchUsers = async (): Promise<User[]> => {
  const response = await apiFetch("/staffs");
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  return response.data || response;
};

export const updateUserProfile = async (
  userId: string,
  userData: Partial<User>
): Promise<User> => {
  return await apiFetch(`/staffs/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};

// --- Recruitments ---
export const fetchRecruitments = async (): Promise<Recruitment[]> => {
  const response = await apiFetch("/recruitments");
  return response.data;
};

export const fetchRecruitmentById = async (id: string): Promise<any> => {
  const recruitment = await apiFetch(`/recruitments/${id}`);
  const { data } = recruitment;
  return data;
};

export const fetchRecruitmentApplications = async (
  id: string
): Promise<any> => {
  const applications = await apiFetch(`/admin/recruitments/${id}/applications`);
  return applications.data;
};

export const createRecruitment = async (
  recruitmentData: Omit<Recruitment, "id" | "status">
): Promise<Recruitment> => {
  const response = await apiFetch("/admin/recruitments", {
    method: "POST",
    body: JSON.stringify(recruitmentData),
  });
  return response.data || response;
};

// --- Applications ---
export const fetchApplications = async (): Promise<Application[]> => {
  const applications = await apiFetch("/applications");
  return applications.data;
};

export const createApplication = async (
  applicationData:
    | FormData
    | Omit<Application, "id" | "submittedDate" | "status">
): Promise<Application> => {
  let options: RequestInit;

  if (applicationData instanceof FormData) {
    options = {
      method: "POST",
      body: applicationData, // browser sets boundary headers automatically
    };
  } else {
    options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    };
  }

  const response = await apiFetch("/applications", options);
  return response.data || response;
};

export const updateApplicationStatus = async (
  appId: string,
  status: Application["status"]
): Promise<Application> => {
  return await apiFetch(`/applications/${appId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

// --- Promotions ---
export const fetchPromotions = async (): Promise<Promotion[]> => {
  const response = await apiFetch("/promotions");
  return response.data;
};

export const fetchPromotionsByStaffId = async (
  staffId: string
): Promise<Promotion[]> => {
  const response = await apiFetch(`/promotions/staff/${staffId}`);
  return response.data;
};

export const fetchPromotionById = async (
  id: string
): Promise<{ promotion: Promotion; staffMember: User }> => {
  const promotions = await apiFetch(`/promotions/${id}`);
  return promotions;
};

export const createPromotionRequest = async (
  requestData: Omit<Promotion, "id" | "requestDate" | "status">
): Promise<any> => {
  const token = sessionStorage.getItem("unirecruits_token");
  const response = await apiFetch("/promotions", {
    method: "POST",
    body: JSON.stringify(requestData),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return response.data || response;
};

export const updatePromotionStatus = async (
  promoId: string,
  status: "approved" | "rejected"
): Promise<Promotion> => {
  return await apiFetch(`/promotions/${promoId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

// --- Dashboard Stats ---
export const getStats = async (): Promise<{
  promotions: number;
  recruitments: number;
  staffs: number;
  applications: number;
}> => {
  const response = await apiFetch("/admin/recruitments/stats");
  return response.data;
};
