
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { blastRecords, mines, damageCategories } from '@/lib/mockData';
import { toast } from 'sonner';
import { 
  AlertCircle, 
  BarChart, 
  Building, 
  Database, 
  Edit, 
  MapPin, 
  Plus, 
  Settings, 
  Trash, 
  Users
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('mines');
  const [minesList, setMinesList] = useState(mines);
  const [blastsList, setBlastsList] = useState(blastRecords);

  // New mine form state
  const [newMineName, setNewMineName] = useState('');
  const [newMineLocation, setNewMineLocation] = useState('');
  const [newMineType, setNewMineType] = useState('Open Cast');

  // Filter state
  const [mineFilter, setMineFilter] = useState('all');

  useEffect(() => {
    // Redirect if not authenticated or not admin
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast.error('You do not have permission to access the admin dashboard');
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  const addNewMine = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newMine = {
      id: minesList.length + 1,
      name: newMineName,
      location: newMineLocation,
      type: newMineType,
    };
    
    setMinesList([...minesList, newMine]);
    
    toast.success(`Mine "${newMineName}" added successfully`);
    
    // Reset form
    setNewMineName('');
    setNewMineLocation('');
    setNewMineType('Open Cast');
  };

  const handleDeleteMine = (id: number) => {
    setMinesList(minesList.filter(mine => mine.id !== id));
    toast.success('Mine deleted successfully');
  };

  const filteredBlasts = mineFilter === 'all' 
    ? blastsList 
    : blastsList.filter(blast => {
        const mineId = parseInt(mineFilter);
        return blast.mineId === mineId;
      });

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

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen pt-16 pb-10 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage mines, blast data, and system settings
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <Card className="bg-white dark:bg-gray-950 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mines</p>
                <p className="text-2xl font-bold">{minesList.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-500 opacity-80" />
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-950 shadow-sm">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recorded Blasts</p>
                <p className="text-2xl font-bold">{blastsList.length}</p>
              </div>
              <Database className="h-8 w-8 text-amber-500 opacity-80" />
            </CardContent>
          </Card>
          
        
          
          
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-8 space-y-6"
        >
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1">
            <TabsTrigger 
              value="mines"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Building className="h-4 w-4 mr-2" />
              Mines
            </TabsTrigger>
            <TabsTrigger 
              value="blasts"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Blast Records
            </TabsTrigger>
            <TabsTrigger 
              value="settings"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mines" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium">Manage Mines</CardTitle>
                    <CardDescription>
                      View and manage all mining locations in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {minesList.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        No mines added yet. Add your first mine using the form.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">ID</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Name</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Location</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {minesList.map((mine) => (
                              <tr 
                                key={mine.id} 
                                className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                              >
                                <td className="px-4 py-3 text-sm">{mine.id}</td>
                                <td className="px-4 py-3 text-sm font-medium">{mine.name}</td>
                                <td className="px-4 py-3 text-sm">{mine.location}</td>
                                <td className="px-4 py-3 text-sm">{mine.type}</td>
                                <td className="px-4 py-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-500"
                                      onClick={() => handleDeleteMine(mine.id)}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium">Add New Mine</CardTitle>
                    <CardDescription>
                      Create a new mine location in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={addNewMine} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="mineName">Mine Name</Label>
                        <Input
                          id="mineName"
                          value={newMineName}
                          onChange={(e) => setNewMineName(e.target.value)}
                          placeholder="e.g. North Ridge OCP"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mineLocation">Location</Label>
                        <Input
                          id="mineLocation"
                          value={newMineLocation}
                          onChange={(e) => setNewMineLocation(e.target.value)}
                          placeholder="e.g. Eastern Region"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mineType">Mine Type</Label>
                        <Select 
                          value={newMineType} 
                          onValueChange={setNewMineType}
                        >
                          <SelectTrigger id="mineType">
                            <SelectValue placeholder="Select mine type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open Cast">Open Cast</SelectItem>
                            <SelectItem value="Underground">Underground</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Mine
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="blasts" className="animate-fade-in">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-medium">Blast Records</CardTitle>
                  <CardDescription>
                    View and manage records of all blast operations
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="mineFilter" className="whitespace-nowrap">Filter by Mine:</Label>
                  <Select 
                    value={mineFilter} 
                    onValueChange={setMineFilter}
                  >
                    <SelectTrigger id="mineFilter" className="w-[180px]">
                      <SelectValue placeholder="All Mines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Mines</SelectItem>
                      {minesList.map((mine) => (
                        <SelectItem key={mine.id} value={mine.id.toString()}>
                          {mine.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Mine</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Location</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Holes</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Charge/Hole</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Measured PPV</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Damage</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBlasts.map((blast) => {
                        const mineName = blast.mineId === 1 ? 'Jayanta OCP' : blast.mineId === 2 ? 'Khadia OCP' : 'Beena OCP';
                        
                        return (
                          <tr 
                            key={blast.id} 
                            className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                          >
                            <td className="px-4 py-3 text-sm">{blast.date}</td>
                            <td className="px-4 py-3 text-sm">{mineName}</td>
                            <td className="px-4 py-3 text-sm">{blast.location}</td>
                            <td className="px-4 py-3 text-sm">{blast.numHoles}</td>
                            <td className="px-4 py-3 text-sm">{blast.chargePerHole} kg</td>
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
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-medium">
                    Damage Classification
                  </CardTitle>
                  <CardDescription>
                    Define PPV thresholds for damage level classification
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Damage Level</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">PPV Range</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {damageCategories.map((category, index) => (
                          <tr 
                            key={index} 
                            className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                          >
                            <td className="px-4 py-3 text-sm font-medium">
                              <span 
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  category.level === 'None' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                    : category.level === 'Minor' 
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' 
                                    : category.level === 'Moderate'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                    : category.level === 'Severe'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                }`}
                              >
                                {category.level}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{category.ppvRange}</td>
                            <td className="px-4 py-3 text-sm">{category.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium">Site Constants</CardTitle>
                    <CardDescription>
                      Configure site-specific parameters for PPV calculation
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="kValue">K-Value (Jayanta OCP)</Label>
                          <Input id="kValue" type="number" defaultValue="1100" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bValue">B-Value (Jayanta OCP)</Label>
                          <Input id="bValue" type="number" defaultValue="-1.6" step="0.1" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="kValue2">K-Value (Khadia OCP)</Label>
                          <Input id="kValue2" type="number" defaultValue="950" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bValue2">B-Value (Khadia OCP)</Label>
                          <Input id="bValue2" type="number" defaultValue="-1.5" step="0.1" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="kValue3">K-Value (Beena OCP)</Label>
                          <Input id="kValue3" type="number" defaultValue="1250" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bValue3">B-Value (Beena OCP)</Label>
                          <Input id="bValue3" type="number" defaultValue="-1.7" step="0.1" />
                        </div>
                      </div>
                      
                      <Button className="w-full mt-2">
                        Save Constants
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium">System Maintenance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full">
                        Backup Database
                      </Button>
                      <Button variant="outline" className="w-full">
                        Restore From Backup
                      </Button>
                      <Button variant="destructive" className="w-full">
                        Clear Test Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
