const fs = require('fs');

const fixEncoding = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/ArchivǸ/g, 'Archivé');
  content = content.replace(/Archiv/g, 'Archivé');
  content = content.replace(/En dǸfaut/g, 'En défaut');
  content = content.replace(/En dfaut/g, 'En défaut');
  content = content.replace(/ajoutǸ/g, 'ajouté');
  content = content.replace(/ajout/g, 'ajouté');
  content = content.replace(/modifiǸ/g, 'modifié');
  content = content.replace(/modifi/g, 'modifié');
  content = content.replace(/passǸ/g, 'passé');
  content = content.replace(/pass/g, 'passé');
  content = content.replace(/rǸsiliǸ/g, 'résilié');
  content = content.replace(/rsili/g, 'résilié');
  content = content.replace(/libǸrǸ/g, 'libéré');
  content = content.replace(/libr/g, 'libéré');
  content = content.replace(/RǸintǸgrer/g, 'Réintégrer');
  content = content.replace(/Rintgrer/g, 'Réintégrer');
  content = content.replace(/Stes/g, 'Êtes');
  content = content.replace(/sr/g, 'sûr');
  content = content.replace(/sǯr/g, 'sûr');
  
  // Data.json specific
  content = content.replace(/OccupǸ/g, 'Occupé');
  content = content.replace(/Occup/g, 'Occupé');
  content = content.replace(/PayǸ/g, 'Payé');
  content = content.replace(/Pay/g, 'Payé');
  content = content.replace(/BloquǸ/g, 'Bloqué');
  content = content.replace(/Bloqu/g, 'Bloqué');
  content = content.replace(/RǸnovation/g, 'Rénovation');
  content = content.replace(/Rnovation/g, 'Rénovation');
  content = content.replace(/%lectricitǸ/g, 'Électricité');
  content = content.replace(/%lectricit/g, 'Électricité');
  content = content.replace(/dǸplacǸ/g, 'déplacé');
  content = content.replace(/dplac/g, 'déplacé');
  content = content.replace(/EncaissǸ/g, 'Encaissé');
  content = content.replace(/Encaiss/g, 'Encaissé');
  content = content.replace(/DǸpenses/g, 'Dépenses');
  content = content.replace(/Dpenses/g, 'Dépenses');

  fs.writeFileSync(file, content, 'utf8');
};

['src/app/tenants/TenantsClient.tsx', 'src/lib/db.ts', 'data.json', 'src/app/reports/page.tsx', 'src/app/activity/page.tsx'].forEach(file => {
  try {
    fixEncoding(file);
    console.log("Fixed encoding for", file);
  } catch(e) {
    console.error("Error for", file);
  }
});

// For addTenant: let's add unit assignment and phone field
let clientContent = fs.readFileSync('src/app/tenants/TenantsClient.tsx', 'utf8');
if (!clientContent.includes('name="phone"')) {
  clientContent = clientContent.replace(
    '<div>\\n                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>',
    '<div>\\n                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Téléphone</label>\\n                      <input name="phone" type="tel" className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 rounded-lg outline-none mb-4" placeholder="+221 XX XXX XX XX" />\\n                    </div>\\n                    <div>\\n                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email</label>'
  );
  
  // Update handleAddTenant
  clientContent = clientContent.replace(
    /const name = formData\.get\("name"\) as string;/g,
    'const name = formData.get("name") as string;\\n    const phone = formData.get("phone") as string;'
  );
  
  fs.writeFileSync('src/app/tenants/TenantsClient.tsx', clientContent, 'utf8');
  console.log("Added phone to modal");
}

let actionContent = fs.readFileSync('src/app/actions/tenantActions.ts', 'utf8');
if (!actionContent.includes('const phone = formData.get("phone")')) {
  actionContent = actionContent.replace(
    /const email = formData\.get\("email"\) as string;/g,
    'const email = formData.get("email") as string;\\n  const phone = formData.get("phone") as string;'
  );
  actionContent = actionContent.replace(
    /addTenant\(\{ name, email \}\);/g,
    'addTenant({ name, email, phone });'
  );
  fs.writeFileSync('src/app/actions/tenantActions.ts', actionContent, 'utf8');
  console.log("Added phone to actions");
}

