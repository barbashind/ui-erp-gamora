import { IdGateDataResponse, IdGateFilter, IdGateProfile, OrgUnitListResponse } from "../types/integration-idgate";
import { ErrorResponse, getErrorResponse } from "./utils";

type User = {
        login: string;
        password: string;
        passwordText: string;
}
type SessionId = {
    sessionId: string;
}

// Авторизация
export const authIDGate = async (data: User): Promise<SessionId> => {
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
    const resp: SessionId = (await response.json()) as SessionId;
    return resp;
};

export const getIDGateData = async (sessionid: string, data: IdGateFilter): Promise<IdGateDataResponse> => {
    const response = await fetch(`/api/v1/gate/report/visitor-statistic?dateFrom=${data.dateFrom}&dateTo=${data.dateTo}&sort=-passageDateIn`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            sessionid: sessionid,
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: IdGateDataResponse = (await response.json()) as IdGateDataResponse;
    return resp;
};

export const getIDGateOrgs = async ( sessionid: string): Promise<OrgUnitListResponse> => {
    const response = await fetch('/api/v1/hr-server-api/dict/org-unit?limit=10000&offset=0&sort=name', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            sessionid: sessionid,
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: OrgUnitListResponse = (await response.json()) as OrgUnitListResponse;
    return resp;
};

export const getIDGateProfile = async (sessionid: string, profileId: string): Promise<IdGateProfile> => {
    const response = await fetch(`/api/v1/dict/photo-profile/${profileId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            sessionid: sessionid,
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: IdGateProfile = (await response.json()) as IdGateProfile;
    return resp;
};




    