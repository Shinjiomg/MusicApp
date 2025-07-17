import type { APIRoute } from 'astro';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../../../db/database';

// Esta ruta debe ser server-rendered, no prerenderizada
export const prerender = false;

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Extraer token de las cookies
    const token = request.headers.get('cookie')?.match(/token=([^;]+)/)?.[1];
    
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No autorizado'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, import.meta.env.JWT_SECRET!) as any;
    if (!decoded) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Token inválido'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDatabase();
    
    // Obtener información del usuario
    const user = await db.get(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Usuario no encontrado'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: user,
        message: 'Usuario autenticado'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verificando autenticación:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 