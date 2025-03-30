import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getPPVColor } from '@/lib/blastCalculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

interface ResultDisplayProps {
  result: {
    ppv: number;
    sd: number;
    damageLevel: string;
    description: string;
  } | null;
  isLoading: boolean;
}

const LOCAL_STORAGE_KEY = 'blast_graph_data';

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<{ sd: number; ppv: number }[]>([]);

  // Load graph data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      setGraphData(JSON.parse(storedData));
    }
  }, []);

  // Update graph when new result arrives
  useEffect(() => {
    if (result) {
      const updatedData = [...graphData, { sd: result.sd, ppv: result.ppv }];
      setGraphData(updatedData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [result]);

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-950 shadow-md border border-gray-200 dark:border-gray-800 animate-pulse">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-medium flex items-center justify-center h-7 bg-gray-200 dark:bg-gray-800 rounded"></CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  return (
    <Card
      ref={cardRef}
      className="bg-white dark:bg-gray-950 shadow-md border border-gray-200 dark:border-gray-800 animate-fade-in"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Blast Impact Prediction Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* PPV */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex flex-col items-center justify-center">
            <div className="text-xl font-semibold text-primary">Peak Particle Velocity</div>
            <div className="mt-2 text-2xl font-bold">{result.ppv} mm/s</div>
          </div>

          {/* SD */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex flex-col items-center justify-center">
            <div className="text-xl font-semibold text-primary">Scaled Distance (SD)</div>
            <div className="mt-2 text-2xl font-bold">{result.sd}</div>
          </div>

          {/* Damage Level */}
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center">
            <div className="text-xl font-semibold">Damage Level</div>
            <div className={`mt-2 text-2xl font-bold ${getPPVColor(result.damageLevel)}`}>
              {result.damageLevel}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="text-lg font-semibold mb-2">Expected Impact</div>
            <div className="text-sm text-gray-700 dark:text-gray-300">{result.description}</div>

            <div className="mt-auto pt-2 flex items-center">
              {result.damageLevel === 'None' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : result.damageLevel === 'Minor' ? (
                <Info className="h-5 w-5 text-yellow-500 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="text-sm font-medium">
                {result.damageLevel === 'None'
                  ? 'Safe to proceed with blast'
                  : result.damageLevel === 'Minor'
                  ? 'Proceed with caution'
                  : 'Consider blast redesign'}
              </span>
            </div>
          </div>
        </div>

        {/* BEAUTIFUL GRAPH */}
        <div className="mt-8 w-full h-72 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-inner border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">PPV vs Scaled Distance Graph</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Live data collected from your predictions</p>

          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={graphData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPpv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#8884d8" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
              <XAxis 
                dataKey="sd" 
                tick={{ fill: '#8884d8', fontSize: 12 }} 
                label={{ value: 'Scaled Distance (SD)', position: 'insideBottomRight', offset: -5, fill: '#666' }} 
              />
              <YAxis 
                tick={{ fill: '#8884d8', fontSize: 12 }} 
                label={{ value: 'PPV (mm/s)', angle: -90, position: 'insideLeft', fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none' }}
                labelStyle={{ color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ color: '#666' }} />
              <Line 
                type="monotone" 
                dataKey="ppv" 
                stroke="#8884d8" 
                strokeWidth={3} 
                dot={{ r: 5, stroke: '#8884d8', strokeWidth: 2, fill: '#fff' }} 
                activeDot={{ r: 8 }}
                isAnimationActive
              />
              <Area 
                type="monotone" 
                dataKey="ppv" 
                stroke="none" 
                fill="url(#colorPpv)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
