import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Application */}
      <div className="lg:ml-[250px]">

        <Topbar />

        <main className="p-5 lg:p-7">
          <Dashboard />
        </main>

      </div>

    </div>
  );
}

export default App;