import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default API;

// Authentication
export const loginUser = (username, password) =>
    API.post("token/", { username, password });

// PDF
export const uploadPDF = (formData) =>
    API.post("upload_pdf/", formData);

export const getDocuments = () =>
    API.get("documents/");

export const deletePDF = (id) =>
    API.delete(`documents/${id}/`);

// Chat
export const askQuestion = (data) =>
    API.post("ask/", data);

export const createChat = (document_id) =>
    API.post("chat/new/", { document_id });


export const getChatSessions = (document_id) =>
    API.get(`chat-sessions/${document_id}/`);

export const getChatMessages = (sessionId) =>
    API.get(`chat/${sessionId}/`);