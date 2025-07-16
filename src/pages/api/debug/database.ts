import type { APIRoute } from 'astro';
import { getDatabase } from '../../../db/database';

export const GET: APIRoute = async () => {
  try {
    const db = await getDatabase();
    
    // Obtener información de las tablas
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);
    
    // Obtener conteo de usuarios
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    
    // Obtener conteo de favoritos
    const favoriteCount = await db.get('SELECT COUNT(*) as count FROM user_favorites');
    
    // Obtener algunos usuarios de ejemplo (sin contraseñas)
    const sampleUsers = await db.all(`
      SELECT id, username, email, created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    // Obtener algunos favoritos de ejemplo
    const sampleFavorites = await db.all(`
      SELECT * FROM user_favorites 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          tables: tables.map(t => t.name),
          stats: {
            users: userCount?.count || 0,
            favorites: favoriteCount?.count || 0
          },
          sampleUsers,
          sampleFavorites
        },
        message: 'Información de la base de datos obtenida exitosamente'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error obteniendo información de la base de datos:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 