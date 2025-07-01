/* eslint-disable no-unsafe-optional-chaining */
import React, { useEffect, useState } from 'react';
import { Layout } from '@consta/uikit/Layout';
import { Text } from '@consta/uikit/Text';
import { TextField } from '@consta/uikit/TextField';
import { Button } from '@consta/uikit/Button';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Slider } from '@consta/uikit/Slider';
import { Tag } from '@consta/uikit/Tag';
import { Checkbox } from '@consta/uikit/Checkbox';
import { AntIcon } from '../../utils/AntIcon';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { cnMixFontSize } from '../../utils/MixFontSize';
import { TimePrice } from '../../types/loft-details-types';
import { getTimePrice, updateLoftStatus, updateTimePrice } from '../../services/LoftManagmentService';
// import GanttChart from '../../global/GanttChart';
import GanttChartMain from '../../global/GanttChartMain';


const TimeShedule: React.FC = () => {

        const [period, setPeriod] = useState<number>(60)
        const [price, setPrice] = useState<number | null>(null)

        interface DaysOfWeek {
                weekDay: string;
                time: [number, number]
        }

        const [isAllDay, setIsAllDay] = useState<boolean>(false)
        const [isRabDay, setIsRabDay] = useState<boolean>(false)
        const [isVyhDay, setIsVyhDay] = useState<boolean>(false)

        const [periods, setPeriods] = useState<TimePrice[]>([])
        const [countOfPeriods, setCountOfPeriods] = useState<number>(24)

        const [isEdit, setIsEdit] = useState<boolean>(false)
        const [isLoading, setIsLoading] = useState<boolean>(false)

        const [daysOfWeek, setDaysOfWeek] = useState<DaysOfWeek[]> ([
                {
                        weekDay: 'ПН',
                        time: [0,1]
                }, 
                {
                        weekDay: 'ВТ',
                        time: [0,0]
                }, 
                {
                        weekDay: 'СР',
                        time: [0,0]
                }, 
                {
                        weekDay: 'ЧТ',
                        time: [0,0]
                }, 
                {
                        weekDay: 'ПТ',
                        time: [0,0]
                }, 
                {
                        weekDay: 'СБ',
                        time: [0,0]
                }, 
                {
                        weekDay: 'ВС',
                        time: [0,0]
                }, 
        ]);

        //инициализация данных 
        useEffect(() => {
                const parth = location.pathname.split('/');
                const loftId = parth[location.pathname.split('/').length - 2];
                setIsLoading(true);
                setIsEdit(false);
                const getTimePriceData = async () => {
                        await getTimePrice(Number(loftId), (resp) => {
                                if (resp && resp.length > 0) {
                                        setPeriods(resp);
                                        setIsLoading(false);
                                } else {
                                        setIsLoading(false);
                                        setIsEdit(true);
                                }
                                
                        })
                }
                void getTimePriceData();
        }, [])

        const updateTimePriceData = async () => {
                const parth = location.pathname.split('/');
                const loftId = parth[location.pathname.split('/').length - 2];
                setIsLoading(true);
                setIsEdit(false);
                await updateTimePrice(Number(loftId), periods).then(async (resp)=>{
                        setPeriods(resp);
                        setIsLoading(false);
                        await updateLoftStatus(Number(loftId), {
                                timepriceData: true,
                        })
                })
        }

        useEffect(() => {

                setCountOfPeriods(1439 / period);
                

        }, [countOfPeriods, period])


        
        const formatTimeRange = (timeRange: [number, number], period: number): string => {
        const [start, end] = timeRange;
        
        const startMinutes = start * period; // Преобразование в минуты
        const endMinutes = end * period;

        const formatTime = (minutes: number) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        };

        return `${formatTime(startMinutes)} - ${formatTime(endMinutes)}`;
        };

        const formatTime = (time: number, period: number): string => {
       
        const minutes = time * period; // Преобразование в минуты

        const formatTime = (minutes: number) => {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
        };

        return `${formatTime(minutes)}`;
        };
        
        

    return (
        <Layout direction='column' style={{ width: '100%'}} >
                {isEdit && !isLoading && (
                        <Layout direction='column' style={{ width: '100%'}}>
                                <Layout direction='row' style={{width: 'fit-content', alignItems: 'flex-end'}} className={cnMixSpace({mT:'m'})}>
                                        <Layout direction='column' className={cnMixSpace({mR:'m'})} style={{ width: '100%'}}>
                                                <Text size='s' className={cnMixSpace({mB:'2xs'})} >Период аренды:</Text>
                                                <TextField
                                                        value={period.toString()}
                                                        onChange={(value) => {
                                                                if (value) {
                                                                        setPeriod(Number(value))
                                                                } else {
                                                                        setPeriod(60)
                                                                }
                                                        }}
                                                        size='s'
                                                        rightSide={()=>(<Text size='s' view='secondary' >мин</Text>)}
                                                />
                                        </Layout>
                                        <Layout direction='column' className={cnMixSpace({mR:'m'})}>
                                                <Text size='s' className={cnMixSpace({mB:'2xs'})}>Цена аренды:</Text>
                                                <TextField
                                                        size='s'
                                                        placeholder='0'
                                                        value={price?.toString()}
                                                        onChange={(value)=> {
                                                                if (value) {
                                                                        setPrice(Number(value));
                                                                } else {
                                                                        setPrice(null);
                                                                }
                                                        }}
                                                        onKeyPress={(e) => {
                                                                if (e.key === 'Enter') {
                                                                        setPeriods(prev => ([...prev, ...daysOfWeek?.filter((elem => (elem.time[0] !== elem.time[1])))?.map((el) =>  ({weekDay: el.weekDay, timeStart: formatTime(el.time[0], period), timeEnd: formatTime(el.time[1], period), price: price}))]))
                                                                }
                                                        }}
                                                />
                                        </Layout>
                                        <Button
                                                label={"Записать"}
                                                size='s'
                                                onClick={()=> {
                                                        setPeriods(prev => ([...prev, ...daysOfWeek?.filter((elem => (elem.time[0] !== elem.time[1])))?.map((el) =>  ({weekDay: el.weekDay, timeStart: formatTime(el.time[0], period), timeEnd: formatTime(el.time[1], period), price: price}))]))
                                                }}
                                        />
                                </Layout>
                                <Layout direction='row' className={cnMixSpace({mV:'m'})}  style={{width: '100%'}}>
                                        <Checkbox 
                                                checked={isAllDay} 
                                                onChange={()=> {
                                                        if (!isAllDay) {
                                                                setIsAllDay(!isAllDay);
                                                                setIsRabDay(false);
                                                                setIsVyhDay(false);
                                                        } else {
                                                                setIsAllDay(!isAllDay);
                                                        }
                                                }}
                                                size='s'
                                                className={cnMixSpace({mR:'2xs'})}
                                        />
                                        <Text size='s' className={cnMixSpace({mR:'m'})}>Все дни</Text>
                                        <Checkbox 
                                                checked={isRabDay} 
                                                onChange={()=> {
                                                        if (!isRabDay) {
                                                                setIsRabDay(!isRabDay);
                                                                setIsAllDay(false);
                                                                setIsVyhDay(false);
                                                        } else {
                                                                setIsRabDay(!isRabDay);
                                                        }
                                                }}
                                                size='s'
                                                className={cnMixSpace({mR:'2xs'})}
                                        />
                                        <Text size='s' className={cnMixSpace({mR:'m'})}>Рабочие дни</Text>
                                        <Checkbox 
                                                checked={isVyhDay} 
                                                onChange={()=> {
                                                        if (!isVyhDay) {
                                                                setIsVyhDay(!isVyhDay);
                                                                setIsAllDay(false);
                                                                setIsRabDay(false);
                                                        } else {
                                                                setIsVyhDay(!isVyhDay);
                                                        }
                                                }}
                                                size='s'
                                                className={cnMixSpace({mR:'2xs'})}
                                        />
                                        <Text size='s' >Выходные дни</Text>
                                </Layout>
                                <Layout direction='column' style={{width: '100%'}}>
                                        {daysOfWeek.map((day)=> (
                                                <Layout direction='row' className={cnMixSpace({mT:'m'})}>
                                                        <Text size='m' className={cnMixSpace({mR:'l'})}>{day.weekDay}</Text>
                                                        <Layout flex={1} className={cnMixSpace({mR:'l'})}>
                                                                <Slider
                                                                        view="division"
                                                                        step={1}
                                                                        label={`Период ${formatTimeRange(day.time, period)}`}
                                                                        min={0}
                                                                        max={countOfPeriods}
                                                                        onChange={(value) =>{
                                                                                if (isAllDay) {
                                                                                        setDaysOfWeek(prev => prev.map(item => ({ ...item, time: value })));
                                                                                } else if (isRabDay) {
                                                                                        setDaysOfWeek(prev => prev.map(item => (item.weekDay !== 'СБ' &&  item.weekDay !== 'ВС') ? { ...item, time: value } : item));
                                                                                } else if (isVyhDay) {
                                                                                        setDaysOfWeek(prev => prev.map(item => (item.weekDay === 'СБ' ||  item.weekDay === 'ВС') ? { ...item, time: value } : item));
                                                                                }
                                                                                else {
                                                                                        setDaysOfWeek(prev => (prev.map((item) => item.weekDay === day.weekDay ? { ...item, time: value } : item)));
                                                                                }
                                                                        }}
                                                                        value={day.time}
                                                                        range
                                                                        size='s'
                                                                />
                                                        </Layout>
                                                        <Layout direction='row' flex={2} >
                                                                {periods?.filter((item)=> (item.weekDay === day.weekDay)).map((period) => (
                                                                        <Tag 
                                                                                label={`${period.timeStart} - ${period.timeEnd} : ${period.price} руб.`} 
                                                                                mode='cancel' 
                                                                                onCancel={()=>{
                                                                                        setPeriods(prev => (prev.filter(item => (item.timeEnd !== period.timeEnd || item.timeStart !== period.timeStart || item.weekDay !== period.weekDay))))
                                                                                }}
                                                                                 className={cnMixSpace({mR:'s'})}/>
                                                                ))}
                                                        </Layout>
                                                </Layout>
                                        ))}
                                        
                                </Layout>
                        </Layout>
                )}
                {!isEdit &&  !isLoading && (
                        <Layout style={{overflow: 'auto', width: 'calc(75vw - 100px)'}}>
                                <GanttChartMain periods={periods} period={60}/>
                        </Layout>
                        
                )}
                {isEdit && !isLoading && (
                        <Layout direction="row" style={{alignItems:'center', justifyContent: 'left'}} className={cnMixSpace({mT:'l'})}>
                                <Button
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                <SaveOutlined
                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                />
                                        ))}
                                        label={'Сохранить'}
                                        onClick={()=>{
                                                updateTimePriceData();
                                        }}
                                        size="s"
                                        className={cnMixSpace({mR:'m'})}
                                        disabled={!periods}
                                />
                                
                        </Layout>
                )}
                {!isEdit && !isLoading && (
                        <Layout direction="row" style={{alignItems:'center', justifyContent: 'left'}} className={cnMixSpace({mT:'l'})}>
                                <Button
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                <EditOutlined
                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                />
                                        ))}
                                        label={'Изменить'}
                                        onClick={()=>{
                                                setIsEdit(true); 
                                        }}
                                        size="s"
                                        view="secondary"
                                />
                        </Layout>
                )}
           
            
        </Layout>
    );
};

export default TimeShedule;