import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Select } from '@consta/uikit/Select';
import { IdLabel } from '../utils/types';
import { getAllPoints } from '../services/MonitoringService';
import { Point } from '../types/monitoring-types';
import { Loader } from '@consta/uikit/Loader';
import { Badge } from '@consta/uikit/Badge';
import { AntIcon } from '../utils/AntIcon';
import { cnMixFontSize } from '../utils/MixFontSize';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Text } from '@consta/uikit/Text';
import { Card } from '@consta/uikit/Card';

// Исправление иконок
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ----- Типы -----
interface MapPoint {
  name: string | null;
  coordinates: [number, number];
  color: string;
}

interface TableRow {
  objectName: string;
  total: number;
  online: number;
  offlineTerminals: string[];
}

// ----- Координаты центров объектов -----
const objectCenters: Record<string, { center: [number, number]; zoom: number }> = {
  'Объекты Москвы': { center: [55.536311, 37.064551], zoom: 10 },
  'Аэропорт Курган': { center: [55.475, 65.415], zoom: 12 },
  'Аэропорт Горноалтайск': { center: [51.967, 85.833], zoom: 12 },
  'ВСМ-1': { center: [57.5, 34.5], zoom: 9 },
};

// ----- Линия на карте -----
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

const MapPoints = () => {
  // ---- Парсинг координат ----
  const parseCoordinates = (placeStr: string): [number, number] | null => {
    try {
      if (placeStr.startsWith('[') && placeStr.endsWith(']')) {
        const parsed = JSON.parse(placeStr);
        if (Array.isArray(parsed) && parsed.length === 2 && !parsed.some(isNaN)) {
          return [parsed[0], parsed[1]];
        }
      }
      const parts = placeStr.split(',').map(s => parseFloat(s.trim()));
      if (parts.length === 2 && !parts.some(isNaN)) {
        return [parts[0], parts[1]];
      }
      console.warn(`Некорректный формат координат: "${placeStr}"`);
      return null;
    } catch {
      console.warn(`Ошибка парсинга координат: "${placeStr}"`);
      return null;
    }
  };

  // ---- Состояния ----
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [selectedObject, setSelectedObject] = useState<IdLabel>({ id: 0, label: 'ВСМ-1' });
  const [isLoading, setIsLoading] = useState(false);

  // ---- Загрузка данных ----
  useEffect(() => {
    setIsLoading(true);
    const getGatesInfoData = async () => {
      await getAllPoints((resp) => {
        const fetchedGates = resp.filter((elem) => elem.type === 'ST');

        // ---- Группировка для карты (по place) ----
        const groupsForMap: Record<string, Point[]> = {};
        fetchedGates.forEach((point) => {
          if (!point.place) return;
          const key = point.place;
          if (!groupsForMap[key]) groupsForMap[key] = [];
          groupsForMap[key].push(point);
        });

        const computedMapPoints: MapPoint[] = [];

        Object.values(groupsForMap).forEach((group) => {
          const first = group[0];
          const coords = parseCoordinates(first.place ? first.place : '[0, 0]');
          if (!coords) return;

          const speeds: number[] = [];
          group.forEach((point) => {
            if (point.connecting === false) {
              speeds.push(0);
            } else if (Array.isArray(point.connecting)) {
              point.connecting.forEach((conn) => {
                if (typeof conn === 'number') speeds.push(conn);
                else if (conn && typeof conn === 'object' && 'speed' in conn) speeds.push(conn.speed);
              });
            } else if (point.connecting !== undefined && point.connecting !== null && point.connecting !== true) {
              const num = Number(point.connecting);
              if (!isNaN(num)) speeds.push(num);
            }
          });

          const hasZero = speeds.some((s) => s === 0);
          let color: string;
          if (hasZero) {
            color = '#ef4444';
          } else {
            const avg = speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
            if (avg < 15) color = '#22c55e';
            else if (avg < 30) color = '#eab308';
            else if (avg < 80) color = '#f97316';
            else color = '#ef4444';
          }

          computedMapPoints.push({
            name: first.login || 'Без имени',
            coordinates: coords,
            color,
          });
        });

        setMapPoints(computedMapPoints);

        // ---- Группировка для таблицы (по object) ----
        const groupsForTable: Record<string, Point[]> = {};
        fetchedGates.forEach((point) => {
          if (!point.object) return;
          const key = point.object;
          if (!groupsForTable[key]) groupsForTable[key] = [];
          groupsForTable[key].push(point);
        });

        const computedTableData: TableRow[] = [];

        Object.values(groupsForTable).forEach((group) => {
          const total = group.length;
          let online = 0;
          const offlineLogins: string[] = [];

          group.forEach((point) => {
            let isOnline = false;

            if (point.connecting === false) {
              isOnline = false;
            } else if (Array.isArray(point.connecting)) {
              const hasPositive = point.connecting.some((conn) => {
                if (typeof conn === 'number') return conn > 0;
                if (conn && typeof conn === 'object' && 'speed' in conn) return conn.speed > 0;
                return false;
              });
              isOnline = hasPositive;
            } else if (point.connecting !== undefined && point.connecting !== null && point.connecting !== true) {
              const num = Number(point.connecting);
              if (!isNaN(num)) {
                isOnline = num > 0;
              }
            } else {
              isOnline = false;
            }

            if (isOnline) {
              online++;
            } else {
              offlineLogins.push(point.login || 'Без имени');
            }
          });

          computedTableData.push({
            objectName: group[0].object || 'Без имени',
            total,
            online,
            offlineTerminals: offlineLogins,
          });
        });

        setTableData(computedTableData);
        setIsLoading(false);
      });
    };

    void getGatesInfoData();
  }, []);

  // ---- Рефы для карты ----
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const middlePoint = curvePoints[Math.floor(curvePoints.length / 2)];

  // ---- Инициализация карты ----
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initialCenter = objectCenters[selectedObject.label]?.center || [57.5, 34.5];
    const initialZoom = objectCenters[selectedObject.label]?.zoom || 9;

    const map = L.map(mapRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    L.polyline(curvePoints, {
      color: '#ed7931',
      weight: 8,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    mapPoints.forEach((point) => {
      const marker = L.circleMarker(point.coordinates, {
        radius: 10,
        color: 'white',
        weight: 2,
        fillColor: point.color,
        fillOpacity: 0.9,
      }).addTo(map);

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

    const vsmMarker = L.circleMarker(middlePoint, {
      radius: 1,
      color: 'transparent',
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

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapPoints, middlePoint, selectedObject]);

  // ---- Обновление центра при смене объекта ----
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const { center, zoom } = objectCenters[selectedObject.label] || objectCenters['ВСМ-1'];
    map.setView(center, zoom);
  }, [selectedObject]);

  // ---- Рендер ----
  return (
    <Layout direction="column" style={{ height: '80vh', width: '72vw', padding: '20px' }}>
      <Layout direction="row" style={{ flex: 1 }}>
        {/* Карта */}
        <div
          ref={mapRef}
          style={{
            height: '100%',
            width: '100%',
            borderRadius: '8px',
            background: '#f0f0f0',
          }}
        />

        {/* Правая колонка */}
        <Layout
          direction="column"
          className={cnMixSpace({ pL: 'xl' })}
          style={{ height: '100%', width: '26vw' }}
        >
          {/* Селект */}
          <Select
            value={selectedObject}
            onChange={(value) => {
              if (value) setSelectedObject(value);
            }}
            items={[
              { id: 0, label: 'ВСМ-1' },
              { id: 1, label: 'Объекты Москвы' },
              { id: 2, label: 'Аэропорт Курган' },
              { id: 3, label: 'Аэропорт Горноалтайск' },
            ]}
            style={{ minWidth: '100%', marginBottom: '16px' }}
            label="Выберите объект для поиска на карте"
          />

          {/* Таблица */}
          {isLoading ? (
            <Layout
              direction="column"
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
              <Loader />
            </Layout>
          ) : (
            <Layout
              direction="column"
              style={{ flex: 1, overflow: 'hidden' }}
            >
              {/* Заголовки */}
              <Card
                shadow={false}
                border
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1.5fr',
                  padding: '8px 16px',
                  background: 'var(--color-bg-ghost)',
                  borderBottom: '1px solid var(--color-border)',
                  borderRadius: '8px 8px 0 0',
                }}
              >
                <Text size="s" weight="bold" view="primary" style={{minWidth: '150px', maxWidth: '150px'}}>
                  Объект
                </Text>
                <Text size="s" weight="bold" view="primary" style={{minWidth: '150px', maxWidth: '150px'}}>
                  Терминалы
                </Text>
                <Text size="s" weight="bold" view="primary" style={{minWidth: '150px', maxWidth: '150px'}}>
                  Оффлайн
                </Text>
              </Card>

              {/* Список строк с прокруткой */}
              <Layout
                direction="column"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  paddingTop: '8px',
                  gap: '8px',
                }}
              >
                {tableData.length === 0 ? (
                  <Layout style={{ padding: '20px', textAlign: 'center' }}>
                    <Text view="ghost">Нет данных</Text>
                  </Layout>
                ) : (
                  tableData.map((row, idx) => (
                    <Card
                      key={idx}
                      shadow
                      border
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1.5fr',
                        padding: '12px 16px',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {/* Объект */}
                      <Text size="s" weight="semibold" style={{minWidth: '150px', maxWidth: '150px'}}>
                        {row.objectName}
                      </Text>

                      {/* Терминалы СКУД */}
                      <Layout direction="column" style={{minWidth: '150px', maxWidth: '150px'}}>
                        <Text size="s" view="secondary">
                          Всего: <Text as="span" weight="bold">{row.total}</Text>
                        </Text>
                        <Text size="s" view="secondary">
                          В сети: <Text as="span" weight="bold" color={row.online > 0 ? 'success' : 'ghost'}>
                            {row.online}
                          </Text>
                        </Text>
                      </Layout>

                      {/* Оффлайн терминалы */}
                      <Layout direction="column"  style={{minWidth: '300px', maxWidth: '300px'}}>
                        {row.offlineTerminals.length === 0 ? (
                          <Badge
                            status="success"
                            label="Все в сети"
                            iconLeft={AntIcon.asIconComponent(() => (
                                <CheckCircleOutlined className={cnMixFontSize('s')} />
                              ))}
                            size="s"
                            style={{width: 'fit-content'}}
                          />
                        ) : (
                          row.offlineTerminals.map((terminal, i) => (
                            <Badge
                              key={i}
                              status="alert"
                              size="s"
                              iconLeft={AntIcon.asIconComponent(() => (
                                <WarningOutlined className={cnMixFontSize('s')} />
                              ))}
                              label={terminal}
                              className={cnMixSpace({mB:'xs'})}
                              style={{width: 'fit-content'}}
                            />
                          ))
                        )}
                      </Layout>
                    </Card>
                  ))
                )}
              </Layout>
            </Layout>
          )}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default MapPoints;