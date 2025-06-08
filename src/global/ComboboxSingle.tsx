import './ComboboxSingle.css';
import { IconClear } from '@consta/icons/IconClear';
import { cn } from '@bem-react/classname';
import classNames from 'classnames';
import { ReactNode, SyntheticEvent, forwardRef, useEffect, useState } from 'react';
import {
    Combobox,
    ComboboxProps,
    ComboboxGroupDefault,
    ComboboxItemDefault,
    withDefaultGetters,
    ComboboxPropRenderItem,
    clearSizeMap
} from '@consta/uikit/Combobox';
import { useForkRef } from '@consta/uikit/useForkRef';
import { useSelectDropdown } from '../hooks/useSelectDropdown';
import { ListItem } from '@consta/uikit/ListCanary';
import { createPortal } from 'react-dom';
import { useDebounce } from '@consta/uikit/useDebounce';
import { useDropdownCloseOnScrollOut } from '../hooks/useCloseDropdownOnScroll';
import { ComboboxDropdownCssProperties, useComboboxDropdownSetStyle } from '../hooks/useComboboxDropdownSetStyle';

export interface ComboboxSinglePropGetItemLabelDropdownProps<ITEM = ComboboxItemDefault> {
    item: ITEM;
    searchValue: string;
    getItemKey: (item: ITEM) => string | number;
    getItemLabel: (item: ITEM) => string;
    setDropdownCssProperties?: React.Dispatch<React.SetStateAction<ComboboxDropdownCssProperties | undefined>>;
}

export type ComboboxSingleProps<
    ITEM = ComboboxItemDefault,
    GROUP = ComboboxGroupDefault
> = ComboboxProps<ITEM, GROUP> & {
    /**
     * Доступна кнопка очистки
     */
    clearAvailable?: boolean;
    /**
     * Обработка кнопки очистки
     */
    onClear?: (e: SyntheticEvent) => void;
    /**
     * Не очищать поле для поиска при изменении выбранного значения
     */
    keepSearchValueOnChange?: boolean;
    /**
     * Не очищать поле для поиска при потере фокуса
     */
    keepSearchValueOnBlur?: boolean;
    /**
     * Изменение поля ввода с накоплением правок в 500мс
     */
    onSearchValueChangeDebounced?: ((value: string) => void) | undefined;
    /**
     * Функция получения элемента в выпадающем списке. Если не задана, то используется getItemLabel
     */
    getItemLabelDropdown?: (props: ComboboxSinglePropGetItemLabelDropdownProps<ITEM>) => ReactNode;
    /**
     * Отобразить слева иконку поиска
     */
    withIconSearch?: boolean;
};

export type ComboboxSingleComponent = <ITEM = ComboboxItemDefault, GROUP = ComboboxGroupDefault>(props: ComboboxSingleProps<ITEM, GROUP>) => React.ReactElement | null;

export type ComboboxSingleSearchFunction<ITEM> = (item: ITEM, searchValue: string) => boolean;

