export interface TRouteTarget {
        main: string;
        menu: string;
        loftsManadgment: string;
        organization: string;
        loftsDetails: string,
        bookingManagment: string;
    }

export const routeTarget: TRouteTarget = {
        main: '/gamora',
        menu: 'menu',
        loftsManadgment: 'lofts-managment',
        loftsDetails: 'loft-details/:loftId',
        organization: 'organization',
        bookingManagment: 'booking-managment',
    };