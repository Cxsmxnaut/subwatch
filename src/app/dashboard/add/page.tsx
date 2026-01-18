'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Subscription {
  name: string
  price: string
  billing_cycle: 'monthly' | 'yearly'
  renewal_date: string
  cancel_url: string
}

export default function AddSubscription() {
  const [subscription, setSubscription] = useState<Subscription>({
    name: '',
    price: '',
    billing_cycle: 'monthly',
    renewal_date: '',
    cancel_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [subscriptionCount, setSubscriptionCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)

        if (!error) {
          setSubscriptionCount(data?.length || 0)
        }
      }
    }

    fetchData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSubscription(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!user) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    if (subscriptionCount >= 3) {
      setError('Free users can only have 3 subscriptions')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          name: subscription.name,
          price: parseFloat(subscription.price),
          billing_cycle: subscription.billing_cycle,
          renewal_date: subscription.renewal_date,
          cancel_url: subscription.cancel_url || null
        })

      if (error) throw error

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (subscriptionCount >= 3) {
    return (
      <div className="px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.08)]">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Free Plan Limit Reached
            </h3>
            <p className="text-yellow-700 mb-4">
              You've reached the 3 subscription limit for free users. To add more subscriptions, please upgrade your plan.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg text-yellow-900 bg-yellow-100 hover:bg-yellow-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">Add New Subscription</h3>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subscription Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="block w-full rounded-xl bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 border-0"
                  value={subscription.name}
                  onChange={handleChange}
                  placeholder="Netflix, Spotify, etc."
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    step="0.01"
                    min="0"
                    className="block w-full rounded-xl bg-gray-50 py-3 pl-8 pr-4 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 border-0"
                    value={subscription.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="billing_cycle" className="block text-sm font-semibold text-gray-700 mb-2">
                  Billing Cycle
                </label>
                <select
                  id="billing_cycle"
                  name="billing_cycle"
                  required
                  className="block w-full rounded-xl bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 border-0"
                  value={subscription.billing_cycle}
                  onChange={handleChange}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label htmlFor="renewal_date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Next Renewal Date
                </label>
                <input
                  type="date"
                  id="renewal_date"
                  name="renewal_date"
                  required
                  className="block w-full rounded-xl bg-gray-50 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 border-0"
                  value={subscription.renewal_date}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="cancel_url" className="block text-sm font-semibold text-gray-700 mb-2">
                  Cancellation URL (optional)
                </label>
                <input
                  type="url"
                  id="cancel_url"
                  name="cancel_url"
                  className="block w-full rounded-xl bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 border-0"
                  value={subscription.cancel_url}
                  onChange={handleChange}
                  placeholder="https://example.com/cancel"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Link
                  href="/dashboard"
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Adding...' : 'Add Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
