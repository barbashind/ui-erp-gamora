import { SortOrder } from "#/global/TableColumnHeader";

export type Loft = {
        loftId: number | undefined;
        companyId: number | undefined;
        name: string | null;
        address: string | null;
        size: number | null;
        guestCountMax: number | null;
        valid: boolean;
        createdAt: Date | null;
        updatedAt: Date | null;
}

export type LoftRow = Loft & {
        rowNumber: number;
        spacer: boolean;
    };

export interface LoftFilter {
        name?: string | null;
        valid?: boolean;
}

export interface LoftSortFields {
        loftId: SortOrder;
        size: SortOrder;
        createdAt: SortOrder;
}