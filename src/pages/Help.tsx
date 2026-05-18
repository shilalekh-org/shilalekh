import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { useTheme } from '../theme'

// ─── Pin colours (keep in sync with MapPage.tsx) ──────────────────────────────
const PIN_GOLD   = '#d4a843'
const PIN_AMBER  = '#c87533'
const PIN_SILVER = '#a0a0aa'

const PinSvg = ({ color, size = 16 }: { color: string; size?: number }) => (
  <svg width={size * 0.65} height={size} viewBox="0 0 22 34" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M11 0C5.477 0 1 4.477 1 10c0 8 10 24 10 24S21 18 21 10C21 4.477 16.523 0 11 0z"
      fill={color} stroke="rgba(0,0,0,0.22)" strokeWidth="1.2"/>
    <circle cx="11" cy="10" r="4" fill="rgba(0,0,0,0.16)"/>
  </svg>
)

// ─── Pencil icon (inline, for the edit explanation) ───────────────────────────
const PencilIcon = ({ color }: { color: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '3px' }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'What is Shilalekh?',
    a: 'Shilalekh is a global database of stone inscriptions and epigraphic records. Our mission is to preserve and make accessible the world\'s inscribed heritage — from Ashokan rock edicts to medieval temple dedications to colonial-era memorials. Every entry is verified against authoritative sources before going live.',
  },
  {
    q: 'What is a ShilaID?',
    a: 'A ShilaID is a permanent, unique identifier assigned to every inscription in the database — for example, SHILA-ST-0000042. The format is SHILA, followed by a two-letter material code (ST = Stone & Rock, ME = Metal, CL = Clay & Ceramic, OR = Organic, and others), followed by a seven-digit global sequence number. Once assigned, a ShilaID never changes — even if the title, location, or any other detail is corrected later. It is designed to be cited in academic papers, museum catalogues, and theses with confidence.',
  },
  {
    q: 'Who can contribute inscriptions?',
    a: 'Anyone with knowledge of inscriptions can submit an entry — researchers, academics, students, heritage professionals, and enthusiasts alike. All submissions are reviewed by our team before appearing in the public database. Creating a free account is required to submit.',
  },
  {
    q: 'How do I submit an inscription?',
    a: 'Sign in or create a free account, then go to the Contribute page. Fill in as much detail as you can — Title, Type, and Country are the only required fields, but the more you add, the more valuable the record. Your submission will be reviewed and you will be notified by email once a decision is made.',
  },
  {
    q: 'How long does review take?',
    a: 'We aim to review all submissions within 7–14 days. You will receive an email when a decision is made — whether approved, rejected with a reason, or if we need more information from you.',
  },
  {
    q: 'Can I suggest a correction to an existing entry?',
    a: 'Yes. On any inscription detail page, look for the small pencil icon next to any field — script, language, year, dynasty, translation, condition, and more. Click it, enter the corrected value, and include a justification or source. You can also upload a missing or better photograph using the Upload Photo button. All suggestions go to the Shilalekh admin team for review and nothing changes on the public record until approved.',
  },
  {
    q: 'What is a contributor profile and @handle?',
    a: 'When you create an account and set a @handle in Account Settings, Shilalekh creates a public profile page for you at shilalekh.org/@yourhandle. Every inscription you contribute will show your name on the attribution line, linked to your profile. You can choose to keep your contributions anonymous — if you do, your name will not appear publicly on any record, though your identity remains on file with the admin team.',
  },
  {
    q: 'What is the avatar on my profile?',
    a: 'Each contributor profile is assigned a unique avatar character drawn from classical scripts used in Indian epigraphy. The avatar is assigned automatically when you create your profile — you do not choose it. It gives every contributor a distinctive visual identity across the platform.',
  },
  {
    q: 'How do bookmarks work?',
    a: 'Any logged-in user can bookmark inscriptions using the bookmark icon on inscription cards or the Bookmark button on a detail page. Your bookmarks are saved to your account and accessible from your profile page as a personal reading list. Bookmarks are private — they are not visible to other users.',
  },
  {
    q: 'What sources are accepted as evidence?',
    a: 'We accept entries supported by ASI records, state archaeology department publications, peer-reviewed academic papers, and museum accession records. AI-generated content is not accepted. Shilalekh\'s credibility rests entirely on the quality of its sources.',
  },
  {
    q: 'Is Shilalekh free to use?',
    a: 'Yes. Browsing and searching the database is completely free with no account required. Contributing requires a free account so we can contact you about your submissions.',
  },
]

