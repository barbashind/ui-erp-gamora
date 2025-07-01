export type Loft = {
        loftId?: number;
        companyId?: number;
        name: string | null;
        size: number | null;
        address: string | null;
        guestCountMax:  number | null;
        valid: boolean;
        typeText: string | null;
        type: string | null;
        loftDescription: string | null;
        createdAt: Date | null;
        updatedAt: Date | null;
}

export type Service = {
                companyId: number;
                serviceCode?: number;
                isHourly: boolean | null;
                serviceName: string | null;
                defaultPrice: number | null;
        }

export type ServiceLoft = {
                serviceCode: number;
                serviceName: string | null;
                price: number | null;
                isHourly: boolean | null;
                loftId: number;
        }

export type Furniture = {
                furnitureCode?: number;
                companyId: number;
                furnitureName: string | null;
        }
export type Equipment = {
                equipmentCode?: number;
                companyId: number;
                equipmentName: string | null;
        }

export type FurnitureLoft = {
                furnitureCode?: number;
                loftId: number;
                furnitureName: string | null;
                count: number  | null;
        }
export type EquipmentLoft = {
                equipmentCode?: number;
                loftId: number;
                equipmentName: string | null;
                count: number  | null;
        }

export type LoftImage = {
                documentId?: number;
                image: File;
        }
export type  TimePrice = {
                weekDay: string;
                timeStart: string;
                timeEnd: string;
                price: number | null;
        }

export type LoftStatus = {
                commonData?: boolean;
                mediaData?: boolean;
                timepriceData?: boolean;
                equipmentData?: boolean;
                serviceData?: boolean;
                valid?: boolean;
        }