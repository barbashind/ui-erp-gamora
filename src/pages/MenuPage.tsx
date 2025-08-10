import { routeTarget } from "../routers/routes";
import { concatUrl } from "../utils/urlUtils";
import { AreaChartOutlined, BankOutlined, BlockOutlined, BookOutlined,UsergroupAddOutlined } from "@ant-design/icons";
import { Card } from "@consta/uikit/Card";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";

import { Layout } from "@consta/uikit/Layout";

import { useNavigate } from "react-router-dom";

const MenuPage = () => {
const navigate = useNavigate()

        return (
                <Layout direction="column" >
                        <Layout 
                                direction='row' 
                                style={{ 
                                        minHeight: 'calc(100vh - 80px)', 
                                        // maxHeight: 'calc(100vh - 80px)', 
                                        gap: '32px', 
                                        padding: '32px', 
                                        paddingTop:'64px',
                                        flexWrap: 'wrap'
                                }}
                        >
                                <Card 
                                        style={{ 
                                                justifyItems: 'center',  
                                                backgroundColor: 'var(--color-bg-default)', 
                                                cursor: 'pointer',
                                                minHeight: '130px',
                                                maxHeight: '130px'
                                        }} 
                                        className={cnMixSpace({p:'m'})}
                                        onClick={() => {
                                                navigate(concatUrl([routeTarget.main, routeTarget.organization]));
                                        }}
                                >
                                        <BankOutlined style={{ fontSize: '3em', color: 'var(--color-blue-ui)'}} className={cnMixSpace({mB:'xs'})}/>
                                        <Text size="m" weight='semibold' style={{minWidth:'130px', maxWidth: '130px', color: 'var(--color-blue-ui)'}} align="center">Основные данные организации</Text>
                                </Card>
                                <Card 
                                        style={{ 
                                                justifyItems: 'center',  
                                                backgroundColor: 'var(--color-bg-default)', 
                                                cursor: 'pointer',
                                                minHeight: '130px',
                                                maxHeight: '130px'
                                        }} 
                                        className={cnMixSpace({p:'m'})}
                                        onClick={() => {
                                                navigate(concatUrl([routeTarget.main, routeTarget.loftsManadgment]));
                                        }}
                                >
                                        <BlockOutlined style={{ fontSize: '3em', color: 'var(--color-blue-ui)'}} className={cnMixSpace({mB:'xs'})}/>
                                        <Text size="m" weight='semibold' style={{minWidth:'130px', maxWidth: '130px', color: 'var(--color-blue-ui)'}} align="center">Управление помещениями</Text>
                                </Card>
                                <Card 
                                        style={{ 
                                                justifyItems: 'center',  
                                                backgroundColor: 'var(--color-bg-default)', 
                                                cursor: 'pointer',
                                                minHeight: '130px',
                                                maxHeight: '130px'
                                        }} 
                                        className={cnMixSpace({p:'m'})}
                                       onClick={() => {
                                                navigate(concatUrl([routeTarget.main, routeTarget.bookingManagment]));
                                        }}
                                >
                                        <BookOutlined style={{ fontSize: '3em', color: 'var(--color-blue-ui)'}} className={cnMixSpace({mB:'xs'})}/>
                                        <Text size="m" weight='semibold' style={{minWidth:'130px', maxWidth: '130px', color: 'var(--color-blue-ui)'}} align="center">Управление бронированиями</Text>
                                </Card>
                                
                                <Card 
                                        style={{ 
                                                justifyItems: 'center',  
                                                backgroundColor: 'var(--color-bg-default)', 
                                                cursor: 'pointer',
                                                minHeight: '130px',
                                                maxHeight: '130px'
                                        }}
                                        className={cnMixSpace({p:'m'})}
                                        
                                >
                                        <AreaChartOutlined style={{ fontSize: '3em', color: 'var(--color-blue-ui)'}} className={cnMixSpace({mB:'xs'})}/>
                                        <Text size="m" weight='semibold' style={{minWidth:'130px', maxWidth: '130px', color: 'var(--color-blue-ui)'}} align="center">Аналитика компании</Text>
                                </Card>
                                <Card 
                                        style={{ 
                                                justifyItems: 'center',  
                                                backgroundColor: 'var(--color-bg-default)', 
                                                cursor: 'pointer',
                                                minHeight: '130px',
                                                maxHeight: '130px'
                                        }} 
                                        className={cnMixSpace({p:'m'})}
                                       onClick={() => {
                                                navigate(concatUrl([routeTarget.main, routeTarget.mapLofts]));
                                        }}
                                >
                                        <UsergroupAddOutlined style={{ fontSize: '3em', color: 'var(--color-blue-ui)'}} className={cnMixSpace({mB:'xs'})}/>
                                        <Text size="m" weight='semibold' style={{minWidth:'130px', maxWidth: '130px', color: 'var(--color-blue-ui)'}} align="center">Пользователи</Text>
                                </Card>
                        </Layout>
                </Layout>
        );
};
export default MenuPage;