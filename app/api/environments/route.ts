import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase' // asegúrate de tener tu instancia aquí

export async function POST(request: Request) {
  const { name, industry, created_by } = await request.json()

  const { data, error } = await supabase
    .from('environments')
    .insert({ name, industry, created_by })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // data contendrá el registro recién creado
  return NextResponse.json({ environment: data[0] }, { status: 201 })
}