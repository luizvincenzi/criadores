/**
 * Utilitários para padronização de meses
 * Formato padrão: "MMM YY" (ex: jul 25, ago 25)
 */

// Mapeamento de meses em português
const monthNames = {
  1: 'jan', 2: 'fev', 3: 'mar', 4: 'abr',
  5: 'mai', 6: 'jun', 7: 'jul', 8: 'ago',
  9: 'set', 10: 'out', 11: 'nov', 12: 'dez'
};

const monthNamesReverse = {
  'jan': 1, 'fev': 2, 'mar': 3, 'abr': 4,
  'mai': 5, 'jun': 6, 'jul': 7, 'ago': 8,
  'set': 9, 'out': 10, 'nov': 11, 'dez': 12
};

/**
 * Converte qualquer formato de mês para o formato padrão "MMM YY"
 */
export function standardizeMonth(input: string | null | undefined): string {
  if (!input) return getCurrentMonth();

  const inputStr = input.toString().trim().toLowerCase();

  // Já está no formato padrão
  if (/^[a-z]{3} \d{2}$/.test(inputStr)) {
    return inputStr;
  }

  // Formato ISO: 2025-07
  const isoMatch = inputStr.match(/^(\d{4})-(\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1]);
    const month = parseInt(isoMatch[2]);
    const yearShort = year.toString().slice(-2);
    return `${monthNames[month]} ${yearShort}`;
  }

  // Português com barra: julho/2025
  const slashMatch = inputStr.match(/^([a-záêç]+)\/(\d{4})$/);
  if (slashMatch) {
    const monthName = slashMatch[1];
    const year = parseInt(slashMatch[2]);
    const yearShort = year.toString().slice(-2);
    const monthNum = getMonthNumberFromName(monthName);
    if (monthNum) {
      return `${monthNames[monthNum]} ${yearShort}`;
    }
  }

  // Português extenso: julho de 2025
  const extensiveMatch = inputStr.match(/^([a-záêç]+)\s+de\s+(\d{4})$/);
  if (extensiveMatch) {
    const monthName = extensiveMatch[1];
    const year = parseInt(extensiveMatch[2]);
    const yearShort = year.toString().slice(-2);
    const monthNum = getMonthNumberFromName(monthName);
    if (monthNum) {
      return `${monthNames[monthNum]} ${yearShort}`;
    }
  }

  // Abreviado inglês: Jun, Jul, etc (assumir ano atual)
  const englishMatch = inputStr.match(/^([a-z]{3})$/i);
  if (englishMatch) {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const monthMap: { [key: string]: string } = {
      'jan': 'jan', 'feb': 'fev', 'mar': 'mar', 'apr': 'abr',
      'may': 'mai', 'jun': 'jun', 'jul': 'jul', 'aug': 'ago',
      'sep': 'set', 'oct': 'out', 'nov': 'nov', 'dec': 'dez'
    };
    const standardMonth = monthMap[englishMatch[1].toLowerCase()];
    if (standardMonth) {
      return `${standardMonth} ${currentYear}`;
    }
  }

  // Fallback: mês atual
  console.warn(`Formato de mês não reconhecido: "${input}". Usando mês atual.`);
  return getCurrentMonth();
}

/**
 * Retorna o mês atual no formato padrão
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear().toString().slice(-2);
  return `${monthNames[month]} ${year}`;
}

/**
 * Converte nome do mês em português para número
 */
function getMonthNumberFromName(monthName: string): number | null {
  const normalized = monthName.toLowerCase().trim();
  
  const monthMap: { [key: string]: number } = {
    'janeiro': 1, 'jan': 1,
    'fevereiro': 2, 'fev': 2,
    'março': 3, 'mar': 3,
    'abril': 4, 'abr': 4,
    'maio': 5, 'mai': 5,
    'junho': 6, 'jun': 6,
    'julho': 7, 'jul': 7,
    'agosto': 8, 'ago': 8,
    'setembro': 9, 'set': 9,
    'outubro': 10, 'out': 10,
    'novembro': 11, 'nov': 11,
    'dezembro': 12, 'dez': 12
  };

  return monthMap[normalized] || null;
}

/**
 * Converte formato padrão para Date object (primeiro dia do mês)
 */
export function monthToDate(month: string): Date {
  const match = month.match(/^([a-z]{3}) (\d{2})$/);
  if (!match) {
    throw new Error(`Formato de mês inválido: ${month}`);
  }

  const monthName = match[1];
  const yearShort = parseInt(match[2]);
  const year = yearShort < 50 ? 2000 + yearShort : 1900 + yearShort; // Y2K handling
  const monthNum = monthNamesReverse[monthName];

  if (!monthNum) {
    throw new Error(`Mês não reconhecido: ${monthName}`);
  }

  return new Date(year, monthNum - 1, 1);
}

/**
 * Gera lista de meses para seleção (próximos 12 meses)
 */
export function getMonthOptions(): Array<{ value: string; label: string }> {
  const options = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const yearShort = year.toString().slice(-2);
    const value = `${monthNames[month]} ${yearShort}`;
    const label = `${monthNames[month].toUpperCase()} ${year}`;
    
    options.push({ value, label });
  }
  
  return options;
}

/**
 * Valida se o formato do mês está correto
 */
export function isValidMonthFormat(month: string): boolean {
  return /^[a-z]{3} \d{2}$/.test(month);
}
