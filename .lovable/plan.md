# Underwater Portfolio Level, Boss Challenges, and Customization

Extend the existing pixel portfolio with a separate underwater second level. The current sunset level remains intact; its ending becomes the entrance to a deep-sea chapter containing Education, Certifications, Technical Tools, two non-combat bosses, and a hire/contact finale.

## Visual direction

- Match the attached reference’s split-waterline pixel aesthetic: bright cyan surface light above, deep teal water below, submerged architectural silhouettes, sea plants, bubbles, caustic bands, and strong layered depth.
- Keep the existing hard-edged 90s pixel language, CRT treatment, and semantic design tokens while adding a distinct underwater palette rather than replacing the current world.
- Create the underwater scenery and boss/player/pet sprite variations as cohesive pixel assets or procedural canvas art, with crisp nearest-neighbor rendering and restrained looping animation.

## Game flow

1. Keep the current title screen and surface portfolio level.
2. Replace the current surface finale/contact endpoint with a clear dive portal or shoreline transition into **Level 2: The Deep Archive**.
3. Build a dedicated underwater world definition and renderer so surface and underwater stations, collectibles, backgrounds, and challenge state stay maintainable.
4. Place the new portfolio content through the underwater level:
   - **Education station** — Jose Rizal Memorial State University, BS Computer Engineering, 2019–2023.
   - **Certification stations** — Google Cybersecurity, TryHackMe Junior Penetration Tester, Electronics Processing and Servicing, and Microsoft Azure AI Fundamentals with the supplied dates.
   - **Technical Tools inventory** — Linux, Python, React, Tailwind, Microsoft Office, basic networking tools, and SIEM.
5. End the level with the existing working contact form and a prominent **HIRE / CONTACT ME** action, also available persistently during play without obscuring the canvas.

## Boss mini-challenges

- **Big Fish — Current Run:** a short dodge-and-collect sequence where the player gathers tool/data tokens while reading charge indicators and moving between safe lanes. No attack button or combat health system.
- **Kraken — Signal Sequence:** tentacles guard several glowing terminals; the player activates them in the shown order while avoiding timed tentacle strikes. Completion unlocks the final contact chamber.
- Give both encounters a clear intro, progress indicator, success state, retry action, and touch-friendly timing. Failure resets only the short challenge, not portfolio progress.
- Keep portfolio information readable independently of boss completion through the résumé route.

## Character and pet customization

- Add a customizer before starting and make it reopenable from pause/settings.
- Character options: curated color palettes plus pixel accessories such as a diver mask, cap, or headset.
- Pet options: selectable fish, turtle, or mini-octopus companions, each with color variants and a small follow/idle animation.
- Render the selected appearance in both levels and save choices locally after hydration so returning visitors keep them without requiring an account.

## Mobile and CTA readiness

- Rework touch controls into stable thumb zones with larger targets, pointer-cancel handling, safe-area spacing, and a contextual action button that changes between interact/dive/challenge actions.
- Keep HUD labels compact and ensure dialogs, customization, boss intros, and contact fields fit narrow screens without covering essential play space.
- Add pause/resume and direct résumé/contact exits so mobile visitors never have to finish the game to reach key information.
- Add a visible contact CTA near the game shell and route the underwater stage-clear action directly to the contact terminal.
- Verify keyboard, touch, reduced-motion behavior, canvas scaling, and no-overlap layouts at mobile and desktop sizes.

## Resume and content updates

- Extend the central portfolio content model with typed Education, Certifications, and Technical Tools data so the game and readable résumé share one source.
- Add all three sections to `/resume` in the same pixel style, with the contact CTA remaining prominent.
- Update route descriptions/social metadata to mention education, certifications, tools, and the underwater portfolio experience.

## Technical details

- Refactor the current single-world constants into level-specific configuration and state while keeping the existing canvas loop and physics foundation.
- Add explicit challenge state machines for intro, active, success, and retry; do not add backend persistence or combat systems.
- Extend canvas draw functions for underwater parallax, bubbles/caustics, swimming pet behavior, bosses, telegraphs, and challenge objects.
- Keep customization browser-only and hydration-safe; no database schema changes are required.
- Preserve the current working contact backend and project placeholder workflow.

## Validation

- Play through surface-to-underwater transition, both boss challenges, all new content stations, customization persistence, and contact submission behavior.
- Test at phone and desktop viewports, including touch controls, safe areas, dialog scrolling, CTA visibility, and canvas framing.
- Confirm each content route has complete unique metadata and that the readable résumé exposes every supplied credential without gameplay.