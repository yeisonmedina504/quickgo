import { useState } from 'react';
import { Search, Plus } from 'lucide-react';

// Datos de prueba basados en tu PDF
const mockEnvios = [
  { id: '1', codigo: 'QG-0402', ruta: 'Choluteca → Tegucigalpa', unidad: 'HND-2290', conductor: 'J. Mejía', estado: 'Retrasado', llegada: 'Hoy 19:45' },
  { id: '2', codigo: 'QG-0412', ruta: 'San Pedro Sula → Tegucigalpa', unidad: 'HND-4821', conductor: 'M. Castillo', estado: 'En ruta', llegada: 'Hoy 23:40' },
  { id: '3', codigo: 'QG-0407', ruta: 'La Ceiba → Tegucigalpa', unidad: 'Sin unidad', conductor: 'Sin asignar', estado: 'Pendiente', llegada: 'Sáb 17:00' },
];

export default function EnviosLista() {
  const [busqueda, setBusqueda] = useState('');

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case 'En ruta': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Retrasado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Pendiente': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Envíos</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestiona los envíos activos de tu flota</p>
        </div>
        <button className="flex items-center gap-2 bg-ambar hover:bg-ambar-hover text-asfalto px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} />
          Nuevo envío
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar envío, placa o conductor..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-asfalto-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-ambar outline-none"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla (Responsive) */}
      <div className="bg-white dark:bg-asfalto-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Ruta</th>
                <th className="p-4 font-medium">Unidad / Conductor</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Llegada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {mockEnvios.map((envio) => (
                <tr key={envio.id} className="hover:bg-gray-50 dark:hover:bg-asfalto/50 transition-colors">
                  <td className="p-4 font-mono font-medium text-sm">{envio.codigo}</td>
                  <td className="p-4 text-sm">{envio.ruta}</td>
                  <td className="p-4 text-sm">
                    <div className="font-mono">{envio.unidad}</div>
                    <div className="text-gray-500 text-xs">{envio.conductor}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoStyles(envio.estado)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {envio.estado}
                    </span>
                  </td>
                  <td className="p-4 text-sm whitespace-nowrap">{envio.llegada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}