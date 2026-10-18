const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/lenovo/.gemini/antigravity-ide/brain/8e2c776c-0c1f-4d4c-ae3e-013b7fbfca20/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('drive.google.com') && (line.includes('updateMany') || line.includes('updateOne') || line.includes('property') || line.includes('properties'))) {
    const obj = JSON.parse(line);
    if (obj.source === 'MODEL' && obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        if (tc.name === 'run_command' && (tc.args.CommandLine.includes('properties') || tc.args.CommandLine.includes('drive.google.com'))) {
          console.log('--- Step', obj.step_index, tc.args.CommandLine.slice(0, 300));
        }
      }
    }
  }
});
