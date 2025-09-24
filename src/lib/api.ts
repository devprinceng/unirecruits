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
  return response.data;
};

export const createAdminRecruitment = async (
  recruitmentData: Omit<Recruitment, "id" | "status">
): Promise<Recruitment> => {
  const response = await apiFetch("/admin/recruitments", {
    method: "POST",
    body: JSON.stringify(recruitmentData),
  });
  return response.data;
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
  return await apiFetch(`/admin/applications/${appId}`, {
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
  const response = await apiFetch(`/admin/promotions/${id}`);
  const promotionData = response.data || response;

  // Create a mock staff member from the promotion data since API doesn't return separate staffMember
  const staffMember: User = {
    id: promotionData.staffId,
    firstName: promotionData.staffName?.split(" ")[0] || "",
    lastName: promotionData.staffName?.split(" ")[1] || "",
    email: `${promotionData.staffName
      ?.toLowerCase()
      .replace(" ", ".")}@university.edu`,
    role: "staff",
    department: promotionData.currentPosition,
    currentLevel: promotionData.currentPosition,
    dateOfEmployment: new Date().toISOString(),
    createdAt: promotionData.createdAt,
    updatedAt: promotionData.updatedAt,
  };

  return {
    promotion: promotionData,
    staffMember: staffMember,
  };
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
  return await apiFetch(`/admin/promotions/${promoId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

// --- Admin Operations ---

// Admin Staff Management
export const fetchAdminStaffs = async (): Promise<User[]> => {
  const response = await apiFetch("/admin/staffs");
  return response.data;
};

export const fetchAdminStaffById = async (id: string): Promise<User> => {
  const response = await apiFetch(`/admin/staffs/${id}`);
  return response.data;
};

export const updateAdminStaff = async (
  id: string,
  userData: Partial<User>
): Promise<User> => {
  const response = await apiFetch(`/admin/staffs/${id}`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
  return response.data;
};

export const deleteAdminStaff = async (id: string): Promise<void> => {
  await apiFetch(`/admin/staffs/${id}`, {
    method: "DELETE",
  });
};

// Admin Application Management
export const fetchAdminApplications = async (): Promise<Application[]> => {
  const response = await apiFetch("/admin/applications");
  return response.data;
};

export const fetchAdminApplicationById = async (
  id: string
): Promise<Application> => {
  const response = await apiFetch(`/admin/applications/${id}`);
  return response.data;
};

export const updateAdminApplication = async (
  id: string,
  applicationData: Partial<Application>
): Promise<Application> => {
  const response = await apiFetch(`/admin/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(applicationData),
  });
  return response.data;
};

export const deleteAdminApplication = async (id: string): Promise<void> => {
  await apiFetch(`/admin/applications/${id}`, {
    method: "DELETE",
  });
};

// Admin Promotion Management
export const fetchAdminPromotions = async (): Promise<Promotion[]> => {
  const response = await apiFetch("/admin/promotions");
  return response.data;
};

export const fetchAdminPromotionById = async (
  id: string
): Promise<Promotion> => {
  const response = await apiFetch(`/admin/promotions/${id}`);
  return response.data;
};

export const updateAdminPromotion = async (
  id: string,
  promotionData: Partial<Promotion>
): Promise<Promotion> => {
  const response = await apiFetch(`/admin/promotions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(promotionData),
  });
  return response.data;
};

export const deleteAdminPromotion = async (id: string): Promise<void> => {
  await apiFetch(`/admin/promotions/${id}`, {
    method: "DELETE",
  });
};

// Admin Recruitment Management
export const fetchAdminRecruitments = async (): Promise<Recruitment[]> => {
  const response = await apiFetch("/admin/recruitments");
  return response.data;
};

export const updateAdminRecruitment = async (
  id: string,
  recruitmentData: Partial<Recruitment>
): Promise<Recruitment> => {
  const response = await apiFetch(`/admin/recruitments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(recruitmentData),
  });
  return response.data;
};

export const deleteAdminRecruitment = async (id: string): Promise<void> => {
  await apiFetch(`/admin/recruitments/${id}`, {
    method: "DELETE",
  });
};

// --- User Registration & Authentication ---
export const registerUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}): Promise<{ user: User; token: string }> => {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  return response.data;
};

// --- User Dashboard Operations ---
export const fetchUserApplications = async (): Promise<Application[]> => {
  const response = await apiFetch("/applications/user/my-applications");
  return response.data;
};

// User profile management
export const updateUser = async (
  userId: string,
  userData: Partial<User>
): Promise<User> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Find and update user in mock data
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }

  const updatedUser = { ...users[userIndex], ...userData };
  users[userIndex] = updatedUser;

  return updatedUser;
};

export const fetchUserApplicationById = async (
  id: string
): Promise<Application> => {
  const response = await apiFetch(`/applications/${id}`);
  return response.data;
};

export const updateUserApplication = async (
  id: string,
  applicationData: Partial<Application>
): Promise<Application> => {
  const response = await apiFetch(`/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify(applicationData),
  });
  return response.data;
};

export const deleteUserApplication = async (id: string): Promise<void> => {
  await apiFetch(`/applications/${id}`, {
    method: "DELETE",
  });
};

// --- Additional Admin Recruitment Applications ---
export const fetchAdminRecruitmentApplications = async (
  recruitmentId: string
): Promise<Application[]> => {
  const response = await apiFetch(
    `/admin/recruitments/${recruitmentId}/applications`
  );
  return response.data;
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
