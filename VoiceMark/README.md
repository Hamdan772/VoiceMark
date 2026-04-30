# VoiceMark

VoiceMark is a privacy-first AI speech coach built with Next.js.
It helps you analyze speaking quality and practice script delivery with live feedback.

## What You Can Do

- Record speech in the browser and get a full analysis report
- Detect filler words, pacing issues, hedging language, and repetition
- Retry and compare results side by side
- Train with a custom script in Coach Mode using live transcription alignment

## Feature Map

The app has a few distinct feature groups, and some of them are intentionally combined into one workflow:

### Keep Separate

- **Practice analysis**: record, transcribe, analyze, and compare results
- **Coach mode**: live alignment against a pasted script
- **Reference pages**: About and Privacy
- **System support**: loading, preloading, assistant widget, and calibration settings

### Combine Together

- **Mode selection + template selection**: both are part of the same practice setup step
- **Home + Record entry points**: both lead into the same core practice flow, but the home page acts as the branded landing surface while `/record` is the working studio
- **Loading experiences**: `app/loading.tsx` and `components/brand-preloader.tsx` serve the same branding purpose and can be treated as one visual system
- **Calibration surfaces**: the recorder-local calibration trigger and the Settings calibration page both belong to the microphone setup flow

### Similar Feature Clusters

- **Setup cluster**: `/modes`, `/templates`, and the record page onboarding controls
- **Practice cluster**: `/record`, analysis APIs, report cards, and comparison views
- **Coaching cluster**: `/coach`, teleprompter, and alignment helpers
- **Support cluster**: `/settings`, assistant widget, and shared loading UI

## Coach Mode

Coach Mode lives at `/coach` and is built for deliberate practice.

1. Paste a script
2. Start speaking
3. Watch matching words turn green
4. See inaccurate or extra words in red
5. Use live tips to improve your next pass

Alignment behavior is designed to stay smooth:
- Matched words: green
- Inaccurate words: red (expected word is shown on hover)
- Missing words: lightly struck red
- Extra words: soft red

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Groq SDK (Whisper + Llama)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run locally

```bash
npm run dev
```

Open `http://localhost:3000`

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run lint checks
- `npm run typecheck` - Run TypeScript checks
- `npm run check` - Run typecheck and production build

## Project Structure

```text
app/
  api/
    analyze/route.ts        # analysis endpoint
    transcribe/route.ts     # Whisper transcription endpoint
  coach/page.tsx            # script training with live alignment
  record/page.tsx           # record-focused capture flow
  page.tsx                  # landing + app entry flow
components/
  voice-recorder.tsx        # recording/transcribe/analyze orchestration
  report-card.tsx           # single run report UI
  comparison-view.tsx       # retry comparison UI
lib/
  analysis.ts               # deterministic analysis heuristics
  coach.ts                  # token alignment + coaching helpers
  env.ts                    # environment validation helpers
  http.ts                   # shared API error helpers
  types.ts                  # shared types
```

## Privacy

- Keep API keys in environment variables only
- Do not commit `.env.local`
- App flows are designed not to store user audio

## Deployment

1. Push repository to GitHub
2. Import into Vercel
3. Add `GROQ_API_KEY` for Production, Preview, and Development
4. Deploy
