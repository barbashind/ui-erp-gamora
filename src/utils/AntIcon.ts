import { createIcon } from '@consta/icons/Icon';
import { FileSearchOutlined } from '@ant-design/icons';

export const AntIcon = {
    asIconComponent: (
        icon: typeof FileSearchOutlined | (() => ReturnType<typeof FileSearchOutlined>)
    ) => {
        return icon as ReturnType<typeof createIcon>;
    },
};
