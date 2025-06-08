/* eslint-disable @typescript-eslint/no-unused-vars */
export const PAGE_SIZE_DEFAULT = 10;

export const usePaginationStore = (storeName: string) => {
    return {
        getStoredPageSize: () => {
            const pageSize = Number(localStorage.getItem(`${storeName}PageSize`));
            if (pageSize && !isNaN(pageSize)) return pageSize;
            return PAGE_SIZE_DEFAULT;
        },
        setStoredPageSize: (pageSize: number) => {
            try {
                localStorage.setItem(`${storeName}PageSize`, pageSize.toString(10));
            } catch (e: unknown) {
                return;
            }
        },
    };
};
