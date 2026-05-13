import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export function useBookmarks() {
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUserId(session.user.id); fetchBookmarks(session.user.id) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUserId(session.user.id); fetchBookmarks(session.user.id) }
      else { setUserId(null); setBookmarked(new Set()) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchBookmarks(uid: string) {
    const { data } = await supabase.from('bookmarks').select('inscription_id').eq('user_id', uid)
    if (data) setBookmarked(new Set(data.map((b: any) => b.inscription_id)))
  }

  async function toggle(inscriptionId: number) {
    if (!userId) return false // caller should redirect to /signin
    const isBookmarked = bookmarked.has(inscriptionId)
    // Optimistic update
    setBookmarked(prev => {
      const next = new Set(prev)
      isBookmarked ? next.delete(inscriptionId) : next.add(inscriptionId)
      return next
    })
    if (isBookmarked) {
      await supabase.from('bookmarks').delete().eq('user_id', userId).eq('inscription_id', inscriptionId)
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, inscription_id: inscriptionId })
    }
    return true
  }

  return { bookmarked, toggle, isLoggedIn: !!userId }
}