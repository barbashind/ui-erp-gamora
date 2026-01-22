import { ComboboxMultiple } from "../../global/ComboboxMultiple";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Layout } from "@consta/uikit/Layout"
import { useEffect, useState } from "react";
import { Text } from "@consta/uikit/Text";
import { DatePicker } from "@consta/uikit/DatePicker";
import { DataAnalysisForExcel, FaceregFilter, FilterMS, InputDataFacereg, InputDataMS, Organization, ProjectMS } from "../../types/integration-mstroy-types";
import { getCompanies, getProjectMS, mstroyDataFilter } from "../../services/IntegrationMSService";
import { Button } from "@consta/uikit/Button";
import { authFaceReg, getFaceregData } from "../../services/IntegrationFaceReg";
import { Gates } from "../../types/gates-types";
import { getGates } from "../../services/GatesManagmentService";
import { AntIcon } from "../../utils/AntIcon";
import { ReloadOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { formatDateEndOfDay, formatDateShort, formatDateStartOfDay } from "../../utils/formatDate";
import { exportToExcelAdvanced } from "./ExportToExcelAdvanced";

const MStroyReport = () => {
        const [projectsMS, setProjectsMS] = useState<ProjectMS[]> ([]);
        const [companies, setCompanies] = useState<Organization[]> ([]);
        
        const [isCompaniesLoading, setIsCompaniesLoading] = useState<boolean> (false);
        const [isProjectsMSLoading, setIsProjectsMSLoading] = useState<boolean> (false);

        const [selectedCompanies, setSelectedCompanies] = useState<Organization[]> ([]);
        const [selectedProjectsMS, setSelectedProjectsMS] = useState<ProjectMS[]> ([]);
        const today = new Date();
        const day = new Date();
        day.setDate(day.getDate() - 14);

        const [dateMin, setDateMin] = useState<Date | null> (day);
        const [dateMax, setDateMax] = useState<Date | null> (today);
        
        const [gates, setGates] = useState<Gates[]> ([]);

        const [faceregFilter, setFaceregFilter] = useState<FaceregFilter>(
                {
                        created_at__gte: formatDateStartOfDay(day),
                        created_at__lte: formatDateEndOfDay(today),
                }
        )

        const msFilterDef : FilterMS = 
                {
                        project_ids: [6],
                        organization_ids: [61],
                        date_range: {
                                date_begin: formatDateShort(day),
                                date_finish: formatDateShort(today),
                        },
                }

        const [msFilter, setMsFilter] = useState<FilterMS>(msFilterDef);

        // Инициализация данных
        useEffect(() => {
                setIsCompaniesLoading(true);
                setIsProjectsMSLoading(true);
                const getCompanyInfoData = async () => {
                        await getCompanies((resp) => {
                                setCompanies(resp);
                                setSelectedCompanies(resp);
                                setMsFilter((prev)=> ({...prev, organization_ids: resp.map((elem) => (elem.mstroyCompanyId))}))
                                setIsCompaniesLoading(false)
                        })
                }
                
                const getProjectInfoData = async () => {
                        await getProjectMS((resp) => {
                                setProjectsMS(resp);
                                setSelectedProjectsMS(resp);
                                setMsFilter((prev)=> ({...prev, project_ids: resp.map((elem) => (elem.projectId))}))
                                setIsProjectsMSLoading(false)
                        })
                }
                const getGatesInfoData = async () => {
                        await getGates((resp) => {
                               setGates(resp.filter((elem) => (elem.objectId === 1)))
                        })
                }

                void getCompanyInfoData();
                void getProjectInfoData();
                void getGatesInfoData();
                
        }, []);


        const [dataAnalysisForExcel, setDataAnalysisForExcel] = useState<DataAnalysisForExcel[]>([]);

        const [isLoadingDataAnalysisForExcel, setIsLoadingDataAnalysisForExcel] = useState<boolean>(false);
        
        function transformData(input: InputDataMS[], orgId: number): DataAnalysisForExcel[] {
        // Создаем Map для группировки по дате и подсчета статусов
                const dateMap = new Map<string, number>();
                
                input.forEach(item => {
                        if (item.status === 'APPEARANCE') {
                        const currentCount = dateMap.get(item.day) || 0;
                        dateMap.set(item.day, currentCount + 1);
                        }
                });
                
                // Преобразуем Map в массив объектов
                const result: DataAnalysisForExcel[] = [];
                
                dateMap.forEach((value, date) => {
                        result.push({
                        system: 'MStroy',
                        organization: companies.find((elem) => (orgId === elem.mstroyCompanyId))?.name ?? '',
                        mainOrganization: companies.find(el => (companies.find((elem) => (orgId === elem.mstroyCompanyId))?.mainCompanyID === el.companyId))?.name || companies.find((elem) => (orgId === elem.mstroyCompanyId))?.name || '',
                        date: date,
                        value: value,
                        });
                });
                
                // Сортируем по дате (опционально)
                result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                return result;
        }        
        
        interface EmployeeEvent {
                type: 'entry' | 'exit';
                date: string; // Дата в формате YYYY-MM-DD
                datetime: Date;
                employeeId: string;
                organization: string; // Подразделение
                mainOrganization: string; // Основная организация
                }

                interface ShiftGroup {
                date: string;
                organization: string;
                mainOrganization: string;
                employeeSet: Set<string>; // Уникальные сотрудники в этой группе
                }

        const transformFaceregData = (input: InputDataFacereg[]): DataAnalysisForExcel[] => {
        const employeeEvents = new Map<string, EmployeeEvent[]>();

        // Собираем все события (входы и выходы)
        input.forEach((item: InputDataFacereg) => {
                if (item.qrScan && item.qrScan.employee) {
                const employeeId = item.qrScan.employee.id;
                const eventDate = new Date(item.qrScan.createdAt);
                const dateStr = eventDate.toISOString().split('T')[0];
                const eventType = item.qrScan.status as 'entry' | 'exit';
                
                // Получаем название организации из gate.department.company.name
                const mainOrganization = item.qrScan.gate?.department?.company?.name || "";
                
                // Получаем подразделение из employee.departments[0].name или gate.department.name
                let organization = "";
                if (item.qrScan.employee.departments && item.qrScan.employee.departments.length > 0) {
                        // Берем первое подразделение из списка отделов сотрудника
                        organization = item.qrScan.employee.departments[0].name || "";
                } else if (item.qrScan.gate?.department?.name) {
                        // Если у сотрудника нет отделов, берем из gate
                        organization = item.qrScan.gate.department.name;
                }

                if (!employeeEvents.has(employeeId)) {
                        employeeEvents.set(employeeId, []);
                }

                employeeEvents.get(employeeId)!.push({
                        type: eventType,
                        date: dateStr,
                        datetime: eventDate,
                        employeeId,
                        organization,
                        mainOrganization
                });
                }
        });

        // Группируем смены по дате, организации и подразделению
        // Ключ: "date|organization|mainOrganization"
        const shiftsGrouped = new Map<string, ShiftGroup>();

        employeeEvents.forEach((events: EmployeeEvent[], employeeId: string) => {
                // Сортируем события по времени
                const sortedEvents = events.sort((a: EmployeeEvent, b: EmployeeEvent) => 
                a.datetime.getTime() - b.datetime.getTime()
                );
                
                // Для отслеживания уже найденных смен для этого сотрудника
                // по комбинации дата+организация+подразделение
                const usedShifts = new Set<string>(); // храним ключи "date|organization|mainOrganization"
                
                for (let i = 0; i < sortedEvents.length; i++) {
                const currentEvent = sortedEvents[i];
                
                if (currentEvent.type === 'entry') {
                        const shiftKey = `${currentEvent.date}|${currentEvent.organization}|${currentEvent.mainOrganization}`;
                        
                        // Проверяем, не учли ли уже смену для этого сотрудника в эту дату+организацию
                        if (usedShifts.has(shiftKey)) {
                        continue;
                        }
                        
                        // Ищем ближайший выход после этого входа
                        for (let j = i + 1; j < sortedEvents.length; j++) {
                        const nextEvent = sortedEvents[j];
                        
                        if (nextEvent.type === 'exit') {
                                const entryDate = new Date(currentEvent.date);
                                const exitDate = new Date(nextEvent.date);
                                
                                const timeDiff = exitDate.getTime() - entryDate.getTime();
                                const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
                                
                                if (dayDiff === 0 || dayDiff === 1) {
                                // Нашли завершенную смену
                                // Используем организацию и подразделение из события входа
                                const shiftDate = currentEvent.date;
                                const organization = currentEvent.organization;
                                const mainOrganization = currentEvent.mainOrganization;
                                
                                // Ключ для группировки
                                const groupKey = `${shiftDate}|${organization}|${mainOrganization}`;
                                
                                // Помечаем, что для этого сотрудника в эту группу уже учли смену
                                usedShifts.add(shiftKey);
                                
                                // Добавляем в соответствующую группу
                                if (!shiftsGrouped.has(groupKey)) {
                                        shiftsGrouped.set(groupKey, {
                                        date: shiftDate,
                                        organization: organization,
                                        mainOrganization: mainOrganization,
                                        employeeSet: new Set<string>()
                                        });
                                }
                                shiftsGrouped.get(groupKey)!.employeeSet.add(employeeId);
                                
                                // Пропускаем рассмотренные события
                                i = j;
                                break;
                                }
                        }
                        }
                }
                }
        });

        // Преобразуем в выходной формат
        const result: DataAnalysisForExcel[] = [];
        
        shiftsGrouped.forEach((groupData: ShiftGroup) => {
                result.push({
                system: 'FaceReg',
                date: groupData.date,
                value: groupData.employeeSet.size,
                organization: companies.find(el=> (el.name === groupData.organization)) ?  groupData.mainOrganization : (groupData.mainOrganization === 'ДСК АВТОБАН АО' ? 'АТФ АО ДСК АВТОБАН' : groupData.mainOrganization) ,
                mainOrganization: groupData.mainOrganization
                });
        });

        // Сортируем по дате, затем по организации
        result.sort((a: DataAnalysisForExcel, b: DataAnalysisForExcel) => {
                // Сначала по дате
                const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                if (dateCompare !== 0) return dateCompare;
                
                // Затем по основной организации
                const mainOrgCompare = a.mainOrganization.localeCompare(b.mainOrganization);
                if (mainOrgCompare !== 0) return mainOrgCompare;
                
                // Затем по подразделению
                return a.organization.localeCompare(b.organization);
        });

        return result;
        };

        const getMSInfoData = async () => {

                msFilter.organization_ids.map(async (el) => {
                        const req : FilterMS = {
                                organization_ids: [el],
                                project_ids: msFilter.project_ids,
                                date_range: msFilter.date_range
                        }
                        await mstroyDataFilter(req).then((resp) => {
                                setDataAnalysisForExcel(prev => [...prev, ...transformData(resp, el)])
                        })
                })
                        
                await authFaceReg({username: 'd.barbashin@avtoban.ru', password: 'kat-xy6-CVk-ziA'}).then(async () => {
                        const allFaceregData: InputDataFacereg[] = [];

                        const faceregPromises = gates.map((el) => 
                                new Promise<void>((resolve) => {
                                        getFaceregData(faceregFilter, el.faceregId, (resp) => {
                                        allFaceregData.push(...resp);
                                        resolve();
                                        });
                                })
                        );
                        
                        await Promise.all(faceregPromises);
                        setDataAnalysisForExcel(prev => ([...prev, ...transformFaceregData(allFaceregData).filter((elem) => dateMin ? (new Date(elem.date).getDate() >= new Date(dateMin).getDate() && new Date(elem.date).getMonth() >= new Date(dateMin).getMonth() && new Date(elem.date).getFullYear() >= new Date(dateMin).getFullYear()) : new Date(elem.date))]));
                        }).finally(() => {
                                setIsLoadingDataAnalysisForExcel(false);
                        })
                }

        return (
                <Layout direction="column">
                        <Layout direction="row" className={cnMixSpace({ mT: '2xl'})} style={{flexWrap: 'wrap'}}>
                                <Layout direction="column" className={cnMixSpace({ mL: 'xl'})}>
                                        <Text size="xs" className={cnMixSpace({ mB: '2xs'})}>Выберите проекты:</Text>
                                        <ComboboxMultiple
                                                value={selectedProjectsMS}
                                                onChange={(value) => {
                                                if (value) {
                                                        setSelectedProjectsMS(value);
                                                        setMsFilter((prev)=> ({...prev, project_ids: value.map((elem) => (elem.projectId))}))
                                                } else {
                                                        setSelectedProjectsMS([])
                                                        setMsFilter((prev)=> ({...prev, project_ids: []}))
                                                }
                                                } }
                                                items={projectsMS}
                                                getItemLabel={item => item.name ?? ''}
                                                getItemKey={item => item.projectId ?? 0}
                                                formatMultipleValue={count => `Выбрано - ${count}`}
                                                style={{maxWidth: '250px', minWidth: '200px'}}
                                                className={cnMixSpace({ mB: 'xl'})}
                                                isLoading={isProjectsMSLoading}
                                        />
                                </Layout>
                                <Layout direction="column" className={cnMixSpace({ mL: 'xl'})}>
                                        <Text size="xs" className={cnMixSpace({ mB: '2xs'})}>Выберите организации:</Text>
                                        <ComboboxMultiple
                                                value={selectedCompanies}
                                                onChange={(value) => {
                                                if (value) {
                                                        setSelectedCompanies(value);
                                                        setMsFilter((prev)=> ({...prev, organization_ids: value.map((elem) => (elem.mstroyCompanyId))}))
                                                } else {
                                                        setSelectedCompanies([])
                                                        setMsFilter((prev)=> ({...prev, organization_ids: []}))
                                                }
                                                } }
                                                items={companies}
                                                getItemLabel={item => item.name ?? ''}
                                                getItemKey={item => item.companyId ?? 0}
                                                formatMultipleValue={count => `Выбрано - ${count}`}
                                                style={{maxWidth: '250px', minWidth: '200px'}}
                                                className={cnMixSpace({ mB: 'xs'})}
                                                isLoading={isCompaniesLoading}
                                        />
                                        <Layout direction='row'>
                                                <Button
                                                        label={"Только собств."}
                                                        view="clear"
                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                <UserOutlined 
                                                                        className={cnMixFontSize('l') + cnMixSpace({mR:'xs'})}
                                                                />
                                                        ))}
                                                        size="xs"
                                                        onClick={() => {
                                                                setSelectedCompanies(companies.filter(el => (!el.mainCompanyID)));
                                                                setMsFilter((prev)=> ({...prev, organization_ids: companies.filter(el => (!el.mainCompanyID)).map((elem) => (elem.mstroyCompanyId))}))
                                                        }}
                                                />
                                                <Button
                                                        label={"Выбрать все"}
                                                        view="clear"
                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                <TeamOutlined 
                                                                        className={cnMixFontSize('l') + cnMixSpace({mR:'xs'})}
                                                                />
                                                        ))}
                                                        size="xs"
                                                        onClick={() => {
                                                                setSelectedCompanies(companies);
                                                                setMsFilter((prev)=> ({...prev, organization_ids: companies.map((elem) => (elem.mstroyCompanyId))}))   
                                                        }}
                                                />
                                        </Layout>
                                </Layout>
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
                                                                                setMsFilter((prev)=> ({...prev, date_range: {date_begin: formatDateShort(value), date_finish: prev.date_range.date_finish}}))
                                                                                setFaceregFilter((prev) => ({...prev, created_at__gte: formatDateStartOfDay(value)}))
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
                                                                                setMsFilter((prev)=> ({...prev, date_range: {date_begin: prev.date_range.date_begin, date_finish: formatDateShort(value)}}))
                                                                                setFaceregFilter((prev) => ({...prev, created_at__lte: formatDateEndOfDay(value)}))
                                                                        }
                                                        }}
                                                />  
                                        </Layout>
                                </Layout>

                                <Button
                                        label={"Собрать данные"}
                                        size="s"
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                        <ReloadOutlined 
                                                                className={cnMixFontSize('l') + cnMixSpace({mR:'xs'})}
                                                        />
                                                ))}
                                        view="primary"
                                        onClick={()=> {
                                                setIsLoadingDataAnalysisForExcel(true);
                                                setDataAnalysisForExcel([]);
                                                void getMSInfoData();
                                        }}
                                        disabled={isLoadingDataAnalysisForExcel}
                                        className={cnMixSpace({ mL: 'xl', mT: 'xl'  })}
                                />
                                <Button
                                        label={"Сформировать отчет"}
                                        size="s"
                                        view="primary"
                                        onClick={()=> {
                                                exportToExcelAdvanced(dataAnalysisForExcel, 'Отчет по FaceID.xlsx')
                                        }}
                                        disabled={isLoadingDataAnalysisForExcel || dataAnalysisForExcel.length === 0}
                                        className={cnMixSpace({ mL: 'xl', mT: 'xl'  })}
                                />
                        </Layout>
                        
                        
                </Layout>
        )
}
export default MStroyReport;