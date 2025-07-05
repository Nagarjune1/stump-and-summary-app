
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff, Upload, Download, Sync, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const OfflineScoring = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data from localStorage
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const stored = localStorage.getItem('cricket_offline_data');
      if (stored) {
        setOfflineData(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const saveOfflineData = (data) => {
    try {
      const updatedData = [...offlineData, { ...data, timestamp: Date.now(), synced: false }];
      localStorage.setItem('cricket_offline_data', JSON.stringify(updatedData));
      setOfflineData(updatedData);
      
      toast({
        title: "Data Saved Offline",
        description: "Your scoring data has been saved locally and will sync when online.",
      });
    } catch (error) {
      console.error('Error saving offline data:', error);
      toast({
        title: "Storage Error",
        description: "Unable to save data offline. Please check device storage.",
        variant: "destructive"
      });
    }
  };

  const syncOfflineData = async () => {
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please connect to the internet to sync your data.",
        variant: "destructive"
      });
      return;
    }

    const unsyncedData = offlineData.filter(item => !item.synced);
    if (unsyncedData.length === 0) {
      toast({
        title: "All Data Synced",
        description: "No offline data needs to be synchronized.",
      });
      return;
    }

    setSyncStatus('syncing');

    try {
      // Simulate API calls to sync data
      for (const item of unsyncedData) {
        // Here you would make actual API calls to sync the data
        await syncSingleItem(item);
      }

      // Mark all data as synced
      const syncedData = offlineData.map(item => ({ ...item, synced: true }));
      localStorage.setItem('cricket_offline_data', JSON.stringify(syncedData));
      setOfflineData(syncedData);
      setSyncStatus('success');

      toast({
        title: "Sync Successful",
        description: `${unsyncedData.length} items synchronized successfully.`,
      });
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
      toast({
        title: "Sync Failed",
        description: "Some data could not be synchronized. Please try again.",
        variant: "destructive"
      });
    }
  };

  const syncSingleItem = async (item) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, you would:
    // 1. Send the item data to your backend API
    // 2. Handle different types of data (matches, players, scores, etc.)
    // 3. Manage conflicts if data was modified both online and offline
    
    console.log('Syncing item:', item);
  };

  const clearOfflineData = () => {
    localStorage.removeItem('cricket_offline_data');
    setOfflineData([]);
    setSyncStatus('idle');
    
    toast({
      title: "Offline Data Cleared",
      description: "All offline data has been removed from local storage.",
    });
  };

  const exportOfflineData = () => {
    if (offlineData.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There is no offline data to export.",
        variant: "destructive"
      });
      return;
    }

    const dataBlob = new Blob([JSON.stringify(offlineData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cricket-offline-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Data Exported",
      description: "Offline data has been downloaded as a JSON file.",
    });
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <Sync className="w-4 h-4 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Upload className="w-4 h-4" />;
    }
  };

  const unsyncedCount = offlineData.filter(item => !item.synced).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Offline Scoring</h2>
          <p className="text-gray-600">Score matches even without internet connection</p>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge className="bg-green-100 text-green-800">
              <Wifi className="w-3 h-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800">
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Connection Status Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {isOnline ? (
            <span className="text-green-700">
              You're online! All data will be saved directly to the cloud.
            </span>
          ) : (
            <span className="text-orange-700">
              You're offline. Data will be saved locally and synchronized when you reconnect.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Offline Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Offline Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{offlineData.length}</div>
              <div className="text-sm text-gray-600">Total Items Stored</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{unsyncedCount}</div>
              <div className="text-sm text-gray-600">Pending Sync</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{offlineData.length - unsyncedCount}</div>
              <div className="text-sm text-gray-600">Synchronized</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={syncOfflineData} 
              disabled={!isOnline || syncStatus === 'syncing' || unsyncedCount === 0}
              className="flex items-center gap-2"
            >
              {getSyncStatusIcon()}
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Data'}
            </Button>
            
            <Button 
              onClick={exportOfflineData} 
              variant="outline"
              disabled={offlineData.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            
            <Button 
              onClick={clearOfflineData} 
              variant="destructive"
              disabled={offlineData.length === 0}
              className="flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Scoring Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How Offline Scoring Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h3 className="font-semibold">Score Offline</h3>
                <p className="text-sm text-gray-600">Continue scoring matches even without internet connection. All data is saved locally on your device.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h3 className="font-semibold">Automatic Detection</h3>
                <p className="text-sm text-gray-600">The app automatically detects when you go online or offline and adjusts the saving behavior accordingly.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h3 className="font-semibold">Smart Synchronization</h3>
                <p className="text-sm text-gray-600">When you reconnect, click "Sync Data" to upload all offline changes to the cloud automatically.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h3 className="font-semibold">Data Security</h3>
                <p className="text-sm text-gray-600">Your offline data is securely stored in your browser and can be exported as a backup if needed.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Offline Activity */}
      {offlineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Offline Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {offlineData.slice(-5).reverse().map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Data Entry #{offlineData.length - index}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={item.synced ? "default" : "secondary"}>
                    {item.synced ? "Synced" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfflineScoring;
