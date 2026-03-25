import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Historical from "./pages/Historical";
import Sidebar from "./components/layout/Sidebar";

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/historical" element={<Historical />} />
      </Routes>
    </BrowserRouter>
  );
}