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
    fieldInt1?: number; 
    fieldStr1?: string; 
    fieldStr2?: string; 
    fieldStr3?: string; 
    fieldStr4?: string; 
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
  fieldStr3: string;
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

export interface PhotoProfile {
  id: string;
  creatorId: string;
  dateCreate: string;
  editorId?: string;
  dateEdit?: string;
  isDelete?: boolean;
  clientId?: string;
  extId?: string;
  extIds?: Record<string, string>;
  isHidden?: boolean;
  isReadonly?: boolean;
  photoId?: string;
  lastName?: string;
  firstName?: string;
  middleName?: string;
  gender?: number;
  age?: number;
  phoneNumber?: string;
  email?: string;
  listPeopleNames?: string;
  listPeopleList?: string[];
  active?: boolean;
  dateCreateExport?: string;
  birthDate?: string;
  qualityIndex?: number;
  typeCreate?: number;
  masterProfileId?: string;
  photoUrl?: string;
  typeCreateCaption?: string;
  description?: string;
  fieldStr1?: string;
  fieldStr2?: string;
  fieldStr3?: string;
  fieldStr4?: string;   // целевое поле
  fieldStr5?: string;
  fieldStr6?: string;
  fieldStr7?: string;
  fieldStr8?: string;
  fieldStr9?: string;
  fieldStr10?: string;
  // ... все остальные поля согласно документации
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;   // для упрощения
}

export interface ListResponse {
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
  items: PhotoProfile[];
}

export interface PassageItem {
  id: string;
  creatorId: string;
  dateCreate: string;
  editorId: string;
  dateEdit: string;
  isDelete: boolean;
  clientId: string;
  extIds: Record<string, string> | null;
  ownerObjectId: string;
  ownerObjectType: string;
  alivenessCheck: boolean;
  alivenessType: string;
  alivenessScore: number;
  liveness: unknown | null;
  classifications: Classifications;
  bookmarkCategoryId: string;
  photoProfileId: string;
  passageType: string;
  passageDate: string;
  accessPointId: string;
  accessCardId: string;
  direction: string;
  deviceId: string;
  camId: string;
  photoId: string;
  externalSystemId: string;
  accessRequestId: string;
  medicalControlResult: string;
  photoUrl: string;
  profilePhotoUrl: string;
  fio: string;
  accessPointName: string;
  accessCardNumber: string;
  deviceName: string;
  camName: string;
  locationCamId: string;
  status: string;
  reasonCodeId: string;
  reasonCodeCaption: string;
  extCode: string;
  mode: string;
  identificationType: string;
  offline: boolean;
  withoutEntry: boolean;
  listPeopleList: string[];
  accessPointDTO: AccessPointDTO;
  photoProfile: PhotoProfileSKUD;
}

// ===== Классификации =====
export interface Classifications {
  age: number;
  gender: number;
  hair: number;
  hairColor: number;
  mask: number;
  glasses: number;
  glassesType: number;
  headwear: number;
  temperature: number;
  smile: boolean;
  anger: boolean;
  fear: boolean;
  happiness: boolean;
  sadness: boolean;
  surprise: boolean;
}

// ===== Точка доступа =====
export interface AccessPointDTO {
  id: string;
  creatorId: string;
  dateCreate: string;
  editorId: string;
  dateEdit: string;
  isDelete: boolean;
  clientId: string;
  extId: string;
  extIds: Record<string, string> | null;
  type: string;
  code: string;
  name: string;
  description: string;
  direction: string;
  inMode: string;
  inReaderId: string;
  inScanerType: string;
  inScanerId: string;
  inCamId: string;
  inActuatorId: string;
  inLocationCamId: string;
  inAccessLevelId: string;
  outMode: string;
  outReaderId: string;
  outScanerType: string;
  outScanerId: string;
  outCamId: string;
  outActuatorId: string;
  outLocationCamId: string;
  outAccessLevelId: string;
}

// ===== Фото-профиль =====
export interface PhotoProfileSKUD {
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
  metaData: PhotoProfileMetaData;
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
  fieldBool1: boolean;
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
  orgUnitId: string;
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
  fullName: string;
}

// ===== Метаданные фото-профиля =====
export interface PhotoProfileMetaData {
  [key: string]:
    | PhotoProfileExternalSystem
    | PhotoProfileExternalSystemSync
    | PhotoProfileRs
    | unknown;
}

export interface PhotoProfileExternalSystem {
  accessLevelIDs: string[] | null;
  activePeriodEndDatetime: string | null;
  activePeriodStartDatetime: string | null;
  age: number;
  birthDay: string;
  comment: string;
  connectionId: string;
  department: string;
  email: string;
  extId: string;
  firstName: string;
  fullName: string;
  gender: string;
  groups: string[] | null;
  id: string;
  isActive: boolean;
  lastName: string;
  middleName: string;
  orgUnitId: string;
  params: PhotoProfileExternalSystemParams;
  phone: string;
  position: string;
}

export interface PhotoProfileExternalSystemParams {
  [key: string]: unknown;
}

export interface PhotoProfileExternalSystemSync {
  date: string;
  [key: `rule-${string}`]: string; // динамические ключи вида "rule-..."
}

export interface PhotoProfileRs {
  bioAgreement: boolean;
  bioAgreementBy: string;
  bioAgreementFrom: string;
  bioTemplate: boolean;
  message: string;
  mosId: boolean;
  publicLink: string;
  status: string;
}


// Основной тип ответа
export interface IdGateDataResponseSKUD {
    header: ResponseHeader;
    params: RequestParams;
    items: PassageItem[];
}

export interface DeviceMacInfo {
  mac: string;
}