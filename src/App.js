import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

function Protected({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <div className="min-h-screen flex items-center justify-center text-neutral-600 text-sm">—</div>;
  if (user === null) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <div className="min-h-screen flex items-center justify-center text-neutral-600 text-sm">—</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div className="App grain">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default App;
