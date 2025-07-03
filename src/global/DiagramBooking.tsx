import { Button } from '@consta/uikit/Button';
import { Card } from '@consta/uikit/Card';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Text } from '@consta/uikit/Text';
import { useState } from 'react';

export interface Task {
    loftName: string;
    loftId: number;
    clientName: string;
    startDate: Date; 
    endDate: Date;
}

interface DiagramBookingProps {
    tasks: Task[];
    period: number;
}


export const DiagramBooking = ({ tasks, period } : DiagramBookingProps) => {

    interface Tab {
            id: number;
            label: string;
    }

    const tabs: Tab[] = [
            {
                    id: 0,
                    label: 'Сегодня',
            },
            {
                    id: 1,
                    label: 'Завтра',
            },
            {
                    id: 2,
                    label: 'Неделя',
            },
            {
                    id: 3,
                    label: 'Месяц',
            },
    ]

    const [activeTab, setActiveTab] = useState<Tab>(tabs[0])

    const uniqueLoftIds = [...new Set(tasks.map(task => task.loftId))];

    const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  function getMinutesFromDate(date: Date) {
    const newDate = new Date(date)
    const hours = newDate.getHours();
    const minutes = newDate.getMinutes();
    return hours * 60 + minutes;
}


    const generateTimeSlots = () => {
    const slots = [];
    const start = new Date(`1970-01-01T00:00:00`);
    const end = new Date(`1970-01-01T23:59:59`);
    
    // Увеличиваем время по длительности
    while (start < end) {
        const timeStart = start.toTimeString().slice(0, 5);
        start.setMinutes(start.getMinutes() + period);
        slots.push(timeStart);
    }
    
    return slots;
    }

    const timeSlots = generateTimeSlots();

    const today = new Date();


    return (
        <Layout direction='column'>
            <Layout direction='row' className={cnMixSpace({mV:'m'})}>
                {tabs.map((tab)=>(
                    <Button
                        className={cnMixSpace({mR:'m'})}
                        label={tab.label}
                        view={activeTab.id === tab.id ? 'primary' : 'secondary'}
                        onClick={()=> {setActiveTab(tab);}}
                        size='s'
                    />
                ))}
            </Layout>
            <Card style={{border: '4px solid var(--color-blue-ui)', borderRadius: '8px'}} className={cnMixSpace({p:'l'})}>
            <Layout direction='row'>
                <Layout direction='column' style={{maxHeight: '50vh', width: '100%', overflow:'auto'}}>
                    {timeSlots.map((time)=> (
                        <Layout style={{height: '55px', borderTop: '1px dashed', width: '100%', opacity: getTimeInMinutes(time) < getMinutesFromDate(today) ? 0.5 : 1 }} direction='row'>
                            <Text size='s' style={{minWidth: '100px', minHeight: '50px' }} >{time}</Text>
                            <Layout 
                                style={{
                                    minWidth: '50px', 
                                    minHeight: '50px',
                                }}
                                direction='row'
                            >
                               {uniqueLoftIds && uniqueLoftIds?.length > 0 && uniqueLoftIds.map((loftId) => (
                                    <Layout 
                                        style={{
                                            minHeight: '20px',
                                            minWidth: '100px',
                                            borderLeft: '1px solid',
                                            borderRight: '1px solid',
                                            marginRight: '16px',
                                            backgroundColor:
                                                tasks?.find((elem)=> (getMinutesFromDate(elem.startDate) <= getTimeInMinutes(time) && getMinutesFromDate(elem.endDate) >= getTimeInMinutes(time) && (loftId === elem.loftId) )) ? 'var(--color-royal-blue-200)' : 'var(--color-gray-200)',
                                            }}
                                    />
                               ))}

                            </Layout>
                        </Layout>
                    ))}

                </Layout>
                
                
            </Layout>
            </Card>
            <Layout direction='row' style={{ justifyContent: 'space-between' }}>
                
            </Layout>
        </Layout>
    );
};