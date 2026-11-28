export interface EnvioListado {
  id: string;
  codigo: string;
  origen: string; 
  destino: string;
  unidad: string;
  conductor: string;
  estado: 'Pendiente' | 'Asignado' | 'EnCurso' | 'Completado' | 'Cancelado';
  fechaLlegadaEstimada: string; 
}