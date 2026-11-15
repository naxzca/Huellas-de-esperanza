import ResetPasswordForm from '@/components/ResetPasswordForm';
export default async function ResetPasswordPage({searchParams}:PageProps<'/restablecer-contrasena'>){const {token}=await searchParams;return <ResetPasswordForm token={typeof token==='string'?token:''}/>}
