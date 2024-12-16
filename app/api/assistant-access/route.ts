import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse the incoming JSON request to get environmentId
    const { environmentId } = await request.json();

    // Fetch environment details from Supabase
    const { data: environment, error } = await supabase
      .from('environments')
      .select('*')
      .eq('id', environmentId)
      .single();

    if (error || !environment) {
      console.error("Error fetching environment:", error);
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }

    const basicAuth = btoa(`${environment.adminUser}:${environment.adminPass}`);

    // Construct the Role URL
    const roleUrl = `${process.env.ETENDO_URL}/ws/com.etendoerp.etendorx.datasource/Role?_startRow=0&_endRow=10`;
    const respRole = await fetch(roleUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      }
    });

    if (!respRole.ok) {
      const errorText = await respRole.text();
      console.error("Error fetching role:", errorText);
      return NextResponse.json({ error: "Failed to fetch role", details: errorText }, { status: respRole.status });
    }

    const role = await respRole.json();

    const assistants = process.env.COPILOT_ASSISTANTS?.split(',').map(a => a.trim()).filter(a => a);

    if (assistants && assistants.length > 0) {
      for (const assistant of assistants) {
        const body = {
          copilotApp: assistant,
          role: role.response.data[0]?.id
        };

        if (!body.role) {
          console.error(`Role ID not found for assistant: ${assistant}`);
          return NextResponse.json({ error: `Role ID not found for assistant: ${assistant}` }, { status: 400 });
        }

        console.info("Sending request to Etendo");
        console.info("URL:", `${process.env.ETENDO_URL}/ws/com.etendoerp.etendorx.datasource/AssistantAccess`);
        console.info("Body:", body);

        // Send the POST request to Etendo
        const response = await fetch(`${process.env.ETENDO_URL}/ws/com.etendoerp.etendorx.datasource/AssistantAccess`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response from Etendo:", errorText);
          return NextResponse.json({
            error: "Failed to create assistant access",
            details: errorText
          }, { status: response.status });
        }

        const responseData = await response.text();
        console.log("Response data:", responseData);
      }

      return NextResponse.json({ message: "Assistants accessed successfully" }, { status: 200 });
    } else {
      console.warn("No assistants provided in COPILOT_ASSISTANTS");
      return NextResponse.json({ error: "No assistants provided" }, { status: 400 });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}