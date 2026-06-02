# Requirements Document

## Introduction

This document defines the requirements for the Masidy AI Platform roadmap — a four-phase expansion of the existing Masidy platform (live at masidy.com) that transforms it from a multi-model AI chat tool into a comprehensive all-in-one AI platform.

The platform currently provides six AI models (Masidy, Masidy Flash, Masidy Code, Masidy Mini, Masidy Pro, Masidy Speed), real-time web search, memory across conversations, file upload with RAG, voice input/output, image generation, and various utility tools — all built on Next.js, Vercel, Neon DB, Upstash Redis, and Vercel Blob.

The roadmap adds: monetization via subscription tiers (Phase 1), high-quality media generation (Phase 2), an AI-powered app builder with live preview (Phase 3), and platform polish with marketing pages and onboarding (Phase 4).

The target audience is young creators, developers, content creators, and freelancers aged 18–35 in UAE, Saudi Arabia, Egypt, India, and Nigeria who use AI daily but find existing tools expensive and fragmented. The value proposition is: everything that costs $20–50/month elsewhere, for $10/month on one platform.

---

## Glossary

- **Platform**: The Masidy AI Platform accessible at masidy.com.
- **Subscription_Manager**: The backend service responsible for creating, verifying, updating, and cancelling user subscriptions via Stripe.
- **Usage_Enforcer**: The backend middleware that checks a user's current-period usage against their tier limits before processing any AI request.
- **Tier**: One of three subscription levels — Free, Plus ($5/month), or Pro ($10/month).
- **Stripe**: The third-party payment processor used for subscription billing.
- **Stripe_Webhook_Handler**: The API route that receives and verifies Stripe lifecycle events (subscription created, updated, cancelled, payment failed).
- **Pricing_Page**: The public-facing page at masidy.com/pricing describing tier features and pricing.
- **Upgrade_Prompt**: The UI component displayed inline when a user's usage reaches or exceeds their tier limit.
- **Image_Generator**: The backend service that produces AI-generated images using FLUX or Stable Diffusion XL via Replicate.
- **Video_Generator**: The backend service that produces AI-generated videos via Kling API or Luma.
- **Voice_Engine**: The ElevenLabs-powered text-to-speech and speech-to-text service.
- **App_Builder**: The AI-assisted multi-file code editor with live preview capability.
- **Sandbox**: The isolated execution environment (WebContainers or iframe-based) that renders and runs user-created web projects.
- **Project**: A collection of source files managed together within the App_Builder.
- **Project_Context**: The full set of file contents for a Project that is supplied to the AI model when requesting code edits or additions.
- **Vercel_Deployer**: The service that packages a Project and deploys it to Vercel using the Vercel Deploy API.
- **Landing_Page**: The public marketing page at masidy.com that describes the platform for unauthenticated visitors.
- **Onboarding_Flow**: The guided sequence of screens shown to a newly registered user after their first login.
- **Analytics_Dashboard**: The internal view within the user dashboard showing usage statistics, model preferences, and generation history.
- **Brand_System**: The Masidy visual identity — orange (#F97316) accent color, dot-grid icon, SunDim model icons, and Masidy typeface — applied consistently across the Platform.
- **Guest_User**: An unauthenticated user granted limited access via the existing guest session mechanism.
- **Regular_User**: An authenticated user with an email and password account.
- **Subscriber**: A Regular_User with an active paid Stripe subscription (Plus or Pro tier).
- **Message**: A single user-submitted prompt or AI-generated response within a chat conversation.
- **Generation_Credit**: A unit of quota consumed when a user requests an image or video from the Image_Generator or Video_Generator.

---

## Requirements

---

### Requirement 1: Subscription Tier Definition

**User Story:** As a product owner, I want three clearly defined subscription tiers with distinct usage limits, so that the Platform can sustainably serve different user segments.

#### Acceptance Criteria

1. THE Platform SHALL support exactly three tiers: Free, Plus, and Pro.
2. THE Platform SHALL enforce the following limits for the Free tier: 20 Messages per day across all models, 3 image generations per day, 0 video generations per day, 1 active Project in the App_Builder, and access to the Masidy and Masidy Flash models only.
3. THE Platform SHALL enforce the following limits for the Plus tier ($5/month): 200 Messages per day across all models, 20 image generations per day, 5 video generations per day, 5 active Projects in the App_Builder, and access to all six AI models.
4. THE Platform SHALL enforce the following limits for the Pro tier ($10/month): 1000 Messages per day across all models, 100 image generations per day, 30 video generations per day, unlimited active Projects in the App_Builder, and access to all six AI models.
5. THE Platform SHALL assign the Free tier to all newly registered Regular_Users by default.
6. THE Platform SHALL assign the Free tier to all Guest_Users with the following overrides: 5 Messages per day and 0 image or video generations.

---

### Requirement 2: Stripe Subscription Integration

**User Story:** As a Regular_User, I want to subscribe, upgrade, downgrade, and cancel my plan through Stripe, so that I can manage my billing without leaving the Platform.

#### Acceptance Criteria

1. WHEN a Regular_User initiates a purchase for the Plus or Pro tier, THE Subscription_Manager SHALL create a Stripe Checkout session and redirect the user to the Stripe-hosted payment page.
2. WHEN Stripe emits a `checkout.session.completed` event, THE Stripe_Webhook_Handler SHALL verify the Stripe signature, then create or update the user's subscription record in the database with the tier, Stripe subscription ID, and current period end date.
3. WHEN Stripe emits an `invoice.payment_succeeded` event, THE Stripe_Webhook_Handler SHALL extend the user's subscription period end date to match the new Stripe period end.
4. WHEN Stripe emits an `invoice.payment_failed` event, THE Stripe_Webhook_Handler SHALL mark the user's subscription as `past_due` in the database and send a payment failure notification email to the user.
5. WHEN Stripe emits a `customer.subscription.deleted` event, THE Stripe_Webhook_Handler SHALL downgrade the user's tier to Free and clear the subscription record from the database.
6. WHEN a Subscriber requests a plan downgrade, THE Subscription_Manager SHALL schedule the downgrade at the end of the current billing period rather than immediately, preserving remaining paid access.
7. IF the Stripe_Webhook_Handler receives a webhook with an invalid or missing Stripe signature, THEN THE Stripe_Webhook_Handler SHALL reject the request with HTTP 400 and log the rejection.
8. THE Subscription_Manager SHALL store the following fields per user subscription: `stripeCustomerId`, `stripeSubscriptionId`, `tier`, `status` (active, past_due, cancelled), and `currentPeriodEnd`.

---

### Requirement 3: Usage Limit Enforcement

**User Story:** As a platform operator, I want usage limits enforced server-side per tier, so that users cannot exceed their quota regardless of client-side state.

#### Acceptance Criteria

1. WHEN a user submits a Message to the chat API, THE Usage_Enforcer SHALL retrieve the user's current-day message count from Upstash Redis before forwarding the request to any AI model.
2. IF a user's current-day message count meets or exceeds the tier's daily message limit, THEN THE Usage_Enforcer SHALL reject the request with HTTP 429 and a structured error response indicating the reason as `rate_limit:daily_messages`.
3. WHEN a user requests an image generation, THE Usage_Enforcer SHALL verify the user's current-day image generation count against the tier limit before invoking the Image_Generator.
4. WHEN a user requests a video generation, THE Usage_Enforcer SHALL verify the user's current-day video generation count against the tier limit before invoking the Video_Generator.
5. THE Usage_Enforcer SHALL reset all daily counters at midnight UTC for every user.
6. WHILE a user's subscription status is `past_due`, THE Usage_Enforcer SHALL apply Free tier limits to that user's requests.
7. THE Usage_Enforcer SHALL increment the relevant usage counter in Upstash Redis atomically after each successful AI request completes.
8. IF an AI model request fails before producing output, THEN THE Usage_Enforcer SHALL NOT increment the usage counter for that request.

---

### Requirement 4: Pricing Page

**User Story:** As a visitor to masidy.com, I want to see a clear pricing page, so that I can compare tiers and decide which plan to purchase.

#### Acceptance Criteria

1. THE Pricing_Page SHALL be accessible at the path `/pricing` on masidy.com without authentication.
2. THE Pricing_Page SHALL display all three tiers side by side with tier name, monthly price in USD, and a complete feature list for each tier.
3. THE Pricing_Page SHALL visually distinguish the Pro tier as the recommended option using the Brand_System orange accent color.
4. WHEN an unauthenticated visitor clicks an upgrade button, THE Pricing_Page SHALL redirect the visitor to the registration page with the selected tier pre-selected.
5. WHEN an authenticated Regular_User on the Free tier clicks an upgrade button, THE Pricing_Page SHALL initiate the Stripe Checkout flow for the selected tier.
6. WHEN an authenticated Subscriber views the Pricing_Page, THE Pricing_Page SHALL indicate their current active tier with a visual highlight and replace that tier's upgrade button with a "Current Plan" label.
7. THE Pricing_Page SHALL display all text content in both English and Arabic, auto-selecting the language based on the user's browser locale.

---

### Requirement 5: Upgrade Prompts

**User Story:** As a Regular_User who has reached my plan limit, I want a clear prompt to upgrade, so that I can continue using the Platform without interruption.

#### Acceptance Criteria

1. WHEN the Usage_Enforcer rejects a Message with `rate_limit:daily_messages`, THE Upgrade_Prompt SHALL appear inline within the chat interface displaying the user's current usage, their tier limit, and a direct link to the Pricing_Page.
2. WHEN the Usage_Enforcer rejects an image generation request, THE Upgrade_Prompt SHALL appear within the image generation UI with the same structure as criterion 1.
3. THE Upgrade_Prompt SHALL display the specific benefit the user would gain by upgrading (e.g., "Upgrade to Pro for 1000 messages/day").
4. THE Upgrade_Prompt SHALL include a primary call-to-action button that opens the Stripe Checkout flow for the next tier above the user's current tier.
5. WHEN a Guest_User reaches a usage limit, THE Upgrade_Prompt SHALL offer both account registration and tier upgrade as distinct options.
6. THE Upgrade_Prompt SHALL follow the Brand_System visual identity using the orange accent color for the primary CTA.

---

### Requirement 6: High-Quality Image Generation

**User Story:** As a content creator, I want to generate high-quality images from text prompts, so that I can produce professional visuals without leaving the Platform.

#### Acceptance Criteria

1. WHEN a user submits a text prompt for image generation, THE Image_Generator SHALL produce an image using FLUX (via Replicate) as the primary provider and Stable Diffusion XL as the fallback provider.
2. THE Image_Generator SHALL return a generated image with a minimum resolution of 1024×1024 pixels.
3. WHEN a user requests image generation, THE Image_Generator SHALL complete the generation and return the image URL within 30 seconds.
4. IF the primary Replicate provider fails or returns an error, THEN THE Image_Generator SHALL automatically retry using the Stable Diffusion XL fallback provider without requiring user action.
5. THE Image_Generator SHALL store generated image files in Vercel Blob and return a permanent CDN URL to the user.
6. WHEN a user specifies an aspect ratio (square, landscape, portrait), THE Image_Generator SHALL generate the image in the requested aspect ratio.
7. THE Image_Generator SHALL replace the existing Pollinations-based image generation entirely; no new image requests SHALL be routed to Pollinations.
8. IF the Image_Generator fails on both primary and fallback providers, THEN THE Image_Generator SHALL return a structured error response with a user-readable message and SHALL NOT consume a Generation_Credit for that request.
9. THE Platform SHALL display generated images inline within the chat message stream using the existing artifact rendering system.

---

### Requirement 7: Video Generation

**User Story:** As a content creator, I want to generate short AI videos from text or image prompts, so that I can produce dynamic media content on the Platform.

#### Acceptance Criteria

1. WHEN a user submits a text-to-video prompt, THE Video_Generator SHALL submit the request to Kling API as the primary provider and Luma as the fallback provider.
2. THE Video_Generator SHALL generate videos with a minimum duration of 3 seconds and a maximum duration of 10 seconds per generation request.
3. WHEN a user submits an image-to-video prompt with an attached image, THE Video_Generator SHALL use the attached image as the first frame of the generated video.
4. WHEN a video generation job is submitted, THE Video_Generator SHALL return a job ID and begin polling the provider asynchronously, streaming progress updates to the client.
5. WHEN a video generation job completes, THE Video_Generator SHALL store the video file in Vercel Blob and return the CDN URL to the client.
6. WHEN a video generation job fails, THE Video_Generator SHALL retry on the fallback provider before surfacing an error to the user, and SHALL NOT consume a Generation_Credit for that request.
7. THE Platform SHALL display completed videos inline within the chat message stream with playback controls (play, pause, download).
8. Video generation SHALL be available exclusively to Plus and Pro subscribers; Free tier users attempting video generation SHALL receive the Upgrade_Prompt.

---

### Requirement 8: High-Quality Voice with ElevenLabs

**User Story:** As a user who relies on voice interaction, I want natural-sounding AI voice output, so that the Platform feels conversational and accessible.

#### Acceptance Criteria

1. THE Voice_Engine SHALL use ElevenLabs as the text-to-speech provider for all AI-generated voice output, replacing the existing voice implementation.
2. WHEN the Platform produces an AI text response and voice output is enabled, THE Voice_Engine SHALL synthesize the response using an ElevenLabs voice that matches the Masidy brand character.
3. THE Voice_Engine SHALL support at minimum the following languages for synthesis: English, Arabic, French, Hindi, and Urdu.
4. WHEN a user submits voice input, THE Voice_Engine SHALL transcribe the audio to text using the existing speech-to-text pipeline and pass the result to the chat API.
5. THE Voice_Engine SHALL produce audio output with a latency of no more than 3 seconds for responses up to 200 words.
6. WHERE the ElevenLabs API is unavailable, THE Voice_Engine SHALL fall back to the browser's native Web Speech API for text-to-speech synthesis.
7. ElevenLabs voice output SHALL be available to Plus and Pro subscribers; Free tier users SHALL receive browser-native voice synthesis only.

---

### Requirement 9: App Builder — Code Editor and File System

**User Story:** As a developer or creator, I want a multi-file code editor within the Platform, so that I can build, edit, and save entire web projects with AI assistance.

#### Acceptance Criteria

1. THE App_Builder SHALL provide a multi-file editor supporting the creation, editing, renaming, and deletion of files within a Project.
2. THE App_Builder SHALL support the following file types: HTML, CSS, JavaScript, TypeScript, JSX, TSX, JSON, Markdown, and plain text.
3. WHEN a user creates a new file within a Project, THE App_Builder SHALL persist the file to Vercel Blob under the user's project namespace.
4. WHEN a user edits and saves a file, THE App_Builder SHALL persist the updated content to Vercel Blob and update the file's `updatedAt` timestamp in the database.
5. THE App_Builder SHALL display a file tree panel listing all files in the active Project, allowing navigation between files without losing unsaved changes in other open files.
6. WHEN a user requests AI assistance within the App_Builder, THE App_Builder SHALL include the full Project_Context (all current file contents) in the AI model request, up to a maximum of 100,000 tokens.
7. IF the Project_Context exceeds 100,000 tokens, THEN THE App_Builder SHALL include only the currently active file plus the most recently modified files until the token limit is reached, and SHALL notify the user which files were excluded.
8. THE App_Builder SHALL highlight syntax for all supported file types using the existing code-block component.
9. WHEN a user deletes a Project, THE App_Builder SHALL delete all associated files from Vercel Blob and the corresponding database records, requiring explicit confirmation from the user before proceeding.

---

### Requirement 10: App Builder — Live Preview Sandbox

**User Story:** As a developer, I want to see a live preview of my project as I code, so that I can iterate quickly without switching to an external browser.

#### Acceptance Criteria

1. THE Sandbox SHALL render a live preview of the active Project in a panel adjacent to the code editor, updating the preview when the user saves a file.
2. THE Sandbox SHALL support projects using HTML, CSS, and JavaScript without any build step, rendering directly in the preview panel.
3. THE Sandbox SHALL support projects using a Vite-compatible build configuration via WebContainers, enabling React, Vue, and plain TypeScript projects.
4. WHEN the Sandbox encounters a JavaScript runtime error in the preview, THE Sandbox SHALL display the error message with file and line number in an overlay within the preview panel without crashing the App_Builder.
5. THE Sandbox SHALL isolate execution from the parent Platform window, preventing preview code from accessing the user's session tokens, cookies, or local storage.
6. WHEN the active file is saved, THE Sandbox SHALL refresh the preview within 2 seconds.
7. WHERE WebContainers are unavailable in the user's browser, THE Sandbox SHALL fall back to an iframe-based rendering approach for HTML/CSS/JS projects only.

---

### Requirement 11: App Builder — One-Click Vercel Deploy

**User Story:** As a developer, I want to deploy my App_Builder project to Vercel with one click, so that I can share a live URL without leaving the Platform.

#### Acceptance Criteria

1. WHEN a Pro subscriber clicks the deploy button within the App_Builder, THE Vercel_Deployer SHALL package the active Project's files and submit a deployment request to the Vercel Deploy API.
2. WHEN a deployment is initiated, THE Vercel_Deployer SHALL display a progress indicator in the App_Builder UI and stream status updates until the deployment completes or fails.
3. WHEN a deployment succeeds, THE Vercel_Deployer SHALL display the live deployment URL within the App_Builder and allow the user to copy or open it directly.
4. WHEN a deployment fails, THE Vercel_Deployer SHALL display the error reason from the Vercel API and offer a retry option.
5. THE Vercel_Deployer SHALL require the user to connect their Vercel account (via OAuth) before initiating their first deployment; subsequent deployments SHALL use the stored OAuth token.
6. One-click deploy SHALL be available exclusively to Pro subscribers; Plus and Free tier users attempting to deploy SHALL receive the Upgrade_Prompt with a description of the Pro tier benefit.
7. IF the Vercel OAuth token is expired or revoked, THEN THE Vercel_Deployer SHALL prompt the user to re-authenticate before retrying the deployment.

---

### Requirement 12: Masidy Brand Consistency

**User Story:** As a product owner, I want all new features to use the Masidy Brand_System consistently, so that the Platform feels cohesive and professional across every surface.

#### Acceptance Criteria

1. THE Platform SHALL apply the orange accent color (#F97316) as the primary interactive color (buttons, links, focus rings, active states) on all new pages and components introduced in Phases 1 through 4.
2. THE Platform SHALL use SunDim icons for all model selector entries across new and existing UI surfaces.
3. THE Platform SHALL use the orange dot-grid icon as the Masidy logo mark on all new pages, the Landing_Page, and the Pricing_Page.
4. WHEN animated transitions are applied to new components, THE Platform SHALL use easing curves and durations consistent with the existing chat animation system (200ms ease-out for micro-interactions, 350ms ease-in-out for panel transitions).
5. THE Platform SHALL display the Masidy wordmark in the header of every authenticated page.
6. All new form inputs, buttons, and modals SHALL follow the spacing, border-radius, and typography conventions established in `app/globals.css` and the existing component library.

---

### Requirement 13: Landing Page

**User Story:** As a potential user visiting masidy.com, I want an informative landing page, so that I can quickly understand what the Platform offers and decide to sign up.

#### Acceptance Criteria

1. THE Landing_Page SHALL be accessible at the root path `/` on masidy.com to unauthenticated visitors.
2. THE Landing_Page SHALL include a hero section with the Masidy tagline, a primary sign-up CTA, and a visual demonstration of the Platform's key capabilities.
3. THE Landing_Page SHALL include a features section highlighting: multi-model AI chat, image generation, video generation, the App_Builder, voice interaction, and web search.
4. THE Landing_Page SHALL include a pricing summary section linking to the full Pricing_Page.
5. THE Landing_Page SHALL include a social proof section (testimonials, user counts, or supported languages) relevant to the target markets of UAE, Saudi Arabia, Egypt, India, and Nigeria.
6. THE Landing_Page SHALL load and reach Largest Contentful Paint within 2.5 seconds on a simulated 4G connection as measured by Vercel Analytics or Lighthouse.
7. THE Landing_Page SHALL be fully responsive and correctly display on screen widths from 320px to 1920px.
8. WHEN an authenticated Regular_User visits the root path `/`, THE Platform SHALL redirect the user to the main chat interface instead of rendering the Landing_Page.

---

### Requirement 14: Onboarding Flow

**User Story:** As a new Regular_User, I want a guided onboarding experience, so that I quickly understand how to get value from the Platform.

#### Acceptance Criteria

1. WHEN a Regular_User logs in for the first time after account creation, THE Onboarding_Flow SHALL present a multi-step modal overlay covering: welcome message, model selection explanation, first message suggestion, and file upload capability overview.
2. THE Onboarding_Flow SHALL complete in no more than 4 steps, with each step fitting on a single screen without scrolling on a 375px-wide mobile viewport.
3. WHEN the user completes all onboarding steps, THE Onboarding_Flow SHALL send the user's first suggested message to the chat automatically using the Masidy model.
4. WHEN the user dismisses the Onboarding_Flow early, THE Platform SHALL record the dismissal in the user's profile and SHALL NOT show the Onboarding_Flow again on subsequent logins.
5. THE Onboarding_Flow SHALL follow the Brand_System including the orange dot-grid icon, orange CTA buttons, and Masidy animations.
6. THE Platform SHALL display the Onboarding_Flow in the user's detected language (Arabic or English) based on the browser locale.
7. WHERE the user's browser locale is Arabic, THE Onboarding_Flow SHALL render all text right-to-left.

---

### Requirement 15: Usage Analytics Dashboard

**User Story:** As a Regular_User, I want to see my usage statistics in my dashboard, so that I can track consumption and understand which models and features I use most.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL display the user's current-day usage versus their tier's daily limit for: messages sent, images generated, and videos generated.
2. THE Analytics_Dashboard SHALL display a 30-day usage trend chart showing daily message counts.
3. THE Analytics_Dashboard SHALL display the user's most-used AI model over the past 30 days.
4. THE Analytics_Dashboard SHALL display the user's current subscription tier, billing renewal date (for subscribers), and a link to manage billing via the Stripe Customer Portal.
5. WHEN a user's current-day usage reaches 80% of a tier limit, THE Analytics_Dashboard SHALL highlight the relevant metric in the orange accent color.
6. THE Analytics_Dashboard SHALL refresh usage counters without a full page reload, polling the dashboard API at most once every 60 seconds.
7. THE Analytics_Dashboard SHALL present all data in a layout consistent with the existing dashboard at `/dashboard`, extending rather than replacing the current memory and document views.

---

### Requirement 16: Multilingual and RTL Support

**User Story:** As a user in the Arab world or India, I want the Platform's new pages to support my language and text direction, so that I have a native experience.

#### Acceptance Criteria

1. THE Platform SHALL support English and Arabic as the two primary UI languages across all new pages introduced in the roadmap (Landing_Page, Pricing_Page, Onboarding_Flow, App_Builder UI, Analytics_Dashboard).
2. WHEN the browser locale is set to an Arabic locale (`ar`, `ar-AE`, `ar-SA`, `ar-EG`), THE Platform SHALL render all new page content in Arabic with right-to-left text direction.
3. THE Platform SHALL use an `i18n` solution that stores translation strings in separate locale files, allowing community contributions for additional languages without code changes.
4. IF a translation string is missing for the active locale, THEN THE Platform SHALL fall back to the English string and log a missing-translation warning to the console in non-production environments.
5. All new UI components SHALL use logical CSS properties (`margin-inline-start`, `padding-inline-end`, etc.) rather than physical properties (`margin-left`, `padding-right`) to support RTL rendering without duplication.

---

### Requirement 17: Performance and Reliability

**User Story:** As a Platform operator, I want all new features to meet performance and reliability standards consistent with the existing system, so that user experience does not degrade as the Platform grows.

#### Acceptance Criteria

1. THE chat API SHALL maintain a median response time-to-first-token of no more than 1500ms for all six AI models under normal load conditions.
2. THE Image_Generator SHALL complete image generation requests within 30 seconds at the 95th percentile.
3. THE Stripe_Webhook_Handler SHALL process and acknowledge all incoming Stripe webhook events within 5 seconds of receipt to prevent Stripe from retrying prematurely.
4. THE Usage_Enforcer SHALL add no more than 50ms of latency to the chat API request pipeline when reading and writing counters via Upstash Redis.
5. WHEN the Upstash Redis service is unavailable, THE Usage_Enforcer SHALL fail open (allow the request to proceed) for Free and Plus tier users and log the incident, to avoid blocking all users during an infrastructure outage.
6. THE Platform SHALL maintain 99.5% monthly uptime for all user-facing routes as measured by Vercel Analytics.
7. All new database queries introduced for subscriptions, projects, and usage tracking SHALL use indexed columns for user ID lookups to maintain query latency below 20ms at the 95th percentile.

---

### Requirement 18: Security

**User Story:** As a Regular_User, I want my subscription data, generated content, and project files to be protected, so that I can trust the Platform with sensitive work.

#### Acceptance Criteria

1. THE Stripe_Webhook_Handler SHALL verify the Stripe webhook signature on every incoming request using the `stripe-signature` header and the Stripe endpoint secret before processing the payload.
2. THE Platform SHALL never expose Stripe secret keys, ElevenLabs API keys, Replicate API keys, or Kling/Luma API keys in client-side code or API responses.
3. WHEN a user requests access to a Project, THE App_Builder SHALL verify that the requesting user's ID matches the Project's owner ID before returning any file content.
4. THE Sandbox SHALL execute all user-generated JavaScript within an isolated iframe with a `sandbox` attribute that prohibits `allow-same-origin` to prevent access to the parent window's credentials.
5. THE Platform SHALL validate and sanitize all user-supplied file names and content within the App_Builder before writing to Vercel Blob, rejecting names containing path traversal sequences (`../`, `..\\`).
6. THE Platform SHALL enforce HTTPS on all routes; HTTP requests to masidy.com SHALL be permanently redirected to HTTPS.
7. THE Vercel_Deployer SHALL store Vercel OAuth tokens encrypted at rest in the database, using server-side encryption before writing and decrypting only at the moment of use.
