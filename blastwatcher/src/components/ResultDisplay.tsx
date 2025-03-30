import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { getPPVColor } from '@/lib/blastCalculations';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface ResultDisplayProps {
  result: {
    ppv: number;
    sd: number;
    damageLevel: string;
    description: string;
  } | null;
  isLoading: boolean;
  selectedMine?: string;
}

interface GraphDataPoint {
  sd: number;
  ppv: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, selectedMine }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(false);

  // Fetch graph data from backend
  const fetchGraphData = async () => {
    try {
      if (!selectedMine) return;
      
      setIsFetchingData(true);
      const response = await fetch(`http://localhost:5000/get-predictions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch graph data');
      }
      
      const data = await response.json();
      if (data.success) {
        setGraphData(data.data);
      }
    } catch (error) {
      console.error('Error fetching graph data:', error);
      toast.error('Failed to load historical data');
    } finally {
      setIsFetchingData(false);
    }
  };

  // Load graph data on mount and when mine changes
  useEffect(() => {
    fetchGraphData();
  }, [selectedMine]);

  // Update graph when new result arrives
  useEffect(() => {
    if (result) {
      const updatedData = [...graphData, { sd: result.sd, ppv: result.ppv }];
      setGraphData(updatedData);
      
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [result]);

  // Function to capture and save the graph as an image
  const captureGraph = async () => {
    if (!graphRef.current) return;
    
    try {
      const canvas = await html2canvas(graphRef.current);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'blast_prediction_graph.png';
      link.click();
    } catch (error) {
      console.error('Error capturing graph:', error);
      toast.error('Failed to capture graph');
    }
  };

  if (isLoading || isFetchingData) {
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
    <Card ref={cardRef} className="bg-white dark:bg-gray-950 shadow-md border border-gray-200 dark:border-gray-800 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium">Blast Impact Prediction Results</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Graph Section */}
        <div ref={graphRef} className="mt-8 w-full h-72 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-inner border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-1 text-gray-700 dark:text-gray-200">
            PPV vs Scaled Distance Graph
            {selectedMine && <span className="text-sm font-normal ml-2">(for {selectedMine})</span>}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {graphData.length > 0 
              ? `Showing ${graphData.length} historical predictions` 
              : 'No historical data available'}
          </p>

          <ResponsiveContainer width="100%" height="90%">
            <LineChart 
              data={graphData} 
              margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="4 4" strokeOpacity={0.3} />
              <XAxis dataKey="sd" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ppv" stroke="#8884d8" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Capture Button */}
        <button 
          onClick={captureGraph} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          Capture Graph
        </button>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
