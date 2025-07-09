import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { Text } from "@consta/uikit/Text";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { useEffect, useState } from "react";
import { getImage, getLoftMainImage } from "../../services/LoftManagmentService";
import LoftBookingListModal from './LoftBookingListModal'

  




import { SkeletonBrick } from "@consta/uikit/Skeleton";
import { Task } from "./DiagramBooking";

interface LoftsBookingListProps {
        bookingsToday: Task[];
    }

type BookingLoft = Task & {
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

        const [bookings, setBookings] = useState<BookingLoft[]>([]);
        const [isLoftBookingListModalOpen, setIsLoftBookingListModalOpen] = useState(false);
        const [isLoftOpenid, setLoftOpenid] = useState<number>();

        const [updatePhoto, setUpdatePhoto] = useState<boolean>(false);

        useEffect(() => {
            setUpdatePhoto(true);
        }, [bookingsToday, setUpdatePhoto]);

        useEffect(() => {
            if (updatePhoto) {
                bookingsToday.map((row : Task) => {
                        const getMainPhoto = async (loftId: number) => {
                            try {
                                await getLoftMainImage(Number(loftId), (async (resp)=> {
                                    if (resp) {
                                    await getImage(resp).then((response) => {
                                        if (response) {
                                            setBookings(prev => (!prev ? [{...row, photo: response }] : [...prev, {...row, photo: response }]))
                                        }
                                    })
                                    }
                                }))
                            } catch(error) {
                                console.log(error);
                            }
                            
                        }
                        void getMainPhoto(Number(row.loftId))
                        setUpdatePhoto(false)
                })
            }
                
        }, [bookingsToday, updatePhoto, setUpdatePhoto]);

    return(

        <Layout direction="column" style={{width: '100%'}}>
                <Layout direction="row" style={{flexWrap: 'wrap'}} >

                    {bookings && bookings?.length > 0 && bookings.map((booking) => (
                        <Card className={cnMixSpace({mT:'m', mR:'m', p:'m' }) + ' Button_view_secondary'} onClick={()=>{setIsLoftBookingListModalOpen(true);setLoftOpenid(booking.loftId)}} >
                                                        
 
                            <Layout direction="row" style={{ alignItems: 'center'}}>
                                {booking.photo ? (
                                    <Layout 
                                        style={{
                                            minHeight: '70px', 
                                            minWidth: '80px', 
                                            maxHeight: '70px', 
                                            maxWidth: '80px', 
                                            backgroundSize: 'cover', 
                                            backgroundPosition: 'center',
                                            backgroundImage: `url(${URL.createObjectURL(booking.photo)})` ,
                                        }} 
                                    />
                                ) : (
                                    <SkeletonBrick height={80} width={80}/>
                                )}
                                
                                        <Layout direction="column" className={cnMixSpace({mL:'m' })}>
                                            <Text size="m" weight="semibold" view="primary">{booking.loftName}</Text>
                                            <Text size="s" view="secondary">{booking.clientName}</Text>
                                            <Text size="s" view="secondary">{ formatDateTimeMonthDD(booking.startDate) + ' · ' + formatDateTimeHHMM(booking.startDate) + ' - ' + formatDateTimeHHMM(booking.endDate)}</Text>
                                        </Layout>
                            </Layout>

                            
                        </Card>))}
                    
                    {/* Модальное окно с подробными данными броинрвоания */}
                    
                        <LoftBookingListModal
                            isModalOpen={isLoftBookingListModalOpen}
                            setIsModalOpen={setIsLoftBookingListModalOpen}
                            loftId={isLoftOpenid}
                            setLoftId={setLoftOpenid}
                        />

                </Layout>

        </Layout>
    )
    }
export default LoftsBookingList;