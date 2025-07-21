import { Layout } from '@consta/uikit/Layout';
import { Text } from '@consta/uikit/Text';
import { Button } from '@consta/uikit/Button';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Modal } from '@consta/uikit/Modal';
import {UserOutlined, DollarOutlined, CloseOutlined, PhoneFilled, MailOutlined, DesktopOutlined,CheckOutlined, PlusOutlined} from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { getImage, getLoftMainImage } from '../../services/LoftManagmentService';
import { AntIcon } from '../../utils/AntIcon';
import { cnMixFontSize } from '../../utils/MixFontSize';
import { Card } from '@consta/uikit/Card';
import { Avatar } from '@consta/uikit/Avatar';
import { SkeletonBrick } from '@consta/uikit/Skeleton';
import { Tag } from '@consta/uikit/Tag';
import { TextField } from '@consta/uikit/TextField';

 
export interface TAddUserModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    
    
}

const  AddUsersModal = ({
    isModalOpen,
    setIsModalOpen,
    
        
}: TAddUserModalProps) => {


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
                        Добавление пользователей
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
                                        placeholder="E mail"
                                        size="s"
                                        id="size"
                                        style={{ width: '100%' }}
                                    />
                                </Layout> 
                                
                                                                <Layout direction="row" style={{justifyContent: 'space-between'}}>
                                                                        <TextField
                                                                            className={cnMixSpace({mT:'l'})}
                                                                            type="text"
                                                                            size="s"
                                                                            id="size"
                                                                            style={{ width: '100%' }}
                                                                        />
                                                                       <Button 
                                                                                label={'Добавить еще'}
                                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                                        <PlusOutlined
                                                                                                className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                        />
                                                                                ))}
                                                                                size="s"
                                                                                view="secondary"
                                                                                className={cnMixSpace({mT:'l'})}
                                                                        />
                                                                </Layout>
                                                               <Layout direction="row" style={{justifyContent: 'space-between'}}>
                                                                       <Button 
                                                                                label={'Пропустить шаг'}
                                                                                size="s"
                                                                                view="secondary"
                                                                                className={cnMixSpace({mT:'l'})}
                                                                        /> 
                                                                       <Button 
                                                                                label={'Продолжить'}
                                                                                size="s"
                                                                                view="primary"
                                                                                className={cnMixSpace({mT:'l'})}
                                                                        />
                                                                </Layout> 
                                   
                
            </Layout>
        </Modal>
    
    );
};
export default AddUsersModal;