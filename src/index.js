export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/datos") {
      if (!env.DROPBOX_JSON_URL) {
        return respuestaJson(
          { error: "Falta configurar la variable DROPBOX_JSON_URL en Cloudflare." },
          500
        );
      }

      try {
        const origen = new URL(env.DROPBOX_JSON_URL);
        origen.searchParams.set("_", Date.now().toString());

        const respuesta = await fetch(origen.toString(), {
          headers: {
            Accept: "application/json",
            "User-Agent": "Cloudflare-Dashboard-Planta/1.0"
          },
          cf: {
            cacheTtl: 0,
            cacheEverything: false
          }
        });

        if (!respuesta.ok) {
          return respuestaJson(
            { error: `No se pudo leer el JSON de origen. HTTP ${respuesta.status}` },
            502
          );
        }

        const contenido = await respuesta.text();

        try {
          JSON.parse(contenido);
        } catch {
          return respuestaJson(
            { error: "El archivo de origen no contiene un JSON válido." },
            502
          );
        }

        return new Response(contenido, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            Pragma: "no-cache",
            Expires: "0",
            "X-Content-Type-Options": "nosniff"
          }
        });
      } catch (error) {
        return respuestaJson(
          { error: "Error al consultar el archivo JSON.", detalle: String(error?.message || error) },
          502
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};

function respuestaJson(contenido, estado) {
  return new Response(JSON.stringify(contenido), {
    status: estado,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
