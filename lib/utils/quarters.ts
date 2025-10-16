export interface Quarter {
  value: string;
  label: string;
}

export function getCurrentQuarter(): Quarter {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11

  // Determine quarter based on month
  let quarter: number;
  if (month <= 3) quarter = 1;
  else if (month <= 6) quarter = 2;
  else if (month <= 9) quarter = 3;
  else quarter = 4;

  const value = `${year}-Q${quarter}`;
  const label = `Q${quarter} ${year}`;

  return { value, label };
}

export function generateQuarters(): Quarter[] {
  const quarters: Quarter[] = [];
  const currentYear = new Date().getFullYear();

  // Generate quarters for current year and next year
  for (let year = currentYear; year <= currentYear + 1; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      const value = `${year}-Q${quarter}`;
      const label = `Q${quarter} ${year}`;
      quarters.push({ value, label });
    }
  }

  return quarters;
}

export function formatQuarter(quarterValue: string): string {
  const [year, q] = quarterValue.split('-Q');
  return `Q${q} ${year}`;
}