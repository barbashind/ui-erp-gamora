import './Pagination.css';
import classNames from 'classnames';
import { cn } from '@bem-react/classname';
import { CSSProperties, ReactElement, ReactNode, useEffect, useState } from 'react';
import { Layout } from '@consta/uikit/Layout';
import { cnMixSpace } from '@consta/uikit/MixSpace';
import { IconArrowRight } from '@consta/icons/IconArrowRight';
import { IconArrowLeft } from '@consta/icons/IconArrowLeft';
import { Select } from '@consta/uikit/Select';
import { getPagesArrayByVisibleCount } from '@consta/uikit/__internal__/src/components/Pagination/helpers';
import { Button } from '@consta/uikit/Button';
import { Text } from '@consta/uikit/Text';

export const PAGE_SIZE_DEFAULT = 10;
const PAGE_SIZE_VARIANTS = [8, PAGE_SIZE_DEFAULT, 15, 20, 25];

const cnPagination = cn('Pagination');

export interface PaginationBaseProps {
    /**
     * Дополнительные CSS-классы
     */
    className?: string;
    /**
     * Дополнительные стили
     */
    style?: CSSProperties;
    /**
     * Текщий номер страницы
     */
    value: number;
    /**
     * Обработчик изменения страницы
     * @param page Новый номер страницы
     */
    onChange?: (page: number) => void;
    /**
     * Всего страниц
     */
    items: number;
    /**
     * Количество отображаемых элементов
     * @default 7
     */
    visibleCount?: number;
}

/**
 * Параметры компонента
 */
export type PaginationProps = PaginationBaseProps &
    {
        /**
         * Размер
         * @default "s"
         */
        size?: 's';
        /**
         * Количество записей на странице
         */
        pageSize?: number;
        /**
         * Обработчик изменения количества записей на странице
         * @param pageSize Новое количество записей
         */
        onChangePageSize?: (pageSize: number) => void;
        /**
         * Варианты выбора страниц
         * @default 8, 10, 15
         */
        pageSizeVariants?: number[];
        /**
         * Легенда справа от выбора страниц
         */
        legendRight?: ReactElement | ReactNode;
    };

const PaginationInner = (props: PaginationBaseProps) => {
    const pages = getPagesArrayByVisibleCount(props.value + 1, props.items, props.visibleCount ?? 7, true, true);

    return (
        <nav
            style={props.style}
            className={classNames(cnPagination('ButtonContainer'), props.className)}
        >
            <Button
                label="Предыдущая"
                iconLeft={IconArrowLeft}
                view="clear"
                disabled={props.value === 0}
                onClick={() => {
                    props.onChange?.(props.value - 1);
                }}
                size="s"
            />
            <div
                className={cnPagination('Buttons')}
            >
                {
                    pages.map((page) => {
                        if (!page.clickable) {
                            return (
                                <Text
                                    key={page.key}
                                    className={cnPagination('ButtonDots')}
                                    size="s"
                                >
                                    {page.label}
                                </Text>
                            );
                        }
                        return (
                            <Button
                                key={page.key}
                                label={page.label}
                                {
                                    ...(
                                        page.key === props.value + 1
                                            ? {
                                                    view: 'secondary'
                                                }
                                            : {
                                                    view: 'clear',
                                                    status: 'ghost',
                                                }
                                    )
                                }
                                onClick={() => {
                                    props.onChange?.(parseInt(page.key.toString(), 10) - 1);
                                }}
                                size="s"
                            />
                        );
                    })
                }
            </div>
            <Button
                label="Следующая"
                iconRight={IconArrowRight}
                view="clear"
                disabled={props.value === props.items - 1}
                onClick={() => {
                    props.onChange?.(props.value + 1);
                }}
                size="s"
            />
        </nav>
    );
};

/**
 * Пагинация
 */
export const Pagination = (props: PaginationProps) => {
    const {
        pageSize,
        onChangePageSize,
        legendRight,
        pageSizeVariants,
        ...newProps
    } = {
        pageSize: PAGE_SIZE_DEFAULT,
        pageSizeVariants: PAGE_SIZE_VARIANTS,
        ...props,
    };

    const [pageSizeInternal, setPageSizeInternal] = useState(pageSize);

    useEffect(() => {
        setPageSizeInternal(pageSize);
    }, [pageSize]);

    return (
        <>
            <Layout
                direction="row"
                className={classNames(props.className, cnPagination())}
            >
                {newProps.items > 1 && (
                    <Layout flex={1} direction="row">
                        <PaginationInner
                            {...newProps}
                        />
                    </Layout>
                )}
                {!!newProps.items && !!pageSizeVariants.length && (
                    <Select
                        className={classNames(
                            cnMixSpace({ mL: '2xl' }),
                            cnPagination('PageSelect')
                        )}
                        style={{ justifyContent: legendRight ? 'flex-start' : 'flex-end' }}
                        size="s"
                        label="Показать на странице"
                        labelPosition="left"
                        items={pageSizeVariants}
                        value={pageSizeInternal}
                        getItemKey={item => item}
                        getItemLabel={item => item.toString()}
                        onChange={(value) => {
                            const newValue = value ?? pageSizeVariants[0];
                            setPageSizeInternal(newValue);
                            onChangePageSize?.(newValue);
                        }}
                    />
                )}
                {legendRight && (
                    <Layout
                        flex={1}
                        direction="row"
                        style={{
                            justifyContent: 'right',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {legendRight}
                    </Layout>
                )}
            </Layout>
        </>
    );
};
