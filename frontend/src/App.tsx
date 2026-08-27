import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

import Dashboard from "./pages/Dashboard";
import AnalyzeRoad from "./pages/AnalyzeRoad";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--background)]">

        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Application */}
        <div className="lg:ml-[250px]">

          {/* Top Navigation */}
          <Topbar />

          {/* Page Content */}
          <main className="p-5 lg:p-7">
            <Routes>

              {/* Dashboard */}
              <Route
                path="/"
                element={<Dashboard />}
              />

              {/* Analyze Road */}
              <Route
                path="/analyze"
                element={<AnalyzeRoad />}
              />

            </Routes>
          </main>

        </div>

      </div>
    </BrowserRouter>
  );
}

export default App;