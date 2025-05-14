"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ToxicityLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ToxicitySliderProps {
  value: ToxicityLevel;
  onChange: (value: ToxicityLevel) => void;
}

export function ToxicitySlider({ value, onChange }: ToxicitySliderProps) {
  const toxicityLevels: ToxicityLevel[] = ['Low', 'Medium', 'High'];
  
  const getColorClass = (level: ToxicityLevel) => {
    switch(level) {
      case 'Low': return 'from-green-500 to-green-600';
      case 'Medium': return 'from-amber-500 to-amber-600';
      case 'High': return 'from-red-500 to-red-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };
  
  const getDescription = (level: ToxicityLevel) => {
    switch(level) {
      case 'Low': return 'Harmless satire, light sarcasm';
      case 'Medium': return 'Edgy, mildly offensive';
      case 'High': return 'Unfiltered brainrot, rage bait';
      default: return '';
    }
  };

  return (
    <div className="space-y-3">
      <RadioGroup 
        defaultValue={value} 
        value={value}
        onValueChange={(val) => onChange(val as ToxicityLevel)}
        className="flex gap-2 items-center"
      >
        {toxicityLevels.map((level) => (
          <div key={level} className="flex-1">
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value={level} 
                id={`toxicity-${level.toLowerCase()}`} 
                className={cn(
                  "peer",
                  value === level && "border-2"
                )}
              />
              <Label 
                htmlFor={`toxicity-${level.toLowerCase()}`}
                className={cn(
                  "w-full cursor-pointer select-none rounded-md border border-input px-3 py-2 text-center transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  "peer-data-[state=checked]:border-primary",
                  value === level && "border-2 border-primary"
                )}
              >
                {level}
              </Label>
            </div>
          </div>
        ))}
      </RadioGroup>
      
      <div 
        className={cn(
          "h-2 w-full rounded-full bg-gradient-to-r transition-all duration-300",
          getColorClass(value)
        )}
      />
      
      <p className="text-sm text-muted-foreground">
        {getDescription(value)}
      </p>
    </div>
  );
}