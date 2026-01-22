export type Gates = {
    gateId: number;
    faceregId: string;
    name: string | null;
    IPaddress: string | null;
    companyId: number;
    objectId: number | null;
    objectName: string | null;
    placeId: number | null;
    place: string | null;
}

export type Object = {
    objectId: number;
    name: string  | null;
}

export type Place = {
    placeId: number;
    objectId: number;
    name: string | null;
}
