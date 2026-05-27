// Brain Spark — single-file app, persists in localStorage per user
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>[...r.querySelectorAll(s)];
const uid = ()=>Math.random().toString(36).slice(2,10);
const todayISO = ()=>new Date().toISOString().slice(0,10);

// --- Storage layer (per-user) ---
const Store = {
  get currentUser(){ return localStorage.getItem('sd:user') || ''; },
  set currentUser(v){ localStorage.setItem('sd:user', v); },
  key(k){ return `sd:${this.currentUser||'_'}:${k}`; },
  load(k, def){ try{ return JSON.parse(localStorage.getItem(this.key(k))) ?? def; }catch{ return def; } },
  save(k, v){ localStorage.setItem(this.key(k), JSON.stringify(v)); },
  users(){ try{ return JSON.parse(localStorage.getItem('sd:users')||'{}'); }catch{ return {}; } },
  saveUsers(u){ localStorage.setItem('sd:users', JSON.stringify(u)); },
};

// --- App state ---
let State = {
  sets: [], notes: [], events: [], resources: [], exams: [],
  progress: {}, // termId -> {correct, wrong, lastSeen}
  streak: { last:null, count:0 },
  pomo: { focus:25, short:5, long:15, completedToday:0 },
};

function loadState(){
  State.sets = Store.load('sets', sampleSets());
  State.notes = Store.load('notes', []);
  State.events = Store.load('events', []);
  State.resources = Store.load('resources', []);
  State.exams = Store.load('exams', []);
  State.progress = Store.load('progress', {});
  State.streak = Store.load('streak', { last:null, count:0 });
  State.pomo = Store.load('pomo', { focus:25, short:5, long:15, completedToday:0 });
}
function saveAll(){
  for (const k of ['sets','notes','events','resources','exams','progress','streak','pomo']){
    Store.save(k, State[k]);
  }
}
function sampleSets(){
  return [{
    id: uid(), title:"Sample: Biology — Cell Basics", subject:"Biology",
    visibility:"private", createdAt: Date.now(),
    terms:[
      {id:uid(), term:"Mitochondria", def:"Organelle that produces ATP via cellular respiration."},
      {id:uid(), term:"Ribosome", def:"Site of protein synthesis."},
      {id:uid(), term:"Nucleus", def:"Contains the cell's genetic material (DNA)."},
      {id:uid(), term:"Chloroplast", def:"Conducts photosynthesis in plant cells."},
      {id:uid(), term:"Cytoplasm", def:"Gel-like fluid where organelles reside."},
    ]
  }];
}

// --- Streak ---
function bumpStreak(){
  const t = todayISO();
  if (State.streak.last === t) return;
  const y = new Date(Date.now()-86400000).toISOString().slice(0,10);
  State.streak.count = (State.streak.last === y) ? State.streak.count + 1 : 1;
  State.streak.last = t;
  saveAll(); renderStreak();
}
function renderStreak(){ $('#streakCount').textContent = State.streak.count; }

// --- Routing ---
const Views = {};
const STUDY_VIEWS = ['sets','flashcards','learn','quiz','quizbuilder','notes'];
function go(view){
  $$('.nav').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
  const grp = document.querySelector('.nav-group[data-group="studysets"]');
  if (grp && STUDY_VIEWS.includes(view)) grp.classList.remove('collapsed');
  const fn = Views[view] || Views.dashboard;
  $('#app').innerHTML = '';
  fn($('#app'));
}
document.addEventListener('click', e=>{
  const t = e.target.closest('[data-toggle]');
  if (t){
    const grp = document.querySelector(`.nav-group[data-group="${t.dataset.toggle}"]`);
    if (grp) grp.classList.toggle('collapsed');
    return;
  }
  const n = e.target.closest('.nav');
  if (n && n.dataset.view) go(n.dataset.view);
});

function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.hidden=false;
  clearTimeout(toast._t); toast._t = setTimeout(()=>el.hidden=true, 1800);
}

// ============ VIEWS ============

// Account
Views.account = (root)=>{
  const u = Store.currentUser;
  root.innerHTML = `
    <h1>Account</h1>
    <p class="sub">Local accounts — data lives in your browser.</p>
    <div class="card" style="max-width:480px">
      <h3>${u? 'Signed in as '+u : 'Sign in / Sign up'}</h3>
      <label>Username</label><input id="acctUser" value="${u||''}" />
      <label>Display name</label><input id="acctName" value="${(Store.users()[u]?.name)||''}" />
      <div class="row" style="margin-top:12px">
        <button class="btn" id="acctSave">${u?'Switch / Save':'Sign in'}</button>
        ${u?'<button class="btn ghost" id="acctOut">Sign out</button>':''}
      </div>
    </div>`;
  $('#acctSave').onclick = ()=>{
    const name = $('#acctUser').value.trim();
    if(!name) return toast('Enter a username');
    const users = Store.users();
    users[name] = { name: $('#acctName').value || name, created: users[name]?.created || Date.now() };
    Store.saveUsers(users); Store.currentUser = name;
    loadState(); refreshUserLabel(); toast('Signed in as '+name); go('dashboard');
  };
  if (u) $('#acctOut').onclick = ()=>{ Store.currentUser=''; loadState(); refreshUserLabel(); go('account'); };
};
function refreshUserLabel(){
  $('#userLabel').textContent = Store.currentUser ? '@'+Store.currentUser : 'Not signed in';
}

