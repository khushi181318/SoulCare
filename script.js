/* Simple localStorage app logic + UI interactions for SoulCare prototype.
   Works in all pages when loaded. */

const LS_MOODS = "soulcare_moods_v1";
const LS_JOURNAL = "soulcare_journal_v1";

/* Save mood */
function saveMood(label, emoji){
  const now = new Date();
  const entry = { id: now.getTime(), date: now.toLocaleString(), label, emoji };
  const arr = JSON.parse(localStorage.getItem(LS_MOODS)) || [];
  arr.unshift(entry); // newest first
  localStorage.setItem(LS_MOODS, JSON.stringify(arr));
  showToast('moodSaved','Saved ✓');
  refreshLists();
}

/* Save journal */
function saveJournal(){
  const textEl = document.getElementById("journalText");
  if(!textEl) return;
  const text = textEl.value.trim();
  if(!text){ showToast('journalSaved','Write something first'); return; }
  const now = new Date();
  const entry = { id: now.getTime(), date: now.toLocaleString(), text };
  const arr = JSON.parse(localStorage.getItem(LS_JOURNAL)) || [];
  arr.unshift(entry);
  localStorage.setItem(LS_JOURNAL, JSON.stringify(arr));
  textEl.value = "";
  showToast('journalSaved','Saved ✓');
  refreshLists();
}

/* Clear journal field */
function clearJournalField(){ const el = document.getElementById('journalText'); if(el) el.value = ''; }

/* Refresh UI lists (mood & journal) */
function refreshLists(){
  // moods
  const moodListEl = document.getElementById("moodList");
  const moods = JSON.parse(localStorage.getItem(LS_MOODS)) || [];
  if(moodListEl){
    moodListEl.innerHTML = "";
    moods.slice(0,12).forEach(m=>{
      const li = document.createElement("li");
      li.innerHTML = `<div><strong>${m.emoji} ${m.label}</strong><div class="muted small">${m.date}</div></div>
                      <button class="icon-btn" style="background:none;border:none;color:var(--muted)" onclick="deleteMood(${m.id})"><i class="fa-solid fa-trash"></i></button>`;
      moodListEl.appendChild(li);
    });
  }

  // journal
  const journalListEl = document.getElementById("journalList");
  const entries = JSON.parse(localStorage.getItem(LS_JOURNAL)) || [];
  if(journalListEl){
    journalListEl.innerHTML = "";
    entries.slice(0,12).forEach(j=>{
      const li = document.createElement("li");
      li.innerHTML = `<div><strong class="muted small">${j.date}</strong><div>${escapeHtml(j.text)}</div></div>
                      <button class="icon-btn" style="background:none;border:none;color:var(--muted)" onclick="deleteJournal(${j.id})"><i class="fa-solid fa-trash"></i></button>`;
      journalListEl.appendChild(li);
    });
  }

  // update profile counts
  const totalMoods = document.getElementById("totalMoods");
  const totalJournal = document.getElementById("totalJournal");
  if(totalMoods) totalMoods.textContent = moods.length;
  if(totalJournal) totalJournal.textContent = entries.length;
}

/* Delete functions */
function deleteMood(id){
  let arr = JSON.parse(localStorage.getItem(LS_MOODS)) || [];
  arr = arr.filter(x => x.id !== id);
  localStorage.setItem(LS_MOODS, JSON.stringify(arr));
  refreshLists();
}
function deleteJournal(id){
  let arr = JSON.parse(localStorage.getItem(LS_JOURNAL)) || [];
  arr = arr.filter(x => x.id !== id);
  localStorage.setItem(LS_JOURNAL, JSON.stringify(arr));
  refreshLists();
}

/* Export data as JSON file */
function exportData(){
  const data = {
    moods: JSON.parse(localStorage.getItem(LS_MOODS)) || [],
    journal: JSON.parse(localStorage.getItem(LS_JOURNAL)) || []
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'soulcare-data.json';
  a.click();
  URL.revokeObjectURL(url);
}

/* Clear all app data */
function clearAllData(){
  if(!confirm("Clear all saved moods & journals? This cannot be undone.")) return;
  localStorage.removeItem(LS_MOODS);
  localStorage.removeItem(LS_JOURNAL);
  refreshLists();
  alert("Data cleared");
}

/* Toast helper */
function showToast(id, text){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = text;
  el.classList.add('show');
  setTimeout(()=> el.classList.remove('show'), 1600);
}

/* small helper to escape html */
function escapeHtml(unsafe){
  return unsafe.replace(/[&<"'>]/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]; });
}

/* Meditation breathe animation */
let breathInterval = null;
function startBreathing(){
  const circle = document.getElementById('breathCircle');
  if(!circle) return;
  circle.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.28)' },
    { transform: 'scale(1)' }
  ], { duration: 4000, iterations: Infinity, easing:'ease-in-out' });
}
function stopBreathing(){
  // remove animations by replacing element
  const circle = document.getElementById('breathCircle');
  if(!circle) return;
  const clone = circle.cloneNode(true);
  circle.parentNode.replaceChild(clone, circle);
}

/* Hook up meditation controls */
document.addEventListener('click', function(e){
  if(e.target && e.target.id === 'startMedit'){
    const audio = document.getElementById('medAudio');
    if(audio) audio.play().catch(()=>{}); // may be blocked until user gesture
    startBreathing();
  }
  if(e.target && e.target.id === 'stopMedit'){
    const audio = document.getElementById('medAudio');
    if(audio) audio.pause();
    stopBreathing();
  }
});

/* init on load */
window.addEventListener('DOMContentLoaded', ()=> {
  refreshLists();
  // small progressive enhancement: start muted audio only after user gesture
});




