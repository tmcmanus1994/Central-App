# Central Church App — Claude Context File

> Read this file at the start of every session. It is the single source of truth for building the Central Church mobile app.

---

## Project Overview

A native iOS and Android app giving Central Church a direct, owned communication channel to every member, guest, and family. Replaces fragmented dependency on Facebook, group texts, and email with a single platform the church controls entirely.

**Background:** In early 2026, Central Church's primary Facebook page was hacked — AI-generated content began posting under the church's name. This app is the permanent fix.

**Author:** Travelle Johnson — Creative Director, Central Church
**Version:** 1.0 Initial Release

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile App | React Native + Expo SDK 51 | One codebase for iOS & Android |
| Navigation | Expo Router v3 (file-based) | File-system routing |
| Backend / DB | Supabase (Postgres) | Auth, realtime, file storage, RLS |
| Push Notifications | OneSignal | Free tier up to 10K subscribers |
| Admin Panel | Next.js (web) | Hosted on Vercel |
| Auth | Supabase Auth | Email/password + magic link |
| File Storage | Supabase Storage | Profile photos, album covers |
| State Management | Zustand | Lightweight, no boilerplate |
| Styling | NativeWind v4 | Tailwind for React Native |
| Animations | React Native Reanimated ~3.10 | Gestures, modal transitions |

---

## Coding Rules (Apply Every Session)

- **NEVER hardcode colors.** Always use NativeWind classes or the Colors token object.
- **ALWAYS handle loading, error, and empty states** on every screen.
- **ALWAYS use TypeScript.** No `any` types, ever.
- **NEVER call OneSignal or Supabase service key from the client.** Use Edge Functions.
- Use `useSafeAreaInsets()` for all top/bottom screen spacing.
- Use `expo-haptics` for tactile feedback on primary actions.
- File naming: PascalCase for components, camelCase for hooks/utils.
- Keep components under 200 lines. Extract sub-components if larger.
- Dark mode: use NativeWind `dark:` prefix. Never a separate dark stylesheet.

---

## File Structure

```
central-church-app/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth group (outside tab nav)
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── index.tsx             # Home
│   │   ├── prayer.tsx            # Prayer Board
│   │   ├── events.tsx            # Events Calendar
│   │   └── more.tsx              # More / Settings
│   ├── event/[id].tsx            # Event detail
│   ├── prayer/submit.tsx         # Submit prayer
│   ├── member/[id].tsx           # Member contact card
│   ├── sermon/[id].tsx           # Sermon player
│   └── _layout.tsx               # Root layout (theme, auth gate)
│
├── components/
│   ├── ui/                       # Button, Input, Badge, Avatar...
│   ├── cards/                    # EventCard, PrayerCard, SermonCard...
│   ├── sheets/                   # Bottom sheets
│   └── navigation/               # Header, TabBar overrides
│
├── lib/
│   ├── supabase.ts               # Supabase client init
│   ├── onesignal.ts              # Push notification helpers
│   └── utils.ts                  # Date formatting, etc.
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePrayer.ts
│   ├── useEvents.ts
│   └── useColorScheme.ts
│
├── stores/
│   ├── authStore.ts
│   └── notificationStore.ts
│
├── constants/
│   ├── colors.ts                 # All color tokens
│   ├── typography.ts             # Font sizes, weights
│   └── spacing.ts                # Spacing scale
│
├── types/
│   ├── database.ts               # Auto-generated from Supabase
│   └── app.ts                    # App-specific types
│
├── supabase/
│   ├── migrations/               # SQL migration files
│   └── functions/
│       └── send-notification/    # OneSignal sender Edge Function
│
└── assets/
    ├── fonts/
    └── images/
```

---

## Design Tokens (Use These in All Code)

### Colors — `constants/colors.ts`

```ts
export const Colors = {
  light: {
    text: { primary: '#1A1611', secondary: '#5A5248', accent: '#C8973A' },
    bg: { page: '#FDFAF4', card: '#FFFFFF', elevated: '#F5F0E8' },
    border: 'rgba(200, 151, 58, 0.2)',
    gold: '#C8973A',
  },
  dark: {
    text: { primary: '#F5F0E8', secondary: '#B0A898', accent: '#E8C06A' },
    bg: { page: '#0D0B08', card: '#1A1611', elevated: '#2A2015' },
    border: 'rgba(200, 151, 58, 0.18)',
    gold: '#E8C06A',
  },
};
```

### Typography

| Token | Font | Size | Weight |
|---|---|---|---|
| display/xl | Cormorant Garamond | 40sp | 600 |
| display/lg | Cormorant Garamond | 32sp | 600 |
| display/md | Cormorant Garamond | 24sp | 400 |
| body/lg | DM Sans | 17sp | 400 |
| body/md | DM Sans | 15sp | 400 |
| body/sm | DM Sans | 13sp | 400 |
| label/lg | DM Sans | 14sp | 600 |
| label/md | DM Sans | 12sp | 500 |
| label/sm | DM Sans | 10sp | 500 |

