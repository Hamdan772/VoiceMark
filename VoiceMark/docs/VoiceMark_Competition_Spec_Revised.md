# VoiceMark
## AI Speaking Coach for Education
### Product Design and Feature Specification

**Competition:** Safe AI Cup 2026 - Generative AI in Education  
**Track:** University Track (18-25 years)  
**Evaluation Criteria:** Innovation 25% | Application 25% | Creativity 20% | Sustainability 20% | Presentation 10%  
**Product Category:** Generative AI | NLP | Speech Recognition | Personalised Learning  
**Document Purpose:** Complete page-by-page design spec with feature improvements, UI guidelines, and competition alignment

---

## 1. Executive Summary

VoiceMark is a privacy-first AI speaking coach for students. It helps users improve spoken communication through a structured loop: choose a speaking mode, generate or select a script, record a practice attempt, receive AI feedback, retry, and compare progress. A separate coach mode supports live rehearsal with a smart teleprompter.

For Safe AI Cup 2026, VoiceMark has been redesigned into a competition-ready product that directly addresses the judging criteria. Every page has one clear job. Every AI feature is visible and explainable. Every ethical concern has a named solution.

### Why VoiceMark is competitive

- **Innovation:** AI-generated improvement tips, speaking personas, session progress tracking
- **Application:** End-to-end working model: record -> transcribe -> analyse -> retry -> compare
- **Creativity:** Speaking personas, template gallery, AI script generation tailored to education
- **Sustainability:** Privacy badge on the studio, accent-aware feedback, transparent AI explanation page
- **Presentation:** Guided flow, polished UI, and a demo arc built into the product story

---

## 2. Full Site Map

VoiceMark is organised as a guided flow. Each page has one primary job and one clear next step.

| Page / Route | Primary Purpose | Key Features | Competition Value |
|---|---|---|---|
| `/` | Product hub and routing | Hero, feature map, CTA buttons, competition framing | Strong first impression, clear narrative |
| `/modes` | Choose speaking context | Mode cards, speaking persona selector, step indicator | Personalised AI feedback context |
| `/templates` | Script setup bridge | AI generation and template gallery in one view | LLM-powered content creation |
| `/record` | Core recording workspace | Recorder, transcription, AI analysis, retry, comparison | The working model judges must see |
| `/coach` | Live rehearsal lane | Teleprompter, word-by-word alignment, real-time scoring | Separate, focused practice mode |
| `/settings` | Microphone calibration | Mic test, volume meter, language/accent setting | Bias mitigation and student safety |
| `/how-it-works` | AI transparency page | Pipeline explainer, data handling, bias note | Ethical design and transparency |
| `/progress` | Session history and growth | Timeline, trend chart, improvement tips log | Demonstrates learning outcomes |
| `/about` | Product context | Mission, education focus, privacy commitment | Trust and competition framing |
| `layout.tsx` | Global shell | Fonts, scroll, preloader, assistant widget | Consistency and polish |
| `flow-path.tsx` | Journey indicator | Step breadcrumb shown on key pages | Helps users orient themselves |

---

## 3. User Flow

The intended student journey is linear, with two optional branches.

### Canonical flow

1. Land on `/` and read the value proposition.
2. Go to `/modes` and select a speaking context.
3. Go to `/templates` to generate or choose a script.
4. Go to `/record` to record a practice attempt.
5. Review the report and retry if needed.
6. Open `/progress` to review session history and improvement.

### Optional branches

- `/coach` for live rehearsal against a script
- `/settings` for microphone calibration and accent/language preference

### Flow design principles

- Each page has one job.
- The `flow-path` component appears on mode, script, studio, and coach pages so users always know where they are.
- The studio page is the core loop and should be reachable in under 3 taps from the home page.
- Coach mode is a separate branch, not a tab inside the studio.
- Settings and how-it-works pages are always accessible from navigation.
- Progress is linked from the studio result screen so the loop feels rewarding.

---

## 4. Page Specifications

### 4.1 Home Page - `/`

**Role:** Marketing hub and routing surface. It sets the tone, earns trust, and sends users into the right lane.

**Layout structure**

- Sticky nav: logo on the left, links in the centre, CTA on the right
- Hero: headline, subheading, and two primary CTAs: Start Practising and Try Coach Mode
- Feature map: four cards for Record and Analyse, Script Studio, Live Coach, and Progress Tracker
- Education callout band: clearly says VoiceMark is built for students preparing for oral exams, debates, presentations, and speaking assessments
- Privacy trust strip: No audio stored, No account required, No ads
- Footer: links, privacy policy, and how-it-works page

