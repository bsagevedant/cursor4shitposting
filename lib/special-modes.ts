import { ToxicityLevel } from '@/lib/types';
import { getRandomElement } from '@/lib/utils';

export type SpecialMode = 'FounderMeltdown' | 'FakeVCTakes' | 'IITBaitThread';

interface SpecialModeTemplate {
  title: string;
  description: string;
  templates: {
    [key in ToxicityLevel]: string[];
  };
}

export const specialModes: Record<SpecialMode, SpecialModeTemplate> = {
  FounderMeltdown: {
    title: "Founder's Meltdown",
    description: "Generate a dramatic founder meltdown post that's both hilarious and relatable",
    templates: {
      Low: [
        "Just spent 3 hours explaining to my mom why my startup isn't a 'scam' and why I'm not 'wasting my IIT degree' 🙃",
        "Day 183 of building in public: Still can't explain what we do to my relatives without them asking 'But how will you make money?'",
        "When your startup's valuation drops and your parents start forwarding you government job notifications again 😭",
        "The moment you realize your 'revolutionary AI' is just a fancy if-else statement and your investors are coming for a demo tomorrow",
        "My co-founder just left to join Google. My parents are happy. My investors are concerned. My mental health is... existing."
      ],
      Medium: [
        "Just got rejected by YC for the 3rd time. My parents are celebrating. My friends are celebrating. My bank account is crying. But my delusion is stronger than ever! 🚀",
        "When you spend 6 months building 'the next big thing' only to find out someone launched the exact same product yesterday with 10x better UI and 100x more funding",
        "Your startup is failing, your investors are ghosting you, your co-founder is updating their LinkedIn, and your parents are forwarding you UPSC forms. Peak founder life!",
        "Day 1 of 'funding winter': Investors be like 'We're still deploying capital' but also 'We're being very selective' and also 'We're not doing pre-seed anymore'",
        "When your 'revolutionary AI startup' is actually just a wrapper around GPT-4 and your investors find out you're not actually training any models"
      ],
      High: [
        "Just got rejected by 47 VCs in one week. My parents are throwing a party. My friends are sending me job links. My bank account is in the negative. But my delusion is stronger than ever! TO THE MOON! 🚀",
        "Your startup is burning cash faster than your investors can wire money, your co-founder is updating their LinkedIn, your team is sending out resumes, and your parents are forwarding you UPSC forms. But sure, let's call it a 'pivot'!",
        "When you realize your 'revolutionary AI startup' is actually just a wrapper around GPT-4, your investors are coming for a demo tomorrow, and you haven't slept in 72 hours because you're trying to make it look like you're training models",
        "Day 1 of 'funding winter': Investors be like 'We're still deploying capital' but also 'We're being very selective' and also 'We're not doing pre-seed anymore' and also 'Have you considered bootstrapping?'",
        "Your startup is failing, your investors are ghosting you, your co-founder is updating their LinkedIn, your team is sending out resumes, your parents are forwarding you UPSC forms, and your bank account is in the negative. But sure, let's call it a 'learning experience'!"
      ]
    }
  },
  FakeVCTakes: {
    title: "Fake VC Takes",
    description: "Generate satirical VC hot takes that parody the Indian startup ecosystem",
    templates: {
      Low: [
        "Hot take: If your startup isn't 'AI-first', you're basically building a calculator in 2024",
        "The best founders are the ones who can explain their business model in 3 different ways, none of which make sense",
        "If you're not raising at a 100x ARR multiple, are you even trying?",
        "Real talk: Your startup isn't failing because of the market. It's failing because you're not using enough buzzwords in your pitch deck",
        "The secret to raising a Series A: Just add 'AI' to your company name and watch the term sheets roll in"
      ],
      Medium: [
        "If your startup isn't burning $1M/month, you're not thinking big enough. Real founders know that profitability is just a state of mind",
        "The best founders are the ones who can explain their business model in 3 different ways, none of which make sense, and still get a $10M seed round",
        "Hot take: If you're not raising at a 100x ARR multiple, you're basically building a calculator in 2024. Real VCs know that valuation is just a number",
        "Your startup isn't failing because of the market. It's failing because you're not using enough buzzwords in your pitch deck. Add 'AI', 'Web3', and 'quantum' to your next deck",
        "The secret to raising a Series A: Just add 'AI' to your company name, put 'ex-Google' in your bio, and watch the term sheets roll in"
      ],
      High: [
        "If your startup isn't burning $1M/month, you're not thinking big enough. Real founders know that profitability is just a state of mind. Your investors don't care about your burn rate, they care about your story",
        "The best founders are the ones who can explain their business model in 3 different ways, none of which make sense, and still get a $10M seed round. If you can't do that, you're not ready for the big leagues",
        "Hot take: If you're not raising at a 100x ARR multiple, you're basically building a calculator in 2024. Real VCs know that valuation is just a number, and that number should be at least 100x your current revenue",
        "Your startup isn't failing because of the market. It's failing because you're not using enough buzzwords in your pitch deck. Add 'AI', 'Web3', 'quantum', and 'blockchain' to your next deck, and watch the term sheets roll in",
        "The secret to raising a Series A: Just add 'AI' to your company name, put 'ex-Google' in your bio, and watch the term sheets roll in. If that doesn't work, try adding 'ex-Stanford' and 'ex-McKinsey' to your team's bios"
      ]
    }
  },
  IITBaitThread: {
    title: "IIT Bait Thread",
    description: "Generate controversial IIT-related threads that are guaranteed to trigger engagement",
    templates: {
      Low: [
        "Hot take: IITs are overrated. Here's why:",
        "The truth about IIT placements that no one talks about:",
        "Why I left my IIT degree to start a startup:",
        "IIT vs Tier-2 colleges: The real difference no one tells you",
        "The dark side of IIT culture that needs to change:"
      ],
      Medium: [
        "IITs are just glorified coaching centers. Here's why:",
        "The truth about IIT placements that no one talks about: 80% of you will end up in TCS",
        "Why I left my IIT degree to start a startup: Because I realized IIT is just a brand name",
        "IIT vs Tier-2 colleges: The real difference is just the brand name and the placement cell",
        "The dark side of IIT culture: Toxic competition, unnecessary pressure, and zero real-world skills"
      ],
      High: [
        "IITs are just glorified coaching centers. Here's why: 1. You study the same stuff for 4 years 2. You learn nothing practical 3. You get a brand name 4. You end up in TCS anyway",
        "The truth about IIT placements that no one talks about: 80% of you will end up in TCS, 15% will go to startups that will fail, and 5% will actually do something meaningful",
        "Why I left my IIT degree to start a startup: Because I realized IIT is just a brand name, and that brand name doesn't help you build a successful business",
        "IIT vs Tier-2 colleges: The real difference is just the brand name and the placement cell. The education is the same, the students are the same, and the outcomes are the same",
        "The dark side of IIT culture: Toxic competition, unnecessary pressure, zero real-world skills, and a false sense of superiority that will get you nowhere in life"
      ]
    }
  }
};

export function generateSpecialModePost(
  mode: SpecialMode,
  toxicityLevel: ToxicityLevel
): string {
  const modeData = specialModes[mode];
  const template = getRandomElement(modeData.templates[toxicityLevel]);
  
  // For IIT Bait Thread, generate a thread of 3-5 tweets
  if (mode === 'IITBaitThread') {
    const threadLength = Math.floor(Math.random() * 3) + 3; // 3-5 tweets
    const thread = [template];
    
    for (let i = 1; i < threadLength; i++) {
      const nextTemplate = getRandomElement(modeData.templates[toxicityLevel]);
      thread.push(nextTemplate);
    }
    
    return thread.join('\n\n');
  }
  
  return template;
} 