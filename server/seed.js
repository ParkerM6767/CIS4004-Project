require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Game = require('./models/Game');
const Review = require('./models/Review');

const GAMES = [
  {
    title: 'The Witcher 3: Wild Hunt',
    description: 'An open-world action RPG set in a visually stunning fantasy universe full of meaningful choices and impactful consequences. Follow Geralt of Rivia as he hunts for his adopted daughter across a massive open world.',
    author: 'CD Projekt Red',
    genre: 'RPG',
    releaseYear: 2015,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/0/0c/Witcher_3_cover_art.jpg',
  },
  {
    title: 'Elden Ring',
    description: 'A fantasy action-RPG adventure set within a world created by Hidetaka Miyazaki and George R.R. Martin. Explore the Lands Between, a realm of demigods and ancient magic.',
    author: 'FromSoftware',
    genre: 'Action RPG',
    releaseYear: 2022,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Elden_Ring_Box_art.jpg',
  },
  {
    title: 'Red Dead Redemption 2',
    description: 'An epic tale of life in America\'s unforgiving heartland. The game\'s vast and atmospheric world will provide the foundation for a brand new online multiplayer experience.',
    author: 'Rockstar Games',
    genre: 'Action-Adventure',
    releaseYear: 2018,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/4/44/Red_Dead_Redemption_II.jpg',
  },
  {
    title: 'Hollow Knight',
    description: 'A challenging 2D action-adventure across a vast interconnected world. Explore twisting caverns, battle tainted creatures and befriend bizarre bugs, all while unraveling an ancient mystery.',
    author: 'Team Cherry',
    genre: 'Metroidvania',
    releaseYear: 2017,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/5/5b/Hollow_Knight_first_cover.jpg',
  },
  {
    title: 'Hades',
    description: 'A rogue-like dungeon crawler in which you defy the god of the dead as you hack and slash out of the Underworld of Greek myth. Permanent character growth as you unveil the full story.',
    author: 'Supergiant Games',
    genre: 'Roguelite',
    releaseYear: 2020,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/c/cc/Hades_cover_art.jpg',
  },
  {
    title: 'Cyberpunk 2077',
    description: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification. You play as V, a mercenary outlaw going after a one-of-a-kind implant.',
    author: 'CD Projekt Red',
    genre: 'Action RPG',
    releaseYear: 2020,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg',
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamevault');
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Game.deleteMany(), Review.deleteMany()]);
  console.log('Cleared existing data');

  // Create admin + users (ONLY FOR TESTING)
  const admin = await User.create({ username: 'admin', password: 'CHANGEPASSWORDHERE', role: 'admin' });
  const user1 = await User.create({ username: 'gamer_pro', password: 'password123' });
  console.log('Created users: admin / admin123, gamer_pro / password123');

  // Create games
  const games = await Game.insertMany(GAMES);
  console.log(`Created ${games.length} games`);

  // Create reviews
  const reviewData = [
    { game: games[0]._id, author: admin._id, rating: 5, description: 'An absolute masterpiece of storytelling and world-building. The sheer amount of content and the quality of every quest is unmatched in gaming history.' },
    { game: games[0]._id, author: user1._id, rating: 5, description: 'Best RPG ever made, period. The DLCs alone are worth the full price. Geralt\'s journey is unforgettable.' },
    { game: games[0]._id, author: user2._id, rating: 4, description: 'Incredible game with a few minor pacing issues in the late game, but the story and world are stunning.' },

    { game: games[1]._id, author: admin._id, rating: 5, description: 'FromSoftware at their absolute peak. The world design is awe-inspiring and combat feels incredibly rewarding.' },
    { game: games[1]._id, author: user1._id, rating: 4, description: 'A challenging but deeply rewarding experience. The open world adds so much compared to previous Souls games.' },

    { game: games[2]._id, author: user2._id, rating: 5, description: 'The most immersive open world ever created. Every detail feels alive and the story is deeply moving.' },
    { game: games[2]._id, author: user1._id, rating: 5, description: 'RDR2 is a cinematic masterpiece. Arthur Morgan is one of gaming\'s greatest protagonists.' },

    { game: games[3]._id, author: admin._id, rating: 5, description: 'An indie gem that rivals AAA titles. The art, music, and gameplay all combine into something truly special.' },
    { game: games[3]._id, author: user1._id, rating: 4, description: 'Challenging but fair. The world is beautifully crafted and exploration is deeply rewarding.' },

    { game: games[4]._id, author: user2._id, rating: 5, description: 'The best roguelite ever made. The way story and gameplay intertwine is genius. Every run feels fresh.' },
    { game: games[4]._id, author: admin._id, rating: 5, description: 'Supergiant outdid themselves. Incredible voice acting, stunning art, addictive gameplay loop.' },

    { game: games[5]._id, author: user1._id, rating: 4, description: 'Post-patch this game is absolutely amazing. Night City is breathtaking and V\'s story is compelling.' },
    { game: games[5]._id, author: user2._id, rating: 3, description: 'Good game now but the launch state was inexcusable. Still enjoyable but some RPG promises feel hollow.' },
  ];

  for (const r of reviewData) {
    await Review.create(r);
  }
  console.log(`Created ${reviewData.length} reviews`);
  console.log('\n✅ Seed complete!\n');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
