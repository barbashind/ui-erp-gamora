import { ErrorResponse, getErrorResponse } from '../services/utils.ts';

enum HTTP_METHOD {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

type RequestData = string | object | FormData | null | undefined;

interface RequestOptions {
    headers?: Record<string, string>;
    body?: RequestData;
    responseType?: string;
}

const token = localStorage.getItem('token');

const _fetch = async <T>(httpMethod: string, url: string, options?: RequestOptions): Promise<T> => {
    let headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
    };
    let body = options?.body;

    if (!(body instanceof FormData)) {
        headers = {
            ...headers,
            'Content-Type': 'application/json',
        };
        if (body) {
            body = JSON.stringify(body);
        }
    }

    try {
        const init: RequestInit = {
            method: httpMethod,
            headers: headers,
        };

        if (init.method != 'GET') {
            init.body = body;
        }

        const response = await fetch(url, init);

        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }

        let dataResponse: T;

        if (options?.responseType?.toLowerCase() === 'blob') {
            dataResponse = (await response.blob()) as T;
        } else {
            dataResponse = (await response.json()) as T;
        }

        return dataResponse;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const request = <T>(method: string) => {
    return (url: string, options?: RequestOptions) => _fetch<T>(method, url, options);
};

export const HttpService = {
    get<T>(url: string, options?: RequestOptions): Promise<T> {
        return request<T>(HTTP_METHOD.GET)(url, options);
    },

    post<T>(url: string, data?: RequestData, options?: RequestOptions): Promise<T> {
        return request<T>(HTTP_METHOD.POST)(url, { ...options, body: data });
    },

    put<T>(url: string, data?: RequestData, options?: RequestOptions): Promise<T> {
        return request<T>(HTTP_METHOD.PUT)(url, { ...options, body: data });
    },

    patch<T>(url: string, data?: RequestData, options?: RequestOptions): Promise<T> {
        return request<T>(HTTP_METHOD.PATCH)(url, { ...options, body: data });
    },

    delete<T>(url: string, options?: RequestOptions): Promise<T> {
        return request<T>(HTTP_METHOD.DELETE)(url, options);
    },
};
