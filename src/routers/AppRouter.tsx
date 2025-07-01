import { Navigate, Route, Routes } from "react-router-dom";

// ссылки
import { routeTarget } from "./routes";
import { concatUrl } from "../utils/urlUtils";

// страницы
import MainPage from "../pages/MainPage";
import MenuPage from "../pages/MenuPage";
import LoftsManagmentPage from "../pages/LoftsManagmentPage";
import OrganizationPage from "../pages/OrganizationPage";
import LoftDetailsPage from "../pages/LoftDetailsPage";
import LoftsBookingPage from "../pages/LoftsBookingPage";
import LoftManagment from "../pages/LoftDetailsPage/LoftManagment";
import MediaManagment from "../pages/LoftDetailsPage/MediaManagment";
import TimeShedule from "../pages/LoftDetailsPage/TimeShedule";
import EquipmentManagment from "../pages/LoftDetailsPage/EquipmentManagment";
import ServicesManagment from "../pages/LoftDetailsPage/ServicesManagment";

// вкладки



const AppRouter = () => {
        return (
                <Routes>
                        <Route element={<MainPage />} path={routeTarget.main} >
                                <Route element={<MenuPage />} path={concatUrl([routeTarget.main])} />
                                <Route element={<LoftsManagmentPage />} path={concatUrl([routeTarget.main, routeTarget.loftsManadgment])} />
                                <Route element={<LoftDetailsPage />} path={concatUrl([routeTarget.main, routeTarget.loftsDetails])}>
                                        <Route element={<LoftManagment />} path={concatUrl([routeTarget.main, routeTarget.loftsDetails, routeTarget.commonData ])} />
                                        <Route element={<MediaManagment />} path={concatUrl([routeTarget.main, routeTarget.loftsDetails, routeTarget.mediaData ])} />
                                        <Route element={<TimeShedule />} path={concatUrl([routeTarget.main, routeTarget.loftsDetails, routeTarget.timepriceData ])} />
                                        <Route element={<EquipmentManagment />} path={concatUrl([routeTarget.main, routeTarget.loftsDetails, routeTarget.equipmentData ])} />
                                        <Route element={<ServicesManagment />} path={concatUrl([routeTarget.main, routeTarget.loftsDetails, routeTarget.serviceData ])} />
                                </Route>
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