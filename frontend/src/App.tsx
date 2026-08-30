import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import AnalyzeRoad from "./pages/AnalyzeRoad";
import Detections from "./pages/Detections";
import DetectionDetails from "./pages/DetectionDetails";
import Analytics from "./pages/Analytics";
import RoadMap from "./pages/RoadMap";



function App() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <Sidebar />

      <div className="lg:ml-[250px]">
        <Topbar />

        <main className="p-5 lg:p-7">
         <Routes>
  <Route path="/" element={<Dashboard />} />

  <Route
    path="/analyze"
    element={<AnalyzeRoad />}
  />

  <Route
    path="/detections"
    element={<Detections />}
  />

  <Route
    path="/detections/:id"
    element={<DetectionDetails />}
  />
  <Route
  path="/analytics"
  element={<Analytics />}
/>
<Route
  path="/map"
  element={<RoadMap />}
/>
</Routes>
        </main>
      </div>
    </div>
  );
}

export default App;