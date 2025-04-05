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
  const [measuredPPV, setMeasuredPPV] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [distanceFromBlast, setDistanceFromBlast] = useState('');
  const [drillDia, setDrillDia] = useState('');
  const [bench, setBench] = useState('');
  const [burden, setBurden] = useState('');
  const [spacing, setSpacing] = useState('');
  const [stemming, setStemming] = useState('');
  const [subgrade, setSubgrade] = useState('');
  const [holesPerRow, setHolesPerRow] = useState('');
  const [noOfRows, setNoOfRows] = useState('');
  const [explosiveCharge, setExplosiveCharge] = useState('');
  const [explosiveType, setExplosiveType] = useState('');
  const [delayBetweenHoles, setDelayBetweenHoles] = useState('');
  const [delayBetweenRows, setDelayBetweenRows] = useState('');
  const [frequency, setFrequency] = useState('');
  const [chargeWeight, setChargeWeight] = useState('');

  useEffect(() => {
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
    
    const formData = {
      mine: selectedMine,
      date,
      time,
      location,
      measuredPPV: parseFloat(measuredPPV) || 0,
      notes: notes || null,
      distancefromblast: parseFloat(distanceFromBlast) || 0,
      chargeWeight: parseFloat(chargeWeight) || 0,
      drilldia: drillDia ? parseFloat(drillDia) : null,
      bench: bench ? parseFloat(bench) : null,
      burden: burden ? parseFloat(burden) : null,
      spacing: spacing ? parseFloat(spacing) : null,
      stemming: stemming ? parseFloat(stemming) : null,
      subgrade: subgrade ? parseFloat(subgrade) : null,
      holesperrow: holesPerRow ? parseFloat(holesPerRow) : null,
      noofrows: noOfRows ? parseFloat(noOfRows) : null,
      explosivecharge: explosiveCharge ? parseFloat(explosiveCharge) : null,
      Explosivetype: explosiveType || null,
      Delaybetweenholes: delayBetweenHoles ? parseFloat(delayBetweenHoles) : null,
      Delaybetweenrows: delayBetweenRows ? parseFloat(delayBetweenRows) : null,
      frequency: frequency ? parseFloat(frequency) : null,
      isSubmitting: false
    };
    
    try {
      const response = await fetch('http://localhost:5000/save-measurement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save measurement');
      }

      const result = await response.json();
      toast.success(result.message || 'Measurement saved successfully');
      
      // Reset form
      setDate('');
      setTime('');
      setLocation('');
      setMeasuredPPV('');
      setNotes('');
      setDistanceFromBlast('');
      setChargeWeight('');
      // Reset other fields as needed...
    } catch (error: any) {
      toast.error(error.message || 'Failed to save measurement');
      console.error('Error:', error);
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
    <div className="max-w-4xl mx-auto">
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
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
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distanceFromBlast">Distance from Blast site (m)</Label>
                <Input
                  id="distanceFromBlast"
                  type="number"
                  value={distanceFromBlast}
                  onChange={(e) => setDistanceFromBlast(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chargeWeight">Max charge weight per delay (kg)</Label>
                <Input
                  id="chargeWeight"
                  type="number"
                  value={chargeWeight}
                  onChange={(e) => setChargeWeight(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="measuredPPV">Measured PPV (mm/s)</Label>
                <Input
                  id="measuredPPV"
                  type="number"
                  value={measuredPPV}
                  onChange={(e) => setMeasuredPPV(e.target.value)}
                  step="0.01"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency (Hz)</Label>
                <Input
                  id="frequency"
                  type="number"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="drillDia">Drill Diameter (mm)</Label>
                <Input
                  id="drillDia"
                  type="number"
                  value={drillDia}
                  onChange={(e) => setDrillDia(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bench">Bench Depth (m)</Label>
                <Input
                  id="bench"
                  type="number"
                  value={bench}
                  onChange={(e) => setBench(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="burden">Burden (m)</Label>
                <Input
                  id="burden"
                  type="number"
                  value={burden}
                  onChange={(e) => setBurden(e.target.value)}
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spacing">Spacing (m)</Label>
                <Input
                  id="spacing"
                  type="number"
                  value={spacing}
                  onChange={(e) => setSpacing(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stemming">Stemming (m)</Label>
                <Input
                  id="stemming"
                  type="number"
                  value={stemming}
                  onChange={(e) => setStemming(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subgrade">Sub-grade drilling (m)</Label>
                <Input
                  id="subgrade"
                  type="number"
                  value={subgrade}
                  onChange={(e) => setSubgrade(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="holesPerRow">No of holes per row</Label>
                <Input
                  id="holesPerRow"
                  type="number"
                  value={holesPerRow}
                  onChange={(e) => setHolesPerRow(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noOfRows">No of rows</Label>
                <Input
                  id="noOfRows"
                  type="number"
                  value={noOfRows}
                  onChange={(e) => setNoOfRows(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="explosiveCharge">Explosive charge per hole (kg)</Label>
                <Input
                  id="explosiveCharge"
                  type="number"
                  value={explosiveCharge}
                  onChange={(e) => setExplosiveCharge(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="explosiveType">Explosive type</Label>
                <Input
                  id="explosiveType"
                  type="text"
                  value={explosiveType}
                  onChange={(e) => setExplosiveType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delayBetweenHoles">Delay between holes (ms)</Label>
                <Input
                  id="delayBetweenHoles"
                  type="number"
                  value={delayBetweenHoles}
                  onChange={(e) => setDelayBetweenHoles(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delayBetweenRows">Delay between rows (ms)</Label>
                <Input
                  id="delayBetweenRows"
                  type="number"
                  value={delayBetweenRows}
                  onChange={(e) => setDelayBetweenRows(e.target.value)}
                />
              </div>
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
    </div>
  );
};

export default DataEntryForm;