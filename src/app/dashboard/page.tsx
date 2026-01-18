'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, DollarSign, CreditCard, AlertCircle } from 'lucide-react'

interface Subscription {
  id: string
  name: string
  price: number
  billing_cycle: 'monthly' | 'yearly'
  renewal_date: string
  cancel_url: string
}

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user)

      if (session?.user) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('renewal_date', { ascending: true })

        if (error) {
          console.error('Error fetching subscriptions:', error)
        } else {
          setSubscriptions(data || [])
        }
      }
      
      setLoading(false)
    }

    fetchData()
  }, [])

  const calculateMonthlyTotal = () => {
    return subscriptions
      .filter(sub => sub.billing_cycle === 'monthly')
      .reduce((total, sub) => total + sub.price, 0)
  }

  const calculateYearlyTotal = () => {
    const monthlyTotal = calculateMonthlyTotal() * 12
    const yearlyTotal = subscriptions
      .filter(sub => sub.billing_cycle === 'yearly')
      .reduce((total, sub) => total + sub.price, 0)
    return monthlyTotal + yearlyTotal
  }

  const getNextRenewal = () => {
    if (subscriptions.length === 0) return null
    
    const today = new Date()
    const upcomingSubscriptions = subscriptions
      .filter(sub => new Date(sub.renewal_date) >= today)
      .sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime())
    
    return upcomingSubscriptions[0] || null
  }

  const getDaysUntilRenewal = (renewalDate: string) => {
    const today = new Date()
    const renewal = new Date(renewalDate)
    const diffTime = renewal.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isNearRenewal = (renewalDate: string) => {
    const days = getDaysUntilRenewal(renewalDate)
    return days >= 0 && days <= 7
  }

  const deleteSubscription = async (id: string) => {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subscription:', error)
    } else {
      setSubscriptions(subscriptions.filter(sub => sub.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const nextRenewal = getNextRenewal()
  const isFreeUserLimitReached = subscriptions.length >= 3

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 rounded-2xl p-6 mb-6 text-white">
        <p className="text-sm opacity-90 mb-2">Good morning, {user?.user_metadata?.first_name || 'there'}</p>
        <p className="text-3xl font-bold mb-4">${calculateMonthlyTotal().toFixed(2)}</p>
        <p className="text-sm opacity-90">Monthly Subscriptions</p>
        <div className="flex gap-3 mt-6">
          <button className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            📊 Analytics
          </button>
          <button className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium">
            ➕ Add
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Next Renewal</p>
          <p className="text-xl font-bold text-gray-900">
            {nextRenewal ? new Date(nextRenewal.renewal_date).toLocaleDateString() : 'None'}
          </p>
          {nextRenewal && (
            <p className="text-xs text-gray-500 mt-1">
              {getDaysUntilRenewal(nextRenewal.renewal_date)} days
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Subscriptions</p>
          <p className="text-xl font-bold text-gray-900">{subscriptions.length}</p>
          {isFreeUserLimitReached && (
            <p className="text-xs text-orange-500 mt-1">Free limit reached</p>
          )}
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Your Subscriptions</h3>
        </div>
        
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">No subscriptions</h3>
            <p className="text-sm text-gray-500 mb-6">Add your first subscription to get started</p>
            <a
              href="/dashboard/add"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors"
            >
              Add Subscription
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className={`p-4 transition-colors ${
                  isNearRenewal(subscription.renewal_date) ? 'bg-orange-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-gray-900">{subscription.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">${subscription.price.toFixed(2)}/{subscription.billing_cycle}</span>
                      <span className="text-sm text-gray-500">
                        Renews {new Date(subscription.renewal_date).toLocaleDateString()}
                      </span>
                      {isNearRenewal(subscription.renewal_date) && (
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                          {getDaysUntilRenewal(subscription.renewal_date)} days
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {subscription.cancel_url && (
                      <a
                        href={subscription.cancel_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Cancel
                      </a>
                    )}
                    <button
                      onClick={() => deleteSubscription(subscription.id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
