export type Loft = {
        loftId?: number;
        companyId?: number;
        name: string | null;
        type: string | null;
        size: number | null;
        address: string | null;
        guestCountMax:  string | null;
        valid: boolean;
        createdAt: Date | null;
        updatedAt: Date | null;
}