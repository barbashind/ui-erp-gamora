import { useState, useEffect, useRef } from "react";

// компоненты Consta
import { Layout } from "@consta/uikit/Layout"
import { Button } from "@consta/uikit/Button";
import { Avatar } from '@consta/uikit/Avatar';
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { ContextMenu } from '@consta/uikit/ContextMenu';

// Иконки
import {  CheckSquareOutlined, LogoutOutlined, MenuOutlined } from "@ant-design/icons";

// Доп. хуки
import { AntIcon } from "../utils/AntIcon";
import { cnMixFontSize } from "../utils/MixFontSize";



import './DashBoard.css'
import { useNavigate } from "react-router-dom";
import { routeTarget } from "../routers/routes";
import { concatUrl } from "../utils/urlUtils";
import { getUserInfo } from "../services/AuthorizationService";
import { UserInfo } from "../types/common-types";
import { Text } from "@consta/uikit/Text";

export const DashBoard = () => {

const [user, setUser] = useState<UserInfo | undefined>(undefined);

const [isLoading, setIsLoading] = useState<boolean>(true);

const menuRef = useRef<HTMLButtonElement>(null)
const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
const menuItems = [
        
        {
                label: 'Выйти из системы',
                icon: LogoutOutlined,
                function: () => {
                        localStorage.removeItem('token');
                        window.location.reload();
                }
        },
]

  useEffect(() => {
      const getUserData = async () => {
          const resp = await getUserInfo();
          setUser(resp);
          setIsLoading(false);
      };
      getUserData();
  }, []);

const navigate = useNavigate();

        return (
                <Layout direction="row" className={cnMixSpace({pH: 'm', pV:'s', })} style={{justifyContent: 'space-between', alignItems: 'center'}}>
                                <CheckSquareOutlined
                                        className={cnMixFontSize('3xl')}
                                        onClick={()=>{ navigate(concatUrl([routeTarget.main])) }}
                                />
                                <Layout direction="row" style={{ alignItems: 'center' }}>
                                        {!isLoading && (
                                                <>
                                                        <Avatar
                                                                name={user?.username || ''}
                                                                onClick={()=>{console.log(user)}}
                                                        />
                                                        <Text
                                                                className={cnMixSpace({mL: 's', mR: '2xl'})}
                                                        >
                                                                {user?.username}
                                                        </Text>
                                                </>
                                        )}
                                        <Button 
                                                iconLeft={AntIcon.asIconComponent(() => (
                                                        <MenuOutlined 
                                                                className={cnMixFontSize('l')}
                                                        />
                                                ))}
                                                onClick={()=>{ setIsMenuOpen(true); }}
                                                size="m"
                                                view="secondary"
                                                ref={menuRef}
                                        />
                                        <ContextMenu
                                                isOpen={isMenuOpen}
                                                items={menuItems}
                                                getItemLabel={(item) => item.label}
                                                anchorRef={menuRef}
                                                getItemLeftIcon={(item) => AntIcon.asIconComponent(item.icon)}
                                                onItemClick={(item) => {item.function();}}
                                                size="s"
                                                onClickOutside={()=>{ setIsMenuOpen(false); }}
                                                className={cnMixSpace({p:'s', mT:'s'})}
                                        />
                                </Layout>
                </Layout>
                
                
        )
}