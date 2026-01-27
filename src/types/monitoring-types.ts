import { SortOrder } from "../global/TableColumnHeader";

export type Point = {
        pointId: number | undefined;
        name: string | null;
        login: string | null;
        object: string | null;
        place: string | null;
        responsible: string | null;
        responsibleObjNumber: string | null;
        responsibleObj: string | null;
        IPadress: string | null;
        status: string | null;
        comment: string | null;
        faceRegGUID: string | null;
        server: string | null;
        admPageLink: string | null;
        connecting: number;
        createdAt: Date | null;
        updatedAt: Date | null;
        type: string | null;
}

export type PointRow = Point & {
        rowNumber: number;
        spacer: boolean;
    };

export type FRRow =  {
        guid: string | null;
        lastDays: number;
        last: string | null;
    };

export interface PointFilter {
        name?: string | null;
        login?: string | null;
        status?: string | null;
        type?: string[];
}

export interface PointSortFields {
        pointId: SortOrder;
        status: SortOrder;
        name: SortOrder;
        createdAt: SortOrder;
        connecting: SortOrder;
        responsibleObj: SortOrder;
}


export type Test = {
        connectionId: number | undefined;
        pointId: number | undefined;
        name: string | null;
        time: string | null;
        losses: string | null;
        createdAt: Date | null;
        updatedAt: Date | string | null;
}

export type ReportData = {
        pointId: number | undefined;
        login: string | null;
        place: string | null;
        responsibleObj: string | null;
        date: Date | string | null;
        time: string | undefined;
        connection: number | undefined;
        active: number | undefined;
}
