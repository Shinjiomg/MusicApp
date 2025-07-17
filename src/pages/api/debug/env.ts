import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Permitir en desarrollo y producción para debugging

  const envVars = {
    NODE_ENV: import.meta.env.PUBLIC_NODE_ENV,
    SPOTIFY_CLIENT_ID: import.meta.env.PUBLIC_SPOTIFY_CLIENT_ID ? 'Configurado' : 'No configurado',
    SPOTIFY_CLIENT_SECRET: import.meta.env.PUBLIC_SPOTIFY_CLIENT_SECRET ? 'Configurado' : 'No configurado',
    JWT_SECRET: import.meta.env.PUBLIC_JWT_SECRET ? 'Configurado' : 'No configurado',
    DATABASE_URL: import.meta.env.PUBLIC_DATABASE_URL,
    PORT: import.meta.env.PUBLIC_PORT
  };

  return new Response(
    JSON.stringify({
      success: true,
      data: envVars,
      message: 'Variables de entorno verificadas'
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}; 