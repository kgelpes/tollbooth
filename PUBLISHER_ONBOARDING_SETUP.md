# Publisher Onboarding Setup Guide

## 🎯 First Step: Database Schema Setup

This guide walks you through setting up the publisher onboarding functionality with Supabase.

### 1. Prerequisites

- Supabase project created
- Environment variables configured
- Database access

### 2. Environment Variables Required

Create a `.env.local` file in `/apps/web/` with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration (for better-auth)
DATABASE_URL=postgresql://user:password@localhost:5432/tollbooth

# App Configuration  
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
```

### 3. Database Schema Setup

1. **Open your Supabase SQL Editor**
2. **Copy and run the SQL from `database-schema.sql`**
   - This creates the `publishers`, `revenue_splits`, and `publisher_api_keys` tables
   - Sets up Row Level Security (RLS) policies
   - Creates validation triggers and functions

### 4. Update Dependencies

Move `@supabase/supabase-js` from devDependencies to dependencies:

```bash
cd apps/web
pnpm remove @supabase/supabase-js
pnpm add @supabase/supabase-js@^2.55.0
```

### 5. Verify Setup

After running the SQL schema, you should have these tables in Supabase:

- ✅ `publishers` - Stores site info and payment config
- ✅ `revenue_splits` - Stores wallet addresses and percentages  
- ✅ `publisher_api_keys` - Stores generated API keys
- ✅ `payments` - (Already existed) Stores payment records

### 6. Integration Points

The onboarding system integrates with:

- **Better Auth** - Uses `user_id` from SIWE authentication
- **Existing Payments** - API keys validate against the payments system
- **React Query** - Ready for TanStack Query integration (user preference)

### 7. What's Created

#### 📁 Files Created:
- `database-schema.sql` - Complete database schema
- `lib/types/publisher.ts` - TypeScript types
- `lib/supabase/publisher-operations.ts` - Database operations
- `lib/hooks/usePublisherOnboarding.ts` - React form state hook

#### 🔧 Key Features:
- **Multi-step form state management**
- **Real-time validation**
- **Revenue split validation (≤100%)**
- **API key generation**
- **Row Level Security**
- **Ethereum address validation**

### 8. Next Steps

Now you can integrate the hook into your `PublisherOnboarding` component:

```typescript
import { usePublisherOnboarding } from '../lib/hooks/usePublisherOnboarding';

// Inside your component:
const {
  step1Data,
  updateStep1,
  validateStep1,
  submitOnboarding,
  // ... other methods
} = usePublisherOnboarding();
```

### 9. Testing

After setup, you can test by:

1. Running the Next.js app: `pnpm dev`
2. Going to `/publisher/onboarding`
3. Filling out the forms (they won't save yet until integrated)
4. Checking Supabase dashboard for table creation

### 🚀 Ready for Integration!

The foundation is complete. The next step is integrating the `usePublisherOnboarding` hook into your existing `PublisherOnboarding` component to replace the static form with real data persistence.
