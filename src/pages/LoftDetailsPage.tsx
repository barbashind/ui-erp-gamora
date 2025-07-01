import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { routeTarget } from "../routers/routes";
import { AntIcon } from "../utils/AntIcon";
import { cnMixFontSize } from "../utils/MixFontSize";
import { concatUrl } from "../utils/urlUtils";
import { HomeOutlined, PlusSquareOutlined } from "@ant-design/icons";
import { Button } from "@consta/uikit/Button";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { Card } from "@consta/uikit/Card";
import { useEffect, useState } from "react";

import { Tabs } from '@consta/uikit/Tabs';

import classses from "./LoftDetailsPage.module.css"
import { LoftStatus } from "../types/loft-details-types";
import { getLoftStatus } from "../services/LoftManagmentService";
import { ProgressStepBar } from '@consta/uikit/ProgressStepBar';

const LoftDetailsPage = () => {

        const navigate = useNavigate();

        interface Tab {
                        id: number;
                        label: string;
                        link: string;
                }
        
        const tabs: Tab[] = [
                {
                        id: 0,
                        label: 'Общие данные',
                        link: routeTarget.commonData,
                },
                {
                        id: 1,
                        label: 'Загрузка медиа',
                        link: routeTarget.mediaData,
                },
                {
                        id: 2,
                        label: 'Режим работы',
                        link: routeTarget.timepriceData,
                },

                {
                        id: 3,
                        label: 'Мебель и оборудование',
                        link: routeTarget.equipmentData,
                },
                {
                        id: 4,
                        label: 'Дополнительные услуги',
                        link: routeTarget.serviceData,
                },
        ]

        const [activeTab, setActiveTab] = useState<Tab>(tabs[0])
        const [isNewLoft, setIsNewLoft] = useState<boolean>(true)
        const [loftId, setLoftId] = useState<string | null>(null)
        const location = useLocation();

        useEffect(() => {
                const tabsDef: Tab[] = [
                        {
                                id: 0,
                                label: 'Общие данные',
                                link: routeTarget.commonData,
                        },
                        {
                                id: 1,
                                label: 'Загрузка медиа',
                                link: routeTarget.mediaData,
                        },
                        {
                                id: 2,
                                label: 'Режим работы',
                                link: routeTarget.timepriceData,
                        },

                        {
                                id: 3,
                                label: 'Мебель и оборудование',
                                link: routeTarget.equipmentData,
                        },
                        {
                                id: 4,
                                label: 'Дополнительные услуги',
                                link: routeTarget.serviceData,
                        },
                ]
                const parth = location.pathname.split('/');
                const loftIdNum = parth[location.pathname.split('/').length - 2];
                const tab = parth[location.pathname.split('/').length - 1];
                setLoftId(parth[location.pathname.split('/').length - 2])
                if (loftIdNum === 'new') {
                        setIsNewLoft(true);
                } else {
                        setIsNewLoft(false);
                }
                setActiveTab(tabsDef.find(el=> (el.link === tab)) ?? tabsDef[0]);
        }, [location])

        const [loftStatus, setLoftStatus] = useState<LoftStatus>()

        useEffect(() => {
                if ((loftId !== 'new')) {
                        const getLoftStatusData = async () => {
                                await getLoftStatus(Number(loftId), (resp)=> {
                                        setLoftStatus(
                                                {
                                                        commonData: resp.commonData,
                                                        mediaData: resp.mediaData,
                                                        timepriceData: resp.timepriceData,
                                                        equipmentData: resp.equipmentData,
                                                        serviceData: resp.serviceData,
                                                        valid: resp.valid
                                                }
                                        );
                                })
                        }
                        void getLoftStatusData();
                }
        
        }, [loftId, location])

        return (
                <Layout direction="column" style={{width: '100%'}}>
                        <Layout 
                                direction="row" 
                                style={{justifyContent:'left', alignItems:'center'}}
                                className={cnMixSpace({pL:'2xl', pR:'4xl', pV:'m'})}
                        >
                                <Button
                                        view="clear"
                                        label={'Вернуться к списку помещений'}
                                        size="s"
                                        onClick={()=>{
                                                navigate(concatUrl([routeTarget.main, routeTarget.loftsManadgment]));
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
                                        // maxHeight: 'calc(100vh - 138px)', 
                                        gap: '32px', 
                                        paddingRight: '32px', 
                                        paddingLeft: '32px', 
                                        paddingBottom: '32px', 
                                        // flexWrap: 'wrap',
                                        width: '100%',
                                        minWidth: '300px'
                                }}
                        >
                                <Card 
                                        style={{ 
                                                backgroundColor: 'var(--color-bg-default)', 
                                                width: '100%',
                                                flex: 3,
                                                overflow: 'hidden'
                                        }} 
                                        className={cnMixSpace({pL:'l', pT:'l', pR:'m', pB:'m'})}
                                >
                                        {isNewLoft ? (
                                                <Layout direction="row" style={{alignItems:'center'}} >
                                                        <PlusSquareOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}} />
                                                        <Text size="xl" weight='semibold' style={{color: 'var(--color-blue-ui)'}} className={cnMixSpace({mL:'m'})} >{'Добавление нового помещения'}</Text>
                                                </Layout>
                                        ) : (
                                                <Layout direction="row" >
                                                        <Tabs 
                                                                items={tabs} 
                                                                value={activeTab} 
                                                                onChange={(value) => {
                                                                        setActiveTab(value);
                                                                        navigate(concatUrl([routeTarget.main, `loft-details/${loftId}`, value.link]))
                                                                }} 
                                                                disabled={isNewLoft} 
                                                                size="s" 
                                                                className={classses.Tabs}
                                                        />
                                                </Layout>
                                        )}
                                                <Layout direction="row" style={{flexWrap: 'wrap'}}>
                                                      <Outlet/>
                                                </Layout>
                                </Card>
                                <Card 
                                        style={{ 
                                                backgroundColor: 'var(--color-bg-default)', 
                                                width: '100%',
                                                flex: 0.8,
                                        }} 
                                        className={cnMixSpace({pL:'l', pT:'6xl', pR:'m', pB:'m'})}
                                >
                                                <ProgressStepBar
                                                        steps={[
                                                                {
                                                                        label: 'Ведение общих данных',
                                                                        point: 1,
                                                                        status: loftStatus?.commonData ? 'success' : 'alert',
                                                                        progress: (activeTab.id === 0),
                                                                        lineStatus: loftStatus?.commonData ? 'success' : 'alert',
                                                                },
                                                                {
                                                                        label: 'Загрузка медиа',
                                                                        point: 2,
                                                                        status: loftStatus?.mediaData ? 'success' : 'alert',
                                                                        progress: (activeTab.id === 1),
                                                                        lineStatus: loftStatus?.mediaData ? 'success' : 'alert',
                                                                },
                                                                {
                                                                        label: 'Ведение графика работы лофта',
                                                                        point: 3,
                                                                        status: loftStatus?.timepriceData ? 'success' : 'alert',
                                                                        progress: (activeTab.id === 2),
                                                                        lineStatus: loftStatus?.timepriceData ? 'success' : 'alert',
                                                                },
                                                                {
                                                                        label: 'Добавление данных о мебели и оборудовании',
                                                                        point: 4,
                                                                        status: loftStatus?.equipmentData ? 'success' : 'alert',
                                                                        progress: (activeTab.id === 3),
                                                                        lineStatus: loftStatus?.equipmentData ? 'success' : 'alert',
                                                                },
                                                                {
                                                                        label: 'Выбор дополнительных услуг',
                                                                        point: 5,
                                                                        status: loftStatus?.serviceData ? 'success' : 'alert',
                                                                        progress: (activeTab.id === 4),
                                                                        lineStatus: loftStatus?.serviceData ? 'success' : 'alert',
                                                                },
                                                                {
                                                                        label: 'Проверка данных на стороне сервиса',
                                                                        point: 6,
                                                                        status: loftStatus?.valid ? 'success' : 'alert',
                                                                        lineStatus: loftStatus?.valid ? 'success' : 'alert',
                                                                },
                                                        ]}
                                                        activeStepIndex={loftId === 'new' ? 0 : 4}
                                                        style={{minHeight: '100%'}}
                                                        direction="vertical"
                                                        size="m"
                                                />
                                </Card>
                        </Layout>
                        
                </Layout>
        );
};
export default LoftDetailsPage;