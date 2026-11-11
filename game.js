'use strict';
const $ = id => document.getElementById(id);
const route = $('route');
const length = route.getTotalLength();
let ride = 'car', mode = 'selection', distance = 0, cpuDistance = 0, speed = 0, elapsed = 0;
let held = false, boosts = 3, boostUntil = 0, countdown = 3, countdownClock = 0, last = 0, sound = false, audio;
let questions = [], checkpointIndex = 0, checkpoints = [];
const rocks = [[149,116],[186,161],[263,98],[331,71],[283,144],[398,139],[498,96],[557,160],[611,148],[650,188],[588,247],[638,333],[455,301],[373,328],[305,364],[225,299],[99,317],[46,245],[93,224],[197,231],[255,215],[466,202]];
for (const [x,y] of rocks) { let nearest=0, best=Infinity; for(let d=0;d<=length;d+=1) { const p=route.getPointAtLength(d), delta=Math.hypot(p.x-x,p.y-y); if(delta<best){best=delta;nearest=d;} } checkpoints.push(nearest); }
checkpoints.sort((a,b)=>a-b);
const bestKey = name => 'countryside-race-best-' + name;
function readBest() { try { return Number(localStorage.getItem(bestKey(ride))) || 0; } catch { return 0; } }
function time(value) { return `${Math.floor(value / 60)}:${(value % 60).toFixed(1).padStart(4, '0')}`; }
function tone(freq = 440, duration = .12) {
  if (!sound) return;
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); const o = audio.createOscillator(), g = audio.createGain(); o.connect(g); g.connect(audio.destination); o.frequency.value = freq; g.gain.setValueAtTime(.055, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration); o.start(); o.stop(audio.currentTime + duration); } catch {}
}
function place(element, progress, offset = 0) { const p = route.getPointAtLength(Math.min(length, Math.max(0, progress))); element.style.left = `${p.x / 752 * 100}%`; element.style.top = `${(p.y + offset) / 424 * 100}%`; }
function setHeld(value) { held = value; $('accelerate').classList.toggle('active', value); }
function start(name) {
  if (!questions.length) { $('importStatus').textContent = 'Please load the Blooket questions before choosing a ride.'; $('questionFile').focus(); return; }
  checkpointIndex = 0; $('questionDialog').close();
  ride = name; mode = 'countdown'; distance = cpuDistance = speed = elapsed = countdownClock = boostUntil = 0; boosts = countdown = 3;
  setHeld(false); $('selection').hidden = true; $('race').hidden = false; $('result').close(); $('countdown').hidden = false; $('countdown').textContent = '3';
  $('player').textContent = ride === 'car' ? '🚗' : '🐎'; $('rival').textContent = ride === 'car' ? '🐎' : '🚗'; $('rideName').textContent = ride === 'car' ? '🚗 Car' : '🐎 Horse';
  $('best').textContent = readBest() ? time(readBest()) : '—'; $('raceTitle').textContent = 'Ready, set, adventure!'; $('pause').textContent = 'Ⅱ Pause'; $('status').textContent = 'Get ready…'; render(); tone(440);
}
function render() {
  place($('player'), distance, -3); place($('rival'), cpuDistance, 5);
  $('timer').textContent = time(elapsed); $('position').textContent = distance >= cpuDistance ? '1st / 2' : '2nd / 2';
  $('progressFill').style.width = `${Math.min(100, distance / length * 100)}%`;
  $('boostCount').textContent = boosts; $('boost').disabled = boosts === 0 || mode !== 'racing';
  $('player').classList.toggle('boosting', elapsed < boostUntil && mode === 'racing');
}
function boost() { if (mode !== 'racing' || !boosts || elapsed < boostUntil) return; boosts--; boostUntil = elapsed + 2; tone(780, .25); }
function pause() {
  if (mode === 'racing') { mode = 'paused'; setHeld(false); $('pause').textContent = '▶ Resume'; $('countdown').hidden = false; $('countdown').textContent = 'Paused'; $('status').textContent = 'Take a breather. Resume when ready.'; }
  else if (mode === 'paused') { mode = 'racing'; $('pause').textContent = 'Ⅱ Pause'; $('countdown').hidden = true; }
  render();
}
function finish(won) {
  mode = 'finished'; setHeld(false); render(); $('raceTitle').textContent = won ? 'What a finish!' : 'A race to remember';
  const previous = readBest(); const record = won && (!previous || elapsed < previous);
  if (record) { try { localStorage.setItem(bestKey(ride), String(elapsed)); } catch {} $('best').textContent = time(elapsed); }
  $('resultTitle').textContent = won ? 'You won!' : 'So close!'; $('resultText').textContent = `${won ? 'You crossed the finish line' : 'Your opponent crossed first'} in ${time(elapsed)}.${record ? ' New personal best!' : ' Try another ride or race again.'}`;
  $('result').showModal(); tone(won ? 880 : 220, .5);
}
function frame(now) {
  const dt = Math.min((now - (last || now)) / 1000, .05); last = now;
  if (mode === 'countdown') { countdownClock += dt; if (countdownClock >= 1) { countdownClock -= 1; countdown--; if (countdown > 0) { $('countdown').textContent = countdown; tone(440); } else { mode = 'racing'; $('countdown').hidden = true; $('raceTitle').textContent = 'The race is on!'; tone(880, .25); } } }
  if (mode === 'racing') {
    elapsed += dt; const boosting = elapsed < boostUntil;
    const target = (held ? (ride === 'car' ? 92 : 87) : 0) + (boosting ? 70 : 0);
    speed += (target - speed) * Math.min(1, dt * (ride === 'horse' ? 5 : 3));
    distance += speed * dt; cpuDistance += (52 + Math.sin(elapsed * .7) * 5) * dt;
    $('status').textContent = boosting ? '⚡ Full speed ahead!' : held ? 'Keep going! The finish is waiting.' : 'Hold Space or the green button to race!';
    if (checkpointIndex < checkpoints.length && distance >= checkpoints[checkpointIndex]) { distance = checkpoints[checkpointIndex]; openQuestion(); }
    render(); if (mode === 'racing' && (distance >= length || cpuDistance >= length)) finish(distance >= cpuDistance);
  }
  requestAnimationFrame(frame);
}
document.querySelectorAll('[data-ride]').forEach(button => button.addEventListener('click', () => start(button.dataset.ride)));
$('accelerate').addEventListener('pointerdown', event => { event.preventDefault(); if (mode === 'racing' || mode === 'countdown') { setHeld(true); $('accelerate').setPointerCapture(event.pointerId); } });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => $('accelerate').addEventListener(type, () => setHeld(false)));
window.addEventListener('keydown', event => { if (mode === 'selection' || mode === 'finished' || mode === 'question') return; if (['Space','KeyB','KeyP'].includes(event.code)) event.preventDefault(); if (event.code === 'Space' && (mode === 'racing' || mode === 'countdown')) setHeld(true); if (!event.repeat && event.code === 'KeyB') boost(); if (!event.repeat && event.code === 'KeyP') pause(); });
window.addEventListener('keyup', event => { if (event.code === 'Space') setHeld(false); });
window.addEventListener('blur', () => { setHeld(false); if (mode === 'racing') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'racing') pause(); });
$('boost').onclick = boost; $('pause').onclick = pause; $('again').onclick = () => start(ride);
function choose() { mode = 'selection'; $('questionDialog').close(); setHeld(false); $('result').close(); $('race').hidden = true; $('selection').hidden = false; }
$('change').onclick = choose; $('pick').onclick = choose;
$('result').addEventListener('cancel', event => { event.preventDefault(); choose(); });
$('sound').onclick = () => { sound = !sound; $('sound').textContent = 'Sound: ' + (sound ? 'on' : 'off'); $('sound').setAttribute('aria-pressed', String(sound)); tone(); };
requestAnimationFrame(frame);

