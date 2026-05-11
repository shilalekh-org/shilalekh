# Shilalekh — UI Standardisation Guidelines

> Reference document for all frontend development on shilalekh.org.
> When building new pages or fixing reported inconsistencies, check every decision against this guide first.
> Last updated: May 2026 · v1.4.3

---

## 1. Fonts

Shilalekh uses exactly two font families. No others.

| Use | Font | When |
|---|---|---|
| All body text, headings, prose | `Georgia, 'Times New Roman', serif` | Default for everything readable |
| All UI labels, buttons, tags, nav | `Arial, sans-serif` | Anything in uppercase small caps style |

**Never use system-ui, Inter, Roboto, or any sans-serif for body text.**
**Never use Georgia for button labels or section tags.**

### Type scale

| Role | Size | Weight | Letter-spacing | Font |
|---|---|---|---|---|
| Page heading (h1) | `2.5rem` | `300` | `.05em` | Georgia |
| Section heading (h2) | `1.4rem` | `300` | — | Georgia |
| Card title | `15px` | `400` | `.02em` | Georgia |
| Body / description | `13–14px` | `400` | — | Georgia |
| Section label (orange tag) | `10px` | `400` | `.2em` | Arial, uppercase |
| Field label | `9px` | `400` | `.15em` | Arial, uppercase |
| Button text | `11–12px` | `600` | `.1em` | Arial, uppercase |
| Caption / footer / faint | `10–11px` | `400` | `.08–.15em` | Arial |
| Devanagari brand mark | `16–32px` | `400` | — | Georgia |

---

## 2. Colour Tokens

All colours must be referenced from `useTheme()` via the `c` object. **Never hardcode hex values in components** except for the three map pin colours and the submit button text `#0a0a0a`.

```typescript
// In any component:
const { c, theme } = useTheme()
```

### Full token reference

| Token | Light | Dark | Use |
|---|---|---|---|
| `c.bg` | `#f5f0e4` | `#0a0a0a` | Page background |
| `c.bgSecondary` | `#ede8db` | `#111111` | Secondary panels, info boxes |
| `c.bgCard` | `#ede8db` | `#111111` | Cards |
| `c.border` | `#d8d2c4` | `#2a2a2a` | Standard borders, inputs |
| `c.borderLight` | `#e0dbd0` | `#1e1e1e` | Subtle dividers, section separators |
| `c.text` | `#1a1a18` | `#e8e4d9` | Primary text |
| `c.textMuted` | `#5a5650` | `#888780` | Secondary text, descriptions |
| `c.textDim` | `#7a7670` | `#555250` | Labels, placeholders, captions |
| `c.textFaint` | `#aaa8a4` | `#333` | Footer text, very subtle hints |
| `c.gold` | `#8a6c28` | `#d4a843` | Headings, accents, primary CTA |
| `c.orange` | `#c4622d` | `#c4622d` | Section labels, warnings, category tags |
| `c.navBg` | `rgba(245,240,228,0.97)` | `rgba(10,10,10,0.97)` | Navbar background |

### Hardcoded colours (permitted exceptions)

These are the only hex values allowed outside the token system:

```typescript
// Map pin colours — defined in MapPage.tsx and referenced in Help.tsx
const PIN_GOLD   = '#d4a843'  // in situ
const PIN_AMBER  = '#c87533'  // moved
const PIN_SILVER = '#a0a0aa'  // current location only

// Submit / primary action button text — always on gold background
color: '#0a0a0a'

// Popup text inside Leaflet (Leaflet injects its own styles)
color: '#1a1a1a'
color: '#666'
color: '#888'
```

---

## 3. Component Patterns

Copy these exactly. Do not invent variations.

### Input field

```typescript
const inputStyle = {
  width: '100%',
  background: c.bg,
  border: `0.5px solid ${c.border}`,
  borderRadius: '4px',
  padding: '10px 14px',
  color: c.text,
  fontSize: '13px',
  fontFamily: 'Georgia, serif',
  outline: 'none',
  boxSizing: 'border-box' as const,
}
```

### Select (dropdown)

```typescript
const selectStyle = { ...inputStyle, cursor: 'pointer' }
```

### Textarea

```typescript
const textareaStyle = {
  ...inputStyle,
  resize: 'vertical' as const,
  minHeight: '90px',
  lineHeight: 1.6,
}
```

### Field label

```typescript
const labelStyle = {
  fontSize: '9px',
  letterSpacing: '.15em',
  color: c.textDim,
  marginBottom: '6px',
  display: 'block' as const,
  fontFamily: 'Arial, sans-serif',
}
// Always uppercase in JSX: <label style={labelStyle}>TITLE *</label>
```

### Section label (orange heading with divider)

```typescript
const sectionLabel = (text: string, required = false) => (
  <div style={{
    borderBottom: `0.5px solid ${c.borderLight}`,
    paddingBottom: '10px',
    marginBottom: '20px',
    marginTop: '36px',
  }}>
    <p style={{
      fontSize: '10px',
      letterSpacing: '.2em',
      color: c.orange,
      fontFamily: 'Arial, sans-serif',
    }}>
      {text}{required && <span style={{ color: c.orange }}> *</span>}
    </p>
  </div>
)
```

