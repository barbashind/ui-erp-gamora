import { FilterMS, InputDataMS, Organization, ProjectMS, UnfireData } from "../types/integration-mstroy-types";
import { HttpService } from "../system/HttpService";
import { ErrorResponse, getErrorResponse } from "./utils";

export const getCompanies = async (
        getCallback: (arg0: Organization[]) => void
    ) => {
        await HttpService.get<Organization[]>(`/api/ufch/companies`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getProjectMS = async (
        getCallback: (arg0: ProjectMS[]) => void
    ) => {
        await HttpService.get<ProjectMS[]>(`/api/ufch/projects`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const mstroyDataFilter = async (data: FilterMS): Promise <InputDataMS[]> => {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE3NTgzNjU5NTczNTksImlhdCI6MTc1ODI3OTU1MjM1OSwidXNyIjoxMzg1fQ.wgY37D7cKKimEhQfXNqROCf7EwyDFuEnzIvK8T3koaB65ALLJgh0KWOtV9YUQAaL45MWlf6k7FWVudDrdLhC3Q';
        const response = await fetch(`/api/exchanger/helmet-core/day_report/get_day_reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }
        const resp = (await response.json()) as InputDataMS[];
        return resp;
    };

export const mstroyDataUnfire = async (body: UnfireData): Promise <object> => {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE3NTgzNjU5NTczNTksImlhdCI6MTc1ODI3OTU1MjM1OSwidXNyIjoxMzg1fQ.wgY37D7cKKimEhQfXNqROCf7EwyDFuEnzIvK8T3koaB65ALLJgh0KWOtV9YUQAaL45MWlf6k7FWVudDrdLhC3Q';
        const response = await fetch(`/api/exchanger/helmet-core/worker/unfire_worker`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const errorResponse = await getErrorResponse(response);
            throw new ErrorResponse(errorResponse);
        }
        const resp = (await response.json()) as object;
        return resp;
    };

export const getStatuses = async (
        // getCallback: (arg0: object[]) => void
    ) => {
        await HttpService.get<object[]>(`/api/exchanger/helmet-core/day_report/get_day_report_statuses?project_id=6`)
            .then((response) => {
                // getCallback(response);
                console.log(response)
            })
            .catch(() => {
                console.log('failed');
            });
    };