function openQuestion() {
  mode = 'question'; speed = 0; setHeld(false);
  const question = questions[checkpointIndex % questions.length];
  $('checkpointLabel').textContent = `ROCK ${checkpointIndex + 1} OF ${checkpoints.length}`;
  $('questionTitle').textContent = question.question;
  $('answerFeedback').textContent = 'Answer correctly to continue. The race clock and opponent are paused.';
  $('continueRace').hidden = true; $('answerOptions').replaceChildren();
  const answers = question.answers.map((text,index)=>({text,correct:question.correct.includes(index)}));
  for(let i=answers.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[answers[i],answers[j]]=[answers[j],answers[i]];}
  for(const answer of answers){const button=document.createElement('button');button.textContent=answer.text;button.onclick=()=>{
    if(answer.correct){$('answerFeedback').textContent='Correct! Ready for the next rock?'; for(const option of $('answerOptions').children) option.disabled=true;button.classList.add('correct');$('continueRace').hidden=false;tone(880);$('continueRace').focus();}
    else{button.disabled=true;button.classList.add('incorrect');$('answerFeedback').textContent='Not quite. Try another answer.';tone(220);}
  };$('answerOptions').append(button);}
  $('status').textContent = 'Stopped at a rock — answer the question!'; $('questionDialog').showModal();
}
$('continueRace').onclick=()=>{checkpointIndex++;$('questionDialog').close();mode='racing';setHeld(false);render();$('accelerate').focus();};
$('questionDialog').addEventListener('cancel',event=>event.preventDefault());
function csvRows(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(field);if(row.some(v=>v.trim()))rows.push(row);row=[];field='';}else field+=c;}row.push(field);if(row.some(v=>v.trim()))rows.push(row);return rows;}
function loadQuestions(items){
 const valid=items.map(q=>({question:String(q.question||'').trim(),answers:(q.answers||[]).map(String),correct:Array.isArray(q.correct)?q.correct:[q.correct??0]}));
 if(!valid.length||valid.some(q=>!q.question||q.answers.length<2||q.answers.some(a=>!a.trim())||!q.correct.length||q.correct.some(i=>!Number.isInteger(i)||i<0||i>=q.answers.length)))throw Error('Each question needs text, at least two answers, and a valid correct answer.');
 questions=valid;$('importStatus').textContent=`${questions.length} questions loaded! Choose your ride. Each rock has a question; questions repeat if needed.`;
}
$('loadPaste').onclick=()=>{try{loadQuestions($('questionPaste').value.split(/\r?\n/).filter(l=>l.trim()).map(line=>{const [question,...answers]=line.split('|').map(s=>s.trim());return {question,answers,correct:[0]};}));}catch(error){$('importStatus').textContent=error.message;}};
$('questionFile').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;const text=await file.text();if(file.name.toLowerCase().endsWith('.json')){const data=JSON.parse(text);loadQuestions(Array.isArray(data)?data:data.questions);}else{
 const rows=csvRows(text.replace(/^\uFEFF/,''));const headerIndex=rows.findIndex(row=>row.some(v=>/^question(?: text)?$/i.test(v.trim())));if(headerIndex<0)throw Error('CSV must have Question Text, Answer 1–4, and Correct Answer(s) columns.');const headers=rows[headerIndex].map(v=>v.trim());const qi=headers.findIndex(h=>/^question(?: text)?$/i.test(h));const ai=headers.map((h,i)=>/^answer\s*\d+$/i.test(h)?i:-1).filter(i=>i>=0);const ci=headers.findIndex(h=>/^correct answer/i.test(h));if(ai.length<2||ci<0)throw Error('Answer columns or Correct Answer(s) column missing.');
 loadQuestions(rows.slice(headerIndex+1).filter(row=>row[qi]?.trim()).map(row=>{const entries=ai.map((column,index)=>({text:row[column]?.trim(),number:index+1})).filter(a=>a.text);const correct=String(row[ci]||'').split(/[,;\s]+/).map(Number);return {question:row[qi],answers:entries.map(a=>a.text),correct:entries.map((a,i)=>correct.includes(a.number)?i:-1).filter(i=>i>=0)};}));
 }}catch(error){$('importStatus').textContent='Could not load questions: '+error.message;}};

