
import { Layout } from "@consta/uikit/Layout";
import { Card } from "@consta/uikit/Card";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from '@consta/uikit/Text';
import { Loader } from '@consta/uikit/Loader';
import { Bar } from '@consta/charts/Bar';
import { useEffect, useState } from "react";
import { DepartmentTree } from "../../types/integration-ovision";
import { authOvision, fetchDepartmentTree, getOvisionPeopleBioData, OvisionToken } from "../../services/IntegrationOvisionRS";
import { authOvisionKBS, fetchDepartmentTreeKBS, getOvisionPeopleBioDataKBS, OvisionTokenKBS } from "../../services/IntegrationOvisionKBS";


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

export interface MergedBioItem {
  employeeId: number | string;
  organization: string;
}

export interface AggregatedBioItem {
  organization: string;
  count: number;
}

const FaceIDReport = () => {
        
const [isLoadPeople, setIsLoadPeople] = useState<boolean>(true);

const [bioData, setBioData] = useState<AggregatedBioItem[]>([]);
const [bioDataKBS, setBioDataKBS] = useState<AggregatedBioItem[]>([]);

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

// Основной useEffect
useEffect(() => {
        const processOvisionBioData = async (): Promise<MergedBioItem[]> => {
        const token: OvisionToken = await authOvision();
        const deptTree = await fetchDepartmentTree(token.access_token);

        const people = await getOvisionPeopleBioData(token.access_token);
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
        setBioData(aggregateItemsBio(enrichedPeople))
        return enrichedPeople;
        }

        const processOvisionBioDataKBS = async (): Promise<MergedBioItem[]> => {
        const token: OvisionTokenKBS= await authOvisionKBS();
        const deptTree = await fetchDepartmentTreeKBS(token.access_token);

        const people = await getOvisionPeopleBioDataKBS(token.access_token);
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
        setBioDataKBS(aggregateItemsBio(enrichedPeople))
        return enrichedPeople;
        }

        const loadAllData = async () => {
                        setIsLoadPeople(true);
                        
        try {
                void processOvisionBioData();
                void processOvisionBioDataKBS();

        } catch (err) {
                console.error("Ошибка загрузки данных:", err);
        } finally {
                        setIsLoadPeople(false);
        }}

        loadAllData();
  
}, []);

const colorMapLine: { [key: string]: string } = {
                a: '#063955',
                b: '#ed7931',
                c: 'rgb(40, 116, 252)',
                d: 'rgb(255, 210, 50)',
                e: 'rgba(177, 169, 255, 1)',
        };

return (
    <Layout direction="column">
      <Layout
        direction="row"
        style={{ flexWrap: 'wrap', gap: 'var(--space-m)' }}
        className={cnMixSpace({ mT: 'l', mL: 'xl' })}
      >
        {/* Всего объектов */}
        <Card border className={cnMixSpace({ p: 'm' })} style={{ minWidth: 55, flex: '1 1 50px' }}>
                        <Text size="2xl" view="secondary">
                                Зарегистрировано в Мой ID
                        </Text>
                        {isLoadPeople ? (<Loader/>) :
                                (<Text size="4xl" weight="bold" view="brand" >
                                        {bioData.length}
                                </Text>)
                        }
        </Card>
        <Card border className={cnMixSpace({ p: 'm' })} style={{ minWidth: 55, flex: '1 1 50px' }}>
                        <Text size="2xl" view="secondary">
                                Зарегистрировано в КБС
                        </Text>
                        {isLoadPeople ? (<Loader/>) :
                                (<Text size="4xl" weight="bold" view="brand" >
                                        {bioDataKBS.length}
                                </Text>)
                        }
        </Card>

      </Layout>

            {/* ================ НИЖНЯЯ ЧАСТЬ: ДВЕ КОЛОНКИ ================ */}
            <Layout direction="row" style={{ flexWrap: 'wrap', gap: 'var(--space-l)', alignItems: 'flex-start' }} className={cnMixSpace({ mT: 'l', mL: 'xl' })}>

              {/* -------- ЛЕВАЯ КОЛОНКА -------- */}
              <Layout direction="column" style={{ flex: '1 1 45%', minWidth: 400 }}>
                <Card border  className={cnMixSpace({ mT: 'l', p: 'm' })}>
                <Layout direction="column">
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
                        color={Object.keys(colorMapLine).map((key) => colorMapLine[key])}
                />
                </Layout>
              </Card>
              </Layout>

              {/* -------- ПРАВАЯ КОЛОНКА: СПИСОК НЕКОРРЕКТНЫХ ПРОХОДОВ -------- */}
               <Layout direction="column" style={{ flex: '1 1 45%', minWidth: 400 }}>
                <Card border  className={cnMixSpace({ mT: 'l',  p: 'm' })}>
                <Layout direction="column">
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
      </Layout>
    </Layout>
  );
};
export default FaceIDReport;