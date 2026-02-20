import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const promoters = [
  { email: 'joy@stocklinksa.co.za', password: 'JoyPass123!' },
  { email: 'sam@stocklinksa.co.za', password: 'SamPass123!' },
  { email: 'promoter003@stocklinksa.co.za', password: 'Promoter003Pass!' }
]

async function createPromoters() {
  for (const promoter of promoters) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: promoter.email,
        password: promoter.password,
        email_confirm: true
      })

      if (error) {
        console.error(`Error creating ${promoter.email}:`, error.message)
      } else {
        console.log(`User created successfully:`, data)
      }
    } catch (err) {
      console.error(`Unexpected error for ${promoter.email}:`, err)
    }
  }
}

createPromoters()
