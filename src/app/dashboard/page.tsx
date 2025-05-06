'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Dashboard from '../components/dashboard/Dashboard'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    // Clear all user info and redirect to login
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userName')
    router.push('/login')
  }

  return <Dashboard onLogout={handleLogout} />
}
