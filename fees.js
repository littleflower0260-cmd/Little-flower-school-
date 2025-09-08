// fees.js
(function(){
  window.moduleOpen_fees = async function(ctx){
    const session = ctx.session;
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('moduleView').classList.remove('hidden');
    document.getElementById('moduleContent').innerHTML = `<h3>Fees</h3>
      <div id="feesControls" class="row" style="margin-top:8px"></div>
      <div style="margin-top:12px"><table id="feesTable"><thead><tr><th>Student</th><th>Year</th><th>Total</th><th>Paid</th><th>Due</th><th>Actions</th></tr></thead><tbody></tbody></table></div>`;
    document.getElementById('moduleBackBtn').onclick = ()=> document.getElementById('dashboard').classList.remove('hidden');

    const ctrl = document.getElementById('feesControls');
    ctrl.innerHTML = '';
    if(session && session.role==='admin'){
      const addBtn = document.createElement('button'); addBtn.className='btn primary'; addBtn.textContent='Add/Update Fees'; addBtn.onclick = addFees;
      ctrl.appendChild(addBtn);
    } else {
      ctrl.appendChild(Object.assign(document.createElement('div'),{className:'muted',textContent:'Students: view only. Teachers: view only.'}));
    }

    async function addFees(){
      const student = prompt('Student username/id:'); if(!student) return;
      const year = prompt('Year (e.g. 2025):','2025'); if(!year) return;
      const total = parseFloat(prompt('Total amount:','0'))||0;
      const paid = parseFloat(prompt('Paid amount:','0'))||0;
      const due = total - paid;
      await supabase.from('fees').insert([{ student_id:student, year, total, paid, remaining:due }]);
      toast('Saved'); load();
    }

    async function load(){
      const { data } = await supabase.from('fees').select('*').order('year',{ascending:false});
      const rows = (data||[]).map(f=>`<tr><td>${f.student_id}</td><td>${f.year}</td><td>${f.total}</td><td>${f.paid}</td><td>${f.remaining}</td>
        <td>${session && session.role==='admin'?`<button class="btn" onclick="deleteFee('${f.id}')">Delete</button>`:''}</td></tr>`).join('');
      document.querySelector('#feesTable tbody').innerHTML = rows || `<tr><td colspan="6" class="muted">No fees</td></tr>`;
    }
    window.deleteFee = async function(id){ if(!confirm('Delete?')) return; await supabase.from('fees').delete().eq('id', id); toast('Deleted'); load(); };
    await load();
  };
})();