import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redireciona automaticamente para o dashboard
  redirect('/dashboard');
}
