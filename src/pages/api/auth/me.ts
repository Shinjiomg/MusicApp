import type { APIRoute } from 'astro';
import { getDatabase } from '../../../db/database';
import { verifyToken } from '../../../utils/auth';
import type { ApiResponse, User } from '../../../types';

// Esta ruta debe ser server-rendered, no prerenderizada
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // Extraer token de las cookies
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

    // Verificar token
    const payload = verifyToken(token);
    if (!payload) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido'
        } as ApiResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDatabase();
    
    // Obtener información del usuario
    const user = await db.get(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
      [payload.userId]
    );

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuario no encontrado'
        } as ApiResponse),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: user as User,
        message: 'Usuario obtenido exitosamente'
      } as ApiResponse<User>),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 