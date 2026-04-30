// Dummy data for left drawer (Rooms)
export const roomsData = {
  favourite: [
    { id: 1, name: 'Creative Rooms', desc: 'Hey, how are you guyz....', icon: '/path/to/room1.jpg', unread: 2, favorite: true },
    { id: 2, name: 'Friendship Goals', desc: 'Hey, how are you guyz....', icon: '/path/to/room2.jpg', unread: 0, favorite: true },
    { id: 3, name: 'Music Mania', desc: 'Hey, how are you guyz....', icon: '/path/to/room3.jpg', unread: 1, favorite: true },
    { id: 4, name: 'Travel Lovers', desc: 'Hey, how are you guyz....', icon: '/path/to/room4.jpg', unread: 0, favorite: true },
    { id: 5, name: 'Health Tracker', desc: 'Hey, how are you guyz....', icon: '/path/to/room5.jpg', unread: 0, favorite: true },
  ],
  other: [
    { id: 6, name: 'Creative Rooms', desc: 'Hey, how are you guyz....', icon: '/path/to/room1.jpg', unread: 0 },
    { id: 7, name: 'Range Rover Lovers', desc: 'Hey, how are you guyz....', icon: '/path/to/room6.jpg', unread: 0 },
    { id: 8, name: 'Colleques', desc: 'Hey, how are you guyz....', icon: '/path/to/room2.jpg', unread: 0 },
    { id: 9, name: 'Travel Lovers', desc: 'Hey, how are you guyz....', icon: '/path/to/room4.jpg', unread: 0 },
    { id: 10, name: 'Health Tracker', desc: 'Hey, how are you guyz....', icon: '/path/to/room5.jpg', unread: 0 },
  ],
  allCount: 231,
  myRooms: 0,
  following: 0,
};
// Dummy data for demonstration
export const posts = [
  {
    id: 1,
    user: { name: 'Alexa Hales', username: '@alexa9123', avatar: '/path/to/avatar1.jpg' },
    image: 'https://cdn.shopify.com/s/files/1/0704/6378/2946/files/c8baf3fed53c36888ad4c3b60d0ce4bfdf291776_1.jpg?v=1777534552',
    date: 'Tuesday, July 20th',
    content: 'Had an amazing discussion with my team about our daily targets. I guided them through everything.',
    stats: { likes: 321, comments: 123, shares: 21 },
  },
  {
    id: 2,
    user: { name: 'Alexa Hales', username: '@alexa9123', avatar: '/path/to/avatar1.jpg' },
    date: 'Tuesday, July 20th',
    content: 'Just wrapped up a super productive study on AI/ML. Feeling more confident for the exams ahead!',
    hashtags: '#studytime #focusmode #studentlife #examprep',
    stats: { likes: 321, comments: 123, shares: 21 },
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

// Dummy comments for each post
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
