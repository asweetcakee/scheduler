import SchedulerGrid from "./components/scheduler/SchedulerGrid";
import DatePicker from "./components/ui/DatePicker";

const App = () => {
  return(
    <div className="flex h-screen w-full bg-white overflow-hidden">
            
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        
        <header className="h-16 border-b border-slate-200 bg-white flex items-center px-6">
          {/* <Header /> */}
          <div className="font-bold">
            <DatePicker />
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-slate-100 p-1">
          <SchedulerGrid />
        </main>

      </div>

      <aside className="w-64 h-full border-r border-slate-200 bg-slate-50 hidden md:block">
        {/* <Sidebar /> */}
        <div className="p-4 font-bold text-slate-400">Sidebar Placeholder</div>
      </aside>

    </div>
  )
}

export default App;