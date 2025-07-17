import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const envInfo = {
      NODE_ENV: import.meta.env.MODE,
      SPOTIFY_CLIENT_ID: {
        exists: !!import.meta.env.SPOTIFY_CLIENT_ID,
        length: import.meta.env.SPOTIFY_CLIENT_ID?.length || 0,
        preview: import.meta.env.SPOTIFY_CLIENT_ID?.substring(0, 10) + '...' || 'undefined'
      },
      SPOTIFY_CLIENT_SECRET: {
        exists: !!import.meta.env.SPOTIFY_CLIENT_SECRET,
        length: import.meta.env.SPOTIFY_CLIENT_SECRET?.length || 0,
        preview: import.meta.env.SPOTIFY_CLIENT_SECRET?.substring(0, 10) + '...' || 'undefined'
      },
      JWT_SECRET: {
        exists: !!import.meta.env.JWT_SECRET,
        length: import.meta.env.JWT_SECRET?.length || 0,
        preview: import.meta.env.JWT_SECRET?.substring(0, 10) + '...' || 'undefined'
      },
      allEnvVars: Object.keys(import.meta.env).filter(key => 
        key.includes('SPOTIFY') || key.includes('JWT') || key.includes('MODE')
      )
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: envInfo,
        message: 'Variables de entorno obtenidas'
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );

  } catch (error) {
    console.error('Error obteniendo variables de entorno:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 