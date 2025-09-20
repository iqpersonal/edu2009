import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  User, 
  School, 
  Student, 
  Assessment, 
  AIRecommendation, 
  AnalyticsOverview,
  PaginatedResponse 
} from '../types';

class ApiClient {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 responses by clearing token and redirecting to login
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/login', credentials);
    return response.data.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.get('/auth/me');
    return response.data.data.user;
  }

  async updatePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await this.api.put('/auth/password', data);
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  // School endpoints
  async getSchools(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<School>> {
    const response: AxiosResponse<ApiResponse<{ schools: School[]; pagination: any }>> = await this.api.get('/schools', { params });
    return {
      items: response.data.data.schools,
      pagination: response.data.data.pagination,
    };
  }

  async getSchool(id: string): Promise<School> {
    const response: AxiosResponse<ApiResponse<{ school: School }>> = await this.api.get(`/schools/${id}`);
    return response.data.data.school;
  }

  async createSchool(data: Partial<School>): Promise<School> {
    const response: AxiosResponse<ApiResponse<{ school: School }>> = await this.api.post('/schools', data);
    return response.data.data.school;
  }

  async updateSchool(id: string, data: Partial<School>): Promise<School> {
    const response: AxiosResponse<ApiResponse<{ school: School }>> = await this.api.put(`/schools/${id}`, data);
    return response.data.data.school;
  }

  async deleteSchool(id: string): Promise<void> {
    await this.api.delete(`/schools/${id}`);
  }

  // User endpoints
  async getUsers(params?: { page?: number; limit?: number; search?: string; role?: string; schoolId?: string }): Promise<PaginatedResponse<User>> {
    const response: AxiosResponse<ApiResponse<{ users: User[]; pagination: any }>> = await this.api.get('/users', { params });
    return {
      items: response.data.data.users,
      pagination: response.data.data.pagination,
    };
  }

  async getUser(id: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.get(`/users/${id}`);
    return response.data.data.user;
  }

  async createUser(data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.post('/users', data);
    return response.data.data.user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.put(`/users/${id}`, data);
    return response.data.data.user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // Student endpoints
  async getStudents(params?: { page?: number; limit?: number; search?: string; sectionId?: string }): Promise<PaginatedResponse<Student>> {
    const response: AxiosResponse<ApiResponse<{ students: Student[]; pagination: any }>> = await this.api.get('/students', { params });
    return {
      items: response.data.data.students,
      pagination: response.data.data.pagination,
    };
  }

  async getStudent(id: string): Promise<Student> {
    const response: AxiosResponse<ApiResponse<{ student: Student }>> = await this.api.get(`/students/${id}`);
    return response.data.data.student;
  }

  // Assessment endpoints
  async getAssessments(params?: { page?: number; limit?: number; subjectId?: string; term?: string; academicYearId?: string }): Promise<PaginatedResponse<Assessment>> {
    const response: AxiosResponse<ApiResponse<{ assessments: Assessment[]; pagination: any }>> = await this.api.get('/assessments', { params });
    return {
      items: response.data.data.assessments,
      pagination: response.data.data.pagination,
    };
  }

  // Analytics endpoints
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const response: AxiosResponse<ApiResponse<{ overview: AnalyticsOverview }>> = await this.api.get('/analytics/overview');
    return response.data.data.overview;
  }

  // AI endpoints
  async getAIRecommendations(params?: { page?: number; limit?: number; studentId?: string }): Promise<PaginatedResponse<AIRecommendation>> {
    const response: AxiosResponse<ApiResponse<{ recommendations: AIRecommendation[]; pagination: any }>> = await this.api.get('/ai/recommendations', { params });
    return {
      items: response.data.data.recommendations,
      pagination: response.data.data.pagination,
    };
  }

  async markRecommendationAsRead(id: string): Promise<void> {
    await this.api.patch(`/ai/${id}/mark-read`);
  }
}

export const apiClient = new ApiClient();