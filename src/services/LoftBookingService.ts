import { Loft } from "../types/lofts-managment-types";
import { HttpService } from "../system/HttpService";
import { Booking } from "../types/booking-types";

export const getBokingsToday = async (
        getCallback: (arg0: Booking[]) => void
    ) => {
        await HttpService.get<Booking[]>(`/api/gamora/bookings-today`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getLofts = async (
        getCallback: (arg0: Loft[]) => void
    ) => {
        await HttpService.get<Loft[]>(`/api/gamora/get-lofts`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

