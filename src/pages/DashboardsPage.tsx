
import { Layout } from "@consta/uikit/Layout";
import { Tabs } from '@consta/uikit/Tabs';
import { useState } from "react";
import MoscowObjects from "./Dashboards/MoscowObjects";
import FaceIDReport from "./Dashboards/FaceIDReport";
import FaceIDRegistration from "./Dashboards/FaceIDRegistration";


const DashboardsPage = () => { 

interface Tab {
        id: number;
        label: string;
}

const tabs: Tab[] = [
        {
                id: 0,
                label: 'СКУД: объекты г.Москвы',
        },
        {
                id: 1,
                label: 'СКУД: численность на объектах',
        },
        {
                id: 2,
                label: 'Регистрация FaceID',
        },
]

const [activeTab, setActiveTab] = useState<Tab>(tabs[0])
        
        
        return (
                <Layout direction="column">
                                        <Tabs
                                                value={activeTab}
                                                onChange={setActiveTab}
                                                items={tabs}
                                                getItemLabel={(item) => (item.label)}
                                        />
                                        
                        
                        <Layout direction="column">
                                {activeTab.id === 0 && (
                                        <MoscowObjects />
                                )}
                                {activeTab.id === 1 && (
                                        <FaceIDReport />
                                )}
                                {activeTab.id === 2 && (
                                        <FaceIDRegistration />
                                )}
                                
                        </Layout>
                </Layout>
        );
};
export default DashboardsPage;