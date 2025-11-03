export async function seed() {
  // Populate development data
  console.log('Seeding data...');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().then(() => process.exit(0));
}