// Dashboard
Views.dashboard = (root)=>{
  const totalTerms = State.sets.reduce((s,x)=>s+x.terms.length,0);
  const mastered = Object.values(State.progress).filter(p=>p.correct-p.wrong>=2).length;
  const nextExam = State.exams.slice().sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
  const daysTo = nextExam? Math.ceil((new Date(nextExam.date)-Date.now())/86400000):null;
  root.innerHTML = `
    <h1>Welcome${Store.currentUser? ', '+Store.currentUser:''} 👋</h1>
    <p class="sub">Your study at a glance.</p>
    <div class="grid cards-4">
      <div class="card"><h3>Study sets</h3><div class="kpi">${State.sets.length}</div><p>${totalTerms} terms total</p></div>
      <div class="card"><h3>Mastered</h3><div class="kpi mastered">${mastered}</div><p>terms answered confidently</p></div>
      <div class="card"><h3>Streak</h3><div class="kpi">🔥 ${State.streak.count}</div><p>keep it going daily</p></div>
      <div class="card"><h3>Pomodoros today</h3><div class="kpi">${State.pomo.completedToday||0}</div><p>focus blocks done</p></div>
    </div>

    <h2>Exam countdown</h2>
    ${nextExam? `<div class="countdown">
        <div class="row"><div><div class="days">${daysTo} days</div><div>${nextExam.title} — ${nextExam.date}</div></div>
        <div class="spacer"></div><button class="btn ghost" data-view="planner">Plan study →</button></div>
      </div>` : `<div class="empty">No exams yet. Add one in the Planner.</div>`}

    <h2>Jump back in</h2>
    <div class="grid cards-3">
      ${State.sets.slice(0,3).map(s=>`
        <div class="card">
          <h3>${escapeHtml(s.title)}</h3>
          <p>${s.terms.length} terms · ${escapeHtml(s.subject||'General')}</p>
          <div class="row" style="margin-top:10px">
            <button class="btn small" data-go-set="${s.id}" data-mode="flashcards">Flashcards</button>
            <button class="btn small ghost" data-go-set="${s.id}" data-mode="learn">Learn</button>
            <button class="btn small ghost" data-go-set="${s.id}" data-mode="quiz">Test</button>
          </div>
        </div>`).join('') || `<div class="empty">Create your first study set →</div>`}
    </div>`;
  root.querySelectorAll('[data-go-set]').forEach(b=>b.onclick=()=>{
    selectedSetId = b.dataset.goSet;
    go(b.dataset.mode);
  });
  root.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>go(b.dataset.view));
};

// Study Sets
let selectedSetId = null;
Views.sets = (root)=>{
  root.innerHTML = `
    <h1>Study Sets</h1>
    <p class="sub">Organize terms, definitions, and concepts into collections.</p>
    <div class="row" style="margin-bottom:14px">
      <button class="btn" id="newSet">+ New set</button>
      <input id="setSearch" placeholder="Search sets..." style="max-width:280px"/>
    </div>
    <div id="setList" class="grid cards-3"></div>
    <div id="setEditor"></div>`;
  const render = ()=>{
    const q = ($('#setSearch').value||'').toLowerCase();
    $('#setList').innerHTML = State.sets
      .filter(s=>s.title.toLowerCase().includes(q) || (s.subject||'').toLowerCase().includes(q))
      .map(s=>`<div class="card">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${s.terms.length} terms · <span class="tag">${escapeHtml(s.subject||'General')}</span> · <span class="tag">${s.visibility||'private'}</span></p>
        <div class="row" style="margin-top:10px">
          <button class="btn small" data-edit="${s.id}">Edit</button>
          <button class="btn small ghost" data-study="${s.id}">Flashcards</button>
          <button class="btn small danger" data-del="${s.id}">Delete</button>
        </div></div>`).join('') || `<div class="empty">No sets yet.</div>`;
    root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor(b.dataset.edit));
    root.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>{ selectedSetId=b.dataset.study; go('flashcards'); });
    root.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{
      if(!confirm('Delete this set?')) return;
      State.sets = State.sets.filter(s=>s.id!==b.dataset.del); saveAll(); render();
    });
  };
  $('#setSearch').oninput = render;
  $('#newSet').onclick = ()=>{
    const s = { id:uid(), title:'Untitled set', subject:'', visibility:'private', createdAt:Date.now(), terms:[{id:uid(),term:'',def:''}] };
    State.sets.unshift(s); saveAll(); openEditor(s.id); render();
  };
  function openEditor(id){
    const s = State.sets.find(x=>x.id===id); if(!s) return;
    $('#setEditor').innerHTML = `
      <h2>Edit set</h2>
      <div class="card">
        <label>Title</label><input id="eTitle" value="${escapeAttr(s.title)}"/>
        <div class="row">
          <div style="flex:1"><label>Subject</label><input id="eSubject" value="${escapeAttr(s.subject||'')}"/></div>
          <div style="flex:1"><label>Visibility</label>
            <select id="eVis"><option ${s.visibility==='private'?'selected':''}>private</option><option ${s.visibility==='shared'?'selected':''}>shared</option><option ${s.visibility==='public'?'selected':''}>public</option></select>
          </div>
        </div>
        <h3 style="margin-top:14px">Terms</h3>
        <div id="eTerms"></div>
        <div class="row" style="margin-top:10px">
          <button class="btn ghost" id="addTerm">+ Add term</button>
          <button class="btn ghost" id="bulkAdd">Bulk paste (term — definition per line)</button>
          <div class="spacer"></div>
          <button class="btn" id="saveSet">Save</button>
        </div>
      </div>`;
    const drawTerms = ()=>{
      $('#eTerms').innerHTML = s.terms.map((t,i)=>`
        <div class="row" style="margin:6px 0">
          <input data-t="${t.id}" data-f="term" value="${escapeAttr(t.term)}" placeholder="Term"/>
          <input data-t="${t.id}" data-f="def" value="${escapeAttr(t.def)}" placeholder="Definition"/>
          <button class="btn small danger" data-rm="${t.id}">×</button>
        </div>`).join('');
      $$('#eTerms input').forEach(inp=>inp.oninput=()=>{
        const t = s.terms.find(x=>x.id===inp.dataset.t);
        t[inp.dataset.f] = inp.value;
      });
      $$('[data-rm]').forEach(b=>b.onclick=()=>{ s.terms = s.terms.filter(x=>x.id!==b.dataset.rm); drawTerms(); });
    };
    drawTerms();
    $('#addTerm').onclick = ()=>{ s.terms.push({id:uid(),term:'',def:''}); drawTerms(); };
    $('#bulkAdd').onclick = ()=>{
      const text = prompt('Paste lines like:\nMitosis - cell division\nATP - energy currency');
      if(!text) return;
      text.split(/\n/).forEach(line=>{
        const m = line.split(/\s[-—:]\s|\t/);
        if (m.length>=2) s.terms.push({id:uid(), term:m[0].trim(), def:m.slice(1).join(' - ').trim()});
      });
      drawTerms();
    };
    $('#saveSet').onclick = ()=>{
      s.title = $('#eTitle').value || 'Untitled';
      s.subject = $('#eSubject').value;
      s.visibility = $('#eVis').value;
      s.terms = s.terms.filter(t=>t.term.trim() || t.def.trim());
      saveAll(); toast('Saved'); render(); $('#setEditor').innerHTML='';
    };
  }
  render();
};

