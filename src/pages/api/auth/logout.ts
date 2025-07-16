import type { APIRoute } from 'astro';
import type { ApiResponse } from '../../../types';

export const POST: APIRoute = async () => {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sesión cerrada exitosamente'
      } as ApiResponse),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
        } 
      }
    );

  } catch (error) {
    console.error('Error en logout:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 