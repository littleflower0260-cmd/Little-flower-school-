// gallery.js
(function(){
  window.moduleOpen_gallery = async function(ctx){
    const session = ctx.session;
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('moduleView').classList.remove('hidden');
    document.getElementById('moduleContent').innerHTML = `<h3>Gallery</h3>
      <div id="galleryControls" style="margin-top:8px"></div>
      <div id="galleryList" style="margin-top:12px" class="row"></div>`;
    document.getElementById('moduleBackBtn').onclick = ()=> document.getElementById('dashboard').classList.remove('hidden');

    const ctrl = document.getElementById('galleryControls');
    ctrl.innerHTML = '';
    if(session && session.role==='admin'){
      const addBtn = document.createElement('button'); addBtn.className='btn primary'; addBtn.textContent='Add Link'; addBtn.onclick = add;
      ctrl.appendChild(addBtn);
    } else {
      ctrl.appendChild(Object.assign(document.createElement('div'),{className:'muted',textContent:'Gallery is read-only for non-admins.'}));
    }

    async function add(){
      const title = prompt('Title:'); if(!title) return;
      const link = prompt('Google Drive / YouTube link:'); if(!link) return;
      const category = prompt('Category:','Event') || 'Event';
      await supabase.from('gallery').insert([{ title, link, category }]);
      toast('Added'); load();
    }
    async function load(){
      const { data } = await supabase.from('gallery').select('*').order('created_at',{ascending:false});
      const html = (data||[]).map(g=>`<div style="width:240px" class="card">
        <div style="font-weight:700">${g.title}</div>
        <div class="muted small">${g.category}</div>
        <div style="margin-top:8px"><a href="${g.link}" target="_blank" class="btn">Open</a> ${session && session.role==='admin' ? `<button class="btn" onclick="deleteGallery('${g.id}')">Delete</button>` : ''}</div>
      </div>`).join('');
      document.getElementById('galleryList').innerHTML = html || `<div class="muted">No items</div>`;
    }
    window.deleteGallery = async function(id){ if(!confirm('Delete?')) return; await supabase.from('gallery').delete().eq('id', id); toast('Deleted'); load(); };
    await load();
  };
})();