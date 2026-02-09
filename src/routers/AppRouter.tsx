import { Navigate, Route, Routes } from "react-router-dom";

// ссылки
import { routeTarget } from "./routes";
import { concatUrl } from "../utils/urlUtils";

// страницы
// import MenuPage from "../pages/MenuPage";
import MainPage from "../pages/MainPage";
import IntegrationMStroyPage from "../pages/IntegrationMStroyPage";
import Settings from "../pages/Settings";
import MonitoringPage from "../pages/MonitoringPage";
import StructurePoints from "../pages/StructurePoints";
// вкладки



const AppRouter = () => {
        return (
                <Routes>
                        <Route element={<MainPage />} path={routeTarget.main} >
                                <Route element={<MonitoringPage />} path={concatUrl([routeTarget.main, routeTarget.pointsManadgment])} />
                                <Route element={<IntegrationMStroyPage />} path={concatUrl([routeTarget.main, routeTarget.interagtionMStroy])} />
                                <Route element={<StructurePoints />} path={concatUrl([routeTarget.main, routeTarget.map])} />
                                <Route element={<Settings />} path={concatUrl([routeTarget.main, routeTarget.settings])} />
                        </Route>
                        
                        <Route
                                path=""
                                element={
                                        <Navigate to={{ pathname: concatUrl([routeTarget.main])}} relative="path" />
                                }
                        />
                        <Route
                                path="*"
                                element={<Navigate to={{ pathname: concatUrl([routeTarget.main]) }} relative="path" />}
                        />
                </Routes>
        );
};
export default AppRouter;