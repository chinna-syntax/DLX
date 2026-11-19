# UniTrade

**Your Campus. Your Community. Your Exchange.**

UniTrade is a local-first student marketplace for buying, selling, giving away, and exchanging books, electronics, lab equipment, project components, and everyday campus essentials.

## Features

- Marketplace browsing, search, filters, saved items, and listing details
- Create, edit, and manage listings
- Student profiles with persistent avatar uploads
- Local demo student switching
- Inbox and direct chat conversations
- Responsive desktop and mobile navigation
- Product image fallbacks and IndexedDB persistence
- Scroll, text, image, card, hover, and page-transition animations

## Technology

- React and TypeScript
- Vite
- React Router
- TanStack Query
- Dexie over IndexedDB
- Lucide React
- Vitest
- CSS motion with IntersectionObserver

## Project structure

```text
src/
  contexts/       Authentication and saved-item state
  db/             Dexie database and seed lifecycle
  services/       Local data and domain services
  types/          Shared TypeScript models
  utils/          Seed data and helpers
  main.tsx        Routes and application UI
  style.css       Design system and responsive motion styles
public/
  images/         Bundled product images
  favicon.svg     UniTrade favicon
```

## Local installation

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Demo student access

Use **Try UniTrade Demo** on the landing, login, or registration screens to continue as the junior or senior sample student. Profiles, favorites, listings, conversations, and uploaded images remain local to the current browser.

## Browser database

UniTrade stores data in IndexedDB through Dexie. The existing database name remains `CampusExchangeDB` so current students, listings, images, favorites, conversations, and messages are preserved during the rebrand. No backend, API credentials, or external database is required.

## Testing and production build

```bash
npm run typecheck
npm test -- --run
npm run build
npm run preview
```

## Vercel deployment

The project is a static Vite single-page application. Deploy the repository to Vercel with the default build command:

```text
npm run build
```

The included `vercel.json` preserves client-side route handling.

## Browser storage limitations

Data is stored only in the current browser profile. Clearing site data, changing browsers, or using a private browsing session removes local profiles, listings, messages, favorites, and uploaded images. This prototype does not sync data between devices.
