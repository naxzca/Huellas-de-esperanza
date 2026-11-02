'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Pet } from '@/lib/types';

const fallback = 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800';

export default function Catalog() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true); setError('');
    fetch(`/api/pets${filter ? `?species=${filter}` : ''}`)
      .then((response) => response.json())
      .then((result) => { if (!result.success) throw new Error(result.message); setPets(result.data); })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    if (!selectedPet) return;
    const closeWithEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelectedPet(null); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeWithEscape);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', closeWithEscape); };
  }, [selectedPet]);

  return <main className="container catalog">
    <section className="toolbar">
      <div><h2>Mascotas disponibles</h2><span className="muted">{loading ? 'Cargando...' : `${pets.length} mascotas encontradas`}</span></div>
      <div className="filters">{[['', 'Todos'], ['Perro', '🐶 Perros'], ['Gato', '🐱 Gatos']].map(([value, label]) =>
        <button key={value} className={`filter ${filter === value ? 'active' : ''}`} onClick={() => setFilter(value)}>{label}</button>)}</div>
    </section>

    <section className="grid">
      {loading ? <div className="state">Buscando nuevos amigos...</div> : error ? <div className="state">{error}</div> : pets.map((pet) =>
        <article className="card" key={pet.id}>
          <div className="card-image-wrap"><img className="card-image" src={pet.image_url || fallback} alt={`Foto de ${pet.name}`} /><span className="pet-species">{pet.species === 'Perro' ? '🐶' : '🐱'} {pet.species}</span></div>
          <div className="card-body"><div className="card-title"><h3>{pet.name}</h3><span className="age">{pet.approximate_age}</span></div><p>{pet.description}</p><button className="button" onClick={() => setSelectedPet(pet)}>Ver detalles</button></div>
        </article>)}
    </section>

    {selectedPet && <div className="pet-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPet(null); }}>
      <section className="pet-modal" role="dialog" aria-modal="true" aria-labelledby="pet-modal-title">
        <button className="pet-modal-close" onClick={() => setSelectedPet(null)} aria-label="Cerrar detalles">×</button>
        <img className="pet-modal-image" src={selectedPet.image_url || fallback} alt={`Foto de ${selectedPet.name}`} />
        <div className="pet-modal-content">
          <span className="topic-category">{selectedPet.species === 'Perro' ? '🐶' : '🐱'} {selectedPet.species}</span>
          <h2 id="pet-modal-title">{selectedPet.name}</h2>
          <div className="pet-modal-meta"><span>🎂 {selectedPet.approximate_age}</span><span className="available-dot">Disponible para adopción</span></div>
          <p>{selectedPet.description}</p>
          <Link className="button orange" href={`/adopcion?petId=${selectedPet.id}`}>Quiero adoptar a {selectedPet.name}</Link>
        </div>
      </section>
    </div>}
  </main>;
}
