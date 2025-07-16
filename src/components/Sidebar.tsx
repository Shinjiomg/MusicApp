import { createSignal, createEffect, Show } from 'solid-js';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar(props: SidebarProps) {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [user, setUser] = createSignal<any>(null);
  const [favorites, setFavorites] = createSignal<any[]>([]);
  const [activeTab, setActiveTab] = createSignal<'tracks' | 'albums' | 'artists'>('tracks');
  const [isLoading, setIsLoading] = createSignal(false);

  createEffect(() => {
    checkAuthStatus();
  });

  createEffect(() => {
    if (isLoggedIn()) {
      loadFavorites();
    }
  });

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setIsLoggedIn(true);
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFavorites(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFavoritesByType = (type: string) => {
    return favorites().filter(fav => fav.type === type);
  };

  return (
    <div class="fixed left-4 top-20 h-[calc(100vh-6rem)] bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl w-80 z-40 shadow-2xl overflow-hidden">
      <div class="h-full flex flex-col w-full">
        {/* Header del sidebar */}
        <div class="p-6 w-full">
          <div class="flex items-center justify-between mb-6 w-full">
            <h2 class="text-white font-bold text-xl">Tu Biblioteca</h2>
          </div>
          
          <Show when={isLoggedIn()} fallback={
            <div class="text-center py-8">
              <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <h3 class="text-white font-semibold mb-2">Inicia sesión para ver tus favoritos</h3>
              <p class="text-white/60 text-sm mb-4">Guarda tus canciones, álbumes y artistas favoritos</p>
              <button 
                onClick={() => window.location.href = '/login'}
                class="bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Iniciar sesión
              </button>
            </div>
          }>
            {/* Tabs para diferentes tipos de favoritos */}
            <div class="flex space-x-2 mb-6 w-full">
              {[
                { id: 'tracks', label: 'Canciones', count: getFavoritesByType('track').length },
                { id: 'albums', label: 'Álbumes', count: getFavoritesByType('album').length },
                { id: 'artists', label: 'Artistas', count: getFavoritesByType('artist').length }
              ].map((tab) => (
                <button
                  onClick={() => setActiveTab(tab.id as any)}
                  class={`flex-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer min-w-0 ${
                    activeTab() === tab.id
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/20'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <span class="truncate">{tab.label}</span>
                  <span class="ml-1 text-xs opacity-70">({tab.count})</span>
                </button>
              ))}
            </div>
            
            {/* Separador que ocupa todo el ancho */}
            <div class="border-b border-white/10 w-full mt-6"></div>
          </Show>
        </div>

        {/* Contenido de favoritos */}
        <div class="flex-1 overflow-y-auto">
          <Show when={isLoggedIn()} fallback={<div></div>}>
            <div class="p-6 w-full">
              <Show when={isLoading()} fallback={
                <Show when={favorites().length > 0} fallback={
                  <div class="text-center py-8">
                    <div class="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg class="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                    </div>
                    <h3 class="text-white font-semibold mb-2">No tienes favoritos aún</h3>
                    <p class="text-white/60 text-sm">Busca música y agrega tus favoritos para verlos aquí</p>
                  </div>
                }>
                  <div class="space-y-3">
                    {getFavoritesByType(activeTab()).map((favorite) => (
                      <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-200 cursor-pointer border border-white/10 shadow-lg w-full">
                        <div class="flex items-center space-x-3 w-full">
                          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <div class="flex-1 min-w-0 overflow-hidden">
                            <h4 class="text-white font-medium text-sm truncate w-full">{favorite.name}</h4>
                            <p class="text-white/70 text-xs truncate w-full">
                              {favorite.type === 'track' && favorite.artists ? 
                                favorite.artists.join(', ') :
                                favorite.type === 'album' && favorite.artist ? 
                                  favorite.artist :
                                  favorite.type === 'artist' ? 
                                    'Artista' : ''
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Show>
              }>
                <div class="flex items-center justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
} 