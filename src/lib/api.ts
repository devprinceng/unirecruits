import { log } from "console";
import { users, recruitments, applications, promotions } from "./data";
import type { User, Recruitment, Application, Promotion } from "./types";

const API_BASE_URL = "http://localhost:3005/api";

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const token = sessionStorage.getItem("unirecruits_token");

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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
    throw error; // so caller can decide whether to use mock data
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
    // fallback for mock users (dev mode)
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );
    if (foundUser) {
      return {
        user: foundUser,
        token: "mock-token", // generate a fake token for local testing
      };
    }
    return null;
  }
};

// --- Users ---
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await apiFetch("/staffs");
    const users = response.data;

    return users;
  } catch (error) {
    return users;
  }
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  try {
    return await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  } catch (error) {
    const newUser: User = {
      id: `user-${Date.now()}`,
      ...userData,
      status: "active",
    } as User;
    users.push(newUser);
    return newUser;
  }
};

export const updateUserProfile = async (
  userId: string,
  userData: Partial<User>
): Promise<User> => {
  try {
    return await apiFetch(`/staffs/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  } catch (error) {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex > -1) {
      users[userIndex] = { ...users[userIndex], ...userData };
      return users[userIndex];
    }
    throw new Error("User not found in mock data");
  }
};

// --- Recruitments ---
export const fetchRecruitments = async (): Promise<Recruitment[]> => {
  try {
    const response = await apiFetch("/recruitments");

    return response.data;
  } catch (error) {
    return recruitments;
  }
};

export const fetchRecruitmentById = async (id: string): Promise<any> => {
  try {
    const recruitment = await apiFetch(`/recruitments/${id}`);
    console.log("recruitment: ", recruitment.data);
    return recruitment.data;
  } catch (error) {
    const recruitment = recruitments.find((r) => r.id === id);
    if (!recruitment) throw new Error("Recruitment not found");
    const relevantApplications = applications.filter(
      (a) => a.recruitmentId === id
    );
    return { recruitment, applications: relevantApplications };
  }
};

export const fetchRecruitmentApplications = async (
  id: string
): Promise<any> => {
  try {
    const applications = await apiFetch(
      `/admin/recruitments/${id}/applications`
    );
    return applications.data;
  } catch (error) {
    if (!applications)
      throw new Error("applications are not found for this recruitment offer");
  }
};

export const createRecruitment = async (
  recruitmentData: Omit<Recruitment, "id" | "status">
): Promise<Recruitment> => {
  try {
    return await apiFetch("/recruitments", {
      method: "POST",
      body: JSON.stringify(recruitmentData),
    });
  } catch (error) {
    const newRecruitment: Recruitment = {
      id: `rec-${Date.now()}`,
      status: "open",
      ...recruitmentData,
    };
    recruitments.unshift(newRecruitment);
    return newRecruitment;
  }
};

// --- Applications ---
export const fetchApplications = async (): Promise<Application[]> => {
  try {
    const applications = await apiFetch("/applications");
    console.log("recruitment data", applications.data.recruitment);
    return applications.data;
  } catch (error) {
    return applications;
  }
};

export const createApplication = async (
  applicationData: Omit<Application, "id" | "submittedDate" | "status">
): Promise<Application> => {
  try {
    return await apiFetch("/applications", {
      method: "POST",
      body: JSON.stringify(applicationData),
    });
  } catch (error) {
    const newApplication: Application = {
      id: `app-${Date.now()}`,
      submittedDate: new Date().toISOString(),
      status: "pending",
      ...applicationData,
    };
    applications.push(newApplication);
    return newApplication;
  }
};

export const updateApplicationStatus = async (
  appId: string,
  status: Application["status"]
): Promise<Application> => {
  try {
    return await apiFetch(`/applications/${appId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    const appIndex = applications.findIndex((a) => a.id === appId);
    if (appIndex > -1) {
      applications[appIndex].status = status;
      return applications[appIndex];
    }
    throw new Error("Application not found");
  }
};

// --- Promotions ---
export const fetchPromotions = async (): Promise<Promotion[]> => {
  try {
    const response = await apiFetch("/promotions");
    return response.data;
  } catch (error) {
    return promotions;
  }
};

export const fetchPromotionsByStaffId = async (
  staffId: string
): Promise<Promotion[]> => {
  try {
    const response = await apiFetch(`/promotions/staff/${staffId}`);
    const promotions = response.data;

    return promotions;
  } catch (error) {
    return promotions.filter((p) => p.staffId === staffId);
  }
};

export const fetchPromotionById = async (
  id: string
): Promise<{ promotion: Promotion; staffMember: User }> => {
  try {
    const promotions = await apiFetch(`/promotions/${id}`);
    console.log(promotions);
    return promotions;
  } catch (error) {
    const promotion = promotions.find((p) => p.id === id);
    if (!promotion) throw new Error("Promotion not found");
    const staffMember = users.find((u) => u.id === promotion.staffId);
    if (!staffMember) throw new Error("Staff member not found for promotion");
    return { promotion, staffMember };
  }
};

export const createPromotionRequest = async (
  requestData: Omit<Promotion, "id" | "requestDate" | "status">
): Promise<any> => {
  try {
    const token = sessionStorage.getItem("unirecruits_token");

    return await apiFetch("/promotions", {
      method: "POST",
      body: JSON.stringify(requestData),
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    const newPromotion: Promotion = {
      id: `pro-${Date.now()}`,
      requestDate: new Date().toISOString(),
      status: "pending",
      ...requestData,
    };
    promotions.push(newPromotion);
    return newPromotion;
  }
};

export const updatePromotionStatus = async (
  promoId: string,
  status: "approved" | "rejected"
): Promise<Promotion> => {
  try {
    return await apiFetch(`/promotions/${promoId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    const promoIndex = promotions.findIndex((p) => p.id === promoId);
    if (promoIndex > -1) {
      promotions[promoIndex].status = status;
      // In a real app, updating the user's designation would happen here too
      return promotions[promoIndex];
    }
    throw new Error("Promotion not found");
  }
};
