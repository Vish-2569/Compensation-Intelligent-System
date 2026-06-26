# Compensation Intelligence

This project helps a candidate compare software compensation offers without relying on a single public source. The app mixes a small dataset of compensation records with a simple interface for browsing roles, comparing offers, and reviewing a draft negotiation message.

## What the project does

The main workflow is:

1. Browse compensation data by role, company, level, and location.
2. Submit a new compensation record from the form.
3. Compare two offers side by side.
4. Ask the advisor endpoint for a draft negotiation response.
5. Generate a simple offer-card image when a Gemini API key is available.

The project is intentionally lightweight. It is built as a single Express server with a Vite-powered React frontend so it can run locally without a larger application framework.

## Architecture

- Frontend: React with Vite and Tailwind CSS for the UI.
- Server: Express serves the API routes and also handles the development server in local mode.
- Data: compensation records, level mappings, and locations are defined in the source tree and seeded in memory for the demo.
- AI features: the advisor endpoint uses Groq, and the image route uses Gemini.

## Why these technologies were chosen

- React and Vite keep the interface interactive and quick to iterate on.
- Express is enough for the API surface in this project and keeps the setup simple.
- Tailwind CSS makes the layout changes easier without introducing a lot of custom styling infrastructure.
- Recharts is used for the small set of salary comparison charts that the app renders.
- Groq and Gemini are used only for the advisor and image-generation features, so those parts remain optional when credentials are missing.

## Setup

Prerequisites:

- Node.js 20 or newer
- npm

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Set the required values in [.env.local](.env.local):

- GROQ_API_KEY for the advisor endpoint
- GEMINI_API_KEY for image generation
- APP_URL if you want to use it in self-referential links

Start the app:

```bash
npm run dev
```

The app should then be available on the local Express/Vite server.

## Assumptions and limitations

- The compensation data is stored in memory for the demo. Submissions are not persisted across restarts.
- The authentication flow uses simple in-memory credentials for local development.
- The advisor response is generated from a prompt and depends on the Groq API being configured.
- The image generation endpoint is optional and will return an error when the Gemini key is not set.

## Future improvements

- Replace the in-memory store with a database.
- Add a real user model and password hashing.
- Introduce proper validation and pagination for the compensation list.
- Separate the API and frontend into distinct services if the project grows.

## Known issues

- The project is still a demo and is not meant for production use without additional security and persistence work.
- Some UI states depend on network responses from the local server.
