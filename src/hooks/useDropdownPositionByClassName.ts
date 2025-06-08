import { useEffect, useLayoutEffect, useState } from 'react';

export interface useDropdownPositionByClassNameProps {
    /**
     * Ссылка на основной элемент
     */
    ref: React.RefObject<HTMLElement>;
    /**
     * Элемент выпадающего списка
     */
    dropdownElement: HTMLElement | null;
    /**
     * Наименование класса
     */
    className: string;
    /**
     * Хук активен
     */
    isActive: boolean;
    /**
     * Данные списка еще не загружены
     */
    isLoading?: boolean;
    /**
     * Дополнительный вертикальный отступ
     */
    dropdownMarginTop?: number;
    /**
     * Дополнительный горизонтальный отступ
     */
    dropdownMarginLeft?: number;
    /**
     * Находится ли данный элемент в ячейке таблицы
     */
    isTableElement?: boolean;
    /**
     * Функция обновления состояния направления открытия выпадающего списка
     */
    setDropdownDirection?: React.Dispatch<React.SetStateAction<'up' | 'down' | undefined>>;
}

/**
 * Хук для расчета позиции всплывающего элемента по его className
 */
export const useDropdownPositionByClassName = ({
    ref,
    dropdownElement,
    className,
    isActive,
    isLoading,
    dropdownMarginTop = 0,
    dropdownMarginLeft = 0,
    isTableElement = false,
    setDropdownDirection
}: useDropdownPositionByClassNameProps
) => {
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    const getAllParents = (element: HTMLElement): readonly Node[] => {
        const mutableParents: Node[] = [];
        let currentNode: Node | null = element;

        while (currentNode) {
            if (currentNode !== element) {
                mutableParents.push(currentNode);
            }
            currentNode = currentNode.parentNode;
        }

        return mutableParents;
    };

    useLayoutEffect(() => {
        const updAnchorRect = () => {
            if (ref.current) {
                if (isTableElement)
                    setAnchorRect(
                        ref.current.parentElement?.parentElement?.parentElement?.getBoundingClientRect()
                        ?? null
                    );
                else setAnchorRect(ref.current.getBoundingClientRect());
            }
        };

        const anchorEl = ref.current;

        if (isActive && anchorEl && dropdownElement) {
            const observer = new ResizeObserver(() => {
                updAnchorRect();
            });

            updAnchorRect();

            window.addEventListener('resize', updAnchorRect);
            observer.observe(anchorEl);
            observer.observe(dropdownElement);

            anchorEl.addEventListener('click', updAnchorRect);

            const allParents = getAllParents(ref.current);
            allParents.forEach((parentEl) => {
                parentEl.addEventListener('scroll', updAnchorRect);
            });

            return () => {
                window.removeEventListener('resize', updAnchorRect);
                observer.unobserve(anchorEl);
                observer.unobserve(dropdownElement);

                anchorEl.removeEventListener('click', updAnchorRect);

                allParents.forEach((parentEl) => {
                    parentEl.removeEventListener('scroll', updAnchorRect);
                });
            };
        }
    }, [isActive, isLoading, isTableElement, ref, dropdownElement]);

    useEffect(() => {
        const elements = document.getElementsByClassName(className);
        const el = elements.length > 0 ? elements[elements.length - 1] as HTMLElement : undefined;

        if (el && anchorRect && isActive) {
            const scrollTop = document.documentElement.scrollTop;
            const heightDelta = document.documentElement.offsetHeight - document.documentElement.scrollHeight;
            const scrollTopDelta = heightDelta * scrollTop / document.documentElement.scrollHeight;
            const deltaTop = scrollTop + scrollTopDelta;
            const margin = 16;
            const zoom = Number(getComputedStyle(document.documentElement).getPropertyValue('--zoom'));

            if (
                (anchorRect.bottom + el.clientHeight) * zoom + margin
                > document.documentElement.clientHeight
            ) {
                el.style.top =
                    (
                        anchorRect.top
                        - el.clientHeight
                        - dropdownMarginTop
                        + deltaTop
                    ).toString() + 'px';

                setDropdownDirection?.('up');
            } else {
                el.style.top =
                    (anchorRect.bottom + dropdownMarginTop + deltaTop).toString() + 'px';

                setDropdownDirection?.('down');
            }

            if (
                (anchorRect.left + el.offsetWidth) * zoom
                > document.documentElement.offsetWidth
            )
                el.style.left =
                    (
                        anchorRect.right
                        - el.offsetWidth
                        - dropdownMarginLeft
                    ).toString() + 'px';
            else
                el.style.left =
                    (anchorRect.left + dropdownMarginLeft).toString() + 'px';
        } else
            setDropdownDirection?.(undefined);
    }, [
        anchorRect,
        className,
        dropdownMarginLeft,
        dropdownMarginTop,
        isActive,
        setDropdownDirection,
    ]);
};
