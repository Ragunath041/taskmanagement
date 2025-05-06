'use client'

import { useRouter } from 'next/navigation'
import LoginForm from '../components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()

  const handlelogin = () => {
    router.push('/dashboard')
  }

  return <LoginForm onLogin={handlelogin} />
}
