# BookNest Admin Dashboard

A comprehensive admin panel for BookNest built with Next.js 16, React 19, and TypeScript.

## Features

- 📊 **Dashboard Overview**: Real-time stats on revenue, users, books, and reports
- 📚 **Book Review System**: Approve/reject books submitted by authors
- 👥 **User Management**: Manage users, roles, and handle bans
- ⚠️ **Report Management**: Review and resolve user reports
- 📈 **Analytics Charts**: Visual representation of platform metrics

## Project Structure

```
apps/admin/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirects to dashboard
│   ├── globals.css             # Global styles
│   └── dashboard/
│       ├── page.tsx            # Dashboard overview
│       ├── books/
│       │   └── page.tsx        # Book review page
│       ├── users/
│       │   └── page.tsx        # User management page
│       └── reports/
│           └── page.tsx        # Reports page
├── src/
│   ├── components/
│   │   ├── index.ts            # Component exports
│   │   ├── stats-card.tsx      # Stats card component
│   │   ├── dashboard-charts.tsx # Chart components (Revenue, Users, Books)
│   │   └── sidebar.tsx         # Navigation sidebar
│   ├── features/
│   │   └── dashboard/
│   │       ├── index.ts
│   │       └── dashboard-content.tsx # Main dashboard content
│   └── hooks/
│       └── useDashboardData.ts # Data fetching hook
└── package.json
```

## Components

### StatsCard

Displays key metrics with optional change indicators and icons.

```tsx
<StatsCard
  title="Total Revenue"
  value="$50,000"
  change={{ value: 12, isPositive: true }}
  icon="💰"
/>
```

### Charts

- **RevenueChart**: Line chart showing revenue trends
- **UserChart**: Bar chart comparing readers vs authors
- **BookChart**: Bar chart showing book submissions status

### Sidebar

Navigation menu for admin sections.

## API Endpoints

The admin dashboard connects to the following endpoints:

- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/revenue` - Revenue chart data
- `GET /api/admin/dashboard/users` - User chart data
- `GET /api/admin/dashboard/books` - Books chart data
- `GET /api/admin/users` - List all users
- `GET /api/admin/books/pending` - List pending books
- `GET /api/admin/reports` - List reports

## Dependencies

- `next`: 16.2.2
- `react`: 19.2.4
- `recharts`: 2.12.0
- `@repo/api-client`: Shared API client
- `@repo/types`: Shared type definitions
- `@repo/ui`: Shared UI components

## Development

Install dependencies:

```bash
pnpm install
```

Run development server:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
pnpm start
```

## Type Safety

All API responses use TypeScript types from `@repo/types`:

- `DashboardStats`: Dashboard overview statistics
- `RevenueChartData`: Revenue trend data
- `UserChartData`: User growth data
- `BookChartData`: Book submission data
- `AdminUser`: User management data
- `AdminBook`: Book review data
- `AdminReport`: Report data

## Next Steps

- [ ] Connect real API endpoints
- [ ] Implement book review workflow
- [ ] Implement user management features
- [ ] Implement report resolution workflow
- [ ] Add authentication and authorization checks
- [ ] Add real-time updates with WebSockets
- [ ] Add data export functionality
- [ ] Add admin activity logging

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
