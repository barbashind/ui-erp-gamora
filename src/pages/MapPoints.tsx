import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layout } from '@consta/uikit/Layout';
import { Badge, BadgePropStatus } from '@consta/uikit/Badge';
import { Text } from '@consta/uikit/Text';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Card } from '@consta/uikit/Card';
import { Tag } from '@consta/uikit/Tag';
import { AntIcon } from '../utils/AntIcon';
import { cnMixFontSize } from '../utils/MixFontSize';
import { CheckCircleOutlined } from '@ant-design/icons';

// Исправление иконок
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPoint {
  name: string;
  coordinates: [number, number];
  color: string;
}

interface Action {
  text: string;
  color: string;
}

 const curvePoints: [number, number][] = [
    [57.894577, 33.837985],
    [57.841099, 33.922756],
    [57.818236, 34.010193],
    [57.710260, 34.180617],
    [57.645512, 34.224075],
    [57.547231, 34.255854],
    [57.475640, 34.313782],
    [57.368368, 34.471344],
    [57.224019, 34.781614],
    [57.150478, 34.963163],
    [57.097075, 35.073320],
  ];

  // Точки на карте
  const mapPoints: MapPoint[] = [
    { name: 'в.г. Жилотково, СУ909', coordinates: [57.533894, 34.231995], color: '#22c55e' },
    { name: 'в.г. Афримово, СУ905', coordinates: [57.130024, 35.022080], color: '#22c55e' },
    { name: 'Полигон №7, СУ905', coordinates: [57.310000, 34.583611], color: '#eab308' },
    { name: 'в.г. Бухолово, СУ926', coordinates: [57.358974, 34.435738], color: '#22c55e' },
    { name: 'в.г. Ям-Григино, СУ910', coordinates: [57.786357, 33.975612], color: '#eab308' },
    { name: 'Штаб геодезии, н.п. Бологое, СУ910', coordinates: [57.880586, 34.038811], color: '#22c55e' },
    { name: 'в.г. Ям-Григино, А-Мост', coordinates: [57.790563, 34.015858], color: '#eab308' },
    { name: 'в.г. Ям-Григино, А-Бетон', coordinates: [57.786548, 33.994254], color: '#eab308' },
    { name: 'в.г. Княщины, СУ920', coordinates: [57.300811, 34.588637], color: '#ef4444' },
  ];


interface Point {
  name: string;
  actions: Action[] | null;
  color: BadgePropStatus;
}
  
