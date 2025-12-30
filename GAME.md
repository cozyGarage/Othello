```markdown
# ft_transcendence - Technical Architecture Guide

## Commercial Gaming Platform Edition

## Executive Summary

ft_transcendence is a next-generation real-time multiplayer gaming platform centered on Pong, designed as a scalable, monetizable commercial product. This architecture supports real-time gameplay, social features, blockchain integration, and future casino-level functionalities while maintaining enterprise-grade security and performance standards.

## Technology Stack

### Core Framework & Runtime

- **Full-Stack Framework**: Next.js 15+ (App Router)
- **Runtime**: Bun (for API Routes & microservices)
- **Language**: TypeScript throughout

### Frontend Technologies

- **UI Framework**: React 18+
- **State Management**: Redux Toolkit
- **Styling**: TailwindCSS
- **Build Tool**: Vite (for development)
- **3D Graphics**: Babylon.js
- **Internationalization**: i18next & react-i18next
- **Charts & Analytics**: Recharts/Chart.js

### Backend & Infrastructure

- **API Framework**: Hono (for microservices)
- **Authentication**: Better-Auth + Clerk/Auth.js
- **Database ORM**: Prisma
- **Primary Database**: PostgreSQL with pgBouncer
- **Cache & Message Broker**: Redis
- **Real-time Communication**: Socket.io
- **Blockchain**: Avalanche (Fuji testnet), Solidity, ethers.js
- **Secrets Management**: HashiCorp Vault
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana) + Pino

### DevOps & Deployment

- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes-ready
- **CI/CD**: GitHub Actions
- **Web Application Firewall**: ModSecurity + Nginx

## System Architecture

### High-Level Overview
```

┌─────────────────┐ ┌──────────────────┐ ┌─────────────────┐
│ Client │ │ Next.js │ │ Microservices │
│ (Browser/CLI) │───▶│ Gateway │───▶│ (Bun Runtime) │
└─────────────────┘ └──────────────────┘ └─────────────────┘
│ │
▼ ▼
┌─────────────────────┐ ┌─────────────────────┐
│ PostgreSQL │ │ Redis │
│ (Primary DB) │ │ (Cache & Pub/Sub) │
└─────────────────────┘ └─────────────────────┘

````

### Core Architecture Patterns

#### 1. Hybrid Microservices Architecture
- **Next.js Application**: Serves as API gateway and web delivery layer
- **Standalone Bun Microservices**: Specialized services for specific domains
- **Communication**: REST/HTTP for sync, Redis Pub/Sub for async events

