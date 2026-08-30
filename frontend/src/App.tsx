import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import AnalyzeRoad from "./pages/AnalyzeRoad";
import Detections from "./pages/Detections";

function App() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      <Sidebar />

      <div className="lg:ml-[250px]">
        <Topbar />

        <main className="p-5 lg:p-7">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analyze" element={<AnalyzeRoad />} />
            <Route path="/detections" element={<Detections />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;