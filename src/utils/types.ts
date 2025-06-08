

export interface DefaultTabs {
        id: number;
        label: string;
        navTo: string;
        leftIcon?: unknown;
    }

export interface IdLabel {
        id: number;
        label: string;
}

export interface TCaption {
        state: string | undefined;
        caption: string;
        index?: number;
}

export type TSort = 'asc' | 'desc' | undefined;

export interface TPageableResponse<T> {
        content: T[];
        pageable: {
            sort: TSort;
            pageNumber: number;
            pageSize: number;
            paged: boolean;
            unpaged: boolean;
        };
        dataHide: boolean;
        empty: boolean;
        first: boolean;
        last: boolean;
        number: number;
        numberOfElements: number;
        size: number;
        sort: TSort;
        totalElements: number;
        totalPages: number;
    }