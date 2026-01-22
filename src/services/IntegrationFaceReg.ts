import { HttpService } from "../system/HttpService";
import { FaceregFilter, InputDataFacereg } from "../types/integration-mstroy-types";
import { ErrorResponse, getErrorResponse } from "./utils";

type User = {
        username: string;
        password: string;
}
type Token = {
    token: string;
}

// Авторизация
export const authFaceReg = async (data: User): Promise<Token> => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: Token = (await response.json()) as Token;
    return resp;
};

export const getFaceregData = async (data: FaceregFilter, gate_id: string,
        getCallback: (arg0: InputDataFacereg[]) => void
    ) => {
        await HttpService.get<InputDataFacereg[]>(`/api/qr_recognition/full_history?created_at__gte=${data.created_at__gte}&created_at__lte=${data.created_at__lte}&gate_id=${gate_id}&_ignore_limit=true`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getFaceregDataLast = async (gate_id: string,
    getCallback: (arg0: InputDataFacereg[]) => void
) => {
    await HttpService.get<InputDataFacereg[]>(`/api/qr_recognition/full_history?gate_id=${gate_id}&limit=1`)
        .then((response) => {
            getCallback(response);
        })
        .catch(() => {
            console.log('failed');
        });
};






    