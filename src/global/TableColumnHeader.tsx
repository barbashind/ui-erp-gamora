import { Layout } from '@consta/uikit/Layout';
import React from 'react';
import { IconArrowDown } from '@consta/icons/IconArrowDown';
import { IconArrowUp } from '@consta/icons/IconArrowUp';
import { IconUnsort } from '@consta/icons/IconUnsort';

export declare type SortOrder = 'asc' | 'desc' | 'none';

export interface TableColumnHeaderProps {
    /**
     * Значение заголовка колонки
     */
    header: React.ReactNode;
    /**
     * Выравнивание
     */
    align?: 'left' | 'right' | 'center';
    /**
     * Отключает сортировку для колонки (по умолчанию все колонки является сортируемыми)
     */
    withoutSort?: boolean;
    /**
     * Направление сортировки
     */
    sortOrder?: SortOrder;
    /**
     * Порядок поля в сортировке
     */
    sortOrderIndex?: number;
    /**
     * CSS класс
     */
    className?: string;
    /**
     * Пометка колонки обязательной
     */
    required?: boolean;
    /**
     * Функция, которая используется для сортировки
     */
    onSort?: (sortOrder: SortOrder, isAdd: boolean) => void;
}

/**
 * Заголовок столбца таблицы
 */
export const TableColumnHeader = (props: TableColumnHeaderProps) => {
    const DisplyedIcon =
        props.sortOrder === 'asc'
            ? IconArrowUp
            : props.sortOrder === 'desc'
                ? IconArrowDown
                : IconUnsort;
    return (
        <Layout
            className={props.className}
            style={{
                alignItems: 'center',
                gap: 'var(--space-2xs)',
                textTransform: 'none',
                ...(props.align && {
                    justifyContent:
                        props.align === 'center'
                            ? 'center'
                            : props.align === 'right'
                                ? 'flex-end'
                                : 'normal',
                }),
            }}
        >
            {props.required && (
                <label
                    style={{
                        lineHeight: '14px',
                        fontSize: 'var(--size-text-xs)',
                        fontWeight: 'var(--font-weight-text-medium)',
                        color: 'var(--color-typo-alert)',
                    }}
                >
                    *
                </label>
            )}
            <label
                style={{
                    lineHeight: '14px',
                    fontSize: 'var(--size-text-xs)',
                    fontWeight: 'var(--font-weight-text-medium)',
                    color: 'var(--color-typo-secondary)',
                }}
            >
                {props.header}
            </label>
            {!props.withoutSort && (
                <DisplyedIcon
                    view="secondary"
                    style={
                        {
                            'cursor': 'pointer',
                            '--icon-size': 'var(--size-text-xl)',
                            'minWidth': 'var(--icon-size)',
                        } as React.CSSProperties
                    }
                    onClick={(e: { ctrlKey: boolean; }) => {
                        if (
                            props.onSort
                            && typeof props.sortOrder !== 'undefined'
                        ) {
                            if (props.sortOrder == 'none') {
                                props.onSort('asc', e.ctrlKey);
                            }
                            if (props.sortOrder == 'asc') {
                                props.onSort('desc', e.ctrlKey);
                            }
                            if (props.sortOrder == 'desc') {
                                props.onSort('none', e.ctrlKey);
                            }
                        }
                    }}
                />
            )}
        </Layout>
    );
};

