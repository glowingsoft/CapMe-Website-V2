export const MOCK_FOLLOWERS = [
  { id: 1, name: 'Glowingsoft Technologies.' },
  { id: 2, name: 'Glowingsoft Technologies.' },
  { id: 3, name: 'Ryan Lewis' },
];

export const MOCK_ROOM_REQUESTS = [
  {
    id: 'req-1',
    name: 'Brandon Stone',
    avatar: 'https://i.pravatar.cc/100?img=12',
    requestedAt: '2h ago',
  },
  {
    id: 'req-2',
    name: 'Mia Claire',
    avatar: 'https://i.pravatar.cc/100?img=32',
    requestedAt: '5h ago',
  },
  {
    id: 'req-3',
    name: 'Noah Williams',
    avatar: 'https://i.pravatar.cc/100?img=52',
    requestedAt: 'Yesterday',
  },
];

export const MOCK_ROOM_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Alexa Morgan',
    avatar: 'https://i.pravatar.cc/100?img=47',
    role: 'viewer',
  },
  {
    id: 'mem-2',
    name: 'Daniel Reed',
    avatar: 'https://i.pravatar.cc/100?img=25',
    role: 'editor',
  },
  {
    id: 'mem-3',
    name: 'Sophia Carter',
    avatar: 'https://i.pravatar.cc/100?img=61',
    role: 'viewer',
  },
];

export const posts = [
  {
    id: 1,
    type: 'message',
    user: { name: 'Alexa Hales', username: '@alexa9123' },
    content: 'Had an amazing discussion with my team about our daily targets. I guided them through everything.',
    hashtags: '',
    stats: { likes: 321, comments: 123, shares: 21 },
    time: '10:30 AM',
    visibility: 'public',
  },

  { type: 'date', label: 'Tuesday, July 20th' },

  {
    id: 2,
    type: 'message',
    user: { name: 'Alexa Hales', username: '@alexa9123' },
    content: 'Just wrapped up a super productive study on AI/ML. Feeling more confident for the exams ahead!',
    image: 'https://picsum.photos/seed/ai-study/1600/900',
    hashtags: '#studytime #focusmode #studentlife #examprep',
    stats: { likes: 321, comments: 123, shares: 21 },
    time: '2:15 PM',
    visibility: 'friends',
  },

  { type: 'date', label: 'Wednesday, July 21st' },

  {
    id: 3,
    type: 'message',
    user: { name: 'Alexa Hales', username: '@alexa9123' },
    content: 'Good morning everyone! Ready for another productive day.',
    hashtags: '#morning #productivity',
    stats: { likes: 98, comments: 44, shares: 10 },
    time: '9:00 AM',
    visibility: 'private',
  },

  { type: 'date', label: 'Thursday, July 22nd' },

  {
    id: 4,
    type: 'message',
    user: { name: 'Jordan Blake', username: '@jordan_b' },
    content: 'Explored the city this weekend — the architecture was breathtaking!',
    image: 'https://picsum.photos/seed/city-explore/1600/900',
    hashtags: '#travel #citylife #architecture',
    stats: { likes: 214, comments: 56, shares: 18 },
    time: '11:45 AM',
    visibility: 'public',
  },

  {
    id: 5,
    type: 'message',
    user: { name: 'Sam Rivera', username: '@sam_r' },
    content: 'Cooked this from scratch tonight — turned out better than expected 🍝',
    image: 'https://picsum.photos/seed/food-pasta/1600/900',
    hashtags: '#cooking #homemade #foodie',
    stats: { likes: 178, comments: 31, shares: 9 },
    time: '7:30 PM',
    visibility: 'friends',
  },
];

export const suggestedRooms = [
  { id: 1, name: 'Creative Rooms', desc: 'Hey Creative Rooms...', active: true },
  { id: 2, name: 'Colleques', desc: 'Office Colleagues!!!!' },
  { id: 3, name: 'Finance Mania', desc: 'Finance Makers...' },
  { id: 4, name: 'Travel Lovers', desc: 'Travelling Lovers...' },
  { id: 5, name: 'Friends Forever', desc: 'Friends Zone...' },
  { id: 6, name: 'Technology Lover', desc: 'IT Technology Lovers...' },
];

export const MOCK_ROOM_MEDIA = {
  images: [
    { id: 1, color: '#b3c6ff' },
    { id: 2, color: '#ffd6e7' },
    { id: 3, color: '#c6f4d6' },
    { id: 4, color: '#ffecc6' },
    { id: 5, color: '#d6eaff' },
    { id: 6, color: '#ffe0c6' },
    { id: 7, color: '#e0c6ff' },
    { id: 8, color: '#c6ffe0' },
    { id: 9, color: '#ffc6c6' },
  ],
  videos: [
    { id: 1, name: 'Team meeting', duration: '12:34', color: '#1a1a2e' },
    { id: 2, name: 'Product demo', duration: '5:21', color: '#16213e' },
    { id: 3, name: 'Training session', duration: '45:00', color: '#0f3460' },
    { id: 4, name: 'Onboarding call', duration: '28:15', color: '#1a2744' },
  ],
  audio: [
    { id: 1, name: 'Voice note - Monday', duration: '0:45', size: 38400 },
    { id: 2, name: 'Meeting summary', duration: '2:10', size: 112640 },
    { id: 3, name: 'Announcement', duration: '1:05', size: 56320 },
    { id: 4, name: 'Weekly recap', duration: '3:22', size: 174080 },
  ],
  files: [
    { id: 1, name: 'Q3 Report.pdf', size: 2457600, type: 'application/pdf' },
    { id: 2, name: 'Project Plan.docx', size: 819200, type: 'application/docx' },
    { id: 3, name: 'Budget Sheet.xlsx', size: 614400, type: 'application/xlsx' },
    { id: 4, name: 'Presentation.pptx', size: 5242880, type: 'application/pptx' },
  ],
};

export const commentsData = {
  1: [
    { id: 1, user: 'Alexa Hales', text: 'Very Good! Keep Growing.', likes: 12, replies: 32, time: '10:35 AM' },
    { id: 2, user: 'John Doe', text: 'Very Good.', likes: 43, replies: 12, time: '10:40 AM' },
  ],
  2: [
    { id: 1, user: 'Alex Hales', text: 'Very Interesting.', likes: 632, replies: 31, time: '2:20 PM' },
    { id: 2, user: 'John Micky', text: 'Best of luck guyz!!!!', likes: 632, replies: 31, time: '2:22 PM' },
    { id: 3, user: 'Max Henry', text: 'Very great.', likes: 632, replies: 31, time: '2:25 PM' },
  ],
};
