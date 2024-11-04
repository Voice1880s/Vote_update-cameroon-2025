import React from 'react';
import { useFirebase } from '../contexts/FirebaseContext';
import AdminStats from '../components/AdminStats';
import RegionalBreakdown from '../components/RegionalBreakdown';
import TurnoutChart from '../components/TurnoutChart';
import { Loader2 } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { votes, loading, error, isInitialized } = useFirebase();

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-gray-600">Loading election data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error loading data</p>
          <p className="mt-1 text-sm">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem('adminAuthenticated');
            window.location.reload();
          }}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
        >
          Logout
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AdminStats votes={votes} />
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Regional Breakdown</h2>
            <RegionalBreakdown votes={votes} />
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Voter Turnout</h2>
            <TurnoutChart votes={votes} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;