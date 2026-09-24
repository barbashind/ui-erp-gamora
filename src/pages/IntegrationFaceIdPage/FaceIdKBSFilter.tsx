import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Layout } from "@consta/uikit/Layout"
import { useEffect, useState } from "react";
import { Text } from "@consta/uikit/Text";
import { DatePicker } from "@consta/uikit/DatePicker";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { DownloadOutlined, SearchOutlined, 
  // , DownOutlined, UpOutlined 
} from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { Loader } from "@consta/uikit/Loader";
import { Card } from "@consta/uikit/Card";
import { authOvision, fetchDepartmentTree, getOvisionData, getOvisionPeopleData, getOvisionPersonData, OvisionToken } from "../../services/IntegrationOvisionKBS";
import { OvisionFilter } from "../../types/integration-ovision";
import { Column } from "@consta/charts/Column";
import { Bar } from '@consta/charts/Bar';
import { exportToExcelReport } from "./ExportToExcelReport";
import { TextField } from "@consta/uikit/TextField";

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

export interface MergedBioItem {
  employeeId: number | string;
  organization: string;
}

export interface AggregatedBioItem {
  organization: string;
  count: number;
}

const FaceIdKBSFilter = () => {
  const today = new Date();
  const day = new Date();
  day.setDate(day.getDate() - 14);

  const objects = [
    { id: 0, name: 'ВСМ-1' },
    { id: 1, name: 'Аэропорт Горноалтайск' },
    { id: 2, name: 'Аэропорт Курган' },
    { id: 3, name: 'Аэропорт Светлогорск' },
    { id: 4, name: 'Северный обход г.Омска' },
    { id: 5, name: 'Аэропорт Семязино' },
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
    const deptMap = await fetchDepartmentTree(token.access_token);

    const people = await getOvisionPeopleData(token.access_token);
    const enrichedPeople: MergedBioItem[] = [];
    for (const ev of people.data) {
      const department = ev.profiles[0].department || '';
      const organization = deptMap.get(department) || 'Неизвестно';
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
      if (zone === 'Выход→ВСМ-1' || zone === 'ВСМ-1→Выход') {
        objectName = 'ВСМ-1';
      } else if (zone === 'Выход→Аэропорт Горноалтайск' || zone === 'Аэропорт Горноалтайск→Выход') {
        objectName = 'Аэропорт Горноалтайск';
      } else if (zone === 'Выход→Аэропорт Курган' || zone === 'Аэропорт Курган→Выход') {
        objectName = 'Аэропорт Курган';
      } else if (zone === 'Выход→Аэропорт Светлогорск' || zone === 'Аэропорт Светлогорск→Выход') {
        objectName = 'Аэропорт Светлогорск';
      } else if (zone === 'Выход→Северный обход г.Омска' || zone === 'Северный обход г.Омска→Выход') {
        objectName = 'Северный обход г.Омска';
      } else if (zone === 'Выход→Аэропорт Семязино' || zone === 'Аэропорт Семязино→Выход') {
        objectName = 'Аэропорт Семязино';
      }
      else {
        objectName = 'ВСМ-1';
      }
      const department = ev.department || '';
      const organization = (department.toLowerCase().includes('автоколонна')) ? 'АТФ' : (deptMap.get(department) || 'Неизвестно');
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

        



        // 4. Параллельная загрузка Ovision и IDGate
        const [ovisionItems, ovisionBioItems] = await Promise.all([
          processOvisionData(dateMin, dateMax),
          processOvisionBioData(),
        ]);

        // 5. Объединение
        const mergedAll = [...ovisionItems];
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
  }, [dateMin, dateMax]); // Зависимости только dateMin, dateMax

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

  const [name, setName] = useState<string | null>(null);
  const [tabNum, setTabNum] = useState<string | null>(null);

  const searchPerson = async (name : string, tabNum: string) => {
    const token: OvisionToken = await authOvision();
    const person = await getOvisionPersonData(token.access_token, name, tabNum);
    console.log(person)
  }

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

      <Layout direction="row" className={cnMixSpace({ mT: '2xl' })} style={{ flexWrap: 'wrap' }}>
        <TextField 
          label="Имя"
          value={name}
          onChange={(value)=> setName(value)}
          className={cnMixSpace({ mL: 'xl', mT: 'xl' })}
        />
        <TextField 
          label="Таб. номер"
          value={tabNum}
          onChange={(value)=> setTabNum(value)}
          className={cnMixSpace({ mL: 'xl', mT: 'xl' })}
        />
        <Button
          label="Найти"
          size="s"
          iconLeft={AntIcon.asIconComponent(() => <SearchOutlined className={cnMixFontSize('l') + cnMixSpace({ mR: 'xs' })} />)}
          view="secondary"
          onClick={() => void searchPerson(name ? name : '', tabNum ? tabNum : '')}
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

            {/* <Card border style={{ minWidth: '45vw', maxWidth: '80vw' }} className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm' })}>
              <Layout direction="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text view="brand" size="l" weight="semibold">Статистика по регистрации биометрии</Text>
                <Button
                    view="clear"
                    iconLeft={!viewStat ? 
                        AntIcon.asIconComponent(() => <DownOutlined className={cnMixFontSize('l')} />) 
                        : 
                        AntIcon.asIconComponent(() => <UpOutlined className={cnMixFontSize('l')} />)
                      }
                    onClick={() => {setViewStat(!viewStat)}}
                  />
                  
              </Layout>
              {viewStat && (
                    <Layout direction="column">
                      <Layout direction="row" style={{ alignItems: 'center' }} className={cnMixSpace({p:'xs'})}>
                        <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" weight="bold" align="center">Объект</Text>
                        <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" weight="bold" align="center">Организация</Text>
                        <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" weight="bold" align="center">Загружено в СКУД</Text>
                        <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" weight="bold" align="center">С биометрией</Text>
                        <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" weight="bold" align="center">Проходят СКУД</Text>
                      </Layout>

                      <Layout direction="row" className={cnMixSpace({p:'xs'})} style={{border: '1px solid ', borderRadius:'9px', alignItems: 'center'}} >
                        <Text style={{ minWidth: '150px', maxWidth: '150px' }} align="center">СБВ</Text>
                        <Layout direction="column">
                          <Layout direction="row" style={{alignItems: 'center'}}>
                            <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" align="center">ООО "Ромашка"</Text>
                            <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" align="center">145</Text>
                            <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" align="center">45 (32%)</Text>
                            <Layout direction="column">
                              <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s" >В среднем за день: 23</Text>
                              <Text style={{ minWidth: '150px', maxWidth: '150px' }} size="s">Всего: 23</Text>
                            </Layout>
                            
                          </Layout>
                        </Layout>
                      </Layout>

                    </Layout>
                  )}
              
            </Card> */}
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

export default FaceIdKBSFilter;