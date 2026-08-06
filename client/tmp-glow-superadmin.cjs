const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'Pages', 'SuperAdmin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace various card wrapper styles with glow-panel
  content = content.replace(/bg-\[\#0d1530\] border border-blue-500\/(10|20|30) rounded-xl (shadow-lg shadow-blue-500\/\d+ )?overflow-hidden/g, 'glow-panel overflow-hidden');
  
  // Replace standard card styles
  content = content.replace(/bg-\[\#0d1530\] border border-blue-500\/(10|20|30) rounded-xl overflow-hidden/g, 'glow-panel overflow-hidden');

  // Replace inputs and selects without focus glow
  content = content.replace(/focus:border-blue-500\/40 focus:outline-none transition-colors/g, 'focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] focus:outline-none transition-colors');
  content = content.replace(/focus:border-blue-500 focus:outline-none transition-colors"/g, 'focus:border-blue-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] focus:outline-none transition-colors"');

  // Red gradient buttons
  content = content.replace(/bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white(.*?)shadow-\[0_4px_20px_rgba\(220,38,38,0\.3\)\](.*?)"/g, 'bg-red-600 hover:bg-red-700 text-white$1shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] border border-red-500/50$2"');
  
  // Blue gradient buttons
  content = content.replace(/bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white(.*?)shadow-\[0_4px_20px_rgba\(59,130,246,0\.3\)\](.*?)"/g, 'bg-blue-600 hover:bg-blue-700 text-white$1shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] border border-blue-500/50$2"');

  // Specific to AuditLogs clear button modal
  content = content.replace(/bg-\[\#0d1530\] border border-red-500\/20 rounded-2xl p-6 space-y-4 shadow-2xl shadow-red-500\/10/g, 'glow-panel !border-red-500/50 !shadow-[0_0_20px_rgba(239,68,68,0.3)] rounded-2xl p-6 space-y-4');

  // Modals like Plans, BonusManagement
  content = content.replace(/bg-\[\#0d1530\] border border-blue-500\/20 rounded-2xl p-6 (w-full max-w-md )?shadow-\[0_0_40px_rgba\(59,130,246,0\.15\)\]/g, 'glow-panel p-6 $1');

  // Bonus Management cards
  content = content.replace(/rounded-2xl border border-white\/10 p-6 flex flex-col gap-(\d+)"[\s\n]*style=\{\{\s*background:\s*'#0d1530'\s*\}\}/g, 'glow-panel p-6 flex flex-col gap-$1"');

  // Fix generic inputs in BonusManagement
  content = content.replace(/border border-white\/10 focus:border-blue-500\/50 focus:outline-none transition-colors"[\s\n]*style=\{\{\s*background:\s*'#060a14'\s*\}\}/g, 'border border-blue-500/20 focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] focus:outline-none transition-colors bg-[#050810]"');

  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('done');
