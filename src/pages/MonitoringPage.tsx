// import { routeTarget } from "../routers/routes";
import { AntIcon } from "../utils/AntIcon";
import { cnMixFontSize } from "../utils/MixFontSize";
// import { concatUrl } from "../utils/urlUtils";
import { 
        DownloadOutlined,
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
        Point,
        // Point, 
        PointFilter, PointSortFields,
        // ReportData,
        Test, 
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
import { getAllPoints, getTests } from "../services/MonitoringService";
import { exportToExcelReport1 } from "./IntegrationFaceIdPage/ExportToExcelReport1";
// import { authFaceReg } from "#/services/IntegrationFaceReg";
// import { exportToExcelReport1 } from "./IntegrationFaceIdPage/ExportToExcelReport1";

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


const [isLoadingDataAnalysis, setIsLoadingDataAnalysis] = useState<boolean>(false);

// const [reportData, setReportData] = useState<(Test & Partial<Point>)[]>([])

const getReportData = async (pointIds?: number[]) => {
    try {
        // Получаем все точки
        const allPoints: Point[] = [];
        await getAllPoints((resp) => {
            allPoints.push(...resp);
        });

        // Если pointIds не передан, берем все pointId из allPoints
        const ids = pointIds || allPoints.map(p => p.pointId).filter((id): id is number => id !== undefined);
        
        // Массив для всех тестов
        const allTests: Test[] = [];

        // Для каждого pointId делаем запрос тестов
        for (const pointId of ids) {
            if (pointId === undefined) continue;
            
            await getTests(pointId, (resp) => {
                // Фильтруем, сортируем и добавляем в общий массив
                const filteredTests = resp
                    .filter(el => el.time !== null)
                    .sort((a, b) => {
                        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
                        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
                        return Number(dateA) - Number(dateB);
                    });
                
                allTests.push(...filteredTests);
            });
        }

        // Объединяем все тесты с точками
        const merged = allTests.map(test => {
            const point = allPoints.find(p => p.pointId === test.pointId);
            if (point) {
                return {
                    ...test,
                    ...point
                };
            }
            return test;
        });

        console.log('Всего тестов:', merged.length);
        exportToExcelReport1(merged);
        
        setIsLoadingDataAnalysis(false);

    } catch (error) {
        console.log('Ошибка при объединении данных:', error);
        setIsLoadingDataAnalysis(false);
        return [];
    }
};
// const getReportData = async (id?: number) => {
//     try {
//         // Получаем все точки
//         const allPoints: Point[] = [];
//         await getAllPoints((resp) => {
//             allPoints.push(...resp);
//         });

//         // Получаем тесты (используем ваш getDataMonth, но модифицируем)
//         let tests: Test[] = [];
//         if (id) {
//             await getTests(id, (resp) => {
//                 tests = resp.filter(el => el.time !== null).sort((a, b) => {
//                     const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
//                     const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
//                     return Number(dateA) - Number(dateB);
//                 });
//             });
//         }

//         // Объединяем
//         const merged = tests.map(test => {
//             const point = allPoints.find(p => p.pointId === test.pointId);
//             return {
//                 ...test,
//                 ...point
//             };
//         });
//         // exportToExcelReport1(merged);
//         console.log(merged)
//         // setReportData(merged)
//         setIsLoadingDataAnalysis(false);

//     } catch (error) {
//         console.log('Ошибка при объединении данных:', error);
//         setIsLoadingDataAnalysis(false);
//         return [];
//     }
// };
 
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
                                                        <Button
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
                                                        />
                                                
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