import './ComboboxMultiple.css';
import { IconClear } from '@consta/icons/IconClear';
import classNames from 'classnames';
import { ComponentType, ReactElement, ReactNode, SyntheticEvent, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Combobox,
    ComboboxProps,
    ComboboxGroupDefault,
    ComboboxItemDefault,
    withDefaultGetters,
    ComboboxPropRenderValue,
    ComboboxPropRenderItem,
    clearSizeMap
} from '@consta/uikit/Combobox';
import { useDebounce } from '@consta/uikit/useDebounce';
import { ListItem } from '@consta/uikit/ListCanary';
import { Checkbox } from '@consta/uikit/Checkbox';
import { useForkRef } from '@consta/uikit/useForkRef';
import { useSelectDropdown } from '../hooks/useSelectDropdown';
import { createPortal } from 'react-dom';
import { useDropdownCloseOnScrollOut } from '../hooks/useCloseDropdownOnScroll';
import {
    cnComboboxMultipleEffect,
    cnComboboxMultipleEffectItemLabel,
    cnComboboxMultipleEffectSelectableGroup,
    cnComboboxMultipleEffectSelectableGroupLabel,
    cnComboboxMultipleDropdownEffect,
    cnComboboxMultipleEffectValue
} from './cnComboboxMultiple';
import { ComboboxDropdownCssProperties, useComboboxDropdownSetStyle } from '../hooks/useComboboxDropdownSetStyle';

export interface ComboboxMultiplePropGetItemLabelDropdownProps<ITEM = ComboboxItemDefault> {
    item: ITEM;
    searchValue: string;
    getItemKey: (item: ITEM) => string | number;
    getItemLabel: (item: ITEM) => string;
    setDropdownCssProperties?: React.Dispatch<React.SetStateAction<ComboboxDropdownCssProperties | undefined>>;
}

export interface ComboboxMultipleToolbarProps<ITEM> {
    getItemKey: (item: ITEM) => string | number;
    /**
     * Выбранные значения
     */
    value: ITEM[] | null | undefined;
    /**
     * Все значения
     */
    items: ITEM[];
    /**
     * Отфильтрованные все значения
     */
    filteredItems: ITEM[];
    /**
     * Установка новых выбранных значений
     */
    setValue: (value: ITEM[] | null, event: { e: SyntheticEvent }) => void;
    /**
     * Блокировка кнопки "Выбрать все"
     */
    disableSelectAll?: boolean;
}

export type ComboboxMultipleSearchFunction<ITEM> = (item: ITEM, searchValue: string, value: ITEM[] | null | undefined) => boolean;

export type ComboboxMultipleCustomSingleValue<ITEM> = (item: ITEM) => ReactElement | null;

export type ComboboxMultipleProps<
    ITEM = ComboboxItemDefault,
    GROUP = ComboboxGroupDefault
> = ComboboxProps<ITEM, GROUP, true> & {
    /**
     * Доступна кнопка очистки
     */
    clearAvailable?: boolean;
    /**
     * Обработка кнопки очистки
     */
    onClear?: (e: SyntheticEvent) => void;
    /**
     * Не очищать поле для поиска при изменении выбранных значений
     */
    keepSearchValueOnChange?: boolean;
    /**
     * Не очищать поле для поиска при потере фокуса
     */
    keepSearchValueOnBlur?: boolean;
    /**
     * Функция поиска, проверяет что item удовлетворяет фильтрации по searchValue
     * @param item Элемент списка
     * @param searchValue Искомое значение
     * @param value Ранее выбранные значения в списке
     */
    searchFunction?: ComboboxMultipleSearchFunction<ITEM>;
    /**
     * Изменение поля ввода с накоплением правок в 500мс
     */
    onSearchValueChangeDebounced?: ((value: string) => void) | undefined;
    /**
     * Текстовое форматирование вывода нескольких выбранных значений
     * @param count количество выбранных значений
     */
    formatMultipleValue?: (count: number) => string | null;
    /**
     * Элемент который будет выводиться при нескольких выбранных значениях
     * @param count количество выбранных значений
     */
    customMultipleValue?: (count: number) => ReactElement | null;
    /**
     * Элемент который будет выводиться при единственном выбранном значении
     */
    customSingleValue?: ComboboxMultipleCustomSingleValue<ITEM>;
    /**
     * Функция получения элемента в выпадающем списке. Если не задана, то используется getItemLabel
     */
    getItemLabelDropdown?: (props: ComboboxMultiplePropGetItemLabelDropdownProps<ITEM>) => ReactNode;
    /**
     * Отобразить слева иконку поиска
     */
    withIconSearch?: boolean;
    /**
     * Перемещать выбранные значения наверх
     */
    selectedUp?: boolean;
    /**
     * Отделить выбранные вверху значения от невыбранных линией
     */
    selectedUpUnderline?: boolean;
    /**
     * Группирующий элемент можно выбрать
     */
    isGroupSelectable?: boolean;
    /**
     * Обработчик выбора группирующего элемента. Релевантно для isGroupSelectable.
     */
    onGroupSelect?: (arg: {
        group: GROUP;
        isChecked: boolean;
        isIntermediate: boolean;
        visibleGroupItems: ITEM[];
    }) => void;
    /**
     * Функция получения структуры элементв по группе. Релевантно для isGroupSelectable.
     */
    groupToItem?: (group: GROUP) => ITEM;
    /**
     *Верхний тулбар
     */
    topToolbar?: ComponentType<ComboboxMultipleToolbarProps<ITEM>>;
    /**
     * Входные данные для topToolbar.
     */
    topToolbarProps?: Partial<ComboboxMultipleToolbarProps<ITEM>>;
};
export type ComboboxMultipleComponent = <ITEM = ComboboxItemDefault, GROUP = ComboboxGroupDefault>(props: ComboboxMultipleProps<ITEM, GROUP>) => React.ReactElement | null;

