import { Loft, LoftFilter } from "../types/lofts-managment-types";
import { TPageableResponse } from "../utils/types";
import { HttpService } from "../system/HttpService";
import { ErrorResponse, getErrorResponse, TSortParam } from "./utils";
import { CodeText, FileInfo } from "../types/common-types";
import { LoftStatus, TimePrice } from "../types/loft-details-types";

export const getLofts = (param: {
        page: number;
        size: number;
        sortParam?: TSortParam<Loft>[];
        filterParam?: LoftFilter;
    }): Promise<TPageableResponse<Loft>> => {
        const response = HttpService.post<TPageableResponse<Loft>>(
            `/api/gamora/lofts/filter?page=${param.page}&size=${param.size}&sort=${
                param.sortParam
                    ?.map(sort => `${sort.fieldname},${sort.isAsc ? 'ASC' : 'DESC'}`)
                    .join('&sort=') ?? ''
            }` /* body */,
    
            param.filterParam ?? { searchCriteria: {} }
        );
        return response;
    };

export const getLoftById = async (loftId: number,
        getCallback: (arg0: Loft) => void
    ) => {
        await HttpService.get<Loft>(`/api/gamora/loft/${loftId}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const createLoft = async (data: Loft): Promise<Loft> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/loft-create/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }
        const resp: Loft = (await response.json()) as Loft;
        return resp;
    };

export const updateLoft = async (loftId: number, data: Loft): Promise<Loft> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/loft-update/${loftId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }
        const resp: Loft = (await response.json()) as Loft;
        return resp;
    };

export const getLoftTypes = async (
        getCallback: (arg0: CodeText[]) => void
    ) => {
        await HttpService.get<CodeText[]>(`/api/gamora/loft-types`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

// Загрузка фото
export const uploadImageFile = async (loftId: number, file: File) => {
    const formData = new FormData();
    const token = localStorage.getItem('token');
    formData.append('file', file);
    try {
        const response = await fetch(`/api/gamora/upload-image/${loftId}`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        return response; // Ответ от сервера
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
};

// Загрузка фото
export const uploadMainImageFile = async (loftId: number, file: File) => {
    const formData = new FormData();
    const token = localStorage.getItem('token');
    formData.append('file', file);
    try {
        const response = await fetch(`/api/gamora/upload-image-main/${loftId}`, {
            method: 'POST',
            headers: {
                // 'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        return response; // Ответ от сервера
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
};



export const getLoftImages = async (
        loftId: number,
        getCallback: (arg0: FileInfo[]) => void
    ) => {
        await HttpService.get<FileInfo[]>(`/api/gamora/loft-images/${loftId}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getLoftMainImage = async (
    loftId: number,
    getCallback: (arg0: number) => void
) => {
    await HttpService.get<number>(`/api/gamora/loft-image-main/${loftId}`)
        .then((response) => {
            getCallback(response);
        })
        .catch(() => {
            console.log('failed');
        });
};

export const getImage = async (documnetId: number): Promise<File> => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/gamora/loft-image/${documnetId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const blob = await response.blob(); // Получаем Blob из ответа
        const resp = blob as File
        return resp;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
};

export const deleteImage = async (documnetId: number) => {
    const token = localStorage.getItem('token');
    try {
        await fetch(`/api/gamora/delete-loft-image/${documnetId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error('Failed to upload file');
    }
};

export const updateTimePrice = async (loftId: number, data: TimePrice[]): Promise<TimePrice[]> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/update-time-price/${loftId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }
        const resp: TimePrice[] = (await response.json()) as TimePrice[];
        return resp;
    };

export const getTimePrice = async (
        loftId : number,
        getCallback: (arg0: TimePrice[]) => void
    ) => {
        await HttpService.get<TimePrice[]>(`/api/gamora/time-price/${loftId}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const updateLoftStatus = async (loftId: number, data: LoftStatus): Promise<LoftStatus> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/loft-status-update/${loftId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }
        const resp: LoftStatus = (await response.json()) as LoftStatus;
        return resp;
    };

export const getLoftStatus = async (
        loftId: number,
        getCallback: (arg0: LoftStatus) => void
    ) => {
        await HttpService.get<LoftStatus>(`/api/gamora/loft-status/${loftId}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };