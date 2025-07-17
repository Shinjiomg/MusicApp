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

  // Escuchar eventos de actualización de favoritos
  createEffect(() => {
    const handleFavoritesUpdated = () => {
      if (isLoggedIn()) {
        loadFavorites();
      }
    };

    window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
    };
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
    // Mapear los IDs de los tabs a los tipos de la base de datos
    const typeMapping: { [key: string]: string } = {
      'tracks': 'track',
      'albums': 'album', 
      'artists': 'artist'
    };
    
    const dbType = typeMapping[type] || type;
    return favorites().filter(fav => fav.type === dbType);
  };

  const shareFavorite = async (favorite: any) => {
    const shareData = {
      title: favorite.name,
      text: `Mira "${favorite.name}" en Spotify`,
      url: favorite.external_url || ''
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        showShareNotification();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        showShareNotification();
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
    }
  };

  const showShareNotification = () => {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    notification.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>¡Enlace copiado!</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 2 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  };

  const removeFavorite = async (favoriteId: number) => {
    try {
      // Buscar el favorito para obtener el spotify_id
      const favorite = favorites().find(fav => fav.id === favoriteId);
      if (!favorite) {
        console.error('Favorito no encontrado');
        return;
      }
      
      const response = await fetch(`/api/favorites/${favorite.spotify_id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Recargar favoritos
        loadFavorites();
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
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
                { id: 'tracks', label: 'Canciones', count: getFavoritesByType('tracks').length },
                { id: 'albums', label: 'Álbumes', count: getFavoritesByType('albums').length },
                { id: 'artists', label: 'Artistas', count: getFavoritesByType('artists').length }
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
                    {getFavoritesByType(activeTab()).map((favorite, index) => (
                      <div 
                        class="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all duration-200 cursor-pointer border border-white/10 shadow-lg w-full group animate-fade-in hover-lift"
                        style={`animation-delay: ${index * 100}ms`}
                        onClick={() => {
                          if (favorite.external_url) {
                            if (favorite.type === 'track') {
                              // Para tracks, abrir el reproductor
                              window.dispatchEvent(new CustomEvent('openSpotifyPlayer', {
                                detail: {
                                  spotifyUrl: favorite.external_url,
                                  trackName: favorite.name,
                                  artistName: 'Canción',
                                  imageUrl: favorite.image_url
                                }
                              }));
                            } else {
                              // Para álbumes y artistas, redirigir directamente
                              window.open(favorite.external_url, '_blank', 'noopener,noreferrer');
                            }
                          }
                        }}
                      >
                        <div class="flex items-center space-x-3 w-full">
                          <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg relative overflow-hidden group">
                            {favorite.image_url ? (
                              <>
                                <img 
                                  src={favorite.image_url} 
                                  alt={favorite.name} 
                                  class="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const nextSibling = target.nextElementSibling as HTMLElement;
                                    if (nextSibling) {
                                      nextSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div class="absolute inset-0 flex items-center justify-center">
                                  <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110 shadow-lg">
                                    <svg class="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                </div>
                              </>
                            ) : null}
                            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-200"></div>
                            <div class="absolute inset-0 flex items-center justify-center">
                              <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110 shadow-lg">
                                <svg class="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                            <svg class="w-6 h-6 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                              {favorite.type === 'track' ? (
                                <path d="M8 5v14l11-7z"/>
                              ) : favorite.type === 'album' ? (
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              ) : (
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              )}
                            </svg>
                          </div>
                          <div class="flex-1 min-w-0 overflow-hidden">
                            <h4 class="text-white font-medium text-sm truncate w-full">{favorite.name}</h4>
                            <p class="text-white/70 text-xs truncate w-full">
                              {favorite.type === 'track' ? 'Canción' :
                               favorite.type === 'album' ? 'Álbum' :
                               favorite.type === 'artist' ? 'Artista' : ''}
                            </p>
                          </div>
                          <div class="flex items-center space-x-2">
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                shareFavorite(favorite);
                              }}
                              class="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 group/share"
                              title="Compartir"
                            >
                              <svg class="w-3 h-3 text-blue-400 group-hover/share:text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                              </svg>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeFavorite(favorite.id);
                              }}
                              class="w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 group/btn"
                              title="Quitar de favoritos"
                            >
                              <svg class="w-3 h-3 text-green-400 group-hover/btn:text-green-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                              </svg>
                            </button>
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