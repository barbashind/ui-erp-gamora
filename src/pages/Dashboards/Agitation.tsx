import { useEffect, useState } from "react";
import { Layout } from "@consta/uikit/Layout";
import {
  authIDGate,
  getIDGateDataSKUD,
  getIDGateOrgs,
  getIDGateProfile,
  getIDGateSKUD,
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
import { DownloadOutlined } from "@ant-design/icons";
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

const Agitation = () => {
  const [events, setEvents] = useState<Events[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
                profile = await getIDGateProfile(
                  sessionId,
                  p.photoProfileId
                );
              }
            } catch (err) {
              console.warn(
                `Не удалось загрузить профиль ${p.photoProfileId}`,
                err
              );
            }

             try {
              if (p.photoProfileId) {
                skud = await getIDGateSKUD( p.deviceId, sessionId );
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
              id_employee: "TT0000-15-0588-001-" + p.photoProfileId.toUpperCase(),
              employee: "TT0000-15-0588-001-" + p.photoProfileId.toUpperCase(),
              country: Number(profile?.fieldInt1 ?? 0),
              snils: String(profile?.fieldStr1 ?? "").replace(/\D/g, ""),
              kig: String(profile?.fieldStr4 ?? ""),
              org: organization,
              type: p.direction === 'in' ? "Вход" : "Выход",
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

  return (
    <Layout direction="column">
      {isLoading ? (
        <div>Загрузка событий…</div>
      ) : (
        <div>
          <div>Загружено событий: {events.length}</div>
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
        </div>
      )}
    </Layout>
  );
};

export default Agitation;