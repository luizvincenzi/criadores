import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Creator {
  name: string;
  username: string;
  followers: number;
  engagementRate: number;
  avatar?: string;
}

export interface Campaign {
  title: string;
  status: 'Ativa' | 'Planejamento' | 'Finalizada' | 'Pausada';
  startDate: string;
  endDate: string;
}

export interface Business {
  id: string;
  businessName: string;
  categoria: string;
  plano: string;
  descricao: string;
  responsavel: string;
  whatsapp: string;
  email: string;
  observacoes: string;
  dataInicio: string;
  dataFim: string;
  row: number; // Linha na planilha
  journeyStage: 'Agendamentos' | 'Reunião Briefing' | 'Entrega Final' | 'Proposta' | 'Negociação' | 'Fechamento' | 'Pós-venda' | 'Perdido' | 'Pausado';
  nextAction: string;
  contactDate: string;
  value: number;
  description: string;
  creators: Creator[];
  campaigns: Campaign[];
  lastUpdate?: string;
  priority?: 'low' | 'medium' | 'high';
  avatar?: string;
}

interface BusinessState {
  businesses: Business[];
  loading: boolean;
  error: string | null;

  // Actions
  addBusiness: (business: Omit<Business, 'id'>) => void;
  updateBusiness: (id: string, updates: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  moveBusinessStage: (id: string, newStage: Business['journeyStage']) => void;
  setBusinesses: (businesses: Business[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadBusinessesFromSheet: () => Promise<void>;
  createBusinessFromName: (name: string) => Business;

  // Getters
  getBusinessById: (id: string) => Business | undefined;
  getBusinessesByStage: (stage: Business['journeyStage']) => Business[];
  getTotalValue: () => number;
  getStats: () => {
    total: number;
    byStage: Record<string, number>;
    totalValue: number;
    conversionRate: number;
  };
}

// Mock data
const mockBusinesses: Business[] = [
  {
    id: '1',
    businessName: 'Loja de Roupas Fashion',
    journeyStage: 'Agendamentos',
    nextAction: 'Agendar sessões de fotos com influenciadores',
    contactDate: '2024-01-15',
    value: 15000,
    description: 'Campanha de verão focada em roupas casuais para jovens de 18-30 anos',
    creators: [
      { name: 'Ana Silva', username: 'anasilva', followers: 125000, engagementRate: 4.2 },
      { name: 'Carlos Santos', username: 'carlossantos', followers: 89000, engagementRate: 6.8 }
    ],
    campaigns: [
      { title: 'Campanha Verão 2024', status: 'Ativa', startDate: '2024-01-15', endDate: '2024-03-15' }
    ],
    lastUpdate: 'Hoje',
    priority: 'high'
  },
  {
    id: '2',
    businessName: 'Restaurante Gourmet',
    journeyStage: 'Reunião Briefing',
    nextAction: 'Definir estratégia de conteúdo gastronômico',
    contactDate: '2024-01-10',
    value: 8000,
    description: 'Divulgação de pratos especiais e experiência gastronômica única',
    creators: [
      { name: 'Maria Oliveira', username: 'mariaoliveira', followers: 234000, engagementRate: 3.1 }
    ],
    campaigns: [],
    lastUpdate: 'Ontem',
    priority: 'medium'
  },
  {
    id: '3',
    businessName: 'Academia Fitness Plus',
    journeyStage: 'Entrega Final',
    nextAction: 'Finalizar edição dos vídeos de treino',
    contactDate: '2024-01-20',
    value: 25000,
    description: 'Campanha de motivação fitness com foco em resultados reais',
    creators: [
      { name: 'João Fitness', username: 'joaofitness', followers: 156000, engagementRate: 5.4 },
      { name: 'Carla Strong', username: 'carlastrong', followers: 98000, engagementRate: 7.2 },
      { name: 'Pedro Muscle', username: 'pedromuscle', followers: 67000, engagementRate: 4.8 }
    ],
    campaigns: [
      { title: 'Transformação 90 Dias', status: 'Ativa', startDate: '2024-01-01', endDate: '2024-03-31' }
    ],
    lastUpdate: 'Hoje',
    priority: 'high'
  },
  {
    id: '4',
    businessName: 'Clínica de Estética',
    journeyStage: 'Reunião Briefing',
    nextAction: 'Alinhar diretrizes de comunicação sobre procedimentos',
    contactDate: '2024-01-12',
    value: 12000,
    description: 'Divulgação de tratamentos estéticos com foco em naturalidade',
    creators: [
      { name: 'Bella Beauty', username: 'bellabeauty', followers: 189000, engagementRate: 6.1 }
    ],
    campaigns: [],
    lastUpdate: '2 dias atrás',
    priority: 'medium'
  },
  {
    id: '5',
    businessName: 'Loja de Eletrônicos',
    journeyStage: 'Agendamentos',
    nextAction: 'Coordenar reviews de produtos com tech creators',
    contactDate: '2024-01-08',
    value: 18000,
    description: 'Reviews autênticos de gadgets e eletrônicos inovadores',
    creators: [
      { name: 'Tech Master', username: 'techmaster', followers: 145000, engagementRate: 5.9 },
      { name: 'Gamer Pro', username: 'gamerpro', followers: 203000, engagementRate: 4.5 }
    ],
    campaigns: [
      { title: 'Tech Reviews 2024', status: 'Planejamento', startDate: '2024-02-01', endDate: '2024-04-30' }
    ],
    lastUpdate: 'Hoje',
    priority: 'medium'
  }
];

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set, get) => ({
      businesses: mockBusinesses,
      loading: false,
      error: null,

      addBusiness: (business) => {
        const newBusiness: Business = {
          ...business,
          id: Date.now().toString(),
          lastUpdate: 'Agora'
        };
        set((state) => ({
          businesses: [...state.businesses, newBusiness]
        }));

        // Registra a criação no log de auditoria
        import('@/app/actions/sheetsActions').then(({ logAction }) => {
          import('@/store/authStore').then(({ useAuthStore }) => {
            const authStore = useAuthStore.getState();
            if (authStore.user) {
              logAction({
                action: 'business_created',
                entity_type: 'business',
                entity_id: newBusiness.id,
                entity_name: newBusiness.businessName,
                user_id: authStore.user.id,
                user_name: authStore.user.name,
                details: `Novo negócio criado: ${newBusiness.businessName}`
              }).catch(error => {
                console.error('Erro ao registrar log de auditoria:', error);
              });
            }
          });
        });
      },

      updateBusiness: (id, updates) => {
        set((state) => ({
          businesses: state.businesses.map((business) =>
            business.id === id
              ? { ...business, ...updates, lastUpdate: 'Agora' }
              : business
          )
        }));
      },

      deleteBusiness: (id) => {
        set((state) => ({
          businesses: state.businesses.filter((business) => business.id !== id)
        }));
      },

      moveBusinessStage: async (id, newStage) => {
        const currentBusiness = get().businesses.find(b => b.id === id);
        if (currentBusiness) {
          const oldStage = currentBusiness.journeyStage;

          // Valida se são status válidos do Kanban
          const validStages = ['Reunião Briefing', 'Agendamentos', 'Entrega Final'];
          if (!validStages.includes(oldStage) || !validStages.includes(newStage)) {
            console.error(`❌ Status inválido: "${oldStage}" → "${newStage}". Apenas permitidos: ${validStages.join(', ')}`);
            return;
          }

          console.log(`📦 Store: Movendo "${currentBusiness.businessName}" de "${oldStage}" para "${newStage}"`);
          get().updateBusiness(id, { journeyStage: newStage });
          console.log(`✅ Store: Negócio atualizado com sucesso`);

          // Registra a mudança no log de auditoria APENAS para mudanças de status do Kanban
          try {
            const { logAction } = await import('@/app/actions/sheetsActions');
            const { useAuthStore } = await import('@/store/authStore');

            const authStore = useAuthStore.getState();
            if (authStore.user) {
              await logAction({
                action: 'business_stage_changed',
                entity_type: 'business',
                entity_id: id,
                entity_name: currentBusiness.businessName,
                old_value: '', // Vazio - não usado para status
                new_value: '', // Vazio - não usado para status
                old_value_status: oldStage, // Status anterior do Kanban
                new_value_status: newStage, // Status atual do Kanban
                user_id: authStore.user.id,
                user_name: authStore.user.name,
                details: `Negócio movido de "${oldStage}" para "${newStage}" via Kanban`
              });

              console.log(`📊 Audit_Log: Mudança de status registrada para "${currentBusiness.businessName}" (${oldStage} → ${newStage})`);
            }
          } catch (error) {
            console.error('❌ Erro ao registrar mudança no Audit_Log:', error);
          }
        } else {
          console.error(`❌ Store: Negócio com ID ${id} não encontrado`);
        }
      },

      setBusinesses: (businesses) => {
        set({ businesses });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      setError: (error) => {
        set({ error });
      },

      loadBusinessesFromSheet: async () => {
        set({ loading: true, error: null });
        try {
          // Usar sistema de data source (Supabase ou Google Sheets)
          const { fetchBusinesses, isUsingSupabase } = await import('@/lib/dataSource');

          console.log(`📊 Carregando negócios do ${isUsingSupabase() ? 'Supabase' : 'Google Sheets'}...`);

          if (isUsingSupabase()) {
            // Usar dados do Supabase
            const businessesData = await fetchBusinesses();

            // Transformar dados do Supabase para formato do store
            const transformedBusinesses: Business[] = businessesData.map((business: any) => ({
              id: business.id,
              businessName: business.name,
              categoria: business.category || '',
              plano: business.current_plan || '',
              descricao: business.description || '',
              responsavel: business.contact_info?.responsible_name || '',
              whatsapp: business.contact_info?.whatsapp || '',
              email: business.contact_info?.email || '',
              observacoes: business.notes || '',
              dataInicio: business.created_at || '',
              dataFim: '',
              row: 0, // Não aplicável no Supabase
              journeyStage: business.status as Business['journeyStage'] || 'Reunião Briefing',
              nextAction: '',
              contactDate: '',
              value: 0,
              description: business.description || '',
              creators: [],
              campaigns: [],
              lastUpdate: business.updated_at,
              priority: 'medium'
            }));

            set({ businesses: transformedBusinesses, loading: false });
            console.log(`✅ ${transformedBusinesses.length} negócios carregados do Supabase`);

          } else {
            // Usar dados do Google Sheets (código original)
            const { getBusinessesData, createAuditLogSheet, getLatestBusinessStatuses } = await import('@/app/actions/sheetsActions');

            // Garante que a aba de auditoria existe
            await createAuditLogSheet();

            // Busca todos os dados dos negócios
            const businessesData = await getBusinessesData();

            // Busca os status mais recentes do Audit_Log
            const latestStatuses = await getLatestBusinessStatuses();

            if (businessesData.length > 0) {
            const businesses: Business[] = businessesData.map((data) => {
              // Converte os dados da planilha para o formato do Business
              const business: Business = {
                id: data.id,
                businessName: data.nome,
                categoria: data.categoria,
                plano: data.planoAtual || data.plano, // Usar planoAtual da nova estrutura
                descricao: data.notes || data.descricao, // Usar notes da nova estrutura
                responsavel: data.responsavel,
                whatsapp: data.whatsappResponsavel || data.whatsapp, // Usar whatsappResponsavel da nova estrutura
                email: data.email || '', // Email não está na nova estrutura
                observacoes: data.notes || data.observacoes, // Usar notes da nova estrutura
                dataInicio: data.dataAssinaturaContrato || data.dataInicio, // Usar dataAssinaturaContrato
                dataFim: data.contratoValidoAte || data.dataFim, // Usar contratoValidoAte
                row: data.row,
                value: parseFloat((data.comercial || data.valor || '0').toString().replace(/[^\d,]/g, '').replace(',', '.')) || 0,
                journeyStage: 'Reunião Briefing', // Padrão, será atualizado pelo Audit_Log
                nextAction: 'Aguardando próximos passos',
                contactDate: new Date().toISOString().split('T')[0],
                creators: [],
                campaigns: [],
                lastUpdate: 'Agora',
                priority: 'medium',
                // Adicionar campos da nova estrutura como propriedades extras
                cidade: data.cidade,
                nomeResponsavel: data.nomeResponsavel,
                prospeccao: data.prospeccao,
                instagram: data.instagram,
                grupoWhatsappCriado: data.grupoWhatsappCriado,
                contratoAssinadoEnviado: data.contratoAssinadoEnviado,
                dataAssinaturaContrato: data.dataAssinaturaContrato,
                contratoValidoAte: data.contratoValidoAte,
                relatedFiles: data.relatedFiles,
                comercial: data.comercial
              } as Business & any; // Usar any para permitir campos extras

              // Atualiza o status com base no Audit_Log se disponível
              const latestStatus = latestStatuses[data.nome.trim()];
              if (latestStatus) {
                console.log(`🔄 Atualizando "${data.nome}" para status "${latestStatus}" baseado no Audit_Log`);
                business.journeyStage = latestStatus as Business['journeyStage'];
              }

              return business;
            });

            set({ businesses, loading: false });

            console.log(`✅ ${businessesData.length} negócios carregados com dados completos da planilha`);

            // Registra a sincronização no log
            import('@/app/actions/sheetsActions').then(({ logAction }) => {
              import('@/store/authStore').then(({ useAuthStore }) => {
                const authStore = useAuthStore.getState();
                if (authStore.user) {
                  logAction({
                    action: 'data_sync',
                    entity_type: 'system',
                    entity_id: 'sync_' + Date.now(),
                    entity_name: 'Google Sheets',
                    user_id: authStore.user.id,
                    user_name: authStore.user.name,
                    details: `Sincronização de ${businessesData.length} negócios com dados completos`
                  }).catch(error => {
                    console.error('Erro ao registrar log de auditoria:', error);
                  });
                }
              });
            });
            } else {
              // Se não conseguir carregar da planilha, mantém os dados mock
              set({ loading: false });
            }
          }
        } catch (error) {
          console.error('Erro ao carregar negócios:', error);
          set({ error: 'Erro ao carregar dados', loading: false });
        }
      },

      createBusinessFromName: (name: string): Business => {
        // Usar hash do nome para gerar dados consistentes
        const nameHash = name.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);

        const stages: Business['journeyStage'][] = ['Reunião Briefing', 'Agendamentos', 'Entrega Final'];
        const stageIndex = Math.abs(nameHash) % stages.length;
        const value = 5000 + (Math.abs(nameHash) % 45000);
        const creatorsCount = 1 + (Math.abs(nameHash) % 4);

        return {
          id: `sheet-${Math.abs(nameHash)}`,
          businessName: name,
          journeyStage: stages[stageIndex],
          nextAction: `Definir próximos passos para ${name}`,
          contactDate: '2024-01-15',
          value: value,
          description: `Projeto de marketing digital para ${name}`,
          creators: Array.from({ length: creatorsCount }, (_, i) => ({
            name: `Criador ${i + 1}`,
            username: `criador${i + 1}`,
            followers: 10000 + (Math.abs(nameHash + i) % 190000),
            engagementRate: Math.round(((Math.abs(nameHash + i) % 60) + 20) / 10) / 10
          })),
          campaigns: [],
          lastUpdate: 'Hoje',
          priority: Math.abs(nameHash) % 2 === 0 ? 'high' : 'medium'
        };
      },

      getBusinessById: (id) => {
        return get().businesses.find((business) => business.id === id);
      },

      getBusinessesByStage: (stage) => {
        return get().businesses.filter((business) => business.journeyStage === stage);
      },

      getTotalValue: () => {
        return get().businesses.reduce((total, business) => total + business.value, 0);
      },

      getStats: () => {
        const businesses = get().businesses;
        const total = businesses.length;
        const byStage = businesses.reduce((acc, business) => {
          acc[business.journeyStage] = (acc[business.journeyStage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const totalValue = get().getTotalValue();
        const finalized = byStage['Entrega Final'] || 0;
        const conversionRate = total > 0 ? Math.round((finalized / total) * 100) : 0;

        return {
          total,
          byStage,
          totalValue,
          conversionRate
        };
      },

      // Nova função para atualizar status baseado no Audit_Log
      updateStatusesFromAuditLog: async () => {
        try {
          const { getLatestBusinessStatuses } = await import('@/app/actions/sheetsActions');
          const latestStatuses = await getLatestBusinessStatuses();

          const currentBusinesses = get().businesses;
          let updatedCount = 0;

          const updatedBusinesses = currentBusinesses.map(business => {
            const latestStatus = latestStatuses[business.businessName.trim()];

            if (latestStatus && latestStatus !== business.journeyStage) {
              console.log(`🔄 Atualizando "${business.businessName}" de "${business.journeyStage}" para "${latestStatus}"`);
              updatedCount++;
              return {
                ...business,
                journeyStage: latestStatus as Business['journeyStage'],
                lastUpdate: 'Agora'
              };
            }

            return business;
          });

          if (updatedCount > 0) {
            set({ businesses: updatedBusinesses });
            console.log(`✅ ${updatedCount} negócios atualizados com base no Audit_Log`);
          } else {
            console.log('ℹ️ Nenhum negócio precisou ser atualizado');
          }

          return updatedCount;
        } catch (error) {
          console.error('❌ Erro ao atualizar status do Audit_Log:', error);
          return 0;
        }
      }
    }),
    {
      name: 'business-storage',
      partialize: (state) => ({ 
        businesses: state.businesses 
      }),
    }
  )
);
