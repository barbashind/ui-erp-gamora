import { AntIcon } from '../utils/AntIcon';
import { cnMixFontSize } from '../utils/MixFontSize';
import { CloseOutlined } from '@ant-design/icons';
import { Button } from '@consta/uikit/Button';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Text } from '@consta/uikit/Text';
import React from 'react';

interface PhotoThumbnailsProps {
    photos: File[];
    setPhotos: React.Dispatch<React.SetStateAction<File[]>>;
    isEdit: boolean;
}



const PhotoThumbnails: React.FC<PhotoThumbnailsProps> = ({ photos, setPhotos, isEdit }) => {

    const handleDelete = (index: number) => {
        setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    };

    return (
        <Layout direction='row' style={{flexWrap: 'wrap'}} className={cnMixSpace({mT:'m'})}>
            {photos.length > 0 ? (
                <Layout direction='row' style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {photos.map((photo, index) => {
                        return (
                            <Layout key={index} style={{ width: '150px', height: '150px', overflow: 'hidden', borderRadius: '4px' }}>
                                <img
                                    src={URL.createObjectURL(photo)} // Если это объект File. Замените на нужный путь, если это URL
                                    alt={`Uploaded thumbnail ${index}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {isEdit && (
                                    <Button 
                                        iconLeft={AntIcon.asIconComponent(() => (
                                                        <CloseOutlined
                                                                className={cnMixFontSize('m')}
                                                        />
                                                ))}
                                        onClick={() => handleDelete(index)} 
                                        size="s" 
                                        view="primary"
                                        style={{marginLeft: '-42px', marginTop: '12px'}}
                                        form='round'
                                    />
                                )}
                                
                            </Layout>
                        )}
                    )}
                </Layout>
            ) : (
                <Text size="s" view="secondary">Нет загруженных фото</Text>
            )}
        </Layout>
    );
};

export default PhotoThumbnails;