# Pixel Arcade Portfolio — Franz Lyster L. Tagalogon

A retro 90's game-style portfolio where the content is experienced through a side-scrolling platformer, with a fallback pause menu for anyone who'd rather just read.

## Note on the stack

This project runs on React + Tailwind with TanStack Start (a React full-stack framework) rather than Next.js — Next.js isn't supported here. Everything you asked for works the same way: React components, Tailwind styling, server-side backend for the contact form.

## Look & feel

Pixel-art aesthetic matching your reference: purple/magenta dusk skies, layered parallax hills, chunky dithered clouds, brown dirt ground, neon arcade title type, and chrome-style dialog boxes with hard 2px borders and drop shadows.

- Pixel font (Press Start 2P for titles, a readable pixel body font)
- Purple/magenta/cyan palette with sunset gradients, all as design tokens
- Hard edges: no soft shadows, no rounded corners, image-rendering: pixelated
- Blinking "PRESS START", CRT scanline overlay, chiptune-style UI blips (mutable)

## Screens (game flow)

1. **Title screen** — "FRANZ LYSTER" arcade logo, animated pixel landscape, blinking PRESS START, menu: START / ABOUT / RULES / MUTE.
2. **Rules screen** — pixel dialog explaining controls (arrows/WASD to move, space to jump, E to interact).
3. **The level** — a side-scrolling platformer stage built on canvas:
   - Player sprite runs, jumps, and falls with simple gravity + collision on platforms
   - Parallax background layers scroll at different speeds
   - Collect floating coins/icons; each one pops a pixel dialog box revealing a piece of your portfolio (skills, jobs, education)
   - Checkpoint signposts split the level into zones: ABOUT ZONE → SKILLS ZONE → WORK HISTORY ZONE → CONTACT ZONE
   - HUD: score = items collected, lives/hearts, current zone name
4. **Zone content** (all your provided text, in dialog boxes):
   - About: name, title, contact line, the professional summary
   - Skills: the 8 skills as collectible power-up items with pixel icons
   - Work history: 4 job stations (Freelance Web Dev, JMC Power Depot / Haitek, Embedded Systems, Photographer), each with dates + bullets
5. **Delivered websites zone (arcade cabinet row)** — a zone of pixel arcade cabinets, one per delivered site. Walking up and pressing E opens a "sneak peek" dialog: screenshot thumbnail inside a pixel monitor frame, project name, short blurb, tech tags, and a VISIT SITE button. Seeded with 3-4 clearly-marked placeholder entries (placeholder pixel screenshots + "COMING SOON" text) that you can swap for real projects later by editing one content file.
6. **Contact / final boss room** — a working contact form styled as a retro terminal (name, email, message), plus your phone and email displayed as static info.
7. **Game over / Thank you** — end-of-level celebration screen with "THANK YOU" arcade type and a replay button.


## Non-game access

A pause menu (ESC) and a "SKIP GAME — VIEW RESUME" link open a scrollable pixel-styled page with all sections as plain readable content, so recruiters on mobile or without a keyboard get everything. Mobile also gets on-screen D-pad + jump buttons.

## Contact form backend

- Enable Lovable Cloud (built-in backend, no external accounts)
- Table `contact_messages` (name, email, message, created_at) with row-level security: anyone may submit, nobody may read publicly
- Zod validation on both client and server, length limits, honeypot field against bots
- Optional (I'll set up only if you want later): email notification to franzlyster@gmail.com — this needs a domain you own to send from

## Technical notes

- Route `/` = the game (title → level → contact → thank you), all states in one page with a game state machine
- Route `/resume` = the plain readable version, same content source (single content file so nothing gets out of sync); includes a Projects grid mirroring the arcade cabinets
- All portfolio content, including the delivered-websites list (title, blurb, tags, image, URL), lives in one editable `src/content/portfolio.ts` file so adding a real project is a few lines

- Game loop: HTML canvas + requestAnimationFrame, sprite-less pixel rendering (drawn rects/patterns) so no external art assets are required; generated pixel background art for parallax layers
- Keyboard + touch input, pause on tab blur, respects prefers-reduced-motion by offering the resume view
- SEO: per-route titles, meta descriptions, og tags; semantic content on `/resume` for crawlers

## Out of scope for this pass

Blog, project case-study pages, multiple game levels, leaderboards, and analytics.
