import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

const banks=new Set(['Bancolombia','Banco de Bogotá','Davivienda','Banco de Occidente','BBVA Colombia','Banco Caja Social','Nequi','Dale!']);
const documentTypes=new Set(['CC','CE','NIT','Pasaporte']);
export async function POST(request:Request){try{const body=await request.json();const donorName=String(body.donorName||'').trim();const donorEmail=String(body.donorEmail||'').trim().toLowerCase();const documentType=String(body.documentType||'');const documentNumber=String(body.documentNumber||'').trim();const bank=String(body.bank||'');const amountCop=Number(body.amount);
if(donorName.length<2||!/^\S+@\S+\.\S+$/.test(donorEmail)||documentNumber.length<5)return NextResponse.json({success:false,message:'Revisa tus datos personales.'},{status:400});
if(!documentTypes.has(documentType)||!banks.has(bank))return NextResponse.json({success:false,message:'Selecciona un documento y banco válidos.'},{status:400});
if(!Number.isInteger(amountCop)||amountCop<5000||amountCop>100_000_000)return NextResponse.json({success:false,message:'La donación debe ser un valor entero entre $5.000 y $100.000.000 COP.'},{status:400});
if(body.accepted!=='yes')return NextResponse.json({success:false,message:'Debes confirmar la donación.'},{status:400});
const reference=`HUE-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,8).toUpperCase()}`;const {data,error}=await createServerSupabase().from('donations').insert({reference,donor_name:donorName,donor_email:donorEmail,document_type:documentType,document_number:documentNumber,amount_cop:amountCop,bank,status:'Aprobada'}).select('reference,donor_name,amount_cop,bank,status,created_at').single();if(error)throw error;
return NextResponse.json({success:true,data:{reference:data.reference,donorName:data.donor_name,amountCop:data.amount_cop,bank:data.bank,status:data.status,createdAt:data.created_at}},{status:201});}catch(error){console.error('Donation error:',error);return NextResponse.json({success:false,message:'No fue posible registrar la donación. Verifica que la tabla donations exista.'},{status:500});}}
