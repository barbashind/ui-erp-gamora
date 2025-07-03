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
import classes from './LoftsBookingTable.module.css'
import { useEffect, useState } from "react";
import { Loader } from '@consta/uikit/Loader';
import { cnMixSpace } from "@consta/uikit/MixSpace";
import classNames from "classnames";
import { classnames } from "@bem-react/classnames";
import { NoDataImage } from "../../assets/images/NoDataImage";
import { Loft, LoftFilter, LoftRow, LoftSortFields } from "../../types/lofts-managment-types";
import { getLofts } from "../../services/LoftManagmentService";
import { getBokingsToday } from "../../services/LoftBookingService";
import { Task } from "../../global/DiagramBooking";

interface LoftsBookingTableProps {
        updateFlag: boolean;
        setUpdateFlag: React.Dispatch<React.SetStateAction<boolean>>;
        currentPage: number;
        setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
        getColumnSortOrder: GetColumnSortOrder<LoftSortFields>;
        getColumnSortOrderIndex: GetColumnSortOrderIndex<LoftSortFields>;
        columnSort: Sort<LoftSortFields>;
        onColumnSort: OnColumnSort<LoftSortFields>;
        filterValues: LoftFilter;
        count: number | null;
        setCount: React.Dispatch<React.SetStateAction<number | null>>;
    }
const LoftsBookingTable = ({
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
    } : LoftsBookingTableProps) => {
        const { getStoredPageSize, setStoredPageSize } = usePaginationStore('Records');
        const [pagination, setPagination] = useState<IPagination>({
                        totalPages: 0,
                        totalElements: 0,
                        offset: 0,
                        pageSize: getStoredPageSize(),
                });        
        const [rows, setRows] = useState<LoftRow[]>([]);
        const [isLoading, setIsLoading] = useState<boolean>(false);
        // const navigate = useNavigate();
    
       
useEffect(() => {
        setStoredPageSize(pagination.pageSize);
        }, [pagination.pageSize, setStoredPageSize]);

useEffect(() => {
        setUpdateFlag(true);
}, [columnSort, setUpdateFlag]);
    
useEffect(() => {
if (updateFlag) {
        setIsLoading(true);
        const sortParam: TSortParam<Loft>[] = columnSort.map(value => ({
                fieldname: value.column,
                isAsc: value.sortOrder === 'asc',
        }));
const filterParam : LoftFilter = filterValues 

const getData = async () => {
        try {
                const serverData: TPageableResponse<Loft> = await getLofts({
                page: currentPage,
                size: pagination.pageSize,
                sortParam: sortParam,
                filterParam: filterParam,
                });
                const dataRes: LoftRow[] = [];
                const spacerRow: LoftRow = {} as LoftRow;
                spacerRow.spacer = true;
                serverData.content.forEach((item, index) => {
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
}, [updateFlag, setUpdateFlag, filterValues, columnSort, currentPage, pagination.pageSize, setCount]);

const [bookingsToday, setBookingsToday] = useState<Task[]>([]);

  function getHHMMFromDate(date: Date) {
    const newDate = new Date(date)
    const hours = newDate.getHours();
    const minutes = newDate.getMinutes();
    return `${hours}:${minutes}`;
}


        // Инициализация данных
        useEffect(() => {
                        const getBookingTodayData = async () => {
                                await getBokingsToday((resp)=>{
                                        setBookingsToday(resp.map(el => ({startDate: el.startDate, endDate: el.endDate, loftName: el.loftName, loftId: Number(el.loftId), clientName: el.client ?? ''})));
                                })
                        };
                        void getBookingTodayData();

        }, []);
    
    
    const columns: ColumnType<LoftRow>[] = [
        {
            title: (
                <TableColumnHeader
                    header="Наименование"
                    withoutSort
                    align="left"
                />
            ),
            dataIndex: 'name',
            key: 'name',
            align: 'left',
            width: '150px',
            render: (value: string, record: LoftRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content'}}>
                        <Text size="s"  weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }}>
                             {value}
                        </Text>
                        <Text size="s" view="secondary"  weight="medium" style={{ minWidth: '150px', maxWidth: '150px'  }} className={cnMixSpace({mT:'xs'})}>
                             {record.address}
                        </Text>
                    </Layout>
                );
            },
        },
                {
            title: (
                <TableColumnHeader
                    header="Бронирование"
                    withoutSort
                    align="center"
                />
            ),
            dataIndex: 'loftId',
            key: 'loftId',
            align: 'center',
            width: '100%',
            render: (value: string, record: LoftRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="row" style={{width: 'fit-content'}}>
                        {bookingsToday?.filter(elem => (elem.loftId === Number(value)))?.map(task => (
                            <Layout style={{padding: 8, border: '1px solid var(--color-blue-ui)', borderRadius: '4px'}}>
                                <Text size="s"  weight="medium" >{task.loftName + ' - ' + task.clientName + ' - ' + getHHMMFromDate(task.startDate) + '-' + getHHMMFromDate(task.endDate)}</Text>
                            </Layout>
                        ))}
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
        rowKey: (row: { loftId: number }) => row.loftId,
    
    } as TableProps<LoftRow>;
    
    tableProps.className = (classNames(
       tableProps.className,
       classes.table,
        cnMixSpace({ pH: 'xs' }) 
    ));
    
        return (
            <Layout flex={1} direction="column" style={{ height: '100%' }} className={cnMixSpace({mT:'m', pB: 'xl', mB:'xl'})}>
                <Layout flex={1} direction="column" style={{
                        minHeight: 'calc(100vh - 398px)',
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
                                    // if (!record.spacer) {
                                    //     navigate(concatUrl([routeTarget.main, `loft-details/${record.loftId}`]));
                                    // }
                                    
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
                    />
            </Layout>
        )
    }
export default LoftsBookingTable;