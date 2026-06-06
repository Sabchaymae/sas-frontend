# Oriotel ERP System - Frontend Documentation

## 🎯 Project Goal
The main objective of this project is to build a **SaaS-Based ERP System for Telecom Operations and Digital Transformation** for the company **Oriotel**. 

This platform aims to achieve full digital transformation by:
- Automating repetitive business processes.
- Providing an integrated communication system (real-time chat, bot suggestions).
- Offering full monitoring and control of company activities.
- Integrating AI-based solutions (e.g., OCR models to extract and classify document data).
- Implementing a detailed Role-Based Access Control (RBAC) system for precise permission management.
- Providing advanced dashboards with customized KPIs for data analysis and decision-making.

## 🌐 Reference Website
The company's presentation website (landing page) can be found here:
**[Oriotel Landing Page](https://site-vitrine-teal.vercel.app/)**

## 🎨 Color Palette
The application uses a premium, modern design system based on the following core color palette:

| Color Name | Hex Code | Preview | Usage |
| :--- | :--- | :--- | :--- |
| **Signal Blue** | `#1428C9` | ![#1428C9](https://via.placeholder.com/15/1428C9/000000?text=+) | Primary brand color, primary buttons, accents, active states |
| **Cloud White** | `#F9FAFB` | ![#F9FAFB](https://via.placeholder.com/15/F9FAFB/000000?text=+) | Backgrounds, text on dark elements, clean surfaces |
| **Midnight Slate** | `#111827` | ![#111827](https://via.placeholder.com/15/111827/000000?text=+) | Main text color, dark mode backgrounds, premium dark cards |

## 📂 Project Folder Structure
The source code follows a scalable feature-based architecture:

```text
src/
├── components/           # Reusable UI components
│   ├── common/           # Generic components (Input, Button, Alert)
│   └── layout/           # Layout components (Header, Footer, Wrappers)
├── features/             # Feature-based modules (e.g., auth)
│   └── auth/             # Authentication Module
│       ├── components/   # Auth-specific UI (LoginForm, RegisterForm, etc.)
│       ├── constants/    # Constants (Roles, API endpoints, Policies)
│       ├── hooks/        # Auth-specific custom hooks (useAuth)
│       ├── pages/        # Auth page views (LoginPage, TwoFactorPage, etc.)
│       ├── services/     # API Service layer (authService with mock data)
│       └── validators/   # Form validation schemas (Zod)
├── guards/               # Route guards (AuthGuard, GuestGuard, ForcePasswordGuard)
├── layouts/              # Main layout wrappers (AuthLayout)
├── store/                # Redux state management
│   ├── slices/           # Redux slices (authSlice)
│   └── store.js          # Main Redux store config
├── styles/               # Global stylesheets
│   ├── auth.css          # Premium auth module styles
│   ├── style.css         # Base styles
│   └── typography.css    # Typography utilities
├── utils/                # Helper functions & API interceptors
├── App.jsx               # Root routing component
├── i18n.js               # Internationalization
├── index.css             # Tailwind CSS entry
└── main.jsx              # React application entry point
```

## 🔐 Authentication Workflow
The Identity Service manages user access with different tailored flows.

### Roles Available
1. **Administrateur** (Admin)
2. **Utilisateur Interne** (Animateur, Assistant)
3. **Utilisateur Externe** (Agence, Opérateur)

### Auth Flows
- **Login:** Users log in using only their email and password.
- **2FA (Two-Factor Authentication):** Some users (like Admins) require an additional 6-digit code after a successful password check.
- **Force Password Change:** New accounts created by the Admin are flagged to force a password change upon their first login to ensure security.
- **Registration (Access Request):** Users cannot create active accounts directly. They submit a simplified registration request (name, email, phone, reason) that must be approved by the Admin.
- **Forgot Password:** Users can request a secure password reset link via their email.

## 🧪 Test Data (Mock Users)
Since the   is currently under development, the authentication uses a mocked service layer. Use the following credentials to test the different auth workflows:

| User Role | Email | Password | Workflow Triggered |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin@oriotel.com` | `Oriotel@2026` | Triggers **2FA** (Use code: `123456`) |
| **Interne** (Animateur) | `animateur@oriotel.com` | `Oriotel@2026` | Triggers **Force Password Change** |
| **Assistante** | `assistante@oriotel.com` | ` ` | Accès **Gestion des Souscriptions** |
| **Externe** (Agence) | `agence@oriotel.com` | `Oriotel@2026` | Standard Login (Direct to Dashboard) | 

> **Note:** For any 2FA prompts during testing, use the mock code: `123456`.





