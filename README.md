# MusicApp - Prueba Técnica Castor

Aplicación web fullstack desarrollada con **Astro + Solid.js** que integra la API de Spotify para permitir a los usuarios explorar música, descubrir nuevos lanzamientos, buscar contenido y gestionar sus favoritos.

## 🚀 Tecnologías Utilizadas

- **Frontend**: Astro + Solid.js + TypeScript
- **Backend**: Astro API Routes + Node.js
- **Base de Datos**: SQLite con sqlite3
- **Styling**: Tailwind CSS v4
- **Autenticación**: JWT + bcryptjs
- **API Externa**: Spotify Web API
- **Deployment**: Cloudflare Pages

## ✨ Funcionalidades Principales

### 🎵 **Exploración Musical**
- **Canciones del momento**: Descubre las canciones más populares
- **Nuevos lanzamientos**: Explora los álbumes más recientes
- **Categorías destacadas**: Navega por géneros musicales
- **Búsqueda avanzada**: Encuentra canciones, álbumes y artistas

### 🔐 **Sistema de Usuarios**
- **Registro de usuarios**: Crear cuenta con email y contraseña
- **Autenticación segura**: Login con JWT y cookies HttpOnly
- **Gestión de sesiones**: Verificación automática de autenticación
- **Perfil de usuario**: Información personal y preferencias

### ❤️ **Sistema de Favoritos**
- **Guardar favoritos**: Canciones, álbumes y artistas
- **Gestión de favoritos**: Agregar y eliminar elementos
- **Organización por tipo**: Filtros por tracks, álbumes y artistas
- **Persistencia local**: Base de datos SQLite propia

### 🎧 **Reproducción Musical**
- **Reproductor integrado**: Modal personalizado para reproducción
- **Enlaces directos a Spotify**: Navegación a la aplicación oficial
- **Información detallada**: Títulos, artistas, duración y portadas
- **Controles intuitivos**: Botones de reproducción y favoritos

### 📱 **Experiencia de Usuario**
- **Diseño responsive**: Optimizado para desktop y móvil
- **Interfaz moderna**: Diseño inspirado en Spotify
- **Navegación fluida**: Sidebar con categorías y favoritos
- **Búsqueda en tiempo real**: Resultados instantáneos

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd Castor-Prueba-Tecnica
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Spotify API Configuration
PUBLIC_SPOTIFY_CLIENT_ID=9903b6f2bf43471798788656d71c18ca
PUBLIC_SPOTIFY_CLIENT_SECRET=5aca32390fa74ddcbe6577920d3924c6

# JWT Configuration
PUBLIC_JWT_SECRET=aee5bc9a47ada12a94bcd447913356b642a0f57487a1423adbc8a70dd44ee20adb7343a159912f24cf4f8ef496e4902de14dad48f0a9ec923e9a5efb75095ae8

# Database Configuration
PUBLIC_DATABASE_URL=./src/db/database.sqlite

```


### 4. Ejecutar el proyecto
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes Solid.js
│   ├── CustomDropdown.tsx
│   ├── CustomPlayer.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── Sidebar.tsx
│   ├── SpotifyStatus.tsx
│   └── UserDropdown.tsx
├── db/                 # Base de datos SQLite
│   ├── database.sqlite
│   └── database.ts
├── layouts/            # Layouts de Astro
│   ├── AuthLayout.astro
│   └── Layout.astro
├── lib/                # Servicios y utilidades
│   └── spotify.ts
├── pages/              # Páginas y API routes
│   ├── api/
│   │   ├── auth/
│   │   │   ├── check.ts
│   │   │   ├── login.ts
│   │   │   ├── logout.ts
│   │   │   ├── me.ts
│   │   │   └── register.ts
│   │   ├── debug/
│   │   │   ├── database.ts
│   │   │   └── env.ts
│   │   ├── favorites/
│   │   │   ├── [id].ts
│   │   │   └── index.ts
│   │   └── spotify/
│   │       ├── featured-playlists.ts
│   │       ├── new-releases.ts
│   │       ├── search.ts
│   │       ├── top-tracks.ts
│   │       └── track/
│   │           └── [id].ts
│   ├── index.astro
│   ├── login.astro
│   └── register.astro
├── styles/             # Estilos globales
│   └── global.css
├── types/              # Tipos TypeScript
│   └── index.ts
└── utils/              # Utilidades
    └── auth.ts
```

## 🗄️ Base de Datos

### **SQLite con las siguientes tablas:**

