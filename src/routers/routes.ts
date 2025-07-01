export interface TRouteTarget {
        main: string;
        menu: string;
        loftsManadgment: string;
        commonData: string;
        mediaData: string;
        timepriceData: string;
        equipmentData: string;
        serviceData: string;
        organization: string;
        loftsDetails: string,
        bookingManagment: string;
    }

export const routeTarget: TRouteTarget = {
        main: '/gamora',
        menu: 'menu',
        loftsManadgment: 'lofts-managment',
        loftsDetails: 'loft-details/:loftId',
        commonData: 'common',
        mediaData: 'media',
        timepriceData: 'timeprice',
        equipmentData: 'equipment',
        serviceData: 'service',
        organization: 'organization',
        bookingManagment: 'booking-managment',
    };