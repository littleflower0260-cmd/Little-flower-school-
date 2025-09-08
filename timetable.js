// timetable.js
(function(){
  window.moduleOpen_timetable = async function(ctx){
    const session = ctx.session;
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('moduleView').classList.remove('hidden');
    document.getElementById('moduleContent').innerHTML = `<h3>Timetable</h3>
      <div id="ttControls" style="margin-top:8px"></div>
      <div id="ttList" style="margin-top:12px"></div>`;
    document.getElementById('moduleBackBtn').onclick = ()=> document.getElementById('dashboard').classList.remove('hidden');

    const ctrl = document.getElementById('ttControls');
    ctrl.innerHTML = '';
    if(session && session.role==='admin'){
      const addBtn = document.createElement('button'); addBtn.className='btn primary'; addBtn.textContent='Add Entry'; addBtn.onclick = add; ctrl.appendChild(addBtn);
    } else {
      ctrl.appendChild(Object.assign(document.createElement('div'),{className:'muted',textContent:'View only for non-admins.'}));
    }

    async function add(){
      const className = prompt('Class (e.g. 5th):'); if(!className) return;
      const period = prompt('Period number (1-6):'); if(!period) return;
      const subject = prompt('Subject:'); if(!subject) return;
      const teacher = prompt('Teacher name:'); if(!teacher) return;
      await supabase.from('timetable').insert([{ class:className, period, subject, teacher }]);
      toast('Saved'); load();
    }

    async function load(){
      const { data } = await supabase.from('timetable').select('*').order('class',{ascending:true});
      if(!data || !data.length){ document.getElementById('ttList').innerHTML = '<div class="muted">No timetable entries</div>'; return; }
      const html = data.map(r=>`<div class="card"><strong>${r.class} — Period ${r.period}</strong><div>${r.subject} • ${r.teacher}</div>
        ${session && session.role==='admin'?`<div style="margin-top:6px"><button class="btn" onclick="deleteTT('${r.id}')">Delete</button></div>`:''}
      </div>`).join('');
      document.getElementById('ttList').innerHTML = html;
    }

    window.deleteTT = async function(id){ if(!confirm('Delete?')) return; await supabase.from('timetable').delete().eq('id', id); toast('Deleted'); load(); };
    await load();
  };
})();