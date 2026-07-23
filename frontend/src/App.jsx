import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { RoleRoute } from './routes/RoleRoute'
import { LoginPage } from './pages/LoginPage'
import { FuncionarioHomePage } from './pages/FuncionarioHomePage'
import { SolicitudFormPage } from './pages/SolicitudFormPage'
import { SolicitudDetailPage } from './pages/SolicitudDetailPage'
import { SolicitudEditarPage } from './pages/SolicitudEditarPage'
import { LoteDetallePage } from './pages/LoteDetallePage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminSolicitudDetailPage } from './pages/AdminSolicitudDetailPage'
import { AdminLoteDetallePage } from './pages/AdminLoteDetallePage'
import { AdminUsuariosPage } from './pages/AdminUsuariosPage'

function InicioSegunRol() {
  const { usuario } = useAuth()
  return usuario.rol === 'admin' ? (
    <Navigate to="/admin" replace />
  ) : (
    <FuncionarioHomePage />
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<InicioSegunRol />} />
        <Route path="/solicitudes/nueva" element={<SolicitudFormPage />} />
        <Route path="/solicitudes/lote/:loteId" element={<LoteDetallePage />} />
        <Route path="/solicitudes/:id" element={<SolicitudDetailPage />} />
        <Route
          path="/solicitudes/:id/editar"
          element={<SolicitudEditarPage />}
        />

        <Route element={<RoleRoute rol="admin" />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route
            path="/admin/solicitudes/lote/:loteId"
            element={<AdminLoteDetallePage />}
          />
          <Route
            path="/admin/solicitudes/:id"
            element={<AdminSolicitudDetailPage />}
          />
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
