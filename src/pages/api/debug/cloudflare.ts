import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  try {
    // Debug específico para Cloudflare
    const debugInfo = {
      timestamp: new Date().toISOString(),
      platform: typeof globalThis !== 'undefined' ? 'Cloudflare' : 'Node.js',
      nodeEnv: import.meta.env.MODE,
      
      // Variables de import.meta.env
      importMetaEnv: {
        allKeys: Object.keys(import.meta.env),
        spotifyKeys: Object.keys(import.meta.env).filter(key => key.includes('SPOTIFY')),
        spotifyClientId: {
          exists: !!import.meta.env.SPOTIFY_CLIENT_ID,
          length: import.meta.env.SPOTIFY_CLIENT_ID?.length || 0,
          preview: import.meta.env.SPOTIFY_CLIENT_ID?.substring(0, 10) + '...' || 'undefined'
        },
        spotifyClientSecret: {
          exists: !!import.meta.env.SPOTIFY_CLIENT_SECRET,
          length: import.meta.env.SPOTIFY_CLIENT_SECRET?.length || 0,
          preview: import.meta.env.SPOTIFY_CLIENT_SECRET?.substring(0, 10) + '...' || 'undefined'
        }
      },
      
      // Variables de globalThis (Cloudflare)
      globalThis: {
        available: typeof globalThis !== 'undefined',
        keys: typeof globalThis !== 'undefined' ? Object.keys(globalThis as any).filter(key => key.includes('SPOTIFY')) : [],
        spotifyClientId: typeof globalThis !== 'undefined' ? {
          exists: !!(globalThis as any).SPOTIFY_CLIENT_ID,
          length: (globalThis as any).SPOTIFY_CLIENT_ID?.length || 0
        } : null,
        spotifyClientSecret: typeof globalThis !== 'undefined' ? {
          exists: !!(globalThis as any).SPOTIFY_CLIENT_SECRET,
          length: (globalThis as any).SPOTIFY_CLIENT_SECRET?.length || 0
        } : null
      },
      
      // Variables de globalThis.env (Cloudflare)
      globalThisEnv: {
        available: typeof globalThis !== 'undefined' && !!(globalThis as any).env,
        keys: typeof globalThis !== 'undefined' && (globalThis as any).env ? 
          Object.keys((globalThis as any).env).filter(key => key.includes('SPOTIFY')) : [],
        spotifyClientId: typeof globalThis !== 'undefined' && (globalThis as any).env ? {
          exists: !!(globalThis as any).env.SPOTIFY_CLIENT_ID,
          length: (globalThis as any).env.SPOTIFY_CLIENT_ID?.length || 0
        } : null,
        spotifyClientSecret: typeof globalThis !== 'undefined' && (globalThis as any).env ? {
          exists: !!(globalThis as any).env.SPOTIFY_CLIENT_SECRET,
          length: (globalThis as any).env.SPOTIFY_CLIENT_SECRET?.length || 0
        } : null
      }
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: debugInfo,
        message: 'Debug específico para Cloudflare'
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
    console.error('Error en debug de Cloudflare:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error en debug de Cloudflare',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 