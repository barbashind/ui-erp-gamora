import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Layout } from "@consta/uikit/Layout"
import { useEffect, useState } from "react";
import { Text } from "@consta/uikit/Text";
import { DatePicker } from "@consta/uikit/DatePicker";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { DownloadOutlined, RetweetOutlined
  // , DownOutlined, UpOutlined 
} from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { Loader } from "@consta/uikit/Loader";
import { Card } from "@consta/uikit/Card";
import { authOvision, fetchDepartmentTree, getOvisionData, getOvisionPeopleData, getOvisionPersonData, getOvisionZones, normalizeDeptName, OvisionToken } from "../../services/IntegrationOvisionRS";
import { DepartmentTree, OvisionFilter, OvisionZone } from "../../types/integration-ovision";
import { Column } from "@consta/charts/Column";
import { Bar } from '@consta/charts/Bar';
import { authIDGate, getIDGateData, getIDGateOrgs, getIDGateProfile, processProfiles } from "../../services/IntegrationIDGate";
import { IdGateDataResponse, IdGateFilter, IdGateProfile, OrgUnitItem, PassageItem } from "../../types/integration-idgate";
import { exportToExcelReport } from "./ExportToExcelReport";
import { Switch } from '@consta/uikit/Switch';

export interface MergedItem {
  date: string;
  object: string;
  employeeId: number | string;
  fullName: string;
  organization: string;
  snils?: string;
  kig?: string;
  country?: string;
  okpdtr?: string;
  inn?: string;
}

export interface AggregatedItem {
  organization: string;
  date: string;
  object: string;
  count: number;
}

export interface MergedBioItem {
  employeeId: number | string;
  organization: string;
}

export interface AggregatedBioItem {
  organization: string;
  count: number;
}


const isValidSnils = (snils: string): boolean => {
  // Удаляем пробелы по краям
  const trimmed = snils.trim();

  // Допустимые форматы:
  // 1) 11 цифр подряд (без разделителей)
  // 2) 3 цифры, дефис, 3 цифры, дефис, 3 цифры, пробел, 2 цифры
  const formatRegex = /^\d{11}$|^\d{3}-\d{3}-\d{3} \d{2}$/;
  if (!formatRegex.test(trimmed)) {
    console.log('формат снилс норм')
    return false;
  }

  // Извлекаем все цифры
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length !== 11) {
    console.log('кол-во цифр снилс норм')
    return false; // избыточно, но оставим для надёжности
  }

  // Не допускаем все одинаковые цифры (необязательно, но часто используется)
  if (/^(\d)\1{10}$/.test(digits)) {
    console.log('цифры снилс разные')
    return false;
  }

  // Контрольная сумма (стандартный алгоритм)
  const numberPart = digits.slice(0, 9);
  const controlDigits = digits.slice(9, 11);

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numberPart[i], 10) * (9 - i);
  }

  let expectedControl: number;
  if (sum < 100) {
    expectedControl = sum;
  } else if (sum === 100 || sum === 101) {
    expectedControl = 0;
  } else {
    const remainder = sum % 101;
    expectedControl = remainder < 100 ? remainder : 0;
  }

  const actualControl = parseInt(controlDigits, 10);
  return actualControl === expectedControl;
};

