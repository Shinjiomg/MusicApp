import type { APIRoute } from 'astro';
import { getDatabase } from '../../../db/database';
import { verifyToken } from '../../../utils/auth';
import type { ApiResponse, UserFavorite } from '../../../types';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Verificar autenticación
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado'
        } as ApiResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido'
        } as ApiResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDatabase();
    
    // Obtener favoritos del usuario
    const favorites = await db.all(
      'SELECT * FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC',
      [user.userId]
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: favorites,
        message: 'Favoritos obtenidos exitosamente'
      } as ApiResponse<UserFavorite[]>),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('POST /api/favorites - Iniciando...');
    
    // Verificar autenticación
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    console.log('Token encontrado:', !!token);
    
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado'
        } as ApiResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = verifyToken(token);
    console.log('Usuario verificado:', user ? { userId: user.userId, email: user.email } : null);
    
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido'
        } as ApiResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { spotify_id, type, name, image_url, external_url } = body;
    console.log('Datos recibidos:', { spotify_id, type, name, image_url: !!image_url, external_url: !!external_url });

    // Validaciones
    if (!spotify_id || !type || !name) {
      console.log('Validación fallida: faltan campos requeridos');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'spotify_id, type y name son requeridos'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!['track', 'album', 'artist'].includes(type)) {
      console.log('Validación fallida: tipo inválido:', type);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'type debe ser track, album o artist'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDatabase();
    console.log('Base de datos conectada');
    
    // Verificar si ya existe
    const existing = await db.get(
      'SELECT id FROM user_favorites WHERE user_id = ? AND spotify_id = ?',
      [user.userId, spotify_id]
    );
    console.log('Verificación de existencia:', !!existing);

    if (existing) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ya está en tus favoritos'
        } as ApiResponse),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Agregar a favoritos
    console.log('Insertando favorito...');
    const result = await db.run(
      'INSERT INTO user_favorites (user_id, spotify_id, type, name, image_url, external_url) VALUES (?, ?, ?, ?, ?, ?)',
      [user.userId, spotify_id, type, name, image_url, external_url]
    );
    console.log('Favorito insertado, ID:', result.lastID);

    // Obtener el favorito creado
    const newFavorite = await db.get(
      'SELECT * FROM user_favorites WHERE id = ?',
      [result.lastID]
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: newFavorite,
        message: 'Agregado a favoritos exitosamente'
      } as ApiResponse<UserFavorite>),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error agregando favorito:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 