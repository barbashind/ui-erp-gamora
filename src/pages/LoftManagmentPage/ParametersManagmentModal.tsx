import { useEffect, useState } from "react";

import { Layout } from "@consta/uikit/Layout"
import { Button } from '@consta/uikit/Button';
import { Modal } from '@consta/uikit/Modal';
import { Text } from "@consta/uikit/Text";
import { cnMixSpace } from "@consta/uikit/MixSpace";

import { Equipment, Furniture, Service } from "../../types/loft-details-types";
import { AntIcon } from "../../utils/AntIcon";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { CloseOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { TextField } from "@consta/uikit/TextField";

import { getEquipment, getFurniture, getServices, updateEquipment, updateFurniture, updateServices } from "../../services/LoftListSettingsManagmentService";
import { Checkbox } from "@consta/uikit/Checkbox";
import { ChoiceGroup } from "@consta/uikit/ChoiceGroup";
import { Loader } from "@consta/uikit/Loader";
import { UserInfo } from "../../types/common-types";
import { getUserInfo } from "../../services/AuthorizationService";

interface ParametersManagmentModalProps {
        isOpen: boolean;
        setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    }

const ParametersManagmentModal = ({isOpen, setIsOpen, 
 } : ParametersManagmentModalProps) => {


        interface Tab {
                id: number;
                label: string;
        }

        const tabs: Tab[] = [
                {
                        id: 0,
                        label: 'Платные услуги',
                },
                {
                        id: 1,
                        label: 'Мебель',
                },
                {
                        id: 2,
                        label: 'Оборудование',
                },
        ]

        const [activeTab, setActiveTab] = useState<Tab>(tabs[0])

        const [services, setServices] = useState<Service[]>([])
        const [equipments, setEquipments] = useState<Equipment[]>([])
        const [furnitures, setFurnitures] = useState<Furniture[]>([])
        
        const [userInfo, setUserInfo] = useState<UserInfo>()

        const serviceDef : Service = {
                serviceCode: undefined,
                serviceName: null,
                companyId: userInfo?.companyId ?? 0,
                defaultPrice: null,
                isHourly: true,
        }
        const equipmentDef : Equipment = {
                companyId: userInfo?.companyId ?? 0,
                equipmentCode: undefined,
                equipmentName: null
        }
        const furnitureDef : Furniture = {
                companyId: userInfo?.companyId ?? 0,
                furnitureCode: undefined,
                furnitureName: null
        }

        const [isLoading, setIsLoading] = useState<boolean>(false)
        

        // Инициализация данных
        useEffect(() => {
                setIsLoading(true);
                const getServicesData = async () => {
                        await getServices((resp) => {
                                
                                if (!resp || !resp?.length) {
                                        setServices([{
                                                serviceCode: undefined,
                                                serviceName: null,
                                                companyId: userInfo?.companyId ?? 0,
                                                defaultPrice: null,
                                                isHourly: true,
                                        }]);
                                } else {
                                        setServices(resp);
                                }
                                setIsLoading(false);
                        })
                }
                const getEquipmentsData = async () => {
                        await getEquipment((resp) => {

                                if (!resp || !resp?.length) {
                                        setEquipments([{
                                                companyId: userInfo?.companyId ?? 0,
                                                equipmentCode: undefined,
                                                equipmentName: null
                                        }]);
                                } else {
                                        setEquipments(resp);
                                }
                                
                                setIsLoading(false);
                        })
                }
                const getFurnituresData = async () => {
                        await getFurniture((resp) => {
                                
                                if (!resp || !resp?.length) {
                                        setFurnitures([{
                                                companyId: userInfo?.companyId ?? 0,
                                                furnitureCode: undefined,
                                                furnitureName: null
                                        }]);
                                } else {
                                        setFurnitures(resp); 
                                }
                                setIsLoading(false);
                        })
                }
                const getUserInfoData = async () => {
                        await getUserInfo().then((resp) => {
                                setUserInfo(resp);
                        }).then(()=>{
                                if (activeTab.id === 0 && isOpen) {
                                        void getServicesData();
                                } 
                                if (activeTab.id === 1 && isOpen) {
                                        void getFurnituresData()
                                }
                                if (activeTab.id === 2 && isOpen) {
                                        void getEquipmentsData()
                                }
                                        })
                                };
                void getUserInfoData();

                
                
                
        }, [isOpen, activeTab, userInfo?.companyId]);

        const saveServiceData = async () => {
                try {
                        await updateServices(services.filter(item => (!!item.serviceName))).then((resp) => {
                                setServices(resp);
                                setIsLoading(false);
                        })
                } catch(error) {
                        console.log(error);
                }
        }
        const saveEquipmentData = async () => {
                try {
                        await updateEquipment(equipments.filter(item => (!!item.equipmentName))).then((resp) => {
                                setEquipments(resp);
                                setIsLoading(false);
                        })
                } catch(error) {
                        console.log(error);
                }
        }
        const saveFurnitureData = async () => {
                try {
                        await updateFurniture(furnitures.filter(item => (!!item.furnitureName))).then((resp) => {
                                setFurnitures(resp);
                                setIsLoading(false);
                        })
                } catch(error) {
                        console.log(error);
                }
        }



        return (
                <Modal
                        isOpen={isOpen}
                        hasOverlay
                        onEsc={() => {
                                setIsOpen(false);
                        }}
                        style={{width: '50vw', minWidth: '500px'}}
                >
                        <Layout direction="column" style={{width: '100%'}} className={cnMixSpace({ p:'xl' })}>
                                <Layout direction="row" style={{justifyContent: 'space-between', alignItems: 'center'}}>
                                        <ChoiceGroup 
                                                        items={tabs} 
                                                        value={activeTab} 
                                                        onChange={(value) => setActiveTab(value)} 
                                                        name={'tabParametres'} 
                                                        size="s"
                                                />
                                        
                                        <Button
                                                view="clear"
                                                size="s"
                                                iconLeft={AntIcon.asIconComponent(() => (
                                                        <CloseOutlined
                                                                className={cnMixFontSize('m')}
                                                        />
                                                ))}
                                                onClick={() => {
                                                        setIsOpen(false);
                                                }}
                                        />
                                </Layout>
                                
                                {isLoading && (
                                        <Layout style={{minHeight: 'calc(100vh - 328px)', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                                                <Loader size="m" />
                                        </Layout>
                                )}
                                {!isLoading && (activeTab.id === 0) && (
                                        <Layout direction="column" className={cnMixSpace({mT:'l'})}>
                                                <Layout direction="column" style={{maxHeight: '450px',minHeight: 'calc(100vh - 428px)', overflow: 'auto'}}>
                                                        {services && services.length > 0 && services.map((service) => (
                                                                <Layout direction="row" className={cnMixSpace({mT:'m', mR:'m', p: 's'})} style={{alignItems: 'center', border: '1px solid var(--color-gray-200)', borderRadius: '4px'}} >
                                                                        <Text className={cnMixSpace({mR:'m'})} view="secondary" weight="semibold" size="s">{(services.indexOf(service) + 1)}</Text>
                                                                        <TextField
                                                                                value={service.serviceName}
                                                                                onChange={(value) => {
                                                                                        setServices(prev => (prev.map((item) => services.indexOf(service) === services.indexOf(item) ? 
                                                                                        {...item, serviceName: value} : item)))
                                                                                }}
                                                                                size="s"
                                                                                placeholder="Укажите наименование услуги"
                                                                                className={cnMixSpace({mR:'m'})}
                                                                        />
                                                                        <TextField
                                                                                value={service.defaultPrice?.toString()}
                                                                                onChange={(value) => {
                                                                                        setServices(prev => (prev.map((item) => services.indexOf(service) === services.indexOf(item) ? 
                                                                                        {...item, defaultPrice: Number(value)} : item)))
                                                                                }}
                                                                                size="s"
                                                                                type="number"
                                                                                incrementButtons={false}
                                                                                rightSide={()=> (
                                                                                        <Text size="s" view="secondary">₽</Text>
                                                                                )}
                                                                                placeholder="Стоимость"
                                                                                className={cnMixSpace({mR:'m'})}
                                                                                style={{minWidth: '100px', maxWidth: '150px'}}
                                                                        />
                                                                        <Text size="s" view="secondary" className={cnMixSpace({mR:'2xs'})} style={{minWidth: '40px'}}>за час</Text>
                                                                        <Checkbox 
                                                                                size='m' 
                                                                                checked={service.isHourly ?? false} 
                                                                                onChange={() => {
                                                                                        setServices(prev => (prev.map((item) => services.indexOf(service) === services.indexOf(item) ? 
                                                                                        {...item, isHourly: !item.isHourly} : item)))
                                                                                }}
                                                                                className={cnMixSpace({mR:'m'})}
                                                                        />
                                                                        <Button
                                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                                        <DeleteOutlined
                                                                                                className={cnMixFontSize('l')}
                                                                                        />
                                                                                ))}
                                                                                onClick={() => {
                                                                                        setServices(prev => (prev.filter((item)=> (services.indexOf(service) !== services.indexOf(item)))))
                                                                                }} 
                                                                                view="clear" 
                                                                        />

                                                                </Layout>
                                                        ))}
                                                        
                                                </Layout> 
                                                <Layout direction="row" style={{justifyContent: 'center'}} className={cnMixSpace({mT:'m'})}>
                                                        <Button 
                                                                label={'Добавить услугу'}
                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                        <PlusOutlined
                                                                                className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                        />
                                                                ))}
                                                                view="secondary"
                                                                onClick={()=>{
                                                                        setServices(prev=> ([...prev, serviceDef]))
                                                                }}
                                                                size="s"
                                                        />
                                                </Layout> 
                                        </Layout>
                                )}

                                {!isLoading && (activeTab.id === 1) && (
                                        <Layout direction="column" className={cnMixSpace({mT:'l'})}>
                                                <Layout direction="column" style={{maxHeight: '450px',minHeight: 'calc(100vh - 428px)', overflow: 'auto'}}>
                                                        {furnitures && furnitures.length > 0 && furnitures.map((furniture) => (
                                                                <Layout direction="row" className={cnMixSpace({mT:'m', mR:'m', p: 's'})} style={{alignItems: 'center', border: '1px solid var(--color-gray-200)', borderRadius: '4px'}} >
                                                                        <Text className={cnMixSpace({mR:'m'})} view="secondary" weight="semibold" size="s">{(furnitures.indexOf(furniture) + 1)}</Text>
                                                                        <TextField
                                                                                value={furniture.furnitureName}
                                                                                onChange={(value) => {
                                                                                        setFurnitures(prev => (prev.map((item) => furnitures.indexOf(furniture) === furnitures.indexOf(item) ? 
                                                                                        {...item, furnitureName: value} : item)))
                                                                                }}
                                                                                size="s"
                                                                                placeholder="Укажите мебель"
                                                                                className={cnMixSpace({mR:'m'})}
                                                                        />

                                                                        <Button
                                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                                        <DeleteOutlined
                                                                                                className={cnMixFontSize('l')}
                                                                                        />
                                                                                ))}
                                                                                onClick={() => {
                                                                                        setFurnitures(prev => (prev.filter((item)=> (furnitures.indexOf(furniture) !== furnitures.indexOf(item)))))
                                                                                }} 
                                                                                view="clear" 
                                                                        />

                                                                </Layout>
                                                        ))}
                                                        
                                                </Layout> 
                                                <Layout direction="row" style={{justifyContent: 'center'}} className={cnMixSpace({mT:'m'})}>
                                                        <Button 
                                                                label={'Добавить мебель'}
                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                        <PlusOutlined
                                                                                className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                        />
                                                                ))}
                                                                view="secondary"
                                                                onClick={()=>{
                                                                        setFurnitures(prev=> ([...prev, furnitureDef]))
                                                                }}
                                                                size="s"
                                                        />
                                                </Layout> 
                                        </Layout>
                                )}
                                {!isLoading && (activeTab.id === 2) && (
                                        <Layout direction="column" className={cnMixSpace({mT:'l'})}>
                                                <Layout direction="column" style={{maxHeight: '450px',minHeight: 'calc(100vh - 428px)', overflow: 'auto'}}>
                                                        {equipments && equipments.length > 0 && equipments.map((equipment) => (
                                                                <Layout direction="row" className={cnMixSpace({mT:'m', mR:'m', p: 's'})} style={{alignItems: 'center', border: '1px solid var(--color-gray-200)', borderRadius: '4px'}} >
                                                                        <Text className={cnMixSpace({mR:'m'})} view="secondary" weight="semibold" size="s">{(equipments.indexOf(equipment) + 1)}</Text>
                                                                        <TextField
                                                                                value={equipment.equipmentName}
                                                                                onChange={(value) => {
                                                                                        setEquipments(prev => (prev.map((item) => equipments.indexOf(equipment) === equipments.indexOf(item) ? 
                                                                                        {...item, equipmentName: value} : item)))
                                                                                }}
                                                                                size="s"
                                                                                placeholder="Укажите оборудование"
                                                                                className={cnMixSpace({mR:'m'})}
                                                                        />

                                                                        <Button
                                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                                        <DeleteOutlined
                                                                                                className={cnMixFontSize('l')}
                                                                                        />
                                                                                ))}
                                                                                onClick={() => {
                                                                                        setEquipments(prev => (prev.filter((item)=> (equipments.indexOf(equipment) !== equipments.indexOf(item)))))
                                                                                }} 
                                                                                view="clear" 
                                                                        />

                                                                </Layout>
                                                        ))}
                                                        
                                                </Layout> 
                                                <Layout direction="row" style={{justifyContent: 'center'}} className={cnMixSpace({mT:'m'})}>
                                                        <Button 
                                                                label={'Добавить оборудование'}
                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                        <PlusOutlined
                                                                                className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                        />
                                                                ))}
                                                                view="secondary"
                                                                onClick={()=>{
                                                                        setEquipments(prev=> ([...prev, equipmentDef]))
                                                                }}
                                                                size="s"
                                                        />
                                                </Layout> 
                                        </Layout>
                                )}

                                <Layout direction="row" style={{justifyContent: 'right'}} className={cnMixSpace({ mT: 'xl' })}>
                                                <Button 
                                                        label={'Закрыть'}
                                                        view="secondary"
                                                        onClick={()=>{
                                                                setIsOpen(false);
                                                        }}
                                                        size="s"
                                                        className={cnMixSpace({mR:'m'})}
                                                />
                                                <Button 
                                                        label={'Сохранить изменения'}
                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                <SaveOutlined
                                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                />
                                                        ))}
                                                        view="primary"
                                                        onClick={()=>{
                                                                setIsLoading(true);
                                                                if (activeTab.id === 0) {
                                                                        saveServiceData();
                                                                }
                                                                if (activeTab.id === 1) {
                                                                        saveFurnitureData();
                                                                }
                                                                if (activeTab.id === 2) {
                                                                        saveEquipmentData();
                                                                }
                                                        }}
                                                        size="s"
                                                        loading={isLoading}
                                                />
                                </Layout>
                                
                        </Layout>
                        
                </Modal>
        )
}
export default ParametersManagmentModal;