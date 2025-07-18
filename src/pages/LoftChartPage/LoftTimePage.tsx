import { Layout } from '@consta/uikit/Layout';
import { Text } from '@consta/uikit/Text'
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Tab } from '#/types/loft-chart-types';

const tabs: Tab[] = [
            {
                    id: 0,
                    label: '10 : 00',
            },
            
            {
                    id: 2,
                    label: '11 : 00',
            },
            {
                    id: 3,
                    label: '12 : 00',
            },
             {
                    id: 4,
                    label: '13 : 00',
            },
             {
                    id: 5,
                    label: '14 : 00',
            },
             {
                    id: 6,
                    label: '15 : 00',
            },
             {
                    id: 7,
                    label: '16 : 00',
            },
             {
                    id: 8,
                    label: '17 : 00',
            },

             {
                    id: 9,
                    label: '18 : 00',
            },
             {
                    id: 10,
                    label: '19 : 00',
            },
    ]
const LoftTimePage = () => {


        return (
        <Layout  direction="column">
            <Layout 
                                direction="row" 
                                style={{justifyContent:'space-between', alignItems:'center'}}
                                className={cnMixSpace({pL:'2xl', pR:'4xl', pV:'m'})}
                        >
                                
                                <Text
                        size="xl"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        Loft 29 Booking
                    </Text>
            </Layout>
                                        <Layout 
                                direction="row" 
                                style={{justifyContent:'space-between', alignItems:'center'}}
                                className={cnMixSpace({pL:'2xl', pR:'4xl', pV:'m'})}
                        >
                                <Text
                        size="xl"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        Понедельник Вторник Среда Четверг Пятница Суббота Воскресенье
                    </Text>
            </Layout>
                      <Layout 
                                direction="column" 
                                style={{justifyContent:'space-between', alignItems:'center'}}
                                className={cnMixSpace({pL:'2xl', pR:'4xl', pV:'m'})}
                        >
                        {tabs.map((tab)=>(
                                       <Text
                        size="xl"
                        style={{ width: '100%' }}
                        weight="semibold"
                        view="primary"
                    >
                        {tab.label}
                    </Text>     
                                        ))}        
            </Layout>  
             </Layout>

            
                );
            }  ;
export default LoftTimePage;
