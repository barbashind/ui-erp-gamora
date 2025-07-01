import { useEffect, useState } from "react";

import { Text } from "@consta/uikit/Text";
import { cnMixSpace } from "@consta/uikit/MixSpace";

import { Card } from "@consta/uikit/Card";
import FileEmptyText from "../../global/FileEmptyText";
import { deleteImage, getImage, getLoftImages, updateLoftStatus, uploadImageFile, uploadMainImageFile } from "../../services/LoftManagmentService";
import { useLocation } from "react-router-dom";
import PhotoThumbnails from "../../global/PhotoTumbnails";
import { Layout } from "@consta/uikit/Layout";
import { Button } from "@consta/uikit/Button";
import { AntIcon } from "../../utils/AntIcon";
import { EditOutlined, SaveOutlined } from "@ant-design/icons";
import { cnMixFontSize } from "../../utils/MixFontSize";
import PhotosLine from "../../global/PhotosLine";
import { LoftImage } from "#/types/loft-details-types";

interface ErrorText {
    fileName: string | undefined;
    error: string | undefined;
}

const MediaManagment = () => {

        const [photo, setPhoto] = useState<LoftImage[]>([])
        const [photoForDelete, setPhotoForDelete] = useState<number[]>([])
        const [mainPhoto, setMainPhoto] = useState<LoftImage>()
        const [mainPhotoId, setMainPhotoId] = useState<number | null>(null)
        // const [photoInfo, setPhotoInfo] = useState<FileInfo[]>([])
        const [photoError, setPhotoError] = useState<ErrorText[]>([])
        const [photoIsLoading, setPhotoIsLoading] = useState<boolean>(false)
        const [isEdit, setIsEdit] = useState<boolean>(false)
        const [loftId, setLoftId] = useState<string | null>(null)
        const location = useLocation();

        useEffect(() => {
                setPhoto([]);
                setPhotoForDelete([]);
                const parth = location.pathname.split('/');
                const loftIdNum = parth[location.pathname.split('/').length - 2];
                setLoftId(parth[location.pathname.split('/').length - 2]);
                const getLoftImagesData = async () => {
                        try {
                                await getLoftImages(Number(loftIdNum), async (resp) => {
                                        if (resp && resp.length > 0) {
                                                const photoPromises = resp.map(async (elem) => {
                                                const image = await getImage(elem.documentId);
                                                        return { documentId: elem.documentId, image };
                                                        });

                                                const photos = await Promise.all(photoPromises); 
                                                setPhoto(photos); 
                                        }
                                })
                        } catch(error){
                                console.log(error);
                                setPhotoIsLoading(false);
                        }
                        
                }
                void getLoftImagesData();

        }, [location])
        
       const downloadData = async () => {
                try {
                        for (const elem of photo) {
                                if (!elem.documentId)
                                        await uploadImageFile(Number(loftId), elem.image).then(async () => {
                         await updateLoftStatus(Number(loftId), {
                                mediaData: true,
                        })
                });
                        }
                } catch (error) {
                        console.log(error);
                }
        };

        const downloadMainImageData = async () => {
        try {
                if (mainPhoto) {
                await uploadMainImageFile(Number(loftId), mainPhoto.image);
                }
        } catch (error) {
                console.log(error);
        }
        };

        const deleteImageData = async () => {
                try {
                        for (const elem of photoForDelete) {
                                await deleteImage(elem);
                        }
                } catch (error) {
                        console.log(error);
                }
        }

        return (
                        <Card border style={{border: '1px solid var(--color-gray-200)', flex: 1}} className={cnMixSpace({pH:'m', pV:'s', mT:'l', mR:'l'})}>
                                <Layout direction="column" >
                                        {isEdit && (
                                                <Layout direction="column">
                                                        <Text size="m" weight="semibold" view="secondary" className={cnMixSpace({mB:'2xs'})} style={{minWidth:'295px'}}>Загрузите фото помещения:</Text>
                                                        <FileEmptyText
                                                                files={photo.map(el => el.image)}
                                                                setFiles={setPhoto}
                                                                isMultiple={true}
                                                                callbackAfter={(files) => {
                                                                        setPhoto(prev => ([...prev, ...files.map(el => ({documentId: undefined, image: el}))]));
                                                                }}
                                                                fileMaxSize={true}
                                                                setErrorText={setPhotoError}
                                                                isLoading={photoIsLoading}
                                                        />  
                                                        {photoError && photoError.length > 0 && photoError.map((error) => (
                                                                <Text size="xs" view='alert' className={cnMixSpace({mT:'s'})}>{error.error + ' - ' + error.fileName}</Text>
                                                        ))}
                                                </Layout>
                                        )}
                                        
                                        {isEdit && photo && photo.length > 0 && (
                                                <Layout direction="column" className={cnMixSpace({mT:'xl'})}>
                                                        <Text size="m" weight="semibold" view="secondary">Выберите основное фото:</Text>
                                                        <PhotoThumbnails 
                                                                photos={photo} 
                                                                setMainPhoto={setMainPhoto} 
                                                                mainPhotoId={mainPhotoId} 
                                                                setMainPhotoId={setMainPhotoId} 
                                                                setPhotos={setPhoto}
                                                                setPhotoForDelete={setPhotoForDelete}
                                                                isEdit={isEdit}
                                                        />
                                                </Layout>
                                        )}
                                        {!isEdit && photo && photo.length > 0 && (
                                                <Layout direction="column" className={cnMixSpace({mT:'xl'})}>
                                                        <PhotosLine
                                                                photos={photo} 
                                                        />
                                                </Layout>
                                        )}
                                        
                                </Layout>
                               {isEdit && (
                                                        <Layout direction="row" style={{alignItems:'center', justifyContent: 'left'}} className={cnMixSpace({mT:'l'})}>
                                                                <Button
                                                                        iconLeft={AntIcon.asIconComponent(() => (
                                                                                <SaveOutlined
                                                                                        className={cnMixFontSize('m') + ' ' + cnMixSpace({mR:'xs'})}
                                                                                />
                                                                        ))}
                                                                        label={'Сохранить'}
                                                                        onClick={()=>{
                                                                              downloadData();
                                                                              downloadMainImageData();
                                                                              if (photoForDelete && photoForDelete.length > 0) {
                                                                                deleteImageData();
                                                                              }
                                                                              
                                                                              setPhotoIsLoading(true);
                                                                              setIsEdit(false);
                                                                        }}
                                                                        size="s"
                                                                        className={cnMixSpace({mR:'m'})}
                                                                        disabled={!mainPhoto}
                                                                />
                                                                
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
                        </Card>
        )
}
export default MediaManagment;