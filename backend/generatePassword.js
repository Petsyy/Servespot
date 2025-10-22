const bcrypt = require('bcryptjs');

const password = 'peter123';  // Replace this with the password you want to hash
const saltRounds = 10;  // Determines the computational cost of hashing (higher = more secure)

// Generate a hashed password
const hashedPassword = bcrypt.hashSync(password, saltRounds);

console.log('Hashed Password:', hashedPassword);
