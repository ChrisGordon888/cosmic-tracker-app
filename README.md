# Cosmic Multiverse

Cosmic Multiverse is a deployed full-stack interactive music world built around six symbolic realms.

Users sign in, enter the Nexus, play original realm-based soundtracks, explore cinematic worlds, complete optional trials, earn XP, unlock new realms, and track their progression through a profile and leaderboard.

The project blends music, worldbuilding, progression design, and full-stack application development into a single immersive experience.

---

## Live Concept

Cosmic Multiverse is designed as a music-first realm exploration platform.

Rather than treating music as a static playlist, each song is connected to a symbolic world. Every realm has its own emotional state, visual identity, soundtrack, trials, locations, and progression path.

The current V1 focuses on the core realm journey:

Sign in  
→ Enter the Nexus  
→ Play realm music  
→ Explore a realm  
→ Complete optional trials  
→ Earn XP  
→ Unlock the next realm  
→ View profile progress  
→ Climb the leaderboard  

---

## Core Identity

Cosmic Multiverse is part music platform, part interactive album world, part gamified progression system.

The app is built around six interconnected realms:

| Realm ID | Realm Name | Theme |
|---|---|---|
| 303 | Fractured Frontier | Chaos, pressure, creation, transformation |
| 202 | The Veil | Mystery, longing, dreams, hidden truth |
| 101 | Moonlit Roads | Reflection, grief, memory, integration |
| 55 | Skybound City | Power, ambition, command, manifestation |
| 44 | Astral Bazaar | Value, exchange, discernment, reciprocity |
| 0 | InterSiddhi | Source, balance, remembrance, unity |

The primary unlock path is:

303 → 202 → 101 → 55 → 44 → 0

Each realm unlocks after completing the previous realm’s optional trial path.

---

## V1 Features

### Core Experience

- Music-first landing page
- GitHub authentication through NextAuth
- Central Cosmic Nexus hub
- Six symbolic realm pages
- Realm-based soundtrack system
- Persistent mini music player
- Mobile-responsive interface
- Protected routes for user-specific progression
- Modern symbolic interface language across the app

### Cosmic Nexus

The Nexus acts as the main hub for the experience.

It includes:

- Traveler identity
- Level and XP display
- Current realm state
- Moon phase alignment
- Guided realm entry
- Today’s realm recommendation
- Realm soundtrack cards
- Realm unlock and progress states
- Navigation into each realm

### Realm System

Each realm includes:

- Cinematic background media
- Realm guidance card
- Music soundstage
- Orbit-style soundtrack interface
- Featured track section
- Listening intention section
- Realm overview
- Optional realm path toggle
- Trials
- Locations
- Completion state
- Next-realm call to action

### Realm Progression

Each realm contains an optional progression path built around:

- Starting trials
- Visiting locations
- Solving puzzles
- Completing steps
- Earning XP
- Unlocking the next realm

The progression system is designed to support music-first exploration while still giving users a structured path through the world.

### Music System

The app includes a custom music experience:

- Realm-specific tracks
- Track metadata
- Realm-colored music cards
- Orbit-based track selection
- Play and pause controls
- Persistent mini player
- Listening XP
- Music history tracking
- Total listening time tracking
- Favorite realm tracking foundation

### Player Progress

User progress is stored and displayed through:

- XP
- Level
- XP to next level
- Current realm
- Unlocked realms
- Completed trials
- Visited locations
- Music listening history
- Login streaks
- Total logins

### Profile Dashboard

The profile page functions as a progression dashboard.

It includes:

- Traveler identity
- Avatar
- Current realm
- Level and XP bar
- Streak information
- Realms unlocked
- Trials completed
- Locations visited
- Music time
- Total XP earned
- Realm progress map
- Achievements
- Music hall
- Practice rhythm

### Leaderboard

The leaderboard ranks users by progression.

It includes:

- Current user rank
- Top travelers
- Full ranking list
- User level
- User XP
- Traveler title
- Mobile-friendly ranking cards

---

## Current V1 Realm Flow

### 303 — Fractured Frontier

Fractured Frontier is the opening realm.

It focuses on chaos, pressure, rupture, and creation under pressure. Users begin the realm path, explore the Glitch District and Creation Forge, solve trial puzzles, and unlock The Veil.

### 202 — The Veil

The Veil explores dreams, longing, projection, and hidden truth.

Users move through dreamwalking, clairvoyance, and longing’s end. Completing this realm unlocks Moonlit Roads.

### 101 — Moonlit Roads

