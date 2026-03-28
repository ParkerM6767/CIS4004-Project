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
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/d/de/Hollow_Knight_2026_cover_art.jpg',
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
  {
    title: 'God of War',
    description: 'His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters. He must fight to survive… and teach his son to do the same.',
    author: 'Santa Monica Studio',
    genre: 'Action-Adventure',
    releaseYear: 2018,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/a/a7/God_of_War_4_cover.jpg',
  },
  {
    title: 'Stardew Valley',
    description: 'You\'ve inherited your grandfather\'s old farm plot. Armed with hand-me-down tools and a few coins, you set out to begin your new life. Can you learn to live off the land?',
    author: 'ConcernedApe',
    genre: 'Simulation RPG',
    releaseYear: 2016,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Logo_of_Stardew_Valley.png',
  },
  {
    title: 'Baldur\'s Gate 3',
    description: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.',
    author: 'Larian Studios',
    genre: 'CRPG',
    releaseYear: 2023,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/1/12/Baldur%27s_Gate_3_cover_art.jpg',
  },
  {
    title: 'Mass Effect Legendary Edition',
    description: 'Relive the cinematic saga. One person is all that stands between humanity and the greatest threat it’s ever faced. Includes the highly acclaimed trilogy.',
    author: 'BioWare',
    genre: 'Sci-Fi RPG',
    releaseYear: 2021,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/9/97/Mass_Effect_Legendary_Edition.jpeg',
  },
  {
    title: 'The Legend of Zelda: Breath of the Wild',
    description: 'Step into a world of discovery, exploration, and adventure. Travel across vast fields, through forests, and to mountain peaks as you discover what has become of the kingdom of Hyrule.',
    author: 'Nintendo',
    genre: 'Action-Adventure',
    releaseYear: 2017,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
  },
  {
    title: 'Portal 2',
    description: 'Portal 2 draws from the award-winning formula of innovative gameplay, story, and music that earned the original Portal over 70 industry accolades and created a cult following.',
    author: 'Valve',
    genre: 'Puzzle Platformer',
    releaseYear: 2011,
    coverImage: 'https://upload.wikimedia.org/wikipedia/en/f/f9/Portal2cover.jpg',
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gamevault');
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany(), Game.deleteMany(), Review.deleteMany()]);
  console.log('Cleared existing data');

  // BUG FIX: Added user2 and fixed admin password
  const admin = await User.create({ username: 'admin', password: 'admin123', role: 'admin' });
  const user1 = await User.create({ username: 'gamer_pro', password: 'password123' });
  const user2 = await User.create({ username: 'casual_player', password: 'password123' }); 
  console.log('Created users: admin, gamer_pro, casual_player');

  // Create games
  const games = await Game.insertMany(GAMES);
  console.log(`Created ${games.length} games`);

  // Create reviews (Now covering the new games as well!)
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

    { game: games[6]._id, author: user1._id, rating: 5, description: 'BOY! The combat is brutal, the story is incredibly moving, and the one-shot camera is a technical marvel.' },
    { game: games[6]._id, author: user2._id, rating: 5, description: 'A perfect reboot. Kratos actually has depth now.' },

    { game: games[7]._id, author: admin._id, rating: 5, description: 'The most relaxing game ever made. I spent 200 hours just farming.' },
    
    { game: games[8]._id, author: user2._id, rating: 5, description: 'The new gold standard for RPGs. The amount of choices and consequences is staggering.' },
    { game: games[8]._id, author: admin._id, rating: 5, description: 'Larian crafted an absolute masterpiece. Every playthrough is entirely unique.' },

    { game: games[9]._id, author: user1._id, rating: 5, description: 'Having the whole trilogy in one package is amazing. Commander Shepard is a legend.' },
    
    { game: games[10]._id, author: user2._id, rating: 5, description: 'Completely revolutionized open-world design. Exploring Hyrule is pure magic.' },
    
    { game: games[11]._id, author: admin._id, rating: 5, description: 'The perfect sequel. Hilarious writing and brilliant puzzles.' }
  ];

  for (const r of reviewData) {
    await Review.create(r);
  }
  console.log(`Created ${reviewData.length} reviews`);
  console.log('\n✅ Seed complete!\n');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });