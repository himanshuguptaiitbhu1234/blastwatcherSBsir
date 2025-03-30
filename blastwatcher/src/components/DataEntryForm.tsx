import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const mines = [
  { id: '1', name: 'Jayanta OCP' },
  { id: '2', name: 'Khadia OCP' },
  { id: '3', name: 'Beena OCP' },
];

const DataEntryForm = () => {
  // Login state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [selectedMine, setSelectedMine] = useState('');

  // Form state
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [measuredPPV, setMeasuredPPV] = useState<string>("");
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const loggedIn = localStorage.getItem('isLoggedIn');
    const savedMine = localStorage.getItem('selectedMine');
    if (loggedIn === 'true' && savedMine) {
      setIsLoggedIn(true);
      setSelectedMine(savedMine);
    }
  }, []);

  const handleMineSelect = (mine: string) => {
    setSelectedMine(mine);
    setShowLogin(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('selectedMine', selectedMine);
      toast.success('Login successful');
    } else {
      toast.error('Invalid credentials. Use admin/admin');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowLogin(false);
    setSelectedMine('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('selectedMine');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMine) {
      toast.error('Please select a mine');
      return;
    }
    
    setIsSubmitting(true);
    
    // Create data object
    const formData = {
      mine: selectedMine,
      date,
      time,
      location,
      measuredPPV: parseFloat(measuredPPV),
      notes,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Send data to backend
      const response = await fetch('http://localhost:5000/save-measurement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save measurement');
      }

      // Also save to localStorage for immediate UI updates
      const existingData = JSON.parse(localStorage.getItem('ppvMeasurements') || '[]');
      const updatedData = [...existingData, formData];
      localStorage.setItem('ppvMeasurements', JSON.stringify(updatedData));
      
      toast.success('Measurement data saved successfully');
      
      // Reset form (but keep selected mine)
      setDate('');
      setTime('');
      setLocation('');
      setMeasuredPPV('');
      setNotes('');
    } catch (error) {
      toast.error('Failed to save measurement');
      console.error('Error saving measurement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto">
        {!showLogin ? (
          <Card className="bg-white dark:bg-gray-950 shadow-md border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Select Mine Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mines.map((mine) => (
                  <Button
                    key={mine.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleMineSelect(mine.name)}
                  >
                    {mine.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-gray-950 shadow-md border border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-medium">Login to {selectedMine}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <Button 
                    variant="outline"
                    onClick={() => setShowLogin(false)}
                  >
                    Back
                  </Button>
                  <Button type="submit">
                    Login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-950 shadow-md border border-gray-200 dark:border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium">
            Record PPV Measurement for {selectedMine}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Blast Location</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. North Face, Block B"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="measuredPPV">Measured PPV (mm/s)</Label>
            <Input
              id="measuredPPV"
              type="number"
              value={measuredPPV}
              onChange={(e) => setMeasuredPPV(e.target.value)}
              step="0.1"
              min="0"
              className="appearance-none"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Measurement'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DataEntryForm;