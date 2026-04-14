import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { CertificateClient } from './CertificateClient';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function CertificatePage({ params }: Props) {
  const { code } = await params;

  const { data: certificate } = await supabaseAdmin
    .from('education_certificates')
    .select('*')
    .eq('organization_id', DEFAULT_ORG_ID)
    .eq('certificate_code', code)
    .maybeSingle();

  if (!certificate) {
    notFound();
  }

  return <CertificateClient certificate={certificate} />;
}

export const metadata = {
  title: 'Certificado · Criadores Academy',
  description: 'Certificado de conclusão de trilha'
};
