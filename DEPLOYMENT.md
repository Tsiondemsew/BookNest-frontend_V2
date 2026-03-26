# BookNest Deployment Guide

## Overview

BookNest is a production-ready Progressive Web App (PWA) for book discovery, reading, and community. This guide covers deployment, configuration, and best practices.

## Prerequisites

- Node.js 18+ and pnpm
- Vercel account (for hosting)
- Backend server for API endpoints
- Database setup (PostgreSQL recommended)

## Environment Variables

### Frontend (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.booknest.com
NEXT_PUBLIC_APP_URL=https://booknest.com

# Analytics
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-key@sentry.io/project-id

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=en

# Feature Flags
NEXT_PUBLIC_ENABLE_READER=true
NEXT_PUBLIC_ENABLE_SOCIAL=true
NEXT_PUBLIC_ENABLE_ENCRYPTION=true
```

## Deployment Steps

### 1. Build for Production

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Test production build locally
pnpm start
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

Or connect GitHub and enable automatic deployments.

### 3. Configure Environment

Set environment variables in Vercel dashboard:
- Settings → Environment Variables
- Add all required variables from `.env.example`

### 4. Setup Custom Domain

In Vercel dashboard:
- Settings → Domains
- Add your custom domain
- Configure DNS records

## PWA Configuration

### Service Worker

The service worker is automatically generated from `/public/sw.js`. It handles:
- Offline support
- Asset caching
- API caching with network-first strategy
- Update notifications

### Web App Manifest

Located at `/public/manifest.json`. Customize:
- App name and short name
- Icons and theme colors
- Start URL and display mode

### Installation

Users can install BookNest as a PWA:
- **iOS**: Share → Add to Home Screen
- **Android**: Menu → Install App
- **Desktop**: Three dots menu → Install

## API Integration

### Backend Requirements

BookNest expects the following API endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user (requires auth cookie)

#### Books
- `GET /api/books?page=1&limit=20` - List books with pagination
- `GET /api/books/:id` - Get book details
- `POST /api/books/:id/add-to-library` - Add book to user library
- `GET /api/books/search?q=query` - Search books

#### Reading Progress
- `PUT /api/reading-progress/:bookId` - Update reading progress
- `GET /api/reading-progress/:bookId` - Get user's reading progress

#### Social
- `GET /api/social/feed` - Get community feed
- `POST /api/social/posts` - Create new post
- `POST /api/social/posts/:id/like` - Like a post
- `POST /api/social/posts/:id/comment` - Add comment

### HTTP-Only Cookies

The app uses HTTP-only cookies for session management:

```javascript
// Server sends this header after login
Set-Cookie: auth_token=<token>; HttpOnly; Secure; SameSite=Strict; Path=/;
```

Ensure your backend:
- Sets HttpOnly flag on auth cookies
- Uses Secure flag in production
- Sets appropriate SameSite policy
- Includes credentials in CORS config

## Database Setup

### PostgreSQL Schema

Create essential tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  displayName VARCHAR(255),
  passwordHash VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  coverUrl VARCHAR(255),
  category VARCHAR(100),
  rating DECIMAL(3,1),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User library (saved books)
CREATE TABLE user_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id) ON DELETE CASCADE,
  bookId UUID REFERENCES books(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'wishlist',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(userId, bookId)
);

-- Social posts
CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  bookId UUID REFERENCES books(id) ON DELETE SET NULL,
  likes INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Optimization

### Image Optimization

- Use Next.js Image component
- Provide multiple image sizes
- Use WebP format with fallbacks

### Code Splitting

- Next.js App Router provides automatic code splitting
- Dynamic imports for large components
- Route-based chunking

### Caching Strategy

- Service Worker: Network-first for API, cache-first for assets
- Browser: Cache static assets with long expiry
- CDN: Cache immutable assets forever

### Monitoring

Sentry is pre-configured for:
- Error tracking
- Performance monitoring
- Release tracking

Configure in `.env.local`:
```env
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-url>
```

## Security Checklist

- [ ] HTTPS enabled on all domains
- [ ] Environment variables secure and not committed
- [ ] HTTP-only cookies for session tokens
- [ ] CORS properly configured
- [ ] SQL injection prevention with parameterized queries
- [ ] Rate limiting on API endpoints
- [ ] Input validation on forms
- [ ] CSP headers configured
- [ ] Regular security updates for dependencies

## Scaling Considerations

### Database
- Use connection pooling (PgBouncer)
- Implement read replicas for scaling reads
- Add caching layer (Redis)
- Regular backups and monitoring

### CDN
- Static assets through CDN
- Image optimization service
- Global distribution

### API
- Horizontal scaling with load balancing
- API rate limiting
- Caching layer (Redis)
- Database query optimization

### Search
- Elasticsearch for full-text search
- Autocomplete suggestions
- Faceted navigation

## Monitoring & Observability

### Key Metrics
- Page load time
- Time to interactive
- Error rate
- API response time
- User engagement

### Logging
- Centralized logging service
- Structured logging format
- Log retention policy

### Alerting
- Error threshold alerts
- Performance degradation alerts
- Uptime monitoring

## Troubleshooting

### Service Worker Issues
```bash
# Clear service worker cache
# Settings → Storage → Service Workers
```

### PWA Not Installing
- Check manifest.json is valid
- Ensure HTTPS is enabled
- Icons must be valid PNG/WebP

### Build Failures
```bash
# Clear build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

## Support

For issues and questions:
1. Check documentation
2. Review GitHub issues
3. Contact support team

## License

BookNest is proprietary software. See LICENSE file for details.
