# CLAUDE.md — cs-chat-widget

The embeddable guest-chat widget for hotel and vacation-rental sites. Next.js 15 App Router +
React 19 + Tailwind v4, TypeScript. It renders the chat UI, forwards guest messages to
embeddings-encoder, and returns the replies to the browser through a Redis queue the client
drains by polling. No database of its own; Redis is the only stateful dependency.

## Commands

Package manager: **npm** (`package-lock.json`). Only four scripts exist.

- `npm run dev` — `next dev`, port 3000
- `npm run build` / `npm start` — `next build` / `next start`
- `npm run lint` — `next lint` (`next/core-web-vitals`, `next/typescript`)
- **There is no test runner and no test script.** Nothing in CI runs tests.

Env vars actually read by code: `EMBEDDINGS_SERVICE_URL`, `NEXT_PUBLIC_BASE_URL`,
`NEXT_PUBLIC_CHAT_SERVICE_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `NODE_ENV`.
There is **no `.env.example`**, and `dotenv` is a dependency nothing imports. The old
`NEXT_PUBLIC_WIDGET_API_BASE` and every `PUSHER_*` var are read by nothing in `src/`.
Required services: **Redis** (inbound replies die without it), **embeddings-encoder**, and
the chat service (`NEXT_PUBLIC_CHAT_SERVICE_URL`), which serves per-widget config.

Local surfaces: `/` (embed snippet), `/embed-chat` (iframe content), `/booking?widgetId=…`
(full-page chat), `/preview` (offline component gallery, sample data, no network), plus
`public/demo.html`, `test-embed.html`, `test-cross-origin.html`.

## Architecture

**Outbound (guest → agent):** browser `POST /api/widget/messages` → `processWidgetMessage`
(`src/app/actions/widget-actions.ts`) → `POST ${EMBEDDINGS_SERVICE_URL}/widget/message`
(`widget-actions.ts:37`); that POST returns immediately and carries **no** agent reply.
**Inbound (agent → guest):** encoder `POST /api/widget/response` → `processWidgetResponse` →
`queueAgentMessage` → `redis.lpush` on `pending:<conversationId>`, TTL 300s
(`src/services/redis-service.ts:105`). **Drain:** `GET /api/widget/poll?conversationId=…` does
a single `rpop` (`redis-service.ts:119`) — one message per call — every
`POLLING_INTERVAL_MS = 2500`.

Two front ends share that transport and the `src/components/shell/` primitives:

- **Embedded**: `public/chat-widget.js` (a plain script tag on the customer's page) injects a
  button and an iframe pointing at `/embed-chat` → `ChatWidget.tsx`. **The iframe never
  polls**; the loader script polls (`chat-widget.js:44`) and pushes results in via
  `postMessage`, and the iframe posts `CHAT_WIDGET_SEND_MESSAGE` / `_RESIZE` / `_RESET_CHAT`
  back out (`src/types/message-types.ts:1`).
- **Full page**: `/booking?widgetId=…` → `FullPageChatWidget.tsx` — no iframe, no
  postMessage; it fetches `/api/widget/poll` and `/api/widget/messages` same-origin on its
  own 2.5s loop (`FullPageChatWidget.tsx:62`).

**Components** (`src/components/`): `ChatWidget.tsx` (794 lines) and `FullPageChatWidget.tsx`
(742) are the two deliberately parallel roots. Poll-payload fields drive
`HotelCard`/`HotelCarousel`, `Fattal{RoomCard,RoomCarousel,RoomDetailView}`,
`Listing{Card,Carousel,DetailView}` and `GalleryCard`/`GalleryLightbox`; six form components
are keyed by `WidgetFormId` (`ContactForm`, `FattalIdCollectForm`, `FattalOtpVerifyForm`,
`FattalCancellationForm`, `FattalContactUpdateForm`, `GuestDetailsForm`).
`src/components/shell/` holds the 9 chrome primitives both roots compose (`WidgetShell`,
`WelcomeScreen`, `ChatHeader`, `MessageBubble`, `Composer`, `LanguageSelector`,
`QuickActions`, `BackgroundImage`, `DefaultIcon`).

**Config & theming** (`src/config/`, 5 files): `widget-config.ts` (`WidgetConfig` +
`DEFAULT_WIDGET_CONFIG`), `resolve-widget-config.ts` (browser fetch of
`GET ${NEXT_PUBLIC_CHAT_SERVICE_URL}/api/widget-config/<widgetId>`), `theme-config.ts` (six
themes — `default`, `fattal`, `eztlv`, `urban`, `resort`, `luxury`; `DEFAULT_THEME_ID = 'urban'`),
`apply-theme.ts` (writes `--theme-*` custom properties onto `<html>`), `quick-actions.ts`.
`src/hooks/` has two gallery hooks: `useImageNavigation`, `useImagePreloader`.
**Deployment**: `Dockerfile` + `k8s/` (9 manifests) + `aws-dev.yml` (push to `dev` →
namespace `dev`, `dev-widget.ersona.co`) and `aws.yml` (push to `main` → `prod`,
`widget.ersona.co`).

## Key gotchas (verified on origin/dev @ 647caa0)

- **Pusher is dead in this service. Do not add it back.** `src/` contains zero Pusher code —
  the only matches are three stale comments (`ChatWidget.tsx:233`,
  `message-queue-service.ts:8` and `:40`), and `src/services/pusher-service.ts` does not
  exist. The real transport is the Redis queue above. `README.md:13` still advertises
  "Pusher-powered real-time communication"; it is wrong.

- **The Pusher plumbing outside `src/` was never removed, so a mistaken import compiles.**
  `pusher` and `pusher-js` are still dependencies (`package.json`), and both workflows still
  pull `PUSHER_APP_ID` / `PUSHER_SECRET` from Vault and `NEXT_PUBLIC_PUSHER_KEY` /
  `_CLUSTER` from Parameter Store into the ConfigMap (`aws.yml:39-40`, `:69-70`).
  `import Pusher from 'pusher-js'` will type-check, build, connect to a real app, and
  receive nothing forever.

- **`poll` is an unauthenticated, destructive `RPOP` with no ack and no retry.**
  `poll/route.ts:23` pops the message before the client has rendered it, so anyone who knows
  a `conversationId` can drain another guest's queue — and the client can still lose it after
  the pop: `FullPageChatWidget.tsx:147-155` silently discards any payload with no
  message/options/formId/gallery. Nothing re-queues it.

- **No route checks any caller.** There is no `middleware.ts` and no auth/token/JWT check
  anywhere under `src/app/api/`. `POST /api/widget/response` takes `companyId`,
  `conversationId` and `message` straight from the body and queues them as an agent reply
  (`response/route.ts:12` → `widget-response-actions.ts:46`), so anyone can inject a fake
  "agent" message into a live conversation. `checkout`'s `signature` field
  (`checkout/route.ts:8`) is passed through to the encoder, not verified here.

- **`Access-Control-Allow-Origin: '*'` on every widget route** (`src/utils/cors.ts:3`).
  Intentional — the widget is embedded on arbitrary customer domains — but it means
  same-origin policy contributes nothing. Treat all five widget routes as open internet.

- **`next.config.ts` allows `hostname: '**'` over both https and http** (`next.config.ts:6-13`),
  so `/_next/image?url=…` will fetch and re-serve any URL on the internet: an open image
  proxy and an SSRF path out of the pod. It exists because logos, backgrounds and room
  images come from arbitrary customer CDNs; narrow it if you ever get the hostname list.

- **`GET /api/widget/messages` does not exist.** That route exports only `POST`
  (`messages/route.ts:7`) and `OPTIONS` (`:50`). The real GET surface is `/api/widget/poll`,
  `/api/widget/message?key=…` (one-shot Redis `get` by key, separate from the queue), and
  `/api/healthz` — which backs both probes (`k8s/deployment.yaml`) and returns `ok`
  **without touching Redis** (`healthz/route.ts:8-15`), so a Redis outage keeps pods Ready.

- **`POST /api/widget/messages` returning `success: true` does not mean the encoder accepted
  anything.** On encoder failure `widget-actions.ts:90-97` queues a canned apology via
  `queueFallbackMessage` and still returns success. That fallback also writes to Redis, so
  when Redis is what is down the guest sees nothing at all and the client just keeps polling.

- **`queueAgentMessage`'s parameter order is not the payload order.**
  `message-queue-service.ts:10-21` is `(conversationId, message, timestamp, hotelOptions,
  roomSearchResults, formId, formData, languageCode, listingOptions, gallery)` —
  `listingOptions` sits *after* `languageCode`, and the single call site passes ten positional
  arguments (`widget-response-actions.ts:46`). Adding a field means editing both, in place.

- **`NEXT_PUBLIC_*` values are frozen into the bundle at build time.** CI passes
  `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_CHAT_SERVICE_URL` to `npm run build`
  (`aws.yml:99-108`) *and* writes them into the ConfigMap, where they do nothing. Changing one
  requires a rebuild and redeploy; only `EMBEDDINGS_SERVICE_URL` and `REDIS_*` are read at
  runtime and honour a ConfigMap edit plus a restart.

- **The loader script's backend URL is patched by `sed`, not by env.** `public/chat-widget.js:87`
  reads a literal `__WIDGET_SERVICE_URL__` placeholder that CI replaces before the build
  (`aws.yml:87`), falling back to `http://localhost:3000`. Hardcoding a real URL there breaks
  every other environment.

