// import { routeTarget } from "../routers/routes";
import { AntIcon } from "../utils/AntIcon";
import { cnMixFontSize } from "../utils/MixFontSize";
// import { concatUrl } from "../utils/urlUtils";
import { 
        // ArrowLeftOutlined, 
        // DownloadOutlined, 
        FundOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "@consta/uikit/Button";
import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
// import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sort, useTableSorter } from "../hooks/useTableSorter";
import PointTable from "./MonitoringPage/PointTable";
import PointCreatingModal from "./MonitoringPage/PointCreatingModal";
import { 
        // Point, 
        PointFilter, PointSortFields, 
        // ReportData, Test 
} from "../types/monitoring-types";
// import { Checkbox } from "@consta/uikit/Checkbox";
// import { DatePicker } from "@consta/uikit/DatePicker";
// import { FaceregFilter, InputDataFacereg } from "../types/integration-mstroy-types";
// import { formatDateEndOfDay, formatDateStartOfDay } from "../utils/formatDate";
// import { getAllPoints, getTestsMonth } from "../services/MonitoringService";
// import { authFaceReg, getFaceregData } from "../services/IntegrationFaceReg";
// import { exportToExcelReport } from "./IntegrationMStroyPage/ExportToExcelReport";
import { Checkbox } from "@consta/uikit/Checkbox";

const MonitoringPage = () => {

// const navigate = useNavigate();
const defaultFilter : PointFilter = {
        type: ['FR', 'ST', 'VS']
}

const PageSettings: {
        filterValues: PointFilter | null;
        currentPage: number;
        columnSort?: Sort<PointSortFields>;
        countFilterValues?: number | null;
} = {
        filterValues: defaultFilter,
        currentPage: 0,
        columnSort: [{column: 'pointId', sortOrder: 'desc'}]
};
const [count, setCount] = useState<number | null>(0)
const [currentPage, setCurrentPage] = useState(PageSettings.currentPage);
const { getColumnSortOrder, getColumnSortOrderIndex, columnSort, onColumnSort } =
        useTableSorter<PointSortFields>(PageSettings.columnSort);

const [filterValues, setFilterValues] = useState<PointFilter>(
        PageSettings.filterValues ?? defaultFilter
);
const [updateFlag, setUpdateFlag] = useState<boolean>(true);

const [isCreatingModalOpen, setIsCreatingModalOpen] = useState<boolean>(false);
const [id, setId] = useState<number | null>(null)

useEffect(() => {
        setUpdateFlag(true);
}, [filterValues]);

// const today = new Date();
const day = new Date();
day.setDate(day.getDate() - 14);

// const [dateMin, setDateMin] = useState<Date | null> (day);
// const [dateMax, setDateMax] = useState<Date | null> (today);

// const [isLoadingDataAnalysis, setIsLoadingDataAnalysis] = useState<boolean>(false);

// const [faceregFilter, setFaceregFilter] = useState<FaceregFilter>(
//                 {
//                         created_at__gte: formatDateStartOfDay(day),
//                         created_at__lte: formatDateEndOfDay(today),
//                 }
//         )

// const getReportData = async () => {
//         const allPoints: Point[] = [];
//         await getAllPoints((resp) => {
//                 allPoints.push(...resp)
//         });
//         const reports: ReportData[] = [];

//          for (const point of allPoints) {
//                 if (!point.pointId) continue;
                
//                 // Получаем данные соединения
//                 const connectionsData: Test[] = [];
//                 await getTestsMonth(point.pointId, (resp) => {
//                 const sortedData = resp.filter(el => (el.time !== null)).sort((a, b) => {
//                         const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
//                         const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
//                         return Number(dateA) - Number(dateB);
//                 });
                
//                 connectionsData.push(...sortedData);
//                 });
                
//                 // Получаем данные FaceReg
//                 const faceRegData: InputDataFacereg[] = [];
//                 if (point.faceRegGUID) {
//                 await authFaceReg({
//                         username: 'd.barbashin@avtoban.ru', 
//                         password: 'kat-xy6-CVk-ziA'
//                 }).then(async () => {
//                         await getFaceregData(faceregFilter, point.faceRegGUID ?? '', (resp) => {
//                         faceRegData.push(...resp);
//                         });
//                 });
//                 }
                
//                 // Группируем данные по дате и часу
//                 const groupedData: Map<string, Map<number, { 
//                 connections: Test[], 
//                 faceRegEvents: InputDataFacereg[] 
//                 }>> = new Map();
                
//                 // 1. Группируем данные соединений
//                 connectionsData.forEach(connection => {
//                 if (!connection.updatedAt) return;
                
//                 const date = new Date(connection.updatedAt);
//                 const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
//                 const hour = date.getHours();
                
//                 if (!groupedData.has(dateKey)) {
//                         groupedData.set(dateKey, new Map());
//                 }
                
//                 const hourMap = groupedData.get(dateKey)!;
//                 if (!hourMap.has(hour)) {
//                         hourMap.set(hour, { connections: [], faceRegEvents: [] });
//                 }
                
//                 hourMap.get(hour)!.connections.push(connection);
//                 });
                
//                 // 2. Группируем данные FaceReg
//                 faceRegData.forEach(event => {
//                 if (!event.createdAt) return;
                
//                 const date = new Date(event.createdAt);
//                 const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
//                 const hour = date.getHours();
                
//                 if (!groupedData.has(dateKey)) {
//                         groupedData.set(dateKey, new Map());
//                 }
                
//                 const hourMap = groupedData.get(dateKey)!;
//                 if (!hourMap.has(hour)) {
//                         hourMap.set(hour, { connections: [], faceRegEvents: [] });
//                 }
                
//                 hourMap.get(hour)!.faceRegEvents.push(event);
//                 });
                
//                 // 3. Создаем отчет для каждой даты и часа
//                 groupedData.forEach((hourMap, dateKey) => {
//                 // Для каждого часа от 0 до 23
//                 for (let hour = 0; hour < 24; hour++) {
//                         const data = hourMap.get(hour) || { 
//                         connections: [], 
//                         faceRegEvents: [] 
//                         };
                        
//                         // Рассчитываем среднюю скорость соединения
//                         let totalSpeed = 0;
//                         let validConnectionsCount = 0;
                        
//                         data.connections.forEach(conn => {
//                         const timeValue = conn.time ?? '0';
//                         const numericTime = parseFloat(timeValue.toString());
                        
//                         if (numericTime > 0) {
//                                 // Скорость = 1 / время
//                                 totalSpeed += 1 / numericTime;
//                                 validConnectionsCount++;
//                         }
//                         });
                        
//                         const averageSpeed = validConnectionsCount > 0 
//                         ? totalSpeed / validConnectionsCount 
//                         : 0;
                        
//                         // Количество событий FaceReg (активность УЗ)
//                         const activityCount = data.faceRegEvents.length;
                        
//                         // Создаем запись отчета
//                         const report: ReportData = {
//                                 pointId: point.pointId,
//                                 login: point.login || null,
//                                 place: point.place || null,
//                                 responsibleObj: point.responsibleObj || null,
//                                 date: dateKey, // YYYY-MM-DD
//                                 time: hour.toString().padStart(2, '0'), // "00", "01", ..., "23"
//                                 connection: parseFloat(averageSpeed.toFixed(6)),
//                                 active: activityCount
//                         };
                        
//                         reports.push(report);
//                 }
//                 });
//         }
//         exportToExcelReport(reports);
//         setIsLoadingDataAnalysis(false);
// }
 
        return (
                <Layout direction="column" style={{minWidth: '1000px', maxWidth: '1500px', width: '100%'}}>
                       <Card 
                                        style={{backgroundColor: 'var(--color-bg-default)', borderRadius: '8px', width: '100%', height: 'fit-content'}}
                                        className={cnMixSpace({p:'l', mT:'m'})}
                                >
                                        <Layout direction="row" style={{justifyContent: 'left', alignItems: 'center'}}>
                                                <Layout direction="row" style={{ alignItems: 'center'}}>
                                                        <FundOutlined className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'s'})} style={{color: 'var(--color-blue-ui)'}}/>
                                                        <Text size="l" weight='semibold' style={{color: 'var(--color-blue-ui)'}}>Мониторинг точек прохода</Text>
                                                </Layout>
                                                
                                                
                                        </Layout>
                                        <Layout direction="row" style={{justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}} className={cnMixSpace({mT:'m'})}>
                                                <Layout direction="row" className={cnMixSpace({ mL: 'xl'})}>
                                                        <Text size="s" weight='semibold' view= 'secondary' className={cnMixSpace({mR:'m'})}>Выберите тип устройств:</Text>
                                                        <Checkbox checked={filterValues.type?.includes('FR')}
                                                                onChange={()=>{
                                                                        if (filterValues.type?.includes('FR')) {
                                                                                setFilterValues(prev=> ({...prev, type: prev.type?.filter((item) => (item !== 'FR'))}))
                                                                        } else {
                                                                                setFilterValues(prev=> ({...prev, type: prev.type && prev.type.length > 0 ? [...prev.type, 'FR'] : ['FR']}))
                                                                        }
                                                                }}
                                                                label="FaceReg" 
                                                                className={cnMixSpace({mR:'m'})}
                                                         />
                                                         <Checkbox checked={filterValues.type?.includes('ST')} label="Ovision" className={cnMixSpace({mR:'m'})}
                                                                onChange={()=>{
                                                                if (filterValues.type?.includes('ST')) {
                                                                        setFilterValues(prev=> ({...prev, type: prev.type?.filter((item) => (item !== 'ST'))}))
                                                                } else {
                                                                        setFilterValues(prev=> ({...prev, type: prev.type && prev.type.length > 0 ? [...prev.type, 'ST'] : ['ST']}))
                                                                }
                                                        }}
                                                        />
                                                        <Checkbox checked={filterValues.type?.includes('VS')} label="Камеры" className={cnMixSpace({mR:'m'})}
                                                        onChange={()=>{
                                                                if (filterValues.type?.includes('VS')) {
                                                                        setFilterValues(prev=> ({...prev, type: prev.type?.filter((item) => (item !== 'VS'))}))
                                                                } else {
                                                                        setFilterValues(prev=> ({...prev, type: prev.type && prev.type.length > 0 ? [...prev.type, 'VS'] : ['VS']}))
                                                                }
                                                        }}
                                                        />
                                                </Layout>
                                                <Layout direction="row">
                                                        {/* <Button
                                                                label={"Загрузить отчет"}
                                                                size="s"
                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                                <DownloadOutlined 
                                                                                        className={cnMixFontSize('l') + cnMixSpace({mR:'xs'})}
                                                                                />
                                                                        ))}
                                                                view="primary"
                                                                onClick={()=> {
                                                                        getReportData();
                                                                        setIsLoadingDataAnalysis(true);
                                                                }}
                                                                disabled={isLoadingDataAnalysis}
                                                                className={cnMixSpace({ mT: 's', mR: 'm'})}
                                                        /> */}
                                                
                                                        <Button
                                                                label={'Добавить'}
                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                        <PlusOutlined
                                                                                className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                                        />
                                                                ))}
                                                                onClick={()=> {
                                                                        setIsCreatingModalOpen(true);
                                                                }}
                                                                view="secondary"
                                                                size="s"
                                                                className={cnMixSpace({ mT: 's'})}
                                                        />
                                                </Layout>
                                                
                                        </Layout>
                                        <PointTable 
                                                updateFlag={updateFlag} 
                                                setUpdateFlag={setUpdateFlag} 
                                                currentPage={currentPage} 
                                                setCurrentPage={setCurrentPage} 
                                                getColumnSortOrder={getColumnSortOrder} 
                                                getColumnSortOrderIndex={getColumnSortOrderIndex} 
                                                columnSort={columnSort}
                                                onColumnSort={onColumnSort} 
                                                filterValues={filterValues} 
                                                count={count} 
                                                setCount={setCount}
                                                setId={setId}
                                                setIsEdit={setIsCreatingModalOpen}
                                        />
                                        <PointCreatingModal
                                                id={id}
                                                setId={setId}
                                                isOpen={isCreatingModalOpen}
                                                setIsOpen={setIsCreatingModalOpen}
                                                setUpdateFlag={setUpdateFlag}
                                        />

                        </Card>
                        {/* <Layout direction="row" style={{justifyContent: 'left'}} className={cnMixSpace({mT:'xl'})}>
                                <Button
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                <ArrowLeftOutlined
                                                        className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                />
                                        ))}
                                        label='Вернуться на главную'
                                        onClick={()=>{navigate(concatUrl([routeTarget.main])) }}
                                        size="s"
                                        view="clear"
                                        className={cnMixSpace({mL:'xl', mB: 'm'})}
                                />
                        </Layout> */}
                </Layout>
        );
};
export default MonitoringPage;