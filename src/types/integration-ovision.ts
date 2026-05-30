export interface OvisionFilter {
    dateFrom: string;
    dateTo: string;
}

export interface ResponseStatus {
    code: number;
    message: string;
}

// Тип для события (event)
export interface EventData {
    name: string;
    channel: number;
    reader_name: string;
    type: string;
    temperature: string;
    temperature_status: string;
    image_encode: string;
    zone_source: string;
    zone_source_id: string;
    zone: string;
    zone_id: string;
    device_name: string;
    device_uid: string;
    device_id: number;
    code: string;
    identity_types: string;
    identifiers: Record<string, unknown>; // или можно использовать {}
    message: string;
    accompany_id: string;
    accompany_name: string;
}

// Тип для отдельной записи о проходе
export interface PassageRecord {
    id: number;
    action: string; // "pass" и т.д.
    objects_id: number;
    object_uid: string;
    permits_id: number;
    photo: string;
    title: string; // ФИО
    profile_name: string; // "Сотрудник" и т.д.
    profile_type: string; // "person" и т.д.
    tab_num: string;
    department: string;
    purpose: string; // "entrance" или "exit"
    event: EventData;
    trackable: boolean;
    trackable_comment: string | null;
    blocked: boolean;
    blocked_comment: string | null;
    created_at: string; // ISO 8601 с временной зоной
    indicator: string;
}

// Тип для пагинации
export interface Pagination {
    current_page: number;
    total: number;
    per_page: number;
    total_items: number;
}

// Тип для метаданных
export interface MetaData {
    pagination: Pagination;
}

// Основной тип ответа
export interface OvisionResponse {
    status: ResponseStatus;
    data: PassageRecord[];
    meta: MetaData;
}

export interface DepartmentNode {
  id: number;
  parent_id: number;
  label: string;
  name: string;
  children?: DepartmentNode[];
}

export interface Status {
  code: number;
  message: string;
}

export interface DepartmentsResponse {
  status: Status;
  data: DepartmentNode[];
}