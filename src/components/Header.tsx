import { createSignal, createEffect, Show } from 'solid-js';
import UserDropdown from './UserDropdown';
import Sidebar from './Sidebar';
import type { SpotifySearchResponse } from '../types';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [user, setUser] = createSignal<any>(null);
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [showMobileMenu, setShowMobileMenu] = createSignal(false);
  const [showSidebar, setShowSidebar] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [searchType, setSearchType] = createSignal<'all' | 'tracks' | 'albums' | 'artists'>('all');
  const [searchResults, setSearchResults] = createSignal<SpotifySearchResponse | null>(null);
  const [isSearching, setIsSearching] = createSignal(false);
  const [searchTimeout, setSearchTimeout] = createSignal<NodeJS.Timeout | null>(null);

  // Escuchar eventos del sidebar para sincronizar el estado
  createEffect(() => {
    const handleSidebarToggle = (event: CustomEvent) => {
      setShowSidebar(event.detail.isOpen);
    };

    window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
    };
  });

  // Emitir evento para controlar el sidebar
  createEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarToggle', { 
      detail: { isOpen: showSidebar() } 
    }));
  });

  createEffect(() => {
    checkAuthStatus();
  });

  createEffect(() => {
    console.log('User state changed:', { isLoggedIn: isLoggedIn(), user: user() });
  });

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        console.log('Auth check response:', data);
        if (data.success && data.data) {
          setIsLoggedIn(true);
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUser(null);
      setShowDropdown(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSearch = async (e?: Event) => {
    if (e) e.preventDefault();
    
    if (!searchQuery().trim()) {
      setSearchResults(null);
      return;
    }

    // Mapear los tipos a los que espera la API de Spotify
    const typeMapping: Record<string, string> = {
      'all': 'track,album,artist',
      'tracks': 'track',
      'albums': 'album', 
      'artists': 'artist'
    };
    
    const currentType = typeMapping[searchType()] || 'track,album,artist';
    console.log('Searching with type:', currentType, 'for query:', searchQuery());

    setIsSearching(true);
    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery())}&type=${currentType}&limit=20`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data);
          // Emitir evento para que la página principal muestre los resultados
          window.dispatchEvent(new CustomEvent('searchResults', { detail: data.data }));
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (filterType: 'all' | 'tracks' | 'albums' | 'artists') => {
    console.log('Filter changed to:', filterType);
    setSearchType(filterType);
    
    // Si hay una búsqueda activa, ejecutar automáticamente con el nuevo filtro
    if (searchQuery().trim()) {
      console.log('Executing search with filter:', filterType, 'and query:', searchQuery());
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    window.dispatchEvent(new CustomEvent('clearSearch'));
  };

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const focusSearch = () => {
    // Enfocar la barra de búsqueda
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  // Configurar items del dropdown
  const dropdownItems = [
    {
      label: 'Mi Perfil',
      href: '/profile',
      icon: 'profile',
      type: 'link' as const
    },
    {
      label: 'Configuración',
      href: '/settings',
      icon: 'settings',
      type: 'link' as const
    },
    {
      type: 'divider' as const
    },
    {
      label: 'Cerrar Sesión',
      icon: 'logout',
      action: handleLogout,
      type: 'button' as const
    }
  ];

  return (
    <header class="bg-black/95 backdrop-blur-sm border-b border-gray-800 fixed top-0 left-0 right-0 z-50 h-16">
      <div class="w-full h-full px-3 sm:px-4 md:px-6">
        <div class="flex items-center justify-between h-full">
          {/* Logo y navegación izquierda */}
          <div class="flex items-center space-x-2 sm:space-x-4 md:space-x-8">
                        <div class="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
              {/* Botón de hamburguesa para mobile - Solo para abrir sidebar */}
              <button 
                onClick={() => setShowSidebar(!showSidebar())}
                class={`md:hidden transition-colors cursor-pointer p-1 relative ${
                  showSidebar() 
                    ? 'text-green-400' 
                    : 'text-white hover:text-green-400'
                }`}
                title="Tu Biblioteca"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
                {/* Indicador de favoritos */}
                <Show when={isLoggedIn() && user()}>
                  <div class="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-black"></div>
                </Show>
              </button>
               
                <button 
                onClick={() => navigate('/')}
                class="text-white hover:text-green-400 transition-colors cursor-pointer"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </button>
              
              {/* Navegación - Ocultar en mobile */}
              <nav class="hidden md:flex items-center space-x-6">
                <button 
                  onClick={() => navigate('/')}
                  class="text-white hover:text-green-400 transition-colors font-medium text-sm cursor-pointer"
                >
                  Inicio
                </button>
              </nav>
            </div>
          </div>

          {/* Barra de búsqueda central - Responsive */}
          <div class="flex-1 max-w-xs sm:max-w-md md:max-w-2xl mx-2 md:mx-4 lg:mx-8">
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-2 md:pl-3 flex items-center pointer-events-none">
                  <svg class="w-3 h-3 md:w-4 md:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery()}
                  onInput={(e) => {
                    const query = e.currentTarget.value;
                    setSearchQuery(query);
                    
                    // Limpiar timeout anterior si existe
                    if (searchTimeout()) {
                      clearTimeout(searchTimeout()!);
                    }
                    
                    // Búsqueda en tiempo real con debounce
                    if (query.trim()) {
                      const timeout = setTimeout(() => {
                        handleSearch();
                      }, 300); // 300ms de delay
                      setSearchTimeout(timeout);
                    } else {
                      clearSearch();
                    }
                  }}
                  placeholder="Buscar..."
                  class="w-full pl-7 md:pl-10 pr-4 py-1.5 md:py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 hover:border-gray-600/50 text-xs md:text-sm"
                />
                <div class="absolute inset-y-0 right-0 pr-1 md:pr-2 flex items-center">
                  {searchQuery() && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      class="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

          {/* Navegación derecha */}
          <div class="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <Show when={!isLoggedIn()} fallback={
              <div class="relative">
                <button
                  onClick={() => {
                    setShowDropdown(!showDropdown());
                    setShowMobileMenu(false); // Cerrar menú móvil si está abierto
                  }}
                  class="hidden md:flex items-center space-x-1 md:space-x-2 bg-gray-800 hover:bg-gray-700 rounded-full px-2 md:px-3 py-1 md:py-1.5 transition-colors cursor-pointer"
                >
                  <div class="w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-xs">
                      {user()?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span class="text-white font-medium text-xs md:text-sm hidden sm:block">{user()?.username || 'Usuario'}</span>
                  <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                {/* Mostrar solo avatar en mobile */}
                <button
                  onClick={() => {
                    setShowMobileMenu(!showMobileMenu());
                    setShowDropdown(false); // Cerrar dropdown si está abierto
                  }}
                  class="md:hidden flex items-center bg-gray-800 hover:bg-gray-700 rounded-full p-1 transition-colors cursor-pointer"
                >
                  <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-xs">
                      {user()?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
                
                <Show when={showDropdown() && user()}>
                  <UserDropdown 
                    user={user()} 
                    items={dropdownItems}
                    isOpen={showDropdown()}
                    onToggle={() => setShowDropdown(!showDropdown())}
                  />
                </Show>
              </div>
            }>
              {/* Botones de auth optimizados para mobile */}
              <div class="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  class="text-white hover:text-green-400 transition-colors font-medium text-xs sm:text-sm cursor-pointer px-1 sm:px-2 py-1 rounded-md hover:bg-white/10"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => navigate('/register')}
                  class="bg-white text-black px-2 sm:px-3 md:px-4 py-1 md:py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  Registrarse
                </button>
              </div>
            </Show>
          </div>
        </div>

      </div>

      {/* Menú móvil */}
      <Show when={showMobileMenu()}>
        <div class="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-gray-800">
          <div class="px-4 py-4 space-y-4">
            <nav class="space-y-3">
              <button 
                onClick={() => { navigate('/'); setShowMobileMenu(false); }}
                class="flex items-center w-full text-left text-white hover:text-green-400 transition-colors font-medium cursor-pointer"
              >
                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                Inicio
              </button>
            </nav>
            
            <Show when={isLoggedIn()}>
              <div class="border-t border-gray-700 pt-4">
                <div class="flex items-center space-x-3 mb-3">
                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-sm">
                      {user()?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p class="text-white font-medium text-sm">{user()?.username || 'Usuario'}</p>
                    <p class="text-gray-400 text-xs">{user()?.email || ''}</p>
                  </div>
                </div>
                <div class="space-y-2">
                  <button
                    onClick={() => { navigate('/profile'); setShowMobileMenu(false); }}
                    class="flex items-center w-full text-left text-gray-300 hover:text-white transition-colors font-medium cursor-pointer"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Mi Perfil
                  </button>
                  <button
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                    class="flex items-center w-full text-left text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer"
                  >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Sidebar */}
      <Sidebar 
        isOpen={showSidebar()} 
        onToggle={() => setShowSidebar(!showSidebar())} 
      />
    </header>
  );
} 