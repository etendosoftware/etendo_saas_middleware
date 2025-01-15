import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";

/**
 * Handles POST requests to create a client for a given environment.
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} - The response object.
 */
export async function POST(request: Request) {
  // Parse the incoming JSON request to get environmentId
  const { environmentId } = await request.json();

  // Fetch environment details from Supabase
  const { data: environment } = await supabase.from('environments')
    .select()
    .eq('id', environmentId)
    .single();

  // Prepare the form data for the client creation request
  const formData = new FormData();
  formData.append('inpClientUser', environment.adminUser);
  formData.append('inpNodes', '0');
  formData.append('inpPassword', environment.adminPass);
  formData.append('inpConfirmPassword', environment.adminPass);
  formData.append('inpFile', '');
  formData.append('inpNodeId', '0');
  formData.append('Command', 'OK');
  formData.append('inpTreeClass', 'org.openbravo.erpCommon.modules.ModuleReferenceDataClientTree');
  formData.append('inpClient', environment.name);
  formData.append('inpLevel', '');
  formData.append('inpLastFieldChanged', '');
  formData.append('inpCurrency', '102');

  // Log the form data and request details
  console.info("Creating client for environment: " + environment.name);
  console.info("Form data: " + JSON.stringify(Object.fromEntries(formData.entries())));
  console.info("Sending request to Etendo");
  console.info("URL: " + process.env.ETENDO_URL + '/ad_forms/InitialClientSetup.html?stateless=true');
  console.info("Authorization: Bearer " + process.env.ETENDO_TOKEN);

  // Send the POST request to create the client
  const response = await fetch(process.env.ETENDO_URL + '/ad_forms/InitialClientSetup.html?stateless=true', {
    method: 'POST',
    headers: {
      'Accept': 'text/html',
      'Referer': process.env.ETENDO_URL + '/ad_forms/InitialClientSetup.html?noprefs=true&hideMenu=true&Command=DEFAULT',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Authorization': 'Bearer ' + process.env.ETENDO_TOKEN,
    },
    body: formData
  });

  // Log the response status
  console.log("Response status: " + response.status);

  // Handle error if client creation fails
  if (!response.ok) {
    const text = await response.text();
    return new NextResponse(text, { status: response.status });
  }

  // Return the response data
  const data = await response.text();
  return new NextResponse(data, { status: 200 });
}