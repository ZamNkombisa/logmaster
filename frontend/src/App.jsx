import React, { useState } from 'react';
import client from './api/client';
import LogGrid from './components/LogGrid';
import MapPreview from './components/MapPreview';

function App() {
  const [formData, setFormData] = useState({
    driver_name: '',
    driver_id: '',
    truck_number: '',
    trailer_number: '',
    home_terminal: 'Green Bay, WI',
    shipper: '',
    commodity: '',
    load_number: '',
    distance: 427,
    start_time: new Date().toISOString().slice(0, 16),
    avg_speed: 55
  });

  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await client.post('create-trip/', formData);
      setTripData(response.data);
    } catch (error) {
      console.error("Sync Error:", error);
      alert("Check Django Connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <nav className="border-b border-slate-800 bg-slate-900 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-black tracking-tighter text-blue-500 italic">LOGMASTER<span className="text-white">PRO</span></h1>
        <div className="text-[10px] font-mono text-slate-500 border border-slate-800 px-3 py-1 rounded bg-slate-950 uppercase">FMCSA COMPLIANT V1.0</div>
      </nav>

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* TOP SECTION: Form and Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-l-2 border-blue-500 pl-3">Trip Manifest Details</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Driver Name" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-blue-500" onChange={(e) => setFormData({...formData, driver_name: e.target.value})}/>
                <input type="text" placeholder="Driver ID" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none" onChange={(e) => setFormData({...formData, driver_id: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Truck # (e.g. TA9392)" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none" onChange={(e) => setFormData({...formData, truck_number: e.target.value})}/>
                <input type="text" placeholder="Trailer #" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none" onChange={(e) => setFormData({...formData, trailer_number: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Shipper" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none" onChange={(e) => setFormData({...formData, shipper: e.target.value})}/>
                <input type="text" placeholder="Commodity" className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none" onChange={(e) => setFormData({...formData, commodity: e.target.value})}/>
              </div>
              <input type="text" placeholder="Load Number (e.g. ST13241)" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none" onChange={(e) => setFormData({...formData, load_number: e.target.value})}/>
              <input type="text" placeholder="Home Terminal" value={formData.home_terminal} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm outline-none" onChange={(e) => setFormData({...formData, home_terminal: e.target.value})}/>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col">
                   <span className="text-[10px] text-slate-500 font-bold uppercase">Distance</span>
                   <input type="number" value={formData.distance} className="bg-transparent font-bold text-blue-400 outline-none" onChange={(e) => setFormData({...formData, distance: e.target.value})}/>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 flex flex-col">
                   <span className="text-[10px] text-slate-500 font-bold uppercase">Avg Speed</span>
                   <input type="number" value={formData.avg_speed} className="bg-transparent font-bold text-blue-400 outline-none" onChange={(e) => setFormData({...formData, avg_speed: e.target.value})}/>
                </div>
              </div>

              <button onClick={handleGenerate} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-white transition-all active:scale-95 uppercase text-sm tracking-widest shadow-lg shadow-blue-900/40">
                {loading ? 'CALCULATING HOS...' : 'GENERATE COMPLIANT LOG'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[400px]">
            <MapPreview />
          </div>
        </div>

        {/* BOTTOM SECTION: Full Width Dashboard & Grid */}
        <div className="w-full bg-white text-slate-900 border border-slate-300 rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-end mb-6 border-b-2 border-slate-100 pb-4">
             <div>
                <h3 className="font-black text-2xl uppercase tracking-tighter">Driver's Daily Log</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">(One Calendar Day - 24 Hours)</p>
             </div>
             {tripData && (
               <div className="flex gap-4 text-right">
                  <div className="border-r border-slate-200 pr-4">
                    <p className="text-[9px] font-bold text-slate-400">TRUCK #</p>
                    <p className="font-black">{formData.truck_number || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400">LOAD #</p>
                    <p className="font-black">{formData.load_number || 'N/A'}</p>
                  </div>
               </div>
             )}
          </div>
          
          {tripData ? (
            <div className="overflow-x-auto">
              <LogGrid entries={tripData.entries} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl italic">
              Awaiting Manifest Data...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;