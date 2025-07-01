import { LoftImage } from '#/types/loft-details-types';
import { AntIcon } from '../utils/AntIcon';
import { cnMixFontSize } from '../utils/MixFontSize';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button } from '@consta/uikit/Button';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { useState } from 'react';

interface PhotosLineProps {
    photos: LoftImage[];
}



const PhotosLine = ({ photos,  } : PhotosLineProps) => {

    const [activePhoto, setActivePhoto] = useState<number>(0)

    return (
        <Layout direction='column' className={cnMixSpace({mT:'m'})}>
            <Layout direction='row' style={{alignItems: 'center'}} className={cnMixSpace({mB:'xl'})}>
                <Button
                    iconLeft={AntIcon.asIconComponent(() => (
                            <LeftOutlined
                                    className={cnMixFontSize('l')}
                            />
                    ))}
                    onClick={()=>{
                        setActivePhoto((activePhoto - 1) < 0 ? (photos.length - 1) :  activePhoto - 1);
                    }}
                    className={cnMixSpace({mR:'m'})}
                    view='secondary'
                />
                <Layout 
                    style={{ 
                        overflow: 'hidden', 
                        borderRadius: '4px',
                        backgroundImage: `url(${URL.createObjectURL(photos[activePhoto].image)})`,
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        width: '350px',
                        height: '350px',
                        }}
                />
                <Button
                    iconLeft={AntIcon.asIconComponent(() => (
                            <RightOutlined
                                    className={cnMixFontSize('l')}
                            />
                    ))}
                    onClick={()=>{
                        setActivePhoto((activePhoto - 1) < 0 ? (photos.length - 1) :  activePhoto - 1);
                    }}
                    className={cnMixSpace({mL:'m'})}
                    view='secondary'

                />
            </Layout>
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
                                    backgroundPosition: 'center',
                                    width: '150px',
                                    height: '150px',
                                    cursor: 'pointer',
                                    }}
                                    onClick={()=>{
                                        setActivePhoto(index);
                                    }}
                                    
                            />
                        )}
                    )}
                </Layout>
            )}
        </Layout>
    );
};

export default PhotosLine;