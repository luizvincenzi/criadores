/**
 * Transforma dados de array de arrays (formato do Google Sheets) 
 * em array de objetos JSON usando a primeira linha como cabeçalhos
 */
export function transformData(data: any[][]): Record<string, any>[] {
  if (!data || data.length === 0) {
    return [];
  }

  // A primeira linha contém os cabeçalhos
  const headers = data[0];
  
  // As linhas restantes contêm os dados
  const rows = data.slice(1);

  return rows.map((row) => {
    const obj: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      // Usa o cabeçalho como chave e o valor da linha correspondente
      obj[header] = row[index] || '';
    });

    return obj;
  });
}

/**
 * Converte um objeto em array de valores na ordem dos cabeçalhos fornecidos
 */
export function objectToRowData(obj: Record<string, any>, headers: string[]): any[] {
  return headers.map(header => obj[header] || '');
}

/**
 * Valida se os dados têm a estrutura esperada
 */
export function validateSheetData(data: any[][]): boolean {
  return Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);
}

/**
 * Limpa e normaliza strings vindas do Google Sheets
 */
export function cleanSheetValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  return String(value).trim();
}

/**
 * Converte valores de string para tipos apropriados
 */
export function parseSheetValue(value: string, type: 'string' | 'number' | 'boolean' | 'date' = 'string'): any {
  const cleanValue = cleanSheetValue(value);
  
  if (cleanValue === '') {
    return type === 'number' ? 0 : type === 'boolean' ? false : '';
  }

  switch (type) {
    case 'number':
      const num = parseFloat(cleanValue);
      return isNaN(num) ? 0 : num;
    
    case 'boolean':
      return cleanValue.toLowerCase() === 'true' || cleanValue === '1';
    
    case 'date':
      const date = new Date(cleanValue);
      return isNaN(date.getTime()) ? null : date;
    
    default:
      return cleanValue;
  }
}

/**
 * Formata dados para exibição
 */
export function formatDisplayValue(value: any, type: 'currency' | 'percentage' | 'date' | 'number' | 'text' = 'text'): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  switch (type) {
    case 'currency':
      const numValue = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(numValue) ? '-' : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numValue);
    
    case 'percentage':
      const pctValue = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(pctValue) ? '-' : `${pctValue.toFixed(1)}%`;
    
    case 'date':
      const date = value instanceof Date ? value : new Date(value);
      return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
    
    case 'number':
      const numberValue = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(numberValue) ? '-' : new Intl.NumberFormat('pt-BR').format(numberValue);
    
    default:
      return String(value);
  }
}
