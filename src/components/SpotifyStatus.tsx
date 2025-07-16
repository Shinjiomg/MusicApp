import { createSignal } from 'solid-js';

export default function SpotifyStatus() {
  const [status, setStatus] = createSignal<'connected' | 'error'>('connected');
  const [message, setMessage] = createSignal('Spotify API disponible');

  return (
    <div class="w-full max-w-2xl mx-auto mb-6 p-4 rounded-xl border border-gray-700 bg-gray-800/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class={`w-3 h-3 rounded-full ${
            status() === 'connected' ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span class="text-sm font-medium text-gray-300">
            Estado de Spotify: {message()}
          </span>
        </div>
      </div>
    </div>
  );
} 