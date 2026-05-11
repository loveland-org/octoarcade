#!/usr/bin/env node

/**
 * Large Configuration Generator
 * 
 * Generates a large arcade cabinet configuration with 75+ games
 * to test the memory allocation fix
 */

const fs = require('fs');
const path = require('path');

// Game templates for generating variety
const gameTemplates = [
    { genre: "Arcade", year: 1980, players: 1, controls: ["joystick", "button1"] },
    { genre: "Fighting", year: 1991, players: 2, controls: ["joystick", "button1", "button2", "button3", "button4", "button5", "button6"] },
    { genre: "Shoot 'em up", year: 1981, players: 1, controls: ["joystick", "button1", "button2"] },
    { genre: "Platform", year: 1985, players: 1, controls: ["joystick", "button1", "button2"] },
    { genre: "Puzzle", year: 1984, players: 1, controls: ["joystick", "button1"] },
    { genre: "Racing", year: 1982, players: 1, controls: ["steering", "accelerator", "brake"] },
    { genre: "Sports", year: 1987, players: 2, controls: ["joystick", "button1", "button2", "button3"] },
    { genre: "Beat 'em up", year: 1989, players: 2, controls: ["joystick", "button1", "button2", "button3"] }
];

const gameNames = [
    "Pac-Man", "Ms. Pac-Man", "Galaga", "Galaxian", "Centipede", "Millipede", "Frogger", "Donkey Kong",
    "Donkey Kong Jr.", "Mario Bros.", "Popeye", "Q*bert", "Joust", "Defender", "Stargate", "Robotron 2084",
    "Street Fighter II", "Street Fighter", "Final Fight", "Double Dragon", "Golden Axe", "Streets of Rage",
    "King of Fighters", "Fatal Fury", "Samurai Shodown", "Darkstalkers", "Tekken", "Mortal Kombat",
    "Space Invaders", "Asteroids", "Missile Command", "Tempest", "Battlezone", "Red Baron", "Star Wars",
    "Tron", "Spy Hunter", "Moon Patrol", "Scramble", "Gyruss", "Time Pilot", "Vanguard",
    "Tetris", "Dr. Mario", "Columns", "Puyo Puyo", "Panel de Pon", "Magical Drop", "Money Puzzle",
    "Out Run", "Pole Position", "Hang-On", "Road Blasters", "Super Sprint", "Championship Sprint",
    "Track & Field", "Hyper Olympic", "10-Yard Fight", "Tecmo Bowl", "NBA Jam", "Arch Rivals",
    "Gauntlet", "Gauntlet II", "Rampage", "Smash TV", "Total Carnage", "Narc", "APB",
    "Dig Dug", "Mr. Do!", "Burgertime", "Lady Bug", "Pengo", "Crush Roller", "Make Trax",
    "Phoenix", "Pleiads", "1942", "1943", "Strikers 1945", "Raiden", "Thunder Force", "Gradius",
    "R-Type", "Darius", "Metal Slug", "Neo Geo Cup", "Puzzle Bobble", "Magical Drop II"
];

function generateLargeConfig() {
    const config = {
        name: "Large Arcade Collection - Memory Test",
        description: "Large test configuration with 75+ games to test memory allocation fix",
        version: "2.1.3",
        created: new Date().toISOString(),
        games: []
    };

    // Generate 75 games (this would previously cause memory allocation failure)
    for (let i = 0; i < 75; i++) {
        const template = gameTemplates[i % gameTemplates.length];
        const baseName = gameNames[i % gameNames.length];
        const variant = Math.floor(i / gameNames.length) + 1;
        const gameName = variant > 1 ? `${baseName} ${variant}` : baseName;

        const game = {
            id: `game_${i + 1}`,
            name: gameName,
            genre: template.genre,
            year: template.year + Math.floor(Math.random() * 10),
            players: template.players,
            description: `${template.genre} game: ${gameName}. This is a test description that contains enough text to simulate real game metadata that would be loaded into memory during configuration parsing.`,
            controls: [...template.controls],
            screenshot: `/screenshots/${gameName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`,
            rom: `/roms/${gameName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.zip`,
            metadata: {
                fileSize: Math.floor(Math.random() * 10000000) + 1000000, // 1-10MB
                lastPlayed: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
                playCount: Math.floor(Math.random() * 1000),
                highScore: Math.floor(Math.random() * 999999),
                difficulty: ["Easy", "Normal", "Hard"][Math.floor(Math.random() * 3)],
                category: ["Classic", "Popular", "Rare"][Math.floor(Math.random() * 3)]
            },
            // Add some larger text data that would contribute to memory usage
            manualText: `Game Manual for ${gameName}: This game was released in ${template.year} and belongs to the ${template.genre} genre. It supports ${template.players} player(s) and uses the following controls: ${template.controls.join(', ')}. The objective varies based on the genre, but generally involves achieving high scores and completing levels or objectives.`,
            tips: [
                "Master the basic controls before attempting advanced techniques",
                "Pay attention to enemy patterns and timing",
                "Practice makes perfect - don't give up!",
                "Look for bonus opportunities and power-ups",
                "Learn from watching experienced players"
            ]
        };

        config.games.push(game);
    }

    return config;
}

// Generate and save the large configuration
const largeConfig = generateLargeConfig();
const outputPath = path.join(__dirname, 'test-configs', 'large_config.json');

fs.writeFileSync(outputPath, JSON.stringify(largeConfig, null, 2));

console.log(`Generated large configuration with ${largeConfig.games.length} games`);
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
console.log(`Saved to: ${outputPath}`);