import { useLocation, useNavigate } from "react-router-dom";
import { routeTarget } from "../routers/routes";
import { AntIcon } from "../utils/AntIcon";
import { cnMixFontSize } from "../utils/MixFontSize";
import { concatUrl } from "../utils/urlUtils";
import { CloseOutlined, EditOutlined, HomeOutlined, PlusSquareOutlined, SaveOutlined } from "@ant-design/icons";
import { Button } from "@consta/uikit/Button";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { Card } from "@consta/uikit/Card";
import { Select } from "@consta/uikit/Select";
import { Loft } from "../types/lofts-managment-types";
import { useEffect, useState } from "react";
import { CodeText } from "../types/common-types";
import { createLoft, getImage, getLoftById, getLoftImages, getLoftTypes, updateLoft, uploadImageFile } from "../services/LoftManagment";
import { TextField } from "@consta/uikit/TextField";
import FileEmptyText from "../global/FileEmptyText";
import PhotoThumbnails from "../global/PhotoTumbnails";
import { ErrorResponse } from "../services/utils";
import { Loader } from "@consta/uikit/Loader";

interface ErrorText {
    fileName: string | undefined;
    error: string | undefined;
}

const LoftDetailsPage = () => {

        const navigate = useNavigate();

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
                type: null
        }

        const [data, setData] = useState<Loft>(defaultData)
        const [photo, setPhoto] = useState<File[]>([])
        // const [photoInfo, setPhotoInfo] = useState<FileInfo[]>([])
        const [photoError, setPhotoError] = useState<ErrorText[]>([])
        const [photoIsLoading, setPhotoIsLoading] = useState<boolean>(false)
        const [isEdit, setIsEdit] = useState<boolean>(false)
        const [isLoading, setIsLoading] = useState<boolean>(true)
        const [loftTypes, setLoftTypes] = useState<CodeText[]>([])
        const [errors, setErrors] = useState<ErrorResponse | undefined>(undefined)

        const location = useLocation();

        // Инициализация данных
        useEffect(() => {
                const parth = location.pathname.split('/');
                const loftId = parth[location.pathname.split('/').length - 1];
                if (loftId === 'new') {
                        setIsLoading(false);
                        setIsEdit(true);
                } else {
                        setIsLoading(true);
                        setPhotoIsLoading(true);
                        setIsEdit(false);
                        const getLoftData = async () => {
                                await getLoftById(Number(loftId), (resp) => {
                                        setData(resp);
                                        setIsLoading(false);
                                })
                        }
                        const getLoftImagesData = async () => {
                                await getLoftImages(Number(loftId), async (resp) => {
                                        if (resp && resp.length > 0) {
                                                await Promise.all(
                                                        resp.map(async (elem) => {
                                                                getImage(elem.documentId).then((response)=> {
                                                                        setPhoto((prev) => ([...prev, response]));
                                                                }
                                                                )
                                                        })
                                                )
                                        }  
                                })
                        }
                        void getLoftData();
                        void getLoftImagesData();
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
                        
                        await createLoft(data).then((resp) => {
                                setData(resp);
                                setIsLoading(false);
                                setIsEdit(false);
                                photo.map( async (elem) => {
                                        await uploadImageFile(Number(resp.loftId), elem)
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
                        await updateLoft(Number(data.loftId), data).then((resp) => {
                                setData(resp);
                                setIsLoading(false);
                        })
              }  catch (error: unknown) {
                    if (error instanceof ErrorResponse) {
                        setErrors(error);
                    }
                    setIsLoading(false);
              }
        }

        


        return (
                <Layout direction="column" style={{width: '100%'}}>
                        <Layout 
                                direction="row" 
                                style={{justifyContent:'left', alignItems:'center'}}
                                className={cnMixSpace({pL:'2xl', pR:'4xl', pV:'m'})}
                        >
                                <Button
                                        view="clear"
                                        label={'Вернуться к списку помещений'}
                                        size="s"
                                        onClick={()=>{
                                                navigate(concatUrl([routeTarget.main, routeTarget.loftsManadgment]));
                                        }}
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                <HomeOutlined
                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs', mB:'2xs'})}
                                                />
                                        ))}
                                />
                                
                        </Layout>
                        <Layout 
                                direction='row' 
                                style={{ 
                                        minHeight: 'calc(100vh - 138px)', 
                                        maxHeight: 'calc(100vh - 138px)', 
                                        gap: '32px', 
                                        paddingRight: '32px', 
                                        paddingLeft: '32px', 
                                        paddingBottom: '32px', 
                                        flexWrap: 'wrap',
                                        width: '100%',
                                        minWidth: '300px'
                                }}
                        >
                                <Card 
                                        style={{ 
                                                backgroundColor: 'var(--color-bg-default)', 
                                                width: '100%',
                                                flex: 1,
                                        }} 
                                        className={cnMixSpace({pL:'l', pT:'l', pR:'m', pB:'m'})}
                                >
                                        <Layout direction="row" style={{alignItems:'center'}} >
                                                <PlusSquareOutlined style={{ fontSize: '2em', color: 'var(--color-blue-ui)'}} />
                                                <Text size="xl" weight='semibold' style={{color: 'var(--color-blue-ui)'}} className={cnMixSpace({mL:'m'})} >Добавление помещения</Text>
                                        </Layout>
                                        {!isLoading && (
                                                <Layout direction="row" style={{flexWrap: 'wrap'}}>
                                                        <Card border style={{border: '1px solid var(--color-gray-200)'}} className={cnMixSpace({pH:'m', pV:'s', mT:'l', mR:'l'})}>
                                                                <Layout direction="column">
                                                                        <Text size="m" weight="semibold" view="secondary">Общие данные</Text>
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
                                                                </Layout>
                                                        </Card>
                                                        {isEdit && !isLoading && (
                                                                <Card border style={{border: '1px solid var(--color-gray-200)', flex: 1}} className={cnMixSpace({pH:'m', pV:'s', mT:'l', mR:'l'})}>
                                                                        <Text size="m" weight="semibold" view="secondary">Фото помещения</Text>
                                                                        <Text size="s" className={cnMixSpace({mB:'2xs', mT:'m'})} style={{minWidth:'295px'}}>Загрузите фото помещения:</Text>
                                                                        <FileEmptyText
                                                                                files={photo}
                                                                                setFiles={setPhoto}
                                                                                isMultiple={true}
                                                                                callbackAfter={(files) => {setPhoto(files)}}
                                                                                fileMaxSize={true}
                                                                                setErrorText={setPhotoError}
                                                                                isLoading={photoIsLoading}
                                                                        />  
                                                                        {photoError && photoError.length > 0 && photoError.map((error) => (
                                                                                <Text size="xs" view='alert' className={cnMixSpace({mT:'s'})}>{error.error + ' - ' + error.fileName}</Text>
                                                                        ))}
                                                                        <PhotoThumbnails photos={photo} setPhotos={setPhoto} isEdit={isEdit} />
                                                                </Card>
                                                        )}
                                                        {!isEdit && !isLoading &&  (
                                                                <Card border style={{border: '1px solid var(--color-gray-200)', flex: 1}} className={cnMixSpace({pH:'m', pV:'s', mT:'l', mR:'l'})}>
                                                                        <Text size="m" weight="semibold" view="secondary" onClick={()=> console.log(photo)}>Фото помещения</Text>
                                                                        <PhotoThumbnails photos={photo} setPhotos={setPhoto} isEdit={isEdit} />
                                                                </Card>
                                                        )}
                                                        
                                                </Layout>        
                                        )}
                                        
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
                                                        {data.loftId && (
                                                                <Button
                                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                                <CloseOutlined
                                                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                />
                                                                        ))}
                                                                        label={'Отменить изменения'}
                                                                        onClick={()=>{
                                                                                setIsLoading(true);
                                                                                setPhotoIsLoading(true);
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
                                        {!isLoading && !isEdit && (
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
                                        {isLoading && (
                                                <Layout direction="row" style={{width: '100%', height: '50vh', alignItems: 'center', justifyContent: 'center'}}>
                                                        <Loader size="m"/>
                                                </Layout>
                                        )}
                                </Card>
                        </Layout>
                        
                </Layout>
        );
};
export default LoftDetailsPage;