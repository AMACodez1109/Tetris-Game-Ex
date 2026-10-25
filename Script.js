/* TETRIS v2 - sounds + touch + mobile friendly */
const COLS=10, ROWS=20;
const SHAPES={I:[[1,1,1,1]],O:[[1,1],[1,1]],T:[[0,1,0],[1,1,1]],S:[[0,1,1],[1,1,0]],Z:[[1,1,0],[0,1,1]],J:[[1,0,0],[1,1,1]],L:[[0,0,1],[1,1,1]]};
const COLORS={I:'#00e5ff',O:'#ffeb3b',T:'#a855f7',S:'#4ade80',Z:'#ef4444',J:'#3b82f6',L:'#fb923c'};
const KEYS={
  0:{left:'ArrowLeft',right:'ArrowRight',down:'ArrowDown',rot:'ArrowUp',hard:' '},
  1:{left:'KeyA',right:'KeyD',down:'KeyS',rot:'KeyQ',rot2:'KeyW',hard:'KeyE'},
  2:{left:'KeyJ',right:'KeyL',down:'KeyK',rot:'KeyU',rot2:'KeyI',hard:'KeyO'},
  3:{left:'Numpad4',right:'Numpad6',down:'Numpad5',rot:'Numpad7',rot2:'Numpad8',hard:'Numpad9'},
};

const SCORE_TABLE=[0,100,300,500,800];
let playerCount=1, players=[], paused=false, running=false;
let soundOn=true;
let difficulty='medium';
let currentLang=localStorage.getItem('tetris_lang')|| (navigator.language.startsWith('es')?'es':'en');
let highScores=JSON.parse(localStorage.getItem('tetris_hs')||'[]');

const DIFFICULTY={
  easy:{base:900,speed:35,ghost:true,scoreMul:0.8,label:'Easy',startLevel:1},
  medium:{base:700,speed:60,ghost:true,scoreMul:1,label:'Medium',startLevel:1},
  hard:{base:400,speed:90,ghost:false,scoreMul:1.5,startLevel:3}
};

