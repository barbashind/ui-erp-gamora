
import { Layout } from "@consta/uikit/Layout";
import MStroyFilter from "./IntegrationMStroyPage/MStroyFilter";
import MStroyReport from "./IntegrationMStroyPage/MStroyReport";


const IntegrationMStroyPage = () => {  
        
        return (
                <Layout direction="column">
                        <MStroyFilter />
                        <MStroyReport />
                </Layout>
        );
};
export default IntegrationMStroyPage;