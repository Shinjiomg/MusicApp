import type { APIRoute } from 'astro';
import { spotifyService } from '../../../lib/spotify';
import type { ApiResponse } from '../../../types';

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('Featured playlists request:', { limit });

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
    
    // Usar categorías de Spotify en lugar de playlists destacadas
    const response = await fetch(
      `https://api.spotify.com/v1/browse/categories?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Spotify API Error:', errorData);
      throw new Error(`Failed to get categories: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Convertir categorías a formato de playlist para mantener compatibilidad
    const playlists = data.categories.items.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description || `Explora ${category.name}`,
      images: category.icons || [],
      external_urls: category.external_urls,
      type: 'category'
    }));

    const apiResponse: ApiResponse = {
      success: true,
      data: {
        items: playlists
      },
      message: 'Categorías obtenidas exitosamente'
    };

    return new Response(
      JSON.stringify(apiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al obtener categorías',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 