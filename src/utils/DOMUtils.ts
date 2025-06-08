/**
 * Получить все вышестойщие узлы в DOM дереве
 * @param element DOM элемент
 */
export function* getDOMElementParents(
        element: Element
    ): Iterable<Element | null> {
        let parent = element.parentElement;
        do {
            yield parent;
        } while ((parent = parent?.parentElement ?? null));
    }
    
    /**
     * Определяет, есть ли прокрутка в элементе
     */
    export const isScrolled = (element: Element | null) => {
        if (!element) return false;
        return (
            element.scrollWidth > element.clientWidth
            || element.scrollHeight > element.clientHeight
        );
    };
    