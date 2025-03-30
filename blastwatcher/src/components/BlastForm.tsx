import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import MineSelector from './MineSelector';
import ResultDisplay from './ResultDisplay';
import { toast } from 'sonner';
import { predictBlastValues } from '@/services/blastService';

const BlastForm = () => {
  // Form state
  const [selectedMine, setSelectedMine] = useState("");
  const [distance, setDistance] = useState("");
  const [maxChargeWeight, setMaxChargeWeight] = useState("");
  const [burden, setBurden] = useState("");
  const [spacing, setSpacing] = useState("");
  const [depth, setDepth] = useState("");
  const [stemming, setStemming] = useState('');
  const [totalChargeLength, setTotalChargeLength] = useState('');
  const [explosivePerHole, setExplosivePerHole] = useState('');
  const [totalExplosive, setTotalExplosive] = useState('');
  const [totalRockBlasted, setTotalRockBlasted] = useState('');
  const [powderFactor, setPowderFactor] = useState('');
  const [frequency, setFrequency] = useState('');

  // Result state
  const [result, setResult] = useState<{
    ppv: number;
    damageLevel: string;
    description: string;
    sd: number;
  } | null>(null);

  // Loading state
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const getDamageLevel = (ppv: number) => {
    if (ppv < 10) return { level: 'None', description: 'No observable damage' };
    if (ppv < 25) return { level: 'Minor', description: 'Fine cracks in plaster' };
    if (ppv < 50) return { level: 'Moderate', description: 'Cracks in walls' };
    if (ppv < 100) return { level: 'Severe', description: 'Major structural damage' };
    return { level: 'Extreme', description: 'Building collapse possible' };
  };

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const value = e.target.value;
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!distance || !maxChargeWeight || parseFloat(distance) <= 0 || parseFloat(maxChargeWeight) <= 0) {
      toast.error("Please enter valid distance and charge weight (must be > 0)");
      return;
    }

    setIsCalculating(true);
    setShowAnimation(true);

    try {
      const formData = {
        selectedMine,
        distance: parseFloat(distance),
        maxChargeWeight: parseFloat(maxChargeWeight),
        burden: burden ? parseFloat(burden) : 0,
        spacing: spacing ? parseFloat(spacing) : 0,
        depth: depth ? parseFloat(depth) : 0,
        stemming: stemming ? parseFloat(stemming) : 0,
        totalChargeLength: totalChargeLength ? parseFloat(totalChargeLength) : 0,
        explosivePerHole: explosivePerHole ? parseFloat(explosivePerHole) : 0,
        totalExplosive: totalExplosive ? parseFloat(totalExplosive) : 0,
        totalRockBlasted: totalRockBlasted ? parseFloat(totalRockBlasted) : 0,
        powderFactor: powderFactor ? parseFloat(powderFactor) : 0,
        frequency: frequency ? parseFloat(frequency) : 0,
      };

      // Single API call for both PPV and SD
      const { predicted_ppv, predicted_sd } = await predictBlastValues(formData);

      const { level, description } = getDamageLevel(predicted_ppv);
      setResult({ 
        ppv: predicted_ppv, 
        damageLevel: level, 
        description, 
        sd: predicted_sd 
      });
      
      toast.success("Prediction completed successfully!");
    } catch (error) {
      toast.error("Failed to get prediction. Please try again.");
      console.error("Prediction error:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-950 shadow-md border border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <MineSelector selectedMine={selectedMine} onChange={setSelectedMine} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-primary">Required Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance from Blast Site (m)</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={distance}
                      onChange={(e) => handleNumberInput(e, setDistance)}
                      className="appearance-none"
                      required
                      min="0.01"
                      step="any"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxChargeWeight">Max Charge Weight per Delay (kg)</Label>
                    <Input
                      id="maxChargeWeight"
                      type="number"
                      value={maxChargeWeight}
                      onChange={(e) => handleNumberInput(e, setMaxChargeWeight)}
                      className="appearance-none"
                      required
                      min="0.01"
                      step="any"
                    />
                  </div>
                </div>
              </div>
              
              {/* Additional parameters */}
              {[
                { id: 'burden', label: 'Burden (m)', value: burden, setter: setBurden },
                { id: 'spacing', label: 'Spacing (m)', value: spacing, setter: setSpacing },
                { id: 'depth', label: 'Depth (m)', value: depth, setter: setDepth },
                { id: 'stemming', label: 'Stemming (m)', value: stemming, setter: setStemming },
                { id: 'totalChargeLength', label: 'Total Charge Length (m)', value: totalChargeLength, setter: setTotalChargeLength },
                { id: 'explosivePerHole', label: 'Explosive per Hole (kg)', value: explosivePerHole, setter: setExplosivePerHole },
                { id: 'totalExplosive', label: 'Total Explosive (kg)', value: totalExplosive, setter: setTotalExplosive },
                { id: 'totalRockBlasted', label: 'Total Rock Blasted (tonnes)', value: totalRockBlasted, setter: setTotalRockBlasted },
                { id: 'powderFactor', label: 'Powder Factor (ton/kg)', value: powderFactor, setter: setPowderFactor },
                { id: 'frequency', label: 'Frequency (Hz)', value: frequency, setter: setFrequency },
              ].map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>{field.label}</Label>
                  <Input
                    id={field.id}
                    type="number"
                    value={field.value}
                    onChange={(e) => handleNumberInput(e, field.setter)}
                    className="appearance-none"
                    min="0"
                    step="any"
                  />
                </div>
              ))}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 transition-all duration-200"
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Predict PPV & Damage Level'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {showAnimation && (
        <div className={`transition-all duration-500 ${isCalculating ? 'opacity-100' : ''}`}>
          <ResultDisplay result={result} isLoading={isCalculating} />
        </div>
      )}
    </div>
  );
};

export default BlastForm;