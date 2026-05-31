import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Layout } from "@consta/uikit/Layout"
import { useEffect, useState } from "react";
import { Text } from "@consta/uikit/Text";
import { DatePicker } from "@consta/uikit/DatePicker";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { ReloadOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { Loader } from "@consta/uikit/Loader";
import { Card } from "@consta/uikit/Card";
import { authOvision, fetchDepartmentTree, getOvisionData, OvisionToken } from "../../services/IntegrationOvision";
import { OvisionFilter } from "../../types/integration-ovision";
import { Column } from "@consta/charts/Column";
import { Pie } from '@consta/charts/Pie';
import { authIDGate, getIDGateData, getIDGateOrgs, getIDGateProfile } from "../../services/IntegrationIDGate";
import { IdGateDataResponse, IdGateFilter, IdGateProfile, OrgUnitItem, PassageItem } from "../../types/integration-idgate";
// import { TextField } from "@consta/uikit/TextField";
// import { ComboboxSingle } from "../../global/ComboboxSingle";

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

 // Преобразует Date в строку вида "2026-05-30 00:00" (локальное время)
export const formatDateForIdGate = (date: Date, withTime: boolean = true): string => {
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
                {
                        id: 0,
                        name: 'СБВ',
                },
                {
                        id: 1,
                        name: 'Родниковая 1',
                },
                {
                        id: 2,
                        name: 'Кап. ремонт Киевское ш.53-65 км.',
                },
                
        ]
        // Функции для установки нужного времени
        const setStartOfDay = (date: Date): Date => {
        const newDate = new Date(date);
        newDate.setHours(0, 0, 1, 0); // 00:00:01
        return newDate;
        };

        const setEndOfDay = (date: Date): Date => {
        const newDate = new Date(date);
        newDate.setHours(23, 59, 59, 999); // 23:59:59.999
        return newDate;
        };

        const [dateMin, setDateMin] = useState<Date | null> (setStartOfDay(day));
        const [dateMax, setDateMax] = useState<Date | null> (setEndOfDay(today));

        const [data, setData] = useState<MergedItem[]> ([]);
        const [dataAgr, setDataAgr] = useState<AggregatedItem[]> ([]);
        const [todayData, setTodayData] = useState<AggregatedItem[]>([]);

        const [isLoadingDataAnalysis, setIsLoadingDataAnalysis] = useState<boolean>(false);

          // Справочник организаций IDGate (id -> name)
        const [orgUnitsMap, setOrgUnitsMap] = useState<Map<string, string>>(new Map());

        // Кэш для профилей IDGate (profileId -> orgUnitId)
        const [profileOrgCache, setProfileOrgCache] = useState<Map<string, string>>(new Map());

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

                // ------------------- Обработка Ovision (возвращает MergedItem[]) -------------------
                const processOvisionData = async (dateFrom: Date, dateTo: Date): Promise<MergedItem[]> => {
                const token: OvisionToken = await authOvision();
                const filter: OvisionFilter = {
                dateFrom: formatDateForIdGate(dateFrom, true),
                dateTo: formatDateForIdGate(dateTo, true),
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
                        employeeId: ev.objects_id,       // number
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

                

                // ------------------- Основная загрузка: объединение данных -------------------
                useEffect(() => {
                
               
                // ------------------- Обработка IDGate (возвращает MergedItem[]) -------------------
                const processIdGateData = async (dateFrom: Date, dateTo: Date, sessionId: string): Promise<MergedItem[]> => {
                const filter: IdGateFilter = {
                dateFrom: dateFrom.toISOString(),
                dateTo: dateTo.toISOString(),
                };
                const passagesResponse: IdGateDataResponse = await getIDGateData(sessionId, filter);
                // Предполагаем, что ответ - массив проходов (если нет, поправьте)
                const passages = passagesResponse.items as PassageItem[];
                if (!passages.length) return [];

                // Уникальные profileId
                const uniqueProfileIds = [...new Set(passages.map(p => p.photoProfileId))];

                // Загружаем недостающие профили (с кэшированием)
                const newCache = new Map(profileOrgCache);
                const missingIds = uniqueProfileIds.filter(id => !newCache.has(id));
                // Загружаем пачками по 5
                const chunkSize = 5;
                for (let i = 0; i < missingIds.length; i += chunkSize) {
                const chunk = missingIds.slice(i, i + chunkSize);
                await Promise.all(chunk.map(async (profileId) => {
                        try {
                        const profile: IdGateProfile = await getIDGateProfile(sessionId, profileId);
                        const orgId = profile.orgUnitId || "";
                        newCache.set(profileId, orgId);
                        } catch (err) {
                        console.warn(`Не удалось загрузить профиль ${profileId}`, err);
                        newCache.set(profileId, "");
                        }
                }));
                }
                setProfileOrgCache(newCache); // сохраняем обновлённый кэш

                // Формируем MergedItem из проходов IDGate
                const enriched: MergedItem[] = passages.map(p => {
                const orgId = newCache.get(p.photoProfileId) || "";
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
                        fullName: p.lastName + p.firstName + p.middleName || "",
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

                const loadAllData = async () => {
                if (!dateMin || !dateMax) return;
                setIsLoadingDataAnalysis(true);
                try {
                        // 1. Авторизация IDGate (нужны реальные логин/пароль)
                        const idGateAuth = await authIDGate({ login: "admin", password: 'e227e04df45b25701ca460ffe2626e6d', passwordText: "LRStZidYhEGaiBX" });
                        const sessionId = idGateAuth.sessionId;

                        // 2. Загружаем справочник организаций IDGate (если ещё не загружен)
                        let currentOrgMap = orgUnitsMap;
                        if (currentOrgMap.size === 0) {
                        const orgsResponse = await getIDGateOrgs(sessionId);
                        const newMap = new Map<string, string>();
                        orgsResponse.items.forEach((org: OrgUnitItem) => newMap.set(org.id, org.name));
                        setOrgUnitsMap(newMap);
                        currentOrgMap = newMap;
                        }

                        // 3. Параллельно загружаем данные из Ovision и IDGate
                        const [ovisionItems, idgateItems] = await Promise.all([
                        processOvisionData(dateMin, dateMax),
                        processIdGateData(dateMin, dateMax, sessionId)
                        ]);

                        // 4. Объединяем два массива в один
                        const mergedAll = [...ovisionItems, ...idgateItems];
                        // Дополнительная сортировка по дате (на всякий случай)
                        mergedAll.sort((a, b) => a.date.localeCompare(b.date));

                        // 5. Устанавливаем общие состояния
                        setData(mergedAll);
                        setDataAgr(aggregateItems(mergedAll));
                } catch (err) {
                        console.error("Ошибка загрузки данных:", err);
                } finally {
                        setIsLoadingDataAnalysis(false);
                }
                };

                loadAllData();
                }, [dateMin, dateMax, profileOrgCache, orgUnitsMap]);

                 useEffect(() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        const filtered = dataAgr.filter(item => item.date === todayStr);
                        setTodayData(filtered);
                }, [dataAgr]);

                function sum(array?: AggregatedItem[]) {
                if (!array) {
                return '0';
                }
                let s: number = 0;
                for (const item of array) {
                s += item.count;
                }
                return s.toString();
                }


         const colorMapLine: { [key: string]: string } = {
                MStroy: '#063955',
                FaceReg: '#ed7931',
        };

        return (
                <Layout direction="column">
                        <Layout direction="row" className={cnMixSpace({ mT: '2xl'})} style={{flexWrap: 'wrap'}}>
                                <Layout direction="column" className={cnMixSpace({ mL: 'xl'})}>
                                        <Text size="xs" className={cnMixSpace({ mB: '2xs'})}>Выберите период:</Text>
                                        <Layout direction="row"> 
                                                <DatePicker
                                                        type="date"
                                                        size="s"
                                                        value={dateMin}
                                                        maxDate={today}
                                                        onChange={(value) => {
                                                                        if (value) {
                                                                                setDateMin(setStartOfDay(value));
                                                                        }
                                                                }}
                                                />
                                                <DatePicker
                                                        type="date"
                                                        size="s"
                                                        value={dateMax}
                                                        maxDate={today}
                                                        onChange={(value) => {
                                                                if (value) {
                                                                                setDateMax(setEndOfDay(value));
                                                                        }
                                                        }}
                                                />  
                                        </Layout>
                                </Layout>

                                <Button
                                        label={"Получить данные"}
                                        size="s"
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                        <ReloadOutlined 
                                                                className={cnMixFontSize('l') + cnMixSpace({mR:'xs'})}
                                                        />
                                                ))}
                                        view="primary"
                                        onClick={()=> {
                                                console.log(data)
                                        }}
                                        disabled={isLoadingDataAnalysis}
                                        className={cnMixSpace({ mL: 'xl', mT: 'xl'  })}
                                />
                                
                        </Layout>
                        
                        <Layout direction="column" className={cnMixSpace({ mT: 'xl'})}>
                                {isLoadingDataAnalysis ? (
                                        <Layout style={{width: '100%', minHeight: '56vh', alignItems: 'center', justifyContent: 'center'}}>
                                                <Loader size="m" />
                                        </Layout>
                                ) : (
                                        <Layout direction="column" style={{flexWrap: 'wrap'}} >
                                                <Card border style={{minWidth: '45vw', maxWidth: '80vw'}} className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm'})}>
                                                        <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's'})}>Численность по СКУД</Text>
                                                        <Column
                                                                data={dataAgr} 
                                                                xField="date" 
                                                                yField="count"
                                                                seriesField="object"
                                                                isGroup
                                                                color={Object.keys(colorMapLine).map((key) => colorMapLine[key])}
                                                        />
                                                </Card>
                                                        <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's'})}>Данные за сегодня</Text>
                                                        {objects.map((obj) => (
                                                                <Layout direction="row">
                                                                        <Card border style={{minWidth: '30vw', maxWidth: '35vw'}} className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm'})}>
                                                                                <Layout direction="column">
                                                                                        <Text view="brand" size="m" weight="semibold" className={cnMixSpace({ mB: 's'})}>{obj.name}</Text>
                                                                                        <Pie
                                                                                                style={{ width: 200, height: '100%' }}
                                                                                                data={todayData.filter((item)=> (item.object === 'СБВ'))}
                                                                                                angleField="count"
                                                                                                colorField="organization"
                                                                                                radius={1}
                                                                                                statistic={{
                                                                                                title: {
                                                                                                formatter: (v) => v?.count.toString() || 'Всего',
                                                                                                style: {
                                                                                                        color: 'var(--color-typo-primary)',
                                                                                                },
                                                                                                },
                                                                                                content: {
                                                                                                customHtml: (_v, _v2, v3, v4) => (
                                                                                                        <Text size="3xl" view="primary" lineHeight="m">
                                                                                                        {v3?.count || sum(v4)}
                                                                                                        </Text>
                                                                                                ),
                                                                                                },
                                                                                                }}
                                                                                                innerRadius={0.64}
                                                                                                label={{
                                                                                                type: 'inner',
                                                                                                offset: '-50%',
                                                                                                content: '{count}',
                                                                                                style: {
                                                                                                textAlign: 'center',
                                                                                                fontSize: 14,
                                                                                                },
                                                                                                }}
                                                                                                interactions={[
                                                                                                { type: 'element-selected' },
                                                                                                { type: 'element-active' },
                                                                                                { type: 'pie-statistic-active' },
                                                                                                ]}
                                                                                        />
                                                                                </Layout>
                                                                        </Card>
                                                                </Layout>
                                                        ))}
                                                        
                                        </Layout>
                                       
                                )}
                                

                                
                        </Layout>
                        
                </Layout>
        )
}
export default FaceIDFilter;