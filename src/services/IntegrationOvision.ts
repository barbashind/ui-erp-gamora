import { DepartmentNode, DepartmentsResponse, OvisionFilter, OvisionResponse } from "../types/integration-ovision";
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
    const response = await fetch('/oauth2/token?username=ab_admin&password=Buxzyk-gusnyj-0xofso', {
        method: 'POST',
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
    const response = await fetch(`/api/v2/events?type[]=pass&timeRange[]=${data.dateFrom}&timeRange[]=${data.dateTo}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        const errorResponse = await getErrorResponse(response);
        throw new ErrorResponse(errorResponse);
    }
    const resp: OvisionResponse = (await response.json()) as OvisionResponse;
    return resp;
};

export const fetchDepartmentTree = async (
  token: string,
): Promise<Map<string, string>> => {
  const url = `/api/v2/departments/tree`;
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
//   if (json.status.code !== 0) {
//     throw new ErrorResponse(json.status.message);
//   }

  // Преобразуем дерево в карту "название отдела → корневая организация"
  const nodeMap = new Map<number, DepartmentNode>();
  const flatten = (nodes: DepartmentNode[]) => {
    for (const node of nodes) {
      nodeMap.set(node.id, node);
      if (node.children) flatten(node.children);
    }
  };
  flatten(json.data);

  const rootForId = new Map<number, string>();
  for (const [id] of nodeMap.entries()) {
    let currId = id;
    while (true) {
      const currNode = nodeMap.get(currId);
      if (!currNode) break;
      if (currNode.parent_id === 0) {
        rootForId.set(id, currNode.name);
        break;
      }
      currId = currNode.parent_id;
    }
  }

  const deptToRoot = new Map<string, string>();
  for (const [id, node] of nodeMap.entries()) {
    const rootName = rootForId.get(id);
    if (rootName) {
      deptToRoot.set(node.name, rootName);
    }
  }
  return deptToRoot;
};