### Primary button (gold, solid)

```typescript
{
  background: c.gold,
  border: 'none',
  color: '#0a0a0a',
  padding: '10px 28px',       // or '12px 36px' for larger contexts
  borderRadius: '4px',
  fontSize: '11px',           // or '12px' for larger contexts
  letterSpacing: '.1em',
  cursor: 'pointer',
  fontWeight: 600,
  fontFamily: 'Arial, sans-serif',
}
// Disabled state: add opacity: 0.5, cursor: 'not-allowed'
```

### Secondary button (outlined)

```typescript
{
  background: 'transparent',
  border: `0.5px solid ${c.border}`,
  color: c.textMuted,
  padding: '10px 28px',
  borderRadius: '4px',
  fontSize: '11px',
  letterSpacing: '.1em',
  cursor: 'pointer',
  fontFamily: 'Arial, sans-serif',
}
// Hover: change borderColor to c.gold
```

### YES / NO toggle buttons

Used for binary choices in forms (not checkboxes).

```typescript
const yesNoBtn = (active: boolean, onClick: () => void, label: string) => (
  <button
    onClick={onClick}
    style={{
      padding: '7px 24px',
      borderRadius: '4px',
      border: `0.5px solid ${active ? c.gold : c.border}`,
      background: active ? c.gold : 'transparent',
      color: active ? '#0a0a0a' : c.textMuted,
      fontSize: '11px',
      letterSpacing: '.08em',
      cursor: 'pointer',
      fontFamily: 'Arial, sans-serif',
      fontWeight: active ? 600 : 400,
      transition: 'all 0.15s',
    }}
  >{label}</button>
)
```

### Info / callout box (warning or note)

```typescript
// Orange — for important notes
{
  background: theme === 'dark' ? 'rgba(186,117,23,0.12)' : 'rgba(186,117,23,0.07)',
  borderLeft: `3px solid ${c.orange}`,
  borderRadius: '0 4px 4px 0',
  padding: '10px 14px',
  marginBottom: '20px',
}
// Text inside: fontSize 12px, color c.orange, lineHeight 1.6

// Neutral — for quiet contextual notes
{
  borderLeft: `1.5px solid ${c.borderLight}`,
  paddingLeft: '18px',
}
// Text inside: fontSize 12px, color c.textDim, fontStyle italic, lineHeight 1.9
```

### Gold divider line

Always appears below h1 on page headers.

```typescript
<div style={{
  width: '40px',
  height: '0.5px',
  background: c.gold,
  margin: '20px 0',
  opacity: 0.5,
}} />
```

### Card (inscription card or info card)

```typescript
{
  background: c.bgCard,
  border: `0.5px solid ${c.border}`,
  borderRadius: '6px',
  overflow: 'hidden',
}
```

### Tooltip

```typescript
{
  position: 'absolute',
  bottom: '24px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: theme === 'dark' ? '#1c1c1c' : '#fffaf3',
  color: c.text,
  border: `0.5px solid ${c.border}`,
  borderRadius: '4px',
  padding: '10px 14px',
  fontSize: '12px',
  lineHeight: 1.6,
  width: '280px',
  zIndex: 200,
  pointerEvents: 'none',
  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
}
```

---

## 4. Layout

### Page wrapper

All content pages use the same wrapper pattern:

```typescript
<div style={{
  minHeight: '100vh',
  background: c.bg,
  color: c.text,
  fontFamily: 'Georgia, serif',
}}>
  <Nav />
  <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 32px 80px' }}>
    {/* content */}
  </div>
  {/* footer */}
</div>
```

### Max widths by page type

| Page type | Max width |
|---|---|
| Forms (submit, account) | `800px` |
| Content pages (help, about, privacy, terms) | `760px` |
| Narrow / centred (success screens, auth pages) | `600px` |
| Map page | full width (no max) |

### Top padding

All pages have `paddingTop: '100px'` to clear the fixed navbar. Never use less than `100px`.

### Two-column grid

```typescript
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }
```

### Three-column grid

```typescript
{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }
```

### Section spacing

- Between major form sections: `marginTop: '36px'` (handled by `sectionLabel`)
- Between items in a list or card group: `marginBottom: '16px'`
- Between knowledge articles: `marginBottom: '36px'`
- After the page intro paragraph: `marginBottom: '48px'`

---

## 5. Page Header Structure

Every content page follows this exact header pattern:

```tsx
{/* Back link */}
<p style={{
  fontSize: '10px', letterSpacing: '.2em', color: c.textDim,
  marginBottom: '8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif',
}} onClick={() => navigate('/')}>← BACK TO HOME</p>

{/* Section tag */}
<p style={{
  fontSize: '10px', letterSpacing: '.2em', color: c.orange,
  fontFamily: 'Arial, sans-serif', marginBottom: '8px',
}}>SECTION NAME</p>

{/* Page title */}
<h1 style={{
  fontSize: '2.5rem', fontWeight: 300, color: c.gold,
  marginBottom: '8px', letterSpacing: '.05em',
}}>Page Title</h1>

{/* Gold divider */}
<div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '20px 0', opacity: .5 }} />

{/* Subtitle */}
<p style={{ fontSize: '14px', color: c.textMuted, lineHeight: 1.8, marginBottom: '48px' }}>
  One or two sentence description.
</p>
```

