/**
 * Utilitários para trabalhar com month_year_id
 * Formato: YYYYMM (ex: 202507 = Julho 2025)
 */

export interface MonthOption {
  id: number;           // 202507
  value: string;        // "jul 25" (para compatibilidade)
  label: string;        // "Julho de 2025"
  shortLabel: string;   // "Jul 25"
}

/**
 * Converte month_year_id para formato display
 * @param monthYearId - 202507
 * @returns "Julho de 2025"
 */
export function formatMonthDisplay(monthYearId: number): string {
  const year = Math.floor(monthYearId / 100);
  const month = monthYearId % 100;
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  if (month < 1 || month > 12) {
    return 'Mês Inválido';
  }
  
  return `${monthNames[month - 1]} de ${year}`;
}

/**
 * Converte month_year_id para formato curto
 * @param monthYearId - 202507
 * @returns "Jul 25"
 */
export function formatMonthShort(monthYearId: number): string {
  const year = Math.floor(monthYearId / 100);
  const month = monthYearId % 100;
  
  const monthShort = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];
  
  if (month < 1 || month > 12) {
    return 'inv 00';
  }
  
  const yearShort = year.toString().slice(-2);
  return `${monthShort[month - 1]} ${yearShort}`;
}

/**
 * Converte string de mês para month_year_id
 * @param monthStr - "jul 25", "Julho de 2025", "2025-07"
 * @returns 202507
 */
export function parseMonthToId(monthStr: string): number {
  if (!monthStr) return getCurrentMonthId();
  
  // Formato YYYY-MM
  if (/^\d{4}-\d{2}$/.test(monthStr)) {
    const [year, month] = monthStr.split('-').map(Number);
    return year * 100 + month;
  }
  
  // Formato "MMM YY" (jul 25)
  if (/^[a-z]{3} \d{2}$/.test(monthStr)) {
    const [monthName, yearShort] = monthStr.split(' ');
    const year = 2000 + parseInt(yearShort);
    const month = getMonthNumber(monthName);
    return year * 100 + month;
  }
  
  // Formato "MMM YYYY" (jul 2025)
  if (/^[a-z]{3} \d{4}$/.test(monthStr)) {
    const [monthName, yearStr] = monthStr.split(' ');
    const year = parseInt(yearStr);
    const month = getMonthNumber(monthName);
    return year * 100 + month;
  }
  
  // Formato completo "Julho de 2025"
  if (/^[A-Za-z]+ de \d{4}$/.test(monthStr)) {
    const parts = monthStr.split(' de ');
    const monthName = parts[0];
    const year = parseInt(parts[1]);
    const month = getMonthNumberFromFull(monthName);
    return year * 100 + month;
  }
  
  // Default: mês atual
  return getCurrentMonthId();
}

/**
 * Gera lista de meses disponíveis para seleção
 * @param startOffset - Quantos meses atrás começar (default: 0 = mês atual)
 * @param count - Quantos meses gerar (default: 24)
 * @returns Array de MonthOption
 */
export function generateMonthOptions(startOffset: number = 0, count: number = 24): MonthOption[] {
  const options: MonthOption[] = [];
  const currentDate = new Date();
  
  for (let i = startOffset; i < startOffset + count; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthYearId = year * 100 + month;
    
    options.push({
      id: monthYearId,
      value: formatMonthShort(monthYearId), // Para compatibilidade
      label: formatMonthDisplay(monthYearId),
      shortLabel: formatMonthShort(monthYearId)
    });
  }
  
  return options;
}

/**
 * Obtém o month_year_id do mês atual
 * @returns 202507 (exemplo)
 */
export function getCurrentMonthId(): number {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
}

/**
 * Converte nome do mês abreviado para número
 * @param monthName - "jan", "fev", etc.
 * @returns 1-12
 */
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'jan': 1, 'fev': 2, 'mar': 3, 'abr': 4, 'mai': 5, 'jun': 6,
    'jul': 7, 'ago': 8, 'set': 9, 'out': 10, 'nov': 11, 'dez': 12
  };
  
  return months[monthName.toLowerCase()] || 7; // Default julho
}

/**
 * Converte nome do mês completo para número
 * @param monthName - "Janeiro", "Fevereiro", etc.
 * @returns 1-12
 */
function getMonthNumberFromFull(monthName: string): number {
  const months: { [key: string]: number } = {
    'janeiro': 1, 'fevereiro': 2, 'março': 3, 'abril': 4, 'maio': 5, 'junho': 6,
    'julho': 7, 'agosto': 8, 'setembro': 9, 'outubro': 10, 'novembro': 11, 'dezembro': 12
  };
  
  return months[monthName.toLowerCase()] || 7; // Default julho
}

/**
 * Verifica se um month_year_id é válido
 * @param monthYearId - 202507
 * @returns boolean
 */
export function isValidMonthId(monthYearId: number): boolean {
  if (!monthYearId || monthYearId < 202001 || monthYearId > 203012) {
    return false;
  }
  
  const month = monthYearId % 100;
  return month >= 1 && month <= 12;
}

/**
 * Compara dois month_year_id
 * @param a - 202507
 * @param b - 202508
 * @returns -1, 0, 1 (para ordenação)
 */
export function compareMonthIds(a: number, b: number): number {
  return a - b;
}
