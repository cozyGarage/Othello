export interface BlogPost {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  tone: 'strategy' | 'news' | 'design';
}

export const blogPosts: BlogPost[] = [
  {
    id: 'timing-upgrades',
    title: 'Mastering tempo with the new time controls',
    category: 'Strategy',
    readTime: '4 min',
    summary:
      'A practical guide to blitz-friendly presets, increment psychology, and how the timer pairs with hints.',
    tone: 'strategy',
  },
  {
    id: 'engine-notes',
    title: 'Under the hood: how our engine evaluates a position',
    category: 'Engineering',
    readTime: '5 min',
    summary:
      'Peek at the evaluation graph, transposition table tuning, and why certain edge grabs swing the curve.',
    tone: 'news',
  },
  {
    id: 'ui-refresh',
    title: 'Designing a calmer board for high-focus play',
    category: 'Design',
    readTime: '3 min',
    summary:
      'The new typography, layered gradients, and layout rhythm that make long sessions easier on the eyes.',
    tone: 'design',
  },
];
