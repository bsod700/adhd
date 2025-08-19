# ADHD Dashboard

A comprehensive SaaS productivity dashboard designed specifically for ADHD users, built with Angular 20, NestJS, and modern TypeScript.

## 🚀 Quick Start (< 120 seconds)

### Prerequisites
- Node.js 20.x or higher
- pnpm 8.x or higher

### Development Setup

```bash
# 1. Clone and install dependencies (30s)
git clone <repository-url>
cd adhd-dashboard
pnpm install

# 2. Start development servers (20s)
pnpm dev          # Frontend (http://localhost:4200)
pnpm dev:backend  # Backend API (http://localhost:3000)

# 3. Open browser and start coding! 🎉
```

## 📊 Architecture

```
adhd-dashboard/
├── apps/
│   ├── adhd-dashboard/     # Angular 20 frontend app
│   └── backend/            # NestJS API server
├── libs/
│   └── shared/             # Shared TypeScript types
└── docs/                   # Documentation
```

## 🧪 Testing

### Run All Tests
```bash
pnpm test                   # Unit tests with coverage
pnpm test:watch            # Watch mode for development
pnpm test:ci               # CI mode with coverage reports
pnpm e2e                   # End-to-end tests
```

### Test Coverage Requirements
- Target: ≥ 80% coverage before merge
- Unit tests are co-located with source files
- Integration tests in dedicated e2e directories

## 🏗️ Build for Production

### Quick Production Build
```bash
pnpm build:all             # Build all applications
pnpm start                 # Start production frontend
pnpm start:backend         # Start production backend
```

### Optimized Builds
- Release builds with compiler optimizations
- Source maps excluded in production
- Bundle analysis and tree-shaking enabled
- TypeScript strict mode enforced

## 🛠️ Development

### Code Quality
```bash
pnpm lint                  # ESLint + Angular specific rules
pnpm lint:fix             # Auto-fix linting issues
pnpm format               # Prettier formatting
pnpm typecheck            # TypeScript type checking
```

### Project Standards
- **Angular 20** with standalone components
- **Control Flow Syntax** (`@if`, `@for`) - NO legacy `*ngIf`
- **Zoneless Change Detection** for better performance
- **Signal Store** pattern with `@ngrx/signals`
- **Typed Reactive Forms** exclusively
- **OnPush Change Detection** strategy

### Backend Standards
- **NestJS** with TypeScript
- **TypeORM** with SQLite for development
- **Input validation** with class-validator
- **Swagger documentation** auto-generated
- **JWT authentication** with refresh tokens

## 🏢 Architecture Principles

### ADHD-Focused Features
- **Energy Level Matching**: Tasks categorized by required energy
- **Focus Session Tracking**: Built-in concentration monitoring
- **Context Switching**: Smart task grouping by environment
- **AI Suggestions**: Intelligent task prioritization
- **Minimal Cognitive Load**: Clean, distraction-free interface

### Technical Standards
- ✅ **SOLID Principles**: Clean, modular architecture
- ✅ **Type Safety**: No `any` types, strict TypeScript
- ✅ **Performance**: Lazy loading, memoization, async patterns
- ✅ **Security**: Input validation, JWT tokens, CORS protection
- ✅ **Testing**: 80%+ coverage, unit + integration tests
- ✅ **Accessibility**: WCAG AA compliance, keyboard navigation

## 🔒 Security

### API Security
- JWT token authentication
- Input validation on all endpoints
- CORS protection configured
- Rate limiting implemented
- SQL injection prevention

### Frontend Security
- XSS protection with Angular sanitization
- CSP headers configured
- Secure token storage
- Input sanitization
- HTTPS-only in production

## 📱 UI/UX Standards

### Performance
- **< 100ms** perceived latency for critical interactions
- Skeleton loaders for async operations
- Optimistic updates where appropriate
- Image lazy loading and optimization

### Accessibility
- **WCAG AA** color contrast compliance
- Full keyboard navigation support
- ARIA roles and labels
- Screen reader compatibility
- `prefers-color-scheme` support

## 🚀 Deployment

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=sqlite:./data/adhd.db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:4200

# Frontend (environment.ts)
API_URL=http://localhost:3000/api
```

### Docker Support
```bash
# Build and run with Docker
docker-compose up --build
```

### CI/CD Pipeline
- **Linting & Type Checking**: ESLint + TypeScript
- **Testing**: Unit tests + E2E with Playwright
- **Security Scanning**: Vulnerability detection
- **Build Artifacts**: Optimized production builds
- **Deployment**: Automated staging/production

## 📋 Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start frontend development server |
| `pnpm dev:backend` | Start backend development server |
| `pnpm build` | Build frontend for production |
| `pnpm build:backend` | Build backend for production |
| `pnpm build:all` | Build all applications |
| `pnpm test` | Run all unit tests with coverage |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm e2e` | Run end-to-end tests |
| `pnpm lint` | Run linter on all projects |
| `pnpm format` | Format code with Prettier |
| `pnpm clean` | Clean build artifacts |

## 🤝 Contributing

1. **Code Style**: Follow ESLint rules and Prettier formatting
2. **Commits**: Use conventional commit messages
3. **Testing**: Add tests for new features (maintain 80%+ coverage)
4. **Documentation**: Update README and inline docs
5. **Reviews**: All PRs require review and passing CI

## 📚 Resources

- [Angular Documentation](https://angular.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [NgRx Signals](https://ngrx.io/guide/signals)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [ADHD UX Guidelines](./docs/adhd-ux-guidelines.md)

## 📄 License

MIT © ADHD Dashboard Team
