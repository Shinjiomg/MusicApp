import { createSignal, createEffect, onCleanup } from 'solid-js';

interface Option {
  value: string;
  label: string;
  icon?: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CustomDropdown(props: CustomDropdownProps) {
  const [isOpen, setIsOpen] = createSignal(false);
  const [selectedOption, setSelectedOption] = createSignal<Option | null>(null);
  let dropdownRef: HTMLDivElement | undefined;

  // Encontrar la opción seleccionada
  createEffect(() => {
    const option = props.options.find(opt => opt.value === props.value);
    setSelectedOption(option || null);
  });

  // Cerrar dropdown al hacer clic fuera
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  createEffect(() => {
    if (isOpen() && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    } else if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  });

  onCleanup(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  });

  const handleSelect = (option: Option) => {
    props.onChange(option.value);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (!props.disabled) {
      setIsOpen(!isOpen());
    }
  };

  return (
    <div class="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={props.disabled}
        class="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-white transition-all duration-200 flex items-center justify-between hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span class={selectedOption() ? 'text-white' : 'text-gray-400'}>
          {selectedOption() ? selectedOption()!.label : props.placeholder || 'Seleccionar'}
        </span>
        <svg
          class={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen() ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen() && (
        <div class="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <div class="py-2 max-h-60 overflow-y-auto">
            {props.options.map((option) => (
              <button
                type="button"
                onClick={() => handleSelect(option)}
                class={`w-full px-6 py-3 text-left hover:bg-gray-700 transition-colors duration-150 flex items-center space-x-3 cursor-pointer ${
                  option.value === props.value ? 'bg-green-600/20 text-green-400' : 'text-white'
                }`}
              >
                                 {option.icon && (
                   <div class="w-5 h-5 flex items-center justify-center">
                     {option.icon === 'track' && (
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                       </svg>
                     )}
                     {option.icon === 'album' && (
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                       </svg>
                     )}
                     {option.icon === 'artist' && (
                       <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                       </svg>
                     )}
                   </div>
                 )}
                <span class="flex-1">{option.label}</span>
                {option.value === props.value && (
                  <svg class="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 