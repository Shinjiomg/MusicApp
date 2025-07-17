import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Debug más detallado
    const allEnvVars = Object.keys(import.meta.env);
    const spotifyVars = allEnvVars.filter(key => key.includes('SPOTIFY'));
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeEnv: import.meta.env.MODE,
      allEnvVarsCount: allEnvVars.length,
      allEnvVars: allEnvVars.slice(0, 20), // Solo las primeras 20 para no saturar
      spotifyVars: spotifyVars,
      spotifyClientId: {
        raw: import.meta.env.SPOTIFY_CLIENT_ID,
        exists: !!import.meta.env.SPOTIFY_CLIENT_ID,
        length: import.meta.env.SPOTIFY_CLIENT_ID?.length || 0,
        type: typeof import.meta.env.SPOTIFY_CLIENT_ID
      },
      spotifyClientSecret: {
        raw: import.meta.env.SPOTIFY_CLIENT_SECRET,
        exists: !!import.meta.env.SPOTIFY_CLIENT_SECRET,
        length: import.meta.env.SPOTIFY_CLIENT_SECRET?.length || 0,
        type: typeof import.meta.env.SPOTIFY_CLIENT_SECRET
      },
      // Verificar si hay variables con espacios o caracteres especiales
      envVarsWithSpaces: allEnvVars.filter(key => key.includes(' ')),
      envVarsWithUnderscore: allEnvVars.filter(key => key.includes('_'))
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: debugInfo,
        message: 'Debug completo de variables de entorno'
      }, null, 2),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );

  } catch (error) {
    console.error('Error en debug:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error en debug',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 