function ComboboxSingleInner<ITEM = ComboboxItemDefault, GROUP = ComboboxGroupDefault>(props: ComboboxSingleProps<ITEM, GROUP>, ref: React.ForwardedRef<HTMLDivElement>) {
    const {
        getItemKey,
        getItemLabel,
    } = withDefaultGetters(props);

    const newProps = { size: 's', ...props };
    delete newProps.getItemLabelDropdown;
    delete newProps.withIconSearch;
    delete newProps.searchFunction;
    delete newProps.onSearchValueChangeDebounced;
    delete newProps.keepSearchValueOnChange;
    delete newProps.keepSearchValueOnBlur;
    delete newProps.clearAvailable;
    delete newProps.onClear;

    const cnComboboxSingleEffect = cn('ComboboxSingleEffect');
    const cnComboboxSingleDropdownEffect = cn('ComboboxSingleDropdownEffect');
    const cnComboboxSingleEffectItemLabel = cn('ComboboxSingleEffectItemLabel');

    const [isDropdownOpen, setIsDropdownOpen] = useState(!!props.dropdownOpen);

    const onSearchValueChangeDebounced = useDebounce((value: string) => {
        props.onSearchValueChangeDebounced?.(value);
    }, 500);

    // функция поиска по умолчанию, находит значения по getItemLabel
    const defaultSearchFunction = (
        item: ITEM,
        searchValue: string
    ): boolean => {
        let searchText = false;
        searchText = getItemLabel(item)
            .toLocaleLowerCase()
            .includes(searchValue.toLocaleLowerCase());
        return searchText;
    };

    const searchFunction: ComboboxSingleSearchFunction<ITEM> | undefined =
        props.searchFunction ?? defaultSearchFunction;

    const [searchValue, setSearchValue] = useState<string>(props.searchValue ?? '');
    const searchValueChange = (value: string) => {
        setSearchValue(value);
        props.onSearchValueChange?.(value);
        onSearchValueChangeDebounced(value);
    };
    useEffect(() => {
        setSearchValue(props.searchValue ?? '');
    }, [props.searchValue]);

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

    const [selectIndicatorsContainer, setSelectIndicatorsContainer] = useState<Element | null | undefined>(null);
    useEffect(() => {
        setSelectIndicatorsContainer(elementRef.current?.getElementsByClassName('Select-Indicators').item(0));
    }, [elementRef]);

    const { dropdownCssProperties, setDropdownCssProperties } = useComboboxDropdownSetStyle({
        dropdownRef,
        isDropdownOpen
    });

    const renderItem: ComboboxPropRenderItem<ITEM> = ({
        item,
        active,
        hovered,
        onClick,
        onMouseEnter,
        ref,
    }) => (
        <ListItem
            label={(
                <div className={cnComboboxSingleEffectItemLabel()}>
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
            active={hovered}
            onMouseEnter={onMouseEnter}
            onClick={onClick}
            ref={ref}
            size="s"
            checked={active}
        />
    );

    useDropdownCloseOnScrollOut({
        isDropDownOpen: isDropdownOpen,
        setIsDropDownOpen: setIsDropdownOpen,
        anchorRef: elementRef
    });

    useEffect(() => {
        // правка прокрутки к выбранному элементу при открытии выпадающего списка
        if (isDropdownOpen && dropdownRef.current) {
            const dropdownElement = dropdownRef.current;
            const selectedElements = dropdownElement.getElementsByClassName('ListItem_checked');
            if (selectedElements.length === 1) {
                selectedElements[0].scrollIntoView({ block: 'center' });
            }
        }
    }, [isDropdownOpen, dropdownRef]);

    return (
        <>
            <Combobox<ITEM, GROUP>
                {...newProps}
                className={classNames(
                    cnComboboxSingleEffect({
                        withIconSearch: props.withIconSearch
                    }),
                    props.className
                )}
                dropdownClassName={classNames(
                    cnComboboxSingleDropdownEffect({
                        isScrolled: isDropdownScrolled,
                        openDirection: dropdownOpenedDirection
                    }),
                    props.dropdownClassName
                )}
                onSearchValueChange={searchValueChange}
                onChange={(value, e) => {
                    if (!props.keepSearchValueOnChange) {
                        searchValueChange('');
                    }
                    props.onChange(value, e);
                }}
                searchFunction={searchFunction}
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
                renderItem={props.renderItem ?? renderItem}
                style={{ ...newProps.style, ...dropdownCssProperties }}
            />
            {!!selectIndicatorsContainer && !props.disabled && (props.clearAvailable ?? !!props.value) && createPortal(
                <button
                    type="button"
                    onClick={props.onClear ?? ((e) => {
                        if (!props.keepSearchValueOnChange) {
                            searchValueChange('');
                        }
                        props.onChange(null, { e });
                    })}
                    tabIndex={-1}
                    className={classNames('Select-ClearIndicator', cnComboboxSingleEffect('ClearIndicator'))}
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
 * Выпадающий список с поиском. Можно выбрать один вариант.
 * Параметры наследуются от компонента https://consta.design/libs/uikit/components-combobox-stable
 */
export const ComboboxSingle = forwardRef(ComboboxSingleInner) as ComboboxSingleComponent;
