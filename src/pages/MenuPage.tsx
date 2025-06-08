import { routeTarget } from "../routers/routes";
import { concatUrl } from "../utils/urlUtils";
import { ShoppingOutlined, TruckOutlined } from "@ant-design/icons";
import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { useNavigate } from "react-router-dom";

const MenuPage = () => {
const navigate = useNavigate()

        return (
                <Layout direction="column" >
                        <Layout direction='row' style={{gap: '32px'}}>
                                <Card 
                                        style={{ justifyItems: 'center',  backgroundColor: 'var(--color-bg-default)', cursor: 'pointer'}} 
                                        className={cnMixSpace({p:'m'})}
                                >
                                        <TruckOutlined style={{ fontSize: '2em'}} className={cnMixSpace({mB:'xs'})}/>
                                        <Text size="m" weight='semibold' style={{minWidth:'130px', maxWidth: '130px'}} align="center">Поставки</Text>
                                </Card>
                                <Card 
                                        style={{ justifyItems: 'center',  backgroundColor: 'var(--color-bg-default)', cursor: 'pointer' }} 
                                        className={cnMixSpace({p:'m'})}
                                        onClick={() => {
                                                navigate(concatUrl([routeTarget.main, routeTarget.productsQuants]));
                                        }}
                                >
                                        <ShoppingOutlined style={{ fontSize: '2em'}} className={cnMixSpace({mB:'xs'})}/>
                                        <Text size="m" weight='semibold' style={{minWidth:'130px', maxWidth: '130px'}} align="center">Остатки товаров</Text>
                                </Card>
                        </Layout>
                </Layout>
        );
};
export default MenuPage;