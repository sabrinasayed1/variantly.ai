import { Comparison } from '@/types/comparison';

const STORAGE_KEY = 'impactcompare_comparisons';

export const saveComparison = (comparison: Comparison): void => {
  const comparisons = getComparisons();
  const existingIndex = comparisons.findIndex(c => c.id === comparison.id);
  
  if (existingIndex >= 0) {
    comparisons[existingIndex] = comparison;
  } else {
    comparisons.push(comparison);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons));
};

export const getComparisons = (): Comparison[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const getComparison = (id: string): Comparison | undefined => {
  const comparisons = getComparisons();
  return comparisons.find(c => c.id === id);
};

export const deleteComparison = (id: string): void => {
  const comparisons = getComparisons().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons));
};