Moonlit Roads focuses on reflection, shadow, grief, and emotional integration.

Users move through shadow integration, midnight clarity, and illuminated darkness. Completing this realm unlocks Skybound City.

### 55 — Skybound City

Skybound City focuses on power, ambition, authority, and manifestation.

Users move through sovereignty, power manifestation, and divine authority. Completing this realm unlocks Astral Bazaar.

### 44 — Astral Bazaar

Astral Bazaar focuses on value, exchange, discernment, temptation, and reciprocity.

Users move through the barter of truth, discernment, and sacred exchange. Completing this realm unlocks InterSiddhi.

### 0 — InterSiddhi

InterSiddhi is the final source realm.

It focuses on remembrance, unity, balance, and return. It acts as the symbolic completion point of the current V1 realm journey.

---

## Broader Vision

Cosmic Multiverse began as part of a broader Cosmic Tracker concept focused on:

- Daily intentions
- Rituals
- Moon alignment
- Mood tracking
- Journaling
- Practice quests
- Sacred reflection

Those systems still exist conceptually and some backend models already support future expansion.

The current V1 focuses first on the music exploration and realm progression loop.

---

## Future Modules

Future versions may include:

### Ritual Layer

- Daily rituals
- Practice quests
- Streak-based ritual progression
- Custom ritual builder

### Journal Layer

- Cosmic journal
- Realm-based reflections
- Mood tracking
- Sacred Yes entries

### Moon Layer

- Moon calendar
- Moon phase rituals
- Realm alignment by lunar phase
- Daily guidance based on moon cycle

### Creator Layer

- Artist music submissions
- Creator realms
- Custom realm pages
- Collaborative worldbuilding
- Fan progression systems

### Advanced Interface Layer

- Three.js realm portals
- More interactive symbolic cards
- Animated realm maps
- Drag-enabled mini player
- Expanded soundtrack visualizations

---

## Tech Stack

### Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Apollo Client
- NextAuth
- Vercel deployment

### Backend

- Node.js
- Express
- Apollo Server
- GraphQL
- MongoDB
- Mongoose
- Render deployment

### Authentication

- NextAuth
- GitHub OAuth

### Database

- MongoDB Atlas
- User progression persistence
- Realm unlock tracking
- Trial completion tracking
- Location visit tracking
- Music listening stats

---

## Architecture Overview

The app is separated into a deployed frontend and backend.

### Frontend

The frontend handles:

- User interface
- Authentication session state
- Apollo Client GraphQL requests
- Music player state
- Realm page rendering
- Profile and leaderboard display
- Responsive UI and route navigation

### Backend

The backend handles:

- GraphQL schema
- GraphQL resolvers
- User creation and lookup
- XP updates
- Level progression
- Trial progression
- Location visits
- Music listening logs
- Realm unlocks
- Leaderboard ranking data

### Database

MongoDB stores:

- Users
- Levels and XP
- Current realm
- Unlocked realms
- Completed trials
- Visited locations
- Music stats
- Streak data

---

## Project Structure

```txt
cosmic-tracker-app

backend
  index.js
  models
  resolvers
  schemas

frontend
  public
  src
    app
      page.tsx
      auth
      nexus
      profile
      leaderboard
      realms
        303
        202
        101
        55
        44
        0
    components
      music
      realm
    context
    graphql
    hooks
    lib
    styles

shared

## Key Frontend Areas

### Landing Page

The landing page introduces the Cosmic Multiverse and directs users into the Nexus.

### Auth Page

The auth page provides the user access point for signing in and returning to the app.

### Nexus

The Nexus is the main dashboard and realm selection hub.

It includes:

- User identity
- Level and XP
- Current realm
- Realm cards
- Moon phase display
- Guided realm entry
- Soundtrack access
- Navigation into each realm

### Realm Pages

Each realm page contains:

- Realm background
- Realm guidance
- Realm soundstage
- Optional realm path
- Trials
- Locations
- Completion state
- Next-realm call to action

### Music Player

The music player is handled through a global provider and mini player interface.

It supports:

- Track selection
- Play and pause controls
- Persistent playback state
- Realm-colored track metadata
- Listening history tracking
- Music XP logging

### Profile

The profile aggregates user progress and displays their progression state.

It includes:

- Traveler identity
- Level and XP
- Current realm
- Unlocked realms
- Completed trials
- Visited locations
- Music history
- Streaks
- Realm progress map

### Leaderboard

The leaderboard ranks users based on XP and level.

It includes:

- Current user rank
- Top travelers
- Full ranking list
- User level
- User XP
- Traveler title

---

## Key Backend Systems

### User Progression

The backend tracks user XP, level, current realm, and unlocked realms.

### Trial System

Trials are tracked per user and per realm.

Each trial stores:

- Realm ID
- Trial ID
- Trial name
- Steps completed
- Total steps
- Completion status
- XP earned
- Completion timestamp

### Location System

Locations are tracked per user and per realm.

Each visit stores:

- Realm ID
- Location ID
- Location name
- Visit timestamp
- XP earned

### Music Stats

Music listening is tracked through:

- Realm ID
- Track title
- Artist
- Listen count
- Total listen time
- First listened date
- Last listened date
- XP earned

### Streaks

The streak system tracks:

- Current streak
- Longest streak
- Last login date
- Total logins

---

## Environment Variables

Never commit real secrets.

### Backend `.env`

```env
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret
PORT=4000

