export type UserInfo = {
        role?: string;
        username?: string;
        valid?: boolean;
}

export type CodeText = {
        code: string | number;
        text: string | null;
}

export interface FileInfo {
    loftId: number;
    documentId: number;
    fileName: string;
    fileMimeType: string;
    fileSize: number;
    createdAt: Date;
    fileExtension: string;
    fileDownloading?: boolean;
}
