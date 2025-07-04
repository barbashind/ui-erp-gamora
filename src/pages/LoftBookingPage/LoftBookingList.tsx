import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { Text } from "@consta/uikit/Text";
import { Task } from "../../global/DiagramBooking";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import classes from './LoftBookingList.module.css'
import { useEffect, useState } from "react";
import { getImage, getLoftMainImage } from "../../services/LoftManagmentService";

interface LoftsBookingListProps {
        bookingsToday: Task[];
    }

interface LoftPhoto {
    loftId: number;
    photo: Blob;
}

const LoftsBookingList = ({
      bookingsToday,  
    } : LoftsBookingListProps) => {
       
        const formatDateTimeHHMM = (isoString: string | number | Date): string => {
            const date = new Date(isoString);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');

            return `${hours}:${minutes}`;
        };

        const formatDateTimeMonthDD = (isoString: string | number | Date): string => {
            const date = new Date(isoString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
            const year = String(date.getFullYear() + 1).padStart(2, '0'); 

            return `${day} ${month}, ${year}`;
        };

        const [photoes, setPhotoes] = useState<LoftPhoto[]>([])

    useEffect(() => {
            bookingsToday.map((row : Task) => {
                    const getMainPhoto = async (loftId: number) => {
                        try {
                            await getLoftMainImage(Number(loftId), (async (resp)=> {
                                if (resp) {
                                await getImage(resp).then((response) => {
                                    if (response) {
                                        setPhotoes(prev => (!prev ? [{loftId: loftId, photo: response }] : [...prev, {loftId: loftId, photo: response }]))
                                    }
                                })
                                }
                            }))
                        } catch(error) {
                            console.log(error);
                        }
                        
                    }
                    void getMainPhoto(Number(row.loftId))
            })
        
    }, [bookingsToday]);

    return(

        <Layout direction="column" style={{width: '100%'}}>
                <Layout direction="row" style={{flexWrap: 'wrap'}} >

                    {bookingsToday && bookingsToday?.length > 0 && bookingsToday.map((booking) => (
                        <Card className={cnMixSpace({mT:'m', mR:'m', p:'m' }) + ' ' + classes.BookingCard} >
                            <Layout direction="row" style={{ alignItems: 'center'}}>
                                {photoes && photoes?.find((el) => (el.loftId === booking.loftId))?.photo && (
                                    <Layout 
                                        style={{
                                            minHeight: '70px', 
                                            minWidth: '80px', 
                                            maxHeight: '70px', 
                                            maxWidth: '80px', 
                                            backgroundSize: 'cover', 
                                            backgroundPosition: 'center',
                                            backgroundImage: 
                                               photoes && photoes.length > 0 && photoes?.find((el) => (el.loftId === booking.loftId))?.photo ? 
                                                    `url(${URL.createObjectURL(photoes.find((el) => (el.loftId === booking.loftId)).photo)})` 
                                                    : undefined ,
                                        }} 
                                    />
                                )}
                                
                                        <Layout direction="column" className={cnMixSpace({mL:'m' })}>
                                            <Text size="m" weight="semibold" view="primary" onClick={() => console.log(photoes)}>{booking.loftName}</Text>
                                            <Text size="s" view="secondary">{booking.clientName}</Text>
                                            <Text size="s" view="secondary">{ formatDateTimeMonthDD(booking.startDate) + ' · ' + formatDateTimeHHMM(booking.startDate) + ' - ' + formatDateTimeHHMM(booking.endDate)}</Text>
                                        </Layout>
                            </Layout>
                        </Card>))}

                </Layout>

        </Layout>
    )
    }
export default LoftsBookingList;