"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PostCategoryType } from "@/lib/types";

interface CategorySelectorProps {
  selectedCategories: PostCategoryType[];
  onChange: (categories: PostCategoryType[]) => void;
}

export function CategorySelector({ selectedCategories, onChange }: CategorySelectorProps) {
  const allCategories: PostCategoryType[] = [
    'Startups', 
    'IIT/IIM', 
    'AI/ML', 
    'Crypto', 
    'Hustle', 
    'Bro Culture'
  ];
  
  const toggleCategory = (category: PostCategoryType) => {
    if (selectedCategories.includes(category)) {
      // Don't allow deselecting if it would result in no categories
      if (selectedCategories.length > 1) {
        onChange(selectedCategories.filter(c => c !== category));
      }
    } else {
      onChange([...selectedCategories, category]);
    }
  };
  
  const getCategoryEmoji = (category: PostCategoryType) => {
    switch(category) {
      case 'Startups': return '🚀';
      case 'IIT/IIM': return '🎓';
      case 'AI/ML': return '🤖';
      case 'Crypto': return '💰';
      case 'Hustle': return '💪';
      case 'Bro Culture': return '👊';
      default: return '📱';
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {allCategories.map((category) => (
        <div 
          key={category}
          className="flex items-center space-x-2 rounded-md border border-input p-3 transition-colors hover:bg-accent cursor-pointer"
          onClick={() => toggleCategory(category)}
        >
          <Checkbox 
            id={`category-${category}`} 
            checked={selectedCategories.includes(category)}
            onCheckedChange={() => toggleCategory(category)}
          />
          <Label 
            htmlFor={`category-${category}`}
            className="flex-1 cursor-pointer"
          >
            <span className="mr-2">{getCategoryEmoji(category)}</span>
            {category}
          </Label>
        </div>
      ))}
    </div>
  );
}