// Flashcards
Views.flashcards = (root)=>{
  ensureSetPicker(root, 'Flashcards', (set)=>{
    let i = 0, flipped=false;
    const draw = ()=>{
      const t = set.terms[i];
      if (!t) return root.innerHTML += `<div class="empty">No terms in this set.</div>`;
      $('#flashHost').innerHTML = `
        <div class="flash ${flipped?'flipped':''}" id="flashEl">
          <div class="flash-inner">
            <div class="flash-face">${escapeHtml(t.term)}</div>
            <div class="flash-face back">${escapeHtml(t.def)}</div>
          </div>
        </div>
        <div class="sub">Card ${i+1} of ${set.terms.length} — click card to flip</div>
        <div class="flash-controls">
          <button class="btn ghost" id="prev">← Prev</button>
          <button class="btn danger" id="bad">Didn't know</button>
          <button class="btn" id="good">Got it</button>
          <button class="btn ghost" id="next">Next →</button>
          <button class="btn ghost" id="shuf">Shuffle</button>
        </div>`;
      $('#flashEl').onclick = ()=>{ flipped=!flipped; draw(); };
      $('#prev').onclick = ()=>{ i=(i-1+set.terms.length)%set.terms.length; flipped=false; draw(); };
      $('#next').onclick = ()=>{ i=(i+1)%set.terms.length; flipped=false; draw(); };
      $('#shuf').onclick = ()=>{ set.terms.sort(()=>Math.random()-0.5); saveAll(); i=0; flipped=false; draw(); };
      $('#good').onclick = ()=>{ recordProgress(t.id,true); bumpStreak(); $('#next').click(); };
      $('#bad').onclick  = ()=>{ recordProgress(t.id,false); bumpStreak(); $('#next').click(); };
    };
    root.insertAdjacentHTML('beforeend', `<div class="flash-wrap" id="flashHost"></div>`);
    draw();
  });
};

// Learn Mode (adaptive based on progress)
Views.learn = (root)=>{
  ensureSetPicker(root, 'Learn Mode', (set)=>{
    root.insertAdjacentHTML('beforeend', `<p class="sub">We'll show weaker terms more often.</p><div id="learnHost"></div>`);
    const queue = weighted(set.terms);
    let pos = 0;
    function next(){
      if (pos>=queue.length){ $('#learnHost').innerHTML = `<div class="card"><h3>Round complete 🎉</h3><p>Practice again or move to a quiz.</p><button class="btn" id="again">Another round</button></div>`; $('#again').onclick=()=>go('learn'); return; }
      const t = queue[pos];
      const choices = pickChoices(set.terms, t);
      $('#learnHost').innerHTML = `
        <div class="quiz-q">
          <div style="margin-bottom:10px"><strong>Definition:</strong> ${escapeHtml(t.def)}</div>
          ${choices.map(c=>`<div class="choice" data-id="${c.id}">${escapeHtml(c.term)}</div>`).join('')}
          <div class="row" style="margin-top:10px"><button class="btn ghost small" id="hint">Hint</button><span class="spacer"></span><span class="sub">${pos+1}/${queue.length}</span></div>
        </div>`;
      $$('.choice').forEach(el=>el.onclick=()=>{
        const ok = el.dataset.id===t.id;
        el.classList.add(ok?'correct':'wrong');
        if(!ok) $(`.choice[data-id="${t.id}"]`).classList.add('correct');
        recordProgress(t.id, ok); bumpStreak();
        setTimeout(()=>{ pos++; next(); }, 700);
      });
      $('#hint').onclick = ()=>toast('Starts with: '+t.term[0]);
    }
    next();
  });
};
function weighted(terms){
  const list=[];
  terms.forEach(t=>{
    const p = State.progress[t.id] || {correct:0,wrong:0};
    const weight = 1 + Math.max(0, p.wrong - p.correct) + (p.correct<1?1:0);
    for(let i=0;i<weight;i++) list.push(t);
  });
  return list.sort(()=>Math.random()-0.5).slice(0, Math.min(20, list.length));
}
function pickChoices(all, correct){
  const others = all.filter(t=>t.id!==correct.id).sort(()=>Math.random()-0.5).slice(0,3);
  return [...others, correct].sort(()=>Math.random()-0.5);
}
function recordProgress(id, ok){
  const p = State.progress[id] || {correct:0, wrong:0, lastSeen:0};
  if (ok) p.correct++; else p.wrong++;
  p.lastSeen = Date.now();
  State.progress[id]=p; saveAll();
}

