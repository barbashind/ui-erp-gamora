import { AntIcon } from "../../utils/AntIcon";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { CloseOutlined, LineChartOutlined } from "@ant-design/icons";
import { Button } from "@consta/uikit/Button";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { useEffect, useState } from "react";
import { Modal } from '@consta/uikit/Modal';
import { Test } from "../../types/monitoring-types";
import {  getTests } from "../../services/MonitoringService";
import { Area } from '@consta/charts/Area';
import { Card } from "@consta/uikit/Card";
import { formatDateEndOfDay, formatDateStartOfDay } from "../../utils/formatDate";
import { FaceregFilter } from "../../types/integration-mstroy-types";
import { authFaceReg, getFaceregData } from "../../services/IntegrationFaceReg";
import { Loader } from "@consta/uikit/Loader";
// import { Gauge } from '@consta/charts/Gauge';

interface PointTestsModalProps {
        id: number | null;
        GUID: string | null;
        setGUID: React.Dispatch<React.SetStateAction<string | null>>;
        setId: React.Dispatch<React.SetStateAction<number | null>>;
        isOpen: boolean;
        setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
        name: string | null;
        setName: React.Dispatch<React.SetStateAction<string | null>>;
    }

const PointTestsModal = ({id, GUID, setGUID, setId, isOpen, setIsOpen, name, setName} : PointTestsModalProps) => {

const [dataMoth, setDataMonth] = useState<Test[]>([])

const getDateDDMMHHMM = (isoTime: string): string => {
        const date = new Date(isoTime);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
        return `${day}.${month}, ${hours}:${minutes}`;
};

const closeModal = () => {
        setId(0);
        setGUID(null);
        setName(null);
        setIsOpen(false);
        setFaceregLoading(true);
}

const today = new Date();
const day = new Date();
day.setDate(day.getDate() - 30);

const [faceregFilter] = useState<FaceregFilter>(
        {
                created_at__gte: formatDateStartOfDay(day),
                created_at__lte: formatDateEndOfDay(today),
        }
);
interface FaceregData {
    createdAt: string;
    sum: number;
}
const [faceregLoading, setFaceregLoading] = useState<boolean>(true);

const [faceregData, setFaceregData] = useState<FaceregData[]>([]);

useEffect(() => {
        if (id && isOpen) {
                const getDataMonth = async () => {
                        try {
                                if (id) {
                                        await getTests(id, (resp) => {
                                                setDataMonth(resp.filter(el => (el.time !== null)).sort((a, b) => {
                                                        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
                                                        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
                                                        return Number(dateA) - Number(dateB);
                                                        }).map((item) => ({...item, time: item.time ?? '0',  updatedAt: getDateDDMMHHMM(item.updatedAt?.toString() ?? '')})));
                                        } )
                                }
                        } catch (error) {
                                console.log(error);
                        }
                }
                const getFRdata = async ()=> {
                       try {
                                if (GUID) {
                                        await authFaceReg({username: 'd.barbashin@avtoban.ru', password: 'kat-xy6-CVk-ziA'}).then(async () => {
                                                await getFaceregData(faceregFilter, GUID, (resp) => {
                                                const groupedData = resp.reduce((acc: Record<string, number>, item) => {
                                                        // Преобразуем дату
                                                        const date = new Date(item.createdAt);
                                                        
                                                        // Добавляем 3 часа
                                                        date.setHours(date.getHours() + 3);
                                                        
                                                        // Форматируем в ДД.ММ.ГГГГ, ЧЧ
                                                        const dateKey = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}`;
                                                        
                                                        // Считаем количество элементов для каждой даты
                                                        acc[dateKey] = (acc[dateKey] || 0) + 1;
                                                        return acc;
                                                }, {});

                                                // Преобразуем объект в массив нужного формата
                                                const formattedData = Object.entries(groupedData).map(([createdAt, sum]) => ({
                                                        createdAt,
                                                        sum
                                                }));

                                                // Сортируем по дате (от старых к новым)
                                                formattedData.sort((a, b) => {
                                                        const dateA = new Date(a.createdAt.replace(/(\d{2}).(\d{2}).(\d{4}), (\d{2})/, '$3-$2-$1T$4:00'));
                                                        const dateB = new Date(b.createdAt.replace(/(\d{2}).(\d{2}).(\d{4}), (\d{2})/, '$3-$2-$1T$4:00'));
                                                        return dateA.getTime() - dateB.getTime();
                                                });

                                                setFaceregData(formattedData);
                                                setFaceregLoading(false);
                                                });
                                        })
                                        
                                }
                        } catch (error) {
                                console.log(error);
                        } 
                }
                void getDataMonth();
                void getFRdata();

        }
}, [GUID, faceregFilter, id, isOpen])




        return (
                <Modal
                        style={{width: '80vw'}}
                        isOpen={isOpen}
                >

                        <Layout direction="column" className={cnMixSpace({p:'m', pT:'s'})} style={{width: '100%'}}>
                                <Layout direction="row" style={{justifyContent: 'space-between'}} className={cnMixSpace({mB:'l'})}>
                                        <Layout direction="row" style={{alignItems: 'center'}}>
                                                <LineChartOutlined  className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'s'})} style={{color: 'var(--color-blue-ui)'}}/>
                                                <Text size="l" weight='semibold' style={{color: 'var(--color-blue-ui)'}}>{`Тест точки прохода ${name}`}</Text>
                                        </Layout>
                                        <Button
                                                size="s"
                                                className={cnMixSpace({mL:'m'})}
                                                iconLeft={AntIcon.asIconComponent(() => (
                                                        <CloseOutlined
                                                                className={cnMixFontSize('l')}
                                                        />
                                                ))}
                                                view="clear"
                                                onClick={()=>{closeModal()}}
                                        />
                                </Layout>
                                {/* <Card border className={cnMixSpace({mT:'xl', p:'l'})}>
                                        
                                        <Layout direction="row" style={{alignItems: 'center', justifyContent: 'left'}} className={cnMixSpace({mT:'xl', pH:'xl'})}>
                                                <Text size="m" className={cnMixSpace({mB:'s'})} >Скорость соединения</Text>
                                                <Layout direction="column" >
                                                        <Gauge 
                                                                {...options}
                                                                style={{minWidth: '250px', maxHeight: '100px'}}
                                                        />
                                                </Layout>
                                        </Layout>
                                </Card> */}
                               <Card border className={cnMixSpace({mT:'xl', p:'l'})}>
                                        <Text size="m" className={cnMixSpace({mB:'s'})}>Время запроса</Text>
                                        <Layout direction="row" style={{alignItems: 'center', justifyContent: 'space-between'}} >
                                                
                                                <Layout direction="column">
                                                        <Area 
                                                                data={dataMoth} 
                                                                xField="updatedAt" 
                                                                yField="time" 
                                                                style={{minWidth: '1000px', maxWidth: '1400px', maxHeight: '150px'}}
                                                                slider={{
                                                                        start: 0,
                                                                        end: 1
                                                                }}
                                                        />
                                                </Layout>
                                                
                                        </Layout>
                               </Card>
                               <Card border className={cnMixSpace({mT:'xl', p:'l'})}>
                                        <Text size="m" className={cnMixSpace({mB:'s'})}>Активность УЗ</Text>
                                        <Layout direction="row" style={{alignItems: 'center', justifyContent: 'space-between'}} >
                                                
                                                <Layout direction="column">
                                                        {!faceregLoading && (
                                                                <Area 
                                                                data={faceregData} 
                                                                xField="createdAt" 
                                                                yField="sum" 
                                                                style={{minWidth: '1000px',maxWidth: '1400px', maxHeight: '150px'}}
                                                                slider={{
                                                                        start: 0,
                                                                        end: 1
                                                                }}
                                                        />
                                                        )}
                                                        {faceregLoading && (
                                                                <Layout style={{minWidth: '1000px', maxWidth: '1400px', height: '150px', justifyContent: 'center', alignItems: 'center'}}>
                                                                        <Loader />
                                                                </Layout>
                                                                
                                                        )}
                                                </Layout>
                                                
                                        </Layout>
                               </Card>



                                <Layout direction="row" style={{justifyContent: 'right', alignItems: 'center'}} className={cnMixSpace({mT:'xl'})}>
                                        <Button
                                                size="s"
                                                label="Закрыть"
                                                view="secondary"
                                                onClick={()=> {
                                                        closeModal();
                                                }}
                                                className={cnMixSpace({mR: 'm'})}
                                        />
                                </Layout>
                        </Layout>
                </Modal>
        );
};
export default PointTestsModal;