// компоненты React
import { Outlet, useLocation, useNavigate } from "react-router-dom";

// компоненты Consta
import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";

// собственные компоненты 
import { DashBoard } from "../global/DashBoard";
import { routeTarget } from "../routers/routes";
import { concatUrl } from "../utils/urlUtils";
import { Text } from "@consta/uikit/Text";
import { BarChartOutlined, FundProjectionScreenOutlined, NodeIndexOutlined } from "@ant-design/icons";

const MainPage = () => {

       
        const location = useLocation();
        const navigate = useNavigate();

        return (
                <Layout direction="column" >
                        <DashBoard/>
                        <Card className={cnMixSpace({m:'m', p:'m' })} style={{ backgroundColor: 'var(--color-bg-default)' }}>
                                <Layout direction="column">
                                        {/* {location.pathname != routeTarget.main && (
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
                                        )} */}
                                        {location.pathname == routeTarget.main && (
                                                <Layout direction='row' style={{justifyContent:'center'}}>
                                                        <Card 
                                                                className={cnMixSpace({p: 'l', m: 'l'}) + ' CardIcon'} 
                                                                border 
                                                                style={{cursor:'pointer', minWidth: '230px'}}
                                                                onClick={()=> {
                                                                                navigate(concatUrl([routeTarget.main, routeTarget.pointsManadgment]));
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
                                                                                navigate(concatUrl([routeTarget.main, routeTarget.faceIDReportPage]));
                                                                        }}
                                                        >
                                                                <Layout direction="column" style={{alignItems: 'center'}}>
                                                                        <BarChartOutlined style={{ fontSize: '48px', color: 'var(--color-blue-ui)' }}/>
                                                                        <Text  style={{ color: 'var(--color-blue-ui)' }} className={cnMixSpace({mT: 'm'})}>
                                                                                Дашборды
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