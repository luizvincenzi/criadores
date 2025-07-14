/**
 * SISTEMA HÍBRIDO DE IDs ÚNICOS
 * Interfaces TypeScript para o novo sistema de identificadores únicos
 */

// ==========================================
// TIPOS BASE DO SISTEMA HÍBRIDO
// ==========================================

export type EntityId = string; // Formato: bus_[timestamp]_[random]_[nome] ou crt_[timestamp]_[random]_[nome]
export type CampaignId = string; // Formato: camp_[timestamp]_[index]_[business]_[mes]_[creator]

export interface BaseEntity {
  id: string; // ID interno do sistema (compatibilidade)
  nome: string; // Nome da entidade
  row?: number; // Linha na planilha (para atualizações)
}

// ==========================================
// BUSINESS COM SISTEMA HÍBRIDO
// ==========================================

export interface HybridBusiness extends BaseEntity {
  // CHAVE PRIMÁRIA
  businessId: EntityId; // Coluna R - ID único do business
  
  // DADOS PRINCIPAIS
  nome: string; // A - Nome
  categoria: string; // B - Categoria
  planoAtual: string; // C - Plano atual
  comercial: string; // D - Comercial
  nomeResponsavel: string; // E - Nome Responsável
  cidade: string; // F - Cidade
  whatsappResponsavel: string; // G - WhatsApp Responsável
  prospeccao: string; // H - Prospecção
  responsavel: string; // I - Responsável
  instagram: string; // J - Instagram
  grupoWhatsappCriado: string; // K - Grupo WhatsApp criado
  contratoAssinadoEnviado: string; // L - Contrato assinado e enviado
  dataAssinaturaContrato: string; // M - Data assinatura do contrato
  contratoValidoAte: string; // N - Contrato válido até
  relatedFiles: string; // O - Related files
  notes: string; // P - Notes
  quantidadeCriadores: string; // Q - Quantidade de criadores
  
  // METADADOS
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// CREATOR COM SISTEMA HÍBRIDO
// ==========================================

export interface HybridCreator extends BaseEntity {
  // CHAVE PRIMÁRIA
  criadorId: EntityId; // Coluna V - ID único do criador
  
  // DADOS PRINCIPAIS
  nome: string; // A - Nome
  status: string; // B - Status
  whatsapp: string; // C - WhatsApp
  cidade: string; // D - Cidade
  prospeccao: string; // E - Prospecção
  responsavel: string; // F - Responsável
  instagram: string; // G - Instagram
  seguidoresInstagram: string; // H - Seguidores instagram
  tiktok: string; // I - TikTok
  seguidoresTiktok: string; // J - Seguidores TikTok
  onboardingInicial: string; // K - Onboarding Inicial
  startDate: string; // L - Start date
  endDate: string; // M - End date
  relatedFiles: string; // N - Related files
  notes: string; // O - Notes
  perfil: string; // P - Perfil
  preferencias: string; // Q - Preferências
  naoAceita: string; // R - Não aceita
  descricaoCriador: string; // S - Descrição do criador
  biografia: string; // T - Biografia
  categoria: string; // U - Categoria
  
  // CAMPOS CALCULADOS
  seguidores: number;
  engajamento: number;
  
  // METADADOS
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// CAMPAIGN COM SISTEMA HÍBRIDO
// ==========================================

export interface HybridCampaign extends BaseEntity {
  // CHAVE PRIMÁRIA
  campaignId: CampaignId; // A - Campaign_ID único
  
  // CHAVES ESTRANGEIRAS
  businessId?: EntityId; // Referência ao business (futuro)
  criadorId?: EntityId; // Referência ao criador (futuro)
  