// Practice Tests
Views.quiz = (root)=>{
  ensureSetPicker(root, 'Practice Test', (set)=>{
    const qs = set.terms.slice().sort(()=>Math.random()-0.5).slice(0, Math.min(10, set.terms.length))
      .map(t=>({t, choices: pickChoices(set.terms,t)}));
    let submitted=false;
    const draw = ()=>{
      root.insertAdjacentHTML('beforeend', `<div id="quizHost"></div>`);
      $('#quizHost').innerHTML = qs.map((q,idx)=>`
        <div class="quiz-q" data-q="${idx}">
          <div style="margin-bottom:8px"><strong>Q${idx+1}.</strong> ${escapeHtml(q.t.def)}</div>
          ${q.choices.map(c=>`<div class="choice" data-cid="${c.id}">${escapeHtml(c.term)}</div>`).join('')}
        </div>`).join('') + `<button class="btn" id="submitQ">Submit test</button><div id="quizResult"></div>`;
      $$('.choice').forEach(el=>el.onclick=()=>{
        if(submitted) return;
        const parent = el.closest('.quiz-q');
        parent.querySelectorAll('.choice').forEach(c=>c.classList.remove('selected'));
        el.classList.add('selected');
        parent.dataset.picked = el.dataset.cid;
      });
      $('#submitQ').onclick = ()=>{
        if(submitted) return; submitted=true;
        let correct=0;
        qs.forEach((q,idx)=>{
          const parent = $(`.quiz-q[data-q="${idx}"]`);
          const picked = parent.dataset.picked;
          parent.querySelectorAll('.choice').forEach(c=>{
            if (c.dataset.cid===q.t.id) c.classList.add('correct');
            if (c.dataset.cid===picked && picked!==q.t.id) c.classList.add('wrong');
          });
          const ok = picked===q.t.id;
          if (ok) correct++;
          recordProgress(q.t.id, ok);
        });
        bumpStreak();
        $('#quizResult').innerHTML = `<div class="card" style="margin-top:14px"><h3>Score: ${correct}/${qs.length}</h3><p>${Math.round(correct/qs.length*100)}% — keep going!</p><button class="btn" id="retry">Retry</button></div>`;
        $('#retry').onclick = ()=>go('quiz');
      };
    };
    draw();
  });
};

// Quiz Builder (custom questions)
Views.quizbuilder = (root)=>{
  root.innerHTML = `
    <h1>Quiz Builder</h1>
    <p class="sub">Hand-craft questions (multiple choice or short answer).</p>
    <div class="card">
      <label>Quiz title</label><input id="qbTitle" placeholder="e.g. Unit 3 Recap"/>
      <div id="qbList"></div>
      <div class="row" style="margin-top:10px">
        <button class="btn ghost" id="qbAddMC">+ Multiple choice</button>
        <button class="btn ghost" id="qbAddSA">+ Short answer</button>
        <div class="spacer"></div>
        <button class="btn" id="qbSave">Save as study set</button>
      </div>
    </div>`;
  const items = [];
  function draw(){
    $('#qbList').innerHTML = items.map((q,i)=>`
      <div class="card" style="margin-top:10px">
        <div class="row"><strong>Q${i+1} (${q.type})</strong><div class="spacer"></div><button class="btn small danger" data-rm="${i}">Remove</button></div>
        <label>Question</label><input data-i="${i}" data-f="q" value="${escapeAttr(q.q)}"/>
        ${q.type==='mc'?`
          ${q.choices.map((c,ci)=>`<div class="row" style="margin:4px 0"><input data-i="${i}" data-c="${ci}" value="${escapeAttr(c)}"/><label style="margin:0 4px"><input type="radio" name="ans${i}" ${q.answer===ci?'checked':''} data-i="${i}" data-a="${ci}"/> correct</label></div>`).join('')}
          <button class="btn small ghost" data-addc="${i}">+ choice</button>
        ` : `<label>Answer</label><input data-i="${i}" data-f="a" value="${escapeAttr(q.a||'')}"/>`}
      </div>`).join('');
    $$('#qbList input').forEach(inp=>inp.oninput=inp.onchange=()=>{
      const i = +inp.dataset.i, it = items[i];
      if(inp.dataset.f==='q') it.q=inp.value;
      else if(inp.dataset.f==='a') it.a=inp.value;
      else if(inp.dataset.c!==undefined) it.choices[+inp.dataset.c]=inp.value;
      else if(inp.dataset.a!==undefined && inp.checked) it.answer=+inp.dataset.a;
    });
    $$('[data-rm]').forEach(b=>b.onclick=()=>{ items.splice(+b.dataset.rm,1); draw(); });
    $$('[data-addc]').forEach(b=>b.onclick=()=>{ items[+b.dataset.addc].choices.push(''); draw(); });
  }
  $('#qbAddMC').onclick = ()=>{ items.push({type:'mc',q:'',choices:['','',''],answer:0}); draw(); };
  $('#qbAddSA').onclick = ()=>{ items.push({type:'sa',q:'',a:''}); draw(); };
  $('#qbSave').onclick = ()=>{
    const title = $('#qbTitle').value || 'Custom Quiz';
    const terms = items.map(it=>({id:uid(), term: it.type==='mc'?(it.choices[it.answer]||''):it.a, def: it.q}));
    State.sets.unshift({id:uid(), title, subject:'Custom', visibility:'private', createdAt:Date.now(), terms});
    saveAll(); toast('Saved as study set'); go('sets');
  };
};

