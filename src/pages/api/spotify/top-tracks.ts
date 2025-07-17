import type { APIRoute } from 'astro';
import { spotifyService } from '../../../lib/spotify';
import type { ApiResponse } from '../../../types';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('Top tracks request:', { limit });

    if (limit > 50) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El límite máximo es 50'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = await spotifyService.getAccessToken();
    
    // Usar nuevos lanzamientos directamente
    const response = await fetch(
      `https://api.spotify.com/v1/browse/new-releases?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Spotify API Error:', errorData);
      throw new Error(`Failed to get new releases: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Convertir álbumes a formato de tracks
    const tracks = data.albums.items.map((album: any) => ({
      id: album.id,
      name: album.name,
      artists: album.artists,
      album: {
        id: album.id,
        name: album.name,
        images: album.images,
        external_urls: album.external_urls
      },
      external_urls: album.external_urls,
      // Valores por defecto ya que no tenemos info de track específica
      duration_ms: 0,
      popularity: 50
    }));

    const apiResponse: ApiResponse = {
      success: true,
      data: tracks,
      message: 'Nuevos lanzamientos obtenidos exitosamente'
    };

    return new Response(
      JSON.stringify(apiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error obteniendo nuevos lanzamientos:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener nuevos lanzamientos',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 