**Visual treatment**

- Soft radial gradient background on white
- Large hero typography
- Rounded primary and secondary buttons
- White feature cards with subtle borders and hover lift

**UX goal**

The home page should immediately communicate that the product is educational, private, and easy to start.

---

### 4.2 Mode Selection - `/modes`

**Role:** Set the speaking context so AI feedback and script templates stay relevant to the student’s goal.

**Features**

- `flow-path` at the top with Step 1 highlighted
- Six mode cards in a grid: Oral Exam, Class Presentation, Debate, Job Interview, Public Speech, Free Practice
- Each card shows an icon, title, one-line description, and estimated session length
- Selected card gets an indigo border and checkmark badge
- Speaking persona row below the modes with four options: Student, Debater, TED Speaker, News Anchor
- Persona changes the tone of AI feedback
- Continue button activates after selection and routes to `/templates` with mode context

**Why this matters**

Speaking personas make the feedback feel differentiated and personalized without becoming identity-based profiling.

---

### 4.3 Script Setup - `/templates`

**Role:** Bridge between mode selection and recording. Users arrive with context and leave with a script.

**Layout**

- `flow-path` showing Step 2
- Two-panel layout:
  - Left: AI generation
  - Right: template gallery
- Left panel includes topic input, tone selector, length selector, and Generate Script button
- The generated script appears in an editable textarea before proceeding
- Right panel lists templates filtered by mode
- A preview card at the bottom shows the active script, word count, and estimated speaking time
- Use This Script routes to `/record` with script content in state

**Competition value**

This page is the innovation anchor because judges can see the LLM generating a relevant script live.

---

### 4.4 Studio - `/record`

**Role:** The main working area. Record, transcribe, analyse, retry, and compare.

**States**

- `idle`: loaded script appears above the recorder if available
- `recording`: waveform animation, live timer, stop button, REC indicator
- `processing`: named steps appear in sequence: Transcribing your recording... then Analysing with AI...
- `report`: full report card with scores and AI tips
- `retry-recording`: recording state with a Take 2 badge and previous score shown for motivation
- `comparison`: side-by-side comparison of first attempt and current attempt

**Report card enhancements**

- Overall score with animated ring chart
- Subscores for Pace, Clarity, Confidence, and Script Alignment
- Sentence-level AI tips with highlighted transcript callouts
- Persona-aware summary in the tone of the selected persona
- Replay-linked highlighting for quick review
- Action buttons for Retry This and View Progress

**Competition note**

This page is the core application criterion. It must clearly show the full working loop and make AI processing visible through named stages.

---

### 4.5 Coach Mode - `/coach`

**Role:** Live script rehearsal. It is separate from the studio because rehearsal and analysis are different cognitive tasks.

**Design**

- Dark workspace to signal focus
- `flow-path` as an optional branch
- Teleprompter filling the upper part of the screen
- Current word highlighted, spoken words faded, auto-scroll tied to speech pace
- Bottom panel with live score, pace indicator, and session timer
- End-of-session summary with alignment score and missed words list
- Exit button routes back to `/record` or `/templates`

**UX note**

Coach mode should feel immersive and distraction-free so users can practice with a clear script without being pulled into analysis controls.

---

### 4.6 Settings - `/settings`

**Role:** Microphone calibration and language/accent preference. It is intentionally narrow.

**Components**

- Microphone test with live volume meter
- Input device selector
- Test playback button
- Language and accent setting:
  - English UK
  - English US
  - English Australian
  - Non-native English speaker
- When non-native English speaker is selected, a note explains that VoiceMark prioritizes clarity and structure over accent variation
- On-page data handling notice: audio is processed in the browser and never stored or transmitted

**Why this matters**

This page provides a visible bias-mitigation answer for the Sustainability criterion.

---

### 4.7 How It Works - `/how-it-works`

**Role:** Transparency page for users and judges.

**Content structure**

- What happens when you record: browser capture -> speech recognition or Whisper -> AI analysis -> structured feedback -> report card
- What the AI looks at: pace, filler words, sentence structure, script alignment, persona fit
- What the AI does not do: store audio, identify the speaker, or share data
- Bias and fairness note: accent-aware mode and why it matters
- Limitations section: the AI is a practice tool, not a final assessment

**Competition value**

This page directly supports the Sustainability criterion by making the system explainable and honest about limitations.

---

### 4.8 Progress Tracker - `/progress`

**Role:** Show students that they are improving over time.

**Features**

- Attempt timeline with date, mode, persona, and overall score
- Score trend chart across sessions
- Small subscore trend views for Pace, Clarity, and Confidence
- AI-generated improvement tips log
- Most improved area badge
- All data stored in localStorage only
- Clear storage note at the top of the page