const ARTICLES = [
  {
    title: 'Understanding ShilaID',
    body: 'Every inscription in Shilalekh carries a ShilaID — a permanent identifier in the format SHILA-[XX]-[0000001]. The two-letter code identifies the material category: ST for Stone & Rock, ME for Metal, CL for Clay & Ceramic, OR for Organic, GS for Gem & Glass, PA for Painted & Informal, RO for Religious Object, and OT for Other. The seven-digit number is a global sequence — it never repeats and never changes, regardless of edits to the record. When citing a Shilalekh record in a paper or catalogue, use the ShilaID. The URL shilalekh.org/inscription/SHILA-ST-0000042 will always resolve to the same record.',
  },
  {
    title: 'How to suggest an edit or upload a photograph',
    body: 'On any inscription detail page, you will see a small pencil icon next to most fields — title, script, language, year, dynasty, ruler, purpose, condition, country, location, in situ status, and the full text fields (actual text, transliteration, translation). Click the pencil icon on the field you want to correct. A panel will open asking for the corrected value and a justification or source. For the actual text and transliteration fields, the input uses line numbers to match the physical lines of the inscription — enter one line per physical line on the stone. To suggest a photograph, use the Upload Photo button in the photographs section. All suggestions go to the Shilalekh admin team. Nothing changes on the public record until reviewed and approved.',
  },
  {
    title: 'Setting up your profile and @handle',
    body: 'After creating an account, visit Account Settings to set your @handle. Your handle must be unique and will form your public profile URL — for example, shilalekh.org/@yourhandle. Once set, your name will appear on every inscription you have contributed. If you prefer not to be identified publicly, turn on the anonymous option in Account Settings — your contributions will show no name on any public page, though your identity is retained by the admin team for verification purposes. Researchers may optionally add their ORCID iD to their profile for formal academic attribution. New users are prompted to complete their profile on first login. Existing users who signed up before this feature launched will be prompted on their next login.',
  },
  {
    title: 'Browsing and filtering inscriptions',
    body: 'The Inscriptions page offers three view modes — List, Tile, and Map — switchable without losing your active filters. Use the filter pills at the top to narrow by material type, script, or country. On the Map page, a collapsible filter panel on the left lets you filter by country, script, material, and date range while staying on the map. The homepage search bar carries your query directly into the inscriptions results. Pin colours on the map show at a glance whether an inscription is still at its originally installed location (gold), has been moved (amber), or only has a current location on record (silver).',
  },
  {
    title: 'How to write a good submission',
    body: 'The most valuable entries on Shilalekh are those with rich detail. Beyond the required fields, try to include the inscription\'s historical context, the dynasty or ruler it relates to, the language and script, and an English translation if available. Citing your source — even just a book title or ASI report number — significantly increases the chance of approval.',
  },
  {
    title: 'How to find GPS coordinates for a site',
    body: 'Open Google Maps on your phone or desktop. Navigate to the inscription\'s location. On desktop, right-click the exact spot and the coordinates appear at the top of the menu — click them to copy. On mobile, tap and hold to drop a pin, then read the coordinates shown at the bottom of the screen. Paste them into the Latitude and Longitude fields on the submission form.',
  },
  {
    title: 'Understanding inscription types',
    body: 'Rock Edicts are proclamations carved directly into natural rock faces, most famously by Emperor Ashoka. Cave inscriptions appear on the walls of rock-cut shrines and monasteries. Copper Plates are royal grants or charters inscribed on metal rather than stone. Temple inscriptions record dedications, donations, or royal patronage. Commemorative inscriptions mark victories or significant events. If you are unsure, choose "Other" and describe the type in the short description field.',
  },
  {
    title: 'What makes a submission get approved',
    body: 'Approved entries typically have a clear and accurate title, a verifiable source, correct geographical information, and at least a short description explaining what the inscription is and why it matters. Submissions that are vague, unsourced, or appear to be copied from unverified online sources are more likely to be returned for more information. If your submission is rejected, the rejection email will explain why and you are welcome to revise and resubmit.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function Help() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i)

  const sectionHeadStyle = {
    fontSize: '10px',
    letterSpacing: '.2em',
    color: c.orange,
    fontFamily: 'Arial, sans-serif',
    marginBottom: '8px',
  }

  const lastFaq = {
    q: 'How is my personal data handled?',
    a: (
      <>
        Your data is stored securely on servers in India. We collect only what is necessary — your name, email, and optional profile details. We do not sell your data to third parties. See our{' '}
        <span
          onClick={() => navigate('/privacy')}
          style={{ color: c.gold, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Privacy Policy
        </span>
        {' '}for full details.
      </>
    ),
  }

  const allFaqs = [...FAQS, lastFaq]

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '100px 32px 80px' }}>

        {/* Header */}
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }} onClick={() => navigate('/')}>← BACK TO HOME</p>
        <p style={sectionHeadStyle}>SUPPORT</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '8px', letterSpacing: '.05em' }}>Help Centre</h1>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '20px 0', opacity: .5 }} />
        <p style={{ fontSize: '14px', color: c.textMuted, lineHeight: 1.8, marginBottom: '48px' }}>
          Answers to common questions, guides for contributors, and ways to get in touch.
        </p>

        {/* ── FAQ Section ── */}
        <p style={sectionHeadStyle}>FREQUENTLY ASKED QUESTIONS</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '24px' }}>Common questions</h2>

        <div style={{ marginBottom: '56px' }}>
          {allFaqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: `0.5px solid ${c.borderLight}` }}>
              <div
                onClick={() => toggleFaq(i)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', cursor: 'pointer', gap: '16px' }}
              >
                <p style={{ fontSize: '14px', color: openFaq === i ? c.gold : c.text, lineHeight: 1.5, margin: 0, transition: 'color 0.2s' }}>
                  {faq.q}
                </p>
                <span style={{ color: c.gold, fontSize: '18px', flexShrink: 0, lineHeight: 1, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ paddingBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, margin: 0 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Knowledge Articles ── */}
        <p style={sectionHeadStyle}>KNOWLEDGE ARTICLES</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '24px' }}>Guides for contributors</h2>

        <div style={{ marginBottom: '56px' }}>
          {ARTICLES.map((article, i) => (
            <div key={i} style={{ borderLeft: `1.5px solid ${c.gold}`, paddingLeft: '24px', marginBottom: '36px', opacity: 0.9 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 400, color: c.gold, marginBottom: '10px', letterSpacing: '.02em' }}>{article.title}</h3>
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, margin: 0 }}>{article.body}</p>
            </div>
          ))}
        </div>

        {/* ── ShilaID explainer ── */}
        <p style={sectionHeadStyle}>SHILAID</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '12px' }}>Reading a ShilaID</h2>
        <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, marginBottom: '24px' }}>
          Every inscription in the database carries a permanent identifier. Here is how to read one.
        </p>

        <div style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px 28px', marginBottom: '20px' }}>
          <p style={{ fontFamily: '"Courier New", monospace', fontSize: '22px', color: c.gold, letterSpacing: '.12em', margin: '0 0 20px', textAlign: 'center' }}>
            SHILA — ST — 0000042
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
            {[
              { part: 'SHILA', label: 'Platform prefix', desc: 'Always the same. Identifies this as a Shilalekh record.' },
              { part: 'ST', label: 'Material code', desc: 'ST = Stone & Rock. Two letters identifying the material category.' },
              { part: '0000042', label: 'Global sequence', desc: 'A unique number. Never reused. Never changed.' },
            ].map(({ part, label, desc }) => (
              <div key={part} style={{ background: c.bg, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '14px 10px' }}>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '13px', color: c.gold, marginBottom: '6px' }}>{part}</p>
                <p style={{ fontSize: '10px', letterSpacing: '.1em', color: c.orange, fontFamily: 'Arial, sans-serif', marginBottom: '6px' }}>{label.toUpperCase()}</p>
                <p style={{ fontSize: '11px', color: c.textDim, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: c.textDim, lineHeight: 1.9, marginBottom: '12px', fontFamily: 'Arial, sans-serif', letterSpacing: '.05em' }}>MATERIAL CODES</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { code: 'ST', name: 'Stone & Rock' },
              { code: 'ME', name: 'Metal' },
              { code: 'CL', name: 'Clay & Ceramic' },
              { code: 'OR', name: 'Organic' },
              { code: 'GS', name: 'Gem & Glass' },
              { code: 'PA', name: 'Painted & Informal' },
              { code: 'RO', name: 'Religious Object' },
              { code: 'OT', name: 'Other' },
            ].map(({ code, name }) => (
              <div key={code} style={{ background: c.bgCard, border: `0.5px solid ${c.borderLight}`, borderRadius: '4px', padding: '10px 12px' }}>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '12px', color: c.gold, marginBottom: '3px' }}>{code}</p>
                <p style={{ fontSize: '10px', color: c.textDim, lineHeight: 1.5, margin: 0 }}>{name}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderLeft: `1.5px solid ${c.borderLight}`, paddingLeft: '18px', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', color: c.textDim, lineHeight: 1.9, margin: 0, fontStyle: 'italic' }}>
            ShilaIDs are assigned automatically when a submission is approved. You cannot choose or change a ShilaID. The permanent URL for any record is shilalekh.org/inscription/[ShilaID].
          </p>
        </div>

        {/* ── Suggest an edit ── */}
        <p style={sectionHeadStyle}>SUGGEST AN EDIT</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '12px' }}>Correcting a record</h2>
        <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, marginBottom: '24px' }}>
          Every field on every inscription detail page is open for community correction. Look for the pencil icon <PencilIcon color={c.orange} /> next to any field when you are logged in.
        </p>

        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'Text fields', desc: 'Script, Language, Year, Dynasty, Ruler, Purpose, Condition, Country, State, Location, Accession Number, Short Description, Importance, Detailed Information.' },
            { label: 'Inscription text', desc: 'Actual Text and Transliteration fields use a line-numbered editor — enter one line per physical line on the stone so line numbers correspond to the carved lines.' },
            { label: 'Translation', desc: 'The English Translation field is a free-form text area. Cite your source in the justification field.' },
            { label: 'Photographs', desc: 'Use the Upload Photo button in the photographs section to suggest a new or replacement image. Accepted formats: JPEG, PNG, WebP.' },
          ].map(({ label, desc }) => (
            <div key={label} style={{ background: c.bgCard, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '14px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '12px', letterSpacing: '.08em', color: c.orange, fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>{label.toUpperCase()}</p>
                <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderLeft: `1.5px solid ${c.borderLight}`, paddingLeft: '18px', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', color: c.textDim, lineHeight: 1.9, margin: 0, fontStyle: 'italic' }}>
            All suggestions are reviewed by the Shilalekh admin team before any change is applied. Nothing on the public record changes until it has been approved. Every suggestion is logged against your account.
          </p>
        </div>

        {/* ── Profiles & Avatars ── */}
        <p style={sectionHeadStyle}>PROFILES & AVATARS</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '12px' }}>Your identity on Shilalekh</h2>
        <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, marginBottom: '24px' }}>
          Setting a @handle creates a public profile page and links your contributions to your name. Here is how it all works.
        </p>

        <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
          {[
            {
              label: '@handle',
              desc: 'Set in Account Settings. Must be unique. Forms your public profile URL — shilalekh.org/@yourhandle. Once set, it appears on every inscription you have contributed.',
            },
            {
              label: 'Avatar',
              desc: 'Automatically assigned when you create your profile. Each avatar is a unique character drawn from classical scripts used in Indian epigraphy. You cannot choose or change your avatar — it is assigned to you.',
            },
            {
              label: 'Anonymous option',
              desc: 'You can choose to be anonymous in Account Settings. If you do, your name will not appear on any public-facing page or record. Anonymous means anonymous to the public only — your identity is always on file with the Shilalekh admin team for verification and editorial purposes.',
            },
            {
              label: 'ORCID iD',
              desc: 'Researchers may add their ORCID iD to their profile for formal academic attribution. This is optional.',
            },
          ].map(({ label, desc }) => (
            <div key={label} style={{ background: c.bgCard, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '14px 18px' }}>
              <p style={{ fontSize: '12px', letterSpacing: '.08em', color: c.orange, fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>{label.toUpperCase()}</p>
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.8, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        <div style={{ borderLeft: `1.5px solid ${c.borderLight}`, paddingLeft: '18px', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', color: c.textDim, lineHeight: 1.9, margin: 0, fontStyle: 'italic' }}>
            New users are prompted to complete their profile on first login. Users who created accounts before profiles were introduced will be prompted on their next login.
          </p>
        </div>

        {/* ── Bookmarks ── */}
        <p style={sectionHeadStyle}>BOOKMARKS</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '12px' }}>Your personal reading list</h2>
        <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, marginBottom: '24px' }}>
          Bookmarks let you save inscriptions you want to return to. They are private — no other user can see your bookmarks.
        </p>

        <div style={{ display: 'grid', gap: '10px', marginBottom: '56px' }}>
          {[
            { label: 'Adding a bookmark', desc: 'Click the bookmark ribbon icon on any inscription card (in the list or tile views) or the Bookmark button on any inscription detail page. The icon turns gold when active.' },
            { label: 'Viewing your bookmarks', desc: 'Your bookmarks are accessible from your profile page under the Bookmarks tab. You must be logged in to view them.' },
            { label: 'Removing a bookmark', desc: 'Click the bookmark icon again on any bookmarked inscription to remove it. The change is instant.' },
          ].map(({ label, desc }) => (
            <div key={label} style={{ background: c.bgCard, border: `0.5px solid ${c.borderLight}`, borderRadius: '6px', padding: '14px 18px' }}>
              <p style={{ fontSize: '12px', letterSpacing: '.08em', color: c.orange, fontFamily: 'Arial, sans-serif', marginBottom: '4px' }}>{label.toUpperCase()}</p>
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.8, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Map Pin Legend ── */}
        <p style={sectionHeadStyle}>THE MAP</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '12px' }}>Understanding map pins</h2>
        <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, marginBottom: '28px' }}>
          Shilalekh distinguishes between an inscription's <em>original location</em> — where it was first installed or placed — and its <em>current location</em>, which may be a museum, temple, or private collection. Pin colours on the map reflect this distinction at a glance.
        </p>

        <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
          {[
            {
              color: PIN_GOLD,
              label: 'Gold pin — In situ',
              desc: 'The inscription remains exactly where it was originally installed. The pin marks its true historical site. This is the ideal condition for field researchers.',
            },
            {
              color: PIN_AMBER,
              label: 'Amber pin — Moved',
              desc: 'The original location is known and the pin marks it, but the inscription itself has since been relocated — to a museum, temple store-room, or other site. The current location, if known, is noted in the record.',
            },
            {
              color: PIN_SILVER,
              label: 'Silver pin — Current location only',
              desc: 'The original location is not known. The pin marks where the inscription can be found today — typically a museum, institution, or religious site. The record notes that the provenance is uncertain.',
            },
          ].map(({ color, label, desc }) => (
            <div key={label} style={{
              display: 'flex', gap: '18px', alignItems: 'flex-start',
              background: c.bgCard,
              border: `0.5px solid ${c.borderLight}`,
              borderRadius: '6px',
              padding: '16px 18px',
            }}>
              <PinSvg color={color} size={28} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: c.text, marginBottom: '5px', letterSpacing: '.01em' }}>{label}</p>
                <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}

          <div style={{
            display: 'flex', gap: '18px', alignItems: 'flex-start',
            background: c.bgCard,
            border: `0.5px solid ${c.borderLight}`,
            borderRadius: '6px',
            padding: '16px 18px',
          }}>
            <div style={{ width: 18, display: 'flex', justifyContent: 'center', paddingTop: '4px', flexShrink: 0 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${c.textDim}` }} />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: c.textDim, marginBottom: '5px', letterSpacing: '.01em' }}>No pin — Location unknown</p>
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.8, margin: 0 }}>
                Both the original and current locations are unknown. The record still exists in the database and is fully searchable — it simply does not appear on the map. This covers lost artefacts, missing inscriptions, and records where only a general region is known.
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderLeft: `1.5px solid ${c.borderLight}`, paddingLeft: '18px', marginBottom: '56px' }}>
          <p style={{ fontSize: '12px', color: c.textDim, lineHeight: 1.9, margin: 0, fontStyle: 'italic' }}>
            When submitting an inscription, the form will ask you to specify whether the original location is known and whether the inscription is still in situ. Your answers determine which pin colour is assigned automatically — you do not need to choose it manually.
          </p>
        </div>

        {/* ── Contact ── */}
        <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '40px' }}>
          <p style={sectionHeadStyle}>CONTACT</p>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '16px' }}>Still need help?</h2>
          <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, marginBottom: '28px' }}>
            If you could not find what you were looking for, the team is happy to help. We typically respond within 2 business days.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="mailto:hello@shilalekh.org" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: `0.5px solid ${c.gold}`, borderRadius: '4px', padding: '12px 20px', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
              <span style={{ fontSize: '12px', color: c.gold, letterSpacing: '.05em' }}>hello@shilalekh.org</span>
            </a>
            <a href="mailto:help@shilalekh.org" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: `0.5px solid ${c.borderLight}`, borderRadius: '4px', padding: '12px 20px', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.05em' }}>help@shilalekh.org</span>
            </a>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop: `0.5px solid ${c.borderLight}`, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', color: c.gold, fontFamily: 'Georgia, serif' }}>शिलालेख</span>
          <span style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.15em' }}>SHILALEKH</span>
        </div>
        <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.05em', fontFamily: 'Georgia, serif' }}>यावच्चन्द्रदिवाकरौ</p>
        <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.08em' }}>© 2026 SHILALEKH.ORG</p>
      </div>
    </div>
  )
}