'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        router.push('/dashboard')
      }
    }

    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Wait a moment for session to establish, then redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(90deg,#e2e2e2,#c9d6ff)] flex items-center justify-center px-4 py-8">
      <div className="relative w-full max-w-4xl h-[560px] bg-white rounded-[32px] shadow-[0_0_30px_rgba(0,0,0,0.2)] overflow-hidden flex">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-10">
          <div className="w-full max-w-sm text-center">
            <h2 className="text-4xl font-semibold text-gray-900">Login</h2>
            <p className="mt-2 text-sm text-gray-500">Access your SubWatch dashboard</p>

            <form className="mt-8 space-y-5" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full rounded-lg bg-gray-100 px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    @
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-lg bg-gray-100 px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    •
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#7494ec] py-3 text-white font-semibold shadow-md transition hover:bg-[#5f7fe0] disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:flex w-1/2 bg-[#7494ec] text-white items-center justify-center p-12">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-semibold">Welcome Back!</h3>
            <p className="text-sm text-blue-100">New here? Create your account in seconds.</p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg border border-white px-6 py-2 text-sm font-semibold hover:bg-white hover:text-[#7494ec] transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
