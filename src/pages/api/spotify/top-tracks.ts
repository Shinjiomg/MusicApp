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
    
    // Usar nuevos lanzamientos y obtener las canciones de esos álbumes
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
    
    // Obtener las canciones de los álbumes más populares
    const tracks: any[] = [];
    
    // Tomar los primeros álbumes y obtener sus canciones
    const albumsToProcess = data.albums.items.slice(0, Math.min(5, data.albums.items.length));
    
    for (const album of albumsToProcess) {
      try {
        const albumTracksResponse = await fetch(
          `https://api.spotify.com/v1/albums/${album.id}/tracks?limit=2`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (albumTracksResponse.ok) {
          const albumTracksData = await albumTracksResponse.json();
          const albumTracks = albumTracksData.items.map((track: any) => ({
            ...track,
            album: {
              id: album.id,
              name: album.name,
              images: album.images,
              external_urls: album.external_urls
            }
          }));
          tracks.push(...albumTracks);
        }
      } catch (error) {
        console.warn(`Error getting tracks for album ${album.id}:`, error);
      }
    }

    const apiResponse: ApiResponse = {
      success: true,
      data: tracks.slice(0, limit),
      message: 'Canciones populares obtenidas exitosamente'
    };

    return new Response(
      JSON.stringify(apiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error obteniendo canciones populares:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener canciones populares',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 