const I18N={
  en:{
    subtitle:"Battle Edition — Last Player Standing Wins",
    players:"PLAYERS", 
    difficulty:"DIFFICULTY", 
    language:"LANGUAGE", 
    easy:"EASY", 
    medium:"MEDIUM", 
    hard:"HARD",
    play:"PLAY", 
    pauseHint:"P Pause — R Restart",
    paused:"PAUSED", 
    resume:"RESUME", 
    best:"BEST",
    score:"SCORE", 
    lines:"LINES", 
    level:"LVL", 
    next:"NEXT",
    controls:"CONTROLS", 
    highScores:"🏆 HIGH SCORES", 
    noScores:"No scores yet",
    gameOver:"GAME OVER", 
    again:"PLAY AGAIN", 
    win:"WINS!", 
    out:"(OUT)",
    drop:"DROP"
  },
  es:{
    subtitle:"Edición Batalla — ¡El último en pie gana!",
    players:"JUGADORES", 
    difficulty:"DIFICULTAD", 
    language:"IDIOMA", 
    easy:"FÁCIL", 
    medium:"MEDIO", 
    hard:"DIFÍCIL",
    play:"JUGAR", 
    pauseHint:"P Pausa — R Reiniciar",
    paused:"PAUSA",
    resume:"CONTINUAR", 
    best:"MEJOR",
    score:"PUNTOS", 
    lines:"LÍNEAS", 
    level:"NIVEL", 
    next:"SIGUIENTE",
    controls:"CONTROLES", 
    highScores:"🏆 RÉCORDS", 
    noScores:"Sin récords aún",
    gameOver:"FIN DEL JUEGO", 
    again:"JUGAR OTRA VEZ", 
    win:"¡GANA!", 
    out:"(FUERA)",
    drop:"CAER"
  },
  fr:{
    subtitle:"Édition Bataille — Dernier survivant gagne",
    players:"JOUEURS", 
    difficulty:"DIFFICULTÉ", 
    language:"LANGUE", 
    easy:"FACILE", 
    medium:"MOYEN", 
    hard:"DIFFICILE",
    play:"JOUER", 
    pauseHint:"P Pause — R Recommencer",
    paused:"PAUSE", 
    resume:"REPRENDRE", 
    best:"MEILLEUR",
    score:"SCORE", 
    lines:"LIGNES", 
    level:"NIVEAU", 
    next:"SUIVANT",
    controls:"CONTRÔLES", 
    highScores:"🏆 MEILLEURS SCORES", 
    noScores:"Pas encore de scores",
    gameOver:"PARTIE FINIE", 
    again:"REJOUER", 
    win:"GAGNE!", 
    out:"(ÉLIMINÉ)",
    drop:"CHUTE"
  },
  pt:{
    subtitle:"Edição Batalha — Último sobrevivente vence",
    players:"JOGADORES", 
    difficulty:"DIFICULDADE", 
    language:"IDIOMA", 
    easy:"FÁCIL", 
    medium:"MÉDIO", 
    hard:"DIFÍCIL",
    play:"JOGAR", 
    pauseHint:"P Pausar — R Reiniciar",
    paused:"PAUSADO", 
    resume:"CONTINUAR", 
    best:"MELHOR",
    score:"PONTOS", 
    lines:"LINHAS", 
    level:"NÍVEL", 
    next:"PRÓXIMO",
    controls:"CONTROLES",
    highScores:"🏆 RECORDES", 
    noScores:"Sem recordes ainda",
    gameOver:"FIM DE JOGO", 
    again:"JOGAR NOVAMENTE", 
    win:"VENCEU!", 
    out:"(FORA)",
    drop:"SOLTAR"
  },
  de:{
    subtitle:"Battle Edition — Letzter Überlebender gewinnt",
    players:"SPIELER", 
    difficulty:"SCHWIERIGKEIT", 
    language:"SPRACHE", 
    easy:"LEICHT", 
    medium:"MITTEL", 
    hard:"SCHWER",
    play:"SPIELEN", 
    pauseHint:"P Pause — R Neustart",
    paused:"PAUSE", 
    resume:"WEITER", 
    best:"BESTE",
    score:"PUNKTE", 
    lines:"REIHEN", 
    level:"LEVEL", 
    next:"NÄCHSTE",
    controls:"STEUERUNG", 
    highScores:"🏆 BESTENLISTE", 
    noScores:"Noch keine Scores",
    gameOver:"GAME OVER", 
    again:"NOCHMAL SPIELEN", 
    win:"GEWINNT!", 
    out:"(RAUS)",
    drop:"FALLEN"
  }
};

function t(k){ 
  return (I18N[currentLang]&&I18N[currentLang][k]) || I18N.en[k] || k;
}

function applyLang(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    let key=el.getAttribute('data-i18n'); 
    el.textContent=t(key);
  });

  // update active states for language pills
  document.querySelectorAll('#lBtns button').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.lang===currentLang);
  });

  renderHigh();
}

function setLang(l){
  currentLang=l; 
  localStorage.setItem('tetris_lang',l);
  let sel=document.getElementById('langSelect');

  if(sel) 
    sel.value=l;
  applyLang();

  // re-draw boards to update translated labels
  if(players.length) players.forEach(p=>{ /* labels updated on next drawPlayer, but refresh stats immediately */ 
    let wrap=document.getElementById(`wrap-${p.id}`);
    if(wrap){ /* force redraw */ }
  });
}

// ---- Audio engine (WebAudio, no files needed) ----
let audioCtx=null;

function getAudio(){ 
  if(!audioCtx) 
    audioCtx=new (window.AudioContext||window.webkitAudioContext)(); 
  return audioCtx; 
}

