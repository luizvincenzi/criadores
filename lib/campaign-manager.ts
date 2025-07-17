// 🎯 GERENCIADOR DE CAMPANHAS - FONTE ÚNICA DE VERDADE
// Este módulo garante que TODAS as operações mantenham consistência

import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export interface CampaignSlot {
  index: number;
  influenciador: string;
  creatorId: string | null;
  isExisting: boolean;
  briefingCompleto: string;
  visitaConfirmado: string;
  videoAprovado: string;
  videoPostado: string;
  dataHoraVisita?: string;
  dataHoraPostagem?: string;
  quantidadeConvidados?: number;
  videoInstagramLink?: string;
  videoTiktokLink?: string;
}

export interface CampaignData {
  id: string;
  businessName: string;
  mes: string;
  quantidade_criadores: number;
  status: string;
  title: string;
}

export class CampaignManager {
  
  // =====================================================
  // MÉTODO PRINCIPAL: Buscar slots com validação
  // =====================================================
  
  static async getSlots(businessName: string, mes: string): Promise<{
    slots: CampaignSlot[];
    campaign: CampaignData;
    isValid: boolean;
    errors: string[];
  }> {
    try {
      console.log('🔍 CampaignManager: Buscando slots para', { businessName, mes });
      
      // 1. Buscar campanha
      const campaign = await this.getCampaign(businessName, mes);
      if (!campaign) {
        throw new Error(`Campanha não encontrada para ${businessName} - ${mes}`);
      }
      
      // 2. Validar integridade antes de retornar
      const validation = await this.validateCampaignIntegrity(campaign.id);
      
      // 3. Auto-corrigir se necessário
      if (!validation.isValid) {
        console.log('⚠️ Inconsistência detectada, auto-corrigindo...');
        await this.autoFixCampaign(campaign.id);
        
        // Recarregar dados após correção
        const fixedCampaign = await this.getCampaign(businessName, mes);
        if (fixedCampaign) {
          campaign.quantidade_criadores = fixedCampaign.quantidade_criadores;
        }
      }
      
      // 4. Buscar criadores
      const slots = await this.buildSlots(campaign);
      
      console.log('✅ CampaignManager: Slots carregados', {
        quantidade: slots.length,
        campanha: campaign.title
      });
      
      return {
        slots,
        campaign,
        isValid: validation.isValid,
        errors: validation.errors
      };
      
    } catch (error) {
      console.error('❌ CampaignManager: Erro ao buscar slots:', error);
      throw error;
    }
  }
  
  // =====================================================
  // OPERAÇÕES ATÔMICAS
  // =====================================================
  
  static async addCreator(
    campaignId: string, 
    creatorId: string, 
    userEmail: string,
    increaseSlots: boolean = false
  ): Promise<{ success: boolean; newQuantidade: number; message: string }> {
    
    try {
      console.log('➕ CampaignManager: Adicionando criador', { campaignId, creatorId, increaseSlots });
      
      // Usar função SQL atômica
      const { data, error } = await supabase.rpc('add_creator_atomic', {
        p_campaign_id: campaignId,
        p_creator_id: creatorId,
        p_user_email: userEmail,
        p_increase_slots: increaseSlots
      });
      
      if (error) throw error;
      
      console.log('✅ CampaignManager: Criador adicionado', data);
      return data;
      
    } catch (error) {
      console.error('❌ CampaignManager: Erro ao adicionar criador:', error);
      throw error;
    }
  }
  
  static async removeCreator(
    campaignId: string,
    creatorId: string,
    userEmail: string,
    deleteLine: boolean = false
  ): Promise<{ success: boolean; newQuantidade: number; message: string }> {
    
    try {
      console.log('🗑️ CampaignManager: Removendo criador', { campaignId, creatorId, deleteLine });
      
      // Usar função SQL atômica
      const { data, error } = await supabase.rpc('remove_creator_atomic', {
        p_campaign_id: campaignId,
        p_creator_id: creatorId,
        p_user_email: userEmail,
        p_delete_line: deleteLine
      });
      
      if (error) throw error;
      
      console.log('✅ CampaignManager: Criador removido', data);
      return data;
      
    } catch (error) {
      console.error('❌ CampaignManager: Erro ao remover criador:', error);
      throw error;
    }
  }
  
