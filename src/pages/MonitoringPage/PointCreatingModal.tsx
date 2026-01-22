import { AntIcon } from "../../utils/AntIcon";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { CloseOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { Button } from "@consta/uikit/Button";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { useEffect, useState } from "react";
import { Modal } from '@consta/uikit/Modal';
import { TextField } from "@consta/uikit/TextField";
import { Point } from "../../types/monitoring-types";
import { createPoint, deletePoint, getPoint, updatePoint } from "../../services/MonitoringService";
import { Checkbox } from "@consta/uikit/Checkbox";
import { IdStrLabel } from "../../utils/types";
import { Select } from "@consta/uikit/Select";

interface PointCreatingModalProps {
        id: number | null;
        setId: React.Dispatch<React.SetStateAction<number | null>>;
        isOpen: boolean;
        setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
        setUpdateFlag: React.Dispatch<React.SetStateAction<boolean>>;
    }

const PointCreatingModal = ({id, setId, isOpen, setIsOpen, setUpdateFlag} : PointCreatingModalProps) => {

const defaultData : Point = {
        pointId: undefined,
        name: null,
        login: null,
        object: null,
        place: null,
        responsible: null,
        responsibleObjNumber: null,
        responsibleObj: null,
        IPadress: null,
        status: 'WORK',
        comment: null,
        faceRegGUID: null,
        server: null,
        admPageLink: null,
        createdAt: null,
        updatedAt: null,
        connecting: 0,
        type: 'FR',
}

const [data, setData] = useState<Point>(defaultData)
const [isLoading, setIsLoading] = useState<boolean>(false)

const closeModal = () => {
        setData(defaultData);
        setId(null);
        setIsOpen(false);
        setIsLoading(false);
}

const createPointData = async () => {
        const body  =  {...data}
        try {
                await createPoint(body).then(() => {
                        closeModal();
                        setUpdateFlag(true);
                })
        } catch (error) {
                console.log(error);
        }
}

const updateData = async () => {
        try {
                if (id) {
                        await updatePoint(id, data).then(() => {
                                closeModal();
                                setUpdateFlag(true);
                        })
                }
        } catch (error) {
                console.log(error);
                setIsLoading(false);
        }
}

const deletePointData = async () => {
        try {
                if (id) {
                        await deletePoint(id).then(() => {
                                closeModal();
                                setUpdateFlag(true);
                        })
                }
        } catch (error) {
                console.log(error);
                setIsLoading(false);
        }
}


useEffect(() => {
        if (id && isOpen) {
                const getPointData = async () => {
                        await getPoint(id, (resp) => {
                                setData(resp);
                        })
                }
                void getPointData();
        }
}, [id, isOpen])

const types : IdStrLabel[] = [{id: 'FR', label: 'Точка прохода FR'}, {id: 'ST', label: 'Столовая'},{id: 'VS', label: 'Весовая'},]

        return (
                <Modal
                        style={{width: '80vh'}}
                        isOpen={isOpen}
                >

                        <Layout direction="column" className={cnMixSpace({p:'m', pT:'s'})} style={{width: '100%', maxWidth: '1000px'}}>
                                <Layout direction="row" style={{justifyContent: 'space-between'}} className={cnMixSpace({mB:'l'})}>
                                        <Layout direction="row" style={{alignItems: 'center'}}>
                                                <EditOutlined  className={cnMixFontSize('l') + ' ' + cnMixSpace({mR:'s'})} style={{color: 'var(--color-blue-ui)'}}/>
                                                <Text size="l" weight='semibold' style={{color: 'var(--color-blue-ui)'}}>{id ? `Устройство: ${data.name}` : 'Новое устройство'}</Text>
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
                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Наименование устр-ва:</Text>
                                <TextField
                                        value={data.name}
                                        onChange={(value) => {
                                                setData(prev => ({...prev, name: value}));
                                        }}
                                        size="s"
                                        placeholder="Введите наименование устр-ва"
                                        className={cnMixSpace({mB:'m'})}
                                        type="textarea"
                                        rows={3}
                                />
                                <Layout direction="row">
                                        <Layout direction="column" flex={1}>
                                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Логин:</Text>
                                                <TextField
                                                        value={data.login}
                                                        onChange={(value) => {
                                                                setData(prev => ({...prev, login: value}));
                                                        }}
                                                        size="s"
                                                        placeholder="Укажите логин"
                                                        className={cnMixSpace({mB:'m',})}
                                                        style={{maxWidth: '100%'}}
                                                />
                                        </Layout>
                                        <Layout direction="column" className={cnMixSpace({mL:'m'})} flex={1}>
                                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Местоположение:</Text>
                                                <TextField
                                                        value={data.place}
                                                        onChange={(value) => {
                                                                setData(prev => ({...prev, place: value}));
                                                        }}
                                                        size="s"
                                                        placeholder="Укажите местоположение"
                                                        className={cnMixSpace({mB:'m'})}
                                                        style={{maxWidth: '100%'}}
                                                />
                                        </Layout>
                                </Layout>
                                
                                
                                
                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Объект строительства:</Text>
                                <TextField
                                        value={data.object}
                                        onChange={(value) => {
                                                setData(prev => ({...prev, object: value}));
                                        }}
                                        size="s"
                                        placeholder="Введите объект строительства"
                                        className={cnMixSpace({mB:'m'})}
                                        type="textarea"
                                        rows={2}
                                />
                                <Layout direction="row">
                                        {/* <Layout direction="column" flex={1}>
                                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Ответственный от ИТ:</Text>
                                                <TextField
                                                        value={data.responsible}
                                                        onChange={(value) => {
                                                                setData(prev => ({...prev, responsible: value}));
                                                        }}
                                                        size="s"
                                                        placeholder="Укажите ответственного от ИТ"
                                                        className={cnMixSpace({mB:'m'})}
                                                        style={{maxWidth: '100%'}}
                                                />
                                        </Layout> */}
                                        <Layout direction="column" flex={1} >
                                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Ответственный:</Text>
                                                <TextField
                                                        value={data.responsibleObj}
                                                        onChange={(value) => {
                                                                setData(prev => ({...prev, responsibleObj: value}));
                                                        }}
                                                        size="s"
                                                        placeholder="Укажите ответственного"
                                                        className={cnMixSpace({mB:'m'})}
                                                        style={{maxWidth: '100%'}}
                                                />
                                        </Layout>
                                        <Layout direction="column" flex={1} className={cnMixSpace({mL:'m'})}>
                                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Телефон ответственного:</Text>
                                                <TextField
                                                        value={data.responsibleObjNumber}
                                                        onChange={(value) => {
                                                                setData(prev => ({...prev, responsibleObjNumber: value}));
                                                        }}
                                                        size="s"
                                                        placeholder="Укажите конт. номер"
                                                        className={cnMixSpace({mB:'m'})}
                                                        style={{maxWidth: '100%'}}
                                                />
                                        </Layout>
                                </Layout>
                                <Layout direction="row">
                                        <Layout direction="column" flex={1}>
                                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Внутренний IP:</Text>
                                                <TextField
                                                        value={data.IPadress}
                                                        onChange={(value) => {
                                                                setData(prev => ({...prev, IPadress: value}));
                                                        }}
                                                        size="s"
                                                        placeholder="Укажите внутренний IP"
                                                        className={cnMixSpace({mB:'m'})}
                                                        style={{maxWidth: '100%'}}
                                                />
                                        </Layout>
                                        <Layout direction="column" flex={1} className={cnMixSpace({mL:'m'})}>
                                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Тип точки:</Text>
                                                <Select
                                                        items={types}
                                                        value={types.find(el => (el.id === data.type))}
                                                        onChange={(value) => {
                                                                if (value) {
                                                                        setData(prev => ({...prev, type: value.id}));
                                                                } else {
                                                                        setData(prev => ({...prev, type: null}));
                                                                }
                                                        }}
                                                        getItemKey={(item : IdStrLabel) => item.id}
                                                        getItemLabel={(item : IdStrLabel) => item.label}
                                                        size="s"
                                                        placeholder="Укажите тип"
                                                        className={cnMixSpace({mB:'m'})}
                                                        style={{maxWidth: '100%'}}
                                                />
                                        </Layout>
                                </Layout>
                                <Layout direction="row">
                                        <Layout direction="column" flex={1}>
                                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>GUID:</Text>
                                                <TextField
                                                        value={data.faceRegGUID}
                                                        onChange={(value) => {
                                                                setData(prev => ({...prev, faceRegGUID: value}));
                                                        }}
                                                        size="s"
                                                        placeholder="Укажите GUID"
                                                        className={cnMixSpace({mB:'m'})}
                                                        style={{maxWidth: '100%'}}
                                                />
                                        </Layout>
                                </Layout>
                                

                                <Layout direction="row" style={{justifyContent: 'left', alignItems: 'center'}} className={cnMixSpace({mV:'s'})}>
                                        <Checkbox 
                                                checked={data.status === 'NOT_WORK'} 
                                                onChange={()=>{
                                                        setData(prev => ({...prev, status: data.status === 'NOT_WORK' ? 'WORK' : 'NOT_WORK'}));
                                                }}
                                                size="s"
                                        />
                                        <Text size="s" className={cnMixSpace({mL:'2xs'})}>Не работает</Text>
                                </Layout>
                                <Text size="s" className={cnMixSpace({mB:'2xs'})}>Комментарий:</Text>
                                <TextField
                                        value={data.comment}
                                        onChange={(value) => {
                                                setData(prev => ({...prev, comment: value}));
                                        }}
                                        size="s"
                                        placeholder="Введите наименование комментарий"
                                        className={cnMixSpace({mB:'m'})}
                                        type="textarea"
                                        rows={3}
                                />

                                
                                
                                <Layout direction="row" style={{justifyContent: 'right', alignItems: 'center'}}>
                                        <Button
                                                size="s"
                                                label="Закрыть"
                                                view="secondary"
                                                onClick={()=> {
                                                        closeModal();
                                                }}
                                                className={cnMixSpace({mR: 'm'})}
                                        />
                                        <Button
                                                size="s"
                                                label="Удалить"
                                                iconLeft={AntIcon.asIconComponent(() => (
                                                        <DeleteOutlined
                                                                className={cnMixFontSize('l') + ' ' + cnMixSpace({mR: '2xs'})}
                                                        />
                                                ))}
                                                onClick={()=> {
                                                        if (!id) {
                                                                setIsLoading(true);
                                                                deletePointData();
                                                        } else {
                                                                setIsLoading(true);
                                                                updateData();
                                                        }
                                                }}
                                                loading={isLoading}
                                                style={{backgroundColor: 'red'}}
                                                className={cnMixSpace({mR: 'm'})}
                                        />
                                        <Button
                                                size="s"
                                                label="Сохранить"
                                                iconLeft={AntIcon.asIconComponent(() => (
                                                        <SaveOutlined
                                                                className={cnMixFontSize('l') + ' ' + cnMixSpace({mR: '2xs'})}
                                                        />
                                                ))}
                                                onClick={()=> {
                                                        if (!id) {
                                                                setIsLoading(true);
                                                                createPointData();
                                                        } else {
                                                                setIsLoading(true);
                                                                updateData();
                                                        }
                                                }}
                                                loading={isLoading}
                                        />
                                </Layout>
                        </Layout>
                </Modal>
        );
};
export default PointCreatingModal;
