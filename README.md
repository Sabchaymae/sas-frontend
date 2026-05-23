# Front-Office (Frontend Architecture)

## 📌 Project Overview
This project is the frontend for the **Front-Office** application, built using a modern React stack. It provides a fast, scalable, and maintainable architecture tailored for a seamless user experience.

## 🛠️ Tech Stack
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + React-Redux
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Internationalization (i18n)**: [i18next](https://www.i18next.com/) & React-i18next
- **Utility Libraries**: `clsx`, `tailwind-merge` (for dynamic class merging)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting**: ESLint

## 📂 Folder Structure
The source code is organized inside the `src/` directory following a modular and feature-based approach:

```text
src/
├── components/       # Reusable UI components
│   ├── common/       # Generic components (e.g., Buttons, Skeletons)
│   └── layout/       # Layout components (e.g., Header, Footer, Wrappers)
├── constants/        # Application-wide static data and configurations
├── hooks/            # Custom React hooks (e.g., useInView)
├── pages/            # Page-level components corresponding to routes
├── store/            # Redux store configuration and slices
├── styles/           # Global stylesheets and CSS variables
├── utils/            # Helper functions and API clients (e.g., api.js)
├── App.jsx           # Root component (Routing and global providers)
├── i18n.js           # Internationalization configuration
├── index.css         # Main Tailwind CSS entry point
└── main.jsx          # React application entry point
```

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd front-office
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173/` by default.

### Build for Production
To generate a production-ready build:
```bash
npm run build
```
The optimized files will be output to the `dist/` directory. You can preview the production build using:
```bash
npm run preview
```

## 🌍 Internationalization (i18n)
The project is configured with `i18next` for multiple language support. Translations are managed via the `i18n.js` setup. It uses browser language detection and HTTP backend for loading translation files.

## 🎨 Styling Convention
- The project leverages **Tailwind CSS** for rapid and consistent styling.
- Utility classes are dynamically merged using `clsx` and `tailwind-merge` to resolve conflicts when extending component styles.