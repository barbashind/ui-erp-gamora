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

