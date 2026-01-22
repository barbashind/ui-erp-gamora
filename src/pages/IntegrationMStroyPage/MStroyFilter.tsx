import { ComboboxMultiple } from "../../global/ComboboxMultiple";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Layout } from "@consta/uikit/Layout"
import { useEffect, useState } from "react";
import { Text } from "@consta/uikit/Text";
import { DatePicker } from "@consta/uikit/DatePicker";
import { DataAnalysis, FaceregFilter, FilterMS, InputDataFacereg, InputDataMS, Organization, ProjectMS,
        //  UnfireData 
        } from "../../types/integration-mstroy-types";
import { getCompanies, getProjectMS, mstroyDataFilter, 
        // mstroyDataUnfire 
} from "../../services/IntegrationMSService";
import { Button } from "@consta/uikit/Button";
import { Line } from '@consta/charts/Line';
import { Column } from '@consta/charts/Column';
import { authFaceReg, getFaceregData } from "../../services/IntegrationFaceReg";
import { Gates } from "../../types/gates-types";
import { getGates } from "../../services/GatesManagmentService";
import { AntIcon } from "../../utils/AntIcon";
import { ReloadOutlined, TeamOutlined, UserOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { Loader } from "@consta/uikit/Loader";
import { formatDateEndOfDay, formatDateShort, formatDateStartOfDay } from "../../utils/formatDate";
import { Card } from "@consta/uikit/Card";
// import { TextField } from "@consta/uikit/TextField";
// import { ComboboxSingle } from "../../global/ComboboxSingle";

const MStroyFilter = () => {
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

        const [dataAnalysis, setDataAnalysis] = useState<DataAnalysis[]>([]);
        const [handleDataAnalysis, setHandleDataAnalysis] = useState<DataAnalysis[]>([]);


        // Обновление данных
        useEffect(() => {
                setHandleDataAnalysis(
                        [
                                ...dataAnalysis.filter(el=> el.system === 'FaceReg').map((elem)=> ({...elem, system: 'FaceID (%)', value: (dataAnalysis?.find(el=> (el.system === 'MStroy' && el.date === elem.date))?.value ?? 0) > elem.value ? Number(((elem.value * 100 / (dataAnalysis?.find(el=> (el.system === 'MStroy' && el.date === elem.date))?.value ?? 1)).toFixed(0))) : 100 })), 
                                ...dataAnalysis.filter(el=> el.system === 'MStroy').map((elem)=> (
                                        {
                                                ...elem, system: 'Вручную (%)', 
                                                value: (elem.value > (dataAnalysis?.find(el=> (el.system === 'FaceReg' && el.date === elem.date))?.value ?? 0)) ? 
                                                Number(((elem.value - (dataAnalysis?.find(el=> (el.system === 'FaceReg' && el.date === elem.date))?.value ?? 0)) * 100 / (dataAnalysis?.find(el=> (el.system === 'MStroy' && el.date === elem.date))?.value ?? 1)).toFixed(0)) :
                                                0
                                        }
                                ))
                        ])
        }, [dataAnalysis]);

        const [isLoadingDataAnalysis, setIsLoadingDataAnalysis] = useState<boolean>(false);
        
        function transformData(input: InputDataMS[]): DataAnalysis[] {
        // Создаем Map для группировки по дате и подсчета статусов
                const dateMap = new Map<string, number>();
                
                input.forEach(item => {
                        if (item.status === 'APPEARANCE') {
                        const currentCount = dateMap.get(item.day) || 0;
                        dateMap.set(item.day, currentCount + 1);
                        }
                });
                
                // Преобразуем Map в массив объектов
                const result: DataAnalysis[] = [];
                
                dateMap.forEach((value, date) => {
                        result.push({
                        system: 'MStroy',
                        date: date,
                        value: value
                        });
                });
                
                // Сортируем по дате (опционально)
                result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                
                return result;
        }        
        
        function transformFaceregData(input: InputDataFacereg[]): DataAnalysis[] {
                interface EmployeeEvent {
                        type: 'entry' | 'exit';
                        date: string; // Дата в формате YYYY-MM-DD
                        datetime: Date;
                        employeeId: string;
                }

                const employeeEvents = new Map<string, EmployeeEvent[]>();

                // Собираем все события (входы и выходы)
                input.forEach(item => {
                        if (item.qrScan && item.qrScan.employee) {
                        const employeeId = item.qrScan.employee.id;
                        const eventDate = new Date(item.qrScan.createdAt);
                        const dateStr = eventDate.toISOString().split('T')[0];
                        const eventType = item.qrScan.status as 'entry' | 'exit';

                        if (!employeeEvents.has(employeeId)) {
                                employeeEvents.set(employeeId, []);
                        }

                        employeeEvents.get(employeeId)!.push({
                                type: eventType,
                                date: dateStr,
                                datetime: eventDate,
                                employeeId
                        });
                        }
                });

                // Для отслеживания уже учтенных смен сотрудников по дням
                const employeeShiftsByDay = new Map<string, Set<string>>(); // date -> Set of employeeIds

                employeeEvents.forEach((events, employeeId) => {
                        // Сортируем события по времени
                        const sortedEvents = events.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());
                        
                        // Для отслеживания уже найденных смен для этого сотрудника
                        const usedShifts = new Set<string>(); // храним даты смен, которые уже учли
                        
                        for (let i = 0; i < sortedEvents.length; i++) {
                        const currentEvent = sortedEvents[i];
                        
                        if (currentEvent.type === 'entry') {
                                // Проверяем, не учли ли уже смену для этого сотрудника в этот день
                                if (usedShifts.has(currentEvent.date)) {
                                continue; // Уже учли смену в этот день, пропускаем
                                }
                                
                                // Ищем ближайший выход после этого входа
                                for (let j = i + 1; j < sortedEvents.length; j++) {
                                const nextEvent = sortedEvents[j];
                                
                                if (nextEvent.type === 'exit') {
                                        const entryDate = new Date(currentEvent.date);
                                        const exitDate = new Date(nextEvent.date);
                                        
                                        const timeDiff = exitDate.getTime() - entryDate.getTime();
                                        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 16));
                                        
                                        if (dayDiff === 0 || dayDiff === 1) {
                                        // Нашли завершенную смену
                                        const shiftDate = currentEvent.date;
                                        
                                        // Помечаем, что для этого сотрудника в эту дату уже учли смену
                                        usedShifts.add(shiftDate);
                                        
                                        // Добавляем в общий результат
                                        if (!employeeShiftsByDay.has(shiftDate)) {
                                                employeeShiftsByDay.set(shiftDate, new Set());
                                        }
                                        employeeShiftsByDay.get(shiftDate)!.add(employeeId);
                                        
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
                const result: DataAnalysis[] = [];
                
                employeeShiftsByDay.forEach((employeeSet, date) => {
                        result.push({
                        system: 'FaceReg',
                        date: date,
                        value: employeeSet.size
                        });
                });

                // Сортируем по дате
                result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return result;
                }

        const getMSInfoData = async () => {
                        await mstroyDataFilter(msFilter).then((resp) => {
                                setDataAnalysis(prev => [...prev, ...transformData(resp)])
                        }).then(async () => {
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
                                        setDataAnalysis(prev => ([...prev, ...transformFaceregData(allFaceregData).filter((elem) => dateMin ? (new Date(elem.date).getDate() >= new Date(dateMin).getDate() && new Date(elem.date).getMonth() >= new Date(dateMin).getMonth() && new Date(elem.date).getFullYear() >= new Date(dateMin).getFullYear()) : new Date(elem.date))]));
                                        }).finally(() => {
                                                setIsLoadingDataAnalysis(false);
                                        })
                                })
                }

        const colorMapLine: { [key: string]: string } = {
                MStroy: '#063955',
                FaceReg: '#ed7931',
        };

        // const [name, setName] = useState<string | null> (null);
        // const [lastName, setLastName] = useState<string | null> (null);
        // const [surname, setSurname] = useState<string | null> (null);
        // const [tableNumber, setTableNumber] = useState<string | null> (null);
        // const [organization, setOrganization] = useState<Organization | null> (null);
        
        // const sendUnfireData = async () => {
        //                 const body : UnfireData = {
        //                         first_name: name,
        //                         last_name: lastName,
        //                         surname: surname,
        //                         table_number: tableNumber,
        //                         organization_id: organization?.mstroyCompanyId ?? 61
        //                 }
        //                 await mstroyDataUnfire(body)
        //         }
        
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
                                        label={"Получить данные"}
                                        size="s"
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                        <ReloadOutlined 
                                                                className={cnMixFontSize('l') + cnMixSpace({mR:'xs'})}
                                                        />
                                                ))}
                                        view="primary"
                                        onClick={()=> {
                                                setIsLoadingDataAnalysis(true);
                                                setDataAnalysis([]);
                                                void getMSInfoData();
                                        }}
                                        disabled={isLoadingDataAnalysis}
                                        className={cnMixSpace({ mL: 'xl', mT: 'xl'  })}
                                />
                                {/* <Button
                                        label={"Получить данные"}
                                        size="s"
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                        <ReloadOutlined 
                                                                className={cnMixFontSize('l') + cnMixSpace({mR:'xs'})}
                                                        />
                                                ))}
                                        view="primary"
                                        onClick={()=> {
                                                console.log(dataAnalysis)
                                        }}
                                        disabled={isLoadingDataAnalysis}
                                        className={cnMixSpace({ mL: 'xl', mT: 'xl'  })}
                                /> */}
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
                                                        <Line
                                                                data={dataAnalysis} 
                                                                xField="date" 
                                                                yField="value"
                                                                seriesField="system"
                                                                slider={{
                                                                        start: 0,
                                                                        end: 1,
                                                                }}
                                                                color={Object.keys(colorMapLine).map((key) => colorMapLine[key])}
                                                        />
                                                </Card>
                                                <Card border style={{minWidth: '45vw', maxWidth: '80vw'}} className={cnMixSpace({ mL: 'xl', mT: 'm', p: 'm'})}>
                                                        <Text view="brand" size="l" weight="semibold" className={cnMixSpace({ mB: 's'})}>Соотношение объема ручного ввода к общему (%)</Text>
                                                        <Column
                                                                data={handleDataAnalysis} 
                                                                xField="date" 
                                                                yField="value"
                                                                seriesField="system"
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
                        {/* <Layout direction="row">
                                <TextField
                                        size="s"
                                        value={name}
                                        onChange={(value) => {
                                                setName(value);
                                        }}
                                        label="Имя сотрудника"
                                        className={cnMixSpace({ mL: 'm', mT: 'xl'})}
                                />
                                <TextField
                                        size="s"
                                        value={lastName}
                                        onChange={(value) => {
                                                setLastName(value);
                                        }}
                                        label="Фамилия сотрудника"
                                        className={cnMixSpace({ mL: 'm', mT: 'xl'})}
                                />
                                <TextField
                                        size="s"
                                        value={surname}
                                        onChange={(value) => {
                                                setSurname(value);
                                        }}
                                        label="Отчество сотрудника"
                                        className={cnMixSpace({ mL: 'm', mT: 'xl'})}
                                />
                                <TextField
                                        size="s"
                                        value={tableNumber}
                                        onChange={(value) => {
                                                setTableNumber(value);
                                        }}
                                        label="Табельный номер"
                                        className={cnMixSpace({ mL: 'm', mT: 'xl'})}
                                />
                                <ComboboxSingle
                                        size="s"
                                        items={companies}
                                        value={organization}
                                        getItemKey={item => item.mstroyCompanyId}
                                        getItemLabel={item => item.name ?? ''}
                                        onChange={(value) => {
                                                setOrganization(value);
                                        }}
                                        label="Организация"
                                        className={cnMixSpace({ mL: 'm', mT: 'xl'})}
                                />
                                <Button
                                        size="s"
                                        label="Восстановить сотрудника"
                                        onClick={() => {
                                                void sendUnfireData();
                                        }}
                                        className={cnMixSpace({ mL: 'm', mT: '4xl'})}
                                />
                        </Layout> */}
                </Layout>
        )
}
export default MStroyFilter;