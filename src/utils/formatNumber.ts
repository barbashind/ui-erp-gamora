export const formatNumber = (num : number | string | undefined) => {
    if (num === null || num === undefined) return '0.00';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('.', ',');
};
