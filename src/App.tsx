import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import PrivateLayout from "./components/layouts/PrivateLayout";
import PublicLayout from "./components/layouts/PublicLayout";

const SummaryPage = lazy(() => import("./pages/SummaryPage"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="cadastro" element={<RegisterPage />} />
        </Route>

        <Route element={<PrivateLayout />}>
          <Route path="/" element={<Navigate to="/summary" replace />} />
          <Route path="/dashboard" element={<Navigate to="/summary" replace />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route
            path="/transactions"
            element={
              <ComingSoonPage
                title="Transações"
                description="Acompanhe e organize todos os seus movimentos em um só lugar."
              />
            }
          />
          <Route
            path="/profile"
            element={
              <ComingSoonPage
                title="Perfil"
                description="As configurações da sua conta estarão disponíveis em breve."
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
