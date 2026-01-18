import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

    // Get subscriptions that renew in 1, 2, or 3 days
    const today = new Date()
    const reminderDays = [3, 2, 1]
    const subscriptionsToRemind = []

    for (const days of reminderDays) {
      const targetDate = new Date(today)
      targetDate.setDate(today.getDate() + days)
      const targetDateStr = targetDate.toISOString().split('T')[0]

      console.log(`Checking for subscriptions renewing on: ${targetDateStr} (${days} days from now)`)

      // Get subscriptions with user emails
      const { data: subscriptions, error } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('renewal_date', targetDateStr)

      if (error) throw error

      // Get user emails for each subscription
      for (const subscription of subscriptions || []) {
        const { data: userData } = await supabaseClient.auth.admin.getUserById(subscription.user_id)
        subscriptionsToRemind.push({
          ...subscription,
          days_until_renewal: days,
          user: userData.user
        })
      }
    }

    console.log(`Found ${subscriptionsToRemind.length || 0} subscriptions needing reminders`)
    console.log(`Subscriptions:`, JSON.stringify(subscriptionsToRemind, null, 2))

    // Send email reminders for each subscription
    for (const subscription of subscriptionsToRemind) {
      const userEmail = subscription.user?.email
      if (!userEmail) {
        console.log(`No email found for subscription ${subscription.id}`)
        continue
      }

      try {
        console.log(`Attempting to send email to ${userEmail} for subscription ${subscription.name}`)
        
        // Send email using Resend client
        const { data, error } = await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [userEmail],
          subject: `${subscription.name} renews in ${subscription.days_until_renewal} day${subscription.days_until_renewal === 1 ? '' : 's'}`,
          html: `
            <p>Hey ${subscription.user?.user_metadata?.full_name || subscription.user?.email?.split('@')[0] || 'there'},</p>
            
            <p>Quick heads-up — your <strong>${subscription.name}</strong> subscription renews in <strong>${subscription.days_until_renewal} day${subscription.days_until_renewal === 1 ? '' : 's'}</strong>.</p>
            
            <p><strong>Details</strong><br>
            • Price: <strong>$${subscription.price} / ${subscription.billing_cycle}</strong><br>
            • Renewal date: <strong>${new Date(subscription.renewal_date).toLocaleDateString()}</strong></p>
            
            <p>If you still use it, you're good.<br>
            If not, you can cancel here before the charge hits:</p>
            
            <p>👉 <strong><a href="${subscription.cancel_url}" style="color: #dc2626; text-decoration: none;">Cancel subscription</a></strong></p>
            
            <p>Your current monthly total across all subscriptions is <strong>$${subscription.price}</strong>.</p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p><em>SubWatch exists for one reason: no surprise charges.</em></p>
            
            <p>— SubWatch<br>
            <small>Track subscriptions. Keep your money.</small></p>
          `,
        })

        if (error) {
          console.error(`Failed to send email to ${userEmail}:`, error)
        } else {
          console.log(`Reminder sent to ${userEmail} for ${subscription.name} - ID: ${data?.id}`)
        }
      } catch (emailError) {
        console.error(`Error sending email to ${userEmail}:`, emailError)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Reminders processed successfully',
        count: subscriptionsToRemind.length || 0 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error: any) {
    console.error('Error in send-reminders function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