const MapPoints = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Координаты линии
 

  // Средняя точка
  const middlePoint = curvePoints[Math.floor(curvePoints.length / 2)];

  useEffect(() => {
    // Важно: проверяем что элемент существует и карта еще не создана
    if (!mapRef.current || mapInstanceRef.current) return;


    // Создаем карту
    const map = L.map(mapRef.current, {
      center: [57.5, 34.5],
      zoom: 9,
      zoomControl: true,
      scrollWheelZoom: true
    });

    // Добавляем тайлы
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Рисуем линию
    L.polyline(curvePoints, {
      color: '#ed7931',
      weight: 8,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Добавляем точки
    mapPoints.forEach((point) => {
      const marker = L.circleMarker(point.coordinates, {
        radius: 10,
        color: 'white',
        weight: 2,
        fillColor: point.color,
        fillOpacity: 0.9
      }).addTo(map);

      // Добавляем тултип
      marker.bindTooltip(
        `<div style="padding: 1px 1px; min-width: 150px;">
           <div style="font-weight: bold; margin-bottom: 2px;">${point.name}</div>
           <div style="font-size: 10px; color: #666;">
             ${point.coordinates[0].toFixed(6)}, ${point.coordinates[1].toFixed(6)}
           </div>
         </div>`,
        { permanent: true, direction: 'left', offset: [-10, 0] }
      );
    });

    // Добавляем надпись ВСМ
    const vsmMarker = L.circleMarker(middlePoint, {
      radius: 1,
      color: 'transparent'
    }).addTo(map);

    vsmMarker.bindTooltip(
      `<div style="
         padding: 4px 8px;
         background-color: #004267;
         color: white;
         border-radius: 4px;
         font-size: 14px;
         font-weight: bold;
         white-space: nowrap;
       ">
         ВСМ-1, 4-й этап
       </div>`,
      { permanent: true, direction: 'top', offset: [0, -20] }
    );

    // Сохраняем инстанс карты
    mapInstanceRef.current = map;

    console.log('Карта создана');

    // Функция очистки
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [middlePoint]); // Пустой массив зависимостей - выполняется только один раз


  const pointsList: Point[] = [
    { name: 'в.г. Жилотково, СУ909', actions: null, color: 'success' },
    { name: 'в.г. Жилотково, СУ967', actions: [{text: 'Подключение оптики для СУ967 – реализовано', color: 'var(--color-bg-green)'}], color: 'success' },
    { name: 'в.г. Афримово, СУ905', actions: null, color: 'success' },
    { name: 'Полигон №7, СУ905', actions: null, color: 'success' },
    { name: 'в.г. Бухолово, СУ926', actions: null, color: 'success' },
    { name: 'в.г. Ям-Григино, СУ910', actions: [{text: 'Подключение оптики до 30.04', color: 'var(--color-bg-caution)'}], color: 'warning' },
    { name: 'Штаб геодезии, н.п. Бологое, СУ910', actions: null, color: 'success' },
    { name: 'в.г. Ям-Григино, А-Мост', actions: [{text: '30.06, договор с МТС на согласовании  в А-МОСТ', color: 'var(--color-bg-caution)'}], color: 'warning' },
    { name: 'в.г. Ям-Григино, А-Бетон', actions: [{text: 'Подключение оптики до 30.06', color: 'var(--color-bg-caution)'}], color: 'warning' },
    { name: 'в.г. Княщины, СУ920', actions: [{text: 'LTE подключено с 17.03', color: 'var(--color-bg-green)'}, {text: 'Оптика Ростелеком до 20.05, согласовываем договор', color: 'var(--color-bg-caution)'}], color: 'alert' },
  ];

  return (
    <Layout direction='row' style={{ height: '80vh', width: '72vw', padding: '20px' }}>
      <div 
        ref={mapRef} 
        style={{ 
          height: '100%', 
          width: '100%', 
          borderRadius: '8px',
          background: '#f0f0f0' // временный фон пока карта грузится
        }} 
      />
      <Layout direction='column' className={cnMixSpace({pL:'xl'})} style={{ height: '80vh', width: '10vw' }}>
        <Card border className={cnMixSpace({mB:'l'})} style={{ width: 'fit-content'}}>
          <Layout direction='column' className={cnMixSpace({p:'s'})}>
              <Layout direction='row' className={cnMixSpace({pH:'m'})}>
                <div style={{textWrap:'nowrap', minWidth:'20px', maxWidth:'20px'}} ></div>
                <Text size='s' style={{textWrap:'nowrap', minWidth:'235px', maxWidth:'235px'}} align='left' weight='semibold' >Наименование участка</Text>
                <Text size='s' style={{textWrap:'nowrap', minWidth:'335px', maxWidth:'335px'}} align='left' weight='semibold' >План мероприятий</Text>
              </Layout>
              {pointsList.map((point) => (
                <Layout direction='row' style={{border:'1px solid var(--color-bg-border)', borderRadius: '6px', alignItems:'center'}} className={cnMixSpace({p:'xs', mT: 's'})}>
                  
                  <Layout style={{justifyContent:'center', minWidth:'20px', maxWidth:'20px'}}>
                    <Badge size='xs' status={point.color}/>
                  </Layout>
                  <Text size='xs' style={{textWrap:'nowrap', minWidth:'235px', maxWidth:'235px'}}>{point.name}</Text>
                  {point.actions && (
                    <Layout direction='column' style={{textWrap:'nowrap', minWidth:'335px', maxWidth:'335px'}}>
                      {point.actions.map((action) => (
                        <Tag 
                          icon={AntIcon.asIconComponent(() => (
                                  <CheckCircleOutlined
                                          className={cnMixFontSize('l') + cnMixSpace({mR:'xs'})}
                                  />
                            ))}
                          mode='info' 
                          size='s' 
                          style={{textWrap:'nowrap', backgroundColor: action.color}} 
                          label={action.text} 
                          className={cnMixSpace({mB: '2xs'})}
                          />
                      )
                    )}
                      
                    </Layout>
                  )}
                  
                </Layout>
              ))
              }
          </Layout>
        </Card>
        
        <Layout direction='row' style={{alignItems: 'center'}}>
          <Badge size='xs' status='success' className={cnMixSpace({mR:'s'})}/>
          <Text size='s' style={{textWrap:'nowrap'}}>- подключена оптика, есть резерв. канал связи</Text>
        </Layout>
        <Layout direction='row' className={cnMixSpace({mT:'s'})} style={{alignItems: 'center'}}>
          <Badge size='xs' status='warning' className={cnMixSpace({mR:'s'})}/>
          <Text size='s' style={{textWrap:'nowrap'}}>- подключен спутниковый интернет, есть резерв. канал связи LTE</Text>
        </Layout>
        <Layout direction='row' className={cnMixSpace({mT:'s'})} style={{alignItems: 'center'}}>
          <Badge size='xs' status='alert' className={cnMixSpace({mR:'s'})}/>
          <Text size='s' style={{textWrap:'nowrap'}}>- подключено  LTE, отсутствует резерв. канал связи</Text>
        </Layout>
        
        

      </Layout>
    </Layout>
  );
};

export default MapPoints;