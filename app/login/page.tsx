import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getSession } from '@/lib/auth';
export default async function Login(){const user=await getSession();if(user)redirect(user.role==='Admin'?'/admin':'/');return <AuthForm/>}
