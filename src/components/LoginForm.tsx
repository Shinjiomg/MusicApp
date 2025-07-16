import { createSignal } from 'solid-js';

export default function LoginForm() {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    if (!email() || !password()) {
      setError('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email(),
          password: password()
        })
      });

      const result = await response.json();

      if (result.success) {
        // Redirigir a la página principal
        window.location.href = '/';
      } else {
        setError(result.error || 'Credenciales inválidas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div class="w-full">
      <form onSubmit={handleSubmit} class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-white mb-3">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email()}
            onInput={(e) => setEmail(e.currentTarget.value)}
            required
            class="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
            placeholder="tu@email.com"
            disabled={isLoading()}
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-white mb-3">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password()}
            onInput={(e) => setPassword(e.currentTarget.value)}
            required
            class="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
            placeholder="Tu contraseña"
            disabled={isLoading()}
          />
        </div>

        {error() && (
          <div class="bg-red-900/20 border border-red-800 rounded-xl px-4 py-4">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-red-400 text-sm">{error()}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading()}
          class="w-full bg-white text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
        >
          {isLoading() ? (
            <div class="flex items-center justify-center space-x-2">
              <svg class="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>
    </div>
  );
} 