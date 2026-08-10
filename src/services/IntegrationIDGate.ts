import { IdGateDataResponse, IdGateFilter, IdGateProfile, ListResponse, OrgUnitListResponse, PhotoProfile } from "../types/integration-idgate";
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

async function fetchWithSession(
  url: string,
  options: RequestInit = {},
  sessionId: string
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      sessionid: sessionId,
      ...(options.headers || {}),
    },
  });
}

async function getAllProfiles(sessionId: string): Promise<PhotoProfile[]> {
  const limit = 100; // можно взять из первого ответа, но для простоты фиксируем
  let offset = 0;
  let allItems: PhotoProfile[] = [];
  let total = Infinity;

  while (offset < total) {
    const url = `/api/v1/dict/photo-profile?limit=${limit}&offset=${offset}&sort=dateCreate`;
    const response = await fetchWithSession(url, {}, sessionId);
    if (!response.ok) {
      throw new Error(`Ошибка получения списка профилей: ${response.statusText}`);
    }
    const data: ListResponse = await response.json();
    total = data.header.total;
    allItems = allItems.concat(data.items);
    offset += limit;
    if (offset >= total || data.items.length < limit) break;
  }
  return allItems;
}

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

async function updateProfile(
  id: string,
  data: Partial<PhotoProfile>,
  sessionId: string
): Promise<void> {
  const url = `/api/v1/dict/photo-profile/${id}`;
  const response = await fetchWithSession(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    sessionId
  );
  if (!response.ok) {
    throw new Error(`Ошибка обновления профиля ${id}: ${response.statusText}`);
  }
}

// Подготовка тела PUT: исключаем системные поля, которые нельзя изменять
function prepareUpdateData(profile: PhotoProfile): Partial<PhotoProfile> {
  const exclude = new Set([
    'id',
    'creatorId',
    'dateCreate',
    'editorId',
    'dateEdit',
    'isDelete',
    'clientId',
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  for (const key in profile) {
    // eslint-disable-next-line no-prototype-builtins
    if (profile.hasOwnProperty(key) && !exclude.has(key)) {
      updateData[key] = profile[key];
    }
  }
  return updateData;
}

// Основная функция: обрабатывает все профили
export async function processProfiles(sessionId: string): Promise<void> {
  try {
    const profiles = await getAllProfiles(sessionId);
    console.log(`Всего профилей: ${profiles.length}`);

    for (const profile of profiles) {
      try {
        // Получаем полные данные
        const fullProfile = await getIDGateProfile(sessionId, profile.id);

        const fieldStr4 = fullProfile.fieldStr4;
        // Проверка: строка длиной 6 и состоит из цифр (или просто длина 6)
        const isSixDigit =
          typeof fieldStr4 === 'string' &&
          fieldStr4.length === 6 &&
          /^\d{6}$/.test(fieldStr4);

        if (!isSixDigit) {
          console.log(
            `Профиль ${fullProfile.id}: fieldStr4 = "${fieldStr4}" – обновляем на "101088"`
          );
          const updateData = prepareUpdateData(fullProfile);
          updateData.fieldStr4 = '101088';
          await updateProfile(fullProfile.id, updateData, sessionId);
          console.log(`Профиль ${fullProfile.id} успешно обновлён`);
        } else {
          console.log(`Профиль ${fullProfile.id}: fieldStr4 уже 6-значное, пропускаем`);
        }
      } catch (err) {
        console.error(`Ошибка при обработке профиля ${profile.id}:`, err);
      }
    }
  } catch (err) {
    console.error('Критическая ошибка:', err);
    throw err;
  }
}




    