// Notes
Views.notes = (root)=>{
  root.innerHTML = `
    <h1>Notes</h1>
    <p class="sub">Markdown-light notes with tags and search.</p>
    <div class="row" style="margin-bottom:12px">
      <button class="btn" id="newNote">+ New note</button>
      <input id="nSearch" placeholder="Search notes..." style="max-width:300px"/>
    </div>
    <div class="grid cards-2" id="noteHost"></div>`;
  const render = ()=>{
    const q = ($('#nSearch').value||'').toLowerCase();
    $('#noteHost').innerHTML = State.notes
      .filter(n=>(n.title+n.body+(n.tags||'')).toLowerCase().includes(q))
      .map(n=>`<div class="card">
        <div class="row"><input data-id="${n.id}" data-f="title" value="${escapeAttr(n.title)}" style="font-weight:700"/><button class="btn small danger" data-del="${n.id}">×</button></div>
        <textarea data-id="${n.id}" data-f="body" placeholder="Write...">${escapeHtml(n.body)}</textarea>
        <input data-id="${n.id}" data-f="tags" placeholder="tags, comma separated" value="${escapeAttr(n.tags||'')}" style="margin-top:6px"/>
        <p class="sub" style="margin-top:6px">Updated ${new Date(n.updated).toLocaleString()}</p>
      </div>`).join('') || `<div class="empty">No notes yet.</div>`;
    $$('#noteHost input,#noteHost textarea').forEach(el=>el.oninput=()=>{
      const n = State.notes.find(x=>x.id===el.dataset.id);
      n[el.dataset.f]=el.value; n.updated=Date.now(); saveAll();
    });
    $$('[data-del]').forEach(b=>b.onclick=()=>{ State.notes = State.notes.filter(n=>n.id!==b.dataset.del); saveAll(); render(); });
  };
  $('#newNote').onclick = ()=>{ State.notes.unshift({id:uid(),title:'New note',body:'',tags:'',updated:Date.now()}); saveAll(); render(); };
  $('#nSearch').oninput = render;
  render();
};

