import type { APIRoute } from 'astro';
import { getDatabase } from '../../../db/database';
import { comparePassword, generateToken } from '../../../utils/auth';
import type { UserLogin, ApiResponse, AuthResponse } from '../../../types';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: UserLogin = await request.json();
    const { email, password } = body;

    // Validaciones básicas
    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email y contraseña son requeridos'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDatabase();

    // Buscar usuario por email
    const user = await db.get(
      'SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciales inválidas'
        } as ApiResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Credenciales inválidas'
        } as ApiResponse),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Remover password_hash del objeto user
    const { password_hash, ...userWithoutPassword } = user;

    // Generar token
    const token = generateToken(userWithoutPassword);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login exitoso'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
        } 
      }
    );

  } catch (error) {
    console.error('Error en login:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 