# SkillGap-AI Frontend

A modern React application built with Vite for conducting AI-powered interviews and generating comprehensive interview reports.

## 📋 Overview

SkillGap-AI Frontend is the user-facing component of the SkillGap-AI platform, providing an intuitive interface for:
- User authentication (registration & login)
- AI-powered interview management
- Real-time interview report generation
- User dashboard and profile management

## 🚀 Tech Stack

- **React 18** - UI library
- **Vite** - Lightning-fast build tool
- **SCSS** - Styling (with modular component styling)
- **React Router** - Client-side routing
- **ESLint** - Code quality enforcement

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```
   VITE_API_URL=http://localhost:5000
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── assets/           # Static assets (images, icons, etc.)
├── features/         # Feature-specific modules
│   ├── ai/          # AI interview features
│   │   └── ...
│   └── auth/        # Authentication module
│       ├── AuthContext.jsx       # Auth state management
│       ├── components/
│       │   └── Protected.jsx     # Protected route wrapper
│       ├── hooks/
│       │   └── useAuth.js        # Auth custom hook
│       ├── pages/                # Auth pages
│       │   ├── Dashboard.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── services/
│       │   └── auth.api.js       # API calls for auth
│       ├── style/                # Auth-specific styles
│       │   └── button.scss
│       └── interview/
│           ├── pages/
│           │   └── Home.jsx
│           └── services/
├── App.jsx           # Main App component
├── app.routes.jsx    # Route configuration
├── main.jsx          # Application entry point
└── style.scss        # Global styles
```

## ✨ Features

- **🔐 Secure Authentication** - User registration and login with JWT tokens
- **🤖 AI Interviews** - Conduct interactive interviews powered by AI
- **📊 Report Generation** - Automatic creation of detailed interview reports
- **🎨 Responsive Design** - Mobile-friendly UI with SCSS styling
- **⚡ Fast Performance** - Optimized with Vite for rapid development and production builds
- **🛡️ Protected Routes** - Secure routes that require authentication

## 🔧 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint to check code quality |
| `npm run preview` | Preview production build locally |

## 🔌 API Integration

The frontend communicates with the backend API for:
- User authentication
- Interview management
- Report generation

Backend API documentation: See the backend README for API endpoints and specifications.

## 🎨 Styling

The project uses SCSS for modular, maintainable styling:
- Global styles in `style.scss`
- Component-specific styles (e.g., `auth.form.scss`, `home.scss`)
- Shared utilities in `style/` directories

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes following the project structure
3. Test your changes with `npm run dev`
4. Ensure ESLint passes with `npm run lint`
5. Submit a pull request

## 📝 Code Quality

This project uses ESLint to maintain code quality. Configuration can be found in `eslint.config.js`.

Run linting:
```bash
npm run lint
```

## 🚦 Development Workflow

1. **Start the backend** - Ensure the Node.js backend is running on port 5000
2. **Start the frontend** - Run `npm run dev` to start the development server
3. **Make changes** - Edit files and see live updates via HMR (Hot Module Replacement)
4. **Test** - Verify changes work correctly in the browser

## 📱 Browser Support

Modern browsers with ES2020+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)