import "@/App.css";
import FullscreenLoader from "@/components/FullscreenLoader";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

function Protected({ children }) {
  const { user } = useAuth();
  if (user === undefined)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-16 w-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (user === null) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user === undefined)
    return <FullscreenLoader />; 
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div className="App grain">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <Login />
                </PublicOnly>
              }
            />
            <Route
              path="/"
              element={
                <Protected>
                  <Dashboard />
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;
