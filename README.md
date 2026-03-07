# 🌌 Cosmic Multiverse

A gamified music exploration platform built around six interconnected realms.

Sign in. Enter the Nexus. Explore sonic worlds. Complete trials. Earn XP. Unlock new realms. Rise through the multiverse.

--------------------------------------------------

WHAT IS THIS?

Cosmic Multiverse is an RPG-style music experience where users journey through six symbolic realms.

Each realm contains:

- an original music track
- locations to explore
- trials to complete
- XP rewards
- progression unlocks

Core Loop:

Sign in
→ Enter Nexus
→ Explore Realm
→ Visit Locations
→ Complete Trials
→ Listen to Music
→ Earn XP
→ Unlock Next Realm
→ View Profile
→ Climb Leaderboard

--------------------------------------------------

REALM PROGRESSION

The progression chain:

303  →  Fractured Frontier
202  →  The Veil
101  →  Moonlit Roads
55   →  Skybound City
44   →  Astral Bazaar
0    →  InterSiddhi

Unlock order:

303 → 202 → 101 → 55 → 44 → 0

Each realm unlocks after completing all trials in the previous realm.

--------------------------------------------------

CURRENT MVP FEATURES

Gameplay
- 6 interactive realm pages
- trial progression system
- location exploration XP
- music listening XP
- automatic realm unlocks
- XP + level progression
- login streak tracking

Hub
- Cosmic Nexus dashboard
- realm portal system
- moon phase display
- dynamic XP display

Identity
- player profile page
- leaderboard rankings
- streak tracking
- trial completion history

--------------------------------------------------

BROADER VISION

This project began as a broader "Cosmic Tracker" concept focused on:

- daily intentions
- rituals
- moon alignment
- mood tracking
- journaling

Those systems still exist in the backend and may be activated in future phases.

The current MVP focuses first on the **music exploration gameplay loop**.

--------------------------------------------------

FUTURE MODULES

The backend already includes models for:

SacredYes
MoodEntry
PracticeQuest
Rituals

These power future systems such as:

Daily Rituals
Cosmic Journal
Mood Tracking
Custom Ritual Builder
Moon Calendar

They remain dormant until the core realm loop is fully stable.

--------------------------------------------------

TECH STACK

Frontend
Next.js 15
TypeScript
Tailwind CSS
Apollo Client

Backend
Node.js
Express
Apollo Server (GraphQL)
MongoDB (Mongoose)

Auth
NextAuth
GitHub OAuth

--------------------------------------------------

HOW TO RUN

Backend

cd backend
npm install
node index.js

Runs at:
http://localhost:4000/graphql

Frontend

cd frontend
npm install
npm run dev

Runs at:
http://localhost:3000

--------------------------------------------------

ENVIRONMENT VARIABLES

Backend (.env)

MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
PORT=4000

Frontend (.env.local)

NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

Never commit real secrets.

--------------------------------------------------

PROJECT STRUCTURE

cosmic-tracker-app

backend
  index.js
  models
  resolvers
  schemas

frontend
  src
    app
      page.tsx
      nexus
      profile
      leaderboard
      realms
    components
    graphql
    lib
    styles

shared

--------------------------------------------------

ROADMAP

Phase 2
- realm alignment questionnaire
- player badges
- improved Nexus UI

Phase 3
- daily ritual quests
- moon calendar
- cosmic journal
- sacred yes system

Phase 4
- artist music submissions
- creator realms
- collaborative world building

--------------------------------------------------

License

MIT