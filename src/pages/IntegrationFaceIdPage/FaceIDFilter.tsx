import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Layout } from "@consta/uikit/Layout"
import { useEffect, useState } from "react";
import { Text } from "@consta/uikit/Text";
import { DatePicker } from "@consta/uikit/DatePicker";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { DownloadOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { Loader } from "@consta/uikit/Loader";
import { Card } from "@consta/uikit/Card";
import { authOvision, fetchDepartmentTree, getOvisionData, OvisionToken } from "../../services/IntegrationOvision";
import { OvisionFilter } from "../../types/integration-ovision";
import { Column } from "@consta/charts/Column";
import { Bar } from '@consta/charts/Bar';
import { authIDGate, getIDGateData, getIDGateOrgs, getIDGateProfile } from "../../services/IntegrationIDGate";
import { IdGateDataResponse, IdGateFilter, IdGateProfile, OrgUnitItem, PassageItem } from "../../types/integration-idgate";
import { exportToExcelReport } from "./ExportToExcelReport";

export interface MergedItem {
  date: string;
  object: string;
  employeeId: number | string;
  fullName: string;
  organization: string;
}

export interface AggregatedItem {
  organization: string;
  date: string;
  object: string;
  count: number;
}

const formatDateForIdGate = (date: Date, withTime: boolean = true): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (!withTime) return `${year}-${month}-${day}`;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const FaceIDFilter = () => {
  const today = new Date();
  const day = new Date();
  day.setDate(day.getDate() - 14);

  const objects = [
    { id: 0, name: 'СБВ' },
    { id: 1, name: 'Родниковая 1' },
    { id: 2, name: 'Кап. ремонт Киевское ш.53-65 км.' },
  ];

  const setStartOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 1, 0);
    return newDate;
  };

  const setEndOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  };

  const [dateMin, setDateMin] = useState<Date | null>(setStartOfDay(day));
  const [dateMax, setDateMax] = useState<Date | null>(setEndOfDay(today));

  const [data, setData] = useState<MergedItem[]>([]);
  const [dataAgr, setDataAgr] = useState<AggregatedItem[]>([]);
  const [dataAgr1, setDataAgr1] = useState<AggregatedItem[]>([]);
  const [todayData, setTodayData] = useState<AggregatedItem[]>([]);
  const [isLoadingDataAnalysis, setIsLoadingDataAnalysis] = useState<boolean>(false);

  const aggregateItems = (items: MergedItem[]): AggregatedItem[] => {
    const map = new Map<string, AggregatedItem>();
    for (const item of items) {
      const key = `${item.organization}|${item.date}|${item.object}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { organization: item.organization, date: item.date, object: item.object, count: 1 });
    }
    const result = Array.from(map.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };
  const aggregateItems1 = (items: MergedItem[]): AggregatedItem[] => {
    const map = new Map<string, AggregatedItem>();
    for (const item of items) {
      const key = `${item.date}|${item.object}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { organization: item.organization, date: item.date, object: item.object, count: 1 });
    }
    const result = Array.from(map.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

  // Обработка Ovision
  const processOvisionData = async (dateFrom: Date, dateTo: Date): Promise<MergedItem[]> => {
    const token: OvisionToken = await authOvision();
    const filter: OvisionFilter = {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString(),
    };
    const events = await getOvisionData(filter, token.access_token);
    const deptMap = await fetchDepartmentTree(token.access_token);

    const enriched: MergedItem[] = [];
    for (const ev of events.data) {
      const zone = ev.event.zone;
      let objectName = '';
      if (zone === 'Outer area→Родниковая 22' || zone === 'Родниковая 22→Outer area') {
        objectName = 'СБВ';
      } else {
        objectName = 'Другая зона';
      }
      const department = ev.department || '';
      const organization = deptMap.get(department) || 'Неизвестно';
      const dateOnly = ev.created_at.split('T')[0];
      enriched.push({
        date: dateOnly,
        object: objectName,
        employeeId: ev.objects_id,
        fullName: ev.title,
        organization,
      });
    }
    // Уникальные сотрудники по дням
    const groupedByDate = new Map<string, Map<string | number, MergedItem>>();
    for (const item of enriched) {
      if (!groupedByDate.has(item.date)) groupedByDate.set(item.date, new Map());
      const dateMap = groupedByDate.get(item.date)!;
      if (!dateMap.has(item.employeeId)) dateMap.set(item.employeeId, item);
    }
    const result: MergedItem[] = [];
    for (const dateMap of groupedByDate.values()) result.push(...Array.from(dateMap.values()));
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

  // Основной useEffect без кэширования в состоянии
  useEffect(() => {
    const loadAllData = async () => {
      if (!dateMin || !dateMax) return;
      setIsLoadingDataAnalysis(true);
      try {
        // 1. Авторизация IDGate
        const idGateAuth = await authIDGate({
          login: "admin",
          password: 'e227e04df45b25701ca460ffe2626e6d',
          passwordText: "LRStZidYhEGaiBX"
        });
        const sessionId = idGateAuth.sessionId;

        // 2. Загружаем справочник организаций IDGate (локальная переменная)
        const orgUnitsMap = new Map<string, string>();
        const orgsResponse = await getIDGateOrgs(sessionId);
        orgsResponse.items.forEach((org: OrgUnitItem) => orgUnitsMap.set(org.id, org.name));

        // 3. Кэш профилей (локальная переменная)
        const profileOrgCache = new Map<string, string>();

        // Функция обработки IDGate
        const processIdGateData = async (dateFrom: Date, dateTo: Date, sessionId: string): Promise<MergedItem[]> => {
          const filter: IdGateFilter = {
            dateFrom: formatDateForIdGate(dateFrom, true),
            dateTo: formatDateForIdGate(dateTo, true),
          };
          const passagesResponse: IdGateDataResponse = await getIDGateData(sessionId, filter);
          const passages = passagesResponse.items as PassageItem[];
          if (!passages.length) return [];

          const uniqueProfileIds = [...new Set(passages.map(p => p.photoProfileId))];

          // Загружаем недостающие профили
          const missingIds = uniqueProfileIds.filter(id => !profileOrgCache.has(id));
          const chunkSize = 5;
          for (let i = 0; i < missingIds.length; i += chunkSize) {
            const chunk = missingIds.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (profileId) => {
              try {
                const profile: IdGateProfile = await getIDGateProfile(sessionId, profileId);
                const orgId = profile.orgUnitId || "";
                profileOrgCache.set(profileId, orgId);
              } catch (err) {
                console.warn(`Не удалось загрузить профиль ${profileId}`, err);
                profileOrgCache.set(profileId, "");
              }
            }));
          }

          // Формируем MergedItem
          const enriched: MergedItem[] = passages.map(p => {
            const orgId = profileOrgCache.get(p.photoProfileId) || "";
            const organization = orgUnitsMap.get(orgId) || "Неизвестно";
            const dateOnly = p.passageDateIn.split('T')[0];
            let objectName = '';
            if (p.locationCamName === "Капитальный ремонт Киевского ш. на участке 53-65 км. (Строительство и реконструкция Киевского шоссе на участке 53-65 км.)") {
              objectName = 'Кап. ремонт Киевское ш.53-65 км.';
            } else if (p.locationCamName === "Строительство проектируемых пр-дов от ул. Родниковая до ул. Волынская") {
              objectName = 'Родниковая 1';
            } else {
              objectName = 'Другая зона';
            }
            return {
              date: dateOnly,
              object: objectName,
              employeeId: p.photoProfileId,
              fullName: [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ') || "",
              organization,
            };
          });

          // Уникальные сотрудники по дням
          const groupedByDate = new Map<string, Map<string | number, MergedItem>>();
          for (const item of enriched) {
            if (!groupedByDate.has(item.date)) groupedByDate.set(item.date, new Map());
            const dateMap = groupedByDate.get(item.date)!;
            if (!dateMap.has(item.employeeId)) dateMap.set(item.employeeId, item);
          }
          const result: MergedItem[] = [];
          for (const dateMap of groupedByDate.values()) result.push(...Array.from(dateMap.values()));
          result.sort((a, b) => a.date.localeCompare(b.date));
          return result;
        };

        // 4. Параллельная загрузка Ovision и IDGate
        const [ovisionItems, idgateItems] = await Promise.all([
          processOvisionData(dateMin, dateMax),
          processIdGateData(dateMin, dateMax, sessionId)
        ]);

        // 5. Объединение
        const mergedAll = [...ovisionItems, ...idgateItems];
        mergedAll.sort((a, b) => a.date.localeCompare(b.date));

        setData(mergedAll);
        setDataAgr(aggregateItems(mergedAll));
        setDataAgr1(aggregateItems1(mergedAll));
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setIsLoadingDataAnalysis(false);
      }
    };

    loadAllData();
  }, [dateMin, dateMax]); // Зависимости только dateMin, dateMax

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const filtered = dataAgr.filter(item => item.date === todayStr);
    setTodayData(filtered);
  }, [dataAgr]);

  const sum = (array?: AggregatedItem[]) => {
    if (!array) return '0';
    return array.reduce((acc, item) => acc + item.count, 0).toString();
  };

  const colorMapLine: { [key: string]: string } = {
                a: '#063955',
                b: '#ed7931',
                c: 'rgb(40, 116, 252)',
                d: 'rgb(255, 210, 50)',
                e: 'rgba(177, 169, 255, 1)',
        };


  return (
    <Layout direction="column">
      <Layout direction="row" className={cnMixSpace({ mT: '2xl' })} style={{ flexWrap: 'wrap' }}>
        <Layout direction="column" className={cnMixSpace({ mL: 'xl' })}>
          <Text size="xs" className={cnMixSpace({ mB: '2xs' })}>Выберите период:</Text>
          <Layout direction="row">
            <DatePicker
              type="date"
              size="s"
              value={dateMin}
              maxDate={today}
              onChange={(value) => value && setDateMin(setStartOfDay(value))}
        //       disabled
            />
            <DatePicker
              type="date"
              size="s"
              value={dateMax}
              maxDate={today}
              onChange={(value) => value && setDateMax(setEndOfDay(value))}
        //       disabled
            />
          </Layout>
        </Layout>
        <Button
          label="Выгрузить данные"
          size="s"
          iconLeft={AntIcon.asIconComponent(() => <DownloadOutlined className={cnMixFontSize('l') + cnMixSpace({ mR: 'xs' })} />)}
          view="secondary"
          onClick={() => exportToExcelReport(data)}
          disabled={isLoadingDataAnalysis}
          className={cnMixSpace({ mL: 'xl', mT: 'xl' })}
        />
      </Layout>

      <Layout direction="column" className={cnMixSpace({ mT: 'xl' })}>
        {isLoadingDataAnalysis ? (
          <Layout style={{ width: '100%', minHeight: '56vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size="m" />
          </Layout>
        ) : (
          <Layout direction="column" style={{ flexWrap: 'wrap' }}>
                <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's', mL: 'xl', mT: 'xl' })}>Данные за сегодня</Text>
                <Layout direction="row" style={{ flexWrap: 'wrap' }}>
                        {objects.map((obj) => (
                        <Layout direction="row" key={obj.id}>
                                <Card border  className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm' })}>
                                <Layout direction="column">
                                <Text view="brand" size="m" weight="semibold" className={cnMixSpace({ mB: 's' })}>{obj.name + ' - ' + sum(todayData.filter((item) => item.object === obj.name)).toString() + ' чел.'}</Text>
                                <Bar
                                        style={{ marginBottom: 'var(--space-m)', minWidth: 450, minHeight: 200, maxWidth: 450, maxHeight: 200 }}
                                        data={todayData.filter((item) => item.object === obj.name)}
                                        xField="count"
                                        yField="organization"
                                        seriesField="organization"
                                        label={{
                                                position: 'middle',
                                                layout: [
                                                { type: 'interval-adjust-position' },
                                                { type: 'interval-hide-overlap' },
                                                { type: 'adjust-color' },
                                                ],
                                        }}
                                />
                                </Layout>
                                </Card>
                        </Layout>
                        ))}
                </Layout>
            <Card border style={{ minWidth: '45vw', maxWidth: '80vw' }} className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm' })}>
              <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's' })}>Численность по СКУД</Text>
              <Column
                data={dataAgr1}
                xField="date"
                yField="count"
                seriesField="object"
                isGroup
                color={Object.keys(colorMapLine).map((key) => colorMapLine[key])}
              />
            </Card>
            
          </Layout>
        )}
      </Layout>
    </Layout>
  );
};

export default FaceIDFilter;