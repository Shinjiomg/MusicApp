import type { APIRoute } from 'astro';
import { spotifyService } from '../../../../lib/spotify';
import type { ApiResponse } from '../../../../types';

export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID de canción requerido'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Track request:', { id });

    const track = await spotifyService.getTrack(id);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: track
      } as ApiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting track:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener información de la canción'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 