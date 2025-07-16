import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Google Sheets
function getGoogleSheetsAuth() {
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
  };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

async function debugCampaignMapping() {
  console.log('🔍 Debugando mapeamento de campanhas...\n');
  
  try {
    // 1. Buscar campanhas do Supabase
    console.log('📊 Campanhas no Supabase:');
    
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('*');
    
    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return;
    }
    
    campaigns?.forEach((campaign, index) => {
      console.log(`  ${index + 1}. ID: ${campaign.id}`);
      console.log(`     Título: ${campaign.title}`);
      console.log(`     Business ID: ${campaign.business_id}`);
      console.log(`     Mês: ${campaign.month}`);
      console.log(`     Status: ${campaign.status}`);
      console.log('');
    });
    
    // 2. Buscar negócios do Supabase
    console.log('🏢 Negócios no Supabase:');
    
    const { data: businesses, error: businessesError } = await supabase
      .from('businesses')
      .select('*');
    
    if (businessesError) {
      console.error('❌ Erro ao buscar negócios:', businessesError);
      return;
    }
    
    businesses?.forEach((business, index) => {
      console.log(`  ${index + 1}. ID: ${business.id}`);
      console.log(`     Nome: ${business.nome}`);
      console.log('');
    });
    
    // 3. Buscar dados do Google Sheets
    console.log('📋 Campanhas no Google Sheets (primeiras 10):');
    
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      console.error('❌ GOOGLE_SPREADSHEET_ID não configurado');
      return;
    }
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:F'
    });
    
    const values = response.data.values || [];
    const headers = values[0] || [];
    
    console.log('📋 Cabeçalhos:', headers);
    console.log('');
    
    for (let i = 1; i <= Math.min(10, values.length - 1); i++) {
      const row = values[i];
      console.log(`  ${i}. Campaign_ID: ${row[0]}`);
      console.log(`     Nome Campanha (business_id): ${row[1]}`);
      console.log(`     Influenciador: ${row[2]}`);
      console.log(`     Responsável: ${row[3]}`);
      console.log(`     Status: ${row[4]}`);
      console.log(`     Mês: ${row[5]}`);
      console.log('');
    }
    
    // 4. Tentar mapear business_ids para nomes
    console.log('🔗 Tentando mapear business_ids para nomes:');
    
    const businessMap = new Map<string, any>();
    businesses?.forEach(business => {
      businessMap.set(business.id, business);
    });
    
    const uniqueBusinessIds = new Set<string>();
    for (let i = 1; i < values.length; i++) {
      const businessId = values[i][1];
      if (businessId) {
        uniqueBusinessIds.add(businessId);
      }
    }
    
    uniqueBusinessIds.forEach(businessId => {
      const business = businessMap.get(businessId);
      if (business) {
        console.log(`  ✅ ${businessId} → ${business.nome}`);
      } else {
        console.log(`  ❌ ${businessId} → Não encontrado`);
      }
    });
    
    // 5. Analisar possíveis correspondências
    console.log('\n🔍 Analisando correspondências possíveis:');
    
    const monthGroups = new Map<string, any[]>();
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const businessId = row[1];
      const month = row[5];
      const business = businessMap.get(businessId);
      
      if (business && month) {
        const key = `${business.nome}-${month}`;
        if (!monthGroups.has(key)) {
          monthGroups.set(key, []);
        }
        monthGroups.get(key)!.push({
          campaignId: row[0],
          businessName: business.nome,
          month: month,
          creator: row[2],
          status: row[4]
        });
      }
    }
    
    console.log('\n📊 Grupos por negócio-mês no Google Sheets:');
    monthGroups.forEach((campaigns, key) => {
      console.log(`  📋 ${key}: ${campaigns.length} campanhas`);
      
      // Verificar se existe campanha correspondente no Supabase
      const [businessName, month] = key.split('-');
      const business = businesses?.find(b => b.nome === businessName);
      
      if (business) {
        const supabaseCampaign = campaigns?.find(c => 
          c.business_id === business.id && 
          c.month === month
        );
        
        if (supabaseCampaign) {
          console.log(`    ✅ Correspondência encontrada: ${supabaseCampaign.title}`);
        } else {
          console.log(`    ❌ Nenhuma correspondência no Supabase`);
        }
      }
    });
    
    // 6. Sugerir estratégia de mapeamento
    console.log('\n💡 Estratégia de mapeamento sugerida:');
    console.log('1. Usar business_id do Google Sheets para encontrar business no Supabase');
    console.log('2. Buscar campanha no Supabase por business_id + month');
    console.log('3. Se não encontrar, criar nova campanha ou usar campanha existente mais próxima');
    
    console.log('\n✅ Debug de mapeamento concluído!');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

if (require.main === module) {
  debugCampaignMapping()
    .then(() => {
      console.log('\n🎉 Debug finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Debug falhou:', error);
      process.exit(1);
    });
}

export { debugCampaignMapping };
