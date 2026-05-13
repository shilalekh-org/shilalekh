import React from 'react'

export interface AvatarDef {
  id: string
  name: string
  meaning: string
  bg: string
}

export const AVATAR_LIST: AvatarDef[] = [
  { id: 'surya',    name: 'Surya',    meaning: 'the sun',          bg: '#BA7517' },
  { id: 'chandra',  name: 'Chandra',  meaning: 'the moon',         bg: '#185FA5' },
  { id: 'kamala',   name: 'Kamala',   meaning: 'lotus',            bg: '#0F6E56' },
  { id: 'chakra',   name: 'Chakra',   meaning: 'the wheel',        bg: '#534AB7' },
  { id: 'taksha',   name: 'Taksha',   meaning: 'the carver',       bg: '#993C1D' },
  { id: 'trishula', name: 'Trishula', meaning: 'the trident',      bg: '#085041' },
  { id: 'lekha',    name: 'Lekha',    meaning: 'the inscription',  bg: '#3C3489' },
  { id: 'tara',     name: 'Tara',     meaning: 'the star',         bg: '#993556' },
  { id: 'pashana',  name: 'Pashana',  meaning: 'the stone',        bg: '#f0ebe0' },
  { id: 'om',       name: 'Om',       meaning: 'the sacred sound', bg: '#B36000' },
  { id: 'kalasha',  name: 'Kalasha',  meaning: 'the sacred pot',   bg: '#854F0B' },
  { id: 'matsya',   name: 'Matsya',   meaning: 'the fish',         bg: '#042C53' },
  { id: 'damaru',   name: 'Damaru',   meaning: 'the drum',         bg: '#27500A' },
  { id: 'vriksha',  name: 'Vriksha',  meaning: 'the tree',         bg: '#26215C' },
  { id: 'triratna', name: 'Triratna', meaning: 'the three jewels', bg: '#3C686A' },
]

function AvatarSvg({ id, size }: { id: string; size: number }) {
  switch (id) {
    case 'surya': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <circle cx="22" cy="22" r="7"/>
        <rect x="20.5" y="2" width="3" height="8" rx="1.5"/>
        <rect x="20.5" y="2" width="3" height="8" rx="1.5" transform="rotate(45 22 22)"/>
        <rect x="20.5" y="2" width="3" height="8" rx="1.5" transform="rotate(90 22 22)"/>
        <rect x="20.5" y="2" width="3" height="8" rx="1.5" transform="rotate(135 22 22)"/>
        <rect x="20.5" y="2" width="3" height="8" rx="1.5" transform="rotate(180 22 22)"/>
        <rect x="20.5" y="2" width="3" height="8" rx="1.5" transform="rotate(225 22 22)"/>
        <rect x="20.5" y="2" width="3" height="8" rx="1.5" transform="rotate(270 22 22)"/>
        <rect x="20.5" y="2" width="3" height="8" rx="1.5" transform="rotate(315 22 22)"/>
      </svg>
    )
    case 'chandra': return (
      <svg width={size} height={size} viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="14" fill="white"/>
        <circle cx="28" cy="20" r="11" fill="#185FA5"/>
      </svg>
    )
    case 'kamala': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <ellipse cx="22" cy="14" rx="4" ry="8"/>
        <ellipse cx="22" cy="14" rx="4" ry="8" transform="rotate(60 22 22)"/>
        <ellipse cx="22" cy="14" rx="4" ry="8" transform="rotate(120 22 22)"/>
        <ellipse cx="22" cy="14" rx="4" ry="8" transform="rotate(180 22 22)"/>
        <ellipse cx="22" cy="14" rx="4" ry="8" transform="rotate(240 22 22)"/>
        <ellipse cx="22" cy="14" rx="4" ry="8" transform="rotate(300 22 22)"/>
        <circle cx="22" cy="22" r="5"/>
      </svg>
    )
    case 'chakra': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" stroke="white" strokeLinecap="round">
        <circle cx="22" cy="22" r="13" strokeWidth="2"/>
        <circle cx="22" cy="22" r="4" fill="white" stroke="none"/>
        <line x1="22" y1="9" x2="22" y2="18" strokeWidth="2"/>
        <line x1="22" y1="26" x2="22" y2="35" strokeWidth="2"/>
        <line x1="9" y1="22" x2="18" y2="22" strokeWidth="2"/>
        <line x1="26" y1="22" x2="35" y2="22" strokeWidth="2"/>
        <line x1="12.8" y1="12.8" x2="18.8" y2="18.8" strokeWidth="2"/>
        <line x1="25.2" y1="25.2" x2="31.2" y2="31.2" strokeWidth="2"/>
        <line x1="31.2" y1="12.8" x2="25.2" y2="18.8" strokeWidth="2"/>
        <line x1="18.8" y1="25.2" x2="12.8" y2="31.2" strokeWidth="2"/>
      </svg>
    )
    case 'taksha': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <rect x="20.5" y="7" width="3" height="14" rx="1.5"/>
        <polygon points="22,21 14,37 30,37"/>
        <rect x="14" y="34" width="16" height="3.5" rx="1.75"/>
      </svg>
    )
    case 'trishula': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <rect x="20.5" y="26" width="3" height="13" rx="1.5"/>
        <rect x="15" y="24" width="14" height="2.5" rx="1.25"/>
        <rect x="20.5" y="10" width="3" height="16" rx="1.5"/>
        <rect x="13" y="16" width="3" height="10" rx="1.5"/>
        <rect x="28" y="16" width="3" height="10" rx="1.5"/>
        <path d="M20.5 10 C19 7 19 5 22 5 C25 5 25 7 23.5 10Z"/>
        <path d="M13 16 C11 13 11 11 13.5 12 C14.5 13 14.5 15.5 13 16Z"/>
        <path d="M31 16 C33 13 33 11 30.5 12 C29.5 13 29.5 15.5 31 16Z"/>
      </svg>
    )
    case 'lekha': return (
      <svg width={size} height={size} viewBox="0 0 44 44">
        <text x="22" y="30" textAnchor="middle" fontSize="22" fill="white" fontFamily="serif">श्री</text>
      </svg>
    )
    case 'tara': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <polygon points="22,5 25.5,16 37,16 28,23 31.5,34 22,27 12.5,34 16,23 7,16 18.5,16"/>
      </svg>
    )
    case 'pashana': return (
      <svg width={size} height={size} viewBox="0 0 44 44">
        <rect x="13" y="7" width="18" height="30" rx="3" fill="#2C2C2A"/>
        <line x1="17" y1="14" x2="27" y2="14" stroke="#f0ebe0" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="17" y1="19" x2="27" y2="19" stroke="#f0ebe0" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="17" y1="24" x2="24" y2="24" stroke="#f0ebe0" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="17" y1="29" x2="26" y2="29" stroke="#f0ebe0" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
    case 'om': return (
      <svg width={size} height={size} viewBox="0 0 44 44">
        <text x="22" y="30" textAnchor="middle" fontSize="24" fill="white" fontFamily="serif">ॐ</text>
      </svg>
    )
    case 'kalasha': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <rect x="16" y="36" width="12" height="2.5" rx="1.25"/>
        <ellipse cx="22" cy="28" rx="10" ry="9"/>
        <rect x="19" y="17" width="6" height="5" rx="2"/>
        <rect x="15.5" y="16" width="13" height="2.5" rx="1.25"/>
        <ellipse cx="22" cy="13" rx="4" ry="3.5"/>
        <ellipse cx="15" cy="19" rx="2.5" ry="5" transform="rotate(-25 15 19)"/>
        <ellipse cx="29" cy="19" rx="2.5" ry="5" transform="rotate(25 29 19)"/>
      </svg>
    )
    case 'matsya': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <ellipse cx="20" cy="23" rx="11" ry="7"/>
        <polygon points="31,23 39,15 39,31"/>
        <path d="M19 16 C21 10 26 11 25 15Z"/>
        <circle cx="12" cy="21" r="2.5" fill="#042C53"/>
        <circle cx="12" cy="21" r="1" fill="white"/>
      </svg>
    )
    case 'damaru': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <polygon points="22,22 10,8 34,8"/>
        <polygon points="22,22 10,36 34,36"/>
        <rect x="17" y="20" width="10" height="4" rx="2"/>
        <circle cx="5" cy="22" r="3"/>
        <circle cx="39" cy="22" r="3"/>
      </svg>
    )
    case 'vriksha': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <rect x="20" y="29" width="4" height="10" rx="2"/>
        <rect x="14" y="37" width="16" height="3" rx="1.5"/>
        <circle cx="22" cy="18" r="9"/>
        <circle cx="15" cy="24" r="7"/>
        <circle cx="29" cy="24" r="7"/>
      </svg>
    )
    case 'triratna': return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <rect x="11" y="34" width="22" height="2.5" rx="1.25"/>
        <circle cx="16" cy="27" r="6.5"/>
        <circle cx="28" cy="27" r="6.5"/>
        <circle cx="22" cy="17" r="6.5"/>
      </svg>
    )
    default: return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="white">
        <circle cx="22" cy="22" r="12"/>
      </svg>
    )
  }
}

