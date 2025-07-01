import { TimePrice } from '#/types/loft-details-types';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Text } from '@consta/uikit/Text';
import { Tooltip } from './Tooltip';
import { Direction, Position } from '@consta/uikit/Popover';
import { useState } from 'react';
import classes from '../App.module.css'

interface GanttChartProps {
    periods: TimePrice[];
    period: number;
}



const GanttChartMain = ({ periods, period } : GanttChartProps) => {

const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };


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


// Пример использования
const timeSlots = generateTimeSlots();
const days = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

const [tooltipPosition, setTooltipPosition] = useState<Position>(undefined);
const [tooltipText, setTooltipText] = useState<string | undefined>(undefined);
const [arrowDir, setArrowDir] = useState<Direction>('upCenter');

  return (
            <Layout direction='row' className={cnMixSpace({mV:'l'})} style={{overflow:'visible', width: 'fit-content'}}>
                <Layout direction='column' style={{overflow:'visible', minWidth: '100px'}}>
                    {days.map(day => (
                        <Layout direction='row' className={cnMixSpace({mT:'m'})} style={{overflow:'visible', width: 'fit-content'}}>
                            <Text style={{minWidth: '50px'}}>{day}</Text>
                            {timeSlots.map(time => (
                                <Layout 
                                    style={{
                                        minHeight: '35px',
                                        minWidth: '50px',
                                        maxWidth: '50px',
                                        backgroundColor: 
                                        periods?.find((elem)=> (getTimeInMinutes(elem.timeStart) <= getTimeInMinutes(time) && getTimeInMinutes(elem.timeEnd) >= getTimeInMinutes(time) && elem.weekDay === day)) ? ((day === 'ВС') || (day ==='СБ')) ? 'var(--color-red-100)' : 'var(--color-royal-blue-200)' : 'var(--color-gray-200)',
                                        borderLeft: '1px dashed',
                                    }}
                                    onMouseMove={(event) => {
                                            const target = event.target as HTMLElement;
                                            const rect = target.getBoundingClientRect();
                                            setTooltipPosition({
                                                x: rect.right - (target.clientWidth * 0.5),
                                                y: rect.top,
                                            });
                                            setTooltipText(periods?.find((elem)=> (getTimeInMinutes(elem.timeStart) <= getTimeInMinutes(time) && getTimeInMinutes(elem.timeEnd) >= getTimeInMinutes(time) && elem.weekDay === day)) ? `${time} - ${timeSlots[timeSlots.indexOf(time) + 1] ?? '23:59'} цена: ` + (periods?.find((elem)=> (getTimeInMinutes(elem.timeStart) <= getTimeInMinutes(time) && getTimeInMinutes(elem.timeEnd) >= getTimeInMinutes(time) && elem.weekDay === day))?.price?.toString() + '₽') : 'Не работает')
                                            setArrowDir('upCenter')
                                        }}
                                    onMouseLeave={() => {
                                        setTooltipPosition(undefined);
                                        setTooltipText(undefined)
                                    }}
                                >
                                    <Text size='xs' align='center' style={{width: '100%'}}>{periods?.find((elem)=> (getTimeInMinutes(elem.timeStart) <= getTimeInMinutes(time) && getTimeInMinutes(elem.timeEnd) >= getTimeInMinutes(time) && elem.weekDay === day)) ? (periods?.find((elem)=> (getTimeInMinutes(elem.timeStart) <= getTimeInMinutes(time) && getTimeInMinutes(elem.timeEnd) >= getTimeInMinutes(time) && elem.weekDay === day))?.price?.toString() + '₽') : ''}</Text>
                                </Layout>
                            ))}
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
                    ))}
                    <Layout direction='row' >
                        <div style={{minWidth: '50px'}}/>
                        {timeSlots.map(time => (
                            <Layout direction='column' className={cnMixSpace({mT: 's', pL:'2xs'})} style={{borderLeft: '1px dashed', minWidth: '50px', maxWidth: '50px', height:'40px', justifyContent: 'center' }} >
                                <Text size='xs' style={{minWidth: '50px', maxWidth: '50px'}} >{time}</Text>
                            </Layout>
                        ))}
                        
                    </Layout>
                </Layout>
                
            </Layout>

  );
};

export default GanttChartMain;