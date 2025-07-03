
import { routeTarget } from "../routers/routes";
import { concatUrl } from "../utils/urlUtils";
import { AntIcon } from "../utils/AntIcon";
import { cnMixFontSize } from "../utils/MixFontSize";
import { BookOutlined, FilterOutlined, HomeOutlined } from "@ant-design/icons";
import { Button } from "@consta/uikit/Button";
import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loft, LoftFilter, LoftSortFields } from "../types/lofts-managment-types";
import { Sort, useTableSorter } from "../hooks/useTableSorter";
import LoftsBookingTable from "./LoftBookingPage/LoftsBookingTable";
import { ChoiceGroup } from "@consta/uikit/ChoiceGroup";
import { getBokingsToday } from "../services/LoftBookingService";
import { DiagramBooking, Task } from "../global/DiagramBooking";
import  LoftsBookingList from "./LoftBookingPage/LoftBookingList"

const LoftsBookingPage = () => {

        interface Tab {
                id: number;
                label: string;
        }

        const tabs: Tab[] = [
                {
                        id: 0,
                        label: 'Календарь',
                },
                {
                        id: 1,
                        label: 'Бронирования',
                },
                {
                        id: 2,
                        label: 'Помещения',
                },
        ]

        const [activeTab, setActiveTab] = useState<Tab>(tabs[0])


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

        
        const [bookingsToday, setBookingsToday] = useState<Task[]>([]);

        const [lofts, setLofts] = useState<Loft[]>([]);

        // Инициализация данных
        useEffect(() => {
                if (activeTab.id === 0) {
                        const getBookingTodayData = async () => {
                                await getBokingsToday((resp)=>{
                                        setBookingsToday(resp.map(el => ({startDate: el.startDate, endDate: el.endDate, loftName: el.loftName, loftId: Number(el.loftId), clientName: el.client ?? ''})));
                                })
                        };
                        void getBookingTodayData();

                }
        }, []);


        return (
                <Layout direction="column" style={{width: '100%'}}>
                        <Layout 
                                direction="row" 
                                style={{justifyContent:'space-between', alignItems:'center'}}
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
                                <ChoiceGroup
                                        value={activeTab}
                                        items={tabs}
                                        name="selectTab"
                                        size="s"
                                        onChange={(value) => {
                                                setActiveTab(value);
                                                }}
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
                                                                <BookOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}} />
                                                                <Text size="xl" weight='semibold' style={{color: 'var(--color-blue-ui)'}} className={cnMixSpace({mL:'m'})} >Управление бронированиями</Text>
                                                        </Layout>
                                                        
                                                </Layout>
                                                {activeTab.id === 0 && (
                                                        <Layout direction="column" className={cnMixSpace({pL:'xl', pT:'xl'})}>
                                                                
                                                                <Card style={{minWidth:'290px', border: '1px solid var(--color-gray-200)'}} className={cnMixSpace({p:'m', mR: 'm', mB:'m'})}>
                                                                        <DiagramBooking tasks={bookingsToday} period={60}/>
                                                                </Card>
                                                                <Layout direction="row" style={{flexWrap: 'wrap'}}>
                                                                                <Card style={{minWidth:'250px'}} className={cnMixSpace({p:'m', mR: 'm', mB:'m'})}>
                                                                                        <Text size="l" weight="semibold" view="secondary">Лофт №1</Text>
                                                                                </Card>
                                                                </Layout>
                                                        </Layout>
                                                )}
                                                {activeTab.id === 1 && (
                                                        <Layout direction="row" style={{flexWrap: 'wrap'}}>
                                                                <div className={cnMixSpace({ m:'2xl'})}><LoftsBookingList bookingsToday={bookingsToday}/></div>
                                                        </Layout>
                                                )}
                                                {activeTab.id === 2 && (
                                                        <>
                                                                <Layout direction="row" style={{alignItems: 'center', justifyContent: 'space-between'}} className={cnMixSpace({mT:'xl', pH:'m'})}>
                                                                        <Text >{`Помещений всего (${count})`}</Text>
                                                                        <Layout direction="row" style={{alignItems: 'center', justifyContent: 'right'}}>
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
                                                                <LoftsBookingTable
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
                                                        </>
                                                )}
                                                        
                                                
                                                


                                        </Layout>
                                        
                                </Card>
                                
                        </Layout>
                </Layout>
        );
};
export default LoftsBookingPage;