import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

/**
 * Handles POST requests to create an organization for a given environment.
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

    // Get SWS Token
    const swsToken = await fetch(`${process.env.ETENDO_URL}/sws/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: environment.adminUser,
        password: environment.adminPass,
      })
    });
    const swsTokenData = await swsToken.json();

    // Prepare the form data as per the curl request
    const formData = new FormData();
    formData.append('inpOrgUser', environment.userUser);
    formData.append('inpNodes', 'F117F665CEAD444080E26D6791177E0E');
    formData.append('inpPassword', environment.userPass);
    formData.append('inpConfirmPassword', environment.userPass);
    formData.append('inpNodeId', 'F117F665CEAD444080E26D6791177E0E');
    formData.append('inpcLocationId', '');
    formData.append('Command', 'OK');
    formData.append('inpTreeClass', 'org.openbravo.erpCommon.modules.ModuleReferenceDataOrgTree');
    formData.append('inpParentOrg', '0');
    formData.append('inpOrgType', '3');
    formData.append('inpLevel', '');
    formData.append('inpLastFieldChanged', '');
    formData.append('inpcLocationId_R', '');
    formData.append('inpCurrency', '');
    formData.append('inpOrganization', environment.name);

    console.info("Creating organization for environment:", environment.name);
    console.info("Form data:", JSON.stringify(Object.fromEntries(formData.entries())));
    console.info("Sending request to Etendo");
    console.info("URL:", `${process.env.ETENDO_URL}/ad_forms/InitialOrgSetup.html?stateless=true`);
    console.info("Authorization:", `Bearer ${swsTokenData.token}`);

    // Send the POST request to Etendo
    const response = await fetch(`${process.env.ETENDO_URL}/ad_forms/InitialOrgSetup.html?stateless=true`, {
      method: 'POST',
      headers: {
        'Accept': 'text/html',
        'Authorization': `Bearer ${swsTokenData.token}`,
      },
      body: formData
    });

    console.log("Response status:", response.status);

    // Handle error if organization creation fails
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from Etendo:", errorText);
      return NextResponse.json({ error: "Failed to create organization", details: errorText }, { status: response.status });
    }

    // Return success response
    return new NextResponse("", { status: 200, headers: { 'Content-Type': 'text/html' } });

  } catch (err) {
    // Handle unexpected errors
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}