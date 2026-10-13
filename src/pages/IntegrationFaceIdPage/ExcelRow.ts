import * as XLSX from "xlsx";
import { IdGateProfile } from "../../types/integration-idgate";
import {
  activatePhotoProfile,
  restorePhotoProfile,
} from "../../services/IntegrationIDGate";

type ExcelRow = {
  "Сотрудник id_строка": string;
  "Гражданство": string | number;
  "СНИЛС": string;
  "Номер карты иностранного гражданина": string;
  "Наименование организации": string;
  "ИНН": string;
  "Дата рождения": string | number | Date;
  "Фамилия": string;
  "Имя": string;
  "Отчество": string;
  "Пол": string | number;
  "Возраст": string | number;
  "Должность": string;
};

// Формат для API — YYYY-MM-DD
const normalizeBirthDate = (value: unknown): string => {
  if (!value) return "";

  if (value instanceof Date) {
    const dd = String(value.getDate()).padStart(2, "0");
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const yyyy = value.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const dd = String(parsed.d).padStart(2, "0");
      const mm = String(parsed.m).padStart(2, "0");
      const yyyy = parsed.y;
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  const str = String(value).trim().replace(/^"|"$/g, "");

  // DD.MM.YYYY, DD/MM/YYYY, DD-MM-YYYY
  const dmY = str.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (dmY) {
    const dd = dmY[1].padStart(2, "0");
    const mm = dmY[2].padStart(2, "0");
    const yyyy = dmY[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // Уже YYYY-MM-DD
  const YmD = str.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (YmD) {
    const yyyy = YmD[1];
    const mm = YmD[2].padStart(2, "0");
    const dd = YmD[3].padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return str;
};

// Безопасное чтение ячейки без учёта регистра/пробелов в заголовке
const getCell = (row: Record<string, unknown>, name: string): string => {
  const target = name.trim().toLowerCase();
  const key = Object.keys(row).find(
    (k) => k.trim().toLowerCase() === target
  );
  return key ? String(row[key] ?? "").trim() : "";
};

const rowToProfile = (row: ExcelRow): IdGateProfile => {
  const profile = {
    active: true,

    fieldInt1: Number(row["Гражданство"] ?? 0),
    fieldStr1: String(row["СНИЛС"] ?? "").trim(),
    fieldStr2: String(row["ИНН"] ?? "").trim(),
    fieldStr3: String(row["Номер карты иностранного гражданина"] ?? "").trim(),
    fieldStr4: String(row["Должность"] ?? "").trim(),

    // ФИО — используем безопасный доступ на случай пробелов/регистра в заголовке
    lastName: getCell(row, "Фамилия"),
    firstName: getCell(row, "Имя"),
    middleName: getCell(row, "Отчество"),

    birthDate: normalizeBirthDate(row["Дата рождения"]),
    age: Number(row["Возраст"] ?? 0),
    gender: 1,
    isDelete: false,
  } as IdGateProfile;

  // Диагностика — покажет, что реально уходит в теле
  console.log("PROFILE TO SEND:", JSON.stringify(profile, null, 2));

  return profile;
};

// Проверка, что ошибка — 400 Bad Request
const isBadRequest = (error: unknown): boolean => {
  if (!error) return false;

  const anyErr = error as {
    status?: number;
    statusCode?: number;
    message?: string;
  };

  if (anyErr.status === 400 || anyErr.statusCode === 400) return true;

  const msg = String(anyErr.message ?? error).toLowerCase();
  return msg.includes("400") || msg.includes("bad request");
};

export async function updateProfilesFromExcel(
  file: File,
  sessionId: string,
  concurrency = 5,
  onProgress?: (done: number, total: number) => void
): Promise<{
  success: number;
  restored: number;
  errors: Array<{ id: string; error: unknown }>;
}> {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data, {
    type: "array",
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });

  let success = 0;
  let restored = 0;
  let done = 0;
  const errors: Array<{ id: string; error: unknown }> = [];

  let index = 0;

  const worker = async () => {
    while (index < rows.length) {
      const current = index++;
      const row = rows[current];

      const id = String(row["Сотрудник id_строка"] ?? "")
        .trim()
        .toLowerCase();

      if (!id) {
        done++;
        onProgress?.(done, rows.length);
        continue;
      }

      try {
        const profile = rowToProfile(row);

        try {
          // 1. Обычное обновление
          await activatePhotoProfile(id, sessionId, profile);
        } catch (error) {
          if (!isBadRequest(error)) throw error;

          // 2. Профиль, вероятно, удалён — восстанавливаем и пробуем ещё раз
          console.warn(`Профиль ${id} вернул 400, восстанавливаю…`);
          await restorePhotoProfile(id, sessionId);
          restored++;

          await activatePhotoProfile(id, sessionId, profile);
        }

        success++;
      } catch (error) {
        console.error(`Ошибка обновления профиля ${id}:`, error);
        errors.push({ id, error });
      } finally {
        done++;
        onProgress?.(done, rows.length);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, rows.length) }, () => worker())
  );

  return { success, restored, errors };
}