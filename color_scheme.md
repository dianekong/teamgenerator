# Team Randomizer — Color Scheme & Token Reference

---

## App Background & Surface

| Token | Hex | Usage |
|---|---|---|
| `bg-page` | `#F7F8FC` | Page background |
| `bg-surface` | `#FFFFFF` | Cards, panels, top bar |
| `bg-muted` | `#F4F4F6` | Tab switcher, input fields, secondary buttons |
| `bg-input` | `#F7F8FC` | Number inputs, textareas |
| `border-default` | `#EBEBEB` | Card borders, dividers |
| `border-dashed` | `#E0E0E0` | Dashed bench border, add-person button |

---

## Typography

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#222222` | Headings, names, main labels |
| `text-secondary` | `#555555` | Body text, button labels |
| `text-muted` | `#888888` | Subtitles, hints, member counts |
| `text-faint` | `#AAAAAA` | Dept tags under avatars, timestamps |
| `text-placeholder` | `#CCCCCC` | Placeholder text, empty bench label |

---

## Brand & Primary Accent

| Token | Hex | Usage |
|---|---|---|
| `brand-primary` | `#F45B69` | Logo, main CTA button, active tabs, radio selected |
| `brand-primary-bg` | `#FEE8EA` | Light tint for hover states, Start Over button bg |
| `brand-primary-border` | `#F45B6933` | Subtle border on brand-tinted elements |
| `brand-primary-shadow` | `#F45B6944` | Box shadow on Randomize and primary buttons |
| `export-blue` | `#4A90E2` | Export button |
| `export-blue-shadow` | `#4A90E244` | Export button shadow |

---

## Skill Level Indicators
> Used as dot badges on avatars, pill labels in roster rows, and skill bar segments.

| Skill | Dot / Bar color | Pill background | Pill text |
|---|---|---|---|
| Senior | `#3BBF7A` | `#E8F8F1` | `#3BBF7A` |
| Mid | `#F4A423` | `#FEF5E7` | `#F4A423` |
| Junior | `#F45B69` | `#FEE8EA` | `#F45B69` |
| Unset | `#BBBBBB` | `#F3F3F3` | `#BBBBBB` |

---

## Team Colors
> Each team gets one color from this palette. Applied to: table circle border & fill tint, avatar shirt, dept tag, team name label, card border & shadow.

| Team Slot | Name | Main | Light Fill | Border / Shadow |
|---|---|---|---|---|
| 1 | Coral Red | `#F45B69` | `#FEE8EA` | `#F45B6933` |
| 2 | Amber | `#F4A423` | `#FEF5E7` | `#F4A42333` |
| 3 | Green | `#3BBF7A` | `#E8F8F1` | `#3BBF7A33` |
| 4 | Blue | `#4A90E2` | `#EAF2FD` | `#4A90E233` |
| 5 | Purple | `#9B59B6` | `#F5EEF8` | `#9B59B633` |
| 6 | Orange | `#FF7043` | `#FBE9E7` | `#FF704333` |

### How team color is applied per element
| Element | Value used |
|---|---|
| Table circle fill | `light` at 100% opacity |
| Table circle border | `main` at 33% opacity (`33` hex suffix) |
| Table box shadow | `main` at 13% opacity (`22` hex suffix) |
| Card border | `main` at 20% opacity (`33` hex suffix) |
| Card box shadow | `main` at 8% opacity (`14` hex suffix) |
| Avatar shirt / arms | `main` at 100% |
| Dept tag background | `main` + `18` hex suffix (~9% opacity) |
| Dept tag text | `main` at 100% |
| Team name label | `main` at 100% |
| Balance badge (balanced) | bg `#E8F8F1`, text `#2E9E5E`, border `#3BBF7A44` |
| Balance badge (skewed) | bg `#FEE8EA`, text `#D63E4E`, border `#F45B6944` |

---

## Avatar — People Colors

### Skin & Face

| Part | Hex | Notes |
|---|---|---|
| Head fill | `#FDDBB4` | Warm medium skin tone |
| Head stroke | `#E8C49A` | Slightly darker outline |
| Hand fill | `#FDDBB4` | Same as head |
| Eye fill | `#444444` | Dark gray, not full black |
| Mouth stroke | `#C08060` | Warm brownish |

### Hair

| Gender | Hex | Shape |
|---|---|---|
| Male | `#6B4226` | Flat ellipse cap on top of head |
| Female | `#8B5E3C` | Ellipse cap + two side curtain ellipses |

### Body (shirt & arms)
> Inherits team color — see Team Colors above.

### Legs / Trousers

| Gender | Hex | Notes |
|---|---|---|
| Female | `#7986CB` | Soft indigo blue |
| Male | `#78909C` | Blue-gray slate |

### Shoes (both genders)

| Part | Hex |
|---|---|
| Shoe fill | `#4E342E` | Dark warm brown |

### Skill Badge (dot on avatar)

| Property | Value |
|---|---|
| Size | 10×10px circle |
| Border | `2px solid #FFFFFF` |
| Shadow | `0 1px 3px rgba(0,0,0,0.15)` |
| Colors | See Skill Level Indicators table above |

---

## Shadows & Elevation

| Level | Value | Used on |
|---|---|---|
| Low | `0 1px 4px rgba(0,0,0,0.04)` | Roster rows, export code block |
| Medium | `0 2px 8px rgba(0,0,0,0.04)` | Config panel, team summary cards |
| Top bar | `0 1px 4px rgba(0,0,0,0.05)` | Navigation bar |
| Active tab | `0 1px 4px rgba(0,0,0,0.10)` | Selected tab pill |
| Team card | `0 2px 12px {teamColor}14` | Team table cards (color-tinted) |
| CTA button | `0 4px 16px #F45B6944` | Randomize Teams button |

---

## Border Radius

| Token | Value | Used on |
|---|---|---|
| `radius-sm` | `6px` | Badges, small buttons, inputs |
| `radius-md` | `8–9px` | Buttons, roster rows, tab pills |
| `radius-lg` | `10–12px` | Export cards, config panel sections |
| `radius-xl` | `14–16px` | Main team cards, primary CTA button |
| `radius-full` | `50%` | Table circle, avatar head, skill dots |
| `radius-pill` | `20px` | Balance badge, dept tag, skill pill |

---

## Fonts

| Font | Source | Used for |
|---|---|---|
| `'Press Start 2P'` | Google Fonts | Logo, screen titles, team name inside table, bench label |
| `'Inter'` | Google Fonts | All UI text, names, labels, buttons, inputs |

### Font sizes in use

| Size | Used for |
|---|---|
| `5.5–7px` | Team name inside table (Press Start 2P) |
| `8–9px` | Avatar name, dept tag, bench label, small badges |
| `10px` | Slack export text, legend, skill pill |
| `11–12px` | Roster row name, button labels, body text |
| `13px` | Input values, section subtitles |
| `14px` | Larger body, config labels |

---

## Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```
