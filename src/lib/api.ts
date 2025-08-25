
import { users, recruitments, applications, promotions } from './data';
import type { User, Recruitment, Application, Promotion } from './types';

const API_BASE_URL = 'http://localhost:3001/api';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (!response.ok) {
        // We will throw an error to be caught by the caller, which will then use mock data.
        throw new Error(`API call failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`API call to ${endpoint} failed, falling back to mock data. Error:`, error);
    throw error; // Re-throw to signal fallback
  }
}

// --- Auth ---
export const login = async (email: string, password: string): Promise<User | null> => {
  try {
    return await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    const foundUser = users.find(u => u.email === email && u.password === password);
    return foundUser || null;
  }
};

// --- Users ---
export const fetchUsers = async (): Promise<User[]> => {
    try {
        return await apiFetch('/users');
    } catch (error) {
        return users;
    }
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
    try {
        return await apiFetch('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    } catch (error) {
        const newUser: User = {
            id: `user-${Date.now()}`,
            ...userData,
            status: 'active',
        } as User;
        users.push(newUser);
        return newUser;
    }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>): Promise<User> => {
    try {
        return await apiFetch(`/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify(userData),
        });
    } catch (error) {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...userData };
            return users[userIndex];
        }
        throw new Error("User not found in mock data");
    }
}


// --- Recruitments ---
export const fetchRecruitments = async (): Promise<Recruitment[]> => {
    try {
        return await apiFetch('/recruitments');
    } catch (error) {
        return recruitments;
    }
};

export const fetchRecruitmentById = async (id: string): Promise<{ recruitment: Recruitment, applications: Application[] }> => {
    try {
        return await apiFetch(`/recruitments/${id}`);
    } catch (error) {
        const recruitment = recruitments.find(r => r.id === id);
        if (!recruitment) throw new Error("Recruitment not found");
        const relevantApplications = applications.filter(a => a.recruitmentId === id);
        return { recruitment, applications: relevantApplications };
    }
};

export const createRecruitment = async (recruitmentData: Omit<Recruitment, 'id' | 'status'>): Promise<Recruitment> => {
    try {
        return await apiFetch('/recruitments', {
            method: 'POST',
            body: JSON.stringify(recruitmentData),
        });
    } catch (error) {
        const newRecruitment: Recruitment = {
            id: `rec-${Date.now()}`,
            status: 'open',
            ...recruitmentData,
        };
        recruitments.unshift(newRecruitment);
        return newRecruitment;
    }
};

// --- Applications ---
export const fetchApplications = async (): Promise<Application[]> => {
    try {
        return await apiFetch('/applications');
    } catch (error) {
        return applications;
    }
};

export const createApplication = async (applicationData: Omit<Application, 'id' | 'submittedDate' | 'status'>): Promise<Application> => {
    try {
        return await apiFetch('/applications', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    } catch (error) {
        const newApplication: Application = {
            id: `app-${Date.now()}`,
            submittedDate: new Date().toISOString(),
            status: 'pending',
            ...applicationData,
        };
        applications.push(newApplication);
        return newApplication;
    }
};

export const updateApplicationStatus = async (appId: string, status: Application['status']): Promise<Application> => {
    try {
        return await apiFetch(`/applications/${appId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    } catch (error) {
        const appIndex = applications.findIndex(a => a.id === appId);
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
        return await apiFetch('/promotions');
    } catch (error) {
        return promotions;
    }
};

export const fetchPromotionsByStaffId = async (staffId: string): Promise<Promotion[]> => {
    try {
        return await apiFetch(`/promotions/staff/${staffId}`);
    } catch (error) {
        return promotions.filter(p => p.staffId === staffId);
    }
};

export const fetchPromotionById = async (id: string): Promise<{ promotion: Promotion, staffMember: User }> => {
    try {
        return await apiFetch(`/promotions/${id}`);
    } catch (error) {
        const promotion = promotions.find(p => p.id === id);
        if (!promotion) throw new Error("Promotion not found");
        const staffMember = users.find(u => u.id === promotion.staffId);
        if (!staffMember) throw new Error("Staff member not found for promotion");
        return { promotion, staffMember };
    }
};

export const createPromotionRequest = async (requestData: Omit<Promotion, 'id' | 'requestDate' | 'status'>): Promise<Promotion> => {
    try {
        return await apiFetch('/promotions', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    } catch (error) {
        const newPromotion: Promotion = {
            id: `pro-${Date.now()}`,
            requestDate: new Date().toISOString(),
            status: 'pending',
            ...requestData
        };
        promotions.push(newPromotion);
        return newPromotion;
    }
};

export const updatePromotionStatus = async (promoId: string, status: 'approved' | 'rejected'): Promise<Promotion> => {
    try {
        return await apiFetch(`/promotions/${promoId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    } catch (error) {
        const promoIndex = promotions.findIndex(p => p.id === promoId);
        if (promoIndex > -1) {
            promotions[promoIndex].status = status;
            // In a real app, updating the user's designation would happen here too
            return promotions[promoIndex];
        }
        throw new Error("Promotion not found");
    }
};