### Frontend `.env.local`

    NEXTAUTH_SECRET=your_secret
    NEXTAUTH_URL=http://localhost:3000
    GITHUB_ID=your_github_id
    GITHUB_SECRET=your_github_secret
    NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

### Production Notes

For production deployment:

- The frontend runs on Vercel.
- The backend runs on Render.
- `NEXT_PUBLIC_GRAPHQL_URL` should point to the deployed Render GraphQL endpoint.
- GitHub OAuth callback URLs must match the deployed Vercel URL.
- MongoDB must allow the deployed backend to connect.

---

## How to Run Locally

### Backend

    cd backend
    npm install
    node index.js

The backend runs at:

    http://localhost:4000/graphql

### Frontend

    cd frontend
    npm install
    npm run dev

The frontend runs at:

    http://localhost:3000

---

## Build

To build the frontend:

    cd frontend
    npm run build

---

## Deployment

### Frontend

The frontend is deployed through Vercel.

Typical flow:

    git add .
    git commit -m "Commit message"
    git push

Vercel automatically builds and deploys the latest pushed version.

### Backend

The backend is deployed through Render.

Backend updates require pushing backend changes to GitHub and letting Render redeploy, or manually redeploying through Render.

Frontend-only changes usually only require a Vercel redeploy.

---

## V1 QA Checklist

Before marking a new version stable, test:

- Landing page loads
- Sign in works
- Sign out works
- Auth page displays correctly
- Nexus loads after sign in
- Music player works
- Mini player appears and behaves correctly
- 303 realm loads
- Trial start works
- Location visit works
- Puzzle completion works
- XP updates
- Realm unlocks work
- 202, 101, 55, 44, and 0 pages load
- Profile page loads and displays user data
- Leaderboard page loads
- Bottom navigation works
- Mobile layout does not overflow
- Production build passes

---

## Current Status

Cosmic Multiverse V1 is a deployed full-stack application with:

- Frontend deployed on Vercel
- Backend deployed on Render
- MongoDB persistence
- GitHub authentication
- Six realm pages
- Realm progression
- Music playback
- XP and leveling
- Profile dashboard
- Leaderboard
- Mobile interface improvements
- Symbolic visual system

The app is currently in V1 stabilization and portfolio polish.

---

## Roadmap

### Phase 1 — V1 Stabilization

- Final QA pass
- Clean README
- Portfolio case study
- Screenshots
- Bug fixes
- Mobile polish
- Production testing

### Phase 2 — Music and Realm Expansion

- Add more tracks per realm
- Expand realm playlists
- Improve soundtrack metadata
- Add more realm-specific copy
- Improve mini player experience
- Add deeper music history stats

### Phase 3 — Ritual Layer

- Daily rituals
- Practice quests
- Sacred Yes entries
- Mood tracking
- Cosmic journal
- Moon calendar

### Phase 4 — Creator and Community Layer

- Artist submissions
- Creator realms
- Public profiles
- Shared progression
- Collaborative worldbuilding
- Community leaderboards

### Phase 5 — Advanced Interaction Layer

- Three.js realm portals
- Animated symbolic maps
- Interactive realm artifacts
- More advanced visual music experiences
- Customizable user paths

---

## Portfolio Positioning

Cosmic Multiverse demonstrates:

- Full-stack application architecture
- Authentication with OAuth
- GraphQL API design
- MongoDB data modeling
- User progression systems
- React component architecture
- Responsive UI design
- Music player state management
- Production deployment
- Creative product design
- Worldbuilding-driven user experience

This project was designed and built as both a technical full-stack application and a creative music platform.

---

## License

MIT