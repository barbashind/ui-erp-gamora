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
import { OvisionFilter, PassageRecord } from "../../types/integration-ovision";
import { Column } from "@consta/charts/Column";
// import { TextField } from "@consta/uikit/TextField";
// import { ComboboxSingle } from "../../global/ComboboxSingle";

export interface MergedItem {
  date: string;
  object: string;
  employeeId: number;
  fullName: string;
  organization: string;
}

export interface AggregatedItem {
  organization: string;
  date: string;
  object: string;
  count: number;
}

const FaceIDFilter = () => {
        
        const today = new Date();
        const day = new Date();
        day.setDate(day.getDate() - 14);

        const [dateMin, setDateMin] = useState<Date | null> (day);
        const [dateMax, setDateMax] = useState<Date | null> (today);

        const [data, setData] = useState<MergedItem[]> ([]);
        const [dataAgr, setDataAgr] = useState<AggregatedItem[]> ([]);

        const [isLoadingDataAnalysis, setIsLoadingDataAnalysis] = useState<boolean>(false);

        const buildMergedItems = (
                events: PassageRecord[],
                deptToOrg: Map<string, string>
                ): MergedItem[] => {
                const enriched: MergedItem[] = [];

                for (const ev of events) {
                const zone = ev.event.zone;
                let objectName = '';
                if (zone === 'Outer area→Родниковая 22' || zone === 'Родниковая 22→Outer area') {
                objectName = 'СБВ';
                } else {
                objectName = 'Другая зона';
                }

                const department = ev.department || '';
                const organization = deptToOrg.get(department) || 'Неизвестно';
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
                const groupedByDate = new Map<string, Map<number, MergedItem>>();
                for (const item of enriched) {
                if (!groupedByDate.has(item.date)) {
                groupedByDate.set(item.date, new Map());
                }
                const dateMap = groupedByDate.get(item.date)!;
                if (!dateMap.has(item.employeeId)) {
                dateMap.set(item.employeeId, item);
                }
                }

                const result: MergedItem[] = [];
                for (const dateMap of groupedByDate.values()) {
                result.push(...Array.from(dateMap.values()));
                }

                return result;
                };

                useEffect(() => {
                        const loadData = async () => {
                        setIsLoadingDataAnalysis(true);
                        try {
                                const token : OvisionToken = await authOvision()
                                const filter : OvisionFilter = {
                                        dateFrom: dateMin?.toISOString() || '',
                                        dateTo: dateMax?.toISOString() || '',
                                        }
                                const events = await getOvisionData(filter, token.access_token);
                                const deptMap = await fetchDepartmentTree(token.access_token);
                                const merged = buildMergedItems(events.data, deptMap);
                                setData(merged);
                                const aggregateByOrganizationDateObject = (
                                        items: MergedItem[]
                                        ): AggregatedItem[] => {
                                        const map = new Map<string, AggregatedItem>();

                                        for (const item of items) {
                                        const key = `${item.organization}|${item.date}|${item.object}`;
                                        const existing = map.get(key);
                                        if (existing) {
                                        existing.count += 1;
                                        } else {
                                        map.set(key, {
                                                organization: item.organization,
                                                date: item.date,
                                                object: item.object,
                                                count: 1,
                                        });
                                        }
                                        }

                                return Array.from(map.values());
                                };
                                setDataAgr(aggregateByOrganizationDateObject(merged))

                        } finally {
                                setIsLoadingDataAnalysis(false);
                        }
                        };

                        loadData();
                }, [dateMin, dateMax]);
                        
                useEffect(() => {
                        const aggregateByOrganizationDateObject = (
                                        items: MergedItem[]
                                        ): AggregatedItem[] => {
                                        const map = new Map<string, AggregatedItem>();

                                        for (const item of items) {
                                        const key = `${item.organization}|${item.date}|${item.object}`;
                                        const existing = map.get(key);
                                        if (existing) {
                                        existing.count += 1;
                                        } else {
                                        map.set(key, {
                                                organization: item.organization,
                                                date: item.date,
                                                object: item.object,
                                                count: 1,
                                        });
                                        }
                                        }

                                return Array.from(map.values());
                                };
                        setDataAgr(aggregateByOrganizationDateObject(data))
                }, [data]);


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
                                                                                setDateMin(value);
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
                                                                                setDateMax(value);
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
                                        <Layout direction="row" style={{flexWrap: 'wrap'}} >
                                                <Card border style={{minWidth: '45vw', maxWidth: '80vw'}} className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm'})}>
                                                        <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's'})}>Сравнение данных Mstroy и FaceReg </Text>
                                                        {/* <Line
                                                                // data={dataAnalysis} 
                                                                xField="date" 
                                                                yField="value"
                                                                seriesField="system"
                                                                slider={{
                                                                        start: 0,
                                                                        end: 1,
                                                                }}
                                                                color={Object.keys(colorMapLine).map((key) => colorMapLine[key])}
                                                        /> */}
                                                </Card>
                                                <Card border style={{minWidth: '45vw', maxWidth: '80vw'}} className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm'})}>
                                                        <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's'})}>Численность по СКУД</Text>
                                                        <Column
                                                                data={dataAgr} 
                                                                xField="date" 
                                                                yField="count"
                                                                seriesField="object"
                                                                slider={{
                                                                        start: 0,
                                                                        end: 1,
                                                                }}
                                                                isGroup
                                                                color={Object.keys(colorMapLine).map((key) => colorMapLine[key])}
                                                        />
                                                </Card>
                                                 

                                        </Layout>
                                       
                                )}
                                

                                
                        </Layout>
                        
                </Layout>
        )
}
export default FaceIDFilter;