const isValidInnPhysical = (inn: string): boolean => {
  // Удаляем все нецифровые символы
  const digits = inn.replace(/\D/g, '');

  // ИНН физического лица должен содержать ровно 12 цифр
  if (digits.length !== 12) {
    console.log('инн из 12')
    return false;
  }

  // Не допускаем все одинаковые цифры (например, 111111111111)
  if (/^(\d)\1{11}$/.test(digits)) {
    console.log('инн из разных')
    return false;
  }

  // Контрольная сумма для 11-й цифры (первые 10 цифр)
  const coefficients11 = [7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum11 = 0;
  for (let i = 0; i < 10; i++) {
    sum11 += parseInt(digits[i], 10) * coefficients11[i];
  }
  let control11 = sum11 % 11;
  if (control11 >= 10) {
    control11 = 0;
  }

  // Контрольная сумма для 12-й цифры (первые 11 цифр)
  const coefficients12 = [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8];
  let sum12 = 0;
  for (let i = 0; i < 11; i++) {
    sum12 += parseInt(digits[i], 10) * coefficients12[i];
  }
  let control12 = sum12 % 11;
  if (control12 >= 10) {
    control12 = 0;
  }

  // Сравниваем вычисленные контрольные цифры с 11-й и 12-й цифрами
  const actual11 = parseInt(digits[10], 10);
  const actual12 = parseInt(digits[11], 10);

  return actual11 === control11 && actual12 === control12;
};

const isValidOkpdtr = (code: string): boolean => {
  // Удаляем все нецифровые символы
  const digits = code.replace(/\D/g, '');

  // Код должен содержать ровно 6 цифр
  if (digits.length !== 6) {
    return false;
  }

  // Первая цифра должна быть 1 (рабочий) или 2 (служащий)
  const firstDigit = digits[0];
  if (firstDigit !== '1' && firstDigit !== '2') {
    return false;
  }

  // Не допускаем все одинаковые цифры (например, 111111)
  if (/^(\d)\1{5}$/.test(digits)) {
    return false;
  }

  return true;
};



const formatDateForIdGate = (date: Date, withTime: boolean = true): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (!withTime) return `${year}-${month}-${day}`;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const UNKNOWN = 'Неизвестно';

/** Поиск организации по имени отдела */
const resolveOrgByName = (
  tree: DepartmentTree,
  name: string | null | undefined,
): string => tree.byName.get(normalizeDeptName(name)) ?? UNKNOWN;

/** Поиск организации по id отдела */
const resolveOrgById = (
  tree: DepartmentTree,
  id: number | string | null | undefined,
): string => {
  const numId = Number(id);
  if (!Number.isFinite(numId)) return UNKNOWN;
  return tree.byId.get(numId) ?? UNKNOWN;
};

const FaceIDFilter = () => {
  const today = new Date();
  const day = new Date();
  day.setDate(day.getDate() - 2);

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

  const [objects, setObjects] = useState<OvisionZone[]>([]);
  const [isCheckData, setIsCheckData] = useState<boolean>(false);

  const [dateMin, setDateMin] = useState<Date | null>(setStartOfDay(day));
  const [dateMax, setDateMax] = useState<Date | null>(setEndOfDay(today));

  const [data, setData] = useState<MergedItem[]>([]);
  const [dataAgr, setDataAgr] = useState<AggregatedItem[]>([]);
  const [dataAgr1, setDataAgr1] = useState<AggregatedItem[]>([]);
  const [todayData, setTodayData] = useState<AggregatedItem[]>([]);
  const [bioData, setBioData] = useState<AggregatedBioItem[]>([]);
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

  const aggregateItemsBio = (items: MergedBioItem[]): AggregatedBioItem[] => {
    const resultBio: AggregatedBioItem[] = Object.entries(
      items.reduce((acc, person) => {
        acc[person.organization] = (acc[person.organization] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([organization, count]) => ({ organization, count }));

    resultBio.sort((a, b) => b.count - a.count);

    return resultBio;
  };

  // Обработка Ovision по регистрации биометрии
  const processOvisionBioData = async (): Promise<MergedBioItem[]> => {
    const token: OvisionToken = await authOvision();
    const deptTree = await fetchDepartmentTree(token.access_token);

    const people = await getOvisionPeopleData(token.access_token);
    const enrichedPeople: MergedBioItem[] = [];
    for (const ev of people.data) {
      const departmentName = ev.profiles[0].department || ''
      const department = ev.profiles[0].departments_id || '';
                const isAtf = departmentName.toLowerCase().includes('автоколонна');
                const organization = isAtf
                  ? 'АТФ'
                  : resolveOrgById(deptTree, department);
      enrichedPeople.push({
        employeeId: ev.id,
        organization,
      });
    }
    // const resultBio: AggregatedBioItem[] = Object.entries(
    //   enrichedPeople.reduce((acc, person) => {
    //     acc[person.organization] = (acc[person.organization] || 0) + 1;
    //     return acc;
    //   }, {} as Record<string, number>)
    // ).map(([organization, count]) => ({ organization, count }));

    // resultBio.sort((a, b) => b.count - a.count);

    return enrichedPeople;
  }



  const processZonesData = async (): Promise<OvisionZone[]> => {
    const token: OvisionToken = await authOvision();
    const resp = await getOvisionZones(token.access_token);
    const zones = resp.data.filter((item) => Number(item.id) !== 0);
    setObjects(zones);
    return zones;
  };

  // Основной useEffect без кэширования в состоянии
  useEffect(() => {
        // Обработка Ovision
          const processOvisionData = async (
          dateFrom: Date,
          dateTo: Date,
          zones: OvisionZone[],
        ): Promise<MergedItem[]> => {
          const token: OvisionToken = await authOvision();
          const filter: OvisionFilter = {
            dateFrom: dateFrom.toISOString(),
            dateTo: dateTo.toISOString(),
          };
          const events = await getOvisionData(filter, token.access_token);
          const deptTree = await fetchDepartmentTree(token.access_token);
          const enriched: MergedItem[] = [];

          for (const ev of events.data) {
            if (isCheckData) {
              await getOvisionPersonData(token.access_token, ev.objects_id).then((resp) => {
                const zone = zones.find(
                  (item) =>
                    item.id === Number(ev.event.zone_id) ||
                    item.id === Number(ev.event.zone_source_id),
                );
                const snils = resp.data.values.find((el) => el.name === 'snils')?.value || null;
                const inn = resp.data.values.find((el) => el.name === 'staffinn')?.value || null;
                const citizenship =
                  Number(resp.data.values.find((el) => el.name === 'citizen')?.value) || null;
                const kigId = resp.data.values.find((el) => el.name === 'kigid')?.value || null;
                const jobTitle =
                  resp.data.profiles[0].values.find((el) => el.name === 'funres')?.value || null;

                const department = resp.data.profiles[0].departments_id || '';
                const departmentName = resp.data.profiles[0].department || '';
                const isAtf = departmentName.toLowerCase().includes('автоколонна');
                const organization = isAtf
                  ? 'АТФ'
                  : resolveOrgById(deptTree, department);

                const dateOnly = ev.created_at.split('T')[0];
                enriched.push({
                  date: dateOnly,
                  object: zone?.name || 'Не найдено',
                  employeeId: ev.objects_id,
                  fullName: ev.title,
                  organization,
                  snils: !snils ? 'Не заполнен СНИЛС' : !isValidSnils(snils) ? 'Некорректный СНИЛС' : undefined,
                  inn: !inn ? 'Не заполнен ИНН' : !isValidInnPhysical(inn) ? 'Некорректный ИНН' : undefined,
                  country: !citizenship ? 'Не заполнено гражданство' : undefined,
                  kig: citizenship !== 643 && citizenship !== 112 && !kigId ? 'Не заполнен КИГ ID' : undefined,
                  okpdtr: !jobTitle ? 'Не заполнена должность' : !isValidOkpdtr(jobTitle) ? 'Некорректная должность' : undefined,
                });
              }).catch((error) => {
                console.warn(
                  `[SKUD] Пропущена запись employeeId=${ev.objects_id}:`,
                  error?.message || error,
                );
              });
            } else {
              const zone = zones.find(
                (item) =>
                  item.id === Number(ev.event.zone_id) ||
                  item.id === Number(ev.event.zone_source_id),
              );
              const department = ev.department || '';
              const isAtf = department.toLowerCase().includes('автоколонна');
              const organization = isAtf
                ? 'АТФ'
                : resolveOrgByName(deptTree, department);
              const dateOnly = ev.created_at.split('T')[0];

              enriched.push({
                date: dateOnly,
                object: zone?.name || 'Не найдено',
                employeeId: ev.objects_id,
                fullName: ev.title,
                organization,
              });
            }
          }

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
      const loadAllData = async () => {
      if (!dateMin || !dateMax) return;
      setIsLoadingDataAnalysis(true);
      try {

        const zones = await processZonesData();
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
        type ProfileCacheData = {
          orgId: string;
          snils: string;
          inn: string;
          citizenship: number;
          kigId: string;
          jobTitle: string;
        };

        const profileCache = new Map<string, ProfileCacheData>();

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

          // Загружаем недостающие профили (сохраняем все нужные поля)
          const missingIds = uniqueProfileIds.filter(id => !profileCache.has(id));
          const chunkSize = 5;
          for (let i = 0; i < missingIds.length; i += chunkSize) {
            const chunk = missingIds.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (profileId) => {
              try {
                const profile: IdGateProfile = await getIDGateProfile(sessionId, profileId);
                // Сохраняем все необходимые поля из профиля
                profileCache.set(profileId, {
                  orgId: profile.orgUnitId || "",
                  snils: profile.fieldStr1 || "",        // СНИЛС
                  inn: profile.fieldStr2 || "",          // ИНН
                  citizenship: profile.fieldInt1 || 0,   // гражданство (код)
                  kigId: profile.fieldStr3 || "",        // КИГ ID
                  jobTitle: profile.fieldStr4 || "",     // должность (для ОКПДТР)
                });
              } catch (err) {
                console.warn(`Не удалось загрузить профиль ${profileId}`, err);
                // В случае ошибки сохраняем пустые значения
                profileCache.set(profileId, {
                  orgId: "",
                  snils: "",
                  inn: "",
                  citizenship: 0,
                  kigId: "",
                  jobTitle: "",
                });
              }
            }));
          }

          // Формируем MergedItem
          const enriched: MergedItem[] = passages.map(p => {
            const profileData = profileCache.get(p.photoProfileId)!;
            const organization = orgUnitsMap.get(profileData.orgId) || "Неизвестно";
            const dateOnly = p.passageDateIn.split('T')[0];
            
            // Определение объекта (как было)
            let objectName = '';
            if (p.locationCamName === "Капитальный ремонт Киевского ш. на участке 53-65 км. (Строительство и реконструкция Киевского шоссе на участке 53-65 км.)") {
              objectName = 'Кап. ремонт Киевское ш.53-65 км. (Pridex)';
            } else if (p.locationCamName === "Строительство проектируемых пр-дов от ул. Родниковая до ул. Волынская") {
              objectName = 'Родниковая 1 (Pridex)';
            } else {
              objectName = 'Другая зона';
            }

            // Проверки полей из профиля
            const snils = profileData.snils;
            const inn = profileData.inn;
            const citizenship = profileData.citizenship;
            const kigId = profileData.kigId;
            const jobTitle = profileData.jobTitle;

            return {
              date: dateOnly,
              object: objectName,
              employeeId: p.photoProfileId,
              fullName: [p.lastName, p.firstName, p.middleName].filter(Boolean).join(' ') || "",
              organization,
              snils: !snils ? 'Не заполнен СНИЛС' : !isValidSnils(snils) ? 'Некорректный СНИЛС' : undefined,
              inn: !inn ? 'Не заполнен ИНН' : !isValidInnPhysical(inn) ? 'Некорректный ИНН' : undefined,
              country: !citizenship ? 'Не заполнено гражданство' : undefined,
              kig: (citizenship !== 643 && citizenship !== 112 && !kigId) ? 'Не заполнен КИГ ID' : undefined,
              okpdtr: !jobTitle ? 'Не заполнена должность' : !isValidOkpdtr(jobTitle) ? 'Некорректная должность' : undefined,
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
        const [ovisionItems, idgateItems, ovisionBioItems] = await Promise.all([
          processOvisionData(dateMin, dateMax, zones),
          processIdGateData(dateMin, dateMax, sessionId),
          processOvisionBioData(),
        ]);

        // 5. Объединение
        const mergedAll = [...ovisionItems, ...idgateItems];
        mergedAll.sort((a, b) => a.date.localeCompare(b.date));

        setData(mergedAll);
        setDataAgr(aggregateItems(mergedAll));
        setDataAgr1(aggregateItems1(mergedAll));
        setBioData(aggregateItemsBio(ovisionBioItems))
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setIsLoadingDataAnalysis(false);
      }
    };

    loadAllData();
  }, [dateMin, dateMax, isCheckData]);

  useEffect(() => {
    const todayStr = dateMax ? dateMax.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const filtered = dataAgr.filter(item => item.date === todayStr);
    setTodayData(filtered);
  }, [dataAgr, dateMax]);

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
  
  // const [viewStat, setViewStat] = useState<boolean>(false);

  const [isLoadingData1, setIsLoadingData1] = useState<boolean>(false);
const onClick = async () => {
    setIsLoadingData1(true);
    try {
      // Авторизация
      const idGateAuth = await authIDGate({
          login: "admin",
          password: 'e227e04df45b25701ca460ffe2626e6d',
          passwordText: "LRStZidYhEGaiBX"
      });
      const sessionId = idGateAuth.sessionId;
      await processProfiles(sessionId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoadingData1(false);
    }
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

        <Button
          label="Обновить функции"
          size="s"
          iconLeft={AntIcon.asIconComponent(() => <RetweetOutlined className={cnMixFontSize('l') + cnMixSpace({ mR: 'xs' })} />)}
          view="ghost"
          onClick={() => onClick()}
          disabled={isLoadingData1}
          className={cnMixSpace({ mL: 'xl', mT: 'xl' })}
        />

        <Switch
          label="Запустить с проверкой данных"
          size="m"
          checked={isCheckData}
          onClick={() => setIsCheckData(!isCheckData)}
          disabled={isLoadingData1}
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
                <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's', mL: 'xl', mT: 'xl' })}>Данные за последний день</Text>
                <Layout direction="row" style={{ flexWrap: 'wrap' }}>
                        {objects.map((obj) => (
                        <Layout direction="row" key={obj.id} className={cnMixSpace({ mB: 'm'})}>
                                <Card border  className={cnMixSpace({ mL: 'xl',  p: 'm' })}>
                                <Layout direction="column">
                                <Text view="brand" size="m" weight="semibold" className={cnMixSpace({ mB: 's' })}>{obj.name + ' - ' + sum(todayData.filter((item) => item.object === obj.name)).toString() + ' чел.'}</Text>
                                <Bar
                                        style={{ marginBottom: 'var(--space-m)', minWidth: 700, minHeight: 350, maxWidth: 700, maxHeight: 350 }}
                                        data={todayData.filter((item) => item.object === obj.name)}
                                        xField="count"
                                        yField="organization"
                                        seriesField="organization"
                                        yAxis={{
                                            label: {
                                              formatter: (text) => {
                                                const maxLen = 25;
                                                return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
                                              },
                                            },
                                          }}
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
             <Card border  className={cnMixSpace({ mT: 'l',mL: 'xl',  p: 'm' })}>
                <Layout direction="column">
                <Text view="brand" size="m" weight="semibold" className={cnMixSpace({ mB: 's' })}>Зарегистрировано в СКУД</Text>
                <Bar
                        style={{ marginBottom: 'var(--space-m)', minWidth: '45vw', maxWidth: '80vw'}}
                        data={bioData}
                        xField="count"
                        yField="organization"
                        seriesField="organization"
                        yAxis={{
                            label: {
                              formatter: (text) => {
                                const maxLen = 25;
                                return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
                              },
                            },
                          }}
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
          
        )}
      </Layout>
    </Layout>
  );
};

export default FaceIDFilter;