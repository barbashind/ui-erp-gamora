import { Gates, Object, Place } from "../types/gates-types";
import { HttpService } from "../system/HttpService";


export const getGates = async (
        getCallback: (arg0: Gates[]) => void
    ) => {
        await HttpService.get<Gates[]>(`/api/ufch/gates`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getObjects = async (
        getCallback: (arg0: Object[]) => void
    ) => {
        await HttpService.get<Object[]>(`/api/ufch/objects`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };

export const getPlaces = async (
        getCallback: (arg0: Place[]) => void
    ) => {
        await HttpService.get<Place[]>(`/api/ufch/places`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    };    

export const getToken = async (
        getCallback: (arg0: Place[]) => void
    ) => {
        await HttpService.get<Place[]>(`/api/ufch/places`)
            .then((response) => {
                getCallback(response);
            })
            .catch(() => {
                console.log('failed');
            });
    }; 






    