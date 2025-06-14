export type Organization = {
        companyId?: number;
        companyName: string | null;
        shortName: string | null;
        inn: string | null;
        address: string | null;
        contact:  string | null;
}

export type User = {
        companyId?: number;
        name: string | null;
        username: string | null;
        email: string | null;
        password: string | null;
        role: string | null;
        description: string | null;
        main: boolean;
}