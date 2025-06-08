import { Navigate, Route, Routes } from "react-router-dom";

// ссылки
import { routeTarget } from "./routes";
import { concatUrl } from "../utils/urlUtils";
import MainPage from "../pages/MainPage";
import MenuPage from "../pages/MenuPage";
import ProductQuantsPage from "../pages/ProductQuantsPage";

// страницы


const AppRouter = () => {
        return (
                <Routes>
                        <Route element={<MainPage />} path={routeTarget.main} >
                                <Route element={<MenuPage />} path={concatUrl([routeTarget.main])} />
                                <Route element={<ProductQuantsPage />} path={concatUrl([routeTarget.main, routeTarget.productsQuants])} />
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