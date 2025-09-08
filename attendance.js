// attendance.js
(function(){
  window.moduleOpen_attendance = async function(ctx){
    const session = ctx.session;
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('moduleView').classList.remove('hidden');
    document.getElementById('moduleContent').innerHTML = `<h3>Attendance</h3>
      <div id="attControls" class="row" style="margin-top:8px"></div>
      <div style="margin-top:12px"><table id="attTable"><thead><tr><th>Date</th><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody></tbody></table></div>`;
    document.getElementById('moduleBackBtn').onclick = ()=> document.getElementById('dashboard').classList.remove('hidden');

    // controls differ by role
    const ctrl = document.getElementById('attControls');
    ctrl.innerHTML = '';
    const dateInp = document.createElement('input'); dateInp.type='date';
    ctrl.appendChild(dateInp);

    if(session && (session.role==='admin' || session.role==='teacher')){
      // admin/teacher can mark attendance
      const select = document.createElement('select'); select.id='attUserSel';
      ctrl.appendChild(select);
      const statusSel = document.createElement('select'); statusSel.innerHTML = `<option value="present">Present</option><option value="absent">Absent</option><option value="leave">Leave</option>`;
      ctrl.appendChild(statusSel);
      const btn = document.createElement('button'); btn.className='btn primary'; btn.textContent='Mark'; btn.onclick = mark;
      ctrl.appendChild(btn);

      // load users list
      const { data:users } = await supabase.from('users').select('username,name,role').order('username');
      select.innerHTML = users.map(u=>`<option value="${u.username}">${u.name||u.username} — ${u.role}</option>`).join('');
    } else if(session && session.role==='student'){
      const note = document.createElement('div'); note.className='muted'; note.textContent='Students can view only. If absent please inform school.';
      ctrl.appendChild(note);
    } else {
      ctrl.appendChild(Object.assign(document.createElement('div'),{textContent:'Login to manage/view attendance', className:'muted'}));
    }

    async function mark(){
      const who = document.getElementById('attUserSel').value;
      const date = dateInp.value;
      const status = statusSel.value;
      if(!who || !date) return alert('Choose user & date');
      await supabase.from('attendance').insert([{ user_id:who, date, status }]);
      toast('Marked'); load();
    }

    async function load(){
      const { data } = await supabase.from('attendance').select('*').order('date',{ascending:false}).limit(200);
      const rows = (data||[]).map(a=>`<tr>
        <td>${a.date}</td><td>${a.user_id}</td><td>${a.role||'—'}</td><td>${a.status}</td>
        <td>${session && session.role==='admin' ? `<button class="btn" onclick="deleteAtt('${a.id}')">Delete</button>` : ''}</td>
      </tr>`).join('');
      document.querySelector('#attTable tbody').innerHTML = rows || `<tr><td colspan="5" class="muted">No attendance</td></tr>`;
    }

    window.deleteAtt = async function(id){ if(!confirm('Delete?')) return; await supabase.from('attendance').delete().eq('id', id); toast('Deleted'); load(); };

    await load();
  };
})();