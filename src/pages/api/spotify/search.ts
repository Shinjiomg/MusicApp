import type { APIRoute } from 'astro';
import { spotifyService } from '../../../lib/spotify';
import type { ApiResponse } from '../../../types';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'track,album,artist';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('Search request:', { query, type, limit });

    if (!query) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El parámetro de búsqueda es requerido'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (limit > 50) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El límite máximo es 50'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling Spotify service with:', { query, type, limit });
    const results = await spotifyService.search(query, type, limit);
    console.log('Spotify results received:', Object.keys(results));

    const response: ApiResponse = {
      success: true,
      data: results,
      message: 'Búsqueda completada exitosamente'
    };

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error en búsqueda de Spotify:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al buscar en Spotify',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 