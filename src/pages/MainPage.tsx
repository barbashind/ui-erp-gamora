import { Outlet } from "react-router-dom";
import { DashBoard } from "../global/DashBoard";
import { Layout } from "@consta/uikit/Layout";

const MainPage = () => {

        return (
                <Layout direction="column" >
                        <DashBoard/>
                        <Layout style={{backgroundColor: 'var(--color-bg-secondary)', justifyContent: 'left', padding: '24px'}}>
                                <Outlet/>
                        </Layout>
                </Layout>
        );
};
export default MainPage;