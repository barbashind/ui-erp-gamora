import { SortOrder } from "../global/TableColumnHeader";

export type Loft = {
        loftId?: number;
        companyId?: number;
        name: string | null;
        address: string | null;
        size: number | null;
        guestCountMax: number | null;
        valid: boolean;
        typeText: string | null;
        type: string | null;
        loftDescription: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
        photo?: File;
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
        guestCountMax: SortOrder;
        createdAt: SortOrder;
}