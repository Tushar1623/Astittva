const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/lenovo/.gemini/antigravity-ide/brain/8e2c776c-0c1f-4d4c-ae3e-013b7fbfca20/.system_generated/logs/transcript_full.jsonl')
});

let print = false;
let linesLeft = 35;
rl.on('line', (line) => {
  if (line.includes('"step_index":1385')) {
    print = true;
  }
  if (print && linesLeft > 0) {
    linesLeft--;
    try {
      const obj = JSON.parse(line);
      console.log('--- Step', obj.step_index, obj.source);
      if (obj.tool_calls) {
        console.log('TOOL CALLS:', JSON.stringify(obj.tool_calls, null, 2).slice(0, 400));
      } else {
        console.log('CONTENT:', (obj.content || '').slice(0, 400));
      }
    } catch(e) {}
  }
});
