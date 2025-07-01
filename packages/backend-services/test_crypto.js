const crypto = require('crypto');

console.log('Testing crypto.randomBytes(32).toString("hex"):');
console.log('');

// Generate 5 tokens to verify randomness
for (let i = 1; i <= 5; i++) {
  const token = crypto.randomBytes(32).toString('hex');
  console.log(`Token ${i}: ${token}`);
  console.log(`Length: ${token.length} characters`);
  console.log('');
}

// Test different byte lengths
console.log('Different byte lengths:');
console.log(`16 bytes: ${crypto.randomBytes(16).toString('hex')} (${crypto.randomBytes(16).toString('hex').length} chars)`);
console.log(`24 bytes: ${crypto.randomBytes(24).toString('hex')} (${crypto.randomBytes(24).toString('hex').length} chars)`);
console.log(`32 bytes: ${crypto.randomBytes(32).toString('hex')} (${crypto.randomBytes(32).toString('hex').length} chars)`);
console.log(`64 bytes: ${crypto.randomBytes(64).toString('hex')} (${crypto.randomBytes(64).toString('hex').length} chars)`);

let buffer = crypto.randomBytes(32);
  
  // Convert to URL-safe base64 (replace + with -, / with _, remove padding =)
  buffer = buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  console.log(`Buffer: ${buffer}`);
