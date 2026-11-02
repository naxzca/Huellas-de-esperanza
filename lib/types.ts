export type Role = 'Adoptante' | 'Admin';

export interface SessionUser { id: string; name: string; email: string; role: Role }
export interface AdminUser extends SessionUser { active: boolean; created_at: string; last_activity_at: string }

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

export interface ForumReply { id:string; author_name:string; content:string; created_at:string }
export interface ForumTopic {
  id:string; title:string; content:string; category:string; author_name:string; closed:boolean;
  created_at:string; updated_at:string; forum_replies?:{count:number}[]; replies?:ForumReply[];
}
