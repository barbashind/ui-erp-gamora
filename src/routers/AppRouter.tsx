import { Navigate, Route, Routes } from "react-router-dom";

// ссылки
import { routeTarget } from "./routes";
import { concatUrl } from "../utils/urlUtils";
import MainPage from "../pages/MainPage";
import MenuPage from "../pages/MenuPage";
import LoftsManagmentPage from "../pages/LoftsManagmentPage";
import OrganizationPage from "../pages/OrganizationPage";
import LoftDetailsPage from "../pages/LoftDetailsPage";
import LoftsBookingPage from "../pages/LoftsBookingPage";
// страницы


const AppRouter = () => {
        return (
                <Routes>
                        <Route element={<MainPage />} path={routeTarget.main} >
                                <Route element={<MenuPage />} path={concatUrl([routeTarget.main])} />
                                <Route element={<LoftsManagmentPage />} path={concatUrl([routeTarget.main, routeTarget.loftsManadgment])} />
                                <Route element={<LoftDetailsPage />} path={concatUrl([routeTarget.main, routeTarget.loftsDetails])} />
                                <Route element={<OrganizationPage />} path={concatUrl([routeTarget.main, routeTarget.organization])} />
                                <Route element={<LoftsBookingPage />} path={concatUrl([routeTarget.main, routeTarget.bookingManagment])} />
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