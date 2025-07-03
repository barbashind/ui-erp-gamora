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
import classes from './LoftsManagmentTable.module.css'
import { useEffect, useState } from "react";
import { Loader } from '@consta/uikit/Loader';
import { cnMixSpace } from "@consta/uikit/MixSpace";
import classNames from "classnames";
import { Badge } from "@consta/uikit/Badge";
import { classnames } from "@bem-react/classnames";
import { NoDataImage } from "../../assets/images/NoDataImage";
import { Loft, LoftFilter, LoftRow, LoftSortFields } from "../../types/lofts-managment-types";
import { getImage, getLoftMainImage, getLofts } from "../../services/LoftManagmentService";
import { useNavigate } from "react-router-dom";
import { concatUrl } from "../../utils/urlUtils";
import { routeTarget } from "../../routers/routes";
import { SkeletonBrick } from '@consta/uikit/Skeleton';

interface LoftsManagmentTableProps {
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
const LoftsManagmentTable = ({
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
    } : LoftsManagmentTableProps) => {
        const { getStoredPageSize, setStoredPageSize } = usePaginationStore('Records');
        const [pagination, setPagination] = useState<IPagination>({
                        totalPages: 0,
                        totalElements: 0,
                        offset: 0,
                        pageSize: getStoredPageSize(),
                });        
        const [rows, setRows] = useState<LoftRow[]>([]);
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [updatePhoto, setUpdatePhoto] = useState<boolean>(false);
        const navigate = useNavigate();
    
       
useEffect(() => {
        setStoredPageSize(pagination.pageSize);
        }, [pagination.pageSize, setStoredPageSize]);

useEffect(() => {
        setUpdateFlag(true);
}, [columnSort, setUpdateFlag]);
useEffect(() => {
        setUpdatePhoto(true);
}, [updateFlag, setUpdateFlag, filterValues, columnSort, currentPage, pagination.pageSize, setCount]);
    

useEffect(() => {
    if (updatePhoto) {
        rows.map((row) => {
            if (!row.spacer) {
                const getMainPhoto = async (loftId: number) => {
                    try {
                        await getLoftMainImage(Number(loftId), (async (resp)=> {
                            if (resp) {
                               await getImage(resp).then((response) => {
                                if (response) {
                                    setRows(prev => (prev.map((item) => (item.loftId === loftId) ? {...item, photo: response} : item )))
                                }
                               })
                            }
                        }))
                    } catch(error) {
                        console.log(error);
                    }
                    
                }
                void getMainPhoto(Number(row.loftId))
            }
        })
        setUpdatePhoto(false);
    }
    
}, [rows, updatePhoto]);

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
    
    
    const columns: ColumnType<LoftRow>[] = [
        {
            title: (
                <TableColumnHeader
                    header=""
                    withoutSort
                    align="left"
                />
            ),
            dataIndex: 'login',
            key: 'login',
            align: 'left',
            width: '80px',
            render: (_value: string, record: LoftRow) => {

                return record.spacer ? (
                    <></>
                ) : (
                    record.photo ? 
                        <Layout 
                            direction="column" 
                            style={{
                                overflow: 'hidden', 
                                borderRadius: '4px',
                                backgroundImage: record.photo && !record.spacer ? `url(${URL.createObjectURL(record.photo)})` : undefined,
                                backgroundSize: 'cover', 
                                backgroundPosition: 'center',
                                width: !record.spacer ? '80px' : 0,
                                height: !record.spacer ? '80px' : 0
                            }}
                        /> 
                    :
                            <SkeletonBrick height={80} width={80}/>

                );
            },
        },
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
            width: '100%',
            render: (value: string, record: LoftRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content'}}>
                        <Text size="s"  weight="medium" style={{ minWidth: '350px', maxWidth: '350px'  }} className={cnMixSpace({mV:'s'})}>
                             {value}
                        </Text>
                        <Text size="s" view='secondary' weight="medium" style={{ minWidth: '350px', maxWidth: '350px'  }}>
                            {record.address || '-'}
                        </Text>
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Число гостей"
                    align="left"
                    sortOrder={getColumnSortOrder('guestCountMax')}
                    sortOrderIndex={getColumnSortOrderIndex('guestCountMax')}
                    onSort={(sortOrder, isAdd) => {
                        onColumnSort('guestCountMax', sortOrder, isAdd);
                    }}
                />
            ),
            dataIndex: 'guestCountMax',
            key: 'guestCountMax',
            align: 'left',
            width: '100px',
            render: (value: string, record: LoftRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column">
                        <Text size="s" view='primary' weight="medium" style={{ minWidth: '50px', maxWidth: '50px'  }}>
                            {value || '-'}
                        </Text>
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Площадь"
                    align="left"
                    sortOrder={getColumnSortOrder('size')}
                    sortOrderIndex={getColumnSortOrderIndex('size')}
                    onSort={(sortOrder, isAdd) => {
                        onColumnSort('size', sortOrder, isAdd);
                    }}
                />
            ),
            dataIndex: 'size',
            key: 'size',
            align: 'left',
            width: '100px',
            render: (value: string, record: LoftRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content'}}>
                        <Text size="s" view='primary' weight="medium" style={{ minWidth: '50px', maxWidth: '50px'  }}>
                            {value ? value + 'кв.м.' : '-'}
                        </Text>
                    </Layout>
                );
            },
        },
        {
            title: (
                <TableColumnHeader
                    header="Статус"
                    withoutSort
                    align="center"
                />
            ),
            dataIndex: 'valid',
            key: 'valid',
            align: 'center',
            width: '50px',
            render: (value: string, record: LoftRow) => {
                return record.spacer ? (
                    <></>
                ) : (
                    <Layout direction="column" style={{width: 'fit-content'}}>
                        {value  ? <Badge status="success" label="Работает"/> :  <Badge status="alert" label="не работает"/> }
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
                                    if (!record.spacer) {
                                        navigate(concatUrl([routeTarget.main, `loft-details/${record.loftId}`, routeTarget.commonData]));
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
                    />
            </Layout>
        )
    }
export default LoftsManagmentTable;