interface IconProps {
        color: string | undefined;
    }

export const GoodConnectingIcon = ({color} : IconProps) => {
        return (
                <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="5" width="5" height="12" fill={color || '#0DFFBB'} stroke={color || '#0DFFBB'} strokeWidth={2}/>
                        <rect x="12" y="3" width="5" height="14" fill={color || '#0DFFBB'} stroke={color || '#0DFFBB'} strokeWidth={2}/>
                        <rect x="20" y="1" width="5" height="16" fill={color || '#0DFFBB'} stroke={color || '#0DFFBB'} strokeWidth={2}/>
                </svg>
        )
}