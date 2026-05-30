import { AccessPointStatisticsResponse, IdGateFilter } from "../types/integration-idgate";
import { HttpService } from "../system/HttpService";
import { ErrorResponse, getErrorResponse } from "./utils";

type User = {
        username: string;
        password: string;
}
type Token = {
    token: string;
}

// Авторизация
export const authIDGate = async (data: User): Promise<Token> => {
    const response = await fetch('/ui/v1/login/', {
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

export const getIDGateData = async (data: IdGateFilter,
        getCallback: (arg0: AccessPointStatisticsResponse[]) => void
    ) => {
        await HttpService.get<AccessPointStatisticsResponse[]>(`/api/v1/gate/report/visitor-statistic?dateFrom=${data.dateFrom}&dateTo=${data.dateTo}&sort=-passageDateIn`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };






    