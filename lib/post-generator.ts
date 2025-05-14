import { ToxicityLevel, PostCategory, Author } from '@/lib/types';
import { postTemplates } from '@/lib/post-templates';
import { getRandomElement, getRandomNumber, capitalizeFirstLetter } from '@/lib/utils';

export function generateBrainrotPost(
  toxicityLevel: ToxicityLevel, 
  categories: PostCategory[]
): { post: string; author: Author } {
  // Get random template for the selected toxicity level
  const template = getRandomElement(postTemplates.templates[toxicityLevel]);
  
  // Generate the post by filling in the template variables
  let post = template;
  
  // Replace variables in the template
  post = post.replace(/\{buzzword\}/g, () => getRandomElement(postTemplates.buzzwords));
  post = post.replace(/\{comparison\}/g, () => getRandomElement(postTemplates.comparisons));
  
  // Replace category-specific placeholders with content from selected categories
  if (post.includes('{startup}') && categories.includes('Startups')) {
    post = post.replace(/\{startup\}/g, () => getRandomElement(postTemplates.phrases.startup));
  } else if (post.includes('{startup}')) {
    // Fallback if the category is not selected but the template has the placeholder
    post = post.replace(/\{startup\}/g, () => getRandomElement(postTemplates.phrases.startup));
  }
  
  if (post.includes('{iit}') && categories.includes('IIT/IIM')) {
    post = post.replace(/\{iit\}/g, () => getRandomElement(postTemplates.phrases.iit));
  } else if (post.includes('{iit}')) {
    post = post.replace(/\{iit\}/g, () => getRandomElement(postTemplates.phrases.iit));
  }
  
  if (post.includes('{ai}') && categories.includes('AI/ML')) {
    post = post.replace(/\{ai\}/g, () => getRandomElement(postTemplates.phrases.ai));
  } else if (post.includes('{ai}')) {
    post = post.replace(/\{ai\}/g, () => getRandomElement(postTemplates.phrases.ai));
  }
  
  if (post.includes('{crypto}') && categories.includes('Crypto')) {
    post = post.replace(/\{crypto\}/g, () => getRandomElement(postTemplates.phrases.crypto));
  } else if (post.includes('{crypto}')) {
    post = post.replace(/\{crypto\}/g, () => getRandomElement(postTemplates.phrases.crypto));
  }
  
  if (post.includes('{hustle}') && categories.includes('Hustle')) {
    post = post.replace(/\{hustle\}/g, () => getRandomElement(postTemplates.phrases.hustle));
  } else if (post.includes('{hustle}')) {
    post = post.replace(/\{hustle\}/g, () => getRandomElement(postTemplates.phrases.hustle));
  }
  
  if (post.includes('{bro}') && categories.includes('Bro Culture')) {
    post = post.replace(/\{bro\}/g, () => getRandomElement(postTemplates.phrases.bro));
  } else if (post.includes('{bro}')) {
    post = post.replace(/\{bro\}/g, () => getRandomElement(postTemplates.phrases.bro));
  }
  
  // Add some Hinglish phrases
  if (Math.random() > 0.6) {
    const hinglishPhrase = getRandomElement(postTemplates.phrases.hinglish);
    // Append the Hinglish phrase or insert it somewhere in the post
    if (Math.random() > 0.5 && post.length < 220) {
      post += ` ${hinglishPhrase}`;
    } else {
      const sentences = post.split('. ');
      if (sentences.length > 1) {
        const position = Math.floor(Math.random() * sentences.length);
        sentences[position] += ` ${hinglishPhrase}`;
        post = sentences.join('. ');
      } else {
        post += ` ${hinglishPhrase}`;
      }
    }
  }
  
  // Add emoji based on toxicity level
  const emojiChance = toxicityLevel === 'Low' ? 0.3 : toxicityLevel === 'Medium' ? 0.5 : 0.7;
  if (Math.random() < emojiChance) {
    const emojis = ['🚀', '🔥', '💯', '👊', '🤦‍♂️', '😂', '🙏', '👀', '💪', '🧠'];
    const emojiCount = Math.floor(Math.random() * 3) + 1;
    const selectedEmojis = Array(emojiCount).fill(0).map(() => getRandomElement(emojis)).join('');
    
    // Add emojis at the end or somewhere in the middle
    if (Math.random() > 0.7) {
      post += ` ${selectedEmojis}`;
    } else {
      const words = post.split(' ');
      if (words.length > 5) {
        const position = Math.floor(Math.random() * (words.length - 3)) + 3;
        words[position] += ` ${selectedEmojis}`;
        post = words.join(' ');
      } else {
        post += ` ${selectedEmojis}`;
      }
    }
  }
  
  // Select a random author
  const author = getRandomElement(postTemplates.authors);
  
  return { post, author };
}