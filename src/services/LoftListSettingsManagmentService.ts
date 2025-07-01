import { HttpService } from "../system/HttpService";
import { Equipment, Furniture, Service } from "../types/loft-details-types";
import { ErrorResponse, getErrorResponse } from "./utils";

export const getServices = async (
        getCallback: (arg0: Service[]) => void,
    ) => {
        await HttpService.get<Service[]>(`/api/gamora/services-list`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getEquipment= async (
        getCallback: (arg0: Equipment[]) => void
    ) => {
        await HttpService.get<Equipment[]>(`/api/gamora/equipment-list`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getFurniture= async (
        getCallback: (arg0: Furniture[]) => void
    ) => {
        await HttpService.get<Furniture[]>(`/api/gamora/furniture-list`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const updateServices = async (data: Service[]): Promise<Service[]> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/services-list/update`, {
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
        const resp: Service[] = (await response.json()) as Service[];
        return resp;
    };

export const updateFurniture = async (data: Furniture[]): Promise<Furniture[]> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/furniture-list/update`, {
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
        const resp: Furniture[] = (await response.json()) as Furniture[];
        return resp;
    };

export const updateEquipment = async (data: Equipment[]): Promise<Equipment[]> => {
    const token = localStorage.getItem('token');
        const response = await fetch(`/api/gamora/equipment-list/update`, {
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
        const resp: Equipment[] = (await response.json()) as Equipment[];
        return resp;
    };