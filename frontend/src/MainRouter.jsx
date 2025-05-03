// MainRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./DataContext";
import App from "./App.jsx";
import HomePannel from "./HomePannel.jsx";

const MainRouter = ({ request, type }) => {
  return (
    <DataProvider requestUrl={request} type={type}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePannel />} />
          <Route path="/app" element={<App />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
};

export default MainRouter;