  // DADOS PRINCIPAIS
  nomeCampanha: string; // B - Nome Campanha (Business)
  influenciador: string; // C - Influenciador
  responsavel: string; // D - Responsável
  status: string; // E - Status
  mes: string; // F - Mês
  fim: string; // G - FIM
  briefingCompleto: string; // H - Briefing completo
  dataHoraVisita: string; // I - Data e hora Visita
  quantidadeConvidados: string; // J - Quantidade de convidados
  visitaConfirmado: string; // K - Visita Confirmado
  dataHoraPostagem: string; // L - Data e hora da Postagem
  videoAprovado: string; // M - Vídeo aprovado?
  videoPostado: string; // N - Video/Reels postado?
  linkVideoInstagram: string; // O - Link Video Instagram
  notas: string; // P - Notas
  arquivo: string; // Q - Arquivo
  avaliacaoRestaurante: string; // R - Avaliação Restaurante
  avaliacaoInfluenciador: string; // S - Avaliação Influenciador
  statusCalendario: string; // T - Status do Calendário
  
  // METADADOS
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// INTERFACES DE BUSCA HÍBRIDA
// ==========================================

export interface HybridSearchResult<T> {
  found: boolean;
  entity?: T;
  searchMethod: 'id' | 'name' | 'hybrid';
  rowIndex?: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface HybridSearchOptions {
  preferIds: boolean; // Preferir busca por IDs
  fallbackToName: boolean; // Fallback para busca por nome
  caseSensitive: boolean; // Busca case-sensitive
  partialMatch: boolean; // Permitir correspondência parcial
}

// ==========================================
// INTERFACES DE RELACIONAMENTO
// ==========================================

export interface BusinessCreatorRelation {
  businessId: EntityId;
  businessName: string;
  criadorId: EntityId;
  creatorName: string;
  relationshipType: 'campaign' | 'contract' | 'collaboration';
  status: 'active' | 'inactive' | 'completed';
  startDate?: string;
  endDate?: string;
}

export interface CampaignRelations {
  campaignId: CampaignId;
  business: HybridBusiness;
  creator: HybridCreator;
  relatedCampaigns?: HybridCampaign[];
}

// ==========================================
// INTERFACES DE AUDITORIA HÍBRIDA
// ==========================================

export interface HybridAuditLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: 'business' | 'creator' | 'campaign';
  entityId: EntityId | CampaignId;
  entityName: string;
  userId: string;
  userName: string;
  oldValue?: any;
  newValue?: any;
  searchMethod?: 'id' | 'name' | 'hybrid';
  confidence?: 'high' | 'medium' | 'low';
  details: string;
}

// ==========================================
// INTERFACES DE SISTEMA
// ==========================================

export interface SystemIntegrity {
  businessIdCoverage: number; // Percentual de businesses com ID
  creatorIdCoverage: number; // Percentual de creators com ID
  campaignIdCoverage: number; // Percentual de campanhas com ID
  relationshipIntegrity: number; // Integridade dos relacionamentos
  overallScore: number; // Score geral do sistema
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
  recommendations: string[];
}

export interface MigrationResult {
  businessesMigrated: number;
  creatorsMigrated: number;
  campaignsMigrated: number;
  errors: string[];
  warnings: string[];
  success: boolean;
}

// ==========================================
// INTERFACES DE API
// ==========================================

export interface HybridApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  searchMethod?: 'id' | 'name' | 'hybrid';
  confidence?: 'high' | 'medium' | 'low';
  systemReady?: boolean;
  recommendations?: string[];
}

export interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    entity: string;
    error: string;
  }>;
  warnings: string[];
}

// ==========================================
// TIPOS UTILITÁRIOS
// ==========================================

export type EntityType = 'business' | 'creator' | 'campaign';
export type SearchStrategy = 'id_first' | 'name_first' | 'hybrid' | 'id_only' | 'name_only';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Helpers para type safety
export const isBusinessId = (id: string): boolean => id.startsWith('bus_');
export const isCreatorId = (id: string): boolean => id.startsWith('crt_');
export const isCampaignId = (id: string): boolean => id.startsWith('camp_');

export const getEntityTypeFromId = (id: string): EntityType | null => {
  if (isBusinessId(id)) return 'business';
  if (isCreatorId(id)) return 'creator';
  if (isCampaignId(id)) return 'campaign';
  return null;
};
