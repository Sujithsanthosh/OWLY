# Contributing to OWLY

Thank you for your interest in contributing to OWLY! This document provides guidelines and instructions for contributing.

## 🌟 Our Mission: Ethical Commerce for Everyone

While platforms like Swiggy, Zomato, Zepto charge sellers **25-30% commissions**, OWLY is different. We're building a **zero-commission, zero-delivery-fee** platform because creators and sellers deserve better. Your contributions help us build technology that serves people, not profits.

## Why Contribute?

- 💰 **Sellers keep 100%** - No platform rent-seeking
- 🚚 **Delivery partners earn fairly** - Zero platform-commission on deliveries
- 🌍 **Open source = transparent** - No hidden fees or policies
- 🔮 **Shape the future** - Build the ethical commerce platform the world needs

## Code of Conduct

By participating, you're expected to uphold our standards of respectful and constructive communication.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Open a new issue with:
   - Bug description
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots if applicable

### Suggesting Features

1. Open an issue describing the feature
2. Explain the use case and benefits

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes following our coding standards
4. Test your changes
5. Commit with clear messages
6. Push and open a Pull Request

## Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Docker (optional but recommended)

### Quick Start

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/OWLY.git
cd OWLY

# Create .env files from examples
cp backend/.env.example backend/.env
cp .env.example .env

# Install all dependencies
npm install  # root if exists (optional)
cd backend && npm install
cd ../frontend && npm install
cd ../mobile && npm install
```

### Running Locally

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Mobile (Expo)
cd mobile
npm start
```

## Project Structure

```
OWLY/
├── backend/        # Node.js/Express API
├── frontend/       # Next.js web app
├── mobile/         # React Native mobile app
├── docker-compose.yml
└── README.md
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow strict mode conventions
- Add proper type definitions

### Backend (Node.js/Express)

- Follow REST conventions for API endpoints
- Use async/await for promises
- Add input validation in controllers
- Write tests for business logic

### Frontend (Next.js)

- Use functional components with hooks
- Follow Tailwind CSS utility-first approach
- Use TypeScript interfaces from `types/` if available
- Components should be reusable and testable

### Commits

Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `test:` - Tests
- `chore:` - Maintenance

## Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

# Run linting
cd backend && npm run lint
cd frontend && npm run lint
```

## Questions?

- Open a discussion in GitHub Discussions
- Check existing documentation in `/docs` or README files
- Reach out to maintainers via issues

## License

By contributing, you agree your contributions are licensed under the MIT License.

---

## 🎯 Join the Ethical Commerce Movement

Together, we're building the future of commerce where:
- **Sellers win** - Keep 100% of sales, not 70%
- **Creators thrive** - Monetize without platform cuts
- **Communities flourish** - Own their commerce ecosystem
- **Consumers save** - Lower prices without middlemen

**Every PR brings us closer to revolutionizing commerce. Welcome to the movement! 🌍**