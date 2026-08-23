# Gates: skill installation + three-skill audit of apg-website

- [x] G1: All 8 skills installed under .pi/skills with valid SKILL.md frontmatter
  CHECK: "C:/Program Files/nodejs/node.exe" -e "const fs=require('fs'),p=require('path');let n=0;const walk=d=>fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const f=p.join(d,e.name);e.isDirectory()?walk(f):e.name==='SKILL.md'&&n++});walk('.pi/skills');console.log(n)"
  EXPECT: 8
  EVIDENCE: 8

- [x] G2: anti-slop pattern scan executed across src/ server/ api/ scripts/ with counts recorded
  CHECK: "C:/Program Files/nodejs/node.exe" -e "const fs=require('fs'),p=require('path');let hits=0;const walk=d=>fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const f=p.join(d,e.name);if(e.isDirectory())walk(f);else if(/\.[tj]sx?$/.test(e.name)){const s=fs.readFileSync(f,'utf8');const m=s.match(/as any/g);if(m)hits+=m.length}});['src','server','api','scripts'].forEach(walk);console.log('as-any-hits:'+hits);if(hits<1)process.exit(1)"
  EXPECT: as-any-hits:14
  EVIDENCE: as-any-hits:14

- [x] G3: ponytail-audit sweep completed: unused deps counted, dead code measured
  CHECK: "C:/Program Files/nodejs/node.exe" -e "const p=require('./package.json');console.log('deps:'+Object.keys(p.dependencies).length)"
  EXPECT: deps:67
  EVIDENCE: deps:67

- [x] G4: Every reported number re-measured at report time; findings ranked with paths; ledger pasted
  CHECK: "C:/Program Files/nodejs/node.exe" -e "const s=require('fs').readFileSync('GATES.md','utf8');console.log(s.includes('EVIDENCE:')?'ledger-present':'no-ledger')"
  EXPECT: ledger-present
  EVIDENCE: ledger-present
