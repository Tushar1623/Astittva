const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/lenovo/.gemini/antigravity-ide/brain/8e2c776c-0c1f-4d4c-ae3e-013b7fbfca20/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  const obj = JSON.parse(line);
  if (obj.step_index >= 1359 && obj.step_index <= 1400) {
    if (obj.source === 'USER_EXPLICIT') {
      console.log('USER:', obj.content);
    } else if (obj.tool_calls) {
      for (const tc of obj.tool_calls) {
        console.log('STEP', obj.step_index, tc.name, JSON.stringify(tc.args).slice(0, 200));
      }
    }
  }
});
