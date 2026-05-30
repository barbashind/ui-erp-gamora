export interface IdGateFilter {
    dateFrom: string;
    dateTo: string;
}

export interface PassageItem {
    photoProfileId: string;
    visitorPhotoId: string;
    profilePhotoId: string;
    lastName: string;
    firstName: string;
    middleName: string;
    passageDateIn: string; // ISO 8601 с временной зоной
    passageDateOut: string; // ISO 8601 с временной зоной
    accessPointId: string;
    accessPointName: string;
    camId: string;
    camName: string;
    deviceId: string;
    deviceName: string;
    locationCamId: string;
    locationCamName: string;
    timeVisit: string; // формат "HH:MM:SS"
    count: number;
}

// Тип для параметров запроса
export interface RequestParams {
    filter: string;
    sort: string;
    limit: number;
    offset: number;
}

// Тип для заголовка ответа
export interface ResponseHeader {
    name: string;
    total: number;
}

// Основной тип ответа
export interface AccessPointStatisticsResponse {
    header: ResponseHeader;
    params: RequestParams;
    items: PassageItem[];
}