import type { APIRoute } from 'astro';
import { spotifyService } from '../../../lib/spotify';
import type { ApiResponse } from '../../../types';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') as 'track' | 'album' | 'artist' || 'track';
    const limit = parseInt(searchParams.get('limit') || '20');

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

    const results = await spotifyService.search(query, type, limit);

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
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al buscar en Spotify'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 