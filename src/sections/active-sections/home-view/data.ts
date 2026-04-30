// src/sections/active-sections/home-view/data.ts
// Room-specific data for HomeView. Only the opened room's info will be shown. Default is empty.

// All rooms data moved from mock.js
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
  allCount: 16,
  myRoomsCount: 5,
  followingCount: 5,
  myRooms: [
    { id: 11, name: 'My Project Room', desc: 'My personal project discussions', icon: '/path/to/room7.jpg', unread: 3 },
    { id: 12, name: 'Study Group', desc: 'Study and learning', icon: '/path/to/room8.jpg', unread: 0 },
    { id: 15, name: 'Fitness Buddies', desc: 'Daily fitness check-ins', icon: '/path/to/room11.jpg', unread: 2 },
    { id: 16, name: 'Book Club', desc: 'Monthly book readings', icon: '/path/to/room12.jpg', unread: 1 },
    { id: 17, name: 'Startup Founders', desc: 'Entrepreneurship and ideas', icon: '/path/to/room13.jpg', unread: 0 },
  ],
  following: [
    { id: 13, name: 'React Devs', desc: 'ReactJS community', icon: '/path/to/room9.jpg', unread: 5 },
    { id: 14, name: 'Music Fans', desc: 'Music lovers unite', icon: '/path/to/room10.jpg', unread: 0 },
    { id: 18, name: 'Travel Bloggers', desc: 'Travel stories and tips', icon: '/path/to/room14.jpg', unread: 4 },
    { id: 19, name: 'Foodies', desc: 'Share your favorite recipes', icon: '/path/to/room15.jpg', unread: 0 },
    { id: 20, name: 'Crypto Enthusiasts', desc: 'Crypto news and discussions', icon: '/path/to/room16.jpg', unread: 2 },
  ],
}