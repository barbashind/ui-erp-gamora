import { Loft, LoftFilter } from "#/types/lofts-managment-types";
import { TPageableResponse } from "#/utils/types";
import { HttpService } from "../system/HttpService";
import { ErrorResponse, getErrorResponse, TSortParam } from "./utils";

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

export const updateLoftData = async (loftId: number, data: Loft): Promise<Loft> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/loft-data-update/${loftId}`, {
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

