import type { APIRoute } from 'astro';
import { getDatabase } from '../../../db/database';
import { verifyToken } from '../../../utils/auth';
import type { ApiResponse } from '../../../types';

// Esta ruta debe ser server-rendered, no prerenderizada
export const prerender = false;

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Spotify ID del favorito es requerido'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
    
    // Verificar que el favorito pertenece al usuario usando spotify_id
    const favorite = await db.get(
      'SELECT * FROM user_favorites WHERE spotify_id = ? AND user_id = ?',
      [id, user.userId]
    );

    if (!favorite) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Favorito no encontrado'
        } as ApiResponse),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Eliminar el favorito usando spotify_id
    await db.run(
      'DELETE FROM user_favorites WHERE spotify_id = ? AND user_id = ?',
      [id, user.userId]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Favorito eliminado exitosamente'
      } as ApiResponse),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error eliminando favorito:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 