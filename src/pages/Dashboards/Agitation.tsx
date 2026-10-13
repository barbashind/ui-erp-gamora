import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { Layout } from "@consta/uikit/Layout";
import {
  activatePhotoProfile,
  authIDGate,
  getIDGateDataSKUD,
  getIDGateOrgs,
  getIDGateProfile,
  getIDGateSKUD,
  restorePhotoProfile,
} from "../../services/IntegrationIDGate";
import {
  DeviceMacInfo,
  IdGateDataResponseSKUD,
  IdGateProfile,
  OrgUnitItem,
  PassageItem,
} from "../../types/integration-idgate";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { exportToExcelReportSkud } from "../IntegrationFaceIdPage/ExportToExcelReportSkud";

const formatPassageDate = (iso: string): string => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy}  ${hh}:${min}:${ss}`;
};

export interface Events {
  id_event: string;
  id_employee: string;
  employee: string;
  country: number;
  snils: string;
  kig: string;
  org: string;
  type: string;
  date: string;
  terminal_id: string;
  devicename: string;
  term_id: string;
  isDeleted: string;
  uin: string;
  uinUGD: string;
  isDeletedObj: string;
  vidPropusk: string;
  typePropusk: string;
  client: string;
  dateCreation: string;
  dateUpdated: string;
}

// Ограничиваем параллелизм, чтобы не завалить сервер профилей
const mapWithConcurrency = async <T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let index = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  });

  await Promise.all(workers);
  return results;
};

// ---------- Работа с Excel ----------

type ExcelRow = {
  "Сотрудник id_строка"?: string;
  "Гражданство"?: string | number;
  "СНИЛС"?: string;
  "Номер карты иностранного гражданина"?: string;
  "Наименование организации"?: string;
  "ИНН"?: string;
  "Дата рождения"?: string | number | Date;
  "Фамилия"?: string;
  "Имя"?: string;
  "Отчество"?: string;
  "Пол"?: string | number;
  "Возраст"?: string | number;
  "Должность"?: string;
};

// API ждёт YYYY-MM-DD (формат Go "2006-01-02")
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

  // DD.MM.YYYY / DD/MM/YYYY / DD-MM-YYYY
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
const getCell = (
  row: Record<string, unknown>,
  name: string
): string => {
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

    lastName: getCell(row, "Фамилия"),
    firstName: getCell(row, "Имя"),
    middleName: getCell(row, "Отчество"),

    birthDate: normalizeBirthDate(row["Дата рождения"]),
    age: Number(row["Возраст"] ?? 0),
    gender: 1,
    isDelete: false,
  } as IdGateProfile;

  // Диагностика: что реально уходит в теле запроса
  console.log("PROFILE TO SEND:", JSON.stringify(profile, null, 2));

  return profile;
};

export type UploadPhase = "restore" | "update";

export interface UpdateResult {
  total: number;
  success: number;
  restored: number;
  errors: Array<{ id: string; error: unknown }>;
}

// eslint-disable-next-line react-refresh/only-export-components
export async function updateProfilesFromExcel(
  file: File,
  sessionId: string,
  onProgress?: (done: number, total: number, phase: UploadPhase) => void,
  concurrency = 5
): Promise<UpdateResult> {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data, {
    type: "array",
    cellDates: true,
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<ExcelRow>(sheet, { defval: "" });

  // Готовим список валидных строк с id
  const prepared = rows
    .map((row) => ({
      row,
      id: String(row["Сотрудник id_строка"] ?? "")
        .trim()
        .toLowerCase(),
    }))
    .filter((item) => Boolean(item.id));

  const total = prepared.length;

  let restored = 0;
  let success = 0;
  const errors: Array<{ id: string; error: unknown }> = [];

  // Универсальный воркер с ограничением параллелизма
  const runWithConcurrency = async <T,>(
    items: T[],
    conc: number,
    fn: (item: T) => Promise<void>
  ) => {
    let i = 0;
    const workers = Array.from({ length: conc }, async () => {
      while (i < items.length) {
        const cur = i++;
        await fn(items[cur]);
      }
    });
    await Promise.all(workers);
  };

  // ---------- Проход 1: восстановление всех профилей ----------
  console.log(`[Восстановление] Всего: ${total}`);
  let doneRestore = 0;

  await runWithConcurrency(prepared, concurrency, async (item) => {
    try {
      await restorePhotoProfile(item.id, sessionId);
      restored++;
    } catch (error) {
      // Профиль не удалён / нет прав — не критично, просто логируем
      console.warn(`[Восстановление] ${item.id} не восстановлен:`, error);
    } finally {
      doneRestore++;
      onProgress?.(doneRestore, total, "restore");
    }
  });

  console.log(`[Восстановление] Готово. Восстановлено: ${restored}`);

  // ---------- Проход 2: обновление данных ----------
  console.log(`[Обновление] Всего: ${total}`);
  let doneUpdate = 0;

  await runWithConcurrency(prepared, concurrency, async (item) => {
    try {
      const profile = rowToProfile(item.row);
      await activatePhotoProfile(item.id, sessionId, profile);
      success++;
    } catch (error) {
      console.error(`[Обновление] Ошибка для ${item.id}:`, error);
      errors.push({ id: item.id, error });
    } finally {
      doneUpdate++;
      onProgress?.(doneUpdate, total, "update");
    }
  });

  console.log(
    `[Обновление] Готово. Успешно: ${success}, ошибок: ${errors.length}`
  );

  return { total, success, restored, errors };
}

// ---------- Компонент ----------

const Agitation = () => {
  const [events, setEvents] = useState<Events[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionId, setSessionId] = useState<string>("");

  // Состояния загрузки Excel
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    phase: UploadPhase;
  }>({ done: 0, total: 0, phase: "restore" });
  const [uploadResult, setUploadResult] = useState<UpdateResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadAllData = async () => {
      try {
        setIsLoading(true);

        // 1. Авторизация
        const { sessionId } = await authIDGate({
          login: "admin",
          password: "e227e04df45b25701ca460ffe2626e6d",
          passwordText: "LRStZidYhEGaiBX",
        });

        if (cancelled) return;
        setSessionId(sessionId);

        // 2. Справочник организаций
        const orgUnitsMap = new Map<string, string>();
        const orgsResponse = await getIDGateOrgs(sessionId);
        orgsResponse.items.forEach((org: OrgUnitItem) =>
          orgUnitsMap.set(org.id, org.name)
        );

        // 3. События
        const passagesResponse: IdGateDataResponseSKUD =
          await getIDGateDataSKUD(sessionId);
        const passages = (passagesResponse.items || []) as PassageItem[];

        // 4. Для каждого события тянем профиль и собираем Events
        const enriched = await mapWithConcurrency(
          passages,
          5,
          async (p): Promise<Events> => {
            let profile: IdGateProfile | null = null;
            let skud: DeviceMacInfo | null = null;

            try {
              if (p.photoProfileId) {
                profile = await getIDGateProfile(sessionId, p.photoProfileId);
              }
            } catch (err) {
              console.warn(
                `Не удалось загрузить профиль ${p.photoProfileId}`,
                err
              );
            }

            try {
              if (p.photoProfileId) {
                skud = await getIDGateSKUD(p.deviceId, sessionId);
              }
            } catch (err) {
              console.warn(
                `Не удалось загрузить устройство ${p.deviceId}`,
                err
              );
            }

            const mac = skud?.mac || "";
            const orgId = profile?.orgUnitId || "";
            const organization = orgUnitsMap.get(orgId) || "Неизвестно";

            return {
              id_event: "TT0000-15-0588-001-" + p.id.toUpperCase(),
              id_employee:
                "TT0000-15-0588-001-" + p.photoProfileId.toUpperCase(),
              employee:
                "TT0000-15-0588-001-" + p.photoProfileId.toUpperCase(),
              country: Number(profile?.fieldInt1 ?? 0),
              snils: String(profile?.fieldStr1 ?? "").replace(/\D/g, ""),
              kig: String(profile?.fieldStr3 ?? ""),
              org: organization,
              type: p.direction === "in" ? "Вход" : "Выход",
              date: formatPassageDate(p.passageDate),
              terminal_id: "TT0000-15-0588-001-" + mac || "",
              devicename: p.deviceName || "",
              term_id: "TT0000-15-0588-001-" + mac || "",
              isDeleted: "ЛОЖЬ",
              uin: "TT0000-15-0588-001",
              uinUGD: "TT0000-15-0588-001",
              isDeletedObj: "ЛОЖЬ",
              vidPropusk: "Биометрия",
              typePropusk: "Постоянный",
              client: "avtoban",
              dateCreation: formatPassageDate(p.passageDate),
              dateUpdated: formatPassageDate(p.passageDate),
            };
          }
        );

        enriched.sort((a, b) => a.date.localeCompare(b.date));

        if (!cancelled) setEvents(enriched);
      } catch (err) {
        console.error("Ошибка загрузки данных IDGate:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAllData();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------- Обработка загрузки Excel --------

  const handleUploadClick = () => {
    if (!sessionId) {
      setUploadError("Нет активной сессии. Дождитесь загрузки данных.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadResult(null);
    setProgress({ done: 0, total: 0, phase: "restore" });
    setIsUploading(true);

    try {
      const result = await updateProfilesFromExcel(
        file,
        sessionId,
        (done, total, phase) => setProgress({ done, total, phase }),
        5
      );
      setUploadResult(result);
    } catch (err) {
      console.error("Ошибка обновления профилей:", err);
      setUploadError(
        err instanceof Error ? err.message : "Не удалось обновить профили"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const uploadButtonLabel = (() => {
    if (!isUploading) return "Загрузить Excel и обновить профили";
    const phaseLabel =
      progress.phase === "restore" ? "Восстановление" : "Обновление";
    return `${phaseLabel}… ${progress.done}/${progress.total}`;
  })();

  return (
    <Layout direction="column">
      {isLoading ? (
        <div>Загрузка событий…</div>
      ) : (
        <div>
          <div>Загружено событий: {events.length}</div>

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginTop: 12,
              flexWrap: "wrap",
            }}
          >
            <Button
              label="Выгрузить"
              size="s"
              iconLeft={AntIcon.asIconComponent(() => (
                <DownloadOutlined
                  className={cnMixFontSize("l") + cnMixSpace({ mR: "xs" })}
                />
              ))}
              view="secondary"
              onClick={() => exportToExcelReportSkud(events)}
            />

            <Button
              label={uploadButtonLabel}
              size="s"
              iconLeft={AntIcon.asIconComponent(() => (
                <UploadOutlined
                  className={cnMixFontSize("l") + cnMixSpace({ mR: "xs" })}
                />
              ))}
              view="primary"
              disabled={isUploading || !sessionId}
              onClick={handleUploadClick}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>

          {uploadError && (
            <div style={{ marginTop: 12, color: "crimson" }}>
              Ошибка: {uploadError}
            </div>
          )}

          {uploadResult && (
            <div style={{ marginTop: 12 }}>
              <div>
                Всего строк: {uploadResult.total}, восстановлено:{" "}
                {uploadResult.restored}, обновлено успешно:{" "}
                {uploadResult.success}, ошибок:{" "}
                {uploadResult.errors.length}
              </div>

              {uploadResult.errors.length > 0 && (
                <details style={{ marginTop: 8 }}>
                  <summary>Показать ошибки</summary>
                  <ul>
                    {uploadResult.errors.map((e, i) => (
                      <li key={i}>
                        <b>{e.id || "(без GUID)"}</b>:{" "}
                        {e.error instanceof Error
                          ? e.error.message
                          : String(e.error)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Agitation;