interface AvatarDisplayProps {
  avatarId?: string | null
  size?: number
  fallbackLetter?: string
}

export function AvatarDisplay({ avatarId, size = 36, fallbackLetter }: AvatarDisplayProps) {
  const def = AVATAR_LIST.find(a => a.id === avatarId)
  const isPashana = def?.id === 'pashana'

  if (!def) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: '#d4a843', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
        fontSize: Math.round(size * 0.4), fontWeight: 600,
        color: '#0a0a0a', fontFamily: 'Arial, sans-serif',
      }}>
        {(fallbackLetter || '?').toUpperCase()}
      </div>
    )
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: def.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
      border: isPashana ? '1.5px solid #c8c2b4' : 'none',
      boxSizing: 'border-box', overflow: 'hidden',
    }}>
      <AvatarSvg id={def.id} size={Math.round(size * 0.77)} />
    </div>
  )
}

interface AvatarPickerProps {
  selected: string
  onChange: (id: string) => void
  gold: string
  textDim: string
}

export function AvatarPicker({ selected, onChange, gold, textDim }: AvatarPickerProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
      {AVATAR_LIST.map(av => {
        const isSelected = selected === av.id
        const isPashana = av.id === 'pashana'
        return (
          <div key={av.id} onClick={() => onChange(av.id)}
            title={`${av.name} — ${av.meaning}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', padding: 3,
              border: `3px solid ${isSelected ? gold : 'transparent'}`,
              boxSizing: 'border-box',
              transition: 'border-color 0.15s, transform 0.15s',
              transform: isSelected ? 'scale(1.06)' : 'scale(1)',
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: av.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                border: isPashana ? '1.5px solid #c8c2b4' : 'none',
                boxSizing: 'border-box',
              }}>
                <AvatarSvg id={av.id} size={36} />
              </div>
            </div>
            <span style={{
              fontSize: 9, color: isSelected ? gold : textDim,
              fontFamily: 'Arial, sans-serif', letterSpacing: '.03em',
              textAlign: 'center',
            }}>{av.name}</span>
          </div>
        )
      })}
    </div>
  )
}