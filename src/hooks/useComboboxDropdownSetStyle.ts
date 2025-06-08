import { CSSProperties, useState, useEffect } from 'react';

export interface ComboboxDropdownCssProperties extends CSSProperties {
    '--key-width': number;
}

export interface useComboboxDropdownSetStyleProps {
    dropdownRef: React.RefObject<HTMLDivElement>;
    isDropdownOpen: boolean;
}

/**
 * Хук для добавления стилей к выпадающему списку Combobox
 */
export const useComboboxDropdownSetStyle = ({
    dropdownRef,
    isDropdownOpen,
}: useComboboxDropdownSetStyleProps) => {
    const [dropdownCssProperties, setDropdownCssProperties] = useState<ComboboxDropdownCssProperties | undefined>();

    useEffect(() => {
        const dropdown = dropdownRef.current;

        if (!dropdown) {
            return;
        }

        if (dropdownCssProperties) {
            for (const [key, value] of Object.entries(dropdownCssProperties)) {
                dropdown.style.setProperty(key, value as string);
            }
        }
    }, [dropdownCssProperties, dropdownRef, isDropdownOpen]);

    return {
        dropdownCssProperties,
        setDropdownCssProperties,
    };
};
