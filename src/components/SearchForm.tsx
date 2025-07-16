import { createSignal, createEffect } from 'solid-js';
import type { SpotifySearchResponse, SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '../types';
import CustomDropdown from './CustomDropdown';

interface SearchFormProps {
  onResults?: (results: SpotifySearchResponse) => void;
}

export default function SearchForm(props: SearchFormProps) {
  const [query, setQuery] = createSignal('');
  const [type, setType] = createSignal<'track' | 'album' | 'artist'>('track');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const typeOptions = [
    { value: 'track', label: 'Canciones', icon: 'track' },
    { value: 'album', label: 'Álbumes', icon: 'album' },
    { value: 'artist', label: 'Artistas', icon: 'artist' }
  ];

  const handleSearch = async (e: Event) => {
    e.preventDefault();
    
    if (!query().trim()) {
      setError('Por favor ingresa un término de búsqueda');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query())}&type=${type()}&limit=20`);
      const data = await response.json();

      if (data.success) {
        props.onResults?.(data.data);
        // Emitir evento para el script de la página
        window.dispatchEvent(new CustomEvent('searchResults', { detail: data.data }));
      } else {
        setError(data.error || 'Error en la búsqueda');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Error en búsqueda:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} class="space-y-6">
        <div class="flex gap-3">
          <input
            type="text"
            value={query()}
            onInput={(e) => setQuery(e.currentTarget.value)}
            placeholder="Buscar canciones, álbumes o artistas..."
            class="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
            disabled={isLoading()}
          />
          <div class="w-48">
            <CustomDropdown
              options={typeOptions}
              value={type()}
              onChange={(value) => setType(value as 'track' | 'album' | 'artist')}
              placeholder="Tipo de búsqueda"
              disabled={isLoading()}
            />
          </div>
        </div>
        
        {error() && (
          <div class="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg px-4 py-3">{error()}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading()}
          class="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-green-500/25 transform hover:scale-105 disabled:transform-none cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading() ? (
            <div class="flex items-center justify-center space-x-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Buscando...</span>
            </div>
          ) : (
            <div class="flex items-center justify-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <span>Buscar</span>
            </div>
          )}
        </button>
      </form>
    </div>
  );
} 