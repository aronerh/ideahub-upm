---
name: IdeaHub UPM
description: Where UPM student ideas meet investors
colors:
  accent: "#0f7a5a"
  on-accent: "#ffffff"
  soft: "#e3f3ec"
  on-soft: "#0c6349"
  glow: "rgb(40 190 140 / 0.22)"
  page: "#fafaf8"
  card: "#ffffff"
  ink: "#15181b"
  ink-soft: "#565c64"
  line: "#e5e6e6"
  danger: "#b42318"
  danger-soft: "#fdecea"
  accent-dark: "#3ccb9c"
  on-accent-dark: "#08140f"
  soft-dark: "#17322a"
  on-soft-dark: "#7be5c0"
  glow-dark: "rgb(60 203 156 / 0.2)"
  page-dark: "#0e1113"
  card-dark: "#171a1d"
  ink-dark: "#f1f2f3"
  ink-soft-dark: "#a3a8b0"
  line-dark: "#272b30"
  danger-dark: "#f9897f"
  danger-soft-dark: "#3a1b18"
typography:
  display:
    fontFamily: "Geist, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  body-lg:
    fontFamily: "Geist, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.56
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  button-lg:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.5
  button:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.43
  label:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  body-sm:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  caption:
    fontFamily: "Geist, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  card-gap: "14px"
  lg: "16px"
  card: "20px"
  xl: "24px"
  2xl: "32px"
  3xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-block:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button-lg}"
    rounded: "{rounded.lg}"
    padding: "10px 0"
    width: "100%"
  button-secondary:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  input:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  nav-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
  nav-link-active:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.on-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
  idea-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  panel:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  menu-item:
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  letter-badge:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.on-soft}"
    rounded: "{rounded.full}"
    size: "40px"
  alert-error:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    padding: "8px 12px"
  status-banner:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.on-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
---

# Design System: IdeaHub UPM

## Overview

**Creative North Star: "Graphite Glow"**

IdeaHub UPM is a calm, modern product that lets students' ideas carry the page. Graphite ink sits on warm off-white or near-black neutrals, one green does all the working colour, and a single family, Geist, sets everything. The students' titles and pitches fill the page, and the interface recedes around them.

Life comes from light and motion, not from ornament. A soft green light rises behind the top of every page, shadows are tinted with that same light, and the one expressive gesture in the system is an idea card that lifts with a green edge while its arrow slides in. Everything else is held still.

The world refuses both the bright playful student look and the flat grey directory. Bright, multi-colour and zine-like directions were rejected as not serious enough for students and investors. Light and dark are equal versions of the same system: the theme follows the system setting, and signed-in users can switch it in the account menu.

**Key Characteristics:**
- Warm neutrals, graphite ink, one green, in matched light and dark token sets.
- Geist alone, with hierarchy from size, weight and tightened tracking.
- Soft green light behind the page top, and shadows that glow rather than darken.
- Hairline-bordered cards with gently rounded corners (6 to 12px) and circular letter badges.
- One signature motion: lift, green edge, arrow, on hover and keyboard focus alike.

## Colors

Near-neutral surfaces and graphite ink carry the page, one green carries every action and active state, and red appears only when something has gone wrong. Every token is defined twice, once under `:root` and once under `[data-theme="dark"]`; frontmatter keys ending in `-dark` hold the dark value of the same role.