// Planner (calendar + exams)
let calCursor = new Date();
const CAL_PALETTE = [
  {name:'Pink',   bg:'#ffb3d1', fg:'#3a0f25'},
  {name:'Peach',  bg:'#ffd6a8', fg:'#5a3110'},
  {name:'Lemon',  bg:'#fff3a8', fg:'#5a4a10'},
  {name:'Mint',   bg:'#b8eecb', fg:'#0f4a25'},
  {name:'Sky',    bg:'#b8dcff', fg:'#0f3a5a'},
  {name:'Lilac',  bg:'#d8c5ff', fg:'#3a205a'},
  {name:'Coral',  bg:'#ffb0a8', fg:'#5a1f1a'},
  {name:'Gray',   bg:'#e0e0e8', fg:'#222'},
];
let calColorIdx = 0;
Views.planner = (root)=>{
  root.innerHTML = `
    <h1>Study Planner</h1>
    <p class="sub">Click a day to add. Click an event to change its color or delete it.</p>
    <div class="row" style="margin-bottom:10px">
      <button class="btn ghost small" id="prevM">←</button>
      <strong id="monthLabel"></strong>
      <button class="btn ghost small" id="nextM">→</button>
      <div class="spacer"></div>
      <button class="btn" id="addExam">+ Add exam</button>
    </div>
    <div class="cal" id="cal"></div>
    <h2>Upcoming exams</h2>
    <div id="examList"></div>`;

  $('#prevM').onclick=()=>{ calCursor.setMonth(calCursor.getMonth()-1); drawCal(); };
  $('#nextM').onclick=()=>{ calCursor.setMonth(calCursor.getMonth()+1); drawCal(); };
  $('#addExam').onclick=()=>{
    const title = prompt('Exam name?'); if(!title) return;
    const date = prompt('Date (YYYY-MM-DD)?', todayISO()); if(!date) return;
    State.exams.push({id:uid(), title, date, colorIdx: calColorIdx}); saveAll(); drawExams(); drawCal();
  };

  function colorOf(e){
    const c = CAL_PALETTE[e.colorIdx] || (e.exam ? {bg:'#ffb0a8', fg:'#5a1f1a'} : CAL_PALETTE[0]);
    return c;
  }

  function drawCal(){
    const y=calCursor.getFullYear(), m=calCursor.getMonth();
    $('#monthLabel').textContent = calCursor.toLocaleDateString(undefined,{month:'long',year:'numeric'});
    const first = new Date(y,m,1).getDay();
    const days = new Date(y,m+1,0).getDate();
    let html = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(h=>`<div class="h">${h}</div>`).join('');
    for(let i=0;i<first;i++) html+=`<div></div>`;
    for(let d=1; d<=days; d++){
      const iso = new Date(y,m,d).toISOString().slice(0,10);
      const evs = [
        ...State.events.filter(e=>e.date===iso).map(e=>({...e,kind:'event'})),
        ...State.exams.filter(e=>e.date===iso).map(e=>({...e,kind:'exam',exam:true}))
      ];
      const isToday = iso===todayISO();
      const evHtml = evs.map(e=>{
        const c = colorOf(e);
        return `<div class="ev" data-eid="${e.id}" data-kind="${e.kind}" style="background:${c.bg};color:${c.fg}">${escapeHtml(e.title)}</div>`;
      }).join('');
      html += `<div class="d ${isToday?'today':''}" data-iso="${iso}"><div class="dn">${d}</div>${evHtml}</div>`;
    }
    $('#cal').innerHTML = html;
    $$('.d').forEach(el=>el.onclick=(ev)=>{
      const evNode = ev.target.closest('.ev');
      if (evNode){
        ev.stopPropagation();
        const id = evNode.dataset.eid, kind = evNode.dataset.kind;
        openEventEditor(id, kind);
        return;
      }
      const t = prompt('Event title? (leave blank to cancel)'); if(!t) return;
      State.events.push({id:uid(), title:t, date:el.dataset.iso, colorIdx: calColorIdx}); saveAll(); drawCal();
    });
  }

  function openEventEditor(id, kind){
    const arr = kind==='exam' ? State.exams : State.events;
    const item = arr.find(x=>x.id===id); if(!item) return;
    closeEventEditor();
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal">
        <h3 style="margin:0 0 4px">${escapeHtml(item.title)}</h3>
        <p class="sub" style="margin:0 0 12px">${kind==='exam'?'Exam':'Event'} · ${item.date}</p>
        <label>Title</label>
        <input id="meTitle" value="${escapeAttr(item.title)}"/>
        <label style="margin-top:10px">Color</label>
        <div class="row" id="meColors" style="gap:8px"></div>
        <div class="row" style="margin-top:14px">
          <button class="btn danger" id="meDel">Delete</button>
          <div class="spacer"></div>
          <button class="btn ghost" id="meCancel">Close</button>
          <button class="btn" id="meSave">Save</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    const drawSw = ()=>{
      $('#meColors').innerHTML = CAL_PALETTE.map((c,i)=>`<button class="swatch ${i===(item.colorIdx??0)?'on':''}" data-ci="${i}" style="background:${c.bg}" title="${c.name}"></button>`).join('');
      $$('#meColors .swatch').forEach(b=>b.onclick=()=>{ item.colorIdx = +b.dataset.ci; saveAll(); drawSw(); drawCal(); drawExams(); });
    };
    drawSw();
    $('#meSave').onclick = ()=>{ item.title = $('#meTitle').value || item.title; saveAll(); closeEventEditor(); drawCal(); drawExams(); };
    $('#meCancel').onclick = closeEventEditor;
    $('#meDel').onclick = ()=>{
      if(!confirm('Delete "'+item.title+'"?')) return;
      if (kind==='exam') State.exams = State.exams.filter(x=>x.id!==id);
      else State.events = State.events.filter(x=>x.id!==id);
      saveAll(); closeEventEditor(); drawCal(); drawExams();
    };
    backdrop.addEventListener('click', e=>{ if(e.target===backdrop) closeEventEditor(); });
  }
  function closeEventEditor(){ document.querySelectorAll('.modal-backdrop').forEach(n=>n.remove()); }

  function drawExams(){
    const list = State.exams.slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
    $('#examList').innerHTML = list.length? `<table><tr><th>Exam</th><th>Date</th><th>Days left</th><th>Color</th><th></th></tr>${list.map(e=>{
      const d = Math.ceil((new Date(e.date)-Date.now())/86400000);
      const c = colorOf({...e,exam:true});
      return `<tr><td>${escapeHtml(e.title)}</td><td>${e.date}</td><td>${d}</td><td><span class="swatch sm" style="background:${c.bg}"></span></td><td><button class="btn small danger" data-rmx="${e.id}">×</button></td></tr>`;
    }).join('')}</table>` : `<div class="empty">No exams scheduled.</div>`;
    $$('[data-rmx]').forEach(b=>b.onclick=()=>{ State.exams = State.exams.filter(e=>e.id!==b.dataset.rmx); saveAll(); drawExams(); drawCal(); });
  }

  drawCal(); drawExams();
};

