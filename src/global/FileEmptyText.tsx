import { DragNDropField } from '@consta/uikit/DragNDropField';
import { Text } from '@consta/uikit/Text';
import classes from './FileEmtyText.module.css';
import { useRef } from 'react';
import { Loader } from '@consta/uikit/Loader';
import { Layout } from '@consta/uikit/Layout';
import { LoftImage } from '#/types/loft-details-types';

interface ErrorText {
    fileName: string | undefined;
    error: string | undefined;
}

interface FileEmptyTextProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<LoftImage[]>>;
    isMultiple: boolean;
    callbackAfter: (files: File[]) => void;
    fileMaxSize: boolean;
    setErrorText: React.Dispatch<React.SetStateAction<ErrorText[]>>;
    isLoading?: boolean;
}

const FileEmptyText = (props: FileEmptyTextProps) => {
    const errSizeFile =
        'Файл превышает максимальный размер 20 Мб, уменьшите размер файла и загрузите его снова';
    const link = useRef<HTMLDivElement>(null);

    return (
        <div className={classes.fileDropArea} id="dropzone">
            <DragNDropField
                style={{ padding: 0, height: 'fit-content', minHeight: '100px', maxWidth: '250px' }}
                multiple={props.isMultiple}
                onClick={(event) => {
                    if (event.currentTarget !== link.current) {
                        event.stopPropagation();
                        return undefined;
                    }
                }}
                accept="image/*"
                onDropFiles={(items) => {
                    if (props.isMultiple) {
                        const copy: File[] = [];
                        copy.push(...items);
                        props.setFiles((prev) => ([...prev, ...copy.map((el) => ({documentId: undefined, image: el}))]));
                        props.callbackAfter(copy);
                        props.setErrorText([]);
                        for (const item of items) {
                            if (item.size > 20 * 1024 * 1024) {
                                props.setErrorText(errorText => [
                                    ...errorText,
                                    { fileName: items[0].name, error: errSizeFile },
                                ]);
                            }
                        }
                    } else {
                        const copy: File[] = [...props.files];
                        if (copy[0]) copy[0] = items[0];
                        else copy.push(...items);
                        props.setFiles([{documentId: undefined, image: copy[0]}]);
                        props.callbackAfter([items[0]]);
                        if (items[0].size > 20 * 1024 * 1024) {
                            props.setErrorText([]);
                            props.setErrorText(errorText => [
                                ...errorText,
                                { fileName: items[0].name, error: errSizeFile },
                            ]);
                        }
                    }
                }}
            >
                {({ openFileDialog }) => (
                    <>
                        {props.isLoading ? (
                            <Loader size="s" />
                        ) : (
                            <Layout direction='column'>
                                <Text
                                    size="s"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    Перетащите фото или
                                    
                                </Text>
                                <Text className={classes.link} ref={link} size="s">
                                        <span
                                            onClick={openFileDialog}
                                            style={{
                                                color: 'var(--color-bg-link)',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            нажмите для выбора{' '}
                                        </span>
                                </Text>
                            </Layout>
                        )}
                    </>
                )}
            </DragNDropField>
        </div>
    );
};

export default FileEmptyText;
