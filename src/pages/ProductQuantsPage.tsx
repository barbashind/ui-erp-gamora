import { getProductQuant } from "../services/ProductsService";
import { Product } from "../types/product-types";
import { Button } from "@consta/uikit/Button";
import { Card } from "@consta/uikit/Card";
import { Layout } from "@consta/uikit/Layout";
import { cnMixSpace } from "@consta/uikit/MixSpace";
import { Text } from "@consta/uikit/Text";
import { TextField } from "@consta/uikit/TextField";
import { useState } from "react";

const ProductQuantsPage = () => {

const [productIds, setProductIds] = useState<string | null>(null);
const [data, setData] = useState<Product[]>([]);
const [isLoading, setIsLoading] = useState<boolean>(false);

const getProdQuants = async () => {
        if (productIds) {
                await getProductQuant(productIds).then((resp) => {
                        setData(resp.data.products);
                        setIsLoading(false);
                        // console.log(resp);
                }

                ) 
        }
}

        return (
                <Layout direction="column" >
                        <Card className={cnMixSpace({mT:'xl'})}>
                                <Layout direction="row">
                                        <TextField
                                                value={productIds}
                                                onChange={(value)=>{
                                                        setProductIds(value);
                                                }}
                                        />
                                        <Button
                                                label={'Поиск'}
                                                onClick={()=> {
                                                        setIsLoading(true);
                                                        getProdQuants();
                                                }}
                                        />
                                </Layout>   
                                <Layout direction="column">
                                        <Layout direction="row">
                                                <Text style={{minWidth:'150px', maxWidth: '150px'}}>ID</Text>
                                                <Text style={{minWidth:'150px', maxWidth: '150px'}} className={cnMixSpace({mL:'m'})}>Наименование</Text>
                                                <Text style={{minWidth:'150px', maxWidth: '150px'}} className={cnMixSpace({mL:'m'})}>Поставщик</Text>
                                                <Text style={{minWidth:'150px', maxWidth: '150px'}} className={cnMixSpace({mL:'m'})}>Остаток</Text>
                                        </Layout>
                                        {data && !isLoading && (data?.length > 0) && data.map((product) => (
                                                <Layout direction="row">
                                                        <Text style={{minWidth:'150px', maxWidth: '150px'}}>{product.id}</Text>
                                                        <Text style={{minWidth:'150px', maxWidth: '150px'}} className={cnMixSpace({mL:'m'})}>{product.name}</Text>
                                                        <Text style={{minWidth:'150px', maxWidth: '150px'}} className={cnMixSpace({mL:'m'})}>{product.supplier}</Text>
                                                        <Text style={{minWidth:'150px', maxWidth: '150px'}} className={cnMixSpace({mL:'m'})}>{product.totalQuantity}</Text>
                                                </Layout>
                                        ))}
                                </Layout>
                        </Card>
                </Layout>
        );
};
export default ProductQuantsPage;