// Pomodoro
Views.pomodoro = (root)=>{
  root.innerHTML = `
    <h1>Pomodoro Timer</h1>
    <p class="sub">Focus in bursts. Default 25/5/15.</p>
    <div class="pomo">
      <div class="pomo-modes">
        <button class="btn ghost" data-mode="focus">Focus</button>
        <button class="btn ghost" data-mode="short">Short break</button>
        <button class="btn ghost" data-mode="long">Long break</button>
      </div>
      <div class="timer" id="timer">25:00</div>
      <div class="row">
        <button class="btn" id="startBtn">Start</button>
        <button class="btn ghost" id="resetBtn">Reset</button>
      </div>
      <div class="row" style="margin-top:10px">
        <label style="margin:0">Focus <input id="cfgF" type="number" min="1" value="${State.pomo.focus}" style="width:70px"></label>
        <label style="margin:0">Short <input id="cfgS" type="number" min="1" value="${State.pomo.short}" style="width:70px"></label>
        <label style="margin:0">Long <input id="cfgL" type="number" min="1" value="${State.pomo.long}" style="width:70px"></label>
      </div>
      <p class="sub">Completed focus blocks today: <strong id="doneToday">${State.pomo.completedToday||0}</strong></p>
    </div>`;
  let mode='focus', total=State.pomo.focus*60, remaining=total, running=false, intv=null;
  const fmt = s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const draw = ()=>$('#timer').textContent = fmt(remaining);
  function setMode(m){
    mode=m; const min = State.pomo[m]; total=min*60; remaining=total; draw();
  }
  $$('[data-mode]').forEach(b=>b.onclick=()=>{ pause(); setMode(b.dataset.mode); });
  $('#startBtn').onclick = ()=>{
    if (running){ pause(); return; }
    running=true; $('#startBtn').textContent='Pause';
    intv=setInterval(()=>{
      remaining--; draw();
      if (remaining<=0){
        pause();
        if (mode==='focus'){
          State.pomo.completedToday = (State.pomo.completedToday||0)+1;
          $('#doneToday').textContent = State.pomo.completedToday;
          bumpStreak(); saveAll();
        }
        toast(mode==='focus'?'Focus block done — take a break!':'Break over — back to it!');
      }
    },1000);
  };
  function pause(){ running=false; clearInterval(intv); $('#startBtn').textContent='Start'; }
  $('#resetBtn').onclick = ()=>{ pause(); remaining=total; draw(); };
  $$('#cfgF,#cfgS,#cfgL').forEach(inp=>inp.onchange=()=>{
    State.pomo.focus = +$('#cfgF').value||25;
    State.pomo.short = +$('#cfgS').value||5;
    State.pomo.long  = +$('#cfgL').value||15;
    saveAll(); setMode(mode);
  });
  setMode('focus');
};

// Analytics
Views.analytics = (root)=>{
  const setStats = State.sets.map(s=>{
    const terms = s.terms;
    const stats = terms.map(t=>State.progress[t.id]||{correct:0,wrong:0});
    const mastered = stats.filter(p=>p.correct-p.wrong>=2).length;
    const shaky = stats.filter(p=>p.correct>0 && p.correct-p.wrong<2 && p.correct-p.wrong>=0).length;
    const weak = stats.filter(p=>p.wrong>p.correct).length;
    return {s,mastered,shaky,weak,total:terms.length};
  });
  root.innerHTML = `
    <h1>Progress Analytics</h1>
    <p class="sub">What you've mastered and what needs more review.</p>
    <div class="grid cards-3">
      <div class="card"><h3>Mastered terms</h3><div class="kpi mastered">${setStats.reduce((a,b)=>a+b.mastered,0)}</div></div>
      <div class="card"><h3>Needs review</h3><div class="kpi weak">${setStats.reduce((a,b)=>a+b.weak,0)}</div></div>
      <div class="card"><h3>Total terms</h3><div class="kpi">${setStats.reduce((a,b)=>a+b.total,0)}</div></div>
    </div>
    <h2>By study set</h2>
    ${setStats.length? setStats.map(({s,mastered,shaky,weak,total})=>{
      const pct = total? Math.round(mastered/total*100):0;
      return `<div class="card" style="margin-bottom:10px">
        <div class="row"><strong>${escapeHtml(s.title)}</strong><div class="spacer"></div><span class="tag">${pct}% mastered</span></div>
        <div class="bar-row"><div class="bar-label mastered">Mastered (${mastered})</div><div class="bar"><div style="width:${total?mastered/total*100:0}%"></div></div></div>
        <div class="bar-row"><div class="bar-label shaky">Familiar (${shaky})</div><div class="bar"><div style="width:${total?shaky/total*100:0}%;background:linear-gradient(90deg,#f0b429,#ff8a3c)"></div></div></div>
        <div class="bar-row"><div class="bar-label weak">Weak (${weak})</div><div class="bar"><div style="width:${total?weak/total*100:0}%;background:linear-gradient(90deg,#ff6a6a,#ff3a8c)"></div></div></div>
      </div>`;
    }).join('') : `<div class="empty">No data yet — study a set first.</div>`}`;
};

