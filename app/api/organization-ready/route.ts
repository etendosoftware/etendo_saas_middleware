import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";
import {Org, Role} from "@/lib/types";

/**
 * Handles POST requests to mark an organization as ready for a given environment.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object.
 */
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

    // Handle error if environment is not found
    if (error || !environment) {
      console.error("Error fetching environment:", error);
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }

    // Obtain the SWS token
    const swsResponse = await fetch(`${process.env.ETENDO_URL}/sws/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `${environment.adminUser}`,
        password: `${environment.adminPass}`
      })
    });

    // Handle error if SWS login fails
    if (!swsResponse.ok) {
      const errorText = await swsResponse.text();
      console.error("Error logging into SWS:", errorText);
      return NextResponse.json({ error: "Authentication failed" }, { status: swsResponse.status });
    }

    // Obtain the token and cookies from the login response
    const swsTokenData : {
      token: string,
      roleList: Role[]
    } = await swsResponse.json();

    // Get the organization from the token data
    // 1. Find Admin role for the user
    let adminRole : Role | null = null;
    for(const role of swsTokenData.roleList) {
      if(role?.name.endsWith("Admin")) {
        adminRole = role;
      }
    }

    // 2. Get Org of the role
    let defaultOrg : Org | null = null;
    if(adminRole?.orgList) {
      for (const org of adminRole?.orgList) {
        if (org.id !== "0") {
          defaultOrg = org;
          break;
        }
      }
    }

    if(!adminRole || !defaultOrg) {
      return NextResponse.json({ error: "No admin role or organization found" }, { status: 500 });
    }
    const updateData = await supabase.from('environments').update({ org_id: defaultOrg?.id, admin_role_id: adminRole.id }).eq('id', environmentId);
    if(updateData.error) {
      console.error("Error updating environment:", updateData.error);
      return NextResponse.json({ error: "Failed to update environment" }, { status: 500 });
    }

    console.info("Marking org as ready for the environment", environment.name);
    console.info("Organization", defaultOrg);

    const swsResponseWithRole = await fetch(`${process.env.ETENDO_URL}/sws/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: `${environment.adminUser}`,
        password: `${environment.adminPass}`,
        role: `${adminRole}`
      })
    });
    const token = (await swsResponseWithRole.json()).token;
    const basicAuth = btoa(`${environment.adminUser}:${environment.adminPass}`);

    const orgIsReadyUrl = `${process.env.ETENDO_URL}/saas_process/orgIsReady?inpisready=Y&strProcessing=Y&inpcascad=N&inpadOrgId=${defaultOrg.id}&mode=prepare`

    const orgIsReadyResponse = await fetch(orgIsReadyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      }
    });

    if(!orgIsReadyResponse.ok) {
      const errorText = await orgIsReadyResponse.text();
      console.error("Error en la respuesta de orgIsReady:", errorText);
      return NextResponse.json({ error: "Falló la creación de la organización en orgIsReady", details: errorText }, { status: orgIsReadyResponse.status });
    }

    const organizationEditionUrl = `${process.env.ETENDO_URL}/saas_process/orgIsReady?inpisready=Y&strProcessing=Y&inpcascad=N&inpadOrgId=${defaultOrg.id}`

    const organizationEditionResponse = await fetch(organizationEditionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      }
    });

    console.log("Status of the response from Organization_Edition.html:", organizationEditionResponse.status);

    // Handle error if organization creation fails
    if (!organizationEditionResponse.ok) {
      const errorText = await organizationEditionResponse.text();
      console.error("Error in response from Organization_Edition.html:", errorText);
      return NextResponse.json({ error: "Failed to create organization in Organization_Edition", details: errorText }, { status: organizationEditionResponse.status });
    }

    // Return the final response data
    const finalResponseData = await organizationEditionResponse.text();
    return new NextResponse(finalResponseData, { status: 200, headers: { 'Content-Type': 'text/html' } });

  } catch (err) {
    // Handle unexpected errors
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}