import { DepartmentNode, DepartmentsResponse, DepartmentTree, OvisionFilter, OvisionPeopleResponse, OvisionPersonResponse, OvisionResponse, OvisionZonesResponse } from "../types/integration-ovision";
import { ErrorResponse, getErrorResponse } from "./utils";

export type OvisionToken = {
        access_token: string;
        token_type: string;
        refresh_token: string;
        expiry: string;
        expires_in: number
}

// Авторизация
export const authOvision = async (): Promise<OvisionToken> => {
    const response = await fetch('/ovision-rs-ebs.avtoban.ru/oauth2/token?username=ab_admin&password=Buxzyk-gusnyj-0xofso', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: OvisionToken = (await response.json()) as OvisionToken;
    return resp;
};

export const getOvisionData = async (data: OvisionFilter, token: string): Promise<OvisionResponse> => {
    const response = await fetch(`/ovision-rs-ebs.avtoban.ru/api/v2/events?type[]=pass&timeRange[]=${data.dateFrom}&timeRange[]=${data.dateTo}&limit=10000`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            mode: 'cors',
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: OvisionResponse = (await response.json()) as OvisionResponse;
    return resp;
};

export const normalizeDeptName = (value: string | null | undefined): string =>
  (value ?? '')
    .replace(/ё/gi, 'е')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

export const fetchDepartmentTree = async (
  token: string,
): Promise<DepartmentTree> => {
  const url = `/ovision-rs-ebs.avtoban.ru/api/v2/departments/tree`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorResponse = await getErrorResponse(response);
    throw new ErrorResponse(errorResponse);
  }

  const json: DepartmentsResponse = await response.json();

  // Плоский список узлов
  const nodeById = new Map<number, DepartmentNode>();
  const flatten = (nodes: DepartmentNode[]) => {
    for (const node of nodes) {
      nodeById.set(node.id, node);
      if (node.children?.length) flatten(node.children);
    }
  };
  flatten(json.data ?? []);

  // Для каждого узла находим корень (устойчиво к висячим родителям и циклам)
  const rootForId = new Map<number, string>();
  for (const id of nodeById.keys()) {
    let currId = id;
    const visited = new Set<number>();

    while (true) {
      if (visited.has(currId)) break; // защита от циклов
      visited.add(currId);

      const currNode = nodeById.get(currId);
      if (!currNode) break;

      // Корень
      if (currNode.parent_id === 0) {
        rootForId.set(id, currNode.name);
        break;
      }

      const parent = nodeById.get(currNode.parent_id);
      if (!parent) {
        // Родитель не найден в дереве — считаем текущий узел корнем,
        // чтобы не терять запись
        rootForId.set(id, currNode.name);
        break;
      }

      currId = currNode.parent_id;
    }
  }

  // Строим обе карты
  const byId = new Map<number, string>();
  const byName = new Map<string, string>();

  for (const [id, node] of nodeById) {
    const rootName = rootForId.get(id);
    if (!rootName) continue;

    byId.set(id, rootName);

    const key = normalizeDeptName(node.name);
    // Если одно и то же имя встречается у разных веток — оставляем первое,
    // чтобы результат был детерминированным
    if (!byName.has(key)) {
      byName.set(key, rootName);
    }
  }

  return { byName, byId, nodeById };
};

export const getOvisionPeopleData = async (token: string): Promise<OvisionPeopleResponse> => {
    const response = await fetch(`/ovision-rs-ebs.avtoban.ru/api/v2/objects/person?search=name:&biometricsStatus=exist&limit=10000`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            mode: 'cors',
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: OvisionPeopleResponse = (await response.json()) as OvisionPeopleResponse;
    return resp;
};


export const getOvisionPersonData = async (token: string, id: number): Promise<OvisionPersonResponse> => {
    const response = await fetch(`/ovision-rs-ebs.avtoban.ru/api/v2/object/${id}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            mode: 'cors',
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: OvisionPersonResponse = (await response.json()) as OvisionPersonResponse;
    return resp;
};

export const getOvisionZones = async (token: string): Promise<OvisionZonesResponse> => {
    const response = await fetch(`/ovision-rs-ebs.avtoban.ru/api/v2/zones`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            mode: 'cors',
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: OvisionZonesResponse = (await response.json()) as OvisionZonesResponse;
    return resp;
};