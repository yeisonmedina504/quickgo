import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, Truck, Map, Gavel, Sun, Moon, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    { path: '/envios', label: 'Envíos', icon: <Package size={20} /> },
    { path: '/seguimiento', label: 'Seguimiento', icon: <Map size={20} /> },
    { path: '/subastas', label: 'Subastas', icon: <Gavel size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-papel dark:bg-asfalto text-asfalto dark:text-papel transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-asfalto-2 text-white flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-asfalto">
          <div className="bg-ambar p-2 rounded-lg text-asfalto">
            <Truck size={24} />
          </div>
          <span className="text-xl font-display font-bold">QuickGo</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <p className="text-xs text-gray-400 font-semibold mb-4 tracking-wider">OPERACIÓN</p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname.startsWith(item.path) 
                  ? 'bg-asfalto text-ambar font-medium' 
                  : 'hover:bg-asfalto-2/50 text-gray-300'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* BOTÓN MODO OSCURO Y SALIR */}
        <div className="p-4 border-t border-asfalto flex justify-between items-center">
          <button onClick={toggleTheme} className="p-2 hover:bg-asfalto rounded-lg text-gray-300">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="p-2 hover:bg-alerta/20 text-alerta rounded-lg">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Aquí irá el Topbar (Buscador) luego, por ahora solo el Outlet */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

    </div>
  );
}