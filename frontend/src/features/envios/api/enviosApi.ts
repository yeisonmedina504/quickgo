import { apiClient } from '../../../shared/api/axiosClient';
import { EnvioListado } from '../types';

export const enviosApi = {
  getEnvios: async (): Promise<EnvioListado[]> => {
    const { data } = await apiClient.get('/envios');
    return data;
  },
};