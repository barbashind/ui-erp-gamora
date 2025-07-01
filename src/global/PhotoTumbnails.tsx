import { AntIcon } from '../utils/AntIcon';
import { cnMixFontSize } from '../utils/MixFontSize';
import { DeleteOutlined } from '@ant-design/icons';
import { Button } from '@consta/uikit/Button';
import { Checkbox } from '@consta/uikit/Checkbox';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import React from 'react';
import classes from './PhotoTumbnails.module.css'
import { LoftImage } from '#/types/loft-details-types';

interface PhotoThumbnailsProps {
    photos: LoftImage[];
    setPhotos: React.Dispatch<React.SetStateAction<LoftImage[]>>;
    isEdit: boolean;
    mainPhotoId: number | null;
    setMainPhotoId: React.Dispatch<React.SetStateAction<number | null>>;
    setMainPhoto: React.Dispatch<React.SetStateAction<LoftImage | undefined>>;
    setPhotoForDelete: React.Dispatch<React.SetStateAction<number[]>>;
}



const PhotoThumbnails = ({ photos, setPhotos, isEdit, setMainPhoto, mainPhotoId, setMainPhotoId, setPhotoForDelete } : PhotoThumbnailsProps) => {

    const handleDelete = (index: number, documentId: number | undefined) => {
        setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
        if (documentId) {
            setPhotoForDelete(prev => ([...prev, documentId]))
        }
        
    };

    return (
        <Layout direction='row' style={{flexWrap: 'wrap'}} className={cnMixSpace({mT:'m'})}>
            {photos.length > 0 && (
                <Layout direction='row' style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {photos.map((photo, index) => {
                        return (
                            <Layout 
                                key={index} 
                                style={{ 
                                    overflow: 'hidden', 
                                    borderRadius: '4px',
                                    backgroundImage: `url(${URL.createObjectURL(photo.image)})`,
                                    backgroundSize: 'cover', 
                                    backgroundPosition: 'center'
                                    }}
                                    onClick={()=>{
                                        setMainPhotoId(index);
                                        setMainPhoto(photo);
                                    }}
                                    className={(mainPhotoId === index) ? classes.ImageChecked : classes.Image}
                            >
                                {isEdit && (
                                    <Layout direction='row' style={{justifyContent: 'space-between', alignItems: 'flex-start', width: '100%'}} className={cnMixSpace({p:'m'})}>
                                         <Checkbox 
                                            onClick={() => {
                                                setMainPhotoId(index);
                                                setMainPhoto(photo);
                                            }} 
                                            checked={(mainPhotoId === index)}
                                            size="l" 
                                            className={cnMixSpace({mR:'m', mT:'xs'})}
                                        />
                                        <Button 
                                            iconLeft={AntIcon.asIconComponent(() => (
                                                            <DeleteOutlined
                                                                    className={cnMixFontSize('l')}
                                                            />
                                                    ))}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(index, photo?.documentId);
                                            }} 
                                            size="m" 
                                            view="primary"
                                            form='round'
                                            style={{backgroundColor: 'var(--color-red-400)'}}
                                        />
                                    </Layout>
                                )}

                            </Layout>
                        )}
                    )}
                </Layout>
            )}
        </Layout>
    );
};

export default PhotoThumbnails;