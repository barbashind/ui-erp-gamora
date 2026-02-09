import React, { useEffect, useState } from 'react';
import { Layout } from '@consta/uikit/Layout';
import { Point } from '../types/monitoring-types';
import { getAllPoints } from '../services/MonitoringService';
import { Loader } from '@consta/uikit/Loader';
import { Card } from '@consta/uikit/Card';
import { Text } from '@consta/uikit/Text';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Button } from '@consta/uikit/Button';
import { AntIcon } from '../utils/AntIcon';
import { cnMixFontSize } from '../utils/MixFontSize';

const StructurePoints: React.FC = () => {

  interface Place {
    object: string;
    name: string;
    responsibleObj: string;
  }

  interface Response {
    open: boolean;
    name: string;
  }
 
  const [objects, setObjects] = useState<string[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    
    const getData = async () => {
                  await getAllPoints((resp) => {
                    setPoints(resp);
                    const placesMap = new Map<string, Place>();
        
        resp.forEach((el) => {
          if (el.place && el.place.trim() !== '' && el.object && el.object.trim() !== '' && el.responsibleObj && el.responsibleObj.trim() !== '') {
            const placeKey = `${el.object}_${el.place}_${el.responsibleObj}`;
            if (!placesMap.has(placeKey)) {
              placesMap.set(placeKey, {
                object: el.object,
                name: el.place,
                responsibleObj: el.responsibleObj,
              });
            }
          }
        });

        const uniquePlaces = Array.from(placesMap.values());
        setPlaces(uniquePlaces);
                    const uniqueObjects = Array.from(
                      new Set(resp.map((el) => el.object ?? '').filter(Boolean))
                    );
                    const uniqueResponses = Array.from(
                      new Set(resp.map((el) => el.responsibleObj ?? '').filter(Boolean))
                    );
                    setResponses(uniqueResponses.map((el)=> ({name: el, open: false})));
                    setObjects(uniqueObjects);
                    setIsLoading(false);
                  })
          };
          
          void getData();
  }, []);

  return (
    <Layout style={{width: '100%', minWidth: '1000px'}}>
      {isLoading && (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Loader />
        </div>
      )}
      {!isLoading && (
        <Layout direction='column'>
          {objects.map((object)=> (
            <Card className={cnMixSpace({m: 'm', p:'m'})} border>
              <Layout direction='row'>
                <Text view='secondary' size='xl' className={cnMixSpace({mR: 's'})}>Объект:</Text>
                <Text view='primary' size='xl' weight='bold'>{object}</Text>
              </Layout>
              <Layout direction='column'>
                {responses.map((elem)=> (
                  <Card className={cnMixSpace({m: 'm', p:'m'})} style={{backgroundColor: 'var(--color-control-bg-ghost)'}}>
                      <Layout direction='row' style={{justifyContent: 'space-between', minWidth: '50vw', maxWidth: '50vw'}}>
                        <Text view='primary' size='s' weight='semibold'>{elem.name}</Text>
                        {elem.open ? (
                          <Button
                            iconLeft={AntIcon.asIconComponent(() => (
                                    <UpOutlined
                                            className={cnMixFontSize('l')}
                                    />
                            ))}
                            onClick={()=> {
                              setResponses(prev => (prev.map((el) => (el.name === elem.name ? {name: el.name, open: false} : {...el}))));
                            }}
                            size='s'
                            view='clear'
                          />
                        ) : (
                          <Button
                            iconLeft={AntIcon.asIconComponent(() => (
                                    <DownOutlined
                                            className={cnMixFontSize('l')}
                                    />
                            ))}
                            onClick={()=> {
                              setResponses(prev => (prev.map((el) => (el.name === elem.name ? {name: el.name, open: true} : {...el}))));
                            }}
                            size='s'
                            view='clear'
                          />
                        )}
                      </Layout>
                      {elem.open && (
                        <Layout direction='column'>
                          <Layout direction='row' style={{flexWrap: 'wrap'}}>
                            {places.filter(el =>( el.object === object && el.responsibleObj === elem.name)).map((place)=> (
                            <Card className={cnMixSpace({mR: 's', mT: 's', p:'s'})} style={{backgroundColor: 'var(--color-control-bg-default)'}}>
                                <Layout direction='row'>
                                  <Text view='primary' size='m' weight='semibold'>{place.name}</Text>
                                </Layout>
                                <Layout direction='row'>
                                  <Text view='secondary' size='s' className={cnMixSpace({mR: 's'})}>Точек прохода УФЧ:</Text>
                                  <Text view='primary' size='s' weight='semibold'>{points.filter(el => (el.place === place.name && el.responsibleObj === elem.name)).length}</Text>
                                </Layout>
                            </Card>
                            ))}
                          </Layout>
                        </Layout>
                          
                      )}
                      
                  </Card>
                )
                )}
              </Layout>
              
              
            </Card>
          )

          )}
          </Layout>
      )

      }
        
    </Layout>
  );
};

export default StructurePoints;