// Resources
Views.resources = (root)=>{
  root.innerHTML = `
    <h1>Resources</h1>
    <p class="sub">Upload PDFs, images, and links for any subject.</p>
    <div class="card">
      <label>Title</label><input id="rTitle" placeholder="Lecture 3 slides"/>
      <label>Link or note</label><input id="rUrl" placeholder="https://… or paste a note"/>
      <label>Upload file (stored in your browser)</label><input id="rFile" type="file"/>
      <div class="row" style="margin-top:8px"><button class="btn" id="rAdd">Add resource</button></div>
    </div>
    <h2>Library</h2>
    <div id="rList" class="grid cards-3"></div>`;
  function render(){
    $('#rList').innerHTML = State.resources.map(r=>`
      <div class="card">
        <h3>${escapeHtml(r.title)}</h3>
        <p>${escapeHtml(r.kind)}</p>
        ${r.url? `<a href="${escapeAttr(r.url)}" target="_blank" rel="noopener">Open ↗</a>`:''}
        ${r.dataUrl? `<a href="${r.dataUrl}" download="${escapeAttr(r.filename||'file')}">Download ↓</a>`:''}
        <div class="row" style="margin-top:8px"><button class="btn small danger" data-rd="${r.id}">Delete</button></div>
      </div>`).join('') || `<div class="empty">No resources yet.</div>`;
    $$('[data-rd]').forEach(b=>b.onclick=()=>{ State.resources = State.resources.filter(r=>r.id!==b.dataset.rd); saveAll(); render(); });
  }
  $('#rAdd').onclick = ()=>{
    const title = $('#rTitle').value || 'Untitled'; const url = $('#rUrl').value;
    const f = $('#rFile').files[0];
    const finish = (extra={})=>{ State.resources.unshift({id:uid(),title,url,kind: f? f.type||'file':(url?'link':'note'),...extra}); saveAll(); render(); $('#rTitle').value=''; $('#rUrl').value=''; $('#rFile').value=''; };
    if (f){
      if (f.size > 4*1024*1024) return toast('File too big for browser storage (4MB max)');
      const reader = new FileReader();
      reader.onload = ()=>finish({dataUrl: reader.result, filename: f.name});
      reader.readAsDataURL(f);
    } else finish();
  };
  render();
};

// Share & Collaborate
Views.share = (root)=>{
  root.innerHTML = `
    <h1>Sharing & Collaboration</h1>
    <p class="sub">Export a set as a shareable code, or import one from a friend.</p>
    <div class="grid cards-2">
      <div class="card">
        <h3>Export</h3>
        <label>Pick a set</label>
        <select id="shSet">${State.sets.map(s=>`<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('')}</select>
        <div class="row" style="margin-top:8px"><button class="btn" id="shGen">Generate share code</button></div>
        <textarea id="shOut" placeholder="Share code appears here" style="margin-top:10px;min-height:160px"></textarea>
      </div>
      <div class="card">
        <h3>Import</h3>
        <label>Paste a share code</label>
        <textarea id="shIn" style="min-height:160px"></textarea>
        <div class="row" style="margin-top:8px"><button class="btn" id="shImp">Import</button></div>
      </div>
    </div>
    <h2>Public sets in your library</h2>
    <div class="grid cards-3" id="shPub"></div>`;
  $('#shGen').onclick = ()=>{
    const s = State.sets.find(x=>x.id===$('#shSet').value); if(!s) return;
    $('#shOut').value = 'SD:'+btoa(unescape(encodeURIComponent(JSON.stringify({title:s.title,subject:s.subject,terms:s.terms.map(t=>({term:t.term,def:t.def}))}))));
  };
  $('#shImp').onclick = ()=>{
    try{
      const raw = $('#shIn').value.trim().replace(/^SD:/,'');
      const obj = JSON.parse(decodeURIComponent(escape(atob(raw))));
      const set = {id:uid(),title:obj.title||'Imported',subject:obj.subject||'',visibility:'shared',createdAt:Date.now(),terms:(obj.terms||[]).map(t=>({id:uid(),term:t.term,def:t.def}))};
      State.sets.unshift(set); saveAll(); toast('Imported'); go('sets');
    }catch(e){ toast('Invalid code'); }
  };
  $('#shPub').innerHTML = State.sets.filter(s=>s.visibility!=='private').map(s=>`<div class="card"><h3>${escapeHtml(s.title)}</h3><p>${s.terms.length} terms · ${s.visibility}</p></div>`).join('') || `<div class="empty">No shared sets.</div>`;
};

// Helpers
function ensureSetPicker(root, title, cb){
  root.innerHTML = `<h1>${title}</h1>
    <div class="row"><label style="margin:0">Set:</label>
      <select id="setPick" style="max-width:340px">
        ${State.sets.map(s=>`<option value="${s.id}" ${s.id===selectedSetId?'selected':''}>${escapeHtml(s.title)} (${s.terms.length})</option>`).join('')}
      </select>
    </div>`;
  const set = State.sets.find(s=>s.id===($('#setPick').value));
  if(!set){ root.insertAdjacentHTML('beforeend', `<div class="empty">Create a study set first.</div>`); return; }
  selectedSetId = set.id;
  $('#setPick').onchange = ()=>{ selectedSetId = $('#setPick').value; go(currentView()); };
  cb(set);
}
function currentView(){ return document.querySelector('.nav.active')?.dataset.view || 'dashboard'; }
function escapeHtml(s=''){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]); }
function escapeAttr(s=''){ return escapeHtml(s).replace(/'/g,'&#39;'); }

// boot
(function init(){
  if (!Store.currentUser){
    const users = Store.users();
    const first = Object.keys(users)[0];
    if (first) Store.currentUser = first;
  }
  loadState();
  refreshUserLabel();
  renderStreak();
  // Reset pomodoro daily count if new day
  const tag = Store.load('pomoDay', null);
  if (tag !== todayISO()){ State.pomo.completedToday = 0; saveAll(); Store.save('pomoDay', todayISO()); }
  go('dashboard');
})();
