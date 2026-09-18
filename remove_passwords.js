const fs = require('fs');
let content = fs.readFileSync('src/context/UserContext.tsx', 'utf8');

// Replace the passwords with dummy hashes or just remove them to comply with phase 1
content = content.replace(/password:\s*"[^"]+"/g, 'passwordHash: "[REDACTED]"');

fs.writeFileSync('src/context/UserContext.tsx', content, 'utf8');
console.log("Removed plain text passwords from UserContext.tsx");
