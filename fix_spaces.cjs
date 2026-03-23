const fs = require('fs');
let c = fs.readFileSync('src/components/JointVenturePreview.tsx', 'utf8');

// Replace < div className = "..." > with <div className="... " >
c = c.replace(/<\s+div/g, '<div');
c = c.replace(/<\/\s*div\s*>/g, '</div>');
c = c.replace(/<\/\s*div\s*>/g, '</div>');
c = c.replace(/\"\s*>/g, '">');

// General replacements for tags
c = c.replace(/<\s+([A-Za-z0-9_]+)/g, '<$1');
c = c.replace(/<\/\s*([A-Za-z0-9_]+)\s*>/g, '</$1>');

fs.writeFileSync('src/components/JointVenturePreview.tsx', c);
console.log("Fixed JSX spaces successfully!");
