interface IconProps {
        color: string | undefined;
    }
export const BadConnectingIcon = ({color} : IconProps) => {
        return (
                <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="5" width="5" height="12" fill={color || '#FF860D'} stroke={color || '#FF860D'} strokeWidth={2}/>
                        <rect x="12" y="3" width="5" height="14" fill='none' stroke={color || '#FF860D'} strokeWidth={2}/>
                        <rect x="20" y="1" width="5" height="16" fill='none' stroke={color || '#FF860D'} strokeWidth={2}/>
                </svg>

        )
}