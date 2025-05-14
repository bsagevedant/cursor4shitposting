export type ToxicityLevel = 'Low' | 'Medium' | 'High';

export type PostCategory = 
  | 'Startups' 
  | 'IIT/IIM' 
  | 'AI/ML' 
  | 'Crypto' 
  | 'Hustle' 
  | 'Bro Culture';

export interface Author {
  name: string;
  handle: string;
}

export interface TemplateData {
  templates: Record<ToxicityLevel, string[]>;
  phrases: {
    startup: string[];
    iit: string[];
    ai: string[];
    crypto: string[];
    hustle: string[];
    bro: string[];
    hinglish: string[];
  };
  comparisons: string[];
  buzzwords: string[];
  authors: Author[];
}