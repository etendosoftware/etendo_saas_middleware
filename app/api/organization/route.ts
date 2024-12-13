import {NextResponse} from 'next/server';
import {supabase} from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { environmentId } = await request.json();

    const { data: environment, error } = await supabase
      .from('environments')
      .select('*')
      .eq('id', environmentId)
      .single();

    if (error || !environment) {
      console.error("Error fetching environment:", error);
      return NextResponse.json({ error: "Environment not found" }, { status: 404 });
    }

    const swsToken = await fetch(`${process.env.ETENDO_URL}/sws/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: environment.adminUser,
        password: environment.adminPass,
      }),
    });
    const swsTokenData = await swsToken.json();

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
    formData.append('inpOrgType', '1');
    formData.append('inpLevel', '');
    formData.append('inpLastFieldChanged', '');
    formData.append('inpcLocationId_R', '');
    formData.append('inpCurrency', '100');
    formData.append('inpOrganization', environment.name);
    formData.append('inpCreateAccounting', '-1');

    // Download the COA.csv file
    const coaFileResponse = await fetch('https://docs.etendo.software/latest/assets/developer-guide/etendo-classic/how-to-guides/COA.csv');

    if (!coaFileResponse.ok) {
      const errorText = await coaFileResponse.text();
      console.error("Failed to download COA.csv file:", errorText);
      return NextResponse.json({ error: "Failed to download COA file" }, { status: 500 });
    }

    const coaFileBlob = await coaFileResponse.blob();
    const coaFileName = 'COA.csv';

    // Append the file to the FormData
    formData.append('inpFile', coaFileBlob, coaFileName);

    const response = await fetch(`${process.env.ETENDO_URL}/ad_forms/InitialOrgSetup.html?stateless=true`, {
      method: 'POST',
      headers: {
        'Accept': 'text/html',
        'Referer': `${process.env.ETENDO_URL}/etendo/ad_forms/InitialOrgSetup.html?noprefs=true&hideMenu=true&Command=DEFAULT`,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Authorization': `Bearer ${swsTokenData.token}`,
      },
      body: formData,
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from Etendo:", errorText);
      return NextResponse.json({error: "Failed to create organization", details: errorText}, {status: response.status});
    }

    console.log("Response text:", await response.text());

    return new NextResponse("", {status: 200, headers: {'Content-Type': 'text/html'}});

  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}