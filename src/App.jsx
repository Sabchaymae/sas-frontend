
import { Routes, Route, Navigate } from 'react-router-dom'
<<<<<<< HEAD
import { Suspense, lazy } from 'react'

import RechargeCalculator from '@/pages/RechargeCalculator'

import GuestGuard from '@/guards/GuestGuard'
import AuthGuard from '@/guards/AuthGuard'
import { ProtectedRoute } from '@/guards/ProtectedRoute'
import Forbidden from '@/pages/Forbidden'

import DashboardLayout from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/Dashboard/DashboardPage'
import UsersPage from '@/pages/UsersPage'
import UserHistoryPage from '@/pages/UserHistoryPage'


import RolesPermissionsPage from '@/pages/RolesPermissions/RolesPermissionsPage'
import SubscriptionsPage from '@/pages/SubscriptionsPage'
import TaskManagement from '@/pages/Stock/components/TaskManagement'
import IncidentReporting from '@/pages/Stock/components/IncidentReporting'
import StockManagement from '@/pages/Stock/StockManagement'
import ProductCatalogue from '@/pages/Stock/ProductCatalogue'
import WorkTimeManagement from '@/pages/WorkTime/WorkTimeManagement'
import CommunicationPage from '@/pages/Communication/CommunicationPage'

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
=======

import RolesPermissionsPage from './pages/RolesPermissions/RolesPermissionsPage'
import RechargeCalculator from './pages/RechargeCalculator'
import DashboardPage from './pages/DashboardPage'

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
import ReactionToastContainer from './components/common/ReactionToast'
import ActionToastContainer from './components/common/ActionToast'

function App() {
  return (
    <>
      <ReactionToastContainer />
      <ActionToastContainer />
>>>>>>> import/master
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

<<<<<<< HEAD
        {/* Forbidden 403 Page */}
        <Route path="/403" element={<Forbidden />} />

=======
>>>>>>> import/master
        {/* Root redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }>
          <Route index element={<DashboardPage />} />
<<<<<<< HEAD
          <Route path="users" element={
            <ProtectedRoute module="Utilisateurs" action="Lecture">
              <UsersPage />
            </ProtectedRoute>
          } />
          <Route path="historique" element={
            <UserHistoryPage />
          } />
          <Route path="subscriptions" element={
            <ProtectedRoute module="Souscriptions" action="Lecture">
              <SubscriptionsPage />
            </ProtectedRoute>
          } />
          <Route path="tasks" element={
            <ProtectedRoute module="Tâches" action="Lecture">
              <TaskManagement />
            </ProtectedRoute>
          } />
          <Route path="incidents" element={
            <ProtectedRoute module="Incidents" action="Lecture">
              <IncidentReporting />
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
          <Route path="catalogue" element={
            <ProtectedRoute module="Stock" action="Lecture">
              <ProductCatalogue />
            </ProtectedRoute>
          } />
          <Route path="time" element={
            <ProtectedRoute module="Temps" action="Lecture">
              <WorkTimeManagement />
            </ProtectedRoute>
          } />
          <Route path="communication" element={
            <ProtectedRoute module="Communication" action="Lecture">
              <CommunicationPage />
            </ProtectedRoute>
          } />
=======
          <Route path="users" element={<UsersPage />} />
          <Route path="historique" element={<UserHistoryPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Paramètres</h1></div>} />
          <Route path="roles-permissions" element={<RolesPermissionsPage />} />
          <Route path="stock" element={<StockManagement />} />
          <Route path="time" element={<WorkTimeManagement />} />
          <Route path="communication" element={<CommunicationPage />} />
>>>>>>> import/master

        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
<<<<<<< HEAD
    </Suspense>
=======
    </>
>>>>>>> import/master

  )
}

export default App
