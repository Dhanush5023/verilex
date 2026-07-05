import axios from 'axios'

export const API_BASE_URL = import.meta.env.PROD 
  ? 'https://verilex-7lhs.onrender.com/api/v1' 
  : '/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// ─── Documents ────────────────────────────────────────────────────────────
export const documentsApi = {
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  list: () => api.get('/documents/'),
  get: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
}

// ─── Chat ─────────────────────────────────────────────────────────────────
export const chatApi = {
  createSession: (sessionType = 'general', documentId = null) =>
    api.post('/chat/sessions', null, {
      params: { session_type: sessionType, document_id: documentId },
    }),
  listSessions: () => api.get('/chat/sessions'),
  getSession: (id) => api.get(`/chat/sessions/${id}`),
  ask: (sessionId, question) =>
    api.post(`/chat/sessions/${sessionId}/ask`, { question }),
  deleteSession: (id) => api.delete(`/chat/sessions/${id}`),
}

// ─── Complaints ───────────────────────────────────────────────────────────
export const complaintsApi = {
  draft: (data) => api.post('/complaints/draft', data),
  list: () => api.get('/complaints/'),
  get: (id) => api.get(`/complaints/${id}`),
}

// ─── Scam Detector ────────────────────────────────────────────────────────
export const scamApi = {
  analyze: (data) => api.post('/scam-check/analyze', data),
  history: () => api.get('/scam-check/history'),
  get: (id) => api.get(`/scam-check/${id}`),
}

// ─── AI Legal Agent ─────────────────────────────────────────────────────────
export const agentApi = {
  run: (docId) => api.post(`/agent/run/${docId}`),
  downloadReportUrl: (docId) => `/api/v1/agent/download/${docId}`,
}

