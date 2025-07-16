import { createSignal } from 'solid-js';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen());

  return (
    <header class="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          {/* Logo */}
          <div class="flex items-center">
            <a href="/" class="flex items-center space-x-3 group">
              <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div>
                <span class="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                  MusicApp
                </span>
                <p class="text-xs text-gray-400 -mt-1">Tu música, tu estilo</p>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div class="hidden md:flex items-center space-x-8">
            <a 
              href="/search" 
              class="text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span>Buscar</span>
            </a>
            <a 
              href="/favorites" 
              class="text-gray-300 hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span>Favoritos</span>
            </a>
            <div class="flex items-center space-x-4">
              <a 
                href="/login" 
                class="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Iniciar Sesión
              </a>
              <a 
                href="/register" 
                class="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
              >
                Registrarse
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div class="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              class="text-gray-300 hover:text-white p-2 rounded-md transition-colors duration-200"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen() ? (
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                ) : (
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen() && (
          <div class="md:hidden border-t border-gray-800">
            <div class="px-2 pt-2 pb-3 space-y-1">
              <a 
                href="/search" 
                class="text-gray-300 hover:text-green-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                Buscar
              </a>
              <a 
                href="/favorites" 
                class="text-gray-300 hover:text-green-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
              >
                Favoritos
              </a>
              <div class="pt-4 space-y-2">
                <a 
                  href="/login" 
                  class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  Iniciar Sesión
                </a>
                <a 
                  href="/register" 
                  class="bg-gradient-to-r from-green-500 to-green-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-200"
                >
                  Registrarse
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
} 