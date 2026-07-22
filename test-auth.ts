import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vdguhclgruozlxpqxtrh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZ3VoY2xncnVvemx4cHF4dHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0ODY3OTksImV4cCI6MjEwMDA2Mjc5OX0.rz13sfqe9MLeQMsIdblw24xW_rPvFrL4LUp8sGN7gs8'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const emails = ['test@test.com', 'admin@admin.com', 'user@user.com', 'test@example.com']
  
  for (const email of emails) {
    console.log('Trying to sign in with', email)
    const res = await supabase.auth.signInWithPassword({
        email: email,
        password: 'password123'
    })
    console.log(email, 'result:', res.error ? res.error.message : 'SUCCESS')
  }
}
test()
