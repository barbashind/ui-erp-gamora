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

 
export interface TLoftBookingListModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loftId: number | undefined;
    setLoftId: React.Dispatch<React.SetStateAction<number | undefined>>;
    
}

const  LoftBookingListModal = ({
    isModalOpen,
    setIsModalOpen,
    loftId,
    setLoftId,
        
}: TLoftBookingListModalProps) => {

const [mainPhoto, setMainPhoto] = useState<Blob>()
const [photoLoading, setPhotoLoading] = useState<boolean>(false)
const [flagcheck, setflagcheck] = useState<boolean>(false)

    // Инициализация данных
    useEffect(() => {
        setPhotoLoading(true);
            const getMainPhoto = async (loftId: number) => {
                try {
                    await getLoftMainImage(Number(loftId), (async (resp)=> {
                        if (resp) {
                        await getImage(resp).then((response) => {
                            if (response) {
                                setMainPhoto(response);
                                setPhotoLoading(false);
                            }
                        })
                        }
                    }))
                } catch(error) {
                    console.log(error);
                }
                
            }
            void getMainPhoto(Number(loftId))
    }, [loftId]);
        
    const closeModal = () => {
            setLoftId(undefined);
            setIsModalOpen(false);
            setflagcheck(false);
        };
        
    return (
        <Modal 
            isOpen={isModalOpen}
            style={{ width: '50%' }}
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
                        Наименование лофта - время бронирования
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
                <Layout direction='row' style={{  justifyContent: 'space-between' }}>
                    <Layout 
                        direction="column"
                        className={cnMixSpace({mT:'m', mR:'m' })}
                        flex={1}
                    >
                        <Card border className={cnMixSpace({ p: 'm' })} style={{ width: '100%' }}>
                            <Layout 
                                direction="row"
                                style={{ alignItems: 'center', justifyContent: 'left', width: '100%', borderBottom: '1px solid var(--color-gray-200)' }}
                                className={cnMixSpace({ pB: 'xs' })}
                            >
                                <UserOutlined style={{ fontSize: '1.5em', color: 'var(--color-gray-400)'}} className={cnMixSpace({ mR: 's' })} />
                                <Text
                                    size="m"  
                                    align="left"
                                    style={{ width: '100%', color: 'var(--color-gray-400)' }}
                                    weight="semibold"
                                >
                                    Данные клиента
                                </Text>
                            </Layout>
                            <Layout direction="column"  >
                                <Layout direction='row' className={cnMixSpace({mT: 'l' })} style={{alignItems: 'center'}}>
                                    <Avatar
                                            name={'Павел'}
                                            className={cnMixSpace({ mR: 's' })}
                                            size='s'
                                    />
                                    <Text
                                        size="m"  
                                        align="left"
                                        view="primary"
                                        
                                    >
                                        {"Павел"}
                                    </Text>
                                </Layout>
                                <Layout direction='row' className={cnMixSpace({mT: 'm' })}>
                                    <PhoneFilled style={{ fontSize: '1em', color: 'var(--color-blue-ui)'}} className={cnMixSpace({ mR: 'xs' })} />
                                    <Text
                                        size="m"  
                                        align="left"
                                        style={{ width: '100%' }}
                                        view="primary"
                                        
                                    >
                                        {"+12345678900"}
                                    </Text>
                                </Layout>
                                <Layout direction='row' className={cnMixSpace({mT: 'm' })}>
                                    <MailOutlined style={{ fontSize: '1em', color: 'var(--color-blue-ui)'}} className={cnMixSpace({ mR: 's' })} />
                                    <Text
                                        size="m"  
                                        align="left"
                                        style={{ width: '100%' }}
                                        view="primary"
                                        
                                    >
                                        {"ivanov@mail.ru"}
                                    </Text>
                                </Layout>
                            </Layout>

                        </Card>
                    </Layout>
                    {mainPhoto && !photoLoading ? (
                        <Layout 
                            style={{
                                minHeight: '270px', 
                                minWidth: '380px', 
                                backgroundSize: 'cover', 
                                backgroundPosition: 'center',
                                backgroundImage: `url(${URL.createObjectURL(mainPhoto)})` ,
                                borderRadius: '8px'
                            }} 
                            flex={1}
                            className={cnMixSpace({ mT: 'm', mR: 'xl' })}
                        />
                        ) : (
                        <SkeletonBrick style={{ flex: 1}} height={270} width={380}/>
                    )}
                </Layout>
                <Layout direction='row' className={cnMixSpace({ mT: 'l' })}>
                    <Card border style={{ flex: 1 }} className={cnMixSpace({ p: 'm', mR: 'l' })}>
                        <Layout 
                            direction="row"
                            style={{ alignItems: 'center', justifyContent: 'left', borderBottom: '1px solid var(--color-gray-200)' }}
                            className={cnMixSpace({ pB: 'xs' })}
                        >
                            <DollarOutlined style={{ fontSize: '1.5em', color: 'var(--color-gray-400)'}} className={cnMixSpace({ mR: 's' })} />
                            <Text
                                size="m"  
                                align="left"
                                style={{ width: '100%', color: 'var(--color-gray-400)' }}
                                weight="semibold"
                            >
                                Расчет стоимости броинрования
                            </Text>
                        </Layout>
                        {/* Перечень доп услуг*/}
                        <Layout direction='column'>

                        </Layout>
                    </Card>
                    <Card border style={{ flex: 1 }} className={cnMixSpace({ p: 'm', mR: 'm' })}>
                        <Layout 
                            direction="row"
                            style={{ alignItems: 'center', justifyContent: 'left', borderBottom: '1px solid var(--color-gray-200)' }}
                            className={cnMixSpace({ pB: 'xs' })}
                        >
                            {!flagcheck ? (<Button
                        size="m"
                        view="clear"
                        label="Проверено"
                        style={{ color: '#0078d2' }}
                        iconLeft={AntIcon.asIconComponent(() => (
                                    <CheckOutlined
                                            className={cnMixFontSize('l')}
                                    />
                            ))}
                        onClick={() => {
                               setflagcheck(true) ;
                            }}
                            
                    />) : (<Tag mode="info"  label="Проверено" style={{ color: '#53f266' }} /> ) }
                            <DesktopOutlined style={{ fontSize: '1.5em', color: 'var(--color-gray-400)'}} className={cnMixSpace({ mL: 's' })} />
                            <Text
                                size="m"  
                                align="left"
                                style={{ width: '100%', color: 'var(--color-gray-400)' }}
                                weight="semibold"
                            >
                                Оборудование и мебель
                            </Text>
                        </Layout>

                        {/* Перечень оборудования и мебели */}
                        <Layout direction='column'>

                        </Layout>
                    </Card>
                </Layout>
                <Layout direction="row" style={{ justifyContent: 'right' }} className={cnMixSpace({ mT: 'xs' })}>
                            <Button
                                size="s"
                                view="secondary"
                                label="Завершить аренду"
                                width="default"
                                onClick={() => {
                                    closeModal();
                                }}
                            />

                            <Button
                                className={cnMixSpace({ mL: 'm' })}
                                size="s"
                                label="Закрыть"
                                width="default"
                                onClick={() => {
                                    closeModal()
                                }}
                            />

                            
                        </Layout>
            </Layout>
        </Modal>
    
    );
};
export default LoftBookingListModal;