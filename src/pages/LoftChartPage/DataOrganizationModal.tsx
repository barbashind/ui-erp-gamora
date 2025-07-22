import { Layout } from '@consta/uikit/Layout';
import { Text } from '@consta/uikit/Text';
import { Button } from '@consta/uikit/Button';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Modal } from '@consta/uikit/Modal';
import {UserOutlined, DollarOutlined, CloseOutlined, PhoneFilled, MailOutlined, DesktopOutlined,CheckOutlined} from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { getImage, getLoftMainImage } from '../../services/LoftManagmentService';
import { AntIcon } from '../../utils/AntIcon';
import { cnMixFontSize } from '../../utils/MixFontSize';
import { Card } from '@consta/uikit/Card';
import { Avatar } from '@consta/uikit/Avatar';
import { SkeletonBrick } from '@consta/uikit/Skeleton';
import { Tag } from '@consta/uikit/Tag';
import { TextField } from '@consta/uikit/TextField';
import { YMaps,Map } from '@pbe/react-yandex-maps';
import { Placemark } from '@pbe/react-yandex-maps/typings/geo-objects/Placemark';

 
export interface TDataOrganizationModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    
    
}

const  DataOrganizationModal = ({
    isModalOpen,
    setIsModalOpen,
    
        
}: TDataOrganizationModalProps) => {


const [flagcheck, setflagcheck] = useState<boolean>(false)

    
        
    const closeModal = () => {
            setIsModalOpen(false);
            setflagcheck(false);
        };
        
    return (
        <Modal 
            isOpen={isModalOpen}
            style={{ width: '30%' }}
            hasOverlay
            
        >
            
                
            <Layout direction='column' className={cnMixSpace({ pL: '2xl', pR: 'm', pV: 'm' })}>
                <Layout direction="row"  style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text
                        size="xl"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        Данные организации
                    </Text>
                    <Button
                        size="m"
                        view="clear"
                        style={{ color: '#0078d2' }}
                        iconLeft={AntIcon.asIconComponent(() => (
                                    <CloseOutlined
                                            className={cnMixFontSize('l')}
                                    />
                            ))}
                        onClick={() => {
                                closeModal();
                            }}
                    />
                </Layout>
                                <Layout direction="row" style={{ alignItems: 'end' }}>
                                    <TextField
                                        type="text"
                                        className={cnMixSpace({mT:'l'})}
                                        placeholder="Название"
                                        size="s"
                                        id="size"
                                        style={{ width: '100%' }}
                                    />
                                </Layout> 
                                <Layout direction="row" style={{ alignItems: 'end' }}>
                                    <TextField
                                        type="text"
                                        className={cnMixSpace({mT:'l'})}
                                        placeholder="Адрес"
                                        size="s"
                                        id="size"
                                        style={{ width: '100%' }}
                                    />
                                </Layout>
                                <Layout direction="row" style={{ alignItems: 'end' }}>
                                    <TextField
                                        type="text"
                                        className={cnMixSpace({mT:'l'})}
                                        placeholder="Телефон"
                                        size="s"
                                        id="size"
                                        style={{ width: '100%' }}
                                    />
                                </Layout>
                                <Layout
                            direction="column"
                            style={{ alignItems: 'center' }}
                            className={cnMixSpace({ mT: 'm' })}
                        >
                            <Button
                                view="primary"
                                size="s"
                                label="Продолжить"
                                className={cnMixSpace({
                                    m: 's',
                                })}
                                onClick={() => {
                                    
                                }}
                            />
                        </Layout>
                                 <Layout direction="row" style={{ alignItems: 'end' }}>
                                    <YMaps><Map defaultState={{ center: [51.66749022, 39.1956443], zoom: 9 }}
                                    
                                      />
                                      
                                    </YMaps>
                                </Layout>   
                
            </Layout>
        </Modal>
    
    );
};
export default DataOrganizationModal;