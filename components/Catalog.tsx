'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Pet } from '@/lib/types';

const fallback='https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800';
export default function Catalog(){
 const [pets,setPets]=useState<Pet[]>([]); const [filter,setFilter]=useState(''); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{setLoading(true);fetch(`/api/pets${filter?`?species=${filter}`:''}`).then(r=>r.json()).then(r=>{if(!r.success)throw Error(r.message);setPets(r.data)}).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[filter]);
 return <main className="container catalog"><section className="toolbar"><div><h2>Mascotas disponibles</h2><span className="muted">{loading?'Cargando...':`${pets.length} mascotas encontradas`}</span></div><div className="filters">{[['','Todos'],['Perro','🐶 Perros'],['Gato','🐱 Gatos']].map(([v,l])=><button key={v} className={`filter ${filter===v?'active':''}`} onClick={()=>setFilter(v)}>{l}</button>)}</div></section><section className="grid">{loading?<div className="state">Buscando nuevos amigos...</div>:error?<div className="state">{error}</div>:pets.map(p=><article className="card" key={p.id}><img className="card-image" src={p.image_url||fallback} alt={`Foto de ${p.name}`}/><div className="card-body"><div className="card-title"><h3>{p.name}</h3><span className="age">{p.approximate_age}</span></div><p>{p.description}</p><Link className="button" href={`/adopcion?petId=${p.id}`}>Quiero adoptarlo</Link></div></article>)}</section></main>;
}
