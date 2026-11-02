import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

const required = ['petId','fullName','email','phone','city','occupation','housingType','petExperience','adoptionReason'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (required.some((field) => !String(body[field] || '').trim())) {
      return NextResponse.json({ success: false, message: 'Completa todos los campos obligatorios.' }, { status: 400 });
    }
    const db = createServerSupabase();
    const { data: pet } = await db.from('pets').select('id,name,species,status').eq('id', body.petId).eq('status', 'Disponible').maybeSingle();
    if (!pet) return NextResponse.json({ success: false, message: 'La mascota no está disponible.' }, { status: 404 });
    const record = {
      pet_id: pet.id, pet_name: pet.name, full_name: body.fullName.trim(), email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(), city: body.city.trim(), occupation: body.occupation.trim(), housing_type: body.housingType,
      pet_experience: body.petExperience.trim(), adoption_reason: body.adoptionReason.trim()
    };
    const { data, error } = await db.from('adoptions').insert(record).select('id').single();
    if (error) throw error;
    const text = ['🐾 *SOLICITUD FORMAL DE ADOPCIÓN*','',`*Mascota:* ${pet.name} (${pet.species})`,`*Solicitante:* ${record.full_name}`,`*Teléfono:* ${record.phone}`,`*Correo:* ${record.email}`,`*Ciudad:* ${record.city}`,`*Ocupación:* ${record.occupation}`,`*Vivienda:* ${record.housing_type}`,'',`*Experiencia:* ${record.pet_experience}`,'',`*Motivo:* ${record.adoption_reason}`,'',`Solicitud: ${data.id}`].join('\n');
    const phone = (process.env.REFUGE_WHATSAPP_NUMBER || '').replace(/\D/g, '');
    return NextResponse.json({ success: true, whatsappUrl: `https://wa.me/${phone}?text=${encodeURIComponent(text)}` }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'No fue posible registrar la solicitud.' }, { status: 500 });
  }
}
