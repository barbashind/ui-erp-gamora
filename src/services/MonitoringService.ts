import { HttpService } from "../system/HttpService";
import { ErrorResponse, getErrorResponse, TSortParam } from "./utils";
import { TPageableResponse } from "../utils/types";
import { Point, PointFilter, Test } from "../types/monitoring-types";

export const getPoints = (param: {
        page: number;
        size: number;
        sortParam?: TSortParam<Point>[];
        filterParam?: PointFilter;
    }): Promise<TPageableResponse<Point>> => {
        const response = HttpService.post<TPageableResponse<Point>>(
            `/api/ufch/monitoring/filter?page=${param.page}&size=${param.size}&sort=${
                param.sortParam
                    ?.map(sort => `${sort.fieldname},${sort.isAsc ? 'ASC' : 'DESC'}`)
                    .join('&sort=') ?? ''
            }` /* body */,
    
            param.filterParam ?? { searchCriteria: {} }
        );
        return response;
    };

export const getAllPoints = async (
    getCallback: (arg0: Point[]) => void
) => {
    await HttpService.get<Point[]>('/api/ufch/monitoring-all')
        .then((response) => {
            getCallback(response);
        })
        .catch(() => {
            console.log('failed');
        });
};

export const getPoint = async (pointId: number | null ,
        getCallback: (arg0: Point) => void
    ) => {
        await HttpService.get<Point>(`/api/ufch/monitoring/${pointId?.toString()}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const createPoint = async (data: Point): Promise<Point> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/ufch/create-point`, {
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
        const resp: Point = (await response.json()) as Point;
        return resp;
    };

export const deletePoint = async (pointId: number): Promise<object> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/ufch/delete-point/${pointId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }
        const resp: object = (await response.json()) as object;
        return resp;
    };

export const updatePoint = async (pointId: number, data: Point): Promise<Point> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/ufch/update-point/${pointId}`, {
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
        const resp: Point = (await response.json()) as Point;
        return resp;
    };

export const getTests = async (pointId: number | null ,
        getCallback: (arg0: Test[]) => void
    ) => {
        await HttpService.get<Test[]>(`/api/ufch/tests/${pointId?.toString()}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getTestsHour = async (pointId: number | null ,
        getCallback: (arg0: Test[]) => void
    ) => {
        await HttpService.get<Test[]>(`/api/ufch/tests-hour/${pointId?.toString()}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getTestsDay = async (pointId: number | null ,
        getCallback: (arg0: Test[]) => void
    ) => {
        await HttpService.get<Test[]>(`/api/ufch/tests-day/${pointId?.toString()}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getTestsMonth = async (pointId: number | null ,
        getCallback: (arg0: Test[]) => void
    ) => {
        await HttpService.get<Test[]>(`/api/ufch/tests-month/${pointId?.toString()}`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };
