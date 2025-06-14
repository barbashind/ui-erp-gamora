import { SortOrder } from "../global/TableColumnHeader";

export type Booking = {
        bookingId: number | undefined;
        loftId: number | undefined;
        companyId: number | undefined;
        loftName: string;
        client: string | null;
        startDate: Date;
        endDate: Date;
        createdAt: Date | null;
        updatedAt: Date | null;
}

export type BookingRow = Booking & {
        rowNumber: number;
        spacer: boolean;
    };

export interface BookingFilter {
        name?: string | null;
        valid?: boolean;
}

export interface BookingSortFields {
        loftId: SortOrder;
        size: SortOrder;
        createdAt: SortOrder;
}