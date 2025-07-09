import { Button } from '@consta/uikit/Button';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Text } from '@consta/uikit/Text';
import { useEffect, useRef, useState } from 'react';
import { DateTime } from '@consta/uikit/DateTime';
import { getLofts } from '../../services/LoftBookingService';
import { Loft } from '../../types/lofts-managment-types';
import { ComboboxMultiple } from '../../global/ComboboxMultiple';
import { Tooltip } from '../../global/Tooltip';
import { Direction, Position } from '@consta/uikit/Popover';
import classes from '../../App.module.css'
import { convertHourMinuts } from '../../services/utils';

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
                    label: 'Расписание дня',
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

    const [day, setDay] = useState<Date>(new Date())

    const [loftsDef, setLoftsDef] = useState<Loft[]>([])
    const [lofts, setLofts] = useState<Loft[]>([])

    // Инициализация данных
    useEffect(() => {
        const getLoftsData = async () => {
            await getLofts((resp) => {
                setLofts(resp);
                setLoftsDef(resp);
            })
        };
        void getLoftsData();

    }, []);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const currentTimeRef = useRef<HTMLDivElement>(null);

    const [tooltipPosition, setTooltipPosition] = useState<Position>(undefined);
    const [tooltipText, setTooltipText] = useState<string | undefined>(undefined);
    const [arrowDir, setArrowDir] = useState<Direction>('upCenter');

    useEffect(() => {
    if (currentTimeRef.current && scrollContainerRef.current) {
        // Прокручиваем к текущему времени минус 1 час
        const scrollPosition = currentTimeRef.current.offsetTop - scrollContainerRef.current.offsetHeight;
        scrollContainerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
        });
    }
    }, [tasks, lofts]);

    

    return (
        <Layout direction='column'>
            <Layout direction='row' className={cnMixSpace({mV:'m'})} style={{ alignItems: 'center' }}>
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
            {activeTab.id  === 0 && (
                <Layout direction='column'  className={cnMixSpace({p:'l'})}>
                    <Layout direction="row" style={{ gap: '16px' }}>

                        <Layout direction='column' className={cnMixSpace({mR:'3xl'})} flex={0}>
                                <Text size='s' className={cnMixSpace({ mB: 'xs'})} style={{width: 'fit-content', textWrap: 'nowrap'}}>Помещения:</Text>
                                <ComboboxMultiple
                                    value={lofts}
                                    onChange={(value) => {
                                        if (value) {
                                            setLofts(value);
                                        } else {
                                            setLofts([])
                                        }
                                    } }
                                    items={loftsDef}
                                    getItemLabel={item => item.name ?? ''}
                                    getItemKey={item => item.loftId ?? 0}
                                    formatMultipleValue={count => `Выбрано - ${count}`}
                                    style={{maxWidth: '250px', minWidth: '200px'}}
                                    className={cnMixSpace({ mB: 'xl'})}
                                />
                                <DateTime
                                    type='date'
                                    value={day}
                                    onChange={(value) => {setDay(value)}}
                                />
                        </Layout>

                        {/* Lofts schedule */}
                        <Layout direction="column" flex={1} style={{ overflowX: 'auto', maxWidth: 'calc(100vw - 500px)' }}>
                            {/* Loft names header */}
                            <Layout direction="row" style={{ marginBottom: '4px' }}>
                            {lofts?.map((loft) => (
                                <div 
                                key={loft.loftId}
                                style={{
                                    minWidth: '120px',
                                    maxWidth: '120px',
                                    height: '20px',
                                    marginRight: '8px',
                                }}
                                >
                                <Text 
                                    style={{ width: '100%' }} 
                                    align="center" 
                                    size="s" 
                                    truncate
                                    weight="medium"
                                >
                                    {loft.name}
                                </Text>
                                </div>
                            ))}
                            </Layout>

                            {/* Time slots grid */}
                            <div 
                                ref={scrollContainerRef}
                                style={{ 
                                    maxHeight: '50vh', 
                                    overflowY: 'auto', 
                                    overflowX: 'hidden', // Убираем горизонтальный скролл
                                    border: '1px solid #eee', 
                                    borderRadius: '4px',
                                    width: 'fit-content' // Чтобы контейнер подстраивался под ширину содержимого
                                }}
                                >
                                {timeSlots.map((time) => {
                                    const timeInMinutes = getTimeInMinutes(time);
                                    const currentTimeInMinutes = getMinutesFromDate(today);
                                    const isCurrentTime = (timeInMinutes <= currentTimeInMinutes) && ( timeInMinutes + 61 > currentTimeInMinutes);
                                    
                                    return (
                                    <Layout 
                                        key={time}
                                        direction="row" 
                                        style={{
                                        height: '55px',
                                        opacity: timeInMinutes < currentTimeInMinutes ? 0.4 : 1,
                                        backgroundColor: timeInMinutes % 60 === 0 ? '#f9f9f9' : 'transparent',
                                        scrollMarginTop: isCurrentTime ? '50vh' : undefined, // Для автоматической прокрутки
                                        }}
                                        ref={isCurrentTime ? currentTimeRef : null}
                                    >
                                        {lofts?.map((loft) => {
                                        const currentTask = tasks?.find(task => 
                                            getMinutesFromDate(task.startDate) <= timeInMinutes && 
                                            getMinutesFromDate(task.endDate) >= timeInMinutes && 
                                            loft.loftId === task.loftId
                                        );
                                        
                                        const isStartTime = currentTask && getMinutesFromDate(currentTask.startDate) === timeInMinutes;
                                        
                                        return (
                                            <Layout
                                                key={`${time}-${loft.loftId}`}
                                                style={{
                                                    minWidth: '120px',
                                                    maxWidth: '120px',
                                                    height: '100%',
                                                    borderTop: '1px dashed #eee',
                                                    borderLeft: '1px solid #eee',
                                                    borderRight: '1px solid #eee',
                                                    marginRight: '8px',
                                                    backgroundColor: currentTask ? '#d4e6ff' : 'transparent',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                }}
                                                direction='column'
                                                onMouseMove={(event) => {
                                                        const target = event.target as HTMLElement;
                                                        const rect = target.getBoundingClientRect();
                                                        setTooltipPosition({
                                                            x: rect.right - (target.clientWidth * 0.5),
                                                            y: rect.top,
                                                        });
                                                        setTooltipText(currentTask?.loftName ? `${currentTask?.loftName} /
                                                            ${currentTask?.clientName}  /
                                                             ${convertHourMinuts(currentTask?.startDate ?? '')}
                                                            - ${convertHourMinuts(currentTask?.endDate ?? '')}` 
                                                            : 
                                                            'Свободный лот'
                                                        )
                                                        setArrowDir('upCenter')
                                                    }}
                                                onMouseLeave={() => {
                                                    setTooltipPosition(undefined);
                                                    setTooltipText(undefined)
                                                }}
                                            >
                                            <Text size='xs' view='secondary' className={cnMixSpace({mL:'xs', mT: 'xs'})}>
                                                {time} {/* Показываем время только для начала бронирования */}
                                            </Text>
                                            {isStartTime && (
                                                <Text 
                                                size="xs" 
                                                weight='semibold'
                                                style={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                                className={cnMixSpace({mL:'xs'})}
                                                >
                                                {currentTask.clientName}
                                                </Text>
                                            )}
                                            </Layout>
                                        );
                                        })}
                                        
                                    </Layout>
                                    );
                                })}
                                
                                </div>
                                <Tooltip
                                        direction={arrowDir ?? 'upCenter'}
                                        spareDirection={arrowDir ?? 'upCenter'}
                                        position={tooltipPosition}
                                        className={classes.tooltip}
                                        classNameArrow={classes.tooltipArrow}
                                >
                                        <Text
                                                size="xs"
                                                style={{zoom: 'var(--zoom)', maxWidth: '238px'}}
                                        >
                                                {tooltipText}
                                        </Text>
                                </Tooltip> 
                            </Layout>
                        
                    </Layout>
                   
                </Layout>
            )}

            {/* {activeTab.id  === 1 && (
                    <Card style={{border: '4px solid var(--color-blue-ui)', borderRadius: '8px'}} className={cnMixSpace({p:'l'})}>
                <Layout direction='column'>
                    <Layout direction='row'>
                        <div style={{minWidth: '100px', }}/>
                        {uniqueLoftIds && uniqueLoftIds?.length > 0 && uniqueLoftIds.map((loftId) => (
                            <Layout style={{
                                    minWidth: '100px',
                                    marginRight: '16px',
                                    }}>
                                <Text style={{width: '100%'}} align='center'>{tasks.find(elem => (elem.loftId === loftId))?.loftName}</Text>
                            </Layout>
                        ))}
                    </Layout>
                    <Layout direction='column' style={{maxHeight: '50vh', width: '100%', overflow:'auto'}}>
                        {timeSlots.map((time)=> (
                            <Layout style={{height: '55px', borderTop: '1px dashed', width: '100%' }} direction='row'>
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
                                        >
                                            <Text style={{width: '100%'}} align='center' className={cnMixSpace({mT:'xs'})}>
                                                {tasks?.find((elem)=> (getMinutesFromDate(elem.startDate) === getTimeInMinutes(time) && (loftId === elem.loftId))) ? tasks?.find((elem)=> (getMinutesFromDate(elem.startDate) === getTimeInMinutes(time) && (loftId === elem.loftId)))?.clientName : ''}
                                            </Text>
                                        </Layout>
                                ))}

                                </Layout>
                            </Layout>
                        ))}
                    </Layout>
                </Layout>
                </Card>
            )}
            {activeTab.id  === 2 && (
                    <Card style={{border: '4px solid var(--color-blue-ui)', borderRadius: '8px'}} className={cnMixSpace({p:'l'})}>
                <Layout direction='column'>
                    <Layout direction='row'>
                        <div style={{minWidth: '100px', }}/>
                        {uniqueLoftIds && uniqueLoftIds?.length > 0 && uniqueLoftIds.map((loftId) => (
                            <Layout style={{
                                    minWidth: '100px',
                                    marginRight: '16px',
                                    }}>
                                <Text style={{width: '100%'}} align='center'>{tasks.find(elem => (elem.loftId === loftId))?.loftName}</Text>
                            </Layout>
                        ))}
                    </Layout>
                    <Layout direction='column' style={{maxHeight: '50vh', width: '100%', overflow:'auto'}}>
                        {timeSlots.map((time)=> (
                            <Layout style={{height: '55px', borderTop: '1px dashed', width: '100%' }} direction='row'>
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
                                        >
                                            <Text style={{width: '100%'}} align='center' className={cnMixSpace({mT:'xs'})}>
                                                {tasks?.find((elem)=> (getMinutesFromDate(elem.startDate) === getTimeInMinutes(time) && (loftId === elem.loftId))) ? tasks?.find((elem)=> (getMinutesFromDate(elem.startDate) === getTimeInMinutes(time) && (loftId === elem.loftId)))?.clientName : ''}
                                            </Text>
                                        </Layout>
                                ))}

                                </Layout>
                            </Layout>
                        ))}
                    </Layout>
                </Layout>
                </Card>
            )} */}
            
            <Layout direction='row' style={{ justifyContent: 'space-between' }}>
                
            </Layout>
        </Layout>
    );
};