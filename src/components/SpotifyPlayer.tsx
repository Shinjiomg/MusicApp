import { createSignal, createEffect, Show } from 'solid-js';

interface SpotifyPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  spotifyUrl?: string;
  trackName?: string;
  artistName?: string;
  imageUrl?: string;
}

export default function SpotifyPlayer(props: SpotifyPlayerProps) {
  const [iframeUrl, setIframeUrl] = createSignal('');

  createEffect(() => {
    if (props.spotifyUrl && props.isOpen) {
      // Convertir la URL de Spotify a URL de iframe
      const url = new URL(props.spotifyUrl);
      const trackId = url.pathname.split('/').pop();
      if (trackId) {
        setIframeUrl(`https://open.spotify.com/embed/track/${trackId}`);
      }
    }
  });

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div class="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20">
          {/* Spotify Player */}
          <div class="w-full">
            <div class="flex items-center justify-end mb-4">

              <button
                onClick={props.onClose}
                class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <iframe
              src={iframeUrl()}
              width="100%"
              height="152"
              frameborder="0"
              allow="encrypted-media"
              class="rounded-lg"
            ></iframe>
          </div>
        </div>
      </div>
    </Show>
  );
} 