import { DragNDropField } from '@consta/uikit/DragNDropField';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { Text } from '@consta/uikit/Text';
import classes from './FileEmtyText.module.css';
import { PaperClipOutlined } from '@ant-design/icons';
import { cnMixFontSize } from '../utils/MixFontSize';
import { useRef } from 'react';
import { Loader } from '@consta/uikit/Loader';

interface ErrorText {
    fileName: string | undefined;
    error: string | undefined;
}

interface FileEmptyTextProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    isMultiple: boolean;
    callbackAfter: (files: File[]) => void;
    accept: string;
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
                style={{ padding: 0, height: 'fit-content', minHeight: '111px' }}
                multiple={props.isMultiple}
                onClick={(event) => {
                    if (event.currentTarget !== link.current) {
                        event.stopPropagation();
                        return undefined;
                    }
                }}
                onDropFiles={(items) => {
                    if (props.isMultiple) {
                        const copy: File[] = [];
                        copy.push(...items);
                        props.setFiles(copy);
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
                        props.setFiles(copy);
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
                            <>
                                <Text
                                    size="s"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginTop: '23px',
                                    }}
                                >
                                    Перетащите файлы или
                                    <div className={classes.link} ref={link}>
                                        <span
                                            onClick={openFileDialog}
                                            style={{
                                                color: 'var(--color-bg-link)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginLeft: 4,
                                            }}
                                        >
                                            загрузите{' '}
                                            <PaperClipOutlined
                                                className={cnMixFontSize('l')}
                                                style={{ marginLeft: 4 }}
                                            />
                                        </span>
                                    </div>
                                </Text>
                                <Text
                                    size="s"
                                    view="secondary"
                                    weight="regular"
                                    className={cnMixSpace({
                                        mT: 'm',
                                    })}
                                    align="center"
                                >
                                    {props.accept}
                                </Text>
                                {props.fileMaxSize && (
                                    <Text
                                        size="s"
                                        view="secondary"
                                        weight="regular"
                                        className={cnMixSpace({
                                            mB: 'm',
                                        })}
                                    >
                                        Максимальный размер файла: 20 Мб
                                    </Text>
                                )}
                            </>
                        )}
                    </>
                )}
            </DragNDropField>
        </div>
    );
};

export default FileEmptyText;
