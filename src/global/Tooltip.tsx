import { Direction, Popover, Position } from '@consta/uikit/Popover';
import { cnMixPopoverArrow } from '@consta/uikit/MixPopoverArrow';
import { cn } from '@bem-react/classname';
import classNames from 'classnames';

const ARROW_SIZE = 6;
const ARROW_OFFSET = 8;

export interface TooltipProps {
    direction?: Direction;
    spareDirection?: Direction;
    position: Position;
    children?: React.ReactNode;
    className?: string;
    classNameArrow?: string;
}

export const Tooltip = (props: TooltipProps) => {
    const {
        direction,
        spareDirection,
    }: {
        direction: Direction;
        spareDirection: Direction;
    } = {
        direction: 'upCenter',
        spareDirection: 'downStartLeft',
        ...props,
    };

    return (
        <Popover
            direction={direction}
            spareDirection={spareDirection}
            arrowOffset={ARROW_OFFSET + ARROW_SIZE}
            offset={ARROW_SIZE + 4}
            style={{
                ['--popover-arrow-size' as string]: `${ARROW_SIZE}px`,
                ['--popover-arrow-offset' as string]: `${ARROW_OFFSET}px`,
                boxShadow: 'var(--shadow-modal)',
                backgroundColor: 'var(--color-bg-default)',
                borderRadius: 'var(--control-radius)',
            }}
            isInteractive={false}
            position={props.position}
            className={props.className}
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
        >
            <div
                className={classNames(
                    cn('Tooltip')('Arrow', [cnMixPopoverArrow({ direction })]),
                    props.classNameArrow
                )}
            />
            {props.children}
        </Popover>
    );
};
