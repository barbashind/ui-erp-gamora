import { useState } from 'react';
import { Layout } from '@consta/uikit/Layout';
import { Text } from '@consta/uikit/Text';
import { Button } from '@consta/uikit/Button';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { IconClose } from '@consta/icons/IconClose';
import { Modal } from '@consta/uikit/Modal';
import {UserOutlined,DollarOutlined,HomeOutlined } from "@ant-design/icons";
import classes from './LoftBookingList.module.css'

 
export interface TLoftBookingListModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    id: number | undefined;
    setId: React.Dispatch<React.SetStateAction<number | undefined>>;
    
}

const  LoftBookingListModal = ({
    isModalOpen,
    setIsModalOpen,
    id,
    setId,
    
    
}: TLoftBookingListModalProps) => {
    
    

    
    return (
        <Modal 
        isOpen={isModalOpen}
        style={{ width: '50%' }}
        hasOverlay
        className={cnMixSpace({ p: 'm' })}>
            
                
            <Layout direction='column'className={cnMixSpace({ pL: 'm' })} >
                <Layout direction="row"
                        style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text
                        size="2xl"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                     {`${id}` }   
                    </Text>
                    <Button
                        size="m"
                        view="clear"
                        style={{ color: '#0078d2' }}
                        iconLeft={IconClose}
                        onClick={() => {
                        setIsModalOpen(false);
                        }}
                    />
                </Layout>    
                <Layout direction="column"
                        style={{ alignItems: 'center', justifyContent: 'space-between' }}
                        className={cnMixSpace({mT:'m', mR:'m', p:'m' }) + ' ' + classes.BookingCard}>
                    <Text
                        size="l"  
                        align="left"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        {"Авг     25,2024"}
                    </Text>
                    <Text
                        size="l"  
                        align="left"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        {"10:00 AM - 04:00PM"}
                    </Text>
                </Layout>
                
                <Layout direction="column"
                        style={{ alignItems: 'normal', justifyContent: 'left' }} 
                        className={cnMixSpace({mT:'m', mR:'m', p:'m' }) + ' ' + classes.BookingCard}>
                    <Layout direction="row"
                            style={{ alignItems: 'center', justifyContent: 'left' }}
                             >
                    <UserOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}}className={cnMixSpace({ mR: 'm' })} />
                    <Text
                        size="l"  
                        align="left"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        Kлиент
                    </Text>
                    </Layout>
                    <Layout direction="column"className={cnMixSpace({mT:'s', mR:'m', p:'m',pL:'xl' })} >
                    <Text
                        size="l"  
                        align="left"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        {"Иванов Иван"}
                    </Text>
                    <Text
                        size="l"  
                        align="left"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        {"+12345678900"}
                    </Text>
                    <Text
                        size="l"  
                        align="left"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        {"ivanov.ivan @ e-mail"}
                    </Text>
                    </Layout>
                </Layout>
                <Layout direction="row"
                        style={{ alignItems: 'center', justifyContent: "space-between" }}
                        className={cnMixSpace({mT:'m', mR:'m', p:'m' }) + ' ' + classes.BookingCard}>
                    <DollarOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}} />
                    <Text
                        size="l"  
                        align="left"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        Ценообразование
                    </Text>
                    <Text
                        size="l"
                        view="primary"
                        weight="bold"
                        align="left"
                    >
                       { "$300"}
                    </Text>
                </Layout>
                <Layout direction="row"
                        style={{ alignItems: 'center', justifyContent: 'space-between', }}
                        className={cnMixSpace({mT:'m', mR:'m', p:'m' }) + ' ' + classes.BookingCard}>
                    <HomeOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}} />
                    <Text
                        size="l"  
                        align="left"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        Оборудование
                    </Text>
                </Layout>    
            </Layout>
        </Modal>
    );
};
export default LoftBookingListModal;