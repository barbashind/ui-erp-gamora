import { Button } from "@consta/uikit/Button";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { Card } from "@consta/uikit/Card";
import { Select } from "@consta/uikit/Select";
import { useEffect, useState } from "react";
import { createLoft, getLoftById, getLoftTypes, updateLoft, updateLoftStatus } from "../../services/LoftManagmentService";
import { TextField } from "@consta/uikit/TextField";
import { Loft } from "../../types/loft-details-types";
import { useLocation, useNavigate } from "react-router-dom";
import { CodeText } from "../../types/common-types";
import { ErrorResponse } from "../../services/utils";
import { Loader } from "@consta/uikit/Loader";
import { AntIcon } from "../../utils/AntIcon";
import { CloseOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import { concatUrl } from "../../utils/urlUtils";
import { routeTarget } from "../../routers/routes";

const LoftManagment = () => {

                const defaultData: Loft = {
                        loftId: undefined,
                        companyId: undefined,
                        name: null,
                        address: null,
                        size: null,
                        guestCountMax: null,
                        valid: false,
                        createdAt: null,
                        updatedAt: null,
                        typeText: null,
                        type: null,
                        loftDescription: null,
                }

                const navigate = useNavigate();
        
                const [data, setData] = useState<Loft>(defaultData)
                const [isEdit, setIsEdit] = useState<boolean>(false)
                const [isLoading, setIsLoading] = useState<boolean>(true)
                const [loftTypes, setLoftTypes] = useState<CodeText[]>([])
                const [errors, setErrors] = useState<ErrorResponse | undefined>(undefined)
        
                const location = useLocation();
        
                // Инициализация данных
                useEffect(() => {
                        const parth = location.pathname.split('/');
                        const loftId = parth[location.pathname.split('/').length - 2];
                        if (loftId === 'new') {
                                setIsLoading(false);
                                setIsEdit(true);
                        } else {
                                setIsLoading(true);
                                setIsEdit(false);
                                const getLoftData = async () => {
                                        await getLoftById(Number(loftId), (resp) => {
                                                setData(resp);
                                                setIsLoading(false);
                                        })
                                }
                                void getLoftData();
                        }
                        const getLoftTypesData = async () => {
                                await getLoftTypes((resp)=>{
                                        setLoftTypes(resp);
                                })
                        }
                        void getLoftTypesData();
        
                }, [location])
        
                const createLoftData = async () => {
                      try {
                                
                                await createLoft(data).then(async (resp) => {
                                        setData(resp);
                                        setIsLoading(false);
                                        setIsEdit(false);
                                        navigate(concatUrl([routeTarget.main, `loft-details/${resp.loftId}`, routeTarget.commonData]));
                                        await updateLoftStatus(Number(resp.loftId), {
                                                commonData: true,
                                                mediaData: false,
                                                timepriceData: false,
                                                equipmentData: false,
                                                serviceData: false,
                                                valid: false
                                        })
                                })
                      }  catch (error: unknown) {
                            if (error instanceof ErrorResponse) {
                                setErrors(error);
                            }
                            setIsLoading(false);
                      }
                }
        
                const updateLoftData = async () => {
                      try {
                                await updateLoft(Number(data.loftId), data).then(async (resp) => {
                                        setData(resp);
                                        setIsLoading(false);
                                        setIsEdit(false);
                                        await updateLoftStatus(Number(resp.loftId), {
                                                commonData: true,
                                        })
                                })
                      }  catch (error: unknown) {
                            if (error instanceof ErrorResponse) {
                                setErrors(error);
                            }
                            setIsLoading(false);
                      }
                }



        return (
                <Card border style={{border: '1px solid var(--color-gray-200)'}} className={cnMixSpace({pH:'m', pV:'s', mT:'l', mR:'l'})}>
                        {!isLoading && (
                                <Layout direction="column">
                                        <Text size="s" className={cnMixSpace({mB:'2xs', mT:'m'})}>Наименование помещения:</Text>
                                        <TextField
                                                value={data.name}
                                                placeholder="Введите наименование помещения"
                                                onChange={(value) => {setData((prev)=> ({...prev, name: value}))}}
                                                size="s"
                                                type="textarea"
                                                maxRows={2}
                                                disabled={!isEdit}
                                                caption={errors?.response.details?.find(item => item.field === 'name') ?  errors?.response.details?.find(item => item.field === 'name')?.message : undefined}
                                                status={errors?.response.details?.find(item => item.field === 'name') ?  'alert' : undefined}
                                                onFocus={() => {
                                                        setErrors(
                                                                (prev) => (prev ?
                                                                        {
                                                                                ...prev, 
                                                                                response: {
                                                                                        ...prev.response,
                                                                                        timestamp:  prev.response.timestamp ?? '',
                                                                                        details: prev?.response?.details?.filter(item => item.field !== 'name'),
                                                                                },
                                                                                
                                                                        } : undefined
                                                                ))
                                                        }}
                                        />
                                        <Text size="s" className={cnMixSpace({mB:'2xs', mT:'s'})}>Адрес помещения:</Text>
                                        <TextField
                                                placeholder="Введите адрес помещения"
                                                value={data.address}
                                                onChange={(value) => {setData((prev)=> ({...prev, address: value}))}}
                                                size="s"
                                                disabled={!isEdit}
                                                caption={errors?.response.details?.find(item => item.field === 'address') ?  errors?.response.details?.find(item => item.field === 'address')?.message : undefined}
                                                status={errors?.response.details?.find(item => item.field === 'address') ?  'alert' : undefined}
                                                onFocus={() => {
                                                        setErrors(
                                                                (prev) => (prev ?
                                                                        {
                                                                                ...prev, 
                                                                                response: {
                                                                                        ...prev.response,
                                                                                        timestamp:  prev.response.timestamp ?? '',
                                                                                        details: prev?.response?.details?.filter(item => item.field !== 'address'),
                                                                                },
                                                                                
                                                                        } : undefined
                                                                ))
                                                        }}
                                                rightSide={() => (isEdit ? 
                                                        <Button 
                                                                view="clear"
                                                                label={'Указать на карте'}
                                                                onClick={()=>{}}
                                                                size="s"
                                                        /> 
                                                        : <></>
                                                )}
                                        />
                                        <Layout direction="row" style={{flexWrap: 'wrap'}}>
                                                <Layout direction="column" flex={2} className={cnMixSpace({mR:'m'})} style={{minWidth:'240px'}}>
                                                        <Text size="s" className={cnMixSpace({mB:'2xs', mT:'s'})}>Тип помещения:</Text>
                                                        <Select
                                                                items={loftTypes}
                                                                placeholder="Выберите тип помещения"
                                                                value={data.type ? loftTypes?.find(item => (item.code === data.type)) : null}
                                                                getItemKey={item => item.code}
                                                                getItemLabel={item => item.text ?? ''}
                                                                onChange={(value) => {
                                                                        if (value) {
                                                                        setData((prev) => ({
                                                                                        ...prev, 
                                                                                        type: value?.code.toString(),
                                                                                        typeText: value?.text
                                                                                })) 
                                                                        } else {
                                                                        setData((prev) => ({
                                                                                        ...prev, 
                                                                                        type: null,
                                                                                        typeText: null
                                                                                }))  
                                                                        }
                                                                        
                                                                }}  
                                                                size="s"   
                                                                disabled={!isEdit}
                                                                caption={errors?.response.details?.find(item => item.field === 'type') ?  errors?.response.details?.find(item => item.field === 'type')?.message : undefined}
                                                                status={errors?.response.details?.find(item => item.field === 'type') ?  'alert' : undefined}
                                                                onFocus={() => {
                                                                        setErrors(
                                                                                (prev) => (prev ?
                                                                                        {
                                                                                                ...prev, 
                                                                                                response: {
                                                                                                        ...prev.response,
                                                                                                        timestamp:  prev.response.timestamp ?? '',
                                                                                                        details: prev?.response?.details?.filter(item => item.field !== 'type'),
                                                                                                },
                                                                                                
                                                                                        } : undefined
                                                                                ))
                                                                        }} 
                                                        />
                                                </Layout>
                                                <Layout direction="column" flex={1} className={cnMixSpace({mR:'m'})} style={{minWidth:'220px'}}>
                                                        <Text size="s" className={cnMixSpace({mB:'2xs', mT:'s'})}>Макс. число гостей:</Text>
                                                        <TextField
                                                                value={data.guestCountMax?.toString()}
                                                                onChange={(value) => {setData((prev)=> ({...prev, guestCountMax: Number(value)}))}}
                                                                size="s"
                                                                placeholder="Укажите макс. кол-во гостей"
                                                                type="number"
                                                                incrementButtons={false}
                                                                min={0}
                                                                disabled={!isEdit}
                                                                caption={errors?.response.details?.find(item => item.field === 'guestCountMax') ?  errors?.response.details?.find(item => item.field === 'guestCountMax')?.message : undefined}
                                                                status={errors?.response.details?.find(item => item.field === 'guestCountMax') ?  'alert' : undefined}
                                                                onFocus={() => {
                                                                        setErrors(
                                                                                (prev) => (prev ?
                                                                                        {
                                                                                                ...prev, 
                                                                                                response: {
                                                                                                        ...prev.response,
                                                                                                        timestamp:  prev.response.timestamp ?? '',
                                                                                                        details: prev?.response?.details?.filter(item => item.field !== 'guestCountMax'),
                                                                                                },
                                                                                                
                                                                                        } : undefined
                                                                                ))
                                                                        }} 
                                                        />
                                                </Layout>
                                                <Layout direction="column" flex={1} style={{minWidth:'150px'}}>
                                                        <Text size="s" className={cnMixSpace({mB:'2xs', mT:'s'})}>Площадь помещения:</Text>
                                                        <TextField
                                                                value={data.size?.toString()}
                                                                onChange={(value) => {setData((prev)=> ({...prev, size: Number(value)}))}}
                                                                size="s"
                                                                min={0}
                                                                placeholder="0 кв.м"
                                                                type="number"
                                                                incrementButtons={false}
                                                                disabled={!isEdit}
                                                                caption={errors?.response.details?.find(item => item.field === 'size') ?  errors?.response.details?.find(item => item.field === 'size')?.message : undefined}
                                                                status={errors?.response.details?.find(item => item.field === 'size') ?  'alert' : undefined}
                                                                onFocus={() => {
                                                                        setErrors(
                                                                                (prev) => (prev ?
                                                                                        {
                                                                                                ...prev, 
                                                                                                response: {
                                                                                                        ...prev.response,
                                                                                                        timestamp:  prev.response.timestamp ?? '',
                                                                                                        details: prev?.response?.details?.filter(item => item.field !== 'size'),
                                                                                                },
                                                                                                
                                                                                        } : undefined
                                                                                ))
                                                                        }} 
                                                        />
                                                </Layout>
                                        </Layout>
                                        <Text size="s" className={cnMixSpace({mB:'2xs', mT:'m'})}>Описание помещения:</Text>
                                        <TextField
                                                value={data.loftDescription}
                                                placeholder="Введите описание помещения"
                                                onChange={(value) => {setData((prev)=> ({...prev, loftDescription: value}))}}
                                                size="s"
                                                type="textarea"
                                                rows={3}
                                                disabled={!isEdit}
                                                caption={errors?.response.details?.find(item => item.field === 'loftDescription') ?  errors?.response.details?.find(item => item.field === 'loftDescription')?.message : undefined}
                                                status={errors?.response.details?.find(item => item.field === 'loftDescription') ?  'alert' : undefined}
                                                onFocus={() => {
                                                        setErrors(
                                                                (prev) => (prev ?
                                                                        {
                                                                                ...prev, 
                                                                                response: {
                                                                                        ...prev.response,
                                                                                        timestamp:  prev.response.timestamp ?? '',
                                                                                        details: prev?.response?.details?.filter(item => item.field !== 'loftDescription'),
                                                                                },
                                                                                
                                                                        } : undefined
                                                                ))
                                                        }}
                                        />
                                        {!isLoading && isEdit && (
                                                        <Layout direction="row" style={{alignItems:'center', justifyContent: 'left'}} className={cnMixSpace({mT:'l'})}>
                                                                <Button
                                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                                <SaveOutlined
                                                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                />
                                                                        ))}
                                                                        label={'Сохранить'}
                                                                        onClick={()=>{
                                                                                setIsLoading(true);
                                                                                if (data.loftId) {
                                                                                        updateLoftData();
                                                                                } else {
                                                                                        createLoftData();
                                                                                }
                                                                        }}
                                                                        size="s"
                                                                        className={cnMixSpace({mR:'m'})}
                                                                />
                                                                {data.loftId  && (
                                                                        <Button
                                                                                iconLeft={AntIcon.asIconComponent(() => (
                                                                                        <CloseOutlined
                                                                                                className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                        />
                                                                                ))}
                                                                                label={'Отменить изменения'}
                                                                                onClick={()=>{
                                                                                        setIsLoading(true);
                                                                                        setIsEdit(false);
                                                                                        const getLoftData = async () => {
                                                                                                await getLoftById(Number(data.loftId), (resp) => {
                                                                                                        setData(resp);
                                                                                                        setIsLoading(false);
                                                                                                })
                                                                                        }
                                                                                        void getLoftData();
                                                                                }}
                                                                                size="s"
                                                                                view="secondary"
                                                                        />
                                                                )}
                                                        </Layout>
                                                )}
                                                {!isEdit && (
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
                        )}
                        {isLoading && (
                                <Layout direction="row" style={{width: '100%', minWidth: '50vw', height: '50vh', alignItems: 'center', justifyContent: 'center'}}>
                                        <Loader size="m"/>
                                </Layout>
                        )}

                </Card>
                        
        )
}
export default LoftManagment;