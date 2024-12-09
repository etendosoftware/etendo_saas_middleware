import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
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

    // Get from   'http://localhost:8080/etendo/sws/com.etendoerp.etendorx.datasource/Role?q=name==testUser&_startRow=0&_endRow=10' \
    const respRole = await fetch(`${process.env.ETENDO_URL}/ws/com.etendoerp.etendorx.datasource/Role?q=name==${environment.userUser}&_startRow=0&_endRow=10`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      }
    });
    const role = await respRole.json();

    const assistants = process.env.COPILOT_ASSISTANTS?.split(',');
    if(assistants) {
      for(const assistant of assistants) {
        const body = {
          copilotApp: assistant,
          role: role.response.data[0].id
        }
        console.info("Sending request to Etendo");
        console.info("URL:", `${process.env.ETENDO_URL}/sws/com.etendoerp.etendorx.datasource/AssistantAcces`);
        console.info("Body:", body);
        // Send the POST request to Etendo
        const response = await fetch(`${process.env.ETENDO_URL}/ws/com.etendoerp.etendorx.datasource/AssistantAccess`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
          },
          body: JSON.stringify(body)
        });
        console.log("Response status:", response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response from Etendo:", errorText);
          return NextResponse.json({
            error: "Failed to create organization",
            details: errorText
          }, {status: response.status});
        }
        const responseData = await response.text();
        console.log("Response data:", responseData);
      }
      return new NextResponse("{}", {status: 200, headers: {'Content-Type': 'application/json'}});
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}