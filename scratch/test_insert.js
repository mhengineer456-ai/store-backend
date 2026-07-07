import { recordMaterialTransfer } from '../db.js';

async function test() {
  try {
    console.log('Testing recordMaterialTransfer insert...');
    await recordMaterialTransfer({
      materialCode: 'MT1021',
      materialName: 'FABRIC',
      fromLocation: 'HALL 4 RACK 20',
      toLocation: 'HALL 3 RACK 7',
      quantity: 1,
      transferType: 'packet',
      operator: 'Admin'
    });
    console.log('✅ Insert test succeeded!');
  } catch (err) {
    console.error('❌ Insert test failed with error:', err);
  }
}

test().then(() => process.exit(0));
