
import { Layout } from "@consta/uikit/Layout";
import { Card } from "@consta/uikit/Card";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from '@consta/uikit/Text';
import { Loader } from '@consta/uikit/Loader';
import { Bar } from '@consta/charts/Bar';
import { useEffect, useState } from "react";
import { DepartmentTree } from "../../types/integration-ovision";
import { authOvision, fetchDepartmentTree, getOvisionPeopleBioData, getOvisionPeopleData, OvisionToken } from "../../services/IntegrationOvisionRS";
import { authOvisionKBS, fetchDepartmentTreeKBS, getOvisionPeopleBioDataKBS, getOvisionPeopleDataKBS, OvisionTokenKBS } from "../../services/IntegrationOvisionKBS";


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

export interface MergedPersonItem {
  employeeId: number | string;
  name: string;
  organization: string;
  statusRS: boolean;
  statusKBS: boolean;
}


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

const [persons, setPersons] = useState<MergedPersonItem[]>([]);
const [personsNot, setPersonsNot] = useState<MergedPersonItem[]>([]);
const [personsKBS, setPersonsKBS] = useState<MergedPersonItem[]>([]);
const [personsKBSNot, setPersonsKBSNot] = useState<MergedPersonItem[]>([]);
const [personsAll, setPersonsAll] = useState<MergedPersonItem[]>([]);

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

        const processOvisionData = async (): Promise<MergedBioItem[]> => {
        const token: OvisionToken = await authOvision();
        const deptTree = await fetchDepartmentTree(token.access_token);

        const people = await getOvisionPeopleData(token.access_token);
        const enrichedPeople: MergedPersonItem[] = [];
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
                name: ev.name,
                statusKBS: false,
                statusRS: false
        });
        }
        setPersonsNot(enrichedPeople)
        return enrichedPeople;
        }

        const processOvisionDataKBS = async (): Promise<MergedBioItem[]> => {
        const token: OvisionTokenKBS= await authOvisionKBS();
        const deptTree = await fetchDepartmentTreeKBS(token.access_token);

        const people = await getOvisionPeopleDataKBS(token.access_token);
        const enrichedPeople: MergedPersonItem[] = [];
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
                name: ev.name,
                statusKBS: false,
                statusRS: false,
        });
        }
        setPersonsKBSNot(enrichedPeople)
        return enrichedPeople;
        }

        const processOvisionBioData = async (): Promise<MergedBioItem[]> => {
        const token: OvisionToken = await authOvision();
        const deptTree = await fetchDepartmentTree(token.access_token);

        const people = await getOvisionPeopleBioData(token.access_token);
        const enrichedPeople: MergedBioItem[] = [];
        const enrichedPeople1: MergedPersonItem[] = [];

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
        enrichedPeople1.push({
                employeeId: ev.id,
                organization,
                name: ev.name,
                statusKBS: false,
                statusRS: true,
        });
        }
        setPersons(enrichedPeople1);
        setBioData(aggregateItemsBio(enrichedPeople));
        return enrichedPeople;
        }

        const processOvisionBioDataKBS = async (): Promise<MergedBioItem[]> => {
        const token: OvisionTokenKBS= await authOvisionKBS();
        const deptTree = await fetchDepartmentTreeKBS(token.access_token);

        const people = await getOvisionPeopleBioDataKBS(token.access_token);
        const enrichedPeople: MergedBioItem[] = [];
        const enrichedPeople1: MergedPersonItem[] = [];
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
        enrichedPeople1.push({
                employeeId: ev.id,
                organization,
                name: ev.name,
                statusKBS: true,
                statusRS: false,
        });
        }
        setPersonsKBS(enrichedPeople1);
        setBioDataKBS(aggregateItemsBio(enrichedPeople))
        return enrichedPeople;
        }

        const loadAllData = async () => {
                        setIsLoadPeople(true);
                        
        try {
                void processOvisionBioData();
                void processOvisionBioDataKBS();
                void processOvisionData();
                void processOvisionDataKBS();

        } catch (err) {
                console.error("Ошибка загрузки данных:", err);
        } finally {
                        setIsLoadPeople(false);
        }}

        loadAllData();
  
}, []);

