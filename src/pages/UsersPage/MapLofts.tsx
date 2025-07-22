import { Layout } from '@consta/uikit/Layout';
import { Text } from '@consta/uikit/Text';
import { Button } from '@consta/uikit/Button';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import {HomeOutlined} from "@ant-design/icons";
import { useEffect, useState } from 'react';
import { AntIcon } from '../../utils/AntIcon';
import { cnMixFontSize } from '../../utils/MixFontSize';
import { Card } from '@consta/uikit/Card';
import { YMaps,Map } from '@pbe/react-yandex-maps';
import { Placemark } from '@pbe/react-yandex-maps/typings/geo-objects/Placemark';
import { concatUrl } from "../../utils/urlUtils";
import { routeTarget } from "../../routers/routes";
import { useNavigate } from "react-router-dom";

 
const MapLofts = () => {



const navigate = useNavigate()
        
    return (
        
            
                
            <Layout direction='column' className={cnMixSpace({ pL: '2xl', pR: 'm', pV: 'm' })}>
                <Layout direction="row"  style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    
                    <Button
                                        view="clear"
                                        label={'Вернуться на главную'}
                                        size="s"
                                        onClick={()=>{
                                                navigate(concatUrl([routeTarget.main]));
                                        }}
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                <HomeOutlined
                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs', mB:'2xs'})}
                                                />
                                        ))}
                    />
                </Layout>
                                
                                
                                
                                
                                 <Layout direction="row" style={{ alignItems: 'end' }}>
                                    <YMaps><Map defaultState={{ center: [51.66749022, 39.1956443], zoom: 9 }}
                                    
                                      />
                                      
                                    </YMaps>
                                </Layout>   
                
            </Layout>
        
    );
};
export default MapLofts;