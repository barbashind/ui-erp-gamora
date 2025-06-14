import { DatePickerPropValue } from '@consta/uikit/DatePicker';

export interface TSortParam<T> {
    fieldname: keyof T;
    isAsc: boolean;
}

export class ErrorResponse extends Error {
    readonly response: TErrorResponse;

    constructor(response: TErrorResponse) {
        super(response.error);
        this.response = response;
        Object.setPrototypeOf(this, ErrorResponse.prototype);
    }
}

export interface TErrorResponse {
    timestamp: string;
    status: number;
    error: string;
    path?: string;
    cause?: string;
    advice?: string | null;
    details?: TMessageEntity[] | null;
    warnings?: TMessageEntity[] | null;
}

export interface TMessageEntity {
    message: string;
    object?: string;
    objectId?: number;
    field?: string;
}

export const getErrorResponse = async (error: Response): Promise<TErrorResponse> => {
    const contentLength = error.headers.get('content-length');
    const contentType = error.headers.get('content-type');
    if (contentLength !== '0' && contentType !== null) {
        if (contentType.includes('application/json')) {
            const resultErrorObject = (await error.json()) as TErrorResponse;
            return resultErrorObject;
        }
        const resultErrorTest: string = await error.text();
        return {
            error: resultErrorTest,
            status: error.status,
            timestamp: new Date().toUTCString(),
        };
    }
    return {
        error: error.statusText,
        status: error.status,
        timestamp: new Date().toUTCString(),
    };
};

export const dateToJsonValue = (date: DatePickerPropValue<'date'>): string | null => {
    if (!date) return null;
    return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
        .toString(10)
        .padStart(2, '0')}-${date.getDate().toString(10).padStart(2, '0')}`;
};

export const downloadFile = ({ filename, content }: { filename: string; content: Blob }) => {
    const dataUrl = window.URL.createObjectURL(content);
    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.setAttribute('download', filename);
    downloadLink.click();
};

export class ErrorFileResponse extends Error {
    readonly response: TErrorFileResponse;

    constructor(response: TErrorFileResponse) {
        super(response.error);
        this.response = response;
        Object.setPrototypeOf(this, ErrorFileResponse.prototype);
    }
}

export interface TErrorFileResponse {
    timestamp: string | undefined;
    status: number | undefined;
    error: string | undefined;
    path?: string | undefined;
    cause?: string | undefined;
    advice?: string | null | undefined;
    details?: string | null | undefined;
    objectId?: string | null | undefined;
    entityClass?: string | undefined;
    errorField?: string | undefined;
}

export const getErrorFileResponse = async (error: Response): Promise<TErrorFileResponse> => {
    const contentLength = error.headers.get('content-length');
    const contentType = error.headers.get('content-type');
    if (contentLength !== '0' && contentType !== null) {
        if (contentType.includes('application/json')) {
            const resultErrorObject = (await error.json()) as TErrorFileResponse;
            return resultErrorObject;
        }
        const resultErrorTest: string = await error.text();
        return {
            error: resultErrorTest,
            status: error.status,
            timestamp: new Date().toUTCString(),
        };
    }
    return {
        error: error.statusText,
        status: error.status,
        timestamp: new Date().toUTCString(),
    };
};

export interface IPagination {
    totalPages: number;
    totalElements: number;
    offset: number;
    pageSize: number;
}

export function convertDate(dateString : string | Date) {
    const date = new Date(dateString);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

export function convertDayMonth(dateString : string | Date) {
    const date = new Date(dateString);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    return `${day}.${month}`;
}

export function convertHourMinuts(dateString : string | Date) {
    const date = new Date(dateString);
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${hours}:${minutes}`;
}