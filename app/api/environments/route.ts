import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { uuid } from "@supabase/auth-js/src/lib/helpers";

/**
 * Handles POST requests to create a new environment.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object.
 */
export async function POST(request: Request): Promise<NextResponse> {
  // Parse the incoming JSON request to get name, industry, and created_by
  const { name, industry, created_by, country: country_id, region, address, phone } = await request.json()

  const { data: exists } = await supabase
    .from('environments')
    .select('name')
    .eq('name', name)
    .neq('status', 'N');

  if (exists?.length ) {
    return NextResponse.json({ error: 'Environment already exists' }, { status: 400 })
  }

  // Generate admin and user credentials
  const adminUser = name + 'Admin'
  const adminPass = uuid().toString()
  const userUser = name + 'User'
  const userPass = uuid().toString()

  // Insert the new environment into the Supabase database
  const { data, error } = await supabase
    .from('environments')
    .insert({ name, industry, created_by, adminUser, adminPass, userUser, userPass, country_id, region, address, phone })
    .select()

  // Handle error if insertion fails
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Return the newly created environment data
  return NextResponse.json({ environment: data[0] }, { status: 201 })
}