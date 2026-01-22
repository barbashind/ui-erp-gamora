
import { Pagination } from "../../global/Pagination";
import { TableColumnHeader } from "../../global/TableColumnHeader";
import { usePaginationStore } from "../../hooks/usePaginationStore";
import { GetColumnSortOrder, GetColumnSortOrderIndex, OnColumnSort, Sort } from "../../hooks/useTableSorter";
import { ErrorResponse, IPagination, TSortParam } from "../../services/utils";
import { TPageableResponse } from "../../utils/types";
import { rcTableAdapter } from '@consta/rc-table-adapter/rcTableAdapter';
import { Layout } from "@consta/uikit/Layout";
import { Text } from "@consta/uikit/Text";
import { ColumnType } from "rc-table";
import RCTable, { TableProps } from 'rc-table';
import classesTable from '../../styles/Table.module.scss';
import classes from './PointsTable.module.css'
import { useEffect, useState } from "react";
import { Loader } from '@consta/uikit/Loader';
import { cnMixSpace } from "@consta/uikit/MixSpace";
import classNames from "classnames";
import { NoDataImage } from "../../assets/images/NoDataImage";
import { classnames } from "@bem-react/classnames";
import { FRRow, Point, PointFilter, PointRow, PointSortFields } from "../../types/monitoring-types";
import { getPoints } from "../../services/MonitoringService";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { LineChartOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import PointTestsModal from "./PointTestsModal";
import { GoodConnectingIcon } from "../../assets/images/GoodConnectingIcon";
import { NoConnectingIcon } from "../../assets/images/NoConnectingIcon";
import { MiddleConnectingIcon } from "../../assets/images/MiddleConnectingIcon";
import { BadConnectingIcon } from "../../assets/images/BadConnectingIcon";
import { FaceregFilter } from "../../types/integration-mstroy-types";
import { formatDateEndOfDay, formatDateStartOfDay } from "../../utils/formatDate";
import { getFaceregData } from "../../services/IntegrationFaceReg";

interface PointTableProps {
        updateFlag: boolean;
        setUpdateFlag: React.Dispatch<React.SetStateAction<boolean>>;
        currentPage: number;
        setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
        getColumnSortOrder: GetColumnSortOrder<PointSortFields>;
        getColumnSortOrderIndex: GetColumnSortOrderIndex<PointSortFields>;
        columnSort: Sort<PointSortFields>;
        onColumnSort: OnColumnSort<PointSortFields>;
        filterValues: PointFilter;
        count: number | null;
        setCount: React.Dispatch<React.SetStateAction<number | null>>;
        setId: React.Dispatch<React.SetStateAction<number | null>>;
        setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    }
const PointTable = ({
        updateFlag,
            setUpdateFlag, 
            currentPage,
            setCurrentPage,
            getColumnSortOrder,
            getColumnSortOrderIndex,
            columnSort,
            onColumnSort,
            filterValues,
            count,
            setCount,
            setId,
            setIsEdit,
    } : PointTableProps) => {
        const { getStoredPageSize, setStoredPageSize } = usePaginationStore('Records');
        const [pagination, setPagination] = useState<IPagination>({
                        totalPages: 0,
                        totalElements: 0,
                        offset: 0,
                        pageSize: getStoredPageSize(),
                });        
        const [rows, setRows] = useState<PointRow[]>([]);
        const [rowsFR, setRowsFR] = useState<FRRow[]>([]);
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [isModalTestsOpen, setIsModalTestsOpen] = useState<boolean>(false);
        const [pointId, setPointId] = useState<number | null>(0);
        const [GUID, setGUID] = useState<string | null>(null);
        const [name, setName] = useState<string | null>(null);
        // const [ip, setIp] = useState<string | null>(null);

const today = new Date();
const day = new Date();
day.setDate(day.getDate() - 3);

const [faceregFilter] = useState<FaceregFilter>(
        {
                created_at__gte: formatDateStartOfDay(day),
                created_at__lte: formatDateEndOfDay(today),
        }
);
       
useEffect(() => {
        setStoredPageSize(pagination.pageSize);
}, [pagination.pageSize, setStoredPageSize]);

useEffect(() => {
        setUpdateFlag(true);
}, [columnSort, setUpdateFlag]);

const [frUpdateCounter, setFrUpdateCounter] = useState<number>(0);
  
useEffect(() => {
if (updateFlag) {
        setIsLoading(true);
        const sortParam: TSortParam<Point>[] = columnSort.map(value => ({
                fieldname: value.column,
                isAsc: value.sortOrder === 'asc',
        }));
const filterParam : PointFilter = filterValues 

const getData = async () => {
        try {
            
                const serverData: TPageableResponse<Point> = await getPoints({
                page: currentPage,
                size: pagination.pageSize,
                sortParam: sortParam,
                filterParam: filterParam,
                });
                const dataRes: PointRow[] = [];
                const spacerRow: PointRow = {} as PointRow;
                spacerRow.spacer = true;
                const dataResFR: FRRow[] = [];
                const getDateDDMMHHMM = (isoTime: string): string => {
                        const date = new Date(isoTime);
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
                        const year = String(date.getFullYear()).padStart(4); // Месяцы начинаются с 0
                        return `${day}.${month}.${year}, ${hours}:${minutes}`;
                };
                serverData.content.forEach(async (item, index) => {
                    void getFaceregData(faceregFilter, item.faceRegGUID || '', (resp)=>{
                        const lastDate = new Date(resp[0].createdAt);
                        lastDate.setHours(lastDate.getHours() + 3);
                        dataResFR.push({guid: item.faceRegGUID, lastDays: resp.length ?? 0, last: getDateDDMMHHMM(lastDate.toString()).toString()})
                        setFrUpdateCounter(prev => prev + 1);
                    });
                    dataRes.push(
                            {
                            ...item,
                            spacer: false,
                            rowNumber: (serverData.pageable.pageNumber || 0) + index + 1,
                            },
                            {
                            ...spacerRow,
                            rowNumber: (serverData.pageable.pageNumber || 0) + index + 1,
                            }
                    );
                });

                setRowsFR(dataResFR);
                
                setRows(
                dataRes.map((item) => {
                        return item;
                })
                );
                setPagination({
                totalPages: serverData.totalPages || 0,
                totalElements: serverData.totalElements || 0,
                offset: serverData.pageable.pageNumber || 0,
                pageSize: pagination.pageSize,
                });
                
                setCount(serverData.totalElements);

        } catch (e: unknown) {
                if (e instanceof ErrorResponse || e instanceof Error) {
                console.log(e);
                }
        }
        setIsLoading(false);
        setUpdateFlag(false);
        };
        void getData();
}
}, [updateFlag, setUpdateFlag, filterValues, columnSort, currentPage, pagination.pageSize, setCount, faceregFilter]);



    
    
    const columns: ColumnType<PointRow>[] = [
        {
            title: (
                <TableColumnHeader
                    header="Логин"
                    withoutSort
                    align="left"
                />
            ),
            dataIndex: 'login',
            key: 'login',
            align: 'left',
            width: '50px',
            render: (value: string, record: PointRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content'}}>
                        <Text size="s"  weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }}>
                            {value}
                        </Text>
                        
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Наименование"
                    sortOrder={getColumnSortOrder('pointId')}
                    sortOrderIndex={getColumnSortOrderIndex('pointId')}
                    onSort={(sortOrder, isAdd) => {
                        onColumnSort('pointId', sortOrder, isAdd);
                    }}
                />
            ),
            dataIndex: 'pointId',
            key: 'pointId',
            align: 'left',
            width: '150px',
            render: (_value: string, record: PointRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column">
                        {/* <Text size="xs" view='secondary' weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }}>
                            {value || '-'}
                        </Text> */}
                        <Text size="s" weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }} className={cnMixSpace({mV:'s'})}>
                            {record.name}
                        </Text>
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Тип устр-ва"
                    withoutSort
                    align="left"
                />
            ),
            dataIndex: 'type',
            key: 'type',
            align: 'left',
            width: '150px',
            render: (value: string, record: PointRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column">
                        {(value === 'FR') && (<Text size="s" weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }} className={cnMixSpace({mV:'s'})}>
                            {'Точка прохода FR'}
                        </Text>)}
                         {(value === 'ST') && (<Text size="s" weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }} className={cnMixSpace({mV:'s'})}>
                            {'Столовая'}
                        </Text>)}
                        {(value === 'VS') && (<Text size="s" weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }} className={cnMixSpace({mV:'s'})}>
                            {'Весовая'}
                        </Text>)}
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Объект"
                    withoutSort
                    align="left"
                />
            ),
            dataIndex: 'place',
            key: 'place',
            align: 'left',
            width: '150px',
            render: (value: string, record: PointRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content'}}>
                        <Text size="xs" view='secondary' weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }}>
                            {value}
                        </Text>
                        <Text size="s"  weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }} className={cnMixSpace({mV:'s'})}>
                            {record.object}
                        </Text>
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Ответственный"
                    sortOrder={getColumnSortOrder('responsibleObj')}
                    sortOrderIndex={getColumnSortOrderIndex('responsibleObj')}
                    onSort={(sortOrder, isAdd) => {
                        onColumnSort('responsibleObj', sortOrder, isAdd);
                    }}
                    align="left"
                />
            ),
            dataIndex: 'responsibleObj',
            key: 'responsibleObj',
            align: 'left',
            width: '150px',
            render: (value: string, record: PointRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content'}}>
                        <Text size="xs" view='secondary' weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }}>
                            {value || '-'}
                        </Text>
                        <Text size="s"  weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }} className={cnMixSpace({mV:'s'})}>
                            {record.responsibleObjNumber}
                        </Text>
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Соединение"
                    align="left"
                    sortOrder={getColumnSortOrder('connecting')}
                    sortOrderIndex={getColumnSortOrderIndex('connecting')}
                    onSort={(sortOrder, isAdd) => {
                        onColumnSort('connecting', sortOrder, isAdd);
                    }}
                />
            ),
            dataIndex: 'connecting',
            key: 'connecting',
            align: 'center',
            width: '50px',
            render: (_value: string, record: PointRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content', justifyItems: 'center',}}>
                        {(record.connecting === 0 || !record.connecting) && <NoConnectingIcon color={undefined} />}
                        { (record.connecting > 0) && (record.connecting <= 50) && <GoodConnectingIcon color={"#0DFFBB"} /> }
                        { (record.connecting > 50) && (record.connecting <= 100) && <MiddleConnectingIcon color={"#0DFFBB"} /> }
                        { (record.connecting > 100) && <BadConnectingIcon color={"#0DFFBB"} />}
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Активность УЗ"
                    withoutSort
                    align="left"
                />
            ),
            dataIndex: 'place',
            // key: 'place',
            key: `activity-${frUpdateCounter}`,
            align: 'left',
            width: '150px',
            render: (_value: string, record: PointRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    rowsFR.find(el => (el.guid === record.faceRegGUID))?.lastDays ? (
                        <Layout direction="column" style={{width: 'fit-content'}}>
                            <Layout direction="row" style={{ minWidth: '200px', maxWidth: '200px'  }}>
                                <Text size="xs"  view='secondary' weight="medium"  className={cnMixSpace({mV:'xs', mR:'s'})}>
                                   За посл. 3 дня:
                                </Text>
                                <Text size="xs"  weight="medium" className={cnMixSpace({mV:'xs', mR:'s'})}>
                                    {rowsFR.find(el => (el.guid === record.faceRegGUID))?.lastDays}
                                </Text>
                            </Layout>
                            <Layout direction="row" style={{ minWidth: '200px', maxWidth: '200px'  }}>
                                <Text size="xs" view='secondary' weight="medium"  className={cnMixSpace({mV:'xs', mR:'s'})}>
                                    Последний:
                                </Text>
                                <Text size="xs"  weight="medium" className={cnMixSpace({mV:'xs'})}>
                                    {rowsFR.find(el => (el.guid === record.faceRegGUID))?.last}
                                </Text>
                            </Layout>
                            
                        </Layout>
                    ) : (
                        <Loader size="xs"/>
                    )
                    
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header=""
                    withoutSort
                    align="center"
                />
            ),
            dataIndex: 'pointId',
            key: 'pointId',
            align: 'center',
            width: '50px',
            render: (value: number | null, record: PointRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content'}}>
                        <Button
                            iconLeft={AntIcon.asIconComponent(() => (
                                                        <LineChartOutlined
                                                                className={cnMixFontSize('l')}
                                                        />
                                                ))}
                            view="secondary"
                            size="s"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPointId(value);
                                setGUID(record.faceRegGUID)
                                setName(record.name);
                                // setIp(record.IPadress);
                                setIsModalTestsOpen(true);
                            }}
                        />
                    </Layout>
                );
            },
        },
       
        RCTable.EXPAND_COLUMN,
    ];
    
    const tableProps = {
        ...rcTableAdapter({
            borderBetweenColumns: false,
            borderBetweenRows: true,
            verticalAlign: 'center',
        }),
        rowKey: (row: { pointId: number }) => row.pointId,
    
    } as TableProps<PointRow>;
    
    tableProps.className = (classNames(
       tableProps.className,
       classes.table,
        cnMixSpace({ pH: 'xs' }) 
    ));

        return (
            <Layout flex={1} direction="column" style={{ height: '100%' }} className={cnMixSpace({mT:'m', pB: 'xl', mB:'xl'})}>
                <Layout flex={1} direction="column" style={{
                        minHeight: '400px',
                        overflow: 'auto',
                        display: 'flex',
                        width: '100%',
                        flex: '1 1 auto',
                        }}>
                    {!isLoading ? (
                        <RCTable
                            {...tableProps}
                            columns={columns}
                            data={rows} // Убираем проверку !isLoading, так как данные уже загружены
                            onRow={record => ({
                                className: record.spacer ? 'data-is-spacer' : `data-is-row`,
                                onClick: () => {
                                    if (!record.spacer) {
                                        setId(record.pointId ?? null);
                                        setIsEdit(true);
                                    }
                                    
                                },
                            })}
                            className={classnames(classes.table, classesTable.table)}
                            emptyText={() =>
                                !isLoading && (
                                    <Layout
                                        direction="column"
                                        className={cnMixSpace({ pT: 'm', pB: 'xs' })}
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        {count === 0 && (
                                                <Layout direction="column" style={{alignItems: 'center', justifyContent: 'center'}}>
                                                        <NoDataImage />
                                                        <Text
                                                                size="m"
                                                                className={cnMixSpace({ mT: 's' })}
                                                                view="secondary"
                                                                align="center"
                                                                weight="regular"
                                                                lineHeight="xs"
                                                        >
                                                                Добавьте первую запись или очистите поиск
                                                        </Text>
                                                </Layout>
                                        )}
                                    </Layout>
                                )
                            }
                        />
                    ) : (
                        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Loader />
                        </div>
                    )}
                </Layout>
    
                {/* Пагинация, закреплена внизу */}
                    <Pagination
                        items={pagination.totalPages === 0 ? 1 : pagination.totalPages}
                        value={currentPage}
                        pageSize={pagination.pageSize}
                        onChange={(e) => {
                            setCurrentPage(e);
                            setUpdateFlag(true);
                        }}
                        onChangePageSize={(pageSize) => {
                            setCurrentPage(0);
                            setPagination((prev) => ({
                                ...prev,
                                pageSize,
                            }));
                            setUpdateFlag(true);
                        }}
                        className={cnMixSpace({mB:'3xl'})}
                    />
                    <PointTestsModal
                        isOpen={isModalTestsOpen}
                        GUID={GUID}
                        setGUID={setGUID}
                        setIsOpen={setIsModalTestsOpen}
                        id={pointId}
                        setId={setPointId}
                        name={name}
                        setName={setName}
                        // setIp={setIp}
                    />
            </Layout>
        )
    }
export default PointTable;