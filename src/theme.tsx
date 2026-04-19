import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

export const colors = {
  dark: {
    bg: '#0a0a0a',
    bgSecondary: '#111111',
    bgCard: '#111111',
    border: '#2a2a2a',
    borderLight: '#1e1e1e',
    text: '#e8e4d9',
    textMuted: '#888780',
    textDim: '#555250',
    textFaint: '#333',
    gold: '#d4a843',
    orange: '#c4622d',
    navBg: 'rgba(10,10,10,0.97)',
  },
  light: {
    bg: '#f5f0e4',
    bgSecondary: '#ede8db',
    bgCard: '#ede8db',
    border: '#d8d2c4',
    borderLight: '#e0dbd0',
    text: '#1a1a18',
    textMuted: '#5a5650',
    textDim: '#7a7670',
    textFaint: '#aaa8a4',
    gold: '#8a6c28',
    orange: '#c4622d',
    navBg: 'rgba(245,240,228,0.97)',
  }
}

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
  c: typeof colors.dark
}>({ theme: 'dark', toggleTheme: () => {}, c: colors.dark })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('shilalekh-theme') as Theme) || 'dark'
  })

  useEffect(() => {
    localStorage.setItem('shilalekh-theme', theme)
    document.body.style.background = colors[theme].bg
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, c: colors[theme] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)