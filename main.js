// main.js
(function(){
  const $ = sel => document.querySelector(sel);
  const show = el => el && el.classList.remove('hidden');
  const hide = el => el && el.classList.add('hidden');

  // Theme
  const themeSelect = $('#themeSelect');
  const savedTheme = localStorage.getItem('lfs_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeSelect.value = savedTheme;
  themeSelect.addEventListener('change', e=> {
    document.documentElement.setAttribute('data-theme', e.target.value);
    localStorage.setItem('lfs_theme', e.target.value);
  });

  // Drawer
  $('#btnMenu').addEventListener('click', ()=> $('#drawer').classList.toggle('hidden'));
  $('#closeDrawer').addEventListener('click', ()=> $('#drawer').classList.add('hidden'));
  document.querySelectorAll('#drawer [data-nav]').forEach(btn=>{
    btn.addEventListener('click', ()=> navigate(btn.dataset.nav));
  });

  // home modules
  const modules = [
    {id:'calendar', label:'School Calendar'},
    {id:'notices', label:'Notification Board'},
    {id:'gallery', label:'Gallery'},
    {id:'timetable', label:'Timetable'},
    {id:'attendance', label:'Attendance'},
    {id:'fees', label:'Fees'},
    {id:'leaves', label:'Leaves'},
    {id:'users', label:'Users (Admin)'}
  ];
  const modulesGrid = $('#homeModules');
  modulesGrid.innerHTML = '';
  modules.forEach(m=>{
    const d = document.createElement('div'); d.className='module';
    d.innerHTML = `<div style="font-size:22px">🔹</div><h4>${m.label}</h4>`;
    d.addEventListener('click', ()=> openModule(m.id));
    modulesGrid.appendChild(d);
  });

  // navigation helpers
  function hideAllScreens(){
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  }
  function navigate(id){
    hideAllScreens();
    show(document.getElementById(id));
    $('#drawer').classList.add('hidden');
  }
  window.navigate = navigate; // expose

  $('#primaryLogin').addEventListener('click', ()=> navigate('login'));
  $('#openCalendar').addEventListener('click', ()=> openModule('calendar'));
  $('#btnBackHome')?.addEventListener('click', ()=> navigate('home'));
  $('#btnBack')?.addEventListener('click', ()=> navigate('home'));
  $('#btnLogout')?.addEventListener('click', logout);

  // SESSION handling
  let SESSION = JSON.parse(localStorage.getItem('lfs_session') || 'null');
  async function logout(){
    SESSION = null; localStorage.removeItem('lfs_session'); toast('Logged out'); navigate('home');
  }

  async function renderAfterLogin(){
    if (!SESSION) return;
    $('#dashTitle').textContent = SESSION.name || SESSION.id;
    $('#dashRole').textContent = (SESSION.role || 'user').toUpperCase();
    // build dash modules according to role
    const container = $('#dashModules');
    container.innerHTML = '';
    const role = SESSION.role;
    const adminModules = ['users','attendance','fees','calendar','notices','gallery','timetable','leaves'];
    const teacherModules = ['attendance','timetable','notices','gallery','leaves'];
    const studentModules = ['attendance','timetable','notices','gallery','leaves','fees'];

    const use = role==='admin' ? adminModules : (role==='teacher' ? teacherModules : studentModules);
    use.forEach(mid=>{
      const b = document.createElement('button'); b.className='btn';
      b.textContent = mid.charAt(0).toUpperCase()+mid.slice(1);
      b.addEventListener('click', ()=> openModule(mid));
      container.appendChild(b);
    });

    navigate('dashboard');
  }

  // toast
  function toast(msg, ms=2200){
    let root = document.getElementById('toastRoot');
    if(!root){ root = document.createElement('div'); root.id='toastRoot'; document.body.appendChild(root); }
    root.innerHTML = `<div class="toast">${msg}</div>`;
    setTimeout(()=> root.innerHTML='', ms);
  }
  window.toast = toast;

  // Login actions
  $('#btnLogin').addEventListener('click', async ()=>{
    const id = $('#loginId').value.trim();
    const pwd = $('#loginPass').value;
    if(!id || !pwd) return toast('Enter ID & password');
    try {
      const { data, error } = await supabase.from('users').select('*').eq('username', id).limit(1);
      if(error) { console.error(error); toast('Login error'); return; }
      if(!data || !data.length){ toast('User not found'); return; }
      const u = data[0];
      if(u.password !== pwd){ toast('Incorrect password'); return; }
      SESSION = { id:u.id||u.username, username:u.username, role:u.role, name:u.name || u.username };
      localStorage.setItem('lfs_session', JSON.stringify(SESSION));
      toast('Welcome '+(u.name||u.username));
      renderAfterLogin();
    } catch(e){ console.error(e); toast('Login failed'); }
  });

  // On load: check existing session
  if(SESSION && SESSION.username){
    // verify user exists
    (async ()=>{
      try {
        const { data } = await supabase.from('users').select('*').eq('username', SESSION.username).limit(1);
        if(data && data.length) { renderAfterLogin(); }
        else { localStorage.removeItem('lfs_session'); SESSION=null; }
      } catch(e){ console.warn(e); }
    })();
  }

  // openModule delegates to module files (they must attach window.openModule)
  window.openModule = async function(moduleId){
    // Get the ID of the current screen before hiding it
    const currentScreenId = document.querySelector('.screen:not(.hidden)').id;

    // Show the module view screen
    hideAllScreens();
    show($('#moduleView'));

    // Set the back button to navigate to the previous screen
    $('#moduleBackBtn').onclick = () => navigate(currentScreenId);

    // If a specific module handler exists, call it.
    if(window['moduleOpen_'+moduleId]) {
      await window['moduleOpen_'+moduleId]({session:SESSION, navigate});
      return;
    }

    // Generic fallback: show moduleView with a simple text
    $('#moduleContent').innerHTML = `<h3>${moduleId}</h3><div class="muted">Module not implemented</div>`;
  };

  // expose logout for other modules
  window.APP = { getSession: ()=> SESSION, setSession: s=> { SESSION=s; localStorage.setItem('lfs_session', JSON.stringify(s)); renderAfterLogin(); } };

  // initial populate home highlights & nextEvent
  (async function loadHome(){
    try {
      const { data:evs } = await supabase.from('calendar_events').select('*').order('date',{ascending:true}).limit(5);
      if(evs && evs.length){
        $('#nextEvent').textContent = evs[0].title + ' • ' + evs[0].date;
        $('#latestNotice').textContent = (await supabase.from('notices').select('*').order('date',{ascending:false}).limit(1)).data?.[0]?.title || '—';
      }
    } catch(e){ console.warn(e); }
  })();

})();

