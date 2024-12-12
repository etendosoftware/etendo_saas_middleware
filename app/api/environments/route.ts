import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import {uuid} from "@supabase/auth-js/src/lib/helpers"; // asegúrate de tener tu instancia aquí

export async function POST(request: Request) {
  const { name, industry, created_by } = await request.json()

  const adminUser = name + 'Admin'
  const adminPass = uuid().toString()
  const userUser = name + 'User'
  const userPass = uuid().toString()

  const { data, error } = await supabase
    .from('environments')
    .insert({ name, industry, created_by, adminUser, adminPass, userUser, userPass })
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // data contendrá el registro recién creado
  return NextResponse.json({ environment: data[0] }, { status: 201 })
}