#### 2. Event-Driven Communication
```typescript
// Example: Game completion flow
game-engine-service → publishes → "GAME_FINISHED" event
                              │
                              ├──→ user-stats-service (updates statistics)
                              ├──→ blockchain-service (records on-chain)
                              └──→ notification-service (sends alerts)
````

#### 3. Database Architecture

```sql
-- Core tables supporting multiple game types and monetization
games (id, type, config JSONB)
matches (id, game_id, status, result, started_at, finished_at)
player_match_results (id, match_id, user_id, score, position)
wallets (id, user_id, balance, currency_type)
transactions (id, wallet_id, amount, type, status)
products (id, name, price, type, metadata JSONB)
user_inventory (id, user_id, product_id, quantity)
```

## Module Implementation Specifications

### 🎯 Mandatory Core Features

#### A. Pong Game System

- **Real-time Multiplayer**: Socket.io-based game engine
- **Tournament System**: Bracket management with matchmaking
- **Game Modes**:
  - Local multiplayer (shared keyboard)
  - Remote 1v1
  - 4-player "Battle Royale" mode
- **Fair Play**: Server-authoritative game logic with client prediction

#### B. User Management & Authentication

- **Local Authentication**: Better-Auth with secure password hashing
- **OAuth 2.0**: Google, GitHub integration
- **User Profiles**: Avatars, stats, friend lists, match history
- **Social Features**: Friends system, online status, blocking

#### C. Security & Compliance

- **HTTPS Enforcement**: All communications encrypted
- **Input Validation**: Server-side validation for all user inputs
- **XSS/SQL Injection Protection**: Prisma ORM, parameterized queries
- **GDPR Compliance**: User data anonymization, account deletion

### 🚀 Advanced Modules

#### Web & Blockchain

1. **Backend Framework**: Hono on Bun for microservices
2. **Frontend Toolkit**: Next.js 15 + TailwindCSS + TypeScript
3. **Database**: PostgreSQL with Prisma ORM
4. **Blockchain Integration**:
   - Avalanche testnet for tournament scores
   - Solidity smart contracts
   - Transaction verification UI

#### Gameplay & User Experience

5. **Remote Players**: WebSocket-based real-time gameplay
6. **Multiplayer Modes**: 3-6 player game variants
7. **Second Game**: Tetris/Space Invaders with shared infrastructure
8. **Game Customization**: Power-ups, themed maps, configurable rules
9. **Live Chat**:
   - Direct messaging
   - Game invitations
   - Tournament notifications
   - User blocking

#### AI & Analytics

10. **AI Opponent**:
    - State-prediction engine (A\* algorithm prohibited)
    - 1-second update constraint
    - Human-like behavior simulation
11. **Statistics Dashboards**:
    - Win/loss ratios over time
    - Head-to-head records
    - Game session analytics

#### Cybersecurity

12. **WAF & Secrets Management**:
    - ModSecurity with OWASP Core Rule Set
    - HashiCorp Vault for secrets
13. **2FA & JWT**: TOTP-based two-factor authentication

#### DevOps & Monitoring

14. **Log Management**: ELK stack for centralized logging
15. **Monitoring**: Prometheus metrics + Grafana dashboards
16. **Microservices Architecture**:
    - game-engine-service
    - chat-service
    - payment-service
    - blockchain-listener-service

#### Graphics & Accessibility

17. **3D Graphics**: Babylon.js for immersive Pong experience
18. **Accessibility**:
    - Full responsive design
    - Screen reader support (ARIA labels)
    - High-contrast mode
    - Keyboard navigation
    - Multi-language support (EN, FR, ES)

#### Server-Side Infrastructure

19. **Server-Side Pong**: Authoritative game server
20. **CLI Integration**: Terminal-based gameplay vs web users

### 💰 Monetization Features (Future Ready)

#### Shop & Inventory System

```typescript
// Product types supported
enum ProductType {
  COSMETIC = 'cosmetic', // Themes, paddle skins
  POWER_UP = 'power_up', // Game enhancements
  CURRENCY = 'currency', // Virtual coins
  BOOSTER = 'booster', // Experience multipliers
}
```

#### Payment Integration

- **Stripe**: Primary payment processor
- **Wallet System**: Virtual currency management
- **Transaction History**: Complete audit trail

#### Casino Features Foundation

- **Provably Fair System**: On-chain randomness verification
- **Regulatory Compliance**: Isolated payment service for auditing
- **Game History**: Immutable match records for dispute resolution

## Development Guidelines

### Code Quality & Standards

- **TypeScript**: Strict mode enabled
- **ESLint/Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright

### Security Best Practices

1. **Authentication**: Session-based auth with secure cookies
2. **API Security**: Rate limiting, CORS, input sanitization
3. **Data Protection**: Encryption at rest for sensitive data
4. **Secret Management**: Vault-integrated secret rotation

### Performance Optimization

- **CDN**: Static asset delivery
- **Database Optimization**: Connection pooling, query optimization
- **Caching Strategy**: Redis for frequently accessed data
- **Image Optimization**: WebP format, lazy loading

## Deployment Architecture

### Container Structure

```yaml
services:
  nextjs-gateway:
    build: ./nextjs-app
    ports: ['3000:3000']

  game-engine:
    build: ./services/game-engine
    environment:
      REDIS_URL: redis://redis:6379

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: transcendence

  redis:
    image: redis:7-alpine

  elasticsearch:
    image: elasticsearch:8.11.0

  # ... additional services
```

### Environment Configuration

- **Development**: Docker Compose with hot-reload
- **Staging**: Isolated environment with production-like configuration
- **Production**: Kubernetes cluster with auto-scaling

## Monitoring & Observability

### Key Metrics

- **Application**: Request rate, error rate, response time
- **Business**: Active users, game completions, revenue
- **Infrastructure**: CPU, memory, database connections

### Alerting Rules

- Error rate > 1% for 5 minutes
- Database connection pool > 80% utilization
- Response time p95 > 2 seconds

## Future Roadmap

### Phase 1: Core Platform (Months 1-3)

- [ ] Basic Pong with multiplayer
- [ ] User authentication & profiles
- [ ] Tournament system
- [ ] Essential security features

### Phase 2: Enhanced Experience (Months 4-6)

- [ ] Second game integration
- [ ] Advanced graphics (Babylon.js)
- [ ] Live chat & social features
- [ ] AI opponents

### Phase 3: Monetization (Months 7-9)

- [ ] Shop system with Stripe integration
- [ ] Virtual currency & inventory
- [ ] Blockchain score verification
- [ ] Advanced analytics

### Phase 4: Enterprise Features (Months 10-12)

- [ ] Casino-style games
- [ ] Advanced tournament system with entry fees
- [ ] Mobile applications
- [ ] API for third-party integrations

## Success Metrics

### Technical KPIs

- 99.9% uptime
- < 100ms API response time (p95)
- < 50ms real-time message latency
- Zero critical security vulnerabilities

### Business KPIs

- 10,000+ monthly active users
- 30% user retention after 30 days
- $10,000+ monthly transaction volume (Phase 3+)
- 4.5+ star app store rating

---

_This architecture represents a production-ready foundation for a scalable, secure, and monetizable gaming platform that can evolve from a simple Pong game to a comprehensive gaming ecosystem._

```

This comprehensive technical guideline provides your development team with everything needed to build a commercial-grade gaming platform, from architecture decisions to implementation details and future roadmap.
```
