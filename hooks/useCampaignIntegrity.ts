import { useState, useEffect, useCallback } from 'react';

interface IntegrityStatus {
  isValid: boolean;
  needsFix: boolean;
  errors: string[];
  lastCheck: Date | null;
  autoFixEnabled: boolean;
}

interface IntegrityHookReturn {
  status: IntegrityStatus;
  checkIntegrity: (campaignId?: string) => Promise<void>;
  autoFix: (campaignId?: string) => Promise<boolean>;
  enableAutoFix: () => void;
  disableAutoFix: () => void;
}

export const useCampaignIntegrity = (
  campaignId?: string,
  autoCheckInterval: number = 30000 // 30 segundos
): IntegrityHookReturn => {
  
  const [status, setStatus] = useState<IntegrityStatus>({
    isValid: true,
    needsFix: false,
    errors: [],
    lastCheck: null,
    autoFixEnabled: true
  });

  // Verificar integridade
  const checkIntegrity = useCallback(async (targetCampaignId?: string) => {
    try {
      const checkId = targetCampaignId || campaignId;
      const url = checkId 
        ? `/api/system/auto-fix?campaignId=${checkId}`
        : '/api/system/auto-fix';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        if (checkId) {
          // Verificação específica de campanha
          setStatus(prev => ({
            ...prev,
            isValid: !data.needsFix,
            needsFix: data.needsFix,
            errors: data.needsFix ? [`Inconsistência detectada: esperado ${data.details.expectedCount}, encontrado ${data.details.actualCount}`] : [],
            lastCheck: new Date()
          }));
        } else {
          // Verificação geral do sistema
          const validation = data.validation;
          setStatus(prev => ({
            ...prev,
            isValid: validation.is_valid,
            needsFix: !validation.is_valid,
            errors: validation.is_valid ? [] : ['Sistema com inconsistências detectadas'],
            lastCheck: new Date()
          }));
        }
      } else {
        setStatus(prev => ({
          ...prev,
          errors: [data.error || 'Erro na verificação'],
          lastCheck: new Date()
        }));
      }
    } catch (error) {
      console.error('❌ Erro na verificação de integridade:', error);
      setStatus(prev => ({
        ...prev,
        errors: ['Erro na comunicação com o servidor'],
        lastCheck: new Date()
      }));
    }
  }, [campaignId]);

  // Auto-correção
  const autoFix = useCallback(async (targetCampaignId?: string): Promise<boolean> => {
    try {
      const fixId = targetCampaignId || campaignId;
      
      const response = await fetch('/api/system/auto-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignId: fixId,
          userEmail: 'usuario@auto-correcao.com'
        })
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Auto-correção aplicada:', data.message);
        
        // Verificar novamente após correção
        await checkIntegrity(fixId);
        
        return true;
      } else {
        console.error('❌ Falha na auto-correção:', data.error);
        setStatus(prev => ({
          ...prev,
          errors: [...prev.errors, `Auto-correção falhou: ${data.error}`]
        }));
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na auto-correção:', error);
      return false;
    }
  }, [campaignId, checkIntegrity]);

  // Controles de auto-fix
  const enableAutoFix = useCallback(() => {
    setStatus(prev => ({ ...prev, autoFixEnabled: true }));
  }, []);

  const disableAutoFix = useCallback(() => {
    setStatus(prev => ({ ...prev, autoFixEnabled: false }));
  }, []);

  // Auto-correção automática quando detectar problemas
  useEffect(() => {
    if (status.needsFix && status.autoFixEnabled && status.errors.length > 0) {
      console.log('🛠️ Aplicando auto-correção automática...');
      autoFix();
    }
  }, [status.needsFix, status.autoFixEnabled, status.errors.length, autoFix]);

  // Verificação periódica
  useEffect(() => {
    if (autoCheckInterval > 0) {
      const interval = setInterval(() => {
        checkIntegrity();
      }, autoCheckInterval);

      // Verificação inicial
      checkIntegrity();

      return () => clearInterval(interval);
    }
  }, [checkIntegrity, autoCheckInterval]);

  return {
    status,
    checkIntegrity,
    autoFix,
    enableAutoFix,
    disableAutoFix
  };
};

// Hook simplificado para uso em componentes
export const useAutoFix = (campaignId?: string) => {
  const { status, autoFix } = useCampaignIntegrity(campaignId, 0); // Sem verificação automática
  
  return {
    isValid: status.isValid,
    needsFix: status.needsFix,
    errors: status.errors,
    fix: () => autoFix(campaignId)
  };
};
