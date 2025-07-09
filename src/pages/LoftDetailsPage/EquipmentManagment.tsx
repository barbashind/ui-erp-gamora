import { useEffect, useState } from "react";

import { Layout } from "@consta/uikit/Layout"
import { Text } from "@consta/uikit/Text";
import { cnMixSpace } from "@consta/uikit/MixSpace";

import { Equipment, EquipmentLoft } from "../../types/loft-details-types";
import { TextField } from "@consta/uikit/TextField";

import { getEquipment, getFurniture } from "../../services/LoftListSettingsManagmentService";
import { Checkbox } from "@consta/uikit/Checkbox";
import { Furniture, FurnitureLoft } from "../../types/loft-details-types";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { UnorderedListOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import ParametersManagmentModal from "../LoftManagmentPage/ParametersManagmentModal";

const EquipmentManagment = () => {

        const [equipments, setEquipments] = useState<Equipment[]>([])
        const [loftEquipments, setLoftEquipments] = useState<EquipmentLoft[]>([])
        
        const [furnitures, setFurnitures] = useState<Furniture[]>([])
        const [loftFurnitures, setLoftFurnitures] = useState<FurnitureLoft[]>([])

        // Инициализация данных

        useEffect(() => {
                const getEquipmentsData = async () => {
                        await getEquipment((resp) => {
                                setEquipments(resp)
                        })
                }
                void getEquipmentsData();
                const getFurnitureData = async () => {
                                        await getFurniture((resp) => {
                                                setFurnitures(resp)
                                        })
                                }
                                void getFurnitureData();
        }, []);

        const [isSettingModalOpen, setIsSettingModalOpen] = useState<boolean>(false)

        return (
                <Layout direction="row" style={{flexWrap:'wrap', width: '100%'}}>
                        <Layout direction="column"  className={cnMixSpace({ p:'xl' })} style={{width: 'fit-content'}}>
                                
                                <Layout direction="column"> 
                                        <Layout direction="row">
                                                <Text>Выберите оборудование из списка ниже</Text>
                                        </Layout>
                                        {equipments && equipments.length > 0 && equipments.map((equipment) => (
                                                <Layout direction="row" className={cnMixSpace({p:'m', mT: 's'})} style={{border: '1px solid var(--color-gray-200)', borderRadius: '4px', alignItems: 'center'}}>
                                                        <Checkbox 
                                                                checked={!!loftEquipments.find((item) => (item.equipmentCode === equipment.equipmentCode))}
                                                                onChange={()=> {
                                                                        if (loftEquipments.find((item) => (item.equipmentCode === equipment.equipmentCode))) {
                                                                                setLoftEquipments(prev => (prev.filter(item => (item.equipmentCode !== equipment.equipmentCode))))
                                                                        } else {
                                                                                setLoftEquipments(prev => ([...prev, {equipmentName: equipment.equipmentName, equipmentCode: equipment.equipmentCode, count: null, loftId: 0}]))
                                                                        }
                                                                }} 
                                                                className={cnMixSpace({mR:'2xs'})}

                                                        />
                                                        <Text size="s" className={cnMixSpace({mR:'m'})} style={{width: '100%'}}>{equipment.equipmentName}</Text>
                                                        <TextField 
                                                                type="number"
                                                                value={loftEquipments?.find((item) => (item.equipmentCode === equipment.equipmentCode))?.count?.toString() ?? null}
                                                                onChange={(value) => {
                                                                        if (value) {
                                                                                setLoftEquipments(prev => (prev.map((item) => item.equipmentCode === equipment.equipmentCode ? {...item, count: Number(value)} : item)))
                                                                        } else {
                                                                                setLoftEquipments(prev => (prev.map((item) => item.equipmentCode === equipment.equipmentCode ? {...item, count: null} : item)))

                                                                        }
                                                                }}
                                                                placeholder="0"
                                                                rightSide={()=> (
                                                                        <Text view="secondary" size="s">ШТ</Text>
                                                                )}
                                                                size="s"
                                                                style={{width: '150px'}}
                                                                incrementButtons={false}
                                                                disabled={!loftEquipments.find((item) => (item.equipmentCode === equipment.equipmentCode))}
                                                        />
                                                </Layout>
                                        ))}
                                </Layout>
                        </Layout>
                        <Layout direction="column" flex={1} className={cnMixSpace({ p:'xl' })}>
                                                        <Layout direction="column" style={{width: 'fit-content'}}> 
                                                                <Layout direction="row">
                                                                        <Text>Выберите мебель из списка ниже</Text>
                                                                </Layout>
                                                                {furnitures && furnitures.length > 0 && furnitures.map((furniture) => (
                                                                        <Layout direction="row" className={cnMixSpace({p:'m', mT: 's'})} style={{border: '1px solid var(--color-gray-200)', borderRadius: '4px', alignItems: 'center'}}>
                                                                                <Checkbox 
                                                                                        checked={!!loftFurnitures.find((item) => (item.furnitureCode === furniture.furnitureCode))}
                                                                                        onChange={()=> {
                                                                                                if (loftFurnitures.find((item) => (item.furnitureCode === furniture.furnitureCode))) {
                                                                                                        setLoftFurnitures(prev => (prev.filter(item => (item.furnitureCode !== furniture.furnitureCode))))
                                                                                                } else {
                                                                                                        setLoftFurnitures(prev => ([...prev, {furnitureName: furniture.furnitureName, furnitureCode: furniture.furnitureCode, count: null, loftId: 0}]))
                                                                                                }
                                                                                        }} 
                                                                                        className={cnMixSpace({mR:'2xs'})}
                        
                                                                                />
                                                                                <Text size="s" className={cnMixSpace({mR:'m'})} style={{width: '100%'}}>{furniture.furnitureName}</Text>
                                                                                <TextField 
                                                                                        type="number"
                                                                                        value={loftFurnitures?.find((item) => (item.furnitureCode === furniture.furnitureCode))?.count?.toString() ?? null}
                                                                                        onChange={(value) => {
                                                                                                if (value) {
                                                                                                        setLoftFurnitures(prev => (prev.map((item) => item.furnitureCode === furniture.furnitureCode ? {...item, count: Number(value)} : item)))
                                                                                                } else {
                                                                                                        setLoftFurnitures(prev => (prev.map((item) => item.furnitureCode === furniture.furnitureCode ? {...item, count: null} : item)))
                        
                                                                                                }
                                                                                        }}
                                                                                        placeholder="0"
                                                                                        rightSide={()=> (
                                                                                                <Text view="secondary" size="s">ШТ</Text>
                                                                                        )}
                                                                                        size="s"
                                                                                        style={{width: '150px'}}
                                                                                        incrementButtons={false}
                                                                                        disabled={!loftFurnitures.find((item) => (item.furnitureCode === furniture.furnitureCode))}
                                                                                />
                                                                        </Layout>
                                                                ))}
                                                        </Layout>
                                                </Layout>
                                                <Button
                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                <UnorderedListOutlined
                                                                        className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                                />
                                                        ))}
                                                        view="secondary"
                                                        size="s"
                                                        label={'Списки параметров'}
                                                        className={cnMixSpace({mR:'m', mT:'xl'})}
                                                        onClick={()=>{
                                                                setIsSettingModalOpen(true);
                                                        }}
                                                />
                                                <ParametersManagmentModal
                                                        isOpen={isSettingModalOpen}
                                                        setIsOpen={setIsSettingModalOpen}
                                                />
                                        </Layout>
                        
        )
}
export default EquipmentManagment;