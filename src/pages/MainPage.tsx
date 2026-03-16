// компоненты React
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// компоненты Consta
import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { ChoiceGroup } from "@consta/uikit/ChoiceGroup";

// собственные компоненты 
import { DashBoard } from "../global/DashBoard";
import { routeTarget } from "../routers/routes";
import { concatUrl } from "../utils/urlUtils";
import { Text } from "@consta/uikit/Text";
import { BarChartOutlined, FundProjectionScreenOutlined, NodeIndexOutlined } from "@ant-design/icons";

const MainPage = () => {

        interface Tab {
                id: number;
                label: string;
                navTo: string;
        }

        const tabs: Tab[] = [
                {
                        id: 0,
                        label: 'Мониторинг терминалов',
                        navTo: routeTarget.pointsManadgment,
                },
                {
                        id: 1,
                        label: 'Карта ВСМ-1',
                        navTo: routeTarget.map,
                },
                {
                        id: 2,
                        label: 'Дашборды по проходам',
                        navTo: routeTarget.interagtionMStroy,
                },

        ]

        const [activeTab, setActiveTab] = useState<Tab>(tabs[0])
        const location = useLocation();
        const navigate = useNavigate();


        useEffect(() => {
                const tabsDef: Tab[] = [
                        {
                                id: 0,
                                label: 'Мониторинг терминалов',
                                navTo: routeTarget.pointsManadgment,
                        },
                        {
                                id: 1,
                                label: 'Карта ВСМ-1',
                                navTo: routeTarget.map,
                        },
                        {
                                id: 2,
                                label: 'Дашборды по проходам',
                                navTo: routeTarget.interagtionMStroy,
                        },
                ]
                tabsDef.findIndex(
                        elem => concatUrl([routeTarget.main, elem.navTo]) == location.pathname
                )
                setActiveTab(tabsDef?.find((elem) => (concatUrl([routeTarget.main, elem.navTo]) == location.pathname)) ?? tabsDef[0])
        }, [location]);

        


        return (
                <Layout direction="column" >
                        <DashBoard/>
                        <Card className={cnMixSpace({m:'m', p:'m' })} style={{ backgroundColor: 'var(--color-bg-default)' }}>
                                <Layout direction="column">
                                        {location.pathname != routeTarget.main && (
                                                <Layout direction="row" style={{justifyContent: 'space-between'}}>
                                                        <ChoiceGroup
                                                                value={activeTab}
                                                                items={tabs}
                                                                name="selectTab"
                                                                size="m"
                                                                onChange={(value) => {
                                                                                setActiveTab(value);
                                                                                if (value.navTo) {
                                                                                        navigate(concatUrl([routeTarget.main, value.navTo]));
                                                                                }
                                                                        }}
                                                        />   
                                                </Layout>    
                                        )}
                                        {location.pathname == routeTarget.main && (
                                                <Layout direction='row' style={{justifyContent:'center'}}>
                                                        <Card 
                                                                className={cnMixSpace({p: 'l', m: 'l'}) + ' CardIcon'} 
                                                                border 
                                                                style={{cursor:'pointer', minWidth: '230px'}}
                                                                onClick={()=> {
                                                                                navigate(concatUrl([routeTarget.main, routeTarget.pointsManadgment]));
                                                                                setActiveTab(tabs[0]);
                                                                        }}
                                                        >
                                                                <Layout direction="column" style={{alignItems: 'center'}}>
                                                                        <FundProjectionScreenOutlined style={{ fontSize: '48px', color: 'var(--color-blue-ui)' }}/>
                                                                        <Text style={{ color: 'var(--color-blue-ui)' }} className={cnMixSpace({mT: 'm'})}>
                                                                                Мониторинг терминалов
                                                                        </Text>  
                                                                </Layout>
                                                                
                                                        </Card>
                                                        <Card 
                                                                className={cnMixSpace({p: 'l', m: 'l'}) + ' CardIcon'} 
                                                                border 
                                                                style={{cursor:'pointer', minWidth: '230px'}}
                                                                onClick={()=> {
                                                                                navigate(concatUrl([routeTarget.main, routeTarget.map]));
                                                                                setActiveTab(tabs[1]);
                                                                        }}
                                                        >
                                                                <Layout direction="column" style={{alignItems: 'center'}}>
                                                                        <NodeIndexOutlined style={{ fontSize: '48px', color: 'var(--color-blue-ui)' }}/>
                                                                        <Text style={{ color: 'var(--color-blue-ui)' }} className={cnMixSpace({mT: 'm'})}>
                                                                                Проходные на карте
                                                                        </Text>
                                                                </Layout>
                                                                
                                                        </Card>
                                                        <Card 
                                                                className={cnMixSpace({p: 'l', m: 'l'}) + ' CardIcon'} 
                                                                border 
                                                                style={{cursor:'pointer', minWidth: '230px'}}
                                                                onClick={()=> {
                                                                                navigate(concatUrl([routeTarget.main, routeTarget.interagtionMStroy]));
                                                                                setActiveTab(tabs[2]);
                                                                        }}
                                                        >
                                                                <Layout direction="column" style={{alignItems: 'center'}}>
                                                                        <BarChartOutlined style={{ fontSize: '48px', color: 'var(--color-blue-ui)' }}/>
                                                                        <Text  style={{ color: 'var(--color-blue-ui)' }} className={cnMixSpace({mT: 'm'})}>
                                                                                Дашборд по проходам  
                                                                        </Text>
                                                                </Layout>
                                                                
                                                        </Card>
                                                </Layout>
                                        )}
                                        <Outlet/>
                                </Layout>
                        </Card>
                </Layout>
        );
};
export default MainPage;