import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Turnstile } from '@marsidev/react-turnstile'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'
import 'leaflet/dist/leaflet.css'

// ─── Static data ──────────────────────────────────────────────────────────────

const TYPES = ['Rock Edict', 'Temple', 'Cave', 'Copper Plate', 'Bilingual', 'Victory', 'Commemorative', 'Dedicatory', 'Donative', 'Other']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Fragmentary', 'Lost']
const ERAS = ['BCE', 'CE']
const MAX_PHOTOS = 5
const MAX_FILE_SIZE = 6 * 1024 * 1024

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize',
  'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad',
  'Chile', 'China', 'Colombia', 'Comoros', 'Congo (DRC)', 'Congo (Republic)',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia',
  'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein',
  'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
  'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
  'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman',
  'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay',
  'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar',
  'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan',
  'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen',
  'Zambia', 'Zimbabwe',
]

const STATES_BY_COUNTRY: Record<string, string[]> = {
  'India': [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi (NCT)', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
  ],
  'Pakistan': [
    'Balochistan', 'Khyber Pakhtunkhwa', 'Punjab', 'Sindh',
    'Azad Kashmir', 'Gilgit-Baltistan', 'Islamabad Capital Territory',
  ],
  'Bangladesh': [
    'Barishal', 'Chattogram', 'Dhaka', 'Khulna',
    'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet',
  ],
  'Sri Lanka': [
    'Central', 'Eastern', 'North Central', 'Northern',
    'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western',
  ],
  'Afghanistan': [
    'Badakhshan', 'Badghis', 'Baghlan', 'Balkh', 'Bamiyan', 'Daykundi',
    'Farah', 'Faryab', 'Ghazni', 'Ghor', 'Helmand', 'Herat', 'Jowzjan',
    'Kabul', 'Kandahar', 'Kapisa', 'Khost', 'Kunar', 'Kunduz', 'Laghman',
    'Logar', 'Nangarhar', 'Nimroz', 'Nuristan', 'Paktia', 'Paktika',
    'Panjshir', 'Parwan', 'Samangan', 'Sar-e Pol', 'Takhar', 'Uruzgan',
    'Wardak', 'Zabul',
  ],
  'Myanmar': [
    'Ayeyarwady', 'Bago', 'Chin', 'Kachin', 'Kayah', 'Kayin', 'Magway',
    'Mandalay', 'Mon', 'Naypyidaw Union Territory', 'Rakhine', 'Sagaing',
    'Shan', 'Tanintharyi', 'Yangon',
  ],
  'Nepal': [
    'Bagmati', 'Gandaki', 'Karnali', 'Koshi', 'Lumbini', 'Madhesh', 'Sudurpashchim',
  ],
  'Iran': [
    'Alborz', 'Ardabil', 'Bushehr', 'Chaharmahal and Bakhtiari', 'East Azerbaijan',
    'Fars', 'Gilan', 'Golestan', 'Hamadan', 'Hormozgan', 'Ilam', 'Isfahan',
    'Kerman', 'Kermanshah', 'Khuzestan', 'Kohgiluyeh and Boyer-Ahmad', 'Kurdistan',
    'Lorestan', 'Markazi', 'Mazandaran', 'North Khorasan', 'Qazvin', 'Qom',
    'Razavi Khorasan', 'Semnan', 'Sistan and Baluchestan', 'South Khorasan',
    'Tehran', 'West Azerbaijan', 'Yazd', 'Zanjan',
  ],
  'China': [
    'Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi',
    'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hong Kong', 'Hubei',
    'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Macau',
    'Ningxia', 'Qinghai', 'Shaanxi', 'Shandong', 'Shanghai', 'Shanxi', 'Sichuan',
    'Tianjin', 'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang',
  ],
  'Iraq': [
    'Al Anbar', 'Al Muthanna', 'Al-Qādisiyyah', 'Babylon', 'Baghdad', 'Basra',
    'Dhi Qar', 'Diyala', 'Dohuk', 'Erbil', 'Halabja', 'Karbala', 'Kirkuk',
    'Maysan', 'Najaf', 'Nineveh', 'Saladin', 'Sulaymaniyah', 'Wasit',
  ],
  'Egypt': [
    'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo',
    'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia',
    'Kafr El Sheikh', 'Luxor', 'Matruh', 'Minya', 'Monufia', 'New Valley',
    'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea',
    'Sharqia', 'Sohag', 'South Sinai', 'Suez',
  ],
  'Cambodia': [
    'Banteay Meanchey', 'Battambang', 'Kampong Cham', 'Kampong Chhnang',
    'Kampong Speu', 'Kampong Thom', 'Kampot', 'Kandal', 'Kep', 'Koh Kong',
    'Kratie', 'Mondulkiri', 'Oddar Meanchey', 'Pailin', 'Phnom Penh',
    'Preah Sihanouk', 'Preah Vihear', 'Prey Veng', 'Pursat', 'Ratanakiri',
    'Siem Reap', 'Stung Treng', 'Svay Rieng', 'Takeo', 'Tboung Khmum',
  ],
  'Greece': [
    'Attica', 'Central Greece', 'Central Macedonia', 'Crete',
    'Eastern Macedonia and Thrace', 'Epirus', 'Ionian Islands', 'North Aegean',
    'Peloponnese', 'South Aegean', 'Thessaly', 'Western Greece', 'Western Macedonia',
  ],
  'Italy': [
    'Abruzzo', 'Aosta Valley', 'Apulia', 'Basilicata', 'Calabria', 'Campania',
    'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy',
    'Marche', 'Molise', 'Piedmont', 'Sardinia', 'Sicily',
    'Trentino-South Tyrol', 'Tuscany', 'Umbria', 'Veneto',
  ],
  'Turkey': [
    'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara',
    'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman',
    'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
    'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne',
    'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun',
    'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'Istanbul', 'İzmir',
    'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri',
    'Kilis', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya',
    'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde',
    'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Şanlıurfa', 'Siirt',
    'Sinop', 'Şırnak', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli',
    'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
  ],
}

