export type ToxicityLevel = 'Low' | 'Medium' | 'High';

export type PostCategoryType = 
  | 'Startups'
  | 'AI/ML'
  | 'Hustle'
  | 'IIT/IIM'
  | 'Crypto'
  | 'Bro Culture';

export interface PostCategory {
  startups: boolean;
  iitIim: boolean;
  aiMl: boolean;
  crypto: boolean;
  hustle: boolean;
  broCulture: boolean;
}

export type SpecialMode = 'FounderMeltdown' | 'FakeVCTakes' | 'IITBaitThread';

export interface Author {
  name: string;
  handle: string;
}

export interface TemplateData {
  templates: {
    [key in ToxicityLevel]: string[];
  };
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