import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

/**
 * Handles POST requests to provide assistant access.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object.
 */
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

    // Handle error if environment is not found
    if (error || !environment) {
      console.error("Error fetching environment:", error);
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }

    // Encode admin credentials for basic authentication
    const basicAuth = btoa(`${environment.adminUser}:${environment.adminPass}`);

    // Construct the Role URL
    const roleUrl = `${process.env.ETENDO_URL}/ws/com.etendoerp.etendorx.datasource/Role`;
    const respRole = await fetch(roleUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      }
    });

    // Handle error if role fetching fails
    if (!respRole.ok) {
      const errorText = await respRole.text();
      console.error("Error fetching role:", errorText);
      return NextResponse.json({ error: "Failed to fetch role", details: errorText }, { status: respRole.status });
    }

    // Parse the role response
    const roles = await respRole.json();

    // Get the list of assistants from environment variables
    const assistants = process.env.ASSISTANT_ACCESS?.split(',').map(a => a.trim()).filter(a => a);

    // Check if there are any assistants provided
    if (assistants && assistants.length > 0) {
      for (const assistant of assistants) {
        for (const role of roles.response.data) {
          const body = {
            copilotApp: assistant,
            role: role.id
          };

          // Handle error if role ID is not found
          if (!body.role) {
            console.error(`Role ID not found for assistant: ${assistant}`);
            return NextResponse.json({error: `Role ID not found for assistant: ${assistant}`}, {status: 400});
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

          // Handle error if assistant access creation fails
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response from Etendo:", errorText);
            return NextResponse.json({
              error: "Failed to create assistant access",
              details: errorText
            }, {status: response.status});
          }

          const responseData = await response.text();
          console.log("Response data:", responseData);
        }
      }

    } else {
      console.warn("No assistants provided in COPILOT_ASSISTANTS");
    }
    const webhooks = process.env.WEBHOOK_ACCESS?.split(',').map(a => a.trim()).filter(a => a);

    if (webhooks && webhooks.length > 0) {
      for (const webhook of webhooks) {
        for (const role of roles.response.data) {
          const body = {
            smfwheDefinedwebhook: webhook,
            role: role.id
          };

          if (!body.role) {
            console.error(`Role ID not found for assistant: ${webhook}`);
            return NextResponse.json({error: `Role ID not found for assistant: ${webhook}`}, {status: 400});
          }

          console.info("Sending request to Etendo");
          console.info("URL:", `${process.env.ETENDO_URL}/ws/com.etendoerp.etendorx.datasource/WebhookRoleAccess`);
          console.info("Body:", body);

          // Send the POST request to Etendo
          const response = await fetch(`${process.env.ETENDO_URL}/ws/com.etendoerp.etendorx.datasource/WebhookRoleAccess`, {
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
            }, {status: response.status});
          }

          const responseData = await response.text();
          console.log("Response data:", responseData);
        }
      }

    } else {
      // Handle case where no assistants are provided
      console.warn("No assistants provided in COPILOT_ASSISTANTS");
    }
    return NextResponse.json({ message: "Assistants accessed successfully" }, { status: 200 });
  } catch (err) {
    // Handle unexpected errors
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}