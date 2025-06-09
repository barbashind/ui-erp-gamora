import { ErrorResponse, getErrorResponse } from "./utils";

type User = {
        username: string;
        password: string;
}
type Token = {
    token: string;
}
 // Авторизация
    export const auth = async (data: User): Promise<Token> => {
        const response = await fetch('/api/gamora/login', {
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

// Проверка токена

type Valid = {
    valid: boolean;
}


export  const checkToken = async (): Promise<Valid> => {
    // Проверка действительности токена, например, через запрос к вашему API
    const token = localStorage.getItem('token');
    console.log(token)
    const response = await fetch('/api/gamora/check-token', {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    const resp: Valid = (await response.json()) as Valid;
    if (!response.ok) {
        return {valid: false};
    }
    return resp;
  };

  export type UserInfo = {
    valid: boolean;
    username?: string;
    role?: string;
    companyId?: number;
}

export  const getUserInfo = async (): Promise<UserInfo> => {
const token = localStorage.getItem('token');
console.log(token)
const response = await fetch('/api/gamora/get-user-info', {
    headers: {
        'Authorization': `Bearer ${token}`,
    },
});
const resp: UserInfo = (await response.json()) as UserInfo;
if (!response.ok) {
    return {valid: false};
}
return resp;
};

