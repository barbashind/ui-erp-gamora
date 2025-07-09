import { useEffect, useState } from "react";

import { Layout } from "@consta/uikit/Layout"
import { Text } from "@consta/uikit/Text";
import { cnMixSpace } from "@consta/uikit/MixSpace";

import { Service, ServiceLoft } from "../../types/loft-details-types";
import { TextField } from "@consta/uikit/TextField";

import { getServices } from "../../services/LoftListSettingsManagmentService";
import { Checkbox } from "@consta/uikit/Checkbox";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { UnorderedListOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import ParametersManagmentModal from "../LoftManagmentPage/ParametersManagmentModal";


const ServicesManagment = () => {

        const [services, setServices] = useState<Service[]>([])
        const [loftServices, setLoftServices] = useState<ServiceLoft[]>([])

        // Инициализация данных
        useEffect(() => {
                const getServicesData = async () => {
                        await getServices((resp) => {
                                setServices(resp)
                        })
                }
                void getServicesData();
                }, []);

        const [isSettingModalOpen, setIsSettingModalOpen] = useState<boolean>(false)

        return (
                        <Layout direction="column" style={{width: '100%'}} className={cnMixSpace({ p:'xl' })}>
                                <Layout direction="row">

                                
                                <Layout direction="column"> 
                                        {services && services.length > 0 && services.map((service) => (
                                                <Layout direction="row" className={cnMixSpace({p:'m', mT: 's'})} style={{border: '1px solid var(--color-gray-200)', borderRadius: '4px', alignItems: 'center'}}>
                                                        <Checkbox 
                                                                checked={!!loftServices.find((item) => (item.serviceCode === service.serviceCode))}
                                                                onChange={()=> {
                                                                        if (loftServices.find((item) => (item.serviceCode === service.serviceCode))) {
                                                                                setLoftServices(prev => (prev.filter(item => (item.serviceCode !== service.serviceCode))))
                                                                        }
                                                                }} 
                                                                className={cnMixSpace({mR:'xs'})}

                                                        />
                                                        <Text size="s" className={cnMixSpace({mR:'m'})} style={{minWidth: '200px', maxWidth: '200px'}}>{service.serviceName}</Text>
                                                        <TextField 
                                                                type="number"
                                                                value={loftServices?.find((item) => (item.serviceCode === service.serviceCode))?.price?.toString() ?? null}
                                                                onChange={(value) => {
                                                                        if (value) {
                                                                                setLoftServices(prev => (prev.map((item) => item.serviceCode === service.serviceCode ? {...item, price: Number(value)} : item)))
                                                                        } else {
                                                                                setLoftServices(prev => (prev.map((item) => item.serviceCode === service.serviceCode ? {...item, price: null} : item)))

                                                                        }
                                                                }}
                                                                placeholder="Цена"
                                                                rightSide={()=> (
                                                                        <Text>₽</Text>
                                                                )}
                                                                size="s"
                                                                style={{width: '150px'}}
                                                                incrementButtons={false}
                                                                className={cnMixSpace({mR:'m'})}
                                                        />
                                                        <Checkbox 
                                                                checked={service.isHourly ?? false}
                                                                onChange={()=> {
                                                                        if (loftServices.find((item) => (item.serviceCode === service.serviceCode))) {
                                                                                setLoftServices(prev => (prev.map(item => (item.serviceCode === service.serviceCode) ? {...item, isHourly: !service.isHourly} : item)))
                                                                        }
                                                                }} 
                                                                className={cnMixSpace({mR:'xs'})}

                                                        />
                                                        <Text size="s" className={cnMixSpace({mR:'m'})} style={{width: '100%'}}>за час</Text>
                                                </Layout>
                                        ))}
                                        <Layout direction="row" style={{justifyContent: 'end'}} className={cnMixSpace({mT:'m'})}>
                                        
                                        </Layout>
                                </Layout>
                                        <Layout direction="column">
                                                <Button
                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                <UnorderedListOutlined
                                                                        className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'xs'})}
                                                                />
                                                        ))}
                                                        view="secondary"
                                                        size="s"
                                                        label={'Списки параметров'}
                                                        className={cnMixSpace({mL:'xl', mT:'xl'})}
                                                        onClick={()=>{
                                                                setIsSettingModalOpen(true);
                                                        }}
                                                />
                                                <ParametersManagmentModal
                                                        isOpen={isSettingModalOpen}
                                                        setIsOpen={setIsSettingModalOpen}
                                                />
                                        </Layout>
                                </Layout>
                                
                        </Layout>
        )
}
export default ServicesManagment;