import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="min-h-screen bg-slate-950">

      <Sidebar />

      <div className="ml-64">

        <Navbar />

        <main className="min-h-[calc(100vh-5rem)] bg-slate-950 p-8">
          <Dashboard />
        </main>

      </div>

    </div>
  );
}

export default App;