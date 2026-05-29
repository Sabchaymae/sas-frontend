
import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'

import RolesPermissionsPage from './pages/RolesPermissions/RolesPermissionsPage'
import RechargeCalculator from './pages/RechargeCalculator'

import GuestGuard from '@/guards/GuestGuard'
import AuthGuard from '@/guards/AuthGuard'
import ProtectedRoute from '@/guards/ProtectedRoute'
import Forbidden from './pages/Forbidden'

import DashboardLayout from './components/layout/DashboardLayout'
import UsersPage from './pages/UsersPage'
import UserHistoryPage from './pages/UserHistoryPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import StockManagement from './pages/Stock/StockManagement'
import WorkTimeManagement from './pages/WorkTime/WorkTimeManagement'


// Lazy-loaded auth pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const RegisterVerifyPage = lazy(() => import('@/pages/auth/RegisterVerifyPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ForcePasswordChangePage = lazy(() => import('@/pages/auth/ForcePasswordChangePage'))
const TwoFactorPage = lazy(() => import('@/pages/auth/TwoFactorPage'))

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen bg-slate-950">
    <div className="auth-loading-spinner">
      <div className="auth-loading-dot"></div>
      <div className="auth-loading-dot"></div>
      <div className="auth-loading-dot"></div>
    </div>
  </div>
)

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
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

        {/* Forbidden 403 Page */}
        <Route path="/403" element={<Forbidden />} />

        {/* Root redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }>
          <Route index element={<Navigate to="/dashboard/users" replace />} />
          <Route path="users" element={
            <ProtectedRoute module="Utilisateurs" action="Lecture">
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="historique" element={
            <ProtectedRoute module="Communication" action="Lecture">
              <UserHistoryPage />
            </ProtectedRoute>
          } />
          <Route path="subscriptions" element={
            <ProtectedRoute module="Souscriptions" action="Lecture">
              <SubscriptionsPage />
            </ProtectedRoute>
          } />
          <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Paramètres</h1></div>} />
          <Route path="roles-permissions" element={
            <ProtectedRoute module="Autorisation" action="Lecture">
              <RolesPermissionsPage />
            </ProtectedRoute>
          } />
          <Route path="stock" element={
            <ProtectedRoute module="Stock" action="Lecture">
              <StockManagement />
            </ProtectedRoute>
          } />
          <Route path="time" element={
            <ProtectedRoute module="Temps" action="Lecture">
              <WorkTimeManagement />
            </ProtectedRoute>
          } />

        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>

  )
}

export default App
