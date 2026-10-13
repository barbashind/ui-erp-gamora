import * as XLSX from "xlsx";
import { IdGateProfile } from "../../types/integration-idgate";
import { activatePhotoProfile } from "../../services/IntegrationIDGate";

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

const normalizeBirthDate = (value: unknown): string => {
  if (!value) return "";

  if (value instanceof Date) {
    const dd = String(value.getDate()).padStart(2, "0");
    const mm = String(value.getMonth() + 1).padStart(2, "0");
    const yyyy = value.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  // Если Excel вернул число (серийная дата Excel)
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      const dd = String(parsed.d).padStart(2, "0");
      const mm = String(parsed.m).padStart(2, "0");
      const yyyy = parsed.y;
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  return String(value).trim();
};

const rowToProfile = (row: ExcelRow): IdGateProfile => {
  return {
    active: true,

    fieldInt1: Number(row["Гражданство"] ?? 0),
    fieldStr1: String(row["СНИЛС"] ?? "").trim(),
    fieldStr2: String(row["ИНН"] ?? "").trim(),
    fieldStr3: String(row["Номер карты иностранного гражданина"] ?? "").trim(),
    fieldStr4: String(row["Должность"] ?? "").trim(),

    firstName: String(row["Имя"] ?? "").trim(),
    middleName: String(row["Отчество"] ?? "").trim(),
    birthDate: normalizeBirthDate(row["Дата рождения"]),
    age: Number(row["Возраст"] ?? 0),
    // По вашему ТЗ gender = 1.
    // Если нужно брать из Excel, замените на: Number(row["Пол"] ?? 1) || 1
    gender: 1,

    // Если в IdGateProfile есть поле lastName — раскомментируйте:
    lastName: String(row["Фамилия"] ?? "").trim(),
  } as IdGateProfile;
};

export async function updateProfilesFromExcel(
  file: File,
  sessionId: string,
  concurrency = 5
): Promise<{ success: number; errors: Array<{ id: string; error: unknown }> }> {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data, {
    type: "array",
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
    defval: "",
  });

  let success = 0;
  const errors: Array<{ id: string; error: unknown }> = [];

  let index = 0;

  const worker = async () => {
    while (index < rows.length) {
      const current = index++;
      const row = rows[current];

      const id = String(row["Сотрудник id_строка"] ?? "").trim().toLowerCase();

      if (!id) {
        continue;
      }

      try {
        const profile = rowToProfile(row);
        await activatePhotoProfile(id, sessionId, profile);
        success++;
      } catch (error) {
        console.error(`Ошибка обновления профиля ${id}:`, error);
        errors.push({ id, error });
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, rows.length) }, () => worker())
  );

  return { success, errors };
}