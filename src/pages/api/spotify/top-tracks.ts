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
    
    // Obtener nuevos lanzamientos
    const response = await fetch(
      `https://api.spotify.com/v1/browse/new-releases?limit=${Math.min(limit, 10)}`,
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
    
    // Obtener las canciones más populares de los álbumes
    const tracks: any[] = [];
    
    for (const album of data.albums.items) {
      try {
        // Obtener las canciones del álbum
        const albumTracksResponse = await fetch(
          `https://api.spotify.com/v1/albums/${album.id}/tracks?limit=5`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (albumTracksResponse.ok) {
          const albumTracksData = await albumTracksResponse.json();
          
          // Obtener información detallada de las canciones (incluyendo popularidad)
          const trackIds = albumTracksData.items.slice(0, 2).map((track: any) => track.id).join(',');
          
          if (trackIds) {
            const tracksDetailResponse = await fetch(
              `https://api.spotify.com/v1/tracks?ids=${trackIds}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (tracksDetailResponse.ok) {
              const tracksDetailData = await tracksDetailResponse.json();
              tracks.push(...tracksDetailData.tracks);
            }
          }
        }
      } catch (error) {
        console.warn(`Error getting tracks for album ${album.id}:`, error);
      }
    }

    // Ordenar por popularidad y tomar el límite solicitado
    const sortedTracks = tracks
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit);

    // Si no hay tracks disponibles, intentar obtener tracks populares directamente
    if (sortedTracks.length === 0) {
      console.log('No se encontraron tracks de álbumes nuevos, intentando obtener tracks populares...');
      
      try {
        // Intentar obtener tracks populares de diferentes países
        const countries = ['US', 'GB', 'ES', 'MX', 'AR'];
        
        for (const country of countries) {
          const popularTracksResponse = await fetch(
            `https://api.spotify.com/v1/browse/featured-playlists?country=${country}&limit=1`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          
          if (popularTracksResponse.ok) {
            const playlistsData = await popularTracksResponse.json();
            
            if (playlistsData.playlists?.items?.length > 0) {
              const playlist = playlistsData.playlists.items[0];
              
              // Obtener tracks de la playlist
              const playlistTracksResponse = await fetch(
                `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=${Math.min(limit, 10)}`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              if (playlistTracksResponse.ok) {
                const playlistTracksData = await playlistTracksResponse.json();
                const playlistTracks = playlistTracksData.items
                  .map((item: any) => item.track)
                  .filter((track: any) => track && track.id);
                
                if (playlistTracks.length > 0) {
                  sortedTracks.push(...playlistTracks);
                  break;
                }
              }
            }
          }
        }
      } catch (fallbackError) {
        console.warn('Error en fallback de tracks populares:', fallbackError);
      }
    }

    const apiResponse: ApiResponse = {
      success: true,
      data: sortedTracks,
      message: sortedTracks.length > 0 
        ? 'Canciones populares obtenidas exitosamente' 
        : 'La API de Spotify no está trayendo canciones populares en este momento'
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