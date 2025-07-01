import { TimePrice } from '#/types/loft-details-types';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Text } from '@consta/uikit/Text';
import { useRef } from 'react';

interface GanttChartProps {
    periods: TimePrice[];
    period: number;
}



const GanttChart = ({ periods, period } : GanttChartProps) => {

const getTimeInMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

const monRef = useRef<HTMLDivElement | null>(null)
const tueRef = useRef<HTMLDivElement | null>(null)
const wedRef = useRef<HTMLDivElement | null>(null)
const thuRef = useRef<HTMLDivElement | null>(null)
const friRef = useRef<HTMLDivElement | null>(null)
const satRef = useRef<HTMLDivElement | null>(null)
const sunRef = useRef<HTMLDivElement | null>(null)

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

  return (
            <Layout direction='row' className={cnMixSpace({mV:'l'})} >
                <Layout direction='column' style={{marginTop: '16px', marginRight: '37px'}} >
                    {timeSlots && timeSlots.length > 0 && timeSlots.map((time) => (
                        <Layout direction='column' style={{ minHeight: 22, maxWidth: '40px'}}>
                            <Text size='xs' style={{width: '100%'}}>{time}</Text>
                            <div style={{width: '800px', borderBottom: '1px solid var(--color-gray-200)'}}/>
                        </Layout>
                    ))}
                </Layout>
                <Layout direction='column' >
                    {monRef && tueRef && wedRef && thuRef && friRef && satRef && sunRef && (
                        <Layout direction='row'>
                        <Layout direction='column' flex={1} className={cnMixSpace({mR:'s'})}>
                            <Text ref={monRef} style={{minWidth: 90}} align='center' className={cnMixSpace({pR:'s'})}>ПН</Text>
                            {periods?.filter((el: { weekDay: string; }) => (el.weekDay === 'ПН'))?.map((elem: { timeEnd: string; timeStart: string; price: number | null; })=> (
                                <Layout 
                                    style={{ 
                                        minHeight: monRef?.current?.offsetTop ? ((getTimeInMinutes(elem.timeEnd) - getTimeInMinutes(elem.timeStart)) * 22 / period - 1) : 0, 
                                        backgroundColor: 'var(--color-royal-blue-200)',
                                        alignItems: 'center',
                                        top: (monRef?.current?.offsetTop ?? 0) + getTimeInMinutes(elem.timeStart) * 22 / period + 35,
                                        left: (monRef?.current?.offsetLeft ?? 0) ,
                                        position: 'absolute',
                                        border: '2px solid white',
                                        width: '80px',
                                        borderRadius: '12px',
                                        }} 
                                        className={cnMixSpace({pT:'2xs'})}
                                >
                                    <Text style={{ width: '100%' }} align='center' size='s' weight='semibold'>{elem.price + ' руб'}</Text>
                                </Layout>
                            ))}
                        </Layout>
                        <Layout direction='column' flex={1} className={cnMixSpace({mR:'s'})}>
                            <Text ref={tueRef} style={{minWidth: 90}} align='center' className={cnMixSpace({pR:'s'})}>ВТ</Text>
                            {periods?.filter((el: { weekDay: string; }) => (el.weekDay === 'ВТ'))?.map((elem)=> (
                                <Layout 
                                    style={{ 
                                        minHeight: tueRef?.current?.offsetTop ? (getTimeInMinutes(elem.timeEnd) - getTimeInMinutes(elem.timeStart)) * 22 / period - 1 : 0, 
                                        backgroundColor: 'var(--color-royal-blue-200)', 
                                        alignItems: 'center',
                                        top: (tueRef?.current?.offsetTop ?? 0) + getTimeInMinutes(elem.timeStart) * 22 / period + 31,
                                        left: (tueRef?.current?.offsetLeft ?? 0) ,
                                        position: 'absolute',
                                        border: '2px solid white',
                                        width: '80px',
                                        borderRadius: '12px',
                                        }} 
                                        className={cnMixSpace({mT:'2xs'})}
                                >
                                    <Text style={{ width: '100%' }} align='center' size='s' weight='semibold'>{elem.price + ' руб'}</Text>
                                </Layout>
                            ))}
                        </Layout>
                        <Layout direction='column' flex={1} className={cnMixSpace({mR:'s'})}>
                            <Text ref={wedRef} style={{minWidth: 90}} align='center' className={cnMixSpace({pR:'s'})}>СР</Text>
                            {periods?.filter((el: { weekDay: string; }) => (el.weekDay === 'СР'))?.map((elem)=> (
                                <Layout 
                                    style={{ 
                                        minHeight: wedRef?.current?.offsetTop ? (getTimeInMinutes(elem.timeEnd) - getTimeInMinutes(elem.timeStart)) * 22 / period - 1 : 0, 
                                        backgroundColor: 'var(--color-royal-blue-200)',
                                        alignItems: 'center',
                                        top: (wedRef?.current?.offsetTop ?? 0) + getTimeInMinutes(elem.timeStart) * 22 / period + 31,
                                        left: (wedRef?.current?.offsetLeft ?? 0) ,
                                        position: 'absolute',
                                        border: '2px solid white',
                                        width: '80px',
                                        borderRadius: '12px',
                                        }} 
                                        className={cnMixSpace({mT:'2xs'})}
                                >
                                    <Text style={{ width: '100%' }} align='center' size='s' weight='semibold'>{elem.price + ' руб'}</Text>
                                </Layout>
                            ))}
                        </Layout>
                        <Layout direction='column' flex={1} className={cnMixSpace({mR:'s'})}>
                            <Text ref={thuRef} style={{minWidth: 90}} align='center' className={cnMixSpace({pR:'s'})}>ЧТ</Text>
                            {periods?.filter((el: { weekDay: string; }) => (el.weekDay === 'ЧТ'))?.map((elem)=> (
                                <Layout 
                                    style={{ 
                                        minHeight: thuRef?.current?.offsetTop ? (getTimeInMinutes(elem.timeEnd) - getTimeInMinutes(elem.timeStart)) * 22 / period - 1 : 0, 
                                        backgroundColor: 'var(--color-royal-blue-200)',
                                        alignItems: 'center',
                                        top: (thuRef?.current?.offsetTop ?? 0) + getTimeInMinutes(elem.timeStart) * 22 / period + 31,
                                        left: (thuRef?.current?.offsetLeft ?? 0) ,
                                        position: 'absolute',
                                        border: '2px solid white',
                                        width: '80px',
                                        borderRadius: '12px',
                                        }} 
                                        className={cnMixSpace({mT:'2xs'})}
                                >    
                                    <Text style={{ width: '100%' }} align='center' size='s' weight='semibold'>{elem.price + ' руб'}</Text>
                                </Layout>
                            ))}
                        </Layout>
                        <Layout direction='column' flex={1} className={cnMixSpace({mR:'s'})}>
                            <Text ref={friRef} style={{minWidth: 90}} align='center' className={cnMixSpace({pR:'s'})}>ПТ</Text>
                            {periods?.filter((el: { weekDay: string; }) => (el.weekDay === 'ПТ'))?.map((elem)=> (
                                <Layout 
                                    style={{ 
                                        minHeight: friRef?.current?.offsetTop ? (getTimeInMinutes(elem.timeEnd) - getTimeInMinutes(elem.timeStart)) * 22 / period - 1 : 0, 
                                        backgroundColor: 'var(--color-royal-blue-200)',
                                        alignItems: 'center',
                                        top: (friRef?.current?.offsetTop ?? 0) + getTimeInMinutes(elem.timeStart) * 22 / period + 31,
                                        left: (friRef?.current?.offsetLeft ?? 0) ,
                                        position: 'absolute',
                                        border: '2px solid white',
                                        width: '80px',
                                        borderRadius: '12px',
                                        }} 
                                        className={cnMixSpace({mT:'2xs'})}
                                >
                                    <Text style={{ width: '100%' }} align='center' size='s' weight='semibold'>{elem.price + ' руб'}</Text>
                                </Layout>
                            ))}
                        </Layout>
                        <Layout direction='column' flex={1} className={cnMixSpace({mR:'s'})}>
                            <Text ref={satRef} style={{minWidth: 90}} align='center' className={cnMixSpace({pR:'s'})}>СБ</Text>
                            {periods?.filter((el: { weekDay: string; }) => (el.weekDay === 'СБ'))?.map((elem)=> (
                                <Layout 
                                    style={{ 
                                        minHeight: satRef?.current?.offsetTop ? (getTimeInMinutes(elem.timeEnd) - getTimeInMinutes(elem.timeStart)) * 22 / period - 1 : 0, 
                                        backgroundColor: 'var(--color-red-100)',
                                        alignItems: 'center',
                                        top: (satRef?.current?.offsetTop ?? 0) + getTimeInMinutes(elem.timeStart) * 22 / period + 31,
                                        left: (satRef?.current?.offsetLeft ?? 0) ,
                                        position: 'absolute',
                                        border: '2px solid white',
                                        width: '80px',
                                        borderRadius: '12px',
                                        }} 
                                        className={cnMixSpace({mT:'2xs'})}
                                > 
                                    <Text style={{ width: '100%' }} align='center' size='s' weight='semibold'>{elem.price + ' руб'}</Text>
                                </Layout>
                            ))}
                        </Layout>
                        <Layout direction='column' flex={1} className={cnMixSpace({mR:'s'})}>
                            <Text ref={sunRef} style={{minWidth: 90}} align='center' className={cnMixSpace({pR:'s'})}>ВС</Text>
                            {periods?.filter((el: { weekDay: string; }) => (el.weekDay === 'ВС'))?.map((elem)=> (
                                <Layout 
                                    style={{ 
                                        minHeight: sunRef?.current?.offsetTop ? (getTimeInMinutes(elem.timeEnd) - getTimeInMinutes(elem.timeStart)) * 22 / period - 1 : 0, 
                                        backgroundColor: 'var(--color-red-100)',
                                        borderRadius: '12px',
                                        alignItems: 'center',
                                        top: (sunRef?.current?.offsetTop ?? 0) + getTimeInMinutes(elem.timeStart) * 22 / period + 31,
                                        left: (sunRef?.current?.offsetLeft ?? 0) ,
                                        position: 'absolute',
                                        border: '2px solid white',
                                        width: '80px'
                                        }} 
                                        className={cnMixSpace({mT:'2xs'})}
                                >
                                    <Text style={{ width: '100%' }} align='center' size='s' weight='semibold'>{elem.price + ' руб'}</Text>
                                </Layout>
                            ))}
                        </Layout>
                    </Layout>
                    )}
                    
                </Layout>
            </Layout>

  );
};

export default GanttChart;