function tone(freq, dur, type='square', vol=0.15, slide=0){
  if(!soundOn) return;
  try{
    let ctx=getAudio(); 
    let o=ctx.createOscillator(); 
    let g=ctx.createGain();
    o.type=type; 
    o.frequency.value=freq; 
    o.connect(g); 
    g.connect(ctx.destination);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+dur);

    if(slide) o.frequency.exponentialRampToValueAtTime(freq+slide, ctx.currentTime+dur);
    o.start(); 
    o.stop(ctx.currentTime+dur);
  }catch{}
}
const SFX={
  move:()=>tone(200,0.08,'square',0.08),
  rotate:()=>tone(400,0.1,'square',0.1,200),
  drop:()=>{
    tone(120,0.2,'sawtooth',0.15); 
    setTimeout(()=>tone(60,0.25,'sawtooth',0.15),80);
  },
  lock:()=>tone(150,0.12,'square',0.12),
  line1:()=>{
    tone(500,0.15,'sine',0.18); 
    setTimeout(()=>tone(700,0.2,'sine',0.18),100);
  },
  line2:()=>{
    tone(500,0.12,'sine',0.18); 
    setTimeout(()=>tone(700,0.12,'sine',0.18),90); 
    setTimeout(()=>tone(900,0.2,'sine',0.18),180);
  },
  line4:()=>{ 
    [400,600,800,1200].forEach((f,i)=>setTimeout(()=>tone(f,0.25,'sine',0.22),i*90)); 
  },
  over:()=>{ 
    [300,250,200,120].forEach((f,i)=>setTimeout(()=>tone(f,0.35,'sawtooth',0.2),i*150)); 
  },
  level:()=>{ 
    [600,800,1000].forEach((f,i)=>setTimeout(()=>tone(f,0.2,'triangle',0.18),i*100)); 
  }
};

