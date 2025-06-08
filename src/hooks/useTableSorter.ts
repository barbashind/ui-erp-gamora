import { useState } from 'react';
import { SortOrder } from '../global/TableColumnHeader';

export type GetColumnSortOrder<T> = (column: keyof T) => SortOrder;
export type GetColumnSortOrderIndex<T> = (column: keyof T) => number;
export type Sort<T> = { column: keyof T; sortOrder: SortOrder }[];

export type OnColumnSort<T> = (
    /**
     * Наименование столбца
     */
    column: keyof T,
    /**
     * Направление сортировки
     */
    sortOrder: SortOrder,
    /**
     * Добавление к предыдущим сортировкам (если false, то предыдущие сортировки сбрасываются)
     */
    isAdd: boolean,
) => void;

export interface UseTableSorterProps<T = unknown> {
    /**
     * Сортируемый столбец
     */
    columnSort: Sort<T>;
    /**
     * Получение направления сортировки
     */
    getColumnSortOrder: GetColumnSortOrder<T>;
    /**
     * Получение порядка поля в сортировке
     */
    getColumnSortOrderIndex: GetColumnSortOrderIndex<T>;
    /**
     * Функция, которая используется для сортировки
     */
    onColumnSort: OnColumnSort<T>;
}

/**
 * Хук для работы с сортировкой столбцов таблиц
 */
export const useTableSorter = <T>(initialSort?: Sort<T>): UseTableSorterProps<T> => {
    const [sort, setSort] = useState<Sort<T>>(initialSort ?? []);

    const getColumnSortOrderIndex: GetColumnSortOrderIndex<T> = column =>
        sort.findIndex(value => value.column === column);
    const getColumnSortOrder: GetColumnSortOrder<T> = (column) => {
        const index = getColumnSortOrderIndex(column);
        if (index === -1) {
            return 'none';
        }
        return sort[index].sortOrder;
    };
    return {
        columnSort: sort,
        getColumnSortOrder,
        getColumnSortOrderIndex,
        onColumnSort: (column, sortOrder, isAdd) => {
            const findIndex = getColumnSortOrderIndex(column);
            if (sortOrder === 'none') {
                // исключим поле без сортировки из массива элементов сортировки
                if (findIndex !== -1) {
                    setSort(
                        sort.filter((...params) => {
                            const [, index] = params;
                            return index !== findIndex;
                        })
                    );
                }
                return;
            }
            if (!isAdd) {
                setSort([{ column, sortOrder }]);
                return;
            }
            if (findIndex === -1) {
                setSort([...sort, { column, sortOrder }]);
                return;
            }
            setSort(
                sort.map((elem, index) =>
                    index === findIndex ? { column, sortOrder } : elem
                )
            );
        },
    };
};

