### Traque Frontend

Simple web client for Traque - error and event tracking for startups. This app is built with React, Vite, TanStack Router/Query, and Tailwind CSS. It connects to the Traque API.

Learn more about the product on the [Traque website](https://www.traque.dev/).

### Quick start

Prerequisites:
- Node.js 20+ (or Bun 1.1+)

Install dependencies:
```bash
# with Bun (recommended)
bun install

# or with npm
npm install

# or with pnpm / yarn
pnpm install
yarn install
```

Create an `.env` file:
```bash
cp .env.example .env
```
Then set the required variable:
```env
VITE_API_URL=http://localhost:8080
```

Run the app:
```bash
# dev server on http://localhost:5000
bun run dev
# or
npm run dev
```

### AI chat (Vercel AI SDK) and tool results

We use the Vercel AI SDK (`@ai-sdk/react` + `ai`) to stream chat responses and tool calls. The chat UI lives in `src/routes/_authenticated/dashboard/chat/$chatId.tsx` and uses `useChat` with `DefaultChatTransport` to connect to the backend:

- **Transport**: streams from `POST ${VITE_API_URL}/api/v1/ai/agents/:projectId/chat`, sending `threadMetadata.id` (the chat id) plus optional filters (`dateFrom`, `dateTo`).
- **Parts rendering**: each message arrives as parts. We render:
  - **text** via a `Streamdown`-powered `Response` component
  - **reasoning** in a collapsible panel
  - **tool-…** parts with custom UI per tool

- **Tool states**: tools stream through states (`input-streaming` → `input-available` → `output-available` or `output-error`). We expose a generic tool UI in `src/components/ai/tool.tsx` (status badges, params JSON, result/error panel) and add bespoke renderers for productized tools like `getExceptionStatistic` (chart above).

To add a new tool renderer, add a new `case 'tool-yourToolName'` in the switch and return the appropriate component. For generic debugging, use the `Tool`, `ToolInput`, and `ToolOutput` components.

### Scripts

- `dev`: start Vite dev server (port 5000)
- `start`: same as `dev`
- `build`: production build with Vite + type-check with TypeScript
- `serve`: preview the production build
- `test`: run unit tests with Vitest
- `format`: format code with Biome
- `lint:fix`: check and fix with Biome

### Environment

We validate `VITE_API_URL` at runtime. If it is missing or invalid, the app will fail early to avoid silent misconfigurations. Set it to your API base URL.

### Tech stack

- React 19, Vite 6
- TanStack Router + TanStack Query
- Tailwind CSS 4
- Radix UI primitives
- Vitest + Testing Library
- Biome for formatting and linting

### Project structure (high level)

- `src/routes`: app routes (file-based routing with TanStack Router)
- `src/api`: API clients and hooks
- `src/components`: UI components
- `src/config`: environment config (`VITE_API_URL`)
- `src/lib`: shared libraries (auth, utils, etc.)

### Build and deploy

`bun run build` creates a static build in `dist/`. Serve it with any static host or reverse proxy. Remember: Vite env vars are injected at build time.

### Troubleshooting

- App fails to start: check `.env` and ensure `VITE_API_URL` is set.
- Port in use: change the port in `package.json` scripts or stop the other process.
- API CORS errors: verify your backend CORS settings and the `VITE_API_URL` value.

### About Traque

Traque is a simple, effective error and event tracking service with a mobile app. See setup examples and product info on the [Traque website](https://www.traque.dev/).