class Player{
  constructor(id){ 
    this.id=id; this.reset(); 
  }
  reset(){
    this.grid=Array.from({length:ROWS},()=>Array(COLS).fill(null));
    this.score=0; 
    this.lines=0; 
    this.over=false;
    this.level=DIFFICULTY[difficulty]?.startLevel||1;
    this.bag=[]; 
    this.next=[]; 
    this.cur=null; 
    this.fillBag(); 
    this.spawn();
  }
  fillBag(){ 
    let types=Object.keys(SHAPES); 
    for(let i=types.length-1;i>0;i--){
      let j=Math.floor(Math.random()*(i+1));
      [types[i],types[j]]=[types[j],types[i]];
    } 
    this.bag.push(...types); 
  }
  nextType(){ 
    if(this.bag.length<7) 
      this.fillBag(); 
    return this.bag.shift(); 
  }
  spawn(){
    let type=this.next.length? this.next.shift() : this.nextType();
    while(this.next.length<4) 
      this.next.push(this.nextType());
    let shape=SHAPES[type].map(r=>[...r]);
    this.cur={type,shape,x:Math.floor(COLS/2)-Math.floor(shape[0].length/2),y:0};
    if(this.collides(this.cur.shape,this.cur.x,this.cur.y)) 
      this.over=true;
  }
  collides(shape,x,y){
    for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++)if(shape[r][c]){
      let nx=x+c, ny=y+r; 
      if(nx<0||nx>=COLS||ny>=ROWS) 
        return true; 
      if(ny>=0 && this.grid[ny][nx]) 
        return true;
    } 
    return false;
  }
  rotate(){
    if(!this.cur||this.over) 
      return; 
    let s=this.cur.shape; 
    let ns=s[0].map((_,i)=>s.map(row=>row[i]).reverse());
    let kicks=[0,-1,1,-2,2]; 
    for(let k of kicks){ 
      if(!this.collides(ns,this.cur.x+k,this.cur.y)){ 
        this.cur.shape=ns; 
        this.cur.x+=k; SFX.rotate(); 
        return; 
      } 
    }
  }
  move(dx,dy,isLock=false){
    if(!this.cur||this.over) 
      return false;
    if(!this.collides(this.cur.shape,this.cur.x+dx,this.cur.y+dy)){ 
      this.cur.x+=dx; 
      this.cur.y+=dy; 
      if(dx!==0) 
        SFX.move(); 
      return true; 
    }
    if(dy>0 && !isLock){ 
      this.lock(); 
    } 
    return false;
  }
  hardDrop(){
    if(!this.cur||this.over) 
      return; 
    let d=0; 
    while(!this.collides(this.cur.shape,this.cur.x,this.cur.y+1)){ 
      this.cur.y++; d++; 
    }
    this.score+=d*2; 
    SFX.drop(); 
    this.lock();
  }
  lock(){
    let {shape,x,y,type}=this.cur;
    for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++)if(shape[r][c]){ 
      let gy=y+r,gx=x+c; 
      if(gy>=0) 
        this.grid[gy][gx]=type; 
    }
    SFX.lock(); 
    this.clear(); 
    this.spawn();
  }
  clear(){
    let cleared=0; 
    for(let r=ROWS-1;r>=0;r--){ 
      if(this.grid[r].every(v=>v)){ 
        this.grid.splice(r,1); 
        this.grid.unshift(Array(COLS).fill(null)); 
        cleared++; 
        r++; 
      } 
    }
    if(cleared){
      let prevLevel=this.level;
      this.lines+=cleared; 
      this.level=Math.floor(this.lines/10)+(DIFFICULTY[difficulty]?.startLevel||1);
      let mul=DIFFICULTY[difficulty]?.scoreMul||1;
      this.score+=Math.round(SCORE_TABLE[cleared]*this.level*mul);
      if(cleared===4) SFX.line4(); 
      else if(cleared>=2) SFX.line2(); 
      else SFX.line1();
      if(this.level>prevLevel) 
        SFX.level();
      if(playerCount===1) 
        checkHigh();
    }
  }
}
function checkHigh(){
  let sc=players[0]?.score||0;
  highScores.push({score:sc,date:new Date().toLocaleDateString()});
  highScores.sort((a,b)=>b.score-a.score); 
  highScores=highScores.slice(0,5);
  localStorage.setItem('tetris_hs',JSON.stringify(highScores)); 
  renderHigh();
}
function renderHigh(){
  let top=highScores[0]?.score||0;
  document.getElementById('globalHigh').textContent=top?`${t('best')} ${top}`:`${t('best')} —`;
  let hs=document.getElementById('hsList'); 
  if(!hs) 
    return;
  hs.innerHTML=`<h4>${t('highScores')}</h4>`+ (highScores.length? highScores.map((h,i)=>`<div><span>#${i+1} ${h.score}</span><span>${h.date}</span></div>`).join(''):`<div>${t('noScores')}</div>`);
}
function createBoardDOM(id){
  let wrap=document.createElement('div'); 
  wrap.className='board-wrap'; 
  wrap.id=`wrap-${id}`;
  wrap.innerHTML=`
    <div class="board-head"><h3>P${id+1}</h3><span class="player-badge" style="background:${Object.values(COLORS)[id%7]}">PLAYER ${id+1}</span></div>
    <div class="stats">
      <div class="stat"><label>${t('score')}</label><b id="score-${id}">0</b></div>
      <div class="stat"><label>${t('lines')}</label><b id="lines-${id}">0</b></div>
      <div class="stat"><label>${t('level')}</label><b id="level-${id}">1</b></div>
      <div class="stat"><label>${t('next')}</label><div id="next-${id}" class="next-box"></div></div>
    </div>
    <canvas id="canvas-${id}" class="game-canvas" width="300" height="600"></canvas>
    <div class="touch-pad" id="touch-${id}">
      <div class="touch-label">${t('controls')} P${id+1}</div>
      <button data-act="left">◀</button>
      <button data-act="down">▼</button>
      <button data-act="right">▶</button>
      <button data-act="rot">⟳</button>
      <button data-act="drop" class="drop">${t('drop')}</button>
      <button data-act="hard">⬇⬇</button>
    </div>
  `;
  return wrap;
}
function drawCell(ctx,x,y,bw,bh,color){
  ctx.fillStyle=color; 
  ctx.fillRect(x*bw+1,y*bh+1,bw-2,bh-2);
  ctx.fillStyle='rgba(255,255,255,.32)'; 
  ctx.fillRect(x*bw+1,y*bh+1,bw-2,3);
  ctx.fillStyle='rgba(0,0,0,.25)'; 
  ctx.fillRect(x*bw+1,y*bh+bh-5,bw-2,3);
}
function drawShape(ctx,shape,x,y,bw,bh,color){ 
  for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++)if(shape[r][c]){ 
    let gx=x+c, gy=y+r; 
    if(gy>=0) 
      drawCell(ctx,gx,gy,bw,bh,color); 
    } 
  }
