import type { APIRoute } from 'astro';
import { getDatabase } from '../../../db/database';
import { hashPassword, generateToken } from '../../../utils/auth';
import type { UserCreate, ApiResponse, AuthResponse } from '../../../types';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: UserCreate = await request.json();
    const { username, email, password } = body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Todos los campos son requeridos'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres'
        } as ApiResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await getDatabase();

    // Verificar si el usuario ya existe
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'El email o username ya está en uso'
        } as ApiResponse),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Insertar nuevo usuario
    const result = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    // Obtener el usuario creado
    const newUser = await db.get(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?',
      [result.lastID]
    );

    // Generar token
    const token = generateToken(newUser);

    const response: ApiResponse<AuthResponse> = {
      success: true,
      data: {
        user: newUser,
        token
      },
      message: 'Usuario registrado exitosamente'
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 201, 
        headers: { 
          'Content-Type': 'application/json',
          'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
        } 
      }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor'
      } as ApiResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 