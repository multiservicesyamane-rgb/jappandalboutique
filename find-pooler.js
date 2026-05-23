import postgres from 'postgres';

const regions = [
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-south-1',
  'sa-east-1',
  'ca-central-1'
];

const projectRef = 'pjejsxrycfgdwlqbhtwt';
const password = encodeURIComponent('Passer@137411');

async function testRegion(region) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const url = `postgresql://postgres.${projectRef}:${password}@${host}:5432/postgres`;
  
  const sql = postgres(url, { idle_timeout: 1, connect_timeout: 3 });
  
  try {
    const res = await sql`SELECT 1 as result`;
    console.log(`✅ SUCCESS IN REGION: ${region}`);
    console.log(`URL: ${url}`);
    return url;
  } catch (err) {
    // console.log(`❌ Failed ${region}:`, err.message);
    return null;
  } finally {
    await sql.end();
  }
}

async function findPooler() {
  console.log('🔍 Searching for the correct pooler URL...');
  const promises = regions.map(r => testRegion(r));
  const results = await Promise.all(promises);
  
  const found = results.find(r => r !== null);
  if (!found) {
    console.log('❌ Could not find a working pooler in the known regions.');
  }
}

findPooler();
