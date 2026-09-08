
import { Layout } from "@consta/uikit/Layout";
import FaceIDFilter from "./IntegrationFaceIdPage/FaceIDFilter";
import { routeTarget } from "../routers/routes";
import { ChoiceGroup } from "@consta/uikit/ChoiceGroup";
import { useState } from "react";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import FaceIdKBSFilter from "./IntegrationFaceIdPage/FaceIdKBSFilter";


const FaceIDReportPage = () => { 
        
        interface Tab {
                        id: number;
                        label: string;
                }
        
                const tabs: Tab[] = [
                        {
                                id: 0,
                                label: 'Объекты Москвы (РС ЕБС)',
                        },
                        {
                                id: 1,
                                label: 'Обеъекты ГК АВТОБАН (КБС)',
                        },      
                ]
        
                const [activeTab, setActiveTab] = useState<Tab>(tabs[0])
        
        return (
                <Layout direction="column">
                       {location.pathname != routeTarget.main && (
                                <Layout direction="row" style={{justifyContent: 'space-between'}}>
                                        <ChoiceGroup
                                                value={activeTab}
                                                items={tabs}
                                                name="selectTab"
                                                size="m"
                                                view="secondary"
                                                onChange={(value) => {
                                                                setActiveTab(value);
                                                        }}
                                                className={cnMixSpace({mT:'l'})}
                                        />   
                                </Layout>    
                        )} 
                        {activeTab.id === 0 && (
                                <FaceIDFilter />
                        )}
                        {activeTab.id === 1 && (
                                <FaceIdKBSFilter />
                        )}
                </Layout>
        );
};
export default FaceIDReportPage;