export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/datos") {
      if (!env.DROPBOX_JSON_URL) {
        return new Response(
          JSON.stringify({
            error: "Falta configurar DROPBOX_JSON_URL"
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }

      try {
        const respuesta = await fetch(env.DROPBOX_JSON_URL, {
          headers: {
            "User-Agent": "Cloudflare-Worker"
          }
        });

        if (!respuesta.ok) {
          return new Response(
            JSON.stringify({
              error: `Error al leer el JSON: HTTP ${respuesta.status}`
            }),
            {
              status: respuesta.status,
              headers: {
                "Content-Type": "application/json; charset=utf-8"
              }
            }
          );
        }

        const contenido = await respuesta.text();

        return new Response(contenido, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
          }
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "No se pudo consultar el archivo JSON",
            detalle: error.message
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json; charset=utf-8"
            }
          }
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
