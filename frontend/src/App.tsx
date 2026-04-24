import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import DealsPage from "./pages/DealsPage";
import MerchantPage from "./pages/MerchantPage";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App(): JSX.Element {
  const { isAuthenticated } = useAuth();

  return (
    <div className="app-shell">
      {isAuthenticated ? <Navbar /> : null}
      <main>
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/deals" : "/login"} replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/deals" replace /> : <AuthPage />} />
          <Route
            path="/deals"
            element={
              <ProtectedRoute>
                <DealsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant"
            element={
              <ProtectedRoute>
                <MerchantPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/deals" : "/login"} replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
