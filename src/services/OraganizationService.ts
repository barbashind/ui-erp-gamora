import { HttpService } from "../system/HttpService";
import { Organization } from "../types/organization-types";
import { ErrorResponse, getErrorResponse } from "./utils";

export const getCompanyData = async (
        getCallback: (arg0: Organization) => void
    ) => {
        await HttpService.get<Organization>(`/api/gamora/company-data`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const updateCompanyData = async (data: Organization): Promise<Organization> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/company-data-update`, {
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
        const resp: Organization = (await response.json()) as Organization;
        return resp;
    };

