export const calculateAssignedAmount = (scenes = []) => {
    return scenes.reduce((total, scene) => total + (scene.allocatedAmount || 0), 0);
};
export const calculateProgress = (product) => {
    if (!product.totalAmount)
        return 0;
    const totalAllocated = (product.scenes || []).reduce((sum, scene) => {
        return sum + (scene.allocatedAmount || 0);
    }, 0);
    return Number((totalAllocated / product.totalAmount * 100).toFixed(2));
};
export const calculateMaxAmount = (total, ratio) => {
    if (!total || !ratio)
        return 0;
    return Math.round(total * (ratio / 100));
};
export const formatCurrency = (amount) => {
    return amount.toFixed(2);
};
export const calculateTotalRatio = (product) => {
    if (!product.sceneRatios)
        return 0;
    return Object.values(product.sceneRatios).reduce((sum, ratio) => sum + (typeof ratio === 'number' ? ratio : 0), 0);
};
export const calculateRatio = (amount, total) => {
    if (!total)
        return 0;
    return Number((amount / total * 100).toFixed(2));
};
export const calculateRemainingAmount = (scene) => {
    return scene.totalAmount - (scene.allocatedAmount || 0);
};
export const calculateCreditProductRatio = (scene, creditProductValue) => {
    const creditProduct = scene.creditProducts?.find(cp => cp.creditProductValue === creditProductValue);
    if (!creditProduct || !scene.amount)
        return 0;
    return Number((creditProduct.amount / scene.amount * 100).toFixed(2));
};
export const formatChangeValue = (value, type) => {
    const sign = value > 0 ? '+' : '';
    const percentage = ((value / 100) * 100).toFixed(2);
    if (type === 'amount') {
        return `${sign}${formatAmount(value)} (${sign}${percentage}%)`;
    }
    else if (type === 'number') {
        return `${sign}${value} (${sign}${percentage}%)`;
    }
    else {
        return `${sign}${(value * 100).toFixed(2)}%`;
    }
};
export const calculateDailyAmount = (count, days) => {
    if (!days)
        return 0;
    return Math.round(count / days);
};
export const calculateCost = (count, price, discountType, discountValue) => {
    if (!count || !price)
        return 0;
    const baseAmount = count * price;
    if (discountType === 'none')
        return baseAmount;
    if (discountType === 'discount')
        return baseAmount * (discountValue || 1);
    if (discountType === 'free')
        return (count - (discountValue || 0)) * price;
    return baseAmount;
};
export const formatAmount = (value) => {
    return value?.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' }) || '-';
};
export const formatPercent = (value) => {
    return value ? `${(value * 100).toFixed(2)}%` : '-';
};