function ComboboxMultipleInner<ITEM = ComboboxItemDefault, GROUP = ComboboxGroupDefault>(props: ComboboxMultipleProps<ITEM, GROUP>, ref: React.ForwardedRef<HTMLDivElement>) {
    const {
        getItemKey,
        getItemLabel,
        getItemDisabled,
        getItemGroupKey,
        getGroupKey,
        getGroupLabel
    } = withDefaultGetters(props);

    const newProps = { size: 's', ...props };
    delete newProps.formatMultipleValue;
    delete newProps.customMultipleValue;
    delete newProps.customSingleValue;
    delete newProps.getItemLabelDropdown;
    delete newProps.withIconSearch;
    delete newProps.searchFunction;
    delete newProps.selectedUp;
    delete newProps.selectedUpUnderline;
    delete newProps.isGroupSelectable;
    delete newProps.onGroupSelect;
    delete newProps.groupToItem;
    delete newProps.onSearchValueChangeDebounced;
    delete newProps.topToolbar;
    delete newProps.keepSearchValueOnChange;
    delete newProps.keepSearchValueOnBlur;
    delete newProps.clearAvailable;
    delete newProps.onClear;
    delete newProps.topToolbarProps;

    const [isDropdownOpen, setIsDropdownOpen] = useState(!!props.dropdownOpen);
    const [dropdownScrollTop, setDropdownScrollTop] = useState<ScrollToOptions>({ top: 0 });

    const isDisabledWithValues =
        newProps.disabled && Array.isArray(newProps.value) && newProps.value.length > 1;
    if (isDisabledWithValues) {
        newProps.disabled = false;
        newProps.items = newProps.value ?? [];
    }

    const onSearchValueChangeDebounced = useDebounce((value: string) => {
        props.onSearchValueChangeDebounced?.(value);
    }, 500);

    // функция поиска по умолчанию, находит значения по getItemLabel, выбранные значения всегда остаются
    const defaultSearchFunction: ComboboxMultipleSearchFunction<ITEM> = useCallback((
        item,
        searchValue,
        value
    ): boolean => {
        let searchText = false;
        searchText = getItemLabel(item)
            .toLocaleLowerCase()
            .includes(searchValue.toLocaleLowerCase())
            || (
                !!value
                && value
                    .map(v => getItemKey(v))
                    .includes(getItemKey(item))
            );
        return searchText;
    }, [
        getItemKey,
        getItemLabel,
    ]);

    const searchFunction: ComboboxMultipleSearchFunction<ITEM> = useMemo(() =>
        props.isGroupSelectable && props.groups
            ? (item, searchValue, value) => {
                    // при поиске по элементам требуется оставлять группы
                    if (
                        props.groups?.filter(
                            group => getGroupKey(group) === getItemKey(item)
                        ).length
                    ) {
                        return true;
                    }
                    return (props.searchFunction ?? defaultSearchFunction)(
                        item,
                        searchValue,
                        value
                    );
                }
            : props.searchFunction ?? defaultSearchFunction,
    [
        defaultSearchFunction,
        getGroupKey,
        getItemKey,
        props.groups,
        props.isGroupSelectable,
        props.searchFunction,
    ]);

    const [searchValue, setSearchValue] = useState<string>(props.searchValue ?? '');
    const searchValueChange = (value: string) => {
        setSearchValue(value);
        props.onSearchValueChange?.(value);
        onSearchValueChangeDebounced(value);
    };
    useEffect(() => {
        setSearchValue(props.searchValue ?? '');
    }, [props.searchValue]);

    // получение списка элементов с учетом свойства isSelectedUp
    const { items, filteredItems, visibleItems } = useMemo(() => {
        const groupToItem = props.groupToItem;
        const items =
            !isDisabledWithValues && props.value && props.selectedUp
                ? props.value.concat(
                        props.items.filter(
                            item =>
                                props.value
                                && !props.value
                                    .map((value) => {
                                        return getItemKey(value);
                                    })
                                    .includes(getItemKey(item))
                        )
                    )
                : newProps.items;
        const visibleItems = items.filter(item =>
            searchFunction(item, searchValue, props.value)
        );
        const filteredItems = newProps.items.filter(item =>
            searchFunction(item, searchValue, null)
        );

        if (props.isGroupSelectable && props.groups) {
            // в список элементов надо добавить фиктивные элементы для групп

            const visibleGroups = new Set(visibleItems.map(item =>
                getItemGroupKey(item)
            ));

            return {
                visibleItems,
                filteredItems,
                items: props.groups
                    .filter(
                        group => visibleGroups.has(getGroupKey(group))
                    )
                    .map(group =>
                        (groupToItem
                            ? [groupToItem(group)]
                            : []
                        ).concat(
                            items.filter(
                                item => getItemGroupKey(item) === getGroupKey(group)
                            )
                        )
                    )
                    .flat(1)
            };
        } else {
            return { visibleItems, filteredItems, items };
        }
    }, [
        getItemKey,
        getGroupKey,
        getItemGroupKey,
        isDisabledWithValues,
        newProps.items,
        searchFunction,
        searchValue,
        props.groupToItem,
        props.groups,
        props.isGroupSelectable,
        props.items,
        props.selectedUp,
        props.value,
    ]);

    useEffect(() => {
        setIsDropdownOpen(!!props.dropdownOpen);
    }, [props.dropdownOpen]);

    const {
        elementRef,
        dropdownRef,
        isDropdownScrolled,
        dropdownOpenedDirection
    } = useSelectDropdown({
        dropdownOpen: isDropdownOpen,
        isLoading: props.isLoading
    });

    if (props.isGroupSelectable) {
        delete newProps.groups;
    }

    const toolbarRef = useRef<HTMLDivElement>(null);
    const [topToolbarParent, setTopToolbarParent] = useState<HTMLElement | null>(null);

    const [selectIndicatorsContainer, setSelectIndicatorsContainer] = useState<Element | null | undefined>(null);
    useEffect(() => {
        setSelectIndicatorsContainer(elementRef.current?.getElementsByClassName('Select-Indicators').item(0));
    }, [elementRef]);

    useEffect(() => {
        if (!isDropdownOpen || !props.topToolbar || !dropdownRef.current) {
            setTopToolbarParent(null);
            return;
        }
        setTopToolbarParent(dropdownRef.current.parentElement);
    }, [isDropdownOpen, props.topToolbar, dropdownRef]);

    const customMultipleValue: ComboboxMultipleProps['customMultipleValue'] = props.customMultipleValue
        ?? (
            props.formatMultipleValue
                ? (count) => {
                        const value = props.formatMultipleValue?.(count);
                        if (value === null) {
                            return null;
                        }
                        return (
                            <span
                                key="singleValue"
                                className={cnComboboxMultipleEffectValue()}
                            >
                                {value}
                            </span>
                        );
                    } : undefined
        );

    const renderValue: ComboboxPropRenderValue<ITEM> = ({ item }) => {
        if (searchValue && searchValue.length > 0) {
            return null;
        }

        if (!Array.isArray(props.value)) {
            return null;
        }

        if (
            props.value.length === 0
            || getItemKey(item) !== getItemKey(props.value[0])
        ) {
            return null;
        }

        if (props.value.length === 1 && props.customSingleValue) {
            return props.customSingleValue(item);
        }
        if (props.value.length > 1 && customMultipleValue) {
            return customMultipleValue(props.value.length);
        }

        return (
            <span
                key={getItemKey(item)}
                className={cnComboboxMultipleEffectValue()}
            >
                {getItemLabel(item)}
            </span>
        );
    };

    const isAllSelected = useMemo(() => {
        const itemNotSelected = (item: ITEM) => !props.value?.some(v => getItemKey(v) === getItemKey(item));

        return !props.items.some(itemNotSelected) || !visibleItems.some(itemNotSelected);
    }, [
        getItemKey,
        props.items,
        props.value,
        visibleItems,
    ]);

    const { dropdownCssProperties, setDropdownCssProperties } = useComboboxDropdownSetStyle({
        dropdownRef,
        isDropdownOpen
    });

    const renderItem: ComboboxPropRenderItem<ITEM> = ({
        item,
        active,
        onClick,
        onMouseEnter,
        ref,
    }) => {
        if (props.isGroupSelectable && props.groups) {
            // рендеринг выбираемой группы
            const group = props.groups
                .filter(
                    group => getGroupKey(group) === getItemKey(item)
                )
                .pop();
            if (group) {
                const groupValues = props.value?.filter(
                    item => getItemGroupKey(item) === getGroupKey(group)
                );
                const groupItems = props.items.filter(
                    item => getItemGroupKey(item) === getGroupKey(group)
                );
                const isIntermediate = !!(
                    groupValues?.length
                    && groupValues.length !== groupItems.length
                );
                const isChecked = !!(
                    !isIntermediate && groupValues?.length
                );
                const visibleGroupItems = visibleItems
                    .filter(item => getItemGroupKey(item) === getGroupKey(group));

                return (
                    <div className={cnComboboxMultipleEffectSelectableGroup()}>
                        <ListItem
                            label={(
                                <div className={cnComboboxMultipleEffectSelectableGroupLabel()}>
                                    {getGroupLabel(group)}
                                </div>
                            )}
                            role="option"
                            aria-selected={active}
                            onMouseEnter={onMouseEnter}
                            onClick={() => {
                                props.onGroupSelect?.({
                                    group,
                                    isChecked,
                                    isIntermediate,
                                    visibleGroupItems,
                                });
                                searchValueChange('');
                            }}
                            leftSide={(
                                <Checkbox
                                    checked={isChecked}
                                    intermediate={isIntermediate}
                                    disabled={!!isDisabledWithValues}
                                    size="l"
                                />
                            )}
                            size={newProps.size}
                            disabled={!!isDisabledWithValues}
                        />
                    </div>
                );
            }
        }

        const isLastElement = (
            props.value
            && props.value.length > 0
            && getItemKey(item) === getItemKey(props.value[props.value.length - 1])
        ) ?? false;

        return (
            <div
                className={classNames(
                    {
                        ComboboxContainerItemUnderlined:
                            !isDisabledWithValues
                            && props.selectedUp
                            && props.selectedUpUnderline
                            && isLastElement
                            && !isAllSelected
                    }
                )}
            >
                <ListItem
                    label={(
                        <div className={cnComboboxMultipleEffectItemLabel()}>
                            <div>
                                {
                                    props.getItemLabelDropdown
                                        ? props.getItemLabelDropdown({
                                                item,
                                                searchValue,
                                                getItemKey,
                                                getItemLabel,
                                                setDropdownCssProperties
                                            })
                                        : getItemLabel(item)
                                }
                            </div>
                        </div>
                    )}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={onMouseEnter}
                    onClick={onClick}
                    ref={ref}
                    leftSide={
                        !isDisabledWithValues ? (
                            <Checkbox
                                checked={active}
                                disabled={getItemDisabled(item)}
                                size="l"
                            />
                        ) : undefined
                    }
                    size={newProps.size}
                    disabled={getItemDisabled(item)}
                />
            </div>
        );
    };

    useDropdownCloseOnScrollOut({
        isDropDownOpen: isDropdownOpen,
        setIsDropDownOpen: setIsDropdownOpen,
        anchorRef: elementRef
    });

    useEffect(() => {
        if (dropdownRef.current) {
            setTimeout(() => {
                dropdownRef.current?.scrollTo(dropdownScrollTop);
            }, 0);
        }
    }, [dropdownScrollTop, dropdownRef]);

    return (
        <>
            <Combobox<ITEM, GROUP, true>
                {...newProps}
                multiple
                items={items}
                className={classNames(
                    cnComboboxMultipleEffect({
                        withIconSearch: props.withIconSearch,
                        isDisabled: isDisabledWithValues
                    }),
                    props.className
                )}
                dropdownClassName={classNames(
                    cnComboboxMultipleDropdownEffect({
                        isScrolled: isDropdownScrolled,
                        openDirection: dropdownOpenedDirection,
                        withTopToolbar: !!props.topToolbar,
                        isDisabled: isDisabledWithValues
                    }),
                    props.dropdownClassName
                )}
                onChangeCapture={(e) => {
                    if (isDisabledWithValues) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
                onSearchValueChange={(value) => {
                    if (isDisabledWithValues) return;
                    searchValueChange(value);
                }}
                onChange={(value, e) => {
                    if (isDisabledWithValues) return;
                    if (!props.keepSearchValueOnChange) {
                        searchValueChange('');
                    } else {
                        if (isDropdownOpen && dropdownRef.current && props.selectedUp) {
                            setDropdownScrollTop({ top: dropdownRef.current.scrollTop });
                        }
                    }
                    props.onChange(value, e);
                }}
                searchFunction={(item, searchValue) => searchFunction(item, searchValue, props.value)}
                searchValue={searchValue}
                ref={useForkRef([elementRef, ref])}
                dropdownOpen={isDropdownOpen}
                onDropdownOpen={(isOpen) => {
                    setIsDropdownOpen(isOpen);
                    props.onDropdownOpen?.(isOpen);
                }}
                dropdownRef={useForkRef([dropdownRef, props.dropdownRef])}
                onBlur={(args) => {
                    props.onBlur?.(args);
                    if (!props.keepSearchValueOnBlur) {
                        searchValueChange('');
                    }
                }}
                renderValue={renderValue}
                renderItem={renderItem}
                ignoreOutsideClicksRefs={[toolbarRef, ...(props.ignoreOutsideClicksRefs ?? [])]}
                style={{ ...newProps.style, ...dropdownCssProperties }}
                onKeyDownCapture={(e) => {
                    if (e.key !== 'Enter' || !isDropdownOpen) {
                        props.onKeyDownCapture?.(e);
                        return;
                    }
                    if (searchValue !== '' && filteredItems.length !== 0 && new Set(props.value?.map(getItemKey)).isDisjointFrom(new Set(filteredItems.map(getItemKey)))) {
                        // если в отфильтрованных значениях нет выбранных - надо добавить первое из отфильтрованных
                        props.onChange([...(props.value ?? []), filteredItems[0]], { e });
                    } else {
                        setIsDropdownOpen(false);
                        props.onDropdownOpen?.(false);
                    }
                    e.stopPropagation();
                    props.onKeyDownCapture?.(e);
                }}
            />
            {topToolbarParent !== null && props.topToolbar && createPortal(
                <div className="ComboboxMultipleEffectToolbar" ref={toolbarRef}>
                    <props.topToolbar
                        getItemKey={getItemKey}
                        value={props.value}
                        items={items}
                        filteredItems={filteredItems}
                        setValue={(value, { e }) => {
                            if (isDropdownOpen && dropdownRef.current && props.selectedUp) {
                                setDropdownScrollTop({ top: dropdownRef.current.scrollTop });
                            }
                            props.onChange(value, { e });
                        }}
                        disableSelectAll={props.topToolbarProps?.disableSelectAll}
                    />
                </div>,
                topToolbarParent
            )}
            {!!selectIndicatorsContainer && !props.disabled && !isDisabledWithValues && (props.clearAvailable ?? !!props.value?.length) && createPortal(
                <button
                    type="button"
                    onClick={props.onClear ?? ((e) => {
                        if (!props.keepSearchValueOnChange) {
                            searchValueChange('');
                        }
                        props.onChange(null, { e });
                    })}
                    tabIndex={-1}
                    className={classNames('Select-ClearIndicator', cnComboboxMultipleEffect('ClearIndicator'))}
                >
                    <IconClear
                        size={clearSizeMap[newProps.size]}
                        className="Select-ClearIndicatorIcon"
                    />
                </button>,
                selectIndicatorsContainer
            )}
        </>
    );
}

/**
 * Выпадающий список с поиском. Можно выбрать несколько вариантов.
 * Параметры наследуются от компонента https://consta.design/libs/uikit/components-combobox-stable
 */
export const ComboboxMultiple = forwardRef(ComboboxMultipleInner) as ComboboxMultipleComponent;
