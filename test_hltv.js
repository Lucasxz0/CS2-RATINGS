const { HLTV } = require('hltv');

async function testHLTV() {
  try {
    const matches = await HLTV.getMatches();
    console.log('Matches fetched:', matches.length);
    if (matches.length > 0) {
      console.log('First match:', JSON.stringify(matches[0], null, 2));
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

testHLTV();
