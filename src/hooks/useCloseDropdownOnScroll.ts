import { useEffect } from 'react';
import { getDOMElementParents, isScrolled } from '../utils/DOMUtils';

export interface useDropdownCloseOnScrollOutProps {
    /**
     * состояние выпадющего списка
     */
    isDropDownOpen: boolean;
    /**
     * set функция состояния выпадающего списка
     */
    setIsDropDownOpen: React.Dispatch<React.SetStateAction<boolean>>;
    /**
     * ссылка на родительский элемент
     */
    anchorRef: React.RefObject<HTMLElement>;
}

/**
 * Хук, закрывающий dropdown при пересечении его родительским элементом границ видимой области при веритикальном скролле
 */

export const useDropdownCloseOnScrollOut = ({
    isDropDownOpen,
    setIsDropDownOpen,
    anchorRef
}: useDropdownCloseOnScrollOutProps) => {
    useEffect(() => {
        if (!isDropDownOpen) return;
        if (!anchorRef.current) return;
        const cellElement = anchorRef.current;
        const comboboxParents = Array.from(
            getDOMElementParents(anchorRef.current)
        ).filter(elem => elem && isScrolled(elem));
        if (comboboxParents.length === 0) return;

        const recalcDropdownOpen = (element: Element) => {
            const cellRect = cellElement.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            if (cellRect.top < elementRect.top || cellRect.bottom > elementRect.bottom) {
                setIsDropDownOpen(false);
            }
        };
        const clearFuncs: (() => void)[] = [];
        comboboxParents.forEach((element) => {
            if (element) {
                const observer = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                        recalcDropdownOpen(entry.target);
                    }
                });
                observer.observe(element);
                clearFuncs.push(() => {
                    observer.unobserve(element);
                });
                const wrappedFunc = () => {
                    recalcDropdownOpen(element);
                };
                element.addEventListener('scroll', wrappedFunc);
                clearFuncs.push(() => {
                    element.removeEventListener('scroll', wrappedFunc);
                });
            }
        });
        return () => {
            clearFuncs.forEach((func) => {
                func();
            });
        };
    }, [anchorRef, isDropDownOpen, setIsDropDownOpen]);
};
