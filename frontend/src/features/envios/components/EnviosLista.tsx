import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { enviosApi } from '../api/enviosApi';
import { EnvioListado } from '../types';

export default function EnviosLista() {
  const [busqueda, setBusqueda] = useState('');
  const [envios, setEnvios] = useState<EnvioListado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Efecto para traer los datos del backend
  useEffect(() => {
    const cargarEnvios = async () => {
      try {
        setCargando(true);
        const data = await enviosApi.getEnvios();
        setEnvios(data);
      } catch (err: any) {
        console.error("Error al cargar envíos:", err);
        // Manejo del error 401 (Token expirado o no autenticado)
        if (err.response?.status === 401) {
          setError('No autorizado. Inicia sesión de nuevo.');
        } else {
          setError('No se pudieron cargar los envíos. ¿El backend está corriendo?');
        }
      } finally {
        setCargando(false);
      }
    };

    cargarEnvios();
  }, []);

  // Filtro de búsqueda local (mientras escribes)
  const enviosFiltrados = envios.filter(e => 
    e.codigo.toLowerCase().includes(busqueda.toLowerCase()) || 
    (e.conductor && e.conductor.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case 'EnCurso': 
      case 'En ruta': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Retrasado': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'Pendiente': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'Asignado': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (cargando) return <div className="p-8 text-center">Cargando envíos...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
          placeholder="Buscar envío por código o conductor..."
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-asfalto-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-ambar outline-none"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-asfalto-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="p-4 font-medium">Código</th>
                <th className="p-4 font-medium">Origen → Destino</th>
                <th className="p-4 font-medium">Unidad / Conductor</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium">Llegada Est.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {enviosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No hay envíos registrados.</td>
                </tr>
              ) : (
                enviosFiltrados.map((envio) => (
                  <tr key={envio.id} className="hover:bg-gray-50 dark:hover:bg-asfalto/50 transition-colors">
                    <td className="p-4 font-mono font-medium text-sm">{envio.codigo}</td>
                    <td className="p-4 text-sm">{envio.origen} → {envio.destino}</td>
                    <td className="p-4 text-sm">
                      <div className="font-mono">{envio.unidad || 'Sin asignar'}</div>
                      <div className="text-gray-500 text-xs">{envio.conductor || 'Sin asignar'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getEstadoStyles(envio.estado)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {envio.estado}
                      </span>
                    </td>
                    <td className="p-4 text-sm whitespace-nowrap">
                      {envio.fechaLlegadaEstimada ? new Date(envio.fechaLlegadaEstimada).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}