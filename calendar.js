// calendar.js
(function(){
  window.moduleOpen_calendar = async function(ctx){
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('moduleView').classList.remove('hidden');
    document.getElementById('moduleContent').innerHTML = `<h3>School Calendar (2025–26)</h3>
      <div id="calControls" style="margin-top:8px"></div>
      <div id="calList" style="margin-top:12px"></div>`;
    document.getElementById('moduleBackBtn').onclick = ()=> document.getElementById('home').classList.remove('hidden');

    const ctrl = document.getElementById('calControls');
    ctrl.innerHTML = '';
    const seedBtn = document.createElement('button'); seedBtn.className='btn outline'; seedBtn.textContent='Seed Year Events (if missing)'; seedBtn.onclick = seedEvents;
    ctrl.appendChild(seedBtn);

    async function load(){
      const { data } = await supabase.from('calendar_events').select('*').order('date',{ascending:true});
      if(!data || !data.length){ document.getElementById('calList').innerHTML = '<div class="muted">No events. Use "Seed Year Events".</div>'; return; }
      const html = data.map(e=>`<div class="card"><strong>${e.date} • ${e.title}</strong><div class="muted">${e.type||''}</div><div style="margin-top:6px">${e.description||''}</div></div>`).join('');
      document.getElementById('calList').innerHTML = html;
    }

    async function seedEvents(){
      // Insert a subset example — you can expand using full SQL seed later
      const events = [
        { date:'2025-06-16', title:'School Start & Admission Period begins', type:'info' },
        { date:'2025-06-21', title:'Yoga Day & PTM', type:'event' },
        { date:'2025-08-15', title:'Independence Day', type:'holiday' },
        { date:'2025-10-16', title:'Diwali Holiday Start', type:'holiday' },
        { date:'2026-01-26', title:'Republic Day', type:'event' }
      ];
      for(const ev of events){ await supabase.from('calendar_events').upsert({ id: (ev.date+'-'+ev.title).slice(0,60), date:ev.date, title:ev.title, type:ev.type, description:ev.description||'' }); }
      toast('Seeded events (small sample). For full year run SQL seed script.'); await load();
    }

    await load();
  };
})();