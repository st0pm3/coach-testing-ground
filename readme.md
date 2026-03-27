## Chess Coach Testing Website

Use this to test the coach. This is a bit of a duct taped website, so you will have to edit `client/src/pages/Home/index.tsx` if you would like to change things around to your liking.

> [!IMPORTANT]
> You need to edit `client/package.json` so that the `wintrchess` library points to your local copy! I haven't published it to NPM yet. I guess I should probably do that.

### Tech Stack

- pnpm
- typescript
- react
- react router *(for SSR)*
- express.js *(with cluster)*

### Setup

`git clone https://github.com/wintrcat/coach-testing-ground .`<br>
`pnpm install`

**Quickstart** - Run `pnpm dev` and then go to the localhost URL it gives you.

#### Scripts

- `pnpm dev` - start frontend dev server with HMR and stuff
- `pnpm [-F <client/server>] build` - build for production
- `pnpm start` - start server

#### Environment Variables

Stored in `.env` in the root directory:

- `ORIGIN` - origin for production server e.g. `http://localhost:8080`
- `DEV_ORIGIN` *(optional)* - origin for dev server; defaults to `http://localhost:3000`
- `THREADS` *(optional)* - number of threads to run server on. defaults to number of available cores
- `VITE_OPENAI_KEY` - API key to be passed to the OpenAI SDK.