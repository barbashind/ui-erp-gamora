
import { routeTarget } from "../routers/routes";
import { concatUrl } from "../utils/urlUtils";
import { AntIcon } from "../utils/AntIcon";
import { cnMixFontSize } from "../utils/MixFontSize";
import { BlockOutlined, FilterOutlined, HomeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "@consta/uikit/Button";
import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoftsManagmentTable from "./LoftManagmentPage/LoftsManagmentTable";
import { LoftFilter, LoftSortFields } from "../types/lofts-managment-types";
import { Sort, useTableSorter } from "../hooks/useTableSorter";

const LoftsManagmentPage = () => {

        const navigate = useNavigate();
        const defaultFilter : LoftFilter = {
                
        }

        const PageSettings: {
                filterValues: LoftFilter | null;
                currentPage: number;
                columnSort?: Sort<LoftSortFields>;
                countFilterValues?: number | null;
        } = {
                filterValues: defaultFilter,
                currentPage: 0,
                columnSort: [{column: 'loftId', sortOrder: 'desc'}]
        };
        const [count, setCount] = useState<number | null>(0)
        const [currentPage, setCurrentPage] = useState(PageSettings.currentPage);
        const { getColumnSortOrder, getColumnSortOrderIndex, columnSort, onColumnSort } =
                useTableSorter<LoftSortFields>(PageSettings.columnSort);

        const [filterValues] = useState<LoftFilter>(
                PageSettings.filterValues ?? defaultFilter
        );
        const [updateFlag, setUpdateFlag] = useState<boolean>(true);

        return (
                <Layout direction="column" style={{width: '100%'}}>
                        <Layout 
                                direction="row" 
                                style={{justifyContent:'left', alignItems:'center'}}
                                className={cnMixSpace({pL:'2xl', pR:'4xl', pV:'m'})}
                        >
                                <Button
                                        view="clear"
                                        label={'Вернуться на главную'}
                                        size="s"
                                        onClick={()=>{
                                                navigate(concatUrl([routeTarget.main]));
                                        }}
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                <HomeOutlined
                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs', mB:'2xs'})}
                                                />
                                        ))}
                                />
                        </Layout>
                        <Layout 
                                direction='row' 
                                style={{ 
                                        minHeight: 'calc(100vh - 138px)', 
                                        maxHeight: 'calc(100vh - 138px)', 
                                        gap: '32px', 
                                        paddingRight: '32px', 
                                        paddingLeft: '32px', 
                                        paddingBottom: '32px', 
                                        flexWrap: 'wrap',
                                        width: '100%'

                                }}
                        >
                                <Card 
                                        style={{ 
                                                backgroundColor: 'var(--color-bg-default)', 
                                                width: '100%'
                                        }} 
                                        className={cnMixSpace({pL:'l', pT:'l', pR:'m', pB:'m'})}
                                >
                                        
                                        <Layout direction="column">
                                                <Layout direction="row" style={{justifyContent:'space-between', alignItems:'center'}}>
                                                        <Layout direction="row" style={{alignItems:'center'}} className={cnMixSpace({ mL:'2xl'})}>
                                                                <BlockOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}} />
                                                                <Text size="xl" weight='semibold' style={{color: 'var(--color-blue-ui)'}} className={cnMixSpace({mL:'m'})} >Управление помещениями</Text>
                                                        </Layout>
                                                        
                                                </Layout>

                                                <Layout direction="row" style={{alignItems: 'center', justifyContent: 'space-between'}} className={cnMixSpace({mT:'xl', pH:'m'})}>
                                                        <Text >{`Помещений заригистрировано (${count})`}</Text>
                                                        <Layout direction="row" style={{alignItems: 'center', justifyContent: 'right'}}>
                                                                <Button
                                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                                <PlusOutlined
                                                                                        className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                />
                                                                        ))}
                                                                        view="secondary"
                                                                        size="s"
                                                                        label={'Новое помещение'}
                                                                        className={cnMixSpace({mR:'m'})}
                                                                        onClick={()=>{
                                                                                navigate(concatUrl([routeTarget.main, `loft-details/new`]));
                                                                        }}
                                                                />
                                                                <Button
                                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                                <FilterOutlined
                                                                                        className={cnMixFontSize('l')}
                                                                                />
                                                                        ))}
                                                                        view="secondary"
                                                                        size="s"
                                                                />
                                                        </Layout>
                                                </Layout>
                                                <LoftsManagmentTable
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
                                                />
                                                


                                        </Layout>
                                        
                                </Card>
                                
                        </Layout>
                </Layout>
        );
};
export default LoftsManagmentPage;