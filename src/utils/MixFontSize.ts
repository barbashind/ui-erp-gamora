import './MixFontSize.css';
import { cn } from '@bem-react/classname';

const cnFontSize = cn('MixFontSize');

export const cnMixFontSize = (
    fontSize:
        | '2xs'
        | 'xs'
        | 's'
        | 'm'
        | 'l'
        | 'xl'
        | '2xl'
        | '3xl'
        | '4xl'
        | '5xl'
        | '6xl',
): string => {
    return cnFontSize(fontSize);
};
