const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/lenovo/.gemini/antigravity-ide/brain/8e2c776c-0c1f-4d4c-ae3e-013b7fbfca20/.system_generated/logs/transcript_full.jsonl')
});
rl.on('line', (line) => {
  if (line.includes('"step_index":3014') || line.includes('"step_index":3015')) {
    const obj = JSON.parse(line);
    console.log('STEP', obj.step_index, obj.source);
    if (obj.tool_calls) {
      console.log('TOOL CALLS:', JSON.stringify(obj.tool_calls, null, 2).slice(0, 1000));
    } else {
      console.log('CONTENT:', (obj.content || '').slice(0, 1000));
    }
  }
});
