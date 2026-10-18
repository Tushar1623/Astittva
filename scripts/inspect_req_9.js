const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/lenovo/.gemini/antigravity-ide/brain/8e2c776c-0c1f-4d4c-ae3e-013b7fbfca20/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":1383') || line.includes('"step_index":1384') || line.includes('"step_index":1385')) {
    const obj = JSON.parse(line);
    console.log('Step', obj.step_index, obj.source, typeof obj.content === 'string' ? obj.content.slice(0, 500) : (obj.tool_calls ? JSON.stringify(obj.tool_calls).slice(0, 500) : ''));
  }
});
