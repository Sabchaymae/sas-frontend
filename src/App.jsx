
import { Routes, Route, Navigate } from 'react-router-dom'

import RolesPermissionsPage from './pages/RolesPermissions/RolesPermissionsPage'
import RechargeCalculator from './pages/RechargeCalculator'

import GuestGuard from '@/guards/GuestGuard'
import AuthGuard from '@/guards/AuthGuard'

import DashboardLayout from './components/layout/DashboardLayout'
import UsersPage from './pages/UsersPage'
import UserHistoryPage from './pages/UserHistoryPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import StockManagement from './pages/Stock/StockManagement'
import WorkTimeManagement from './pages/WorkTime/WorkTimeManagement'

import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import RegisterVerifyPage from '@/pages/auth/RegisterVerifyPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ForcePasswordChangePage from '@/pages/auth/ForcePasswordChangePage'
import TwoFactorPage from '@/pages/auth/TwoFactorPage'
import CommunicationPage from './pages/Communication/CommunicationPage'

function App() {
  return (
      <Routes>
        {/* Auth routes (Guest only) */}
        <Route path="/login" element={
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        } />
        <Route path="/register" element={
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        } />
        <Route path="/register/verify" element={
          <GuestGuard>
            <RegisterVerifyPage />
          </GuestGuard>
        } />
        <Route path="/forgot-password" element={
          <GuestGuard>
            <ForgotPasswordPage />
          </GuestGuard>
        } />

        {/* Auth flow routes (2FA & password change) */}
        <Route path="/auth/2fa" element={<TwoFactorPage />} />
        <Route path="/auth/change-password" element={<ForcePasswordChangePage />} />

        {/* Public standalone tools */}
        <Route path="/recharge-calculator" element={<RechargeCalculator />} />

        {/* Root redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }>
          <Route index element={<Navigate to="/dashboard/users" replace />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="historique" element={<UserHistoryPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Paramètres</h1></div>} />
          <Route path="roles-permissions" element={<RolesPermissionsPage />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="time" element={<WorkTimeManagement />} />
          <Route path="communication" element={<CommunicationPage />} />

        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

  )
}

export default App
