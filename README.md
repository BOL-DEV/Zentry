# Zentra

Zentra is a Next.js event platform for organizers, attendees, and admins. It includes public organizer pages, event discovery, ticket checkout, payment callback handling, attendee verification, and internal dashboard flows for managing events, orders, and ticket operations.

## Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- Nodemailer for contact form email delivery

## What The App Covers

- Public organizer landing pages and event listings
- Event detail pages with ticket inventory and sold-out handling
- Checkout and payment return flows
- Organizer dashboard for events, attendees, gallery, and staff tools
- Admin dashboard for events, organizers, tickets, and orders
- Ticket verification and check-in utilities

## Project Structure

- `app/`: route definitions, pages, layouts, and API routes
- `components/`: UI building blocks and page-level client components
- `helpers/`: API clients, auth helpers, formatting, types, and utility logic
- `public/`: logos and static assets

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root.

3. Add the required environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1

EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
CONTACT_EMAIL_TO=
APP_NAME=Zentra
```

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run ts-check
```

## Environment Notes

- `NEXT_PUBLIC_API_BASE_URL` is used by the frontend API client in `helpers/api.ts`.
- If `NEXT_PUBLIC_API_BASE_URL` is omitted, the app falls back to `http://localhost:4000/api/v1`.
- The contact form route at `app/api/contact/route.ts` uses the email variables above.

## Main Flows

- Public event browsing: `app/[organizer]`, `app/[organizer]/events`, `app/[organizer]/events/[id]`
- Checkout: `app/[organizer]/events/[id]/checkout`
- Organizer dashboard: `app/[organizer]/dashboard`
- Admin dashboard: `app/dashboard/admin` and `app/(admin)`
- Payment status and callbacks: `app/payments/*`, `app/payment-success`

## Development Notes

- Remote images are allowed through `next.config.ts`.
- Data fetching on the client is handled through TanStack Query.
- The codebase uses shared helper modules to map backend API responses into UI-friendly shapes.

## Verification

Before shipping changes, a good quick check is:

```bash
npm run ts-check
```
