const fs = require('fs');

let db = fs.readFileSync('src/lib/db.ts', 'utf8');
db = db.replace(/endOccupéation/g, 'endOccupation');
fs.writeFileSync('src/lib/db.ts', db, 'utf8');

let actionContent = fs.readFileSync('src/app/actions/tenantActions.ts', 'utf8');
actionContent = actionContent.replace(/\\n/g, '\n');
fs.writeFileSync('src/app/actions/tenantActions.ts', actionContent, 'utf8');

let clientContent = fs.readFileSync('src/app/tenants/TenantsClient.tsx', 'utf8');
clientContent = clientContent.replace(/\\n/g, '\n');
fs.writeFileSync('src/app/tenants/TenantsClient.tsx', clientContent, 'utf8');

console.log("Fixed errors");
