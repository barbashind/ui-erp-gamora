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

const MainPage = () => {

        interface Tab {
                id: number;
                label: string;
                navTo: string;
        }

        const tabs: Tab[] = [
                {
                        id: 0,
                        label: 'Управление терминалами',
                        navTo: routeTarget.pointsManadgment,
                },
                {
                        id: 1,
                        label: 'Интеграция с MStroy',
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
                                label: 'Управление терминалами',
                                navTo: routeTarget.pointsManadgment,
                        },
                        {
                                id: 1,
                                label: 'Интеграция с MStroy',
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
                                        <Outlet/>
                                </Layout>
                        </Card>
                </Layout>
        );
};
export default MainPage;