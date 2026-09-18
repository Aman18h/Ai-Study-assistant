import { useState, useEffect, useRef } from "react";
import {
  loginUser,
  uploadPDF,
  askQuestion,
  getDocuments,
  deletePDF,
  createChat,
  getChatSessions,
  getChatMessages,
} from "./services/api";
import MainLayout from "./components/layout/MainLayout";
import LeftSidebar from "./components/layout/LeftSidebar";
import ChatSidebar from "./components/layout/ChatSidebar";
import ChatWindow from "./components/chat/ChatWindow";
import SummaryPanel from "./components/pdf/SummaryPanel";
import Login from "./components/auth/Login";

function App() {
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem("access"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchDocuments = async () => {
    try {
      const response = await getDocuments();
      setDocuments(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isAuthed) fetchDocuments();
  }, [isAuthed]);

  const login = async () => {
    setLoginError("");
    try {
      const response = await loginUser(username, password);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      setIsAuthed(true);
    } catch (error) {
      setLoginError(
        error.response?.data?.error || "Invalid username or password."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsAuthed(false);
    setSelectedDocument(null);
    setSelectedSession(null);
    setMessages([]);
    setDocuments([]);
    setSessions([]);
  };

  const handleUploadPDF = async (chosenFile) => {
    const pdfFile = chosenFile || file;
    if (!pdfFile) return;

    const formData = new FormData();
    formData.append("pdf", pdfFile);

    try {
      setUploading(true);
      const response = await uploadPDF(formData);
      setText(response.data.summary);
      await fetchDocuments();
      setSelectedDocument({
        id: response.data.document_id,
        title: response.data.title,
      });
      setSessions([]);
      setSelectedSession(null);
      setMessages([]);
    } catch (error) {
      console.error(error);
      alert("Upload failed. Please try a different PDF.");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  const handleAskQuestion = async () => {
    if (!selectedDocument || !selectedSession || !question.trim()) return;

    const askedQuestion = question;
    setQuestion("");

    try {
      setLoading(true);
      const response = await askQuestion({
        question: askedQuestion,
        document_id: selectedDocument.id,
        session_id: selectedSession.id,
      });

      setMessages((prev) => [
        ...prev,
        { role: "user", text: askedQuestion },
        { role: "assistant", text: response.data.answer },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "user", text: askedQuestion },
        {
          role: "assistant",
          text: "Sorry, something went wrong answering that. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async (documentId) => {
    try {
      const response = await getChatSessions(documentId);
      setSessions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectDocument = (doc) => {
    setSelectedDocument(doc);
    setSelectedSession(null);
    setMessages([]);
    setText(doc.summary || "");
    fetchSessions(doc.id);
  };

  const handleCreateChat = async () => {
    if (!selectedDocument) return;

    try {
      const response = await createChat(selectedDocument.id);
      await fetchSessions(selectedDocument.id);
      setSelectedSession({
        id: response.data.session_id,
        title: response.data.title,
      });
      setMessages([]);
    } catch (error) {
      console.log(error);
    }
  };

  const loadChat = async (session) => {
    try {
      setSelectedSession(session);
      const response = await getChatMessages(session.id);

      const formatted = [];
      response.data.forEach((msg) => {
        formatted.push({ role: "user", text: msg.question });
        formatted.push({ role: "assistant", text: msg.answer });
      });

      setMessages(formatted);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteDocument = async (id) => {
    const confirmDelete = window.confirm("Delete this PDF?");
    if (!confirmDelete) return;

    try {
      await deletePDF(id);
      if (selectedDocument?.id === id) {
        setSelectedDocument(null);
        setSelectedSession(null);
        setMessages([]);
        setSessions([]);
      }
      fetchDocuments();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAuthed) {
    return (
      <Login
        username={username}
        password={password}
        setUsername={setUsername}
        setPassword={setPassword}
        onLogin={login}
        error={loginError}
      />
    );
  }

  return (
    <MainLayout
      leftSidebar={
        <LeftSidebar
          documents={documents}
          selectedDocument={selectedDocument}
          setSelectedDocument={handleSelectDocument}
          deleteDocument={deleteDocument}
          onFileChosen={handleUploadPDF}
          uploading={uploading}
          onLogout={logout}
        />
      }
      chatSidebar={
        <ChatSidebar
          sessions={sessions}
          selectedSession={selectedSession}
          loadChat={loadChat}
          handleCreateChat={handleCreateChat}
          selectedDocument={selectedDocument}
        />
      }
    >
      <div className="relative flex-1 overflow-hidden">
        <ChatWindow
          question={question}
          setQuestion={setQuestion}
          handleAskQuestion={handleAskQuestion}
          loading={loading}
          messages={messages}
          chatEndRef={chatEndRef}
          selectedDocument={selectedDocument}
          selectedSession={selectedSession}
          documentTitle={selectedDocument?.title}
          onToggleSummary={() => setSummaryOpen(true)}
        />
        <SummaryPanel
          text={text}
          open={summaryOpen}
          onClose={() => setSummaryOpen(false)}
        />
      </div>
    </MainLayout>
  );
}

export default App;