  static async swapCreator(
    campaignId: string,
    oldCreatorId: string,
    newCreatorId: string,
    userEmail: string
  ): Promise<{ success: boolean; message: string }> {
    
    try {
      console.log('🔄 CampaignManager: Trocando criador', { campaignId, oldCreatorId, newCreatorId });
      
      // Usar função SQL atômica
      const { data, error } = await supabase.rpc('swap_creator_atomic', {
        p_campaign_id: campaignId,
        p_old_creator_id: oldCreatorId,
        p_new_creator_id: newCreatorId,
        p_user_email: userEmail
      });
      
      if (error) throw error;
      
      console.log('✅ CampaignManager: Criador trocado', data);
      return data;
      
    } catch (error) {
      console.error('❌ CampaignManager: Erro ao trocar criador:', error);
      throw error;
    }
  }
  
  // =====================================================
  // MÉTODOS AUXILIARES
  // =====================================================
  
  private static async getCampaign(businessName: string, mes: string): Promise<CampaignData | null> {
    // Converter mês para month_year_id
    const monthYearId = parseInt(mes);
    
    // Buscar business
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name')
      .ilike('name', `%${businessName}%`)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();
    
    if (!business) return null;
    
    // Buscar campanha
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, title, quantidade_criadores, status')
      .eq('business_id', business.id)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();
    
    if (!campaign) return null;
    
    return {
      id: campaign.id,
      businessName: business.name,
      mes,
      quantidade_criadores: campaign.quantidade_criadores,
      status: campaign.status,
      title: campaign.title
    };
  }
  
  private static async buildSlots(campaign: CampaignData): Promise<CampaignSlot[]> {
    // Buscar criadores associados
    const { data: creators } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        deliverables,
        video_instagram_link,
        video_tiktok_link,
        creators(id, name)
      `)
      .eq('campaign_id', campaign.id)
      .neq('status', 'Removido')
      .order('created_at');
    
    // Criar array de slots baseado na quantidade_criadores
    const slots: CampaignSlot[] = [];

    for (let i = 0; i < campaign.quantidade_criadores; i++) {
      const creator = creators?.[i]; // Usar índice direto baseado na ordem

      // Verificar se é um slot vazio (criador placeholder)
      const isEmptySlot = !creator || creator?.creators?.name === '[SLOT VAZIO]';

      slots.push({
        index: i,
        influenciador: isEmptySlot ? '' : (creator?.creators?.name || ''),
        creatorId: isEmptySlot ? null : (creator?.creators?.id || null),
        isExisting: !!creator && !isEmptySlot,
        briefingCompleto: creator?.deliverables?.briefing_complete || 'Pendente',
        visitaConfirmado: creator?.deliverables?.visit_confirmed || 'Pendente',
        videoAprovado: creator?.deliverables?.video_approved || 'Pendente',
        videoPostado: creator?.deliverables?.video_posted || 'Não',
        dataHoraVisita: creator?.deliverables?.visit_datetime,
        dataHoraPostagem: creator?.deliverables?.post_datetime,
        quantidadeConvidados: creator?.deliverables?.guest_quantity,
        videoInstagramLink: creator?.video_instagram_link,
        videoTiktokLink: creator?.video_tiktok_link
      });
    }
    
    return slots;
  }
  
  private static async validateCampaignIntegrity(campaignId: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    // Buscar dados da campanha
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('quantidade_criadores')
      .eq('id', campaignId)
      .single();
    
    // Contar criadores reais
    const { count } = await supabase
      .from('campaign_creators')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .neq('status', 'Removido');
    
    const errors: string[] = [];
    const realCount = count || 0;
    const expectedCount = campaign?.quantidade_criadores || 0;
    
    if (realCount !== expectedCount) {
      errors.push(`Inconsistência: esperado ${expectedCount} criadores, encontrado ${realCount}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  private static async autoFixCampaign(campaignId: string): Promise<void> {
    console.log('🛠️ Auto-corrigindo campanha:', campaignId);

    try {
      // Usar função SQL de correção
      const { data, error } = await supabase.rpc('fix_campaign_integrity', {
        p_campaign_id: campaignId
      });

      if (error) {
        console.error('❌ Erro na auto-correção:', error);
        throw error;
      }

      console.log('✅ Campanha auto-corrigida:', data);

      // Se houve correção, registrar no audit log adicional
      if (data?.fixed) {
        console.log(`📊 Correção aplicada: ${data.oldQuantidade} → ${data.newQuantidade} (${data.criadoresReais} criadores reais)`);
      }

    } catch (error) {
      console.error('❌ Falha na auto-correção:', error);
      // Não propagar o erro para não quebrar o fluxo principal
    }
  }

  // Método público para auto-correção manual
  static async fixCampaign(campaignId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('fix_campaign_integrity', {
        p_campaign_id: campaignId
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}
