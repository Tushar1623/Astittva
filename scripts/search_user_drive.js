const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/lenovo/.gemini/antigravity-ide/brain/8e2c776c-0c1f-4d4c-ae3e-013b7fbfca20/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"source":"USER_EXPLICIT"')) {
    const obj = JSON.parse(line);
    const content = typeof obj.content === 'string' ? obj.content : JSON.stringify(obj.content);
    if (content.includes('drive') || content.includes('http') || content.includes('property') || content.includes('link') || content.includes('image')) {
      console.log('--- USER MESSAGE step', obj.step_index);
      console.log(content.slice(0, 500));
    }
  }
});
