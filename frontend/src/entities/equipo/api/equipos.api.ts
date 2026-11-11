import { httpRequest } from '../../../shared/api/http-client';
import type {
  CreateEquipoInput,
  Equipo,
  Mantenimiento,
  UpdateEquipoInput,
} from '../model/types';

export const equiposApi = {
  list(): Promise<Equipo[]> {
    return httpRequest<Equipo[]>('/equipos');
  },

  create(input: CreateEquipoInput): Promise<Equipo> {
    return httpRequest<Equipo>('/equipos', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: UpdateEquipoInput): Promise<Equipo> {
    return httpRequest<Equipo>(`/equipos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  remove(id: number): Promise<{ message: string }> {
    return httpRequest<{ message: string }>(`/equipos/${id}`, {
      method: 'DELETE',
    });
  },

  registerMantenimiento(
    equipoId: number,
    horometroActual?: number,
  ): Promise<{ mantenimiento: Mantenimiento; equipo: Equipo }> {
    return httpRequest<{ mantenimiento: Mantenimiento; equipo: Equipo }>(
      `/equipos/${equipoId}/mantenimientos`,
      {
        method: 'POST',
        body: JSON.stringify(
          horometroActual !== undefined ? { horometroActual } : {},
        ),
      },
    );
  },
};
