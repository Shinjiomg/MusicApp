import { createSignal, createEffect, onCleanup } from 'solid-js';

interface UserDropdownItem {
  label?: string;
  href?: string;
  action?: () => void;
  icon?: string;
  type?: 'link' | 'button' | 'divider';
}

interface UserDropdownProps {
  user?: {
    username: string;
    email: string;
    created_at: string;
  };
  items: UserDropdownItem[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function UserDropdown(props: UserDropdownProps) {
  let dropdownRef: HTMLDivElement | undefined;

  // Cerrar dropdown al hacer clic fuera
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      props.onToggle();
    }
  };

  createEffect(() => {
    if (props.isOpen && typeof document !== 'undefined') {
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

  const handleItemClick = (item: UserDropdownItem) => {
    if (item.action) {
      item.action();
    }
    // Cerrar dropdown después de hacer clic en un item
    props.onToggle();
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'profile':
        return (
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        );
      case 'favorites':
        return (
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        );
      case 'settings':
        return (
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        );
      case 'logout':
        return (
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div class="relative" ref={dropdownRef}>
      {props.isOpen && props.user && (
        <div class="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* User Info */}
          <div class="px-4 py-3 border-b border-gray-700">
            <p class="text-sm text-white font-medium">{props.user?.username || 'Usuario'}</p>
            <p class="text-xs text-gray-400">{props.user?.email || ''}</p>
            <p class="text-xs text-gray-500 mt-1">
              Miembro desde {props.user?.created_at ? new Date(props.user.created_at).toLocaleDateString('es-ES') : 'Recientemente'}
            </p>
          </div>

          {/* Menu Items */}
          <div class="py-1">
            {props.items.map((item) => {
              if (item.type === 'divider') {
                return <div class="border-t border-gray-700 my-1"></div>;
              }

              const baseClasses = "flex items-center w-full px-4 py-2 text-sm transition-colors duration-200";
              const linkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";
              const buttonClasses = "text-red-400 hover:bg-red-900/20 hover:text-red-300";

              if (item.href && item.label && item.icon) {
                return (
                  <a 
                    href={item.href}
                    class={`${baseClasses} ${linkClasses}`}
                    onClick={() => props.onToggle()}
                  >
                    <div class="w-4 h-4 mr-3">
                      {renderIcon(item.icon)}
                    </div>
                    {item.label}
                  </a>
                );
              }

              if (item.label && item.icon) {
                return (
                  <button
                    onClick={() => handleItemClick(item)}
                    class={`${baseClasses} ${item.icon === 'logout' ? buttonClasses : linkClasses}`}
                  >
                    <div class="w-4 h-4 mr-3">
                      {renderIcon(item.icon)}
                    </div>
                    {item.label}
                  </button>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
} 