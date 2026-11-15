import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase';

const platforms = ['Instagram','Facebook','TikTok','YouTube','X'] as const;
const canManage = (role?:string) => role === 'Admin' || role === 'Redes';

export async function GET(request:Request){
  try{
    const manage=new URL(request.url).searchParams.get('scope')==='manage';
    const user=manage?await getSession():null;
    if(manage&&!canManage(user?.role))return NextResponse.json({success:false,message:'No tienes permisos para gestionar las redes.'},{status:403});
    let query=createServerSupabase().from('social_links').select('platform,url,active,updated_at').order('platform');
    if(!manage)query=query.eq('active',true).neq('url','');
    const {data,error}=await query;if(error)throw error;
    return NextResponse.json({success:true,data});
  }catch(error){console.error(error);return NextResponse.json({success:false,message:'No fue posible cargar las redes sociales.'},{status:500})}
}

export async function PUT(request:Request){
  try{
    const user=await getSession();
    if(!user||!canManage(user.role))return NextResponse.json({success:false,message:'No tienes permisos para gestionar las redes.'},{status:403});
    const body=await request.json();
    if(!Array.isArray(body.links))return NextResponse.json({success:false,message:'Información de redes inválida.'},{status:400});
    const records=[];
    for(const platform of platforms){
      const input=body.links.find((item:unknown)=>(item as {platform?:string})?.platform===platform) as {url?:unknown;active?:unknown}|undefined;
      const url=String(input?.url||'').trim();
      if(url.length>500||(url&&!/^https:\/\/[^\s]+$/i.test(url)))return NextResponse.json({success:false,message:`El enlace de ${platform} debe comenzar con https://`},{status:400});
      records.push({platform,url,active:Boolean(input?.active&&url),updated_by:user.id});
    }
    const {data,error}=await createServerSupabase().from('social_links').upsert(records,{onConflict:'platform'}).select('platform,url,active,updated_at');
    if(error)throw error;
    return NextResponse.json({success:true,message:'Enlaces de redes sociales actualizados.',data});
  }catch(error){console.error(error);return NextResponse.json({success:false,message:'No fue posible guardar las redes sociales.'},{status:500})}
}
