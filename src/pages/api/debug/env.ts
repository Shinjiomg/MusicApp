import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      SPOTIFY_CLIENT_ID: {
        exists: !!process.env.SPOTIFY_CLIENT_ID,
        length: process.env.SPOTIFY_CLIENT_ID?.length || 0,
        preview: process.env.SPOTIFY_CLIENT_ID?.substring(0, 10) + '...' || 'undefined'
      },
      SPOTIFY_CLIENT_SECRET: {
        exists: !!process.env.SPOTIFY_CLIENT_SECRET,
        length: process.env.SPOTIFY_CLIENT_SECRET?.length || 0,
        preview: process.env.SPOTIFY_CLIENT_SECRET?.substring(0, 10) + '...' || 'undefined'
      },
      JWT_SECRET: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0,
        preview: process.env.JWT_SECRET?.substring(0, 10) + '...' || 'undefined'
      },
      allEnvVars: Object.keys(process.env).filter(key => 
        key.includes('SPOTIFY') || key.includes('JWT') || key.includes('NODE')
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