useEffect(() => {
  const map = new Map<string, MergedPersonItem>();

  const merge = (list: MergedPersonItem[]) => {
    for (const item of list) {
      // Ключ: name + organization. Разделитель обязателен, иначе "ab"+"c" == "a"+"bc"
      const key = `${item.name}||${item.organization}`;
      const existing = map.get(key);

      if (existing) {
        existing.statusRS = existing.statusRS || item.statusRS;
        existing.statusKBS = existing.statusKBS || item.statusKBS;
      } else {
        map.set(key, { ...item });
      }
    }
  };

  merge(persons);
  merge(personsNot);
  merge(personsKBS);
  merge(personsKBSNot);

  setPersonsAll(Array.from(map.values()));
}, [persons, personsNot, personsKBS, personsKBSNot]);

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
        {/* Всего  */}
        <Card border className={cnMixSpace({ p: 'm' })} style={{ minWidth: 260, flex: '1 1 240px' }}>
                  <Text size="2xl" view="secondary" className={cnMixSpace({ mB: 'xs' })}>
                    Всего в OVISION
                  </Text>
                  <Layout direction="row" style={{ gap: 'var(--space-l)', alignItems: 'baseline' }}>
                    
                    <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
                      <Text size="m" view="secondary">Зарегистрировано</Text>
                      {isLoadPeople ? (<Loader/>) :
                      ((<Text size="4xl" weight="bold" view="brand" >
                                        {personsAll.filter(item=> (item.statusKBS || item.statusRS)).length}
                                </Text>))
                      }
                    </Layout>
                    <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
                      <Text size="m" view="secondary">Осталось</Text>
                      {isLoadPeople ? (<Loader/>) :
                      ((<Text size="4xl" weight="bold" view="brand" >
                                        {personsAll.filter(item=> (!item.statusKBS && !item.statusRS)).length}
                                </Text>))
                      }
                    </Layout>
                  </Layout>
          </Card>

          <Card border className={cnMixSpace({ p: 'm' })} style={{ minWidth: 260, flex: '1 1 240px' }}>
                  <Text size="2xl" view="secondary" className={cnMixSpace({ mB: 'xs' })}>
                    Мой ID
                  </Text>
                  <Layout direction="row" style={{ gap: 'var(--space-l)', alignItems: 'baseline' }}>
                    
                    <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
                      <Text size="m" view="secondary">Зарегистрировано</Text>
                      {isLoadPeople ? (<Loader/>) :
                      ((<Text size="4xl" weight="bold" view="brand" >
                                        {personsAll.filter(item=> (item.statusRS)).length}
                                </Text>))
                      }
                    </Layout>
                    <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
                      <Text size="m" view="secondary">Осталось</Text>
                      {isLoadPeople ? (<Loader/>) :
                      ((<Text size="4xl" weight="bold" view="brand" >
                                        {personsAll.filter(item=> (!item.statusRS)).length}
                                </Text>))
                      }
                    </Layout>
                  </Layout>
          </Card>

          <Card border className={cnMixSpace({ p: 'm' })} style={{ minWidth: 260, flex: '1 1 240px' }}>
                  <Text size="2xl" view="secondary" className={cnMixSpace({ mB: 'xs' })}>
                    Госуслуги биометрия
                  </Text>
                  <Layout direction="row" style={{ gap: 'var(--space-l)', alignItems: 'baseline' }}>
                    
                    <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
                      <Text size="m" view="secondary">Зарегистрировано</Text>
                      {isLoadPeople ? (<Loader/>) :
                      ((<Text size="4xl" weight="bold" view="brand" >
                                        {personsAll.filter(item=> (item.statusKBS)).length}
                                </Text>))
                      }
                    </Layout>
                    <Layout direction="column" style={{ minWidth: 80, flex: '1 1 80px' }}>
                      <Text size="m" view="secondary">Осталось</Text>
                      {isLoadPeople ? (<Loader/>) :
                      ((<Text size="4xl" weight="bold" view="brand" >
                                        {personsAll.filter(item=> (!item.statusKBS)).length}
                                </Text>))
                      }
                    </Layout>
                  </Layout>
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
                        data={bioDataKBS}
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