function drawPlayer(p){
  let c=document.getElementById(`canvas-${p.id}`); 
  if(!c) 
    return; 
  let ctx=c.getContext('2d');
  let W=c.width,H=c.height,bw=W/COLS,bh=H/ROWS;
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#151530'; ctx.lineWidth=0.5;
  for(let i=1;i<COLS;i++){
    ctx.beginPath();
    ctx.moveTo(i*bw,0);
    ctx.lineTo(i*bw,H);
    ctx.stroke();
  }
  for(let i=1;i<ROWS;i++){
    ctx.beginPath();
    ctx.moveTo(0,i*bh);
    ctx.lineTo(W,i*bh);
    ctx.stroke();
  }
  let showGhost=DIFFICULTY[difficulty]?.ghost!==false;
  if(showGhost && p.cur && !p.over){
    let gy=p.cur.y; 
    while(!p.collides(p.cur.shape,p.cur.x,gy+1)) 
      gy++;
    ctx.globalAlpha=0.22; 
    drawShape(ctx,p.cur.shape,p.cur.x,gy,bw,bh,COLORS[p.cur.type]); 
    ctx.globalAlpha=1;
  }
  for(let r=0;r<ROWS;r++)for(let col=0;col<COLS;col++) if(p.grid[r][col]) drawCell(ctx,col,r,bw,bh,COLORS[p.grid[r][col]]);
  if(p.cur) drawShape(ctx,p.cur.shape,p.cur.x,p.cur.y,bw,bh,COLORS[p.cur.type]);
  document.getElementById(`score-${p.id}`).textContent=p.score;
  document.getElementById(`lines-${p.id}`).textContent=p.lines;
  document.getElementById(`level-${p.id}`).textContent=p.level;
  let nextDiv=document.getElementById(`next-${p.id}`); nextDiv.innerHTML='';
  p.next.slice(0,4).forEach(t=>{
    let nc=document.createElement('canvas'); 
    nc.className='next-canvas'; 
    nc.width=36; 
    nc.height=36;
    let nctx=nc.getContext('2d'); 
    let sh=SHAPES[t]; let s=6; 
    let ox=(36-sh[0].length*s)/2, oy=(36-sh.length*s)/2;
    for(let r=0;r<sh.length;r++)for(let c=0;c<sh[r].length;c++)if(sh[r][c]){ 
      nctx.fillStyle=COLORS[t]; 
      nctx.fillRect(ox+c*s,oy+r*s,s-1,s-1); 
    }
    nextDiv.appendChild(nc);
  });
  let wrap=document.getElementById(`wrap-${p.id}`); 
  if(p.over) 
    wrap.classList.add('dead');
   else wrap.classList.remove('dead');
}
let lastTime=0;
function loop(t){
  if(!running) 
    return;
  if(!paused){
    let d=DIFFICULTY[difficulty]||DIFFICULTY.medium;
    let fastest=Math.max(...players.map(p=>p.level));
    let dropMs=Math.max(40, d.base - (fastest* d.speed));
    if(t-lastTime> dropMs){
      players.forEach(p=>{ if(!p.over) p.move(0,1,true); }); 
      lastTime=t;
    }
    players.forEach(drawPlayer);
    if(players.every(p=>p.over)) 
      endGame();
  }
  requestAnimationFrame(loop);
}
function endGame(){
  running=false; 
  SFX.over();
  let content=document.getElementById('overContent');
  if(playerCount===1){
    let sc=players[0].score; 
    content.innerHTML=`<h2>${t('gameOver')}</h2><div class="gameover-score">${sc}</div><p>${t('lines')} ${players[0].lines} · ${t('level')} ${players[0].level}</p><button id="againBtn" class="play">${t('again')}</button>`;
  }else{
    let sorted=[...players].sort((a,b)=>b.score-a.score); 
    let winner=sorted[0];
    content.innerHTML=`<h2>🏆 P${winner.id+1} ${t('win')}</h2>`+ sorted.map(p=>`<div style="display:flex;justify-content:space-between;margin:6px 0"><span>P${p.id+1} ${p.over?t('out'):''}</span><b>${p.score}</b></div>`).join('') + `<button id="againBtn" class="play">${t('again')}</button>`;
  }
  document.getElementById('overScreen').classList.add('show');
  document.getElementById('againBtn').onclick=()=>{ 
    document.getElementById('overScreen').classList.remove('show'); 
    initGame(); 
  };
}
function initGame(){
  try{ getAudio(); }catch{}
  let boards=document.getElementById('boards'); 
  boards.className=`boards p${playerCount}`; 
  boards.innerHTML='';
  players=Array.from({length:playerCount},(_,i)=>new Player(i));
  players.forEach(p=>{
    boards.appendChild(createBoardDOM(p.id));
    let pad=document.getElementById(`touch-${p.id}`);
    pad.querySelectorAll('button').forEach(btn=>{
      let act=btn.dataset.act;
      let handler=(e)=>{ e.preventDefault(); 
        if(p.over) 
          return; 
        if(act==='left') 
          p.move(-1,0); 
        else if(act==='right') 
          p.move(1,0); 
        else if(act==='down') 
          p.move(0,1); 
        else if(act==='rot') 
          p.rotate(); 
        else if(act==='drop'){ 
          p.move(0,1); 
        } 
        else if(act==='hard') 
          p.hardDrop(); };
      btn.addEventListener('touchstart',handler,{passive:false}); 
      btn.addEventListener('mousedown',handler);
    });
  });
  paused=false; 
  running=true; 
  lastTime=performance.now(); 
  requestAnimationFrame(loop);
}
document.addEventListener('keydown',e=>{
  if(e.code==='KeyP'){ 
    togglePause(); 
    return; 
  } 
  if(e.code==='KeyR'){ 
    initGame(); 
    return; 
  } 
  if(paused||!running) 
    return;
  players.forEach((p,i)=>{
    let k=KEYS[i]; 
    if(!k) 
      return;
    if(e.code===k.left) 
      p.move(-1,0); 
    else if(e.code===k.right) 
      p.move(1,0); 
    else if(e.code===k.down) 
      p.move(0,1); 
    else if(e.code===k.rot||e.code===k.rot2) 
      p.rotate(); 
    else if(e.code===k.hard){ 
      e.preventDefault(); 
      p.hardDrop(); 
    }
  });
});
function togglePause(){ 
  if(!running) 
    return; 
  paused=!paused; 
  document.getElementById('pauseScreen').classList.toggle('show',paused); 
  if(paused) 
    tone(300,0.2,'sine',0.1); 
  else 
    tone(600,0.15,'sine',0.1); 
  }
