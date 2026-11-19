# Local database

PeerUp uses Dexie over IndexedDB. The database is named `CampusExchangeDB` for compatibility with existing local data.
and is created by `src/db.ts`.

| Store | Purpose |
| --- | --- |
| `users` | Student profiles and listing counts |
| `auth` | Local profile credentials |
| `listings` | Marketplace items and denormalized seller snapshots |
| `images` | Listing image metadata |
| `saved` | Per-profile favorites with a compound unique key |
| `conversations` / `messages` | Local inbox and chat history |
| `reports` | Local moderation reports |

`seedDatabase()` is idempotent and creates six profiles, fifteen listings, and
sample relationships on the first launch. There are no API routes, server
credentials, JWTs, or required environment variables.