- **CI rewrites `k8s/configmap.yaml` and `k8s/secrets.yaml` before `kubectl apply`.**
  Heredocs at `aws.yml:122` and `:143` (same lines in `aws-dev.yml`) overwrite both files; CI
  also `sed`s every `namespace:`, the deployment image, `hpa.yaml` minReplicas and the ingress
  host/group. **Editing those files in the repo affects nothing.** The generated ConfigMap
  holds exactly the seven Parameter Store keys, so the `NODE_ENV`/`PORT` in the checked-in
  template never reach the cluster.

- **The Dockerfile is `FROM node:21-alpine`** (`Dockerfile:1`) — Node 21 was never an LTS and
  is end-of-life. It also runs `npm install --production` rather than `npm ci` and `COPY`s a
  prebuilt `./.next` (`Dockerfile:10`, `:13`), so `docker build` without a prior
  `npm run build` yields a broken image; CI runs `npm ci && npm run build` first (`aws.yml:92-94`).

- **The widget iframe accepts `postMessage` from any origin.** `ChatWidget.tsx:110-121`
  validates only `event.data.type`, the loader's origin check is commented out
  (`chat-widget.js:187-195`), and the iframe posts outward with target `"*"`
  (`ChatWidget.tsx:191`, `:221`). Any script on the host page can forge an agent message, or
  send as the guest via the exposed `window.__CHATWIDGET__.sendMessage`.

