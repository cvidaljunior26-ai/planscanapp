import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Stores from "@/pages/Stores";
import Equipment from "@/pages/Equipment";
import Planogram from "@/pages/Planogram";
import FieldConfig from "@/pages/FieldConfig";
import History from "@/pages/History";
import Gallery from "@/pages/Gallery";
import Reports from "@/pages/Reports";
import Superadmin from "@/pages/Superadmin";
import PromoterScan from "@/pages/PromoterScan";
import PromoterForm from "@/pages/PromoterForm";
import PromoterSuccess from "@/pages/PromoterSuccess";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function SuperadminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, role } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "superadmin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/scan/:qrToken" element={<PromoterScan />} />
        <Route path="/scan/:qrToken/form" element={<PromoterForm />} />
        <Route path="/scan/:qrToken/success" element={<PromoterSuccess />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/stores" element={<PrivateRoute><Stores /></PrivateRoute>} />
        <Route path="/stores/:storeId/equipment" element={<PrivateRoute><Equipment /></PrivateRoute>} />
        <Route path="/equipment/:equipmentId/planogram" element={<PrivateRoute><Planogram /></PrivateRoute>} />
        <Route path="/config" element={<PrivateRoute><FieldConfig /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/superadmin" element={<SuperadminRoute><Superadmin /></SuperadminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
