import { RefObject, useEffect, useRef, useState } from 'react';
import { isScrolled } from '../utils/DOMUtils';
import { useDropdownPositionByClassName } from './useDropdownPositionByClassName';

interface useSelectDropdownReturn {
    /**
     * Ссылка на поле ввода, по котрому котрывается выпадающий список
     */
    elementRef: RefObject<HTMLDivElement>;
    /**
     * Ссылка на выпадающий список
     */
    dropdownRef: RefObject<HTMLDivElement>;
    /**
     * В выпадающем списке есть прокрутка
     */
    isDropdownScrolled: boolean;
    /**
     * Направление открытия выпадающего списка
     */
    dropdownOpenedDirection: 'up' | 'down' | undefined;
}

/**
 * Определяет общие парамтеры для выпадающих списков
 * @param dropdownOpen - выпадающий список открыт
 */
export const useSelectDropdown = ({
    dropdownOpen,
    isLoading
}: {
    dropdownOpen: boolean;
    isLoading?: boolean;
}): useSelectDropdownReturn => {
    const [dropdownOpenedDirection, setDropdownOpenedDirection] = useState<'up' | 'down' | undefined>(undefined);
    const [isDropdownScrolled, setIsDropdownScrolled] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (dropdownOpen && dropdownRef.current) {
            setIsDropdownScrolled(isScrolled(dropdownRef.current));
        }
    }, [dropdownOpen]);

    useDropdownPositionByClassName({
        ref: elementRef,
        dropdownElement: dropdownRef.current,
        className: 'SelectDropdown',
        isActive: dropdownOpen,
        isLoading,
        setDropdownDirection: setDropdownOpenedDirection
    });

    return {
        elementRef,
        dropdownRef,
        isDropdownScrolled,
        dropdownOpenedDirection
    };
};
