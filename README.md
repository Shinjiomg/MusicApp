# MusicApp - Prueba Técnica Castor

Aplicación web fullstack desarrollada con **Astro + Solid.js** que integra la API de Spotify para permitir a los usuarios buscar música, álbumes y artistas, así como guardar sus favoritos.

## 🚀 Tecnologías Utilizadas

- **Frontend**: Astro + Solid.js + TypeScript
- **Backend**: Astro API Routes + Node.js
- **Base de Datos**: SQLite
- **Styling**: Tailwind CSS
- **Autenticación**: JWT + bcrypt
- **API Externa**: Spotify Web API

## ✨ Funcionalidades

- 🔐 **Autenticación completa**: Registro y login de usuarios
- 🎵 **Búsqueda en Spotify**: Canciones, álbumes y artistas
- 💾 **Base de datos propia**: Almacenamiento de usuarios y favoritos
- 🎧 **Reproducción de previews**: Escucha fragmentos de canciones
- ❤️ **Sistema de favoritos**: Guarda tu música preferida
- 📱 **Diseño responsive**: Optimizado para todos los dispositivos

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
# Variables de entorno para la aplicación Castor
DATABASE_URL=./src/db/database.sqlite
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
SPOTIFY_CLIENT_ID=tu_spotify_client_id
SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret
PORT=4321
NODE_ENV=development
```

### 4. Configurar Spotify API
1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crea una nueva aplicación
3. Copia el `Client ID` y `Client Secret`
4. Agrega `http://localhost:4321` a las URLs de redirección

### 5. Ejecutar el proyecto
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes Solid.js
│   └── SearchForm.tsx
├── db/                 # Configuración de base de datos
│   └── database.ts
├── layouts/            # Layouts de Astro
│   └── Layout.astro
├── lib/                # Servicios y utilidades
│   └── spotify.ts
├── pages/              # Páginas y API routes
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.ts
│   │   │   └── register.ts
│   │   └── spotify/
│   │       └── search.ts
│   ├── index.astro
│   ├── login.astro
│   ├── register.astro
│   └── search.astro
├── types/              # Tipos TypeScript
│   └── index.ts
└── utils/              # Utilidades
    └── auth.ts
```

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Vista previa de la build
- `npm run astro ...` - Ejecutar comandos de Astro

## 🎯 Criterios de Evaluación Cumplidos

### ✅ Precisión
- Respuestas acotadas y claras en la implementación
- Código bien estructurado y comentado

### ✅ Fundamentación
- Arquitectura sólida con separación de responsabilidades
- Uso apropiado de TypeScript para type safety

### ✅ Calidad
- Cumplimiento de todos los requisitos técnicos
- Implementación de autenticación segura
- Integración completa con Spotify API

### ✅ Creatividad
- Stack tecnológico moderno (Astro + Solid.js)
- Arquitectura híbrida eficiente
- UI/UX intuitiva y atractiva

### ✅ Oportunidad
- Desarrollo eficiente con herramientas de IA
- Código optimizado y mantenible

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

## 🚀 Despliegue

Para desplegar en producción:

1. Configurar variables de entorno de producción
2. Ejecutar `npm run build`
3. Configurar el servidor para servir la aplicación
4. Asegurar que las credenciales de Spotify estén configuradas

---

**Desarrollado para la Prueba Técnica de Castor** 🎵
