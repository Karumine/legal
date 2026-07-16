const fs = require('fs');
const file = 'src/components/CreditFacilityPreview.tsx';
let data = fs.readFileSync(file, 'utf8');

// The goal is to standardize the top margin immediately following <PageHeader />
data = data.replace(/<PageHeader \/>\n(\s*)<div className="([^"]*)"/g, (match, spaces, classes) => {
    let newClasses = classes;
    // Remove existing top margins/paddings
    newClasses = newClasses.replace(/\b(?:pt-4|pt-8|mt-4|mt-6|mt-2)\b/g, ' ').trim();
    
    // Replace multiple spaces with a single space
    newClasses = newClasses.replace(/\s+/g, ' ').trim();
    
    // Ensure mt-8 is present
    if (!newClasses.includes('mt-8')) {
        newClasses = 'mt-8 ' + newClasses;
    }
    
    return `<PageHeader />\n${spaces}<div className="${newClasses.trim()}"`;
});

fs.writeFileSync(file, data);
console.log('Fixed margins!');
