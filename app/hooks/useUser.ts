'use client'

import { useEffect, useState } from 'react'
import { getUser } from '../actions/auth'
import { SessionData } from '../lib/session'

export function useUser() {
  const [user, setUser] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  const mutate = (newUser: SessionData | null) => {
    setUser(newUser)
  }

  useEffect(() => {
    getUser().then((userData) => {
      setUser(userData)
      setLoading(false)
    })
  }, [])

  return { user, loading, mutate }
}

