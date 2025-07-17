import { createSignal, createEffect, Show } from 'solid-js';

interface CustomPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  spotifyUrl?: string;
  trackName?: string;
  artistName?: string;
  imageUrl?: string;
}

export default function CustomPlayer(props: CustomPlayerProps) {
  const [iframeUrl, setIframeUrl] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(true);
  const [trackInfo, setTrackInfo] = createSignal<any>(null);
  const [isFavorite, setIsFavorite] = createSignal(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = createSignal(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = createSignal(false);
  const [showShareModal, setShowShareModal] = createSignal(false);

  createEffect(() => {
    if (props.spotifyUrl && props.isOpen) {
      loadTrackInfo();
      checkFavoriteStatus();
    }
  });

  const loadTrackInfo = async () => {
    setIsLoading(true);
    try {
      // Convertir la URL de Spotify a URL de iframe
      if (props.spotifyUrl) {
        const url = new URL(props.spotifyUrl);
        const trackId = url.pathname.split('/').pop();
        if (trackId) {
          setIframeUrl(`https://open.spotify.com/embed/track/${trackId}`);
          
          // Obtener información detallada de la canción desde nuestra API
          const response = await fetch(`/api/spotify/track/${trackId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setTrackInfo(data.data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading track info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!props.spotifyUrl) return;
    
    setIsCheckingFavorite(true);
    try {
      // Verificar si el usuario está logueado
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        setIsFavorite(false);
        return;
      }
      
      // Obtener el track ID de la URL
      const url = new URL(props.spotifyUrl);
      const trackId = url.pathname.split('/').pop();
      
      // Verificar si ya está en favoritos
      const favoritesResponse = await fetch('/api/favorites');
      if (favoritesResponse.ok) {
        const data = await favoritesResponse.json();
        if (data.success) {
          const favorites = data.data || [];
          const isFav = favorites.some((fav: any) => 
            fav.spotify_id === trackId && fav.type === 'track'
          );
          setIsFavorite(isFav);
        }
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
      setIsFavorite(false);
    } finally {
      setIsCheckingFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (!props.spotifyUrl || !props.trackName) return;
    
    setIsTogglingFavorite(true);
    try {
      // Verificar si el usuario está logueado
      const authResponse = await fetch('/api/auth/me');
      if (!authResponse.ok) {
        window.location.href = '/login';
        return;
      }
      
      // Obtener el track ID de la URL
      const url = new URL(props.spotifyUrl);
      const trackId = url.pathname.split('/').pop();
      
      if (isFavorite()) {
        // Eliminar de favoritos
        const response = await fetch(`/api/favorites/${trackId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        // Agregar a favoritos
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spotify_id: trackId,
            type: 'track',
            name: props.trackName,
            image_url: props.imageUrl,
            external_url: props.spotifyUrl,
          }),
        });
        
        if (response.ok) {
          setIsFavorite(true);
        }
      }
      
      // Disparar evento para actualizar sidebar
      window.dispatchEvent(new CustomEvent('favoritesUpdated'));
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const shareTrack = async () => {
    if (!props.spotifyUrl || !props.trackName) return;
    
    const shareData = {
      title: props.trackName,
      text: `Escucha "${props.trackName}" en Spotify`,
      url: props.spotifyUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShowShareModal(true);
        setTimeout(() => setShowShareModal(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        setShowShareModal(true);
        setTimeout(() => setShowShareModal(false), 2000);
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError);
      }
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Show when={props.isOpen}>
      <div 
        class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div class="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-white/10 relative overflow-hidden">
          {/* Background blur effect */}
          <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-purple-500/10 rounded-3xl"></div>
          
          {/* Header */}
          <div class="relative z-10 flex items-center justify-between mb-8">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-white font-bold text-xl">Reproduciendo</h2>
                <p class="text-white/60 text-sm">Spotify</p>
              </div>
            </div>
            <button 
              onClick={props.onClose}
              class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Spotify Player */}
          <div class="relative z-10">
            <Show when={!isLoading()} fallback={
              <div class="w-full h-32 bg-gray-800 rounded-2xl flex items-center justify-center">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            }>
              <div class="w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
                <iframe
                  src={iframeUrl()}
                  width="100%"
                  height="152"
                  frameborder="0"
                  allow="encrypted-media"
                  class="rounded-2xl"
                ></iframe>
              </div>
            </Show>
          </div>

          {/* Footer Actions */}
          <div class="relative z-10 mt-8 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <button 
                onClick={toggleFavorite}
                disabled={isTogglingFavorite() || isCheckingFavorite()}
                class={`px-6 py-3 rounded-full font-medium transition-all duration-200 backdrop-blur-sm border flex items-center space-x-2 ${
                  isFavorite() 
                    ? 'bg-green-500/30 border-green-400 text-green-400 hover:bg-green-500/40' 
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                } ${isTogglingFavorite() ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Show when={isTogglingFavorite()} fallback={
                  <svg class={`w-5 h-5 ${isFavorite() ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                }>
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                </Show>
                <span>{isFavorite() ? 'Quitar de favoritos' : 'Agregar a favoritos'}</span>
              </button>
              
              <button 
                onClick={shareTrack}
                class="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 flex items-center space-x-2"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
                </svg>
                <span>Compartir</span>
              </button>
            </div>
            
            <a 
              href={props.spotifyUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              <span>Abrir en Spotify</span>
            </a>
          </div>

          {/* Share Success Modal */}
          <Show when={showShareModal()}>
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
              <div class="bg-white text-black px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3">
                <svg class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span class="font-medium">¡Enlace copiado al portapapeles!</span>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
} 