### Spacing (8pt grid — multiples of 4/8 only)

| Token | Value |
|---|---|
| space/4 | 16pt (default screen margin) |
| space/6 | 24pt (section spacing) |
| space/8 | 32pt (major breaks) |
| radius/md | 12pt (cards, modals, inputs) |
| radius/lg | 20pt (bottom sheets) |
| radius/full | 999pt (pills, avatars) |

Bottom nav height: 80pt. Minimum tap target: 44x44pt. Always use `useSafeAreaInsets()`.

---

## Database Schema (Supabase / Postgres)

Build the full schema upfront. Never do mid-feature migrations.

### profiles
```sql
id uuid PK -- references auth.users.id
full_name text
phone text
email text
avatar_url text
role enum -- guest | member | staff | elder
bio text
ministry_tags text[]
member_since date
onesignal_id text
push_categories text[]
is_verified boolean
created_at timestamptz
updated_at timestamptz
```

### prayer_requests
```sql
id uuid PK
user_id uuid FK -- profiles.id, nullable for anonymous
display_name text -- 'Anonymous' if is_anonymous
body text
is_anonymous boolean
is_pinned boolean -- admin only
status enum -- pending | approved | declined
category text -- Health | Church | Family | Community | Outreach
week_of date -- Monday of the week
prayed_count integer
approved_by uuid FK
approved_at timestamptz
created_at timestamptz
```

### prayer_interactions
```sql
id uuid PK
prayer_request_id uuid FK
user_id uuid FK
created_at timestamptz
```
> Prevents duplicate prayed_count increments. Check this before mutating.

### events
```sql
id uuid PK
title text
description text -- nullable (Type A has none)
location text
starts_at timestamptz
ends_at timestamptz
category text -- Worship | Ministry | Teen | Womens | Mens | Recreation | Outreach
event_type enum -- general | info_cta | signup
is_recurring boolean
recurrence_rule text -- RRULE string
cta_type enum -- none | signup_link | contact_person | register_form
cta_value text
contact_name text
contact_phone text
contact_email text
is_featured boolean
created_by uuid FK
created_at timestamptz
```

### announcements
```sql
id uuid PK
title text
body text
audience_tag text -- All Members | Staff | Community | Parents
contact_name text
contact_phone text
signup_url text
display_order integer
status enum -- live | draft | archived
expires_at timestamptz
created_by uuid FK
created_at timestamptz
```

### sermons
```sql
id uuid PK
title text
youtube_url text
youtube_video_id text
speaker text
scripture_reference text
series_name text
description text
is_featured boolean
sermon_date date
created_at timestamptz
```

### podcast_episodes
```sql
id uuid PK
episode_number integer
title text
audio_url text
speaker text
scripture_reference text
duration_seconds integer
description text
source enum -- rss | manual
published_at date
created_at timestamptz
```

### photo_albums
```sql
id uuid PK
title text
category text -- Featured | General | Womens | Mens | Teen | Outreach
google_photos_url text
header_photo_url text
photo_count integer
display_order integer
created_at timestamptz
```

### community_groups
```sql
id uuid PK
name text
description text
category text -- Life Stage | Ministry | Recreation | Outreach
groupme_url text
member_count integer
emoji text
is_featured boolean
display_order integer
created_at timestamptz
```

### push_notifications
```sql
id uuid PK
title text
body text
audience_segments text[] -- OneSignal segment names
link_type enum -- none | event | announcement | prayer | url
link_value text
scheduled_at timestamptz
sent_at timestamptz
status enum -- draft | scheduled | sent | cancelled
onesignal_notification_id text
created_by uuid FK
created_at timestamptz
```

### Row-Level Security Summary

| Table | Read | Write |
|---|---|---|
| profiles | Verified members (own row: any auth user) | Own row only (role: staff/elder) |
| prayer_requests | Approved + own pending | Insert: any auth user. Approve/delete: staff/elder |
| events | Anyone (public) | staff/elder only |
| announcements | Auth users (filtered by audience_tag) | staff/elder only |
| sermons | Anyone (public) | staff/elder only |
| podcast_episodes | Anyone (public) | staff/elder only |
| photo_albums | Anyone (public) | staff/elder only |
| community_groups | Anyone (public) | staff/elder only |
| push_notifications | staff/elder only | staff/elder only |

> ⚠️ NEVER expose user_id or real name of anonymous prayer submissions. Enforce at the RLS level, not just UI.

---

## Feature Specifications

