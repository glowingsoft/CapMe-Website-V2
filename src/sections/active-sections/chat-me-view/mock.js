export const AI_RESPONSES = [
  "That's a fascinating reflection! Based on your journal patterns, I can see you engage deeply with your daily experiences. Let's explore that further — what feeling stands out most right now?",
  "Great insight! Your data suggests a strong pattern of self-awareness. How does this connect to what you experienced today?",
  "I see interesting themes emerging across your content. Would you like me to analyze your recent emotional patterns in more detail?",
  "Based on your history, you consistently focus on growth and learning. What's been your biggest insight this week?",
  "Your writing shows a high level of introspection. I'd love to help you decode the emotions beneath this — can you tell me more?",
];

export const INTERESTS = [
  {
    title: 'Event Planning',
    score: 85,
    confidence: 90,
    description:
      "The person is involved in discussions about event planning, weddings, and celebrations, as seen in the 'Dance' room with topics like decor and floral arrangements.",
    tags: ['Event planning', 'Weddings', 'Celebrations', 'Decor'],
  },
  {
    title: 'Vegan Cuisine',
    score: 80,
    confidence: 85,
    description:
      'Multiple entries mention vegan food, desserts, and restaurants, indicating a strong interest in vegan cuisine.',
    tags: ['Restaurants', 'Vegan food', 'Desserts', 'Vegan'],
  },
  {
    title: 'Data Analytics',
    score: 75,
    confidence: 80,
    description:
      'Frequent mentions of dashboards, insights, and reporting suggest interest in data analytics and performance tracking.',
    tags: ['Dashboards', 'Reporting', 'Insights', 'Metrics'],
  },
  {
    title: 'Fitness & Wellness',
    score: 72,
    confidence: 78,
    description:
      'Mentions of workouts, routines, and staying consistent suggest an interest in fitness and general wellness.',
    tags: ['Workouts', 'Wellness', 'Routines', 'Consistency'],
  },
  {
    title: 'Travel & Exploration',
    score: 70,
    confidence: 76,
    description:
      'References to destinations, trips, and planning itineraries indicate a strong curiosity for travel and exploring new places.',
    tags: ['Destinations', 'Itineraries', 'Hotels', 'Adventure'],
  },
  {
    title: 'Personal Finance',
    score: 68,
    confidence: 74,
    description:
      'Discussions about budgeting, savings, and managing expenses suggest interest in personal finance and planning.',
    tags: ['Budgeting', 'Savings', 'Expenses', 'Investing'],
  },
  {
    title: 'Technology & AI',
    score: 84,
    confidence: 88,
    description: 'Strong interest in new tools, AI workflows, and building products with modern technology.',
    tags: ['AI', 'Tools', 'Automation', 'Product'],
  },
  {
    title: 'Design & UI/UX',
    score: 79,
    confidence: 83,
    description:
      'Frequent talk about layouts, components, and polishing interfaces indicates a strong design focus.',
    tags: ['UI', 'UX', 'Components', 'Prototypes'],
  },
  {
    title: 'Cooking & Recipes',
    score: 66,
    confidence: 72,
    description:
      'Mentions of meal prep, recipes, and trying new dishes suggest a consistent interest in cooking.',
    tags: ['Recipes', 'Meal prep', 'Home cooking', 'New dishes'],
  },
];

export const CHAT_HISTORY = [
  { id: 1,  text: 'How many rooms in my graph',                                   group: 'older' },
  { id: 2,  text: 'Hello',                                                        group: 'older' },
  { id: 3,  text: "Summarize the main themes I've been exploring recently.",      group: 'older' },
  { id: 4,  text: "Without data, you're just another person with an opinion…",   group: 'older' },
  { id: 5,  text: 'Make some post regarding nature',                              group: 'older' },
  { id: 6,  text: 'What are three values that keep showing up in my entries?',   group: 'older' },
  { id: 7,  text: 'What do I seem to be searching for?',                          group: 'older' },
  { id: 8,  text: '3 ways to boost my productivity today.',                       group: 'this_week' },
  { id: 9,  text: 'What emotional needs might be underneath my recent posts…',   group: 'this_week' },
  { id: 10, text: 'Turn one of my posts into a poem or short story.',             group: 'this_week' },
  { id: 11, text: '3 ways to boost my productivity today.',                       group: 'this_week' },
  { id: 12, text: 'Here to drop updates before even Google catches up 😉 S…',   group: 'yesterday' },
  { id: 13, text: 'What do I seem to be searching for?',                          group: 'yesterday' },
  { id: 14, text: "Check messages I haven't seen yet.",                           group: 'yesterday' },
  { id: 15, text: '3 ways to boost my productivity today.',                       group: 'today' },
  { id: 16, text: "Overview of rooms I've created.",                              group: 'today' },
  { id: 17, text: 'What emotional needs might be underneath my recent posts…',   group: 'today' },
  { id: 18, text: 'who am i what kind of person please give all information a…', group: 'today' },
];

export const CHAT_HISTORY_GROUP_ORDER = ['today', 'yesterday', 'this_week', 'older'];

export const CHAT_HISTORY_GROUP_LABELS = {
  today:     'Today',
  yesterday: 'Yesterday',
  this_week: 'This Week',
  older:     'Older',
};

export const SUMMARY = {
  title: 'Overview',
  sections: [
    {
      heading: 'Overall Overview',
      body:
        'The individual in question appears to be deeply engaged with digital platforms, suggesting a strong orientation towards modern communication technologies and an affinity for sharing and gathering information online. Their activity, characterized by a blend of neutral sentiment messages and a wide array of topics, points to a personality that is exploratory yet maintains a level of detachment or objectivity. This person likely values knowledge and has a broad range of interests, from event planning and art to more niche areas indicated by specific web links.',
    },
    {
      heading: 'Core Values and Beliefs',
      body:
        "The user's engagement with diverse topics like art, event planning, and specific thematic contents such as weddings and outdoor events suggests a value for aesthetics, organization, and possibly a celebration of life's milestones. Their neutral sentiment across messages, even when discussing data and decision-making, indicates a belief in objectivity and possibly a scientific or analytical approach to life. Their regular use of links and hashtags shows a belief in the power of digital communication and networking.",
    },
  ],
};

