# Qwizza - Interactive Quiz Game Platform

A modern, multiplayer quiz game application built with React, TypeScript, and real-time WebSocket communication. Players join games with PIN codes and compete in live quiz competitions while hosts manage and monitor multiple game sessions.

## Features

### 🎮 Player Experience
- **PIN-based Game Joining** - Simple access with 4-6 digit game PINs
- **Real-time Gameplay** - Live quiz questions with instant feedback
- **Interactive Answer Selection** - Multiple choice and input responses
- **Results Dashboard** - Scoreboard and performance analytics
- **Smooth Animations** - Framer Motion-powered UI transitions

### 🎯 Host Management
- **Host Dashboard** - Manage all active and past quiz sessions
- **Game Creation & Control** - Create custom quiz games with PIN protection
- **Real-time Monitoring** - Track player scores and progress live
- **Secure Authentication** - Login and signup for host accounts
- **Session Management** - Monitor multiple concurrent games

### 🎨 Design & UX
- **Bauhaus-inspired Components** - Bold, grid-based visual design
- **Dark Mode Support** - Theme switching with next-themes
- **Fully Responsive** - Optimized for desktop, tablet, and mobile
- **Accessible UI** - Built with Radix UI primitives
- **Custom Styling** - Tailwind CSS with custom components

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side navigation
- **Tailwind CSS** - Utility-first styling

### UI & Animations
- **Shadcn/UI** - High-quality component library
- **Radix UI** - Unstyled, composable components
- **Framer Motion** - Advanced animations
- **Lucide React** - Icon library

### State & Data
- **React Query** - Server state management
- **React Hook Form** - Efficient form handling
- **Zod** - TypeScript-first schema validation
- **Socket.io** - Real-time communication

### Development
- **Vitest** - Fast unit testing framework
- **Playwright** - E2E testing
- **ESLint** - Code quality
- **TypeScript & Prettier** - Code formatting

## Project Structure

```
src/
├── pages/                    # Route pages
│   ├── Index.tsx            # Landing page
│   ├── JoinGame.tsx         # Player game join
│   ├── host/                # Host management pages
│   │   ├── HostLogin.tsx
│   │   ├── HostSignup.tsx
│   │   ├── HostDashboard.tsx
│   │   └── HostGame.tsx
│   └── player/              # Player game pages
│       ├── PlayerLobby.tsx
│       ├── PlayerGame.tsx
│       └── PlayerResults.tsx
├── components/              # React components
│   ├── AnswerBlock.tsx      # Question answer UI
│   ├── BauhausButton.tsx    # Custom button component
│   ├── PinInput.tsx         # PIN entry component
│   ├── NavLink.tsx          # Navigation
│   └── ui/                  # Shadcn/UI components
├── hooks/                   # Custom React hooks
│   ├── useSocket.ts         # WebSocket communication
│   ├── useJazzMusic.ts      # Music management
│   ├── use-mobile.tsx       # Responsive utilities
│   └── use-toast.ts         # Toast notifications
├── lib/                     # Utilities
│   ├── api.ts               # API calls
│   └── utils.ts             # Helper functions
├── App.tsx                  # Main app component
└── main.tsx                 # Entry point
```

## Getting Started

### Prerequisites
- **Node.js** 18+ (or Bun for faster package management)
- **npm**, **yarn**, or **bun** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quiz-masters-hub
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

### Build for Production

```bash
bun run build
# or
npm run build
```

Preview production build:
```bash
npm run preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `dev` | Start development server with hot reload |
| `build` | Build optimized production bundle |
| `build:dev` | Build in development mode |
| `lint` | Run ESLint to check code quality |
| `preview` | Preview production build locally |
| `test` | Run tests once |
| `test:watch` | Run tests in watch mode |

## Game Flow

### For Players
1. Navigate to landing page
2. Click "Join Game"
3. Enter 4-6 digit PIN to join an active game
4. Wait in lobby for host to start quiz
5. Answer quiz questions in real-time
6. View results and final rankings

### For Hosts
1. Sign up or log in to host account
2. Create a new quiz game
3. Share generated PIN with players
4. Monitor player joins in real-time
5. Start the quiz when ready
6. Track scores and progress live
7. Review results after game completion

## Configuration

### Tailwind CSS
Customization available in `tailwind.config.ts`

### Vite
Configuration in `vite.config.ts` with React SWC plugin for fast builds

### TypeScript
Base configuration in `tsconfig.json` with app-specific settings in `tsconfig.app.json`

## Styling Guide

- **Colors**: Configured in Tailwind theme
- **Fonts**: Support for custom font families
- **Components**: Shadcn/UI with Bauhaus design language
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first Tailwind breakpoints

## Testing

Run unit tests:
```bash
npm run test
```

Watch mode for development:
```bash
npm run test:watch
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please:
1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Open a Pull Request

## License

This project is part of the Quiz Masters Hub initiative.

## Support

For issues and questions, please open an issue in the repository or contact the development team.
