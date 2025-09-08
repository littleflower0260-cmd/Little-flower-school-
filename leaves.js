// leaves.js
(function(){
  window.moduleOpen_leaves = async function(ctx){
    const session = ctx.session;
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('moduleView').classList.remove('hidden');
    document.getElementById('moduleContent').innerHTML = `<h3>Leave Applications</h3>
      <div id="leaveControls" style="margin-top:8px"></div>
      <div style="margin-top:12px"><table id="leavesTable"><thead><tr><th>User</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody></tbody></table></div>`;
    document.getElementById('moduleBackBtn').onclick = ()=> document.getElementById('dashboard').classList.remove('hidden');
    const ctrl = document.getElementById('leaveControls');
    ctrl.innerHTML = '';
    if(session){
      const applyBtn = document.createElement('button'); applyBtn.className='btn primary'; applyBtn.textContent='Apply Leave'; applyBtn.onclick = apply;
      ctrl.appendChild(applyBtn);
    } else {
      ctrl.appendChild(Object.assign(document.createElement('div'),{className:'muted',textContent:'Login to apply leave.'}));
    }
    async function apply(){
      const from = prompt('From date (YYYY-MM-DD):'); if(!from) return;
      const to = prompt('To date (YYYY-MM-DD):', from); if(!to) return;
      const reason = prompt('Reason (sick/outof town/family/other):','sick') || 'other';
      await supabase.from('leaves').insert([{ user_id: session.username, from_date: from, to_date: to, reason, status:'pending' }]);
      toast('Applied'); load();
    }
    async function load(){
      const { data } = await supabase.from('leaves').select('*').order('created_at',{ascending:false});
      const rows = (data||[]).map(l=>`<tr>
        <td>${l.user_id}</td><td>${l.from_date}</td><td>${l.to_date}</td><td>${l.reason}</td><td>${l.status}</td>
        <td>${session && session.role==='admin' ? `<button class="btn" onclick="approveLeave('${l.id}')">Approve</button><button class="btn" onclick="rejectLeave('${l.id}')">Reject</button>` : ''}</td>
      </tr>`).join('');
      document.querySelector('#leavesTable tbody').innerHTML = rows || `<tr><td colspan="6" class="muted">No leaves</td></tr>`;
    }
    window.approveLeave = async function(id){ await supabase.from('leaves').update({ status:'approved' }).eq('id', id); toast('Approved'); load(); };
    window.rejectLeave = async function(id){ await supabase.from('leaves').update({ status:'rejected' }).eq('id', id); toast('Rejected'); load(); };
    await load();
  };
})();