import type { DataProduct, CreditConfig } from '../types/accompany'

import { Scene } from '../types/accompany';

export const calculateAssignedAmount = (scenes: Scene[] = []): number => {
  return scenes.reduce((total: number, scene: Scene) => 
    total + (scene.allocatedAmount || 0), 
  0);
}

export const calculateProgress = (product: DataProduct): number => {
  if (!product.totalAmount) return 0;
  const totalAllocated = (product.scenes || []).reduce((sum: number, scene: Scene) => {
    return sum + (scene.allocatedAmount || 0);
  }, 0);
  return Number((totalAllocated / product.totalAmount * 100).toFixed(2));
}

export const calculateMaxAmount = (total: number, ratio: number): number => {
  if (!total || !ratio) return 0
  return Math.round(total * (ratio / 100))
}

export const formatCurrency = (amount: number): string => {
  return amount.toFixed(2)
}

export const calculateTotalRatio = (product: DataProduct): number => {
  if (!product.sceneRatios) return 0
  return Object.values(product.sceneRatios as unknown as number[]).reduce((sum: number, ratio: number) => 
    sum + (typeof ratio === 'number' ? ratio : 0), 
  0)
}

export const calculateRatio = (amount: number, total: number): number => {
  if (!total) return 0;
  return Number((amount / total * 100).toFixed(2));
}

export const calculateRemainingAmount = (scene: Scene): number => {
  return scene.totalAmount - (scene.allocatedAmount || 0);
}

export const calculateCreditProductRatio = (scene: Scene, creditProductValue: string): number => {
  const creditProduct = scene.creditProducts?.find(cp => cp.creditProductValue === creditProductValue);
  if (!creditProduct || !scene.amount) return 0;
  return Number((creditProduct.amount / scene.amount * 100).toFixed(2));
}

export const calculateDailyAmount = (count: number, days: number): number => {
  if (!days) return 0
  return Math.round(count / days)
}

export const calculateCost = (count: number, price: number, discountType: string, discountValue: number): number => {
  if (!count || !price) return 0
  const baseAmount = count * price
  if (discountType === 'none') return baseAmount
  if (discountType === 'discount') return baseAmount * (discountValue || 1)
  if (discountType === 'free') return (count - (discountValue || 0)) * price
  return baseAmount
}
