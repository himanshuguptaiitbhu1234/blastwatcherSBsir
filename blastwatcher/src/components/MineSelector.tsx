
import React from 'react';
import { mines } from '@/lib/mockData';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface MineSelectorProps {
  selectedMine: string;
  onChange: (mine: string) => void;
}

const MineSelector: React.FC<MineSelectorProps> = ({ selectedMine, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="mine-select">Select Mine</Label>
      <Select 
        value={selectedMine} 
        onValueChange={onChange}
      >
        <SelectTrigger 
          id="mine-select"
          className="w-full bg-white dark:bg-gray-900 transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          <SelectValue placeholder="Select a mine" />
        </SelectTrigger>
        <SelectContent>
          {mines.map((mine) => (
            <SelectItem 
              key={mine.id} 
              value={mine.name}
              className="cursor-pointer focus:bg-primary/10 focus:text-primary"
            >
              <div className="flex items-center gap-2">
                <span>{mine.name}</span>
                <span className="text-xs text-muted-foreground">({mine.location})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MineSelector;
