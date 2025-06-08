import { ErrorResponse, getErrorResponse } from "./utils";

export const getProductQuant = async (
        productIds : string,
    ) => {
        const response = await fetch(`/cards/v2/list?appType=1&curr=rub&dest=12358385&spp=30&hide_dtype=13&ab_testing=false&lang=ru&nm=${productIds}`)
        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }
        const resp = (await response.json());
        return resp;
    };