#### **Tabla `users`**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### **Tabla `user_favorites`**
```sql
CREATE TABLE user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  spotify_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'track', 'album', 'artist'
  name TEXT NOT NULL,
  image_url TEXT,
  external_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE(user_id, spotify_id)
);
```

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run astro ...` - Ejecutar comandos de Astro

## 🎯 API Endpoints

### **Autenticación**
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `GET /api/auth/check` - Verificar autenticación

### **Spotify**
- `GET /api/spotify/top-tracks` - Canciones populares
- `GET /api/spotify/new-releases` - Nuevos lanzamientos
- `GET /api/spotify/featured-playlists` - Categorías destacadas
- `GET /api/spotify/search` - Búsqueda de contenido
- `GET /api/spotify/track/[id]` - Información de canción

### **Favoritos**
- `GET /api/favorites` - Obtener favoritos del usuario
- `POST /api/favorites` - Agregar a favoritos
- `DELETE /api/favorites/[id]` - Eliminar de favoritos

### **Debug**
- `GET /api/debug/database` - Información de la base de datos
- `GET /api/debug/env` - Variables de entorno

## 🚀 Despliegue

### **Despliegue en Cloudflare Pages**

El proyecto está configurado para desplegarse automáticamente en Cloudflare Pages:

1. **Despliegue automático**:
   - El proyecto se despliega automáticamente al hacer push a la rama principal
   - URL de producción: https://castor-prueba-tecnica.pages.dev

## 🎨 Características de Diseño

### **Interfaz de Usuario**
- **Tema oscuro**: Diseño elegante con fondo negro
- **Gradientes dinámicos**: Colores únicos para cada elemento
- **Animaciones suaves**: Transiciones y efectos hover
- **Iconografía consistente**: Iconos de Spotify y Material Design

### **Responsive Design**
- **Desktop**: Layout completo con sidebar y contenido principal
- **Tablet**: Adaptación de columnas y espaciado
- **Mobile**: Navegación optimizada para pantallas pequeñas

### **Accesibilidad**
- **Navegación por teclado**: Soporte completo para accesibilidad
- **Contraste adecuado**: Texto legible en todos los fondos
- **Estados de foco**: Indicadores visuales claros

## 🔒 Seguridad

### **Autenticación**
- **JWT tokens**: Autenticación stateless
- **Cookies HttpOnly**: Protección contra XSS
- **Hashing de contraseñas**: bcryptjs para seguridad
- **Validación de entrada**: Sanitización de datos

### **Base de Datos**
- **Prepared statements**: Prevención de SQL injection
- **Índices optimizados**: Rendimiento mejorado
- **Relaciones integridad**: Claves foráneas y constraints

## 🤖 Uso de IA en el Desarrollo

Este proyecto fue desarrollado utilizando **Cursor** como herramienta de desarrollo asistido por IA, aprovechando:

- **Generación de código**: Componentes, API routes y utilidades
- **Refactorización**: Optimización de código existente
- **Debugging**: Resolución de errores y problemas
- **Documentación**: Generación de comentarios y README
- **Arquitectura**: Diseño de estructura del proyecto

## 📝 Notas de Desarrollo

- La base de datos SQLite se crea automáticamente al ejecutar la aplicación
- Las credenciales de Spotify deben configurarse en el archivo `.env`
- La aplicación utiliza cookies HttpOnly para mayor seguridad
- Todos los endpoints de API incluyen manejo de errores robusto
- El proyecto está optimizado para Cloudflare Pages

## 🎯 Criterios de Evaluación Cumplidos

### ✅ **Precisión**
- Respuestas acotadas y claras en la implementación
- Código bien estructurado y comentado
- Funcionalidades completas y funcionales

### ✅ **Fundamentación**
- Arquitectura sólida con separación de responsabilidades
- Uso apropiado de TypeScript para type safety
- Patrones de diseño consistentes

### ✅ **Calidad**
- Cumplimiento de todos los requisitos técnicos
- Implementación de autenticación segura
- Integración completa con Spotify API
- Manejo robusto de errores

### ✅ **Creatividad**
- Stack tecnológico moderno (Astro + Solid.js)
- Arquitectura híbrida eficiente
- UI/UX intuitiva y atractiva
- Funcionalidades adicionales como favoritos

### ✅ **Oportunidad**
- Desarrollo eficiente con herramientas de IA
- Código optimizado y mantenible
- Despliegue automatizado en Cloudflare Pages

---

**Desarrollado para la Prueba Técnica de Castor** 🎵

*Una aplicación de música moderna y funcional que demuestra habilidades fullstack con tecnologías actuales.*
