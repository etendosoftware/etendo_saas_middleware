import { NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase";
import {encodeToBase64} from "next/dist/build/webpack/loaders/utils";

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

    // Obtener el token SWS
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

    if (!swsResponse.ok) {
      const errorText = await swsResponse.text();
      console.error("Error al iniciar sesión en SWS:", errorText);
      return NextResponse.json({ error: "Autenticación fallida" }, { status: swsResponse.status });
    }

    const swsTokenData = await swsResponse.json();

    const org = swsTokenData.roleList[0].orgList[1];
    console.info("Marcando org como listo para el entorno", environment.name);
    console.info("Organización", org);

    const basicAuth = btoa(`${environment.adminUser}:${environment.adminPass}`);


    const orgIsReadyUrl = `${process.env.ETENDO_URL}/saas_process/orgIsReady?inpisready=Y&strProcessing=Y&inpcascad=N&inpadOrgId=${org.id}&mode=prepare`

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

    const organizationEditionUrl = `${process.env.ETENDO_URL}/saas_process/orgIsReady?inpisready=Y&strProcessing=Y&inpcascad=N&inpadOrgId=${org.id}`

    const organizationEditionResponse = await fetch(organizationEditionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
      }
    });

    console.log("Estado de la respuesta de Organization_Edition.html:", organizationEditionResponse.status);

    if (!organizationEditionResponse.ok) {
      const errorText = await organizationEditionResponse.text();
      console.error("Error en la respuesta de Organization_Edition.html:", errorText);
      return NextResponse.json({ error: "Falló la creación de la organización en Organization_Edition", details: errorText }, { status: organizationEditionResponse.status });
    }

    const finalResponseData = await organizationEditionResponse.text();
    return new NextResponse(finalResponseData, { status: 200, headers: { 'Content-Type': 'text/html' } });

  } catch (err) {
    console.error("Error inesperado:", err);
    return NextResponse.json({ error: "Error Interno del Servidor" }, { status: 500 });
  }
}