document.querySelectorAll('#pBtns button').forEach(b=>{ b.onclick=()=>{ 
  document.querySelectorAll('#pBtns button').forEach(x=>x.classList.remove('active')); 
  b.classList.add('active'); 
  playerCount=parseInt(b.dataset.n); 
}; });
document.querySelectorAll('#dBtns button').forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll('#dBtns button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    difficulty=b.dataset.diff;
    localStorage.setItem('tetris_diff',difficulty);
  };
});
let savedDiff=localStorage.getItem('tetris_diff');
if(savedDiff && DIFFICULTY[savedDiff]){ 
  difficulty=savedDiff; 
  document.querySelectorAll('#dBtns button').forEach(btn=>{ 
    btn.classList.toggle('active',btn.dataset.diff===difficulty); }); 
}

document.getElementById('playBtn').onclick=()=>{ 
  document.getElementById('startScreen').classList.remove('show'); 
  initGame(); 
  renderHigh(); 
};
document.getElementById('pauseBtn').onclick=togglePause;
document.getElementById('resumeBtn').onclick=togglePause;
document.getElementById('restartBtn').onclick=()=>{ 
  document.getElementById('startScreen').classList.add('show'); 
  document.getElementById('overScreen').classList.remove('show'); 
  document.getElementById('pauseScreen').classList.remove('show'); 
  running=false; 
};
document.getElementById('soundBtn').onclick=(e)=>{ 
  soundOn=!soundOn; 
  e.target.textContent=soundOn?'🔊':'🔇'; 
  if(soundOn){ 
    getAudio(); 
    tone(600,0.12,'sine',0.15);
  } 
};
document.getElementById('langSelect').value=currentLang;
document.getElementById('langSelect').onchange=(e)=>{ 
  setLang(e.target.value); 
};
document.querySelectorAll('#lBtns button').forEach(btn=>{
  btn.onclick=()=>{ 
    setLang(btn.dataset.lang); 
  };
});
renderHigh();
applyLang();
setLang(currentLang);
