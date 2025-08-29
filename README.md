# Polling App with QR Code Sharing

A Next.js app where users can create polls, share them via unique links and QR codes, and collect votes. Built during the "AI for Developers" program to showcase AI-assisted development across planning, coding, testing, debugging, and deployment.

## Tech Stack
- Next.js (App Router)
- Supabase (Auth + Database)
- UI: Tailwind + shadcn-style components
- Deployment: Vercel

## Features (Planned)
- Auth (Supabase): register/login/logout
- Poll management: create, list, view, edit, delete
- Public voting: unique link per poll, QR code sharing
- Results display: counts/percentages per option

## Getting Started
1. Install dependencies
```bash
npm install
```
2. Configure env vars (Supabase)
```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```
3. Run the dev server
```bash
npm run dev
```
4. Visit the app
- `/` redirects to `/polls`
- `/polls` list
- `/polls/new` create
- `/polls/[id]` view & vote

## API Routes (Placeholders)
- `GET /api/polls` – list polls
- `POST /api/polls` – create poll
- `GET /api/polls/[id]` – get poll
- `PUT /api/polls/[id]` – update poll
- `DELETE /api/polls/[id]` – delete poll
- `POST /api/polls/[id]/vote` – record vote

## AI-Assisted Development
- Planning & design: prompts to outline models, routes, and flows
- UI generation: shadcn-style components scaffolded with AI help
- Code assistance: AI to write components, API handler skeletons
- Debugging: used AI to resolve Next.js async params change
- Deployment: guidance for Vercel and CI suggestions

## Next Steps
- Implement Supabase schema (users, polls, options, votes)
- Replace API placeholders with real database logic
- Add QR generation via local library if needed
- Protect creator routes with auth middleware