### Primary
- **Campus Green** (#0f7a5a light, #3ccb9c dark): Primary buttons, links, the back link, idea section headings, the card hover edge, the focus outline, the text caret, and the logo's one node. The dark value is brighter, so dark buttons take dark text.
- **On Accent** (#ffffff light, #08140f dark): Text and icons on Campus Green.
- **Soft Mint** (#e3f3ec light, #17322a dark): The quiet green surface: active nav link, letter badges, menu row hover, the success banner, the auth side panel, text selection.
- **On Soft** (#0c6349 light, #7be5c0 dark): Text on Soft Mint.
- **Green Light** (rgb(40 190 140 / 0.22) light, rgb(60 203 156 / 0.2) dark): Never a fill. It is the colour of the page-top light, the auth panel light and the lift and glow shadows.

### Neutral
- **Warm Paper** (#fafaf8 light, #0e1113 dark): The page, and the recessed fill of inputs inside cards.
- **Card White** (#ffffff light, #171a1d dark): Cards, panels, the account menu.
- **Graphite Ink** (#15181b light, #f1f2f3 dark): Headings and body text.
- **Soft Graphite** (#565c64 light, #a3a8b0 dark): Pitches, supporting lines, dates, placeholders, idle nav.
- **Hairline** (#e5e6e6 light, #272b30 dark): Card borders, section dividers, input borders, scrollbar thumb.

### Semantic
- **Error Red** (#b42318 light, #f9897f dark): Error text and the border of an invalid field.
- **Error Wash** (#fdecea light, #3a1b18 dark): The background of a form-level error alert.

### Named Rules
**The One Green Rule.** Green is the only hue with a job. Actions, links, active states, focus and the logo all use it, and no second accent exists.

**The Red Means Error Rule.** The danger tokens exist only for errors: the form-level alert, the invalid field border and the field error message. Sign out is green. Red is never decoration, emphasis or a warning about a choice.

**The Paired Token Rule.** Colour reaches components only through the theme tokens, never as a raw value, and a new token is declared for both themes at once. The favicon is the single exception, because an SVG file cannot read the stylesheet.

## Typography

**Display Font:** Geist (loaded through `next/font`)
**Body Font:** Geist
**Label/Mono Font:** Geist; there is no mono

**Character:** One neo-grotesque family doing every job, the category standard held to Linear and Vercel. Headings get their presence from weight 600 and negative tracking, so students' words read as the headline without a display face. The build uses three weights: 400 for reading, 500 for labels, 600 for headings and buttons.

### Hierarchy
- **Display** (600, 2.25rem rising to 3.75rem at the small breakpoint, line-height 1 on desktop, -0.04em): The home page heading only.
- **Headline** (600, 1.875rem to 2.625rem by surface, line-height 1.1 to 1.25, -0.025em to -0.035em): Page titles on the idea, publish and auth pages, and the auth panel tagline.
- **Title** (600, 1.25rem, line-height 1.375, -0.025em): Idea card titles and the empty-state heading.
- **Body Large** (400, 1.125rem, line-height 1.56): The pitch on the idea page and the home intro line.
- **Body** (400, 1rem, line-height 1.5): Card pitches. Long idea text uses line-height 1.625 and stops at 65ch.
- **Control** (400, 0.9375rem): Text inside inputs. Full-width submit buttons use the same size at 600.
- **Label** (500, 0.875rem, line-height 1.43): Field labels, nav links, secondary buttons. Compact primary buttons use the same size at 600, and supporting lines at 400.
- **Caption** (400, 0.75rem, line-height 1.33): Field errors, character counters, the published date.

### Named Rules
**The One Family Rule.** Geist sets everything. `font-heading` and `font-sans` are aliases of the same face, and hierarchy comes from size, weight and tracking alone.

**The Tighter When Larger Rule.** Tracking closes as type grows, from -0.025em at title size to -0.04em at display size. Text at reading size keeps its natural spacing.

**The Sentence Case Rule.** Headings, labels, buttons and section titles are all written in sentence case. The only capitals set by the system are letter badges and account initials, which are generated content.

**The Tabular Figures Rule.** Numbers that change or stack, such as card dates and character counters, use tabular figures.

## Layout

A single centred column whose width follows the task. Browsing and the header share a 76rem frame (1216px), so the logo aligns with the list and the Publish button with its right edge. The auth card is 62.5rem, the idea page 48rem and the publish form 43.25rem. Every page has a 16px side gutter and 32px of vertical padding, growing to 48px from the small breakpoint (640px).

Spacing follows a 4px rhythm, with 12px to 16px inside groups, 24px to 32px between them and 16px between form fields. The idea list is a single column that becomes two equal columns at the small breakpoint, with a 14px gap and rows matched in height. Long titles and pitches break instead of overflowing, so nothing scrolls sideways at phone width.

Below 640px the header's Explore link hides, leaving the logo as the way home, and "Publish an idea" shortens to "Publish". From the medium breakpoint (768px) the auth card splits into two equal columns; below it the green side panel disappears and only the form remains.

## Elevation & Depth

A hybrid of hairlines and light. Every card keeps a 1px hairline border, so structure never depends on a shadow, and the shadows on top of it are mostly tinted with Green Light, so raised things appear lit rather than heavy. In dark mode the same shadows read as a faint halo.

Behind every page sit two soft elliptical pools of Green Light, one 760 by 420px at the upper right and one 520 by 320px at the upper left, both fading to nothing near the top of the page. The auth side panel carries a smaller pool of its own over Soft Mint. The header has no fill and no border; it sits directly on this light.

### Shadow Vocabulary
- **Rest** (`box-shadow: 0 1px 2px rgb(15 20 25 / 0.05)`): Idea cards and the not-found card at rest. Barely there.
- **Lift** (`box-shadow: 0 12px 30px var(--glow)`): Page-level panels (idea article, publish form, auth card), the open account menu, and an idea card on hover or focus.
- **Glow** (`box-shadow: 0 6px 18px var(--glow)`): Under a primary button that invites someone to publish, in the header and the empty state.

### Named Rules
**The Light Not Ink Rule.** Lift and glow are cast in green light, never in black or grey. Only the Rest shadow is neutral, and it stays at 5%.

**The Only Cards That Move Rule.** A surface lifts on interaction only if it is a link to an idea. Panels hold their elevation and never react to the pointer.

**The Invitation Glow Rule.** The glow shadow marks invitations to publish. Submit buttons inside a form and other actions sit flat.

## Shapes

Gently curved, in three steps by scale. Containers (cards, panels, the account menu) use 12px, controls (buttons, inputs, nav links, alerts) use 8px, and rows inside the account menu use 6px, which nests cleanly inside the 12px menu with its 6px padding. Full circles are reserved for letter badges, account initials, the Check email icon disc and the theme switch.

Empty states use a dashed hairline instead of a solid one, which marks the space as waiting for content. Borders are always 1px; the focus outline is 2px.

### The Hub Mark

The logo is a hub of six spokes meeting at one centre, drawn in `currentColor` with round line ends, so it follows the theme. Exactly one spoke and its node, at the upper right, are green, and that node is larger than the others: the new idea joining the hub. It appears at 28px beside the wordmark ("IdeaHub" at 600, "UPM" at 500 in Soft Graphite) and at 80px on the auth panel. The favicon is the same mark in white on a graphite tile with a 7px corner, using the dark-theme green.

**The One Green Node Rule.** The hub stays monochrome except for that single spoke and node. Never add a second green node, recolour the hub, or use another colour for the node.

## Components

Every component is restrained and exact: flat colour, hairlines, small state changes.

### Buttons
- **Shape:** Gently curved (8px).
- **Primary:** Campus Green fill with On Accent text at 600. Compact in the header and empty state (8px 16px), full width in forms (10px vertical, 0.9375rem label), optionally with the arrow icon.
- **Hover / Focus:** Opacity falls to 90% on hover, a press scales to 98% or 99%, and focus shows the global 2px green outline at a 2px offset.
- **Pending:** The label changes to a progress word ("Publishing…", "Sending…"), the arrow is removed, and opacity falls to 60%.
- **Secondary:** Transparent with a hairline border and Graphite Ink text at 500, filling with Soft Mint on hover. Used for the alternative action beside a primary.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Card White.
- **Shadow Strategy:** Rest for list-level cards, Lift for page-level panels. See Elevation & Depth.
- **Border:** Always a 1px hairline; dashed for empty states.
- **Internal Padding:** 20px on idea cards, 24px on panels, rising to 32px or 40px from the small breakpoint.

### Idea Card (signature)
The signature of the system: a letter badge (40px circle in Soft Mint showing the title's first letter), then the title, the pitch, and a footer with the date on the left and an arrow on the right. On hover and on keyboard focus the card rises 2px, its border turns Campus Green, it takes the Lift shadow, and the hidden arrow fades in while sliding 2px right. The movement runs 180ms on `cubic-bezier(.16,1,.3,1)`. Under reduced motion the card still changes colour and shadow but does not move. Keyboard focus uses this treatment in place of the outline.

### Inputs / Fields
- **Style:** A label at 500 above the control, with a tabular "12 / 80" counter on the right when the field has a limit. The control is 8px rounded, Warm Paper fill, hairline border, 8px 12px padding. Multi-line fields start at four rows and resize vertically.
- **Focus:** The border turns Campus Green with a 2px ring of Campus Green at 20%.
- **Error:** The border turns Error Red and a Caption-sized message appears below. Problems with the whole form appear in an alert above the fields: Error Wash fill, Error Red text, 8px corners.

### Navigation
- **Style:** A transparent header 64px tall holding the logo, one nav link, and the account area pushed right.
- **Nav link:** 500 at 0.875rem in Soft Graphite, turning Graphite Ink on hover. The current page sits on Soft Mint with On Soft text.
- **Account menu:** A 32px initials circle and chevron open a 224px Card White panel with the Lift shadow, closing on outside click or Escape. Rows are 6px rounded and fill with Soft Mint on hover.
- **Text links:** Campus Green at 500, underlining on hover. The header's Sign in link is Soft Graphite, turning Ink.

### Banners
- **Success:** Soft Mint fill, On Soft text at 500, 8px corners, 12px 16px padding. It confirms that an idea is live.
- **Error:** See Inputs / Fields. The two banners never swap colours.

### Loading
List and idea skeletons repeat the final card's shape, border and radius in a gentle pulse, so the layout does not move when content arrives.

## Do's and Don'ts

### Do:
- **Do** reach colour only through the theme tokens, and declare any new token in both the light and dark sets.
- **Do** keep green for actions, links, active states, focus and the logo's one node.
- **Do** reserve the danger tokens for errors, and pair Error Red with a message that says what went wrong.
- **Do** give every card a 1px hairline border, even when it also has a shadow.
- **Do** treat hover and keyboard focus the same on idea cards, and remove the movement under reduced motion.
- **Do** keep a visible focus state on everything interactive: the 2px green outline by default, or the green border treatment on inputs and idea cards.
- **Do** check new work in both themes and at phone width.
- **Do** use 12px corners for containers, 8px for controls and 6px for rows nested inside a 12px container.

### Don't:
- **Don't** introduce a second accent hue, or any bright, multi-colour or zine-like treatment. The team rejected these as not serious enough for students and investors.
- **Don't** use red for sign out, emphasis or decoration.
- **Don't** recolour the hub mark or give it more than one green node.
- **Don't** cast lift or glow shadows in black or grey, and don't use hard offset shadows.
- **Don't** use a gradient on buttons, cards or text. Gradients exist only as the soft green light behind the page and on the auth panel.
- **Don't** add a label or eyebrow line above a heading. The one line that sits above a title is the idea's real published date.
- **Don't** set labels in uppercase with wide tracking.
- **Don't** add a second typeface, including a mono or a display face.
- **Don't** make a non-link surface lift on hover.
- **Don't** set a container corner above 12px; full circles are only for badges, initials, the Check email icon disc and the theme switch.
