export type Organization = {
        companyId: number;
        mstroyCompanyId: number;
        name: string | null;
        mainCompanyID: number | null;
}

export type ProjectMS = {
        projectId: number;
        name: string | null;
}

export type FilterMS = {
        project_ids: number[];
        organization_ids: number[];
        date_range: {
                date_begin: string;
                date_finish: string;
        }
}

export type UnfireData = {
        first_name: string | null;
        last_name: string | null;
        surname: string | null;
        table_number: string | null;
        organization_id: number;
}

export type  InputDataMS = {
    id: number;
    day: string;
    project_id: number;
    worker_id: number;
    time_resource_id: number;
    from_1c: boolean | null;
    status: string;
    report_type: string;
    comment: string;
    tag_id: number | null;
    external_id: string | null;
    source_system: string | null;
}

export type  DataAnalysis = {
    system: string;
    date: string;
    value: number;
}

export type  DataAnalysisForExcel = {
    system: string;
    date: string;
    organization: string;
    mainOrganization: string;
    value: number;
}

interface Thumbnail {
    path: string;
    sizeType: string;
    size: number;
    isS3: boolean;
    s3Url: string;
    id: string;
}

interface Department {
    name: string;
    description: string;
    deleted: boolean;
    id: string;
    company?: {
        name: string;
        deleted: boolean;
        id: string;
    };
}

interface Gate {
    name: string;
    deleted: boolean;
    id: string;
    type: string;
    department: Department;
}

interface User {
    role: string;
    deleted: boolean;
    accessRestricted: boolean;
    departmentsRestricted: boolean;
    email: string;
    phone: string;
    id: string;
    isSuperuser: boolean;
    type: string;
}

interface TgUser {
    type: string;
    role: string;
    deleted: boolean;
    accessRestricted: boolean;
    departmentsRestricted: boolean;
    tgId: string;
    customerId: string;
}

interface Avatar {
    avatar: boolean;
    id: string;
    thumbnails: Thumbnail[];
}

interface EmployeeContract {
    startDate: string;
    contract: {
        name: string;
        guid: string;
    };
}

interface Employee {
    firstName: string;
    middleName: string;
    lastName: string;
    birthdate: string;
    firedDate: string;
    internalPhone: string;
    internalEmail: string;
    position: string;
    code: string;
    externalCode: string;
    timeEndRange: string;
    shiftEndTime: string;
    deleted: boolean;
    isNotifyForgery: boolean;
    hireDate: string;
    terminationDate: string;
    id: string;
    departments: Department[];
    avatar: Avatar;
    user: User;
    tgUser: TgUser;
    secretKey?: {
        key: string;
        static: boolean;
        id: string;
        employee?: Employee;
    };
    followers: Array<Omit<Employee, 'followers' | 'followees' | 'emailFollowers' | 'emailFollowees' | 'employeeContract'>>;
    followees: Array<Omit<Employee, 'followers' | 'followees' | 'emailFollowers' | 'emailFollowees' | 'employeeContract'>>;
    emailFollowers: Array<Omit<Employee, 'followers' | 'followees' | 'emailFollowers' | 'emailFollowees' | 'employeeContract'>>;
    emailFollowees: Array<Omit<Employee, 'followers' | 'followees' | 'emailFollowers' | 'emailFollowees' | 'employeeContract'>>;
    employeeContract: EmployeeContract;
}

interface PlannedShift {
    start: string;
    end: string;
    tzOffset: number;
    id: string;
    department: Omit<Department, 'company'>;
}

interface OpenedShift {
    autoEnd: boolean;
    manualStart: boolean;
    manualEnd: boolean;
    start: string;
    end: string;
    tzOffset: number;
    id: string;
    department: Omit<Department, 'company'>;
    status: number;
    departmentId: string;
    plannedShift: PlannedShift;
}

interface RecognitionChildAssociation {
    createdAt: string;
    diff: number;
    accepted: boolean;
    base: boolean;
    right: {
        type: string;
        livenessScore: number;
        createdAt: string;
        id: string;
        thumbnails: Thumbnail[];
    };
    employee: Employee & {
        openedShift: OpenedShift;
    };
    outlier: boolean;
}

interface Recognition {
    type: string;
    livenessScore: number;
    createdAt: string;
    status: string;
    error: string;
    tzOffset: number;
    id: string;
    gate: Gate;
    thumbnails: Thumbnail[];
    childAssociations: RecognitionChildAssociation[];
}

interface QrScan {
    status: string;
    static: boolean;
    error: string;
    isMark: boolean;
    createdAt: string;
    tzOffset: number;
    id: string;
    gate: Gate;
    employee: Employee;
    thumbnails: Thumbnail[];
}

interface Zoolzone {
    status: string;
    error: string;
    tzOffset: number;
    createdAt: string;
    id: string;
    gate: Gate;
    employee: Employee;
}

export interface InputDataFacereg {
    type: string;
    isMark: boolean;
    createdAt: string;
    id: string;
    recognition: Recognition;
    qrScan: QrScan;
    employee: Employee;
    zoolzone: Zoolzone;
}

export interface FaceregFilter {
    created_at__gte: string;
    created_at__lte: string;
}