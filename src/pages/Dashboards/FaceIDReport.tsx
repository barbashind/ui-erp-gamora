
import { Layout } from "@consta/uikit/Layout";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { Card } from "@consta/uikit/Card";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from '@consta/uikit/Text';
import { DatePicker } from '@consta/uikit/DatePicker';
import { Select } from '@consta/uikit/Select';
import { Loader } from '@consta/uikit/Loader';
import { Column } from '@consta/charts/Column';
import { Bar } from '@consta/charts/Bar';
import { DownloadOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { ComboboxMultiple } from "../../global/ComboboxMultiple";
import { DepartmentTree, OvisionFilter, OvisionZone } from "../../types/integration-ovision";
import { exportToExcelReport } from "../IntegrationFaceIdPage/ExportToExcelReport";
import { AggregatedItem, MergedItem } from "../IntegrationFaceIdPage/FaceIDFilter";
import { authOvisionKBS, fetchDepartmentTreeKBS, getOvisionDataKBS, getOvisionPersonDataKBS, getOvisionZonesKBS, OvisionTokenKBS } from "../../services/IntegrationOvisionKBS";

const UNKNOWN = 'Неизвестно';

/** Поиск организации по id отдела */
const resolveOrgById = (
  tree: DepartmentTree,
  id: number | string | null | undefined,
): string => {
  const numId = Number(id);
  if (!Number.isFinite(numId)) return UNKNOWN;
  return tree.byId.get(numId) ?? UNKNOWN;
};


const FaceIDReport = () => {
        
const [isLoadObjects, setIsLoadObjects] = useState<boolean>(true);
const [isLoadEntries, setIsLoadEntries] = useState<boolean>(true);
const [isLoadUncorrects, setIsLoadUncorrects] = useState<boolean>(true);

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
const [entries, setEntries] = useState<MergedItem[]>([]);
const [entriesUncorrect, setEntriesUncorrect] = useState<MergedItem[]>([]);

// Выгрузка объектов
const processZonesData = async (): Promise<OvisionZone[]> => {
    const token: OvisionTokenKBS = await authOvisionKBS();
    const resp = await getOvisionZonesKBS(token.access_token);
    const zones = resp.data.filter((item) => Number(item.id) !== 0);
    setObjects(zones);
    setSelectedObject(zones[0]);
    setSelectedObjects(zones);
    setIsLoadObjects(false);
    return zones;
  };

const [dateMax, setDateMax] = useState<Date | null>(null);
const [dateMin, setDateMin] = useState<Date | null>(null);

const [selectedObjects, setSelectedObjects] = useState<OvisionZone[]>([]);

// ---------- Состояния нижней части ----------
const [selectedObject, setSelectedObject] = useState<OvisionZone | null>(null);
const [objectDate, setObjectDate] = useState<Date | null>(null);
// const [objectDateMax, setObjectDateMax] = useState<Date | null>(null);

// const [dataAgr, setDataAgr] = useState<AggregatedItem[]>([]);
const [dataAgr1, setDataAgr1] = useState<AggregatedItem[]>([]);
const [todayData, setTodayData] = useState<AggregatedItem[]>([]);

// Группировка по дате, объектам и организациям
const aggregateItemsWithOrgs = (items: MergedItem[]): AggregatedItem[] => {
    const map = new Map<string, AggregatedItem>();
    for (const item of items) {
      const key = `${item.organization}|${item.date}|${item.object}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { organization: item.organization || '', date: item.date, object: item.object, count: 1 });
    }
    const result = Array.from(map.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

// Группировка по дате и объектам
  const aggregateItemsWithoutOrgs = (items: MergedItem[]): AggregatedItem[] => {
    const map = new Map<string, AggregatedItem>();
    for (const item of items) {
      const key = `${item.date}|${item.object}`;
      const existing = map.get(key);
      if (existing) existing.count += 1;
      else map.set(key, { organization: item.organization || '', date: item.date, object: item.object, count: 1 });
    }
    const result = Array.from(map.values());
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

// Основной useEffect
useEffect(() => {
        const loadAllData = async () => {
                        setIsLoadObjects(true);
                        
        try {
                void processZonesData();

        } catch (err) {
                console.error("Ошибка загрузки данных:", err);
        } finally {
                        setIsLoadEntries(false);
                        setIsLoadObjects(false);
                        setIsLoadUncorrects(false);
        }}

        loadAllData();
  
}, []);

// Основной useEffect
useEffect(() => {
        // Выгрузка проходов
        const processEntriesData = async (

                dateFrom: Date,
                dateTo: Date,
                zones: OvisionZone[],
                ): Promise<MergedItem[]> => {
                const token: OvisionTokenKBS = await authOvisionKBS();
                const filter: OvisionFilter = {
                dateFrom: dateFrom.toISOString(),
                dateTo: dateTo.toISOString(),
                };

                const events = await getOvisionDataKBS(filter, token.access_token);
                const enriched: MergedItem[] = [];

                for (const ev of events.data) {
                        const dateOnly = ev.created_at.split('T')[0];
                        const zone = zones.find(
                        (item) =>
                        item.id === Number(ev.event.zone_id) ||
                        item.id === Number(ev.event.zone_source_id),
                        );
                        enriched.push({
                                date: dateOnly,
                                object: zone?.name || 'Не найдено',
                                employeeId: ev.objects_id,
                                fullName: ev.title,
                        });
                };
                const groupedByDate = new Map<string, Map<string | number, MergedItem>>();
                for (const item of enriched) {
                if (!groupedByDate.has(item.date)) groupedByDate.set(item.date, new Map());
                const dateMap = groupedByDate.get(item.date)!;
                if (!dateMap.has(item.employeeId)) dateMap.set(item.employeeId, item);
                }
                const result: MergedItem[] = [];
                for (const dateMap of groupedByDate.values()) result.push(...Array.from(dateMap.values()));
                result.sort((a, b) => a.date.localeCompare(b.date));
                setDataAgr1(aggregateItemsWithoutOrgs(result)) 
                setEntries(result);
                setIsLoadEntries(false);


                return result;
        }
        const loadData = async () => {
        if (!dateMin || !dateMax) return;
        setIsLoadEntries(true);
      try {
        void processEntriesData(dateMin, dateMax, selectedObjects);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
                setIsLoadEntries(false);
                setIsLoadUncorrects(false);
      }};
      
      loadData();
  
}, [dateMax, dateMin, selectedObjects]);

// Основной useEffect
useEffect(() => {
        // Детализация проходов
        const processEntriesUncorrectData = async (): Promise<MergedItem[]> => {
                
                const token: OvisionTokenKBS = await authOvisionKBS();
                const deptTree = await fetchDepartmentTreeKBS(token.access_token);
                const enriched: MergedItem[] = [];
                
                for (const ev of entries) {

                        await getOvisionPersonDataKBS(token.access_token, Number(ev.employeeId)).then((resp) => {
                                const zone = ev.object
                                const department = resp.data.profiles[0].departments_id || '';
                                const departmentName = resp.data.profiles[0].department || '';
                                const isAtf = departmentName.toLowerCase().includes('автоколонна');
                                const organization = isAtf
                                        ? 'АТФ'
                                        : resolveOrgById(deptTree, department);
                
                                const dateOnly = ev.date

                                enriched.push({
                                        date: dateOnly,
                                        object: zone,
                                        employeeId: ev.employeeId,
                                        fullName: ev.fullName,
                                        organization,
                                });
                                }).catch((error) => {
                                console.warn(
                                        `[SKUD] Пропущена запись employeeId=${ev.employeeId}:`,
                                        error?.message || error,
                                );
                                });
                };
                const groupedByDate = new Map<string, Map<string | number, MergedItem>>();
                for (const item of enriched) {
                if (!groupedByDate.has(item.date)) groupedByDate.set(item.date, new Map());
                const dateMap = groupedByDate.get(item.date)!;
                if (!dateMap.has(item.employeeId)) dateMap.set(item.employeeId, item);
                }
                const result: MergedItem[] = [];
                for (const dateMap of groupedByDate.values()) result.push(...Array.from(dateMap.values()));
                result.sort((a, b) => a.date.localeCompare(b.date));
                
                setEntriesUncorrect(result);
                setTodayData(aggregateItemsWithOrgs(result));
                setIsLoadUncorrects(false);

                return result;
        }

        const loadAllData = async () => {
                setIsLoadUncorrects(true);
        try {
                void processEntriesUncorrectData();

        } catch (err) {
                console.error("Ошибка загрузки данных:", err);
        } finally {
                        setIsLoadUncorrects(false);
        }}
        
        loadAllData();
  
}, [entries]);

const colorMapLine: { [key: string]: string } = {
                a: '#063955',
                b: '#ed7931',
                c: 'rgb(40, 116, 252)',
                d: 'rgb(255, 210, 50)',
                e: 'rgba(177, 169, 255, 1)',
        };

useEffect(() => {
    const todayStr = objectDate ? objectDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const filtered = entriesUncorrect.filter(item => item.date === todayStr);
     setTodayData(aggregateItemsWithOrgs(filtered));
  }, [entriesUncorrect, objectDate]);
        
return (
    <Layout direction="column">
      {/* ======================= ФИЛЬТРЫ ======================= */}
      <Layout
        direction="row"
        className={cnMixSpace({ mT: '2xl' })}
        style={{ flexWrap: 'wrap', gap: 'var(--space-m)' }}
      >
        <Layout direction="column" className={cnMixSpace({ mL: 'xl' })}>
          <Text size="xs" className={cnMixSpace({ mB: '2xs' })}>
            Период:
          </Text>
          <Layout direction="row">
            <DatePicker
              type="date"
              size="s"
              value={dateMin}
              maxDate={today}
              onChange={(value) => value && setDateMin(setStartOfDay(value))}
            />
            <DatePicker
              type="date"
              size="s"
              value={dateMax}
              maxDate={today}
              onChange={(value) => value && setDateMax(setEndOfDay(value))}
              className={cnMixSpace({ mL: 's' })}
            />
          </Layout>
        </Layout>

        {/* Combobox с объектами */}
        <Layout direction="column">
                <Text size="xs" className={cnMixSpace({ mB: '2xs' })}>
                        Объекты
                </Text>
          <ComboboxMultiple
            items={objects}
            value={selectedObjects}
            onChange={(value) => {
                if (value) {
                      setSelectedObjects(value);
                } else {
                        setSelectedObjects([]);
                }
                }}

            getItemLabel={(item) => item.name}
            getItemKey={(item) => item.id}
            placeholder="Выберите объекты"
            size="s"
            multiple
            style={{ minWidth: 280 }}
            isLoading={isLoadObjects}
          />
        </Layout>

      </Layout>

      {/* ======================= КАРТОЧКИ СВОДКИ ======================= */}
      <Layout
        direction="row"
        style={{ flexWrap: 'wrap', gap: 'var(--space-m)' }}
        className={cnMixSpace({ mT: 'l', mL: 'xl' })}
      >
        {/* Всего объектов */}
        <Card border className={cnMixSpace({ p: 'm' })} style={{ minWidth: 55, flex: '1 1 50px' }}>
                        <Text size="2xl" view="secondary">
                                Всего объектов
                        </Text>
                        {isLoadObjects ? (<Loader/>) :
                                (<Text size="4xl" weight="bold" view="brand" >
                                        {objects.length}
                                </Text>)
                        }
        </Card>

        {/* Численность за сегодня / в среднем */}
        <Card border className={cnMixSpace({ p: 'm' })} style={{ minWidth: 260, flex: '1 1 240px' }}>
          <Text size="2xl" view="secondary" className={cnMixSpace({ mB: 'xs' })}>
            Численность на объектах
          </Text>
          <Layout direction="row" style={{ gap: 'var(--space-l)', alignItems: 'baseline' }}>
            <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
              <Text size="m" view="secondary">Всего</Text>
              {isLoadEntries ? (<Loader/>) :
                (<Text size="xl" weight="semibold">{entries.length}</Text>)
              }
            </Layout>
            <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
              <Text size="m" view="secondary">В среднем</Text>
              {isLoadEntries ? (<Loader/>) :
              (<Text size="xl" weight="semibold">{dateMax && dateMin ? 
                Math.round((entries.length)/Math.round((new Date(dateMax.getFullYear(), dateMax.getMonth(), dateMax.getDate()).getTime() - new Date(dateMin.getFullYear(), dateMin.getMonth(), dateMin.getDate()).getTime())/(24 * 60 * 60 * 1000))) 
                : ''}</Text>)
              }
            </Layout>
            <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
              <Text size="m" view="secondary">Сегодня</Text>
              {isLoadEntries ? (<Loader/>) :
                (
                        <Text size="xl" weight="semibold">{entries.filter(item => (item.date === today.toDateString().split('T')[0])).length}</Text>
                )
              }
            </Layout>
          </Layout>
        </Card>

        {/* Некорректные проходы */}
        <Card border className={cnMixSpace({ p: 'm' })} style={{ minWidth: 260, flex: '1 1 240px' }}>
          <Text size="2xl" view="secondary" className={cnMixSpace({ mB: 'xs' })}>
            Некорректные проходы
          </Text>
          <Layout direction="row" style={{ gap: 'var(--space-l)', alignItems: 'baseline' }}>
            <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
              <Text size="m" view="secondary">Всего</Text>
              {isLoadUncorrects ? (<Loader/>) :
                (<Text size="xl" weight="semibold">{entriesUncorrect.filter(item => (item.kig || item.inn || item.snils || item.okpdtr || item.country)).length}</Text>)
              }
              
            </Layout>
            <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
              <Text size="m" view="secondary">% от всех</Text>
              {isLoadUncorrects ? (<Loader/>) :
                (<Text size="xl" weight="semibold">{entriesUncorrect.length ? (entriesUncorrect.filter(item => (item.kig || item.inn || item.snils || item.okpdtr || item.country)).length)/entriesUncorrect.length : 0}%</Text>)
              }
            </Layout>
          </Layout>
        </Card>
      </Layout>

      {/* ======================= ОСНОВНОЙ КОНТЕНТ ======================= */}
      <Layout direction="column" className={cnMixSpace({ mT: 'xs' })}>
        {isLoadEntries ? (
          <Layout style={{ width: '100%', minHeight: '56vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader size="m" />
          </Layout>
        ) : (
          <>
            {/* -------- График численности по объектам за период -------- */}
            <Card border style={{ minWidth: '45vw', flex: '1 1 80px' }} className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm' })}>
                <Layout direction="row" style={{justifyContent: 'space-between'}}>
                        <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's' })}>
                                Статистика по объектам
                        </Text>
                        <Button
                                label="Выгрузить данные"
                                size="s"
                                iconLeft={AntIcon.asIconComponent(() => (
                                <DownloadOutlined className={cnMixFontSize('l') + cnMixSpace({ mR: 'xs' })} />
                                ))}
                                view="secondary"
                                onClick={() => exportToExcelReport(entriesUncorrect)}
                                disabled={isLoadUncorrects}
                                />
                </Layout>
              
              <Column
                data={dataAgr1}
                xField="date"
                yField="count"
                seriesField="object"
                isGroup
                color={Object.keys(colorMapLine).map((key) => colorMapLine[key])}
              />
            </Card>

            {/* ================ НИЖНЯЯ ЧАСТЬ: ДВЕ КОЛОНКИ ================ */}
            <Layout direction="row" style={{ flexWrap: 'wrap', gap: 'var(--space-l)', alignItems: 'flex-start' }} className={cnMixSpace({ mT: 'l', mL: 'xl' })}>

              {/* -------- ЛЕВАЯ КОЛОНКА -------- */}
              <Layout direction="column" style={{ flex: '1 1 45%', minWidth: 400 }}>
                {/* Селект объекта + фильтр по датам */}
                <Layout direction="row" style={{ gap: 'var(--space-s)', alignItems: 'flex-end' }}>
                  <Select
                    items={objects}
                    value={selectedObject}
                    onChange={setSelectedObject}
                    getItemLabel={(item) => item.name}
                    getItemKey={(item) => item.id}
                    placeholder="Выберите объект"
                    label="Объект"
                    size="s"
                    style={{ minWidth: 100 }}
                  />
                  <DatePicker
                    type="date"
                    size="s"
                    value={objectDate}
                    maxDate={today}
                    onChange={(value) => value && setObjectDate(value)}
                  />
                </Layout>

                {/* График по организациям */}
                <Card border className={cnMixSpace({ p: 'm', mT: 'm' })}>
                <Layout direction="row" style={{alignItems: 'center'}}>
                        <Text size="m" view="secondary">Всего на объекте</Text>
                        <Text size="2xl" weight="bold" view="brand" className={cnMixSpace({ mL: 'm' })}>{entries.length}</Text>     
                </Layout>
                  <Bar
                    style={{ minHeight: 350, width: '100%' }}
                    data={todayData.filter((item) => item.object === selectedObject?.name)}
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
                </Card>
              </Layout>

              {/* -------- ПРАВАЯ КОЛОНКА: СПИСОК НЕКОРРЕКТНЫХ ПРОХОДОВ -------- */}
              <Layout direction="column" style={{ flex: '1 1 45%', minWidth: 400 }} className={cnMixSpace({ mT: 'l' })}>
                <Card border className={cnMixSpace({ p: 'm' })} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <Text view="brand" size="m" weight="semibold" className={cnMixSpace({ mB: 'm' })}>
                    Проходы
                  </Text>

                  {isLoadUncorrects ? (
                        <Layout style={{ flex: '1 1 45%', minWidth: 400, alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader size="m" />
                        </Layout>
                  ) : (entriesUncorrect.length === 0) ? (
                    <Text size="s" view="secondary">Нет данных</Text>
                  ) : (
                    <Layout direction="column" style={{ gap: 'var(--space-s)' }}>
                      {entriesUncorrect.filter(item => (item.kig || item.inn || item.snils || item.okpdtr || item.country)).map((pass) => (
                        <Card
                          key={pass.employeeId + pass.date}
                          border
                          className={cnMixSpace({ p: 's' })}
                          style={{ background: 'var(--color-bg-secondary)' }}
                        >
                          <Layout direction="column" style={{ gap: 'var(--space-2xs)' }}>
                            <Layout direction="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                              <Text size="s" weight="semibold">{pass.object}</Text>
                              <Text size="s" view="secondary">{pass.date}</Text>
                            </Layout>
                            <Text size="s">{pass.fullName}</Text>
                          </Layout>
                        </Card>
                      ))}
                    </Layout>
                  )}
                </Card>
              </Layout>
            </Layout>
          </>
        )}
      </Layout>
    </Layout>
  );
};
export default FaceIDReport;