### Auth
- New accounts default to `role: guest`
- Push notification opt-in shown after profile setup
- Staff/Elder roles assigned by existing staff/elder in admin only
- Do NOT auto-verify users — admin does member verification

### Home Screen
- Featured event: `SELECT * FROM events WHERE is_featured = true AND starts_at > now() ORDER BY starts_at ASC LIMIT 1`
- Latest sermon: `SELECT * FROM sermons WHERE is_featured = true LIMIT 1`
- Announcements: `SELECT * FROM announcements WHERE status = 'live' ORDER BY display_order ASC LIMIT 2`

### Prayer Board (MVP)
- Pinned requests appear at top with gold left border
- `I Prayed` button: check `prayer_interactions` first — one tap per user per request
- Anonymous: `display_name = 'Anonymous'`, `user_id` stored for moderation but never exposed
- Weekly reset: Supabase cron runs every Monday 6 AM CT, archives previous week's requests

### Events Calendar (MVP)
Three event types:
- **Type A — General:** Title, date/time, location, Add to Calendar. No detail modal.
- **Type B — Info + CTA:** Full description, contact card, CTA button. Opens detail sheet.
- **Type C — Signup Only:** No description. Register button on card itself.

Recurring events: Use `rrule` npm package to generate next 12 occurrences from the RRULE string. Do NOT create 52 rows per weekly event.

### Push Notifications (MVP)
**OneSignal Segments:**
- `all-members` — General announcements
- `parents-teens` — Youth ministry
- `community-20s`, `community-30s`, `community-40s`
- `volunteers` — Volunteer scheduling
- `outreach` — Community outreach events
- `staff-only` — Internal staff communications

> ⚠️ NEVER call the OneSignal API directly from the React Native app. Always go through a Supabase Edge Function so the API key is never exposed on the client.

---

## Key Dependencies

```json
{
  "expo": "~51.0",
  "expo-router": "~3.0",
  "@supabase/supabase-js": "^2.39",
  "nativewind": "^4.0",
  "react-native-reanimated": "~3.10",
  "zustand": "^4.5",
  "onesignal-expo-plugin": "latest",
  "expo-av": "~14.0",
  "react-native-youtube-iframe": "^2.3",
  "rrule": "^2.8",
  "expo-image-picker": "~15.0",
  "expo-haptics": "~13.0",
  "expo-calendar": "~12.0",
  "expo-linking": "~6.0",
  "date-fns": "^3.0"
}
```

---

## Useful Supabase Queries

```sql
-- This week's approved prayer requests
SELECT * FROM prayer_requests
WHERE status = 'approved'
AND week_of = date_trunc('week', now())::date
ORDER BY is_pinned DESC, created_at ASC;

-- Upcoming events (next 30 days, non-recurring)
SELECT * FROM events
WHERE starts_at BETWEEN now() AND now() + interval '30 days'
AND is_recurring = false
ORDER BY starts_at ASC;

-- Check if user has already prayed
SELECT id FROM prayer_interactions
WHERE prayer_request_id = $1
AND user_id = auth.uid()
LIMIT 1;
```

---

## Environment Variables

Store in `.env.local`. Never commit to Git. Add to Vercel + EAS secrets for CI/CD.

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-key]   # Edge Functions only, NEVER client

# OneSignal
EXPO_PUBLIC_ONESIGNAL_APP_ID=[your-app-id]
ONESIGNAL_REST_API_KEY=[your-rest-key]    # Edge Functions only, NEVER client

# App Config
EXPO_PUBLIC_APP_ENV=development           # or production
```

---

## MVP Scope (Weeks 1–6)

| Module | Status |
|---|---|
| Push Notifications | ✅ MVP |
| Prayer Board | ✅ MVP |
| Events Calendar | ✅ MVP |
| Basic Admin Dashboard | ✅ MVP |
| Announcements | Phase 2 |
| Sermons & Podcast | Phase 2 |
| Photo Albums | Phase 2 |
| Groups / Connect | Phase 2 |
| Member Directory | Phase 3 |

**MVP success:** 50 members onboarded in first 30 days, push open rate >50%, admin team self-sufficient.

---

## Session Starter Prompt Template

Paste this at the top of every new Claude or Cursor session:

```
I'm building the Central Church mobile app using React Native + Expo Router + Supabase + NativeWind.

Tech: Expo SDK 51, Expo Router v3, Supabase JS v2, NativeWind v4, Zustand, React Native Reanimated.

File structure and design tokens are defined in CLAUDE.md at the project root.

Today I want to build: [DESCRIBE THE SPECIFIC SCREEN OR FEATURE]

Relevant Supabase table(s): [PASTE THE RELEVANT TABLE FROM CLAUDE.md]

Here is the Figma design for this screen: [DESCRIBE OR PASTE SCREENSHOT]
```