**Why this matters**

This is the most convincing educational outcome feature. It proves the product helps users improve.

---

### 4.9 About - `/about`

**Role:** Product context, mission, and trust.

**Content**

- What VoiceMark is
- Who it is for
- Why it feels human
- Privacy promise and educational focus

---

## 5. Competition Alignment Matrix

| Criterion | Weight | VoiceMark Feature | What Judges See |
|---|---|---|---|
| Innovation | 25% | Sentence-level AI tips, speaking personas, AI script generation | Named AI processing and personalized feedback |
| Application | 25% | End-to-end loop: record -> transcribe -> analyse -> retry -> compare | Fully working demo with visible feedback states |
| Creativity | 20% | Personas change the feedback style, template gallery, teleprompter sync | Distinct user experience and thoughtful interaction design |
| Sustainability | 20% | Accent-aware setting, privacy notice, how-it-works page | Ethical design and bias mitigation |
| Presentation | 10% | Guided flow, step indicator, clean visual system | Clear, polished product storytelling |

---

## 6. Visual Design System

### 6.1 Colour palette

| Role | Hex | Name | Usage |
|---|---|---|---|
| Brand primary | `#4F46E5` | Indigo | Primary buttons, active states, score rings, links |
| Brand secondary | `#7C3AED` | Violet | Gradients, hover states, accent highlights |
| Body text | `#0F172A` | Near-black | Headlines and primary text |
| Secondary text | `#334155` | Slate | Body copy and card text |
| Muted | `#64748B` | Slate-500 | Labels, placeholders, helper text |
| Surface | `#F1F5F9` | Slate-100 | Card backgrounds and input fills |
| Border | `#E2E8F0` | Slate-200 | Card borders and dividers |
| Success | `#059669` | Green | Ethics badges and progress improvements |
| Warning | `#D97706` | Amber | Processing states and caution notices |
| Error | `#DC2626` | Red | Low scores and critical flags |

### 6.2 Typography

| Role | Font | Size | Usage |
|---|---|---|---|
| Page hero | Inter or system-ui | 56-64px | Home hero headline |
| Section header | Inter | 32-40px | Page titles |
| Card title | Inter | 20-22px | Component headings |
| Body | Inter | 16-18px | Descriptions and report text |
| Mono / code | JetBrains Mono | 14px | Route labels, scores, timestamps |
| Muted label | Inter | 13-14px | Secondary guidance and step labels |

### 6.3 Component rules

- Cards: white background, 1px border, 12px radius, 24px padding, hover lift
- Buttons: primary indigo, rounded-full, generous padding
- Selected state: 2px indigo border and light indigo background tint
- Step indicator: horizontal pill row with completed, current, and upcoming states
- Score ring: animated SVG circle with green to amber to red transitions
- Info boxes: left border, tinted background, concise copy
- Coach mode override: dark background, white text, indigo accents

---

## 7. New Feature Specifications

### 7.1 Speaking Personas - `/modes`

**What it is:** Four persona cards that change the tone of AI feedback.

**LLM impact:** The selected persona is injected into the analysis prompt.

**Why it wins:** It makes feedback feel more tailored and creative without relying on personal data.

**Ethics:** Personas are feedback styles, not demographic profiling.

---

### 7.2 Sentence-Level AI Tips - `/record`

**What it is:** The analysis returns structured sentence-level tips.

**UI:** Flagged sentences are underlined and can reveal a tip callout.

**Why it wins:** Judges can see the AI producing specific and actionable feedback.

---

### 7.3 Progress Tracker - `/progress`

**What it is:** A local-only history and trend page that shows improvement over time.

**Why it wins:** It demonstrates measurable learning outcomes.

**Ethics:** No server storage and no account required.

---

### 7.4 How It Works - `/how-it-works`

**What it is:** A transparency page that explains the AI pipeline and limitations.

**Why it wins:** It directly addresses ethical design and bias mitigation.

---

### 7.5 Accent-Aware Feedback - `/settings`

**What it is:** A setting that prevents accent differences from being treated as mistakes.

**Visible confirmation:** A banner on the studio when accent-aware feedback is active.

**Why it wins:** It is a concrete fairness feature, not a vague policy statement.

---

## 8. Summary

VoiceMark is designed as a guided educational product, not just a recording tool. The pages are separated by purpose, the flow is easy to follow, and the most important AI features are visible, explainable, and ethically framed.

This makes the product easier to understand, easier to demo, and better aligned with the Safe AI Cup 2026 evaluation criteria.
