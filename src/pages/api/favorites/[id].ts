import type { APIRoute } from 'astro';
import { getDatabase } from '../../../db/database';
import { verifyToken } from '../../../utils/auth';
import type { ApiResponse } from '../../../types';

export const DELETE: APIRoute = async ({ request, params }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'ID del favorito es requerido'
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
    
    // Verificar que el favorito pertenece al usuario
    const favorite = await db.get(
      'SELECT * FROM user_favorites WHERE id = ? AND user_id = ?',
      [id, user.id]
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

    // Eliminar el favorito
    await db.run(
      'DELETE FROM user_favorites WHERE id = ? AND user_id = ?',
      [id, user.id]
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