// ─── Watermark ────────────────────────────────────────────────────────────────

const applyWatermark = (file: File, contributorName: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas not supported')); return }
      ctx.drawImage(img, 0, 0)
      const fontSize = Math.max(Math.floor(img.width * 0.022), 16)
      ctx.font = `${fontSize}px Arial, sans-serif`
      const text = `© Shilalekh.org · Photo: ${contributorName}`
      const textWidth = ctx.measureText(text).width
      const padding = 16
      const x = img.width - textWidth - padding
      const y = img.height - padding
      ctx.shadowColor = 'rgba(0,0,0,0.75)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 1
      ctx.shadowOffsetY = 1
      ctx.globalAlpha = 0.38
      ctx.fillStyle = '#ffffff'
      ctx.fillText(text, x, y)
      URL.revokeObjectURL(objectUrl)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
        'image/jpeg', 0.88
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')) }
    img.src = objectUrl
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Submit() {
  const navigate = useNavigate()
  const { c, theme } = useTheme()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [photoErrors, setPhotoErrors] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [showInSituTooltip, setShowInSituTooltip] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY

  const BLANK_FORM = {
    title: '',
    type: '',
    short_description: '',
    country: '',
    state_province: '',
    village_town_city: '',
    current_location: '',
    in_situ: false,
    latitude: '',
    longitude: '',
    year: '',
    year_is_approximate: false,
    era: 'CE',
    dynasty: '',
    reign_ruler: '',
    language: '',
    script: '',
    purpose: '',
    condition: '',
    actual_text: '',
    transliteration: '',
    translation_english: '',
    importance: '',
    detailed_information: '',
    first_discovered_by: '',
    reading_done_by: '',
    credits: '',
    accession_number: '',
    height_cm: '',
    width_cm: '',
    depth_cm: '',
  }

  const [form, setForm] = useState(BLANK_FORM)

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate('/signin')
      else { setUser(session.user); setLoading(false) }
    })
  }, [navigate])

  // ── Lightbox keyboard nav ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight' && lightboxIndex !== null)
        setLightboxIndex(i => i !== null && i < photoPreviews.length - 1 ? i + 1 : i)
      if (e.key === 'ArrowLeft' && lightboxIndex !== null)
        setLightboxIndex(i => i !== null && i > 0 ? i - 1 : i)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, photoPreviews.length])

  // ── Leaflet map init / teardown ─────────────────────────────────────────────
  useEffect(() => {
    if (!showMap) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
      return
    }
    const timer = setTimeout(async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return
      const L = (await import('leaflet')).default
      // Fix broken default icon paths in bundled environments
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })
      const initLat = form.latitude ? parseFloat(form.latitude) : 20.5937
      const initLng = form.longitude ? parseFloat(form.longitude) : 78.9629
      const initZoom = form.latitude ? 10 : 5
      const map = L.map(mapContainerRef.current).setView([initLat, initLng], initZoom)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)
      // If coords already exist, place a draggable marker
      if (form.latitude && form.longitude) {
        const m = L.marker([initLat, initLng], { draggable: true }).addTo(map)
        m.on('dragend', () => {
          const pos = m.getLatLng()
          setForm(prev => ({ ...prev, latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6) }))
        })
        markerRef.current = m
      }
      // Click to place / move marker
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          const m = L.marker([lat, lng], { draggable: true }).addTo(map)
          m.on('dragend', () => {
            const pos = m.getLatLng()
            setForm(prev => ({ ...prev, latitude: pos.lat.toFixed(6), longitude: pos.lng.toFixed(6) }))
          })
          markerRef.current = m
        }
        setForm(prev => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }))
      })
      mapInstanceRef.current = map
    }, 50)
    return () => clearTimeout(timer)
  }, [showMap])

  // ── Sync typed lat/lng → map marker ─────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return
    const lat = parseFloat(form.latitude)
    const lng = parseFloat(form.longitude)
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      markerRef.current.setLatLng([lat, lng])
    }
  }, [form.latitude, form.longitude])

  // ── Cleanup map on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleCountryChange = (country: string) =>
    setForm(prev => ({ ...prev, country, state_province: '' }))

  const stateOptions = STATES_BY_COUNTRY[form.country] || []

  // ── Photo handlers ──────────────────────────────────────────────────────────
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const errs: string[] = []
    const valid: File[] = []
    files.forEach(file => {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        errs.push(`${file.name} — only JPG and PNG files are accepted.`); return
      }
      if (file.size > MAX_FILE_SIZE) {
        errs.push(`${file.name} — file exceeds the 6MB limit.`); return
      }
      valid.push(file)
    })
    const combined = [...photos, ...valid].slice(0, MAX_PHOTOS)
    if (photos.length + valid.length > MAX_PHOTOS)
      errs.push(`Maximum ${MAX_PHOTOS} photos allowed. Some photos were not added.`)
    setPhotos(combined)
    setPhotoErrors(errs)
    setPhotoPreviews(combined.map(f => URL.createObjectURL(f)))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index))
    if (lightboxIndex === index) setLightboxIndex(null)
  }

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = []
    const contributorName = user.user_metadata?.full_name || user.email.split('@')[0]
    for (let i = 0; i < photos.length; i++) {
      const watermarked = await applyWatermark(photos[i], contributorName)
      const fileName = `${user.id}/${Date.now()}-${i}.jpg`
      const { error } = await supabase.storage
        .from('inscription-photos')
        .upload(fileName, watermarked, { contentType: 'image/jpeg', upsert: false })
      if (error) throw new Error(`Failed to upload photo ${i + 1}: ${error.message}`)
      const { data } = supabase.storage.from('inscription-photos').getPublicUrl(fileName)
      urls.push(data.publicUrl)
    }
    return urls
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const errs: string[] = []
    if (!form.title.trim()) errs.push('Title is required.')
    if (!form.type) errs.push('Type is required.')
    if (!form.country) errs.push('Country is required.')
    if (!turnstileToken) errs.push('Security check not complete. Please wait a moment.')
    setErrors(errs)
    if (errs.length) return

    setSubmitting(true)

    const verifyRes = await fetch('/api/verify-turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: turnstileToken }),
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      setErrors(['Security check failed. Please refresh and try again.'])
      setTurnstileToken(null); setTurnstileKey(k => k + 1); setSubmitting(false); return
    }

    let photoUrls: string[] = []
    if (photos.length > 0) {
      setUploadingPhotos(true)
      try { photoUrls = await uploadPhotos() }
      catch (err: any) {
        setErrors([err.message]); setSubmitting(false); setUploadingPhotos(false); return
      }
      setUploadingPhotos(false)
    }

    const payload: any = {
      ...form,
      status: 'pending',
      submitted_by: user.email,
      photo_urls: photoUrls,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      width_cm: form.width_cm ? parseFloat(form.width_cm) : null,
      depth_cm: form.depth_cm ? parseFloat(form.depth_cm) : null,
      year: form.year ? `${form.year} ${form.era}` : null,
    }
    delete payload.era

    const { error } = await supabase.from('inscriptions').insert([payload])
    setSubmitting(false)
    if (error) {
      setErrors([`Submission failed: ${error.message}`])
      setTurnstileToken(null); setTurnstileKey(k => k + 1)
    } else {
      setSubmitted(true)
      fetch('/api/send-inscription-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'received', to: user.email, title: form.title }),
      }).catch(() => {})
    }
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', background: c.bg, border: `0.5px solid ${c.border}`,
    borderRadius: '4px', padding: '10px 14px', color: c.text,
    fontSize: '13px', fontFamily: 'Georgia, serif', outline: 'none',
    boxSizing: 'border-box' as const,
  }
  const selectStyle = { ...inputStyle, cursor: 'pointer' }
  const textareaStyle = { ...inputStyle, resize: 'vertical' as const, minHeight: '90px', lineHeight: 1.6 }
  const labelStyle = {
    fontSize: '9px', letterSpacing: '.15em', color: c.textDim,
    marginBottom: '6px', display: 'block' as const, fontFamily: 'Arial, sans-serif',
  }
  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }

  const sectionLabel = (text: string, required = false) => (
    <div style={{ borderBottom: `0.5px solid ${c.borderLight}`, paddingBottom: '10px', marginBottom: '20px', marginTop: '36px' }}>
      <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, fontFamily: 'Arial, sans-serif' }}>
        {text}{required && <span style={{ color: c.orange }}> *</span>}
      </p>
    </div>
  )

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>LOADING...</p>
    </div>
  )

  // ── Success ─────────────────────────────────────────────────────────────────
  if (submitted) return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '160px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '24px', color: c.gold }}>शिलालेख</div>
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>SUBMISSION RECEIVED</p>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 300, color: c.gold, marginBottom: '16px' }}>Thank you for contributing</h2>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '0 auto 24px', opacity: .5 }} />
        <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8, marginBottom: '32px' }}>
          Your inscription has been submitted for review. We have sent a confirmation to{' '}
          <strong style={{ color: c.text }}>{user?.email}</strong>. Our team will verify the details and you will hear from us once a decision has been made.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/inscriptions')}
            style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer', fontWeight: 600 }}>
            BROWSE INSCRIPTIONS
          </button>
          <button onClick={() => {
            setSubmitted(false); setTurnstileToken(null); setTurnstileKey(k => k + 1)
            setPhotos([]); setPhotoPreviews([]); setPhotoErrors([])
            setForm(BLANK_FORM)
          }} style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textMuted, padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>
            SUBMIT ANOTHER
          </button>
        </div>
      </div>
    </div>
  )

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div onClick={() => setLightboxIndex(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <img src={photoPreviews[lightboxIndex]} onClick={e => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '4px' }} />
          <button onClick={() => setLightboxIndex(null)}
            style={{ position: 'absolute', top: '20px', right: '24px', background: 'transparent', border: 'none', color: '#fff', fontSize: '28px', cursor: 'pointer', lineHeight: 1 }}>×</button>
          {lightboxIndex > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! - 1) }}
              style={{ position: 'absolute', left: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '4px' }}>‹</button>
          )}
          {lightboxIndex < photoPreviews.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i! + 1) }}
              style={{ position: 'absolute', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', padding: '12px 16px', borderRadius: '4px' }}>›</button>
          )}
          <p style={{ position: 'absolute', bottom: '20px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '.1em' }}>
            {lightboxIndex + 1} / {photoPreviews.length} · Press Esc to close
          </p>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 32px 80px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
          onClick={() => navigate('/')}>← BACK TO HOME</p>
        <p style={{ fontSize: '11px', letterSpacing: '.3em', color: c.orange, marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>CONTRIBUTE</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '8px', letterSpacing: '.05em' }}>Submit an Inscription</h1>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '20px 0', opacity: .5 }} />
        <p style={{ fontSize: '13px', color: c.textMuted, lineHeight: 1.8, marginBottom: '8px' }}>
          Fill in as much detail as you can. Only Title, Type and Country are required — the more you add, the more valuable the record.
        </p>
        <p style={{ fontSize: '12px', color: c.textDim, marginBottom: '8px' }}>
          Submitting as: <span style={{ color: c.gold }}>{user?.email}</span>
        </p>

        {errors.length > 0 && (
          <div style={{ background: 'rgba(196,98,45,0.1)', border: `0.5px solid ${c.orange}`, borderRadius: '4px', padding: '12px 16px', marginTop: '16px' }}>
            {errors.map((e, i) => <p key={i} style={{ fontSize: '12px', color: c.orange, marginBottom: i < errors.length - 1 ? '4px' : 0 }}>{e}</p>)}
          </div>
        )}

        {/* ══ BASIC INFORMATION ══ */}
        {sectionLabel('BASIC INFORMATION', true)}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>TITLE *</label>
          <input style={inputStyle} placeholder="e.g. Maski Rock Edict of Ashoka" value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>TYPE *</label>
            <select style={selectStyle} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="">Select type...</option>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>CONDITION</label>
            <select style={selectStyle} value={form.condition} onChange={e => set('condition', e.target.value)}>
              <option value="">Select condition...</option>
              {CONDITIONS.map(cd => <option key={cd} value={cd}>{cd}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>SHORT DESCRIPTION</label>
          <textarea style={textareaStyle} placeholder="A brief description of the inscription — what it is and why it matters." value={form.short_description} onChange={e => set('short_description', e.target.value)} />
        </div>

        {/* ══ LOCATION ══ */}
        {sectionLabel('LOCATION')}

        {/* Location note */}
        <div style={{ background: theme === 'dark' ? 'rgba(186,117,23,0.12)' : 'rgba(186,117,23,0.07)', borderLeft: `3px solid ${c.orange}`, borderRadius: '0 4px 4px 0', padding: '10px 14px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: c.orange, lineHeight: 1.6, margin: 0 }}>
            Enter the <strong>present-day location</strong> of the inscription — not its ancient or historical place of origin. If it has been moved to a museum, use the museum's location.
          </p>
        </div>

        {/* Country + State dropdowns */}
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>COUNTRY *</label>
            <select style={selectStyle} value={form.country} onChange={e => handleCountryChange(e.target.value)}>
              <option value="">Select country...</option>
              {COUNTRIES.map(co => <option key={co} value={co}>{co}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>STATE / PROVINCE</label>
            {stateOptions.length > 0 ? (
              <select style={selectStyle} value={form.state_province} onChange={e => set('state_province', e.target.value)}>
                <option value="">Select state / province...</option>
                {stateOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <input style={inputStyle} placeholder="e.g. Île-de-France" value={form.state_province} onChange={e => set('state_province', e.target.value)} />
            )}
          </div>
        </div>

        {/* Village + Current location */}
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>VILLAGE / TOWN / CITY</label>
            <input style={inputStyle} placeholder="e.g. Raigad" value={form.village_town_city} onChange={e => set('village_town_city', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>CURRENT LOCATION</label>
            <input style={inputStyle} placeholder="e.g. National Museum, New Delhi" value={form.current_location} onChange={e => set('current_location', e.target.value)} />
          </div>
        </div>

        {/* In situ checkbox */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="in_situ" checked={form.in_situ} onChange={e => set('in_situ', e.target.checked)}
            style={{ accentColor: c.gold, width: '14px', height: '14px', cursor: 'pointer' }} />
          <label htmlFor="in_situ" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>INSCRIPTION IS IN SITU</label>
          {/* ? tooltip */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span
              onMouseEnter={() => setShowInSituTooltip(true)}
              onMouseLeave={() => setShowInSituTooltip(false)}
              style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1px solid ${c.textDim}`, color: c.textDim, fontSize: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'help', fontFamily: 'Arial, sans-serif', userSelect: 'none' as const, flexShrink: 0 }}
            >?</span>
            {showInSituTooltip && (
              <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: theme === 'dark' ? '#1c1c1c' : '#fffaf3', color: c.text, border: `0.5px solid ${c.border}`, borderRadius: '4px', padding: '10px 14px', fontSize: '12px', lineHeight: 1.6, width: '280px', zIndex: 200, pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                <strong>In situ</strong> means the inscription remains exactly where it was first carved or installed — its original location. If it has been moved to a museum, temple store-room, or any other site, it is <em>not</em> in situ.
              </div>
            )}
          </div>
        </div>

        {/* Lat / Lng */}
        <div style={{ ...grid2, marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>LATITUDE</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 18.2637" value={form.latitude}
              onChange={e => set('latitude', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>LONGITUDE</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 73.4403" value={form.longitude}
              onChange={e => set('longitude', e.target.value)} />
          </div>
        </div>

        {/* Pin on map toggle */}
        <button
          onClick={() => setShowMap(v => !v)}
          style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '8px 16px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.08em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = c.gold)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
        >
          <span>📍</span>
          {showMap ? 'HIDE MAP' : "DON'T KNOW THE COORDINATES? PIN ON MAP"}
        </button>

        {/* Leaflet map container */}
        {showMap && (
          <div style={{ marginBottom: '20px' }}>
            <div ref={mapContainerRef} style={{ height: '320px', borderRadius: '6px', border: `0.5px solid ${c.border}`, overflow: 'hidden' }} />
            <p style={{ fontSize: '11px', color: c.textDim, marginTop: '8px', fontFamily: 'Arial, sans-serif', lineHeight: 1.5 }}>
              Click anywhere on the map to place a pin. Drag the pin to fine-tune. Coordinates fill in automatically.
              {form.latitude && form.longitude && (
                <span style={{ color: c.orange }}> · Pinned at {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}</span>
              )}
            </p>
          </div>
        )}

        {/* ══ HISTORICAL CONTEXT ══ */}
        {sectionLabel('HISTORICAL CONTEXT')}
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>YEAR</label>
            <input style={inputStyle} placeholder="e.g. 250" value={form.year} onChange={e => set('year', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>ERA</label>
            <select style={selectStyle} value={form.era} onChange={e => set('era', e.target.value)}>
              {ERAS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="approx" checked={form.year_is_approximate} onChange={e => set('year_is_approximate', e.target.checked)}
            style={{ accentColor: c.gold, width: '14px', height: '14px' }} />
          <label htmlFor="approx" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>YEAR IS APPROXIMATE</label>
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>DYNASTY</label>
            <input style={inputStyle} placeholder="e.g. Maurya" value={form.dynasty} onChange={e => set('dynasty', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>REIGN / RULER</label>
            <input style={inputStyle} placeholder="e.g. Emperor Ashoka" value={form.reign_ruler} onChange={e => set('reign_ruler', e.target.value)} />
          </div>
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>LANGUAGE</label>
            <input style={inputStyle} placeholder="e.g. Prakrit" value={form.language} onChange={e => set('language', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>SCRIPT</label>
            <input style={inputStyle} placeholder="e.g. Brahmi" value={form.script} onChange={e => set('script', e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>PURPOSE</label>
          <input style={inputStyle} placeholder="e.g. Royal proclamation, Temple dedication, Memorial" value={form.purpose} onChange={e => set('purpose', e.target.value)} />
        </div>

        {/* ══ THE INSCRIPTION TEXT ══ */}
        {sectionLabel('THE INSCRIPTION TEXT')}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>ACTUAL TEXT (original script)</label>
          <textarea style={textareaStyle} placeholder="Paste the original inscription text here if known." value={form.actual_text} onChange={e => set('actual_text', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>TRANSLITERATION</label>
          <textarea style={textareaStyle} placeholder="Romanised transliteration of the text." value={form.transliteration} onChange={e => set('transliteration', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>ENGLISH TRANSLATION</label>
          <textarea style={textareaStyle} placeholder="English translation of the inscription." value={form.translation_english} onChange={e => set('translation_english', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>IMPORTANCE</label>
          <textarea style={textareaStyle} placeholder="Why is this inscription significant? What does it tell us?" value={form.importance} onChange={e => set('importance', e.target.value)} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>DETAILED INFORMATION</label>
          <textarea style={{ ...textareaStyle, minHeight: '120px' }} placeholder="Any additional historical, archaeological or epigraphic details." value={form.detailed_information} onChange={e => set('detailed_information', e.target.value)} />
        </div>

        {/* ══ PHYSICAL DETAILS ══ */}
        {sectionLabel('PHYSICAL DETAILS')}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>HEIGHT (cm)</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 120" value={form.height_cm} onChange={e => set('height_cm', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>WIDTH (cm)</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 80" value={form.width_cm} onChange={e => set('width_cm', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>DEPTH (cm)</label>
            <input style={inputStyle} type="number" step="any" placeholder="e.g. 30" value={form.depth_cm} onChange={e => set('depth_cm', e.target.value)} />
          </div>
        </div>

        {/* ══ PHOTOGRAPHS ══ */}
        {sectionLabel('PHOTOGRAPHS')}
        <p style={{ fontSize: '12px', color: c.textDim, lineHeight: 1.7, marginBottom: '16px' }}>
          Upload up to {MAX_PHOTOS} photos of the inscription. JPG and PNG only, max 6MB each.
          Photos will be watermarked with © Shilalekh.org before being stored.
        </p>
        {photoErrors.length > 0 && (
          <div style={{ background: 'rgba(196,98,45,0.08)', border: `0.5px solid ${c.orange}`, borderRadius: '4px', padding: '10px 14px', marginBottom: '12px' }}>
            {photoErrors.map((e, i) => <p key={i} style={{ fontSize: '12px', color: c.orange, marginBottom: i < photoErrors.length - 1 ? '4px' : 0 }}>{e}</p>)}
          </div>
        )}
        {photos.length < MAX_PHOTOS && (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ border: `1px dashed ${c.border}`, borderRadius: '6px', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = c.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c.textDim} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 10px', display: 'block' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '4px' }}>Click to add photos</p>
            <p style={{ fontSize: '11px', color: c.textFaint }}>
              {photos.length} / {MAX_PHOTOS} photos added · JPG, PNG · Max 6MB each
            </p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" multiple onChange={handlePhotoSelect} style={{ display: 'none' }} />
          </div>
        )}
        {photoPreviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
            {photoPreviews.map((src, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', aspectRatio: '4/3', background: c.borderLight }}>
                <img src={src} onClick={() => setLightboxIndex(i)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', display: 'block' }} />
                <button onClick={() => removePhoto(i)}
                  style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                <div style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', padding: '2px 6px' }}>
                  <p style={{ fontSize: '10px', color: '#fff', margin: 0 }}>{i + 1}</p>
                </div>
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <div onClick={() => fileInputRef.current?.click()}
                style={{ border: `1px dashed ${c.border}`, borderRadius: '4px', aspectRatio: '4/3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: '6px' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = c.gold)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
                <span style={{ fontSize: '24px', color: c.textDim, lineHeight: 1 }}>+</span>
                <span style={{ fontSize: '10px', color: c.textFaint }}>Add more</span>
              </div>
            )}
          </div>
        )}

        {/* ══ CREDITS & REFERENCES ══ */}
        {sectionLabel('CREDITS & REFERENCES')}
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>FIRST DISCOVERED BY</label>
            <input style={inputStyle} placeholder="Name of discoverer or expedition" value={form.first_discovered_by} onChange={e => set('first_discovered_by', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>READING / DECIPHERMENT BY</label>
            <input style={inputStyle} placeholder="Scholar who read or deciphered the text" value={form.reading_done_by} onChange={e => set('reading_done_by', e.target.value)} />
          </div>
        </div>
        <div style={{ ...grid2, marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>CREDITS / SOURCES</label>
            <input style={inputStyle} placeholder="Books, papers, museums, institutions" value={form.credits} onChange={e => set('credits', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>ACCESSION NUMBER</label>
            <input style={inputStyle} placeholder="Museum or ASI accession number if known" value={form.accession_number} onChange={e => set('accession_number', e.target.value)} />
          </div>
        </div>

        {/* ══ Submit ══ */}
        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: `0.5px solid ${c.borderLight}` }}>
          <div style={{ marginBottom: '16px' }}>
            <Turnstile
              key={turnstileKey}
              siteKey={siteKey}
              onSuccess={token => setTurnstileToken(token)}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
              options={{ theme: theme === 'dark' ? 'dark' : 'light', size: 'normal' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleSubmit}
              disabled={submitting || !turnstileToken}
              style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '12px 36px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: (submitting || !turnstileToken) ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (submitting || !turnstileToken) ? 0.5 : 1 }}
            >
              {uploadingPhotos ? 'UPLOADING PHOTOS...' : submitting ? 'SUBMITTING...' : 'SUBMIT FOR REVIEW'}
            </button>
            <p style={{ fontSize: '11px', color: c.textFaint, lineHeight: 1.6 }}>Your submission will be reviewed before appearing in the public database.</p>
          </div>
        </div>

      </div>

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