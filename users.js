// users.js
(function(){
  const $ = s => document.querySelector(s);
  // attach module handler
  window.moduleOpen_users = async function(ctx){
    const { session } = ctx;
    if(!session || session.role!=='admin'){ alert('Admin only'); return; }
    // render UI
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('moduleView').classList.remove('hidden');
    document.getElementById('moduleContent').innerHTML = `
      <h3>Users — Admin</h3>
      <div style="margin-top:8px"><button id="addUserBtn" class="btn primary">Add User</button></div>
      <div style="margin-top:12px"><table id="usersTable"><thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead><tbody></tbody></table></div>
    `;
    document.getElementById('moduleBackBtn').onclick = ()=> document.getElementById('dashboard').classList.remove('hidden');
    // load users
    async function load(){
      const res = await supabase.from('users').select('*').order('created_at',{ascending:false});
      const rows = (res.data||[]).map(u=>`<tr>
        <td>${escape(u.username)}</td><td>${escape(u.name||'—')}</td><td>${escape(u.role)}</td>
        <td>
          <button class="btn" onclick="editUser('${u.username}')">Edit</button>
          ${u.username==='admin'?'':`<button class="btn" onclick="deleteUser('${u.username}')">Delete</button>`}
        </td></tr>`).join('');
      document.querySelector('#usersTable tbody').innerHTML = rows || `<tr><td colspan="4" class="muted">No users</td></tr>`;
    }
    document.getElementById('addUserBtn').onclick = async ()=>{
      const username = prompt('Username (id):'); if(!username) return;
      const password = prompt('Password:','123456'); if(!password) return;
      const role = prompt('Role (admin/teacher/student):','student'); if(!role) return;
      const name = prompt('Full name:','');
      await supabase.from('users').insert([{ username, password, role, name }]);
      toast('User added'); load();
    };
    // expose edit/delete to global for buttons
    window.editUser = async function(username){
      const { data } = await supabase.from('users').select('*').eq('username', username).limit(1);
      if(!data || !data.length) return alert('Not found');
      const u = data[0];
      const name = prompt('Name:', u.name||''); if(name===null) return;
      const role = prompt('Role:', u.role||'student'); if(role===null) return;
      await supabase.from('users').update({ name, role }).eq('username', username);
      toast('Updated'); load();
    };
    window.deleteUser = async function(username){
      if(!confirm('Delete user '+username+'?')) return;
      await supabase.from('users').delete().eq('username', username);
      toast('Deleted'); load();
    };
    function escape(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
    await load();
  };
})();