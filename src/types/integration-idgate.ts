export interface IdGateFilter {
    dateFrom: string;
    dateTo: string;
}

export interface PassageItem {
    photoProfileId: string;
    visitorPhotoId: string;
    profilePhotoId: string;
    lastName: string;
    firstName: string;
    middleName: string;
    passageDateIn: string; // ISO 8601 с временной зоной
    passageDateOut: string; // ISO 8601 с временной зоной
    accessPointId: string;
    accessPointName: string;
    camId: string;
    camName: string;
    deviceId: string;
    deviceName: string;
    locationCamId: string;
    locationCamName: string;
    timeVisit: string; // формат "HH:MM:SS"
    count: number;
}

// Тип для параметров запроса
export interface RequestParams {
    filter: string;
    sort: string;
    limit: number;
    offset: number;
}

// Тип для заголовка ответа
export interface ResponseHeader {
    name: string;
    total: number;
}

// Основной тип ответа
export interface IdGateDataResponse {
    header: ResponseHeader;
    params: RequestParams;
    items: PassageItem[];
}

export interface IdGateProfile {
  id: string;                     
  creatorId: string;
  dateCreate: string;
  editorId: string;
  dateEdit: string;
  isDelete: boolean;
  extId: string;
  clientId: string;
  isMedicalControlDisabled: boolean;
  medicalConfirmationType: string;
  medicalConfirmationData: string;
  medicalDateActiveBy: string;
  medicalDateActiveFrom: string;
  medicalConfirmationStatus: string;
  extIds: Record<string, string>;
  isHidden: boolean;
  isReadonly: boolean;
  metaData: unknown;                  
  bookmarkCategoryId: string;
  photoId: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: number;                  
  age: number;
  phoneNumber: string;
  email: string;
  listPeopleNames: string;
  listPeopleList: string[];
  active: boolean;
  dateCreateExport: string;
  birthDate: string;             
  qualityIndex: number;
  typeCreate: number;              
  masterProfileId: string;
  cloudLogon: boolean;
  winLogon: boolean;
  winLogin: string;
  winPassword: string;
  photoUrl: string;
  typeCreateCaption: string;
  description: string;
  photoProfileTypeId: string;
  fieldStr1: string;
  fieldStr2: string;
  fieldStr4: string;
  fieldInt1: number;
  fieldDate1: string;
  fieldDate2: string;
  fieldDate3: string;
  fieldDate4: string;
  fieldDate5: string;
  fieldDate6: string;
  fieldDate7: string;
  fieldDate8: string;
  fieldDate9: string;
  fieldDate10: string;
  pin: string;
  idCardList: unknown | null;
  autoLearnDate: string;
  livenessId: string;
  nodes: unknown | null;
  averageRating: number;
  commentsCount: number;
  agreeBiometry: string;
  personnelNumber: string;
  postId: string;
  orgUnitId: string;                // UUID организации (важное поле!)
  workSchedule: string;
  startTime: string;
  endTime: string;
  dateActiveFrom: string;
  dateActiveBy: string;
  documentType: string;
  documentNumber: string;
  documentIssueDate: string;
  documentIssuedAuthority: string;
  agreeBiometryFrom: string;
  agreeBiometryTo: string;
}

export interface OrgUnitItem {
  id: string;                       // UUID организации
  creatorId: string;
  dateCreate: string;
  editorId: string;
  dateEdit: string;
  isDelete: boolean;
  metaData: {
    inn?: string;
    kpp?: string;
  };
  extIds: Record<string, string>;
  name: string;                     // Название организации
  description: string;
  code: string;
  address: string;
  parentId: string;                 // UUID родительской организации (если есть)
  childrenIds: string[];            // UUID дочерних организаций
  orgUnitTypeId: string;
}

export interface OrgUnitListResponse {
  header: {
    name: string;
    maxLimit: number;
    total: number;
  };
  params: {
    filter: string;
    sort: string;
    limit: number;
    offset: number;
  };
  items: OrgUnitItem[];
}