---

## 6. Footer Structure

Every page uses the same footer. Copy exactly:

```tsx
<div style={{
  borderTop: `0.5px solid ${c.borderLight}`,
  padding: '32px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
}}>
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span style={{ fontSize: '16px', color: c.gold, fontFamily: 'Georgia, serif' }}>शिलालेख</span>
    <span style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.15em' }}>SHILALEKH</span>
  </div>
  <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.05em', fontFamily: 'Georgia, serif' }}>
    यावच्चन्द्रदिवाकरौ
  </p>
  <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.08em' }}>© 2026 SHILALEKH.ORG</p>
</div>
```

---

## 7. Map Pins

Pin colours are defined once in `MapPage.tsx` and referenced in `Help.tsx`. If they ever change, update both files.

| Constant | Hex | Meaning |
|---|---|---|
| `PIN_GOLD` | `#d4a843` | Original location known, inscription in situ |
| `PIN_AMBER` | `#c87533` | Original location known, inscription moved |
| `PIN_SILVER` | `#a0a0aa` | Original location unknown, current location known |
| *(no pin)* | — | Both locations unknown — record in DB but not on map |

Pin position logic:
- Gold / Amber → plot at `[inscription.latitude, inscription.longitude]`
- Silver → plot at `[inscription.current_lat, inscription.current_lng]`

Private Collection type: coordinates intentionally not stored. Never show a precise pin for private collections.

---

## 8. Borders and Shadows

| Use | Value |
|---|---|
| Standard input / card border | `0.5px solid ${c.border}` |
| Subtle section divider | `0.5px solid ${c.borderLight}` |
| Left accent on callout / article | `1.5px solid ${c.gold}` or `3px solid ${c.orange}` |
| Border radius — inputs, buttons | `4px` |
| Border radius — cards, panels | `6px` |
| Tooltip shadow | `0 4px 16px rgba(0,0,0,0.12)` |
| Map overlay shadow | `0 2px 8px rgba(0,0,0,0.3)` |
| Legend / floating panel shadow | `0 2px 12px rgba(0,0,0,0.25)` |

---

## 9. Error and Status States

### Form error banner

```typescript
{
  background: 'rgba(196,98,45,0.1)',
  border: `0.5px solid ${c.orange}`,
  borderRadius: '4px',
  padding: '12px 16px',
  marginTop: '16px',
}
// Error text: fontSize 12px, color c.orange
```

### Loading state

```tsx
<div style={{
  minHeight: '100vh', background: c.bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}}>
  <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING...</p>
</div>
```

### Status badges (admin dashboard)

- Pending: amber/yellow tones
- Approved: green tones
- Rejected: red/rust tones

Always use background + matching text colour, never border-only badges for status.

---

## 10. Common Mistakes to Avoid

| ❌ Wrong | ✅ Right |
|---|---|
| Hardcoding `#f5f0e4` or `#0a0a0a` in components | Use `c.bg` |
| Using `font-family: sans-serif` for body text | Use `Georgia, serif` |
| Using Georgia for uppercase labels | Use `Arial, sans-serif` |
| `border: 1px solid` | `border: 0.5px solid` (Shilalekh uses hairline borders) |
| `borderRadius: '8px'` or higher | `4px` for inputs/buttons, `6px` for cards |
| `fontWeight: 700` for headings | `fontWeight: 300` (Shilalekh headings are always light) |
| `fontWeight: 700` for buttons | `fontWeight: 600` |
| Padding below `100px` for page top | Minimum `100px` to clear fixed nav |
| Using `maxWidth: '1200px'` | Match the page type (800 / 760 / 600) |
| Inline `color: 'orange'` for section tags | Use `c.orange` |
| Different map pin colours from the constants | Always use `PIN_GOLD`, `PIN_AMBER`, `PIN_SILVER` |

---

## 11. Adding a New Page — Checklist

Before considering a new page done, verify:

- [ ] Uses `c.bg` as background, `c.text` as primary text colour
- [ ] `<Nav />` at the top
- [ ] Page padding: `100px 32px 80px`
- [ ] Correct max width for page type
- [ ] Page header follows the standard structure (back link → section tag → h1 → gold divider → subtitle)
- [ ] All section labels use the `sectionLabel()` pattern with `c.orange`
- [ ] All inputs use `inputStyle`, selects use `selectStyle`
- [ ] All labels use `labelStyle` (9px Arial, uppercase, `c.textDim`)
- [ ] Primary buttons use gold background, `#0a0a0a` text, `fontWeight: 600`
- [ ] Standard footer at the bottom
- [ ] Tested in both light and dark theme
- [ ] No hardcoded hex values (except permitted exceptions listed in Section 2)

---

*यावच्चन्द्रदिवाकरौ — As long as the sun and moon endure.*
*Shilalekh · shilalekh.org · github.com/shilalekh-org/shilalekh*
