export const MOCK_FOLLOWERS = [
  {
    id: 1,
    name: 'Glowingsoft Technologies.',
    avatar: 'https://i.pravatar.cc/80?img=12',
  },
  {
    id: 2,
    name: 'Glowingsoft Technologies.',
    avatar: 'https://i.pravatar.cc/80?img=15',
  },
  {
    id: 3,
    name: 'Ryan Lewis',
    avatar: 'https://i.pravatar.cc/80?img=8',
  },
];
// mock.js - UPDATE THIS FILE

export const posts = [
  // First post — NO date before it
  {
    id: 1,
    type: 'message',
    user: {
      name: 'Alexa Hales',
      username: '@alexa9123',
      avatar: '/path/to/avatar1.jpg',
    },
    image: 'https://cdn.shopify.com/s/files/1/0704/6378/2946/files/c8baf3fed53c36888ad4c3b60d0ce4bfdf291776_1.jpg?v=1777534552',
    content: 'Had an amazing discussion with my team about our daily targets. I guided them through everything.',
    hashtags: '',
    stats: { likes: 321, comments: 123, shares: 21 },
    time: '10:30 AM',
  },

  // ← Date separator BETWEEN posts
  {
    type: 'date',
    label: 'Tuesday, July 20th',
  },

  {
    id: 2,
    type: 'message',
    user: {
      name: 'Alexa Hales',
      username: '@alexa9123',
      avatar: '/path/to/avatar1.jpg',
    },
    image: '',
    content: 'Just wrapped up a super productive study on AI/ML. Feeling more confident for the exams ahead!',
    hashtags: '#studytime #focusmode #studentlife #examprep',
    stats: { likes: 321, comments: 123, shares: 21 },
    time: '2:15 PM',
  },

  // ← Date separator BETWEEN posts
  {
    type: 'date',
    label: 'Wednesday, July 21st',
  },

  {
    id: 3,
    type: 'message',
    user: {
      name: 'Alexa Hales',
      username: '@alexa9123',
      avatar: '/path/to/avatar1.jpg',
    },
    image: '',
    content: 'Good morning everyone! Ready for another productive day.',
    hashtags: '#morning #productivity',
    stats: { likes: 98, comments: 44, shares: 10 },
    time: '9:00 AM',
  },
];

export const suggestedRooms = [
  { id: 1, name: 'Creative Rooms', desc: 'Hey Creative Rooms...', icon: '/path/to/room1.jpg', active: true },
  { id: 2, name: 'Colleques', desc: 'Office Colleagues!!!!', icon: '/path/to/room2.jpg' },
  { id: 3, name: 'Finance Mania', desc: 'Finance Makers...', icon: '/path/to/room3.jpg' },
  { id: 4, name: 'Travel Lovers', desc: 'Travelling Lovers...', icon: '/path/to/room4.jpg' },
  { id: 5, name: 'Friends Forever', desc: 'Friends Zone...', icon: '/path/to/room5.jpg' },
  { id: 6, name: 'Technology Lover', desc: 'IT Technology Lovers...', icon: '/path/to/room6.jpg' },
];

export const commentsData = {
  1: [
    { id: 1, user: 'Alexa Hales', username: '@alexa9123', avatar: '/path/to/avatar1.jpg', text: 'Very Good! Keep Growing.', likes: 12, replies: 32 },
    { id: 2, user: 'John Doe', username: '@john0312', avatar: '/path/to/avatar2.jpg', text: 'Very Good.', likes: 43, replies: 12 },
  ],
  2: [
    { id: 1, user: 'Alex Hales', username: '@alex9856', avatar: '/path/to/avatar1.jpg', text: 'Very Interesting.', likes: 632, replies: 31 },
    { id: 2, user: 'John Micky', username: '@john1235', avatar: '/path/to/avatar3.jpg', text: 'Best of luck guyz!!!!', likes: 632, replies: 31 },
    { id: 3, user: 'Max Henry', username: '@max56', avatar: '/path/to/avatar4.jpg', text: 'Very great.', likes: 632, replies: 31 },
  ],
};