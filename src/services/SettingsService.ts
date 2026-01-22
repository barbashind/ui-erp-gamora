import { TUser } from '../types/setting-types';
import { HttpService } from '../system/HttpService';

import { ErrorResponse, getErrorResponse } from './utils';


export const getUsers = async (
    getCallback: (arg0: TUser[]) => void
) => {
    await HttpService.get<TUser[]>('/api/ufch/users/all')
        .then((response) => {
            getCallback(response);
        })
        .catch(() => {
            console.log('failed');
        });
};

export const updateUsers = async (data: TUser[]): Promise<TUser[]> => {
    const token = localStorage.getItem('token');
const response = await fetch(`/api/ufch/update-users`, {
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
const resp: TUser[] = (await response.json()) as TUser[];
return resp;
};

export const deleteUser = async (id: number | undefined): Promise<object> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/ufch/delete-user/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    return response;
};