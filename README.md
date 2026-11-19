# PeerUp

PeerUp — Connect. Exchange. Grow Together. — is a local-first React marketplace for students. It is a static Vite SPA with no server, API, network database, credentials, or environment variables.

## Development

```bash
npm install
npm run dev
```

Validation commands: `npm run build`, `npm run preview`, `npm run typecheck`, and `npm test`.

## Local architecture

Dexie stores all data in the browser database `CampusExchangeDB`. `src/db/index.ts` defines typed `Students`, `Listings`, `ListingImages`, `Favorites`, `Conversations`, `Messages`, `Reports`, and `AppMetadata` stores. Relationships use ids, while images are compressed Blobs in `ListingImages` with object-url previews. The first launch seeds six students, fifteen listings, and sample conversations/messages. Local services enforce profile ownership and the `AVAILABLE` / `RESERVED` / `EXCHANGED` lifecycle.

Profiles are selected locally by email and can be switched without a backend. Vercel uses a static SPA rewrite for client-side routes.