- **`resolveWidgetConfig` never throws and never fails visibly.** A missing `widgetId`, a missing
  `NEXT_PUBLIC_CHAT_SERVICE_URL`, a non-200 or a network error all return `DEFAULT_WIDGET_CONFIG`
  with the `urban` theme, so a misconfigured widget renders a plausible generic hotel chat
  instead of an error. Check the console for `[WidgetConfig]`.

- **There is no chat history.** `localStorage` appears nowhere in `src/`, and
  `chat-widget.js:24-29` clears `sessionStorage` on every page load by design — a reload
  starts a brand-new conversation. `public/demo.html:119` still claims otherwise.

## Conventions

- **Tailwind v4 is the styling system.** `src/app/globals.css:1-2` is `@import "tailwindcss"`
  + `@plugin "@tailwindcss/typography"`; every component styles through `className`.
- **Colors go through theme tokens, never literals.** The `@theme inline` block
  (`globals.css:21-38`) maps `--color-primary` / `-accent` / `-surface` / `-text` / `-border`
  onto `--theme-*` custom properties that `applyThemeToDocument` (`src/config/apply-theme.ts`)
  sets on `<html>` at runtime. Use `bg-primary`, `text-primary`, `bg-accent`, `bg-surface`,
  `text-text`, `border-border`; a hex literal or a stock `bg-blue-600` opts out of theming.
- New API routes: export an `OPTIONS` returning `corsHeaders`, and spread `corsHeaders` into
  **every** `NextResponse` including error paths. Use `StatusCodes` from `http-status-codes`,
  not numeric literals. `src/app/api/widget/checkout/route.ts` is the cleanest template.
- `@/*` → `src/*` is the only path alias (`tsconfig.json:21-23`). Both page entry points are
  `'use client'`, so widget config resolution happens in the browser, not on the server.
- `WidgetFormId` (`message-types.ts:15`) must stay in sync with the encoder's `FattalFormId`
  enum — the same strings are used as `formId` inbound and `formType` outbound.
- Language is the two-value union `'HE' | 'EN'` (`src/utils/i18n.ts:1`). Layout direction
  derives from the language; individual bubbles detect direction from the first character
  via `HEBREW_REGEX`.
- PMS-supplied HTML is sanitized with DOMPurify immediately before every
  `dangerouslySetInnerHTML` (`FattalRoomCard.tsx:32`/`:169`, `FattalRoomDetailView.tsx:59`/`:284`)
  — keep that pairing. Agent text renders as markdown (`shell/MessageBubble.tsx:4`).
- Two phone stacks coexist: `shell/WelcomeScreen.tsx` uses `react-international-phone` +
  `libphonenumber-js`, while `ContactForm` and `GuestDetailsForm` use the older Israel-centric
  `src/utils/phone.ts`. Both normalize through `formatPhoneForStorage` — check which validator
  a surface already uses before adding one.
- Welcome-screen guest contact travels as `meta.guestPhone` / `meta.guestEmail`, deliberately
  **not** as `formData` (`widget-actions.ts:11-18`, `ChatWidget.tsx:209-212`) — `formData` is
  reserved for real form submissions, which the encoder treats differently.
