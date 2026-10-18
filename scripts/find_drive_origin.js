const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/lenovo/.gemini/antigravity-ide/brain/8e2c776c-0c1f-4d4c-ae3e-013b7fbfca20/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('1xuCarL2ogjI')) {
    const obj = JSON.parse(line);
    console.log('FOUND 1xuCarL2ogjI in step', obj.step_index, obj.source);
    if (obj.tool_calls) {
      console.log('Tool calls:', JSON.stringify(obj.tool_calls).slice(0, 300));
    } else {
      console.log('Content:', (obj.content || '').slice(0, 300));
    }
  }
});
