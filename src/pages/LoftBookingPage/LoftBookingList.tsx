import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { Text } from "@consta/uikit/Text";
import { Task } from "../../global/DiagramBooking";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import './LoftBookingListStyl.css';
interface LoftsBookingListProps {

        bookingsToday: Task[];
        
    }

const LoftsBookingList = ({
      bookingsToday,  
    } : LoftsBookingListProps) => {
       const formatDateTime = (isoString: string | number | Date): string => {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы с 0

    return `${hours}:${minutes}, ${day}.${month}`;
};
 return(

    <Layout direction="column" style={{width: '100%'}}>
              <Layout direction="row" style={{flexWrap: 'wrap'}} >

                {bookingsToday && bookingsToday?.length > 0 && bookingsToday.map((booking) => (
                    <Card className={cnMixSpace({mT:'m', mR:'m', p:'m' })} >
 

                        <Text size="l" weight="semibold" view="secondary">картинка</Text>
                        <Text size="l" weight="semibold" view="secondary">{booking.loftName}</Text>
                        <Text size="l" weight="semibold" view="secondary">{"с " + formatDateTime(booking.startDate)}</Text>
                        <Text size="l" weight="semibold" view="secondary">{"по " + formatDateTime(booking.endDate)}</Text>
                        <Text size="l" weight="semibold" view="secondary">{booking.clientName}</Text>

                    </Card>))}

                 </Layout>

    </Layout>)
    }
export default LoftsBookingList;