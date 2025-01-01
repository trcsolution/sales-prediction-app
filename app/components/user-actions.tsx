'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logout } from '../actions/auth'
import { useUser } from '../hooks/useUser'

export default function UserActions() {
  const router = useRouter()
  const { user, loading, mutate } = useUser()

  const handleLogout = async () => {
    await logout()
    mutate(null) // Update the user state
    router.push('/') // Redirect to home page
    router.refresh()
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <span>Welcome, {user.username}!</span>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Button onClick={() => router.push('/login')}>Login</Button>
      <Button onClick={() => router.push('/register')}>Register</Button>
    </div>
  )
}

