export const concatUrl = (urlPart: (string | undefined)[]): string => {
    return urlPart.join('/').replaceAll('//', '/');
};