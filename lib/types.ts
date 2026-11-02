export type Role = 'Adoptante' | 'Admin';

export interface SessionUser { id: string; name: string; email: string; role: Role }

export interface Pet {
  id: string;
  name: string;
  species: 'Perro' | 'Gato';
  approximate_age: string;
  description: string;
  image_url: string | null;
  status: 'Disponible' | 'En proceso' | 'Adoptado';
  last_activity_at: string;
}
