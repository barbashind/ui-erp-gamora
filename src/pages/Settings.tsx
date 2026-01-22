// компоненты Consta
import { Layout } from "@consta/uikit/Layout"
import { cnMixSpace } from "@consta/uikit/MixSpace/index"
import { Card } from '@consta/uikit/Card';
import { Text } from "@consta/uikit/Text";
import { useEffect, useState } from "react";
import { getUserInfo } from "../services/AuthorizationService";
import Users from "./SettingsPage/Users";

// собственные компоненты



const Settings = () => {

        const [role, setRole] = useState<string | undefined>(undefined);

             useEffect(() => {
                        
                        const getUserInfoData = async () => {
                                await getUserInfo().then((resp) => {
                                        setRole(resp.role);
                                })
                        };
                        
                        void getUserInfoData();
                }, []);

        return (
                <Card style={{width: '100%'}} className={cnMixSpace({p: 's'})}>
                        {role === 'ADM' && (
                                <Layout direction="column" style={{width: '100%'}} className={cnMixSpace({mL: 'm', p: 's'})}>
                                        <Text size='2xl' view='brand' weight="semibold" align="left">Настройки системы</Text>
                                        
                                        <Users />
                                </Layout>
                        )}
                        {role !== 'ADM' && (
                                <Text>Нет полномочий</Text>
                        )}
                                
                </Card>

        )
}
export default Settings;