import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Permitir en desarrollo y producción para debugging

  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID ? 'Configurado' : 'No configurado',
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET ? 'Configurado' : 'No configurado',
    JWT_SECRET: process.env.JWT_SECRET ? 'Configurado' : 'No configurado',
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT
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