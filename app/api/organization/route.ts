import {NextResponse} from 'next/server';
import {supabase} from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // Parse the incoming JSON request to get environmentId
    const {environmentId} = await request.json();

    // Fetch environment details from Supabase
    const {data: environment, error} = await supabase
      .from('environments')
      .select('*')
      .eq('id', environmentId)
      .single();

    if (error || !environment) {
      console.error("Error fetching environment:", error);
      return NextResponse.json({error: "Environment not found"}, {status: 404});
    }

    // Get SWS Token
    /**
     * curl --location 'https://erp.saas.labs.etendo.cloud/etendo/sws/login' \
     * --header 'Content-Type: application/json' \
     * --data '{
     *     "username": "admin",
     *     "password": "admin",
     *     "role": "0"
     * }'
     */
    const swsToken = await fetch(`${process.env.ETENDO_URL}/sws/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: environment.adminUser,
          password: environment.adminPass,
        })
      }
    );
    const swsTokenData = await swsToken.json();

    // Prepare the form data as per the curl request
    const formData = new FormData();
    formData.append('inpOrgUser', environment.userUser); // Static value; adjust if dynamic
    formData.append('inpNodes', '7BFA8FF057AB46CAAB2FAAED8B870E32'); // Static or dynamic based on environment
    formData.append('inpPassword', environment.userPass); // Ensure this is securely handled
    formData.append('inpConfirmPassword', environment.userPass); // Ensure this is securely handled
    formData.append('inpNodeId', '7BFA8FF057AB46CAAB2FAAED8B870E32'); // Static or dynamic
    formData.append('inpcLocationId', ''); // Empty as per curl
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
        'Referer': `${process.env.ETENDO_URL}/etendo/ad_forms/InitialOrgSetup.html?noprefs=true&hideMenu=true&Command=DEFAULT`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Authorization': `Bearer ${swsTokenData.token}`,
        // Note: When using FormData, you should NOT set the 'Content-Type' header manually.
        // The browser will set it, including the correct boundary.
      },
      body: formData
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from Etendo:", errorText);
      return NextResponse.json({error: "Failed to create organization", details: errorText}, {status: response.status});
    }

    return new NextResponse("", {status: 200, headers: {'Content-Type': 'text/html'}});

  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}