import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { blastRecords } from '@/lib/mockData';
import BlastForm from '@/components/BlastForm';
import DataEntryForm from '@/components/DataEntryForm';
import { BarChart3, BookOpen, Database, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const mines = [
  { id: '1', name: 'Jayanta OCP' },
  { id: '2', name: 'Khadia OCP' },
  { id: '3', name: 'Beena OCP' },
];

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('predict');
  const [recentBlasts, setRecentBlasts] = useState(blastRecords);
  
  // Authentication states for history tab
  const [historyAuth, setHistoryAuth] = useState({
    isLoggedIn: false,
    username: '',
    password: '',
    selectedMine: ''
  });

  useEffect(() => {
    // Redirect to login if not authenticated and not loading
    if (!isAuthenticated && !isLoading) {
      navigate('/login');
    }

    // Check if already logged in for history tab
    const loggedIn = localStorage.getItem('historyLoggedIn');
    const savedMine = localStorage.getItem('selectedMine');
    if (loggedIn === 'true' && savedMine) {
      setHistoryAuth(prev => ({
        ...prev,
        isLoggedIn: true,
        selectedMine: savedMine
      }));
      loadBlastData(savedMine);
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Update the loadBlastData function in your Dashboard component
const loadBlastData = async (mine: string) => {
  try {
    // First try to fetch from MongoDB
    const response = await fetch(`http://localhost:5000/get-blast-history?mine=${mine}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        // Transform MongoDB data to match your table structure
        const formattedData = data.data.map((item: any, index: number) => ({
          id: index + 1,
          mineId: mines.find(m => m.name === item.mine)?.id || '1',
          date: item.date,
          location: item.location,
          measuredPPV: item.measuredPPV,
          damageLevel: getDamageLevel(item.measuredPPV),
          notes: item.notes || ''
        }));
        setRecentBlasts(formattedData);
        return;
      }
    }
    
    // Fallback to localStorage if MongoDB fails or returns no data
    const storedData = localStorage.getItem('ppvMeasurements');
    if (storedData) {
      const allMeasurements = JSON.parse(storedData);
      const filteredMeasurements = allMeasurements.filter((m: any) => m.mine === mine);
      const formattedData = filteredMeasurements.map((item: any, index: number) => ({
        id: index + 1,
        mineId: mines.find(m => m.name === item.mine)?.id || '1',
        date: item.date,
        location: item.location,
        measuredPPV: item.measuredPPV,
        damageLevel: getDamageLevel(item.measuredPPV),
        notes: item.notes || ''
      }));
      setRecentBlasts(formattedData);
    }
  } catch (error) {
    console.error('Error loading blast data:', error);
    toast.error('Failed to load blast history');
  }
};

  const getDamageLevel = (ppv: number) => {
    if (ppv < 5) return 'None';
    if (ppv < 10) return 'Minor';
    return 'Significant';
  };

  const handleHistoryLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (historyAuth.username === 'admin' && historyAuth.password === 'admin') {
      setHistoryAuth(prev => ({ ...prev, isLoggedIn: true }));
      localStorage.setItem('historyLoggedIn', 'true');
      localStorage.setItem('selectedMine', historyAuth.selectedMine);
      loadBlastData(historyAuth.selectedMine);
      toast.success('Login successful');
    } else {
      toast.error('Invalid credentials. Use admin/admin');
    }
  };

  const handleHistoryLogout = () => {
    setHistoryAuth({
      isLoggedIn: false,
      username: '',
      password: '',
      selectedMine: ''
    });
    localStorage.removeItem('historyLoggedIn');
    localStorage.removeItem('selectedMine');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen pt-16 pb-10 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}
          </p>
        </header>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
            <TabsTrigger 
              value="predict"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Predict Damage
            </TabsTrigger>
            <TabsTrigger 
              value="data"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Database className="h-4 w-4 mr-2" />
              Record Data
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Blast History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="predict" className="animate-fade-in">
            <div className="grid grid-cols-1 gap-6">
              <BlastForm />
            </div>
          </TabsContent>

          <TabsContent value="data" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataEntryForm />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium">Recording Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <p>
                      Record accurate PPV measurements after each blast to improve prediction accuracy. 
                      Ensure readings are taken with calibrated equipment.
                    </p>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold">Best Practices:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Take measurements at multiple distances when possible</li>
                        <li>Note weather conditions that may affect readings</li>
                        <li>Record observations about any visible damage</li>
                        <li>Document the exact location of measurement points</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md">
                      <div className="font-medium text-blue-800 dark:text-blue-300 mb-1">Note:</div>
                      <p className="text-blue-700 dark:text-blue-400">
                        All measurements are stored and used to continuously improve the prediction algorithm's accuracy.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            {!historyAuth.isLoggedIn ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium">View Blast Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mine-select">Select Mine</Label>
                    <Select 
                      value={historyAuth.selectedMine} 
                      onValueChange={(value) => setHistoryAuth(prev => ({ ...prev, selectedMine: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a mine" />
                      </SelectTrigger>
                      <SelectContent>
                        {mines.map((mine) => (
                          <SelectItem key={mine.id} value={mine.name}>
                            {mine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {historyAuth.selectedMine && (
                    <form onSubmit={handleHistoryLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          value={historyAuth.username}
                          onChange={(e) => setHistoryAuth(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Enter username"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={historyAuth.password}
                          onChange={(e) => setHistoryAuth(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Login
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-medium">
                      Recent Blast Records for {historyAuth.selectedMine}
                    </CardTitle>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleHistoryLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentBlasts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No blast records found for {historyAuth.selectedMine}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Location</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Measured PPV</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Damage Level</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBlasts.map((blast) => {
                            const mineName = blast.mineId === 1 ? 'Jayanta OCP' : blast.mineId === 2 ? 'Khadia OCP' : 'Beena OCP';
                            
                            return (
                              <tr 
                                key={blast.id} 
                                className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                              >
                                <td className="px-4 py-3 text-sm">{blast.date}</td>
                                <td className="px-4 py-3 text-sm">{blast.location}</td>
                                <td className="px-4 py-3 text-sm">{blast.measuredPPV} mm/s</td>
                                <td className="px-4 py-3 text-sm">
                                  <span 
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                      blast.damageLevel === 'None' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                        : blast.damageLevel === 'Minor' 
                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                    }`}
                                  >
                                    {blast.damageLevel}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;