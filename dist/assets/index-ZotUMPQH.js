(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const p of o.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&a(p)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();const V={};function q(e,t){V[e]=t}function at(e){window.location.hash=e}function nt(e){if(V[e])return{handler:V[e],params:{}};for(const t in V){const s=t.split("/").filter(Boolean),a=e.split("/").filter(Boolean);if(s.length!==a.length)continue;const n={};let o=!0;for(let p=0;p<s.length;p++)if(s[p].startsWith(":"))n[s[p].slice(1)]=a[p];else if(s[p]!==a[p]){o=!1;break}if(o)return{handler:V[t],params:n}}return null}function $e(){const e=window.location.hash.slice(1)||"/",t=nt(e);if(t){const s=document.getElementById("page-content");s&&(s.innerHTML="",t.handler(s,t.params)),document.querySelectorAll(".sidebar-link").forEach(a=>{const n=a.getAttribute("data-route");n===e||e.startsWith(n)&&n!=="/"?a.classList.add("active"):a.classList.remove("active")})}else{const s=document.getElementById("page-content");s&&(s.innerHTML=`
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>الصفحة غير موجودة</h3>
          <p>الصفحة المطلوبة غير متوفرة</p>
          <button class="btn btn-primary" onclick="window.location.hash='/'">العودة للرئيسية</button>
        </div>
      `)}}function it(){window.addEventListener("hashchange",$e),$e()}const W="slf_",ue="/api";function Y(e){return W+e}function ot(){return Date.now().toString(36)+Math.random().toString(36).substr(2,9)}async function ce(e,t,s=null,a=null){try{let n=`${ue}/${t}`;a&&e!=="POST"&&(n+=`/${a}`);const o=localStorage.getItem("slf_jwt")||"",p={method:e,headers:{"Content-Type":"application/json",...o?{Authorization:`Bearer ${o}`}:{}}};s&&(p.body=JSON.stringify(s));const d=await fetch(n,p);d.ok||console.error(`Backend sync failed for ${t} ${e}`,await d.text())}catch(n){console.error(`Backend sync network error for ${t} ${e}:`,n)}}const c={getAll(e){const t=localStorage.getItem(Y(e));return(t?JSON.parse(t):[]).filter(a=>!a._deleted)},getAllIncludingDeleted(e){const t=localStorage.getItem(Y(e));return t?JSON.parse(t):[]},getById(e,t){return this.getAll(e).find(a=>a.id===t)||null},query(e,t){return this.getAll(e).filter(t)},count(e,t){return t?this.query(e,t).length:this.getAll(e).length},create(e,t){const s=this.getAllIncludingDeleted(e),a={...t,id:ot(),_createdAt:new Date().toISOString(),_updatedAt:new Date().toISOString(),_deleted:!1};return s.push(a),localStorage.setItem(Y(e),JSON.stringify(s)),ce("POST",e,a),a},update(e,t,s){const a=this.getAllIncludingDeleted(e),n=a.findIndex(p=>p.id===t);if(n===-1)return null;const o={...a[n]};return a[n]={...a[n],...s,id:a[n].id,_createdAt:a[n]._createdAt,_updatedAt:new Date().toISOString(),_deleted:a[n]._deleted},localStorage.setItem(Y(e),JSON.stringify(a)),ce("PUT",e,a[n],t),{oldItem:o,newItem:a[n]}},softDelete(e,t){const s=this.getAllIncludingDeleted(e),a=s.findIndex(n=>n.id===t);return a===-1?!1:(s[a]._deleted=!0,s[a]._deletedAt=new Date().toISOString(),localStorage.setItem(Y(e),JSON.stringify(s)),ce("DELETE",e,null,t),!0)},clear(e){localStorage.removeItem(Y(e))},clearAll(){Object.keys(localStorage).forEach(e=>{e.startsWith(W)&&localStorage.removeItem(e)})},getSetting(e){const t=localStorage.getItem(W+"settings"),s=t?JSON.parse(t):{};return s[e]!==void 0?s[e]:null},setSetting(e,t){const s=localStorage.getItem(W+"settings"),a=s?JSON.parse(s):{};a[e]=t,localStorage.setItem(W+"settings",JSON.stringify(a)),fetch(`${ue}/settings`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:e,value:t})}).catch(n=>console.error("Setting sync error",n))},async syncFromServer(e){try{console.log("Syncing from server...");const t=localStorage.getItem("slf_jwt")||"",s=t?{Authorization:`Bearer ${t}`}:{};for(let a of e){const n=await fetch(`${ue}/${a}`,{headers:s});if(n.ok){const o=await n.json();Array.isArray(o)?localStorage.setItem(Y(a),JSON.stringify(o)):console.warn(`sync: skipping '${a}' – server returned non-array response`)}}return console.log("Sync complete!"),!0}catch(t){return console.error("Critical error syncing from backend:",t),!1}}},_e=["مدني","جنائي","إداري","أسرة","عمالي","تجاري"],me={مدني:"civil",جنائي:"criminal",إداري:"admin",أسرة:"family",عمالي:"labor",تجاري:"commercial"},lt=["أول درجة","استئناف","نقض"],ct=["تحقيقات نيابة","جنحة","جناية","استئناف","نقض"],Ee=["مدعي","مدعى عليه","مستأنف","مستأنف ضده","متهم","مجني عليه","طاعن","مطعون ضده"],Me=["نشطة","حكم","مغلقة"],Ue={نشطة:"active",حكم:"judgment",مغلقة:"closed"},Re={مفتوح:"open","قيد التنفيذ":"progress",مكتمل:"completed",معلق:"blocked"},He={مفتوح:"open",مكتمل:"completed",منتهي:"expired"},dt=["جلسة استماع","حكم","خبير","تحقيق","تجديد","نطق بالحكم","مرافعة","تأجيل"],rt=["حجز للحكم","صدور حكم نهائي","شطب نهائي","حفظ","أخرى"],Fe=["إعلان/خدمة","تصريح محكمة","حزمة تحضير","متابعة خبير","تجديد من الشطب","مراجعة حكم","حضور تجديد حبس","متابعة تحقيق","استئناف","طعن","معارضة","أخرى"],be=["عالية","متوسطة","منخفضة"],ve=["شريك","محامي مسؤول","محامي","متدرب"],ze=["استئناف","نقض","معارضة","استئناف حبس","تجديد بعد الشطب","أخرى"],Ye=["تأجيل لإعادة الإعلان","تأجيل لتصريح","تأجيل لمذكرة ومستندات","إحالة لخبير","شطب","صدور حكم","حبس احتياطي","إخلاء سبيل","طلب تحقيقات","إحالة للمحكمة","حفظ","تأجيل للمرافعة","تأجيل للاطلاع","تأجيل عام","نطق بالحكم"],ut=["شريك","محامي مسؤول","محامي","متدرب"],pt={شريك:"partner","محامي مسؤول":"caseOwner",محامي:"lawyer",متدرب:"trainee"},l={CLIENTS:"clients",CASES:"cases",SESSIONS:"sessions",ACTIONS:"actions",DEADLINES:"deadlines",USERS:"users",AUDIT:"audit",DECISION_MAP:"decision_map",SETTINGS:"settings",LOOKUP_ACTION_TYPES:"lookup_action_types",LOOKUP_DECISION_TYPES:"lookup_decision_types"};function Je(e){return{name:e.name||"",nationalId:e.nationalId||"",phone:e.phone||"",address:e.address||"",poaNumber:e.poaNumber||"",notaryOffice:e.notaryOffice||"",poaDate:e.poaDate||"",attachments:e.attachments||[],notes:e.notes||"",driveFolderUrl:e.driveFolderUrl||"",driveFolderId:e.driveFolderId||""}}function mt(e){return{caseNo:e.caseNo||"",year:e.year||new Date().getFullYear().toString(),stageType:e.stageType||"",clientId:e.clientId||"",clientIds:e.clientIds||(e.clientId?[e.clientId]:[]),primaryClientId:e.primaryClientId||e.clientId||"",clientRole:e.clientRole||"",opponentName:e.opponentName||"",opponentRole:e.opponentRole||"",court:e.court||"",circuit:e.circuit||"",caseType:e.caseType||"",subject:e.subject||"",firstSessionDate:e.firstSessionDate||"",ownerId:e.ownerId||"",status:e.status||"نشطة",criminalStageType:e.criminalStageType||"",linkedProsecutionId:e.linkedProsecutionId||"",notes:e.notes||""}}function xe(e){return{caseId:e.caseId||"",date:e.date||"",sessionType:e.sessionType||"",decisionResult:e.decisionResult||"",nextSessionDate:e.nextSessionDate||"",status:e.status||"مفتوح",closureReason:e.closureReason||"",notes:e.notes||"",attachments:e.attachments||[]}}function ye(e){return{clientId:e.clientId||"",caseId:e.caseId||"",sessionId:e.sessionId||"",actionType:e.actionType||"",title:e.title||"",priority:e.priority||"",responsibleUserId:e.responsibleUserId||"",status:e.status||"مفتوح",executionDate:e.executionDate||"",executionDetails:e.executionDetails||"",subTasks:e.subTasks||[],dueDate:e.dueDate||"",notes:e.notes||"",attachments:e.attachments||[]}}function bt(e){return{caseId:e.caseId||"",deadlineType:e.deadlineType||"",startDate:e.startDate||"",endDate:e.endDate||"",responsibleUserId:e.responsibleUserId||"",status:e.status||"مفتوح",completionNote:e.completionNote||""}}function Se(e){return{name:e.name||"",role:e.role||"محامي",email:e.email||"",phone:e.phone||"",active:e.active!==void 0?e.active:!0}}function ie(){return localStorage.getItem("slf_jwt")||null}function vt(){localStorage.removeItem("slf_jwt")}function yt(){const e=ie();if(!e)return!1;try{return JSON.parse(atob(e.split(".")[1])).exp*1e3>Date.now()}catch{return!1}}function ft(){vt(),localStorage.removeItem("slf_current_user"),window.location.href=window.location.pathname+window.location.search}let te=null;function Ge(e){te=e,localStorage.setItem("slf_current_user",JSON.stringify(e))}function U(){if(!te){const e=localStorage.getItem("slf_current_user");e&&(te=JSON.parse(e))}return te}function Z(e){return e&&pt[e.role]||null}const gt={partner:{createCase:!0,editCase:"all",createSession:!0,editSession:"all",completeAction:!0,createDeadline:!0,closeCase:!0,deleteRecords:"soft",adminConfig:!0,viewAll:!0,lockUnlock:!0},caseOwner:{createCase:!0,editCase:"own",createSession:!0,editSession:"own",completeAction:!0,createDeadline:!0,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1},lawyer:{createCase:!1,editCase:"assigned",createSession:"assigned",editSession:"assigned",completeAction:"assigned",createDeadline:!1,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1},trainee:{createCase:!1,editCase:!1,createSession:!1,editSession:!1,completeAction:"addDetails",createDeadline:!1,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1}};function ht(e,t={}){const s=U();if(!s)return!1;const a=Z(s);if(!a)return!1;const n=gt[a];if(!n)return!1;const o=n[e];return o===!0?!0:o===!1||o===void 0?!1:o==="all"?!0:o==="own"?t.ownerId===s.id:o==="assigned"?t.ownerId===s.id||t.responsibleUserId===s.id||t.assignedTo===s.id:o==="addDetails"?t.responsibleUserId===s.id||t.assignedTo===s.id:o==="soft"}function Q(){const e=U();return e?Z(e)==="partner":!1}function ae(){const e=U();return e?Z(e)==="partner":!1}function It(){if(c.getAll(l.USERS).length>0)return;const t=c.create(l.USERS,{name:"أحمد أحمد سريا",role:"شريك",email:"ahmed@serya.law",phone:"01000000001",active:!0});c.create(l.USERS,{name:"فتحي أحمد سريا",role:"شريك",email:"fathy@serya.law",phone:"01000000002",active:!0});const s=c.create(l.USERS,{name:"محمد عبد الرحمن",role:"محامي مسؤول",email:"mohamed@serya.law",phone:"01000000003",active:!0}),a=c.create(l.USERS,{name:"سارة أحمد",role:"محامي",email:"sara@serya.law",phone:"01000000004",active:!0});c.create(l.USERS,{name:"يوسف محمود",role:"متدرب",email:"youssef@serya.law",phone:"01000000005",active:!0}),Ge(t);const n=c.create(l.CLIENTS,{name:"شركة النور للتجارة",nationalId:"12345678901234",phone:"01100000001",address:"القاهرة - المعادي - شارع 9",poaNumber:"POA-2025-001",notaryOffice:"مكتب توثيق المعادي",poaDate:"2025-01-15",notes:"عميل مهم - قضايا تجارية"}),o=c.create(l.CLIENTS,{name:"أحمد محمد إبراهيم",nationalId:"28501012345678",phone:"01200000002",address:"الجيزة - الدقي",poaNumber:"POA-2025-002",notaryOffice:"مكتب توثيق الدقي",poaDate:"2025-02-10",notes:""}),p=c.create(l.CLIENTS,{name:"فاطمة حسن علي",nationalId:"29001234567890",phone:"01500000003",address:"الإسكندرية - سموحة",poaNumber:"POA-2025-003",notaryOffice:"مكتب توثيق سموحة",poaDate:"2025-03-05",notes:"قضية أسرة"}),d=c.create(l.CASES,{caseNo:"1234",year:"2025",stageType:"أول درجة",clientId:n.id,clientIds:[n.id],primaryClientId:n.id,clientRole:"مدعي",opponentName:"شركة الفجر للاستيراد",opponentRole:"مدعى عليه",court:"محكمة القاهرة الاقتصادية",circuit:"الدائرة الثالثة",caseType:"مدني",subject:"مطالبة بمستحقات تجارية",firstSessionDate:"2026-03-01",ownerId:s.id,status:"نشطة"}),g=c.create(l.CASES,{caseNo:"5678",year:"2025",stageType:"أول درجة",clientId:o.id,clientIds:[o.id],primaryClientId:o.id,clientRole:"متهم",opponentName:"النيابة العامة",opponentRole:"سلطة اتهام",court:"نيابة شمال القاهرة",circuit:"",caseType:"جنائي",criminalStageType:"تحقيقات نيابة",subject:"تحقيق جنائي - نصب",firstSessionDate:"2026-02-28",ownerId:t.id,status:"نشطة"}),r=c.create(l.CASES,{caseNo:"9101",year:"2026",stageType:"استئناف",clientId:p.id,clientIds:[p.id,n.id],primaryClientId:p.id,clientRole:"مستأنف",opponentName:"خالد حسن محمود",opponentRole:"مستأنف ضده",court:"محكمة استئناف الإسكندرية",circuit:"الدائرة الأولى أسرة",caseType:"أسرة",subject:"استئناف حكم نفقة",firstSessionDate:"2026-03-05",ownerId:s.id,status:"نشطة"}),m=c.create(l.SESSIONS,{caseId:d.id,date:"2026-03-01",sessionType:"جلسة استماع",decisionResult:"تأجيل لإعادة الإعلان",nextSessionDate:"2026-03-15",notes:"لم يحضر المدعى عليه - تأجيل لإعادة الإعلان"});c.create(l.ACTIONS,{caseId:d.id,sessionId:m.id,actionType:"إعلان/خدمة",responsibleUserId:a.id,status:"مفتوح",dueDate:"2026-03-10",notes:"إعادة إعلان المدعى عليه - شركة الفجر للاستيراد"});const y=c.create(l.SESSIONS,{caseId:g.id,date:"2026-02-28",sessionType:"تحقيق",decisionResult:"حبس احتياطي",nextSessionDate:"2026-03-14",notes:"تم حبس المتهم احتياطياً 15 يوماً"});c.create(l.ACTIONS,{caseId:g.id,sessionId:y.id,actionType:"حضور تجديد حبس",responsibleUserId:t.id,status:"مفتوح",dueDate:"2026-03-13",notes:"حضور جلسة تجديد الحبس الاحتياطي"}),c.create(l.DEADLINES,{caseId:g.id,deadlineType:"استئناف حبس",startDate:"2026-02-28",endDate:"2026-03-07",responsibleUserId:t.id,status:"مفتوح",completionNote:""}),c.create(l.ACTIONS,{caseId:r.id,sessionId:"",actionType:"حزمة تحضير",responsibleUserId:s.id,status:"قيد التنفيذ",dueDate:"2026-03-03",subTasks:[{title:"صياغة المذكرة",completed:!0},{title:"مراجعة المذكرة",completed:!1},{title:"تحضير المستندات",completed:!1},{title:"تقديم الحزمة",completed:!1}],notes:"تحضير مذكرة الاستئناف ومستنداتها"}),c.setSetting("workdayEndTime","17:00"),console.log("✅ Seed data loaded successfully")}function $t(){const e=document.getElementById("sidebar"),t=U(),s=c.count(l.ACTIONS,n=>n.status!=="مكتمل"),a=c.count(l.DEADLINES,n=>n.status==="مفتوح");e.innerHTML=`
    <div class="sidebar-logo flex flex-col items-center gap-1">
      <img src="/logo-transparent.png" alt="Saryia Logo" style="width: 90px; margin-bottom: -6px;" />
      <h2 style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--accent-primary);">مكتب سرية للمحاماه</h2>
      <div class="logo-sub">نظام إدارة القضايا</div>
    </div>
    
    <nav class="sidebar-nav">
      <div class="sidebar-section">
        <div class="sidebar-section-title">الرئيسية</div>
        <button class="sidebar-link active" data-route="/dashboard" onclick="window.location.hash='/dashboard'">
          <span class="icon"><i class='bx bxs-dashboard'></i></span>
          لوحة التحكم
        </button>
      </div>
      
      <div class="sidebar-section">
        <div class="sidebar-section-title">إدارة القضايا</div>
        <button class="sidebar-link" data-route="/clients" onclick="window.location.hash='/clients'">
          <span class="icon"><i class='bx bxs-group'></i></span>
          العملاء
        </button>
        <button class="sidebar-link" data-route="/cases" onclick="window.location.hash='/cases'">
          <span class="icon"><i class='bx bxs-folder-open'></i></span>
          القضايا
        </button>
        <button class="sidebar-link" data-route="/calendar" onclick="window.location.hash='/calendar'">
          <span class="icon"><i class='bx bxs-calendar'></i></span>
          التقويم
        </button>
        <button class="sidebar-link" data-route="/actions" onclick="window.location.hash='/actions'">
          <span class="icon"><i class='bx bxs-zap'></i></span>
          الإجراءات
          ${s>0?`<span class="badge">${s}</span>`:""}
        </button>
        <button class="sidebar-link" data-route="/deadlines" onclick="window.location.hash='/deadlines'">
          <span class="icon"><i class='bx bxs-time'></i></span>
          المواعيد النهائية
          ${a>0?`<span class="badge">${a}</span>`:""}
        </button>
      </div>
      
      ${Q()?`
      <div class="sidebar-section">
        <div class="sidebar-section-title">الإدارة</div>
        <button class="sidebar-link" data-route="/admin/mapping" onclick="window.location.hash='/admin/mapping'">
          <span class="icon"><i class='bx bx-git-git-branch'></i></span>
          ربط القرارات
        </button>
        <button class="sidebar-link" data-route="/admin/users" onclick="window.location.hash='/admin/users'">
          <span class="icon"><i class='bx bxs-user-detail'></i></span>
          المستخدمون
        </button>
        <button class="sidebar-link" data-route="/admin/audit" onclick="window.location.hash='/admin/audit'">
          <span class="icon"><i class='bx bx-list-check'></i></span>
          سجل المراجعة
        </button>
        <button class="sidebar-link" data-route="/admin/settings" onclick="window.location.hash='/admin/settings'">
          <span class="icon"><i class='bx bxs-cog'></i></span>
          إعدادات النظام
        </button>
      </div>
      `:""}
    </nav>
    
    <div class="sidebar-user">
      <div class="sidebar-user-avatar">${t?t.name.charAt(0):"?"}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${t?t.name:"مستخدم"}</div>
        <div class="sidebar-user-role">${t?t.role:""}</div>
      </div>
    </div>
  `,e.querySelectorAll(".sidebar-link").forEach(n=>{n.addEventListener("click",()=>{window.innerWidth<=768&&Ie()})})}function we(e){P("لوحة التحكم");const t=U(),s=t?Z(t):null,a=s==="lawyer"||s==="trainee",n=c.getAll(l.CASES),o=c.getAll(l.SESSIONS);let p=c.getAll(l.ACTIONS);a&&t&&(p=p.filter(u=>u.responsibleUserId===t.id));const d=c.getAll(l.DEADLINES),g=c.getAll(l.CLIENTS),r=n.filter(u=>u.status==="نشطة").length,m=p.filter(u=>u.status!=="مكتمل").length,y=d.filter(u=>u.status==="مفتوح").length,$=new Date;$.setHours(0,0,0,0);const f=new Date($);f.setDate(f.getDate()+7);const h=o.filter(u=>{if(!u.nextSessionDate)return!1;const I=new Date(u.nextSessionDate);return I>=$&&I<=f}).sort((u,I)=>new Date(u.nextSessionDate)-new Date(I.nextSessionDate)),i=n.filter(u=>{if(!u.firstSessionDate)return!1;const I=new Date(u.firstSessionDate);return I>=$&&I<=f}),b={};p.filter(u=>u.status!=="مكتمل").forEach(u=>{b[u.actionType]||(b[u.actionType]=[]),b[u.actionType].push(u)});const E=[];h.forEach(u=>{const I=J(u.nextSessionDate);if(I<=3){const x=p.filter(k=>k.sessionId===u.id&&k.status!=="مكتمل");if(x.length>0){const k=c.getById(l.CASES,u.caseId);E.push({level:"high",icon:"<i class='bx bxs-circle'></i>",text:`جلسة خلال ${I} أيام مع ${x.length} إجراء مفتوح – القضية ${k?k.caseNo:""}/${k?k.year:""}`})}}}),p.filter(u=>u.actionType==="حضور تجديد حبس"&&u.status!=="مكتمل").forEach(u=>{const I=c.getById(l.CASES,u.caseId);E.push({level:"high",icon:"<i class='bx bxs-bell-ring'></i>",text:`إجراء حبس احتياطي مفتوح – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),p.filter(u=>u.status!=="مكتمل"&&u.dueDate&&ne(u.dueDate)).forEach(u=>{const I=c.getById(l.CASES,u.caseId);E.push({level:"medium",icon:"<i class='bx bx-error'></i>",text:`إجراء متأخر: ${u.actionType} – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),d.filter(u=>u.status==="مفتوح"&&u.endDate&&ne(u.endDate)).forEach(u=>{const I=c.getById(l.CASES,u.caseId);E.push({level:"high",icon:"<i class='bx bxs-circle'></i>",text:`موعد نهائي متأخر: ${u.deadlineType} – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),e.innerHTML=`
    <div class="animate-fade-in">
      <!-- Stats Cards -->
      <div class="dashboard-stats">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${r}</div>
              <div class="card-label">قضايا نشطة</div>
            </div>
            <div class="card-icon green"><i class='bx bxs-folder-open'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${m}</div>
              <div class="card-label">إجراءات مفتوحة</div>
            </div>
            <div class="card-icon amber"><i class='bx bxs-zap'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${y}</div>
              <div class="card-label">مواعيد نهائية</div>
            </div>
            <div class="card-icon red"><i class='bx bxs-time'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${g.length}</div>
              <div class="card-label">العملاء</div>
            </div>
            <div class="card-icon blue"><i class='bx bxs-group'></i></div>
          </div>
        </div>
      </div>
      
      <!-- Risk Flags -->
      ${E.length>0?`
        <div class="widget widget-full-width mb-6">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-flag'></i> تنبيهات المخاطر</div>
            <span class="badge badge-blocked">${E.length}</span>
          </div>
          <div class="widget-body">
            <div class="risk-flags-container">
              ${E.map(u=>`
                <div class="risk-flag ${u.level}">
                  <span class="risk-icon">${u.icon}</span>
                  <span>${u.text}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `:""}
      
      <!-- Widgets Grid -->
      <div class="dashboard-widgets">
        <!-- Upcoming Sessions -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-calendar'></i> الجلسات القادمة (7 أيام)</div>
            <span class="badge badge-open">${h.length+i.length}</span>
          </div>
          <div class="widget-body">
            ${h.length+i.length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد جلسات قادمة</p>
              </div>
            `:""}
            ${i.map(u=>{const I=c.getById(l.CLIENTS,u.clientId),x=J(u.firstSessionDate);return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${u.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${u.caseNo}/${u.year}</div>
                    <div class="widget-item-sub">${I?I.name:""} – ${u.subject}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${x<=1?"text-accent":""}">${j(u.firstSessionDate)}</div>
                    <div class="text-xs ${x<=1?"text-accent":"text-secondary"}">${x===0?"اليوم":x===1?"غداً":`خلال ${x} أيام`}</div>
                  </div>
                </div>
              `}).join("")}
            ${h.map(u=>{const I=c.getById(l.CASES,u.caseId),x=J(u.nextSessionDate);return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${u.caseId}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${I?I.caseNo+"/"+I.year:""}</div>
                    <div class="widget-item-sub">${u.decisionResult} → ${u.sessionType}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${x<=1?"text-accent":""}">${j(u.nextSessionDate)}</div>
                    <div class="text-xs ${x<=1?"text-accent":"text-secondary"}">${x===0?"اليوم":x===1?"غداً":`خلال ${x} أيام`}</div>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
        
        <!-- Open Actions by Type -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-zap'></i> الإجراءات المفتوحة</div>
            <span class="badge badge-progress">${m}</span>
          </div>
          <div class="widget-body">
            ${Object.keys(b).length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد إجراءات مفتوحة</p>
              </div>
            `:""}
            ${Object.entries(b).map(([u,I])=>`
              <div class="widget-item">
                <div class="widget-item-info">
                  <div class="widget-item-title">${u}</div>
                  <div class="widget-item-sub">${I.length} إجراء</div>
                </div>
                <span class="badge badge-progress">${I.length}</span>
              </div>
            `).join("")}
          </div>
        </div>
        
        <!-- Open Deadlines -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-time'></i> المواعيد النهائية</div>
            <span class="badge badge-blocked">${y}</span>
          </div>
          <div class="widget-body">
            ${d.filter(u=>u.status==="مفتوح").length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد مواعيد نهائية مفتوحة</p>
              </div>
            `:""}
            ${d.filter(u=>u.status==="مفتوح").sort((u,I)=>new Date(u.endDate)-new Date(I.endDate)).map(u=>{const I=c.getById(l.CASES,u.caseId),x=J(u.endDate),k=x<0?"badge-blocked":x<=3?"badge-progress":"badge-open";return`
                  <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${u.caseId}'">
                    <div class="widget-item-info">
                      <div class="widget-item-title">${u.deadlineType}</div>
                      <div class="widget-item-sub">القضية ${I?I.caseNo+"/"+I.year:""}</div>
                    </div>
                    <div>
                      <div class="widget-item-date">${j(u.endDate)}</div>
                      <span class="badge ${k}">${x<0?"متأخر":x===0?"اليوم":`${x} يوم`}</span>
                    </div>
                  </div>
                `}).join("")}
          </div>
        </div>
        
        <!-- Recent Cases -->
        <div class="widget">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-folder-open'></i> آخر القضايا</div>
            <button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases'">عرض الكل ←</button>
          </div>
          <div class="widget-body">
            ${n.slice(-5).reverse().map(u=>{const I=c.getById(l.CLIENTS,u.clientId),x=me[u.caseType]||"civil";return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${u.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">${u.caseNo}/${u.year} – ${u.subject}</div>
                    <div class="widget-item-sub">${I?I.name:""}</div>
                  </div>
                  <span class="badge badge-${x}">${u.caseType}</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    </div>
  `}function w(e,t="success",s=3e3){const a=document.getElementById("toast-root"),n=document.createElement("div");n.className=`toast toast-${t}`;const o={success:"✓",error:"✕",warning:"⚠",info:"ℹ"};n.innerHTML=`<span>${o[t]||""}</span> ${e}`,a.appendChild(n),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",n.style.transition="all 300ms ease-out",setTimeout(()=>n.remove(),300)},s)}function _(e,t,s={}){const a=document.getElementById("modal-root"),n=s.large?"modal-lg":"",o=document.createElement("div");o.className="modal-overlay",o.id="active-modal",o.innerHTML=`
    <div class="modal ${n}">
      <div class="modal-header">
        <h2 class="modal-title">${e}</h2>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        ${t}
      </div>
      ${s.footer?`<div class="modal-footer">${s.footer}</div>`:""}
    </div>
  `,a.appendChild(o),o.querySelector("#modal-close-btn").addEventListener("click",O),o.addEventListener("click",d=>{d.target===o&&O()});const p=d=>{d.key==="Escape"&&(O(),document.removeEventListener("keydown",p))};return document.addEventListener("keydown",p),o}function O(){const e=document.getElementById("active-modal");e&&(e.style.opacity="0",setTimeout(()=>e.remove(),150))}function Et(e,t,s){const a=`
    <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">${t}</p>
  `,o=_(e,a,{footer:`
    <button class="btn btn-primary" id="confirm-yes">تأكيد</button>
    <button class="btn btn-secondary" id="confirm-no">إلغاء</button>
  `});o.querySelector("#confirm-yes").addEventListener("click",()=>{s(),O()}),o.querySelector("#confirm-no").addEventListener("click",O)}function N(e,t,s,a={}){const n=U(),o={entityType:e,entityId:t,action:s,userId:n?n.id:"system",userName:n?n.name:"النظام",timestamp:new Date().toISOString(),changes:a};return c.create(l.AUDIT,o),o}function xt(e,t,s,a=""){const n=U(),o=new Date().toISOString(),p={actionType:"نوع الإجراء",title:"العنوان / الوصف",dueDate:"تاريخ الاستحقاق",responsibleUserId:"المحامي المسؤول",priority:"الأولوية",notes:"الملاحظات",clientId:"العميل",caseId:"القضية",executionDate:"تاريخ التنفيذ",executionDetails:"تفاصيل التنفيذ / الإثبات",status:"الحالة"},d=["actionType","responsibleUserId","clientId","caseId","executionDate","executionDetails"],g=[];return Object.keys(p).forEach(r=>{const m=String(t[r]||""),y=String(s[r]||"");if(m===y)return;const $=d.includes(r),f={entityType:l.ACTIONS,entityId:e,action:"field_change",userId:n?n.id:"system",userName:n?n.name:"النظام",timestamp:o,changes:{field:r,fieldLabel:p[r]||r,oldValue:m,newValue:y,sensitive:$,editReason:$?a:""}};c.create(l.AUDIT,f),g.push(f)}),g}function St(e){return c.query(l.AUDIT,t=>t.entityId===e).sort((t,s)=>new Date(s.timestamp)-new Date(t.timestamp))}function wt(e=50){return c.getAll(l.AUDIT).sort((t,s)=>new Date(s.timestamp)-new Date(t.timestamp)).slice(0,e)}function Tt(e){return{create:"إنشاء",update:"تعديل",complete:"إكمال",delete:"حذف",status_change:"تغيير حالة",field_change:"تعديل حقل"}[e]||e}function Ke(e){P("العملاء");const t=c.getAll(l.CLIENTS);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-group'></i> العملاء</h1>
          <div class="page-header-sub">${t.length} عميل</div>
        </div>
        <div class="flex gap-2">
            <button class="btn btn-secondary" onclick="window.location.hash='/clients/import'">
                <i class='bx bxl-google-drive'></i> استيراد من درايف
            </button>
            <button class="btn btn-primary" id="add-client-btn">
                <i class='bx bx-plus'></i> إضافة عميل
            </button>
        </div>
      </div>
      
      <div class="filter-bar">
        <div class="search-input">
          <span class="search-icon">🔍</span>
          <input type="text" id="client-search" placeholder="بحث بالاسم أو الرقم القومي أو الهاتف..." />
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الرقم القومي / السجل</th>
              <th>الهاتف</th>
              <th>رقم التوكيل</th>
              <th>مكتب التوثيق</th>
              <th>تاريخ التوكيل</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody id="client-table-body">
            ${Te(t)}
          </tbody>
        </table>
      </div>
    </div>
  `,e.querySelector("#client-search").addEventListener("input",s=>{const a=s.target.value.toLowerCase(),n=t.filter(o=>o.name.toLowerCase().includes(a)||o.nationalId.includes(a)||o.phone.includes(a));document.getElementById("client-table-body").innerHTML=Te(n),ke()}),e.querySelector("#add-client-btn").addEventListener("click",()=>{window.location.hash="/clients/new"}),ke()}function Te(e){return e.length===0?'<tr><td colspan="7"><div class="empty-state"><p>لا يوجد عملاء</p></div></td></tr>':e.map(t=>{const s=t.driveFolderUrl?`<a href="${t.driveFolderUrl}" target="_blank" class="btn btn-ghost btn-sm" title="فتح مجلد درايف"><i class='bx bxl-google-drive text-blue-500'></i></a>`:"";return`
    <tr class="clickable-row" data-id="${t.id}">
      <td><strong>${t.name||"—"}</strong></td>
      <td>${t.nationalId||""}</td>
      <td>${t.phone||""}</td>
      <td>${t.poaNumber||""}</td>
      <td>${t.notaryOffice||""}</td>
      <td>${j(t.poaDate)}</td>
      <td>
        <div class="table-actions">
          ${s}
          <button class="btn btn-ghost btn-sm edit-client" data-id="${t.id}"><i class='bx bx-edit'></i></button>
          <button class="btn btn-ghost btn-sm delete-client" data-id="${t.id}"><i class='bx bx-trash'></i></button>
        </div>
      </td>
    </tr>
  `}).join("")}function ke(){document.querySelectorAll(".edit-client").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation(),window.location.hash=`/clients/${e.dataset.id}/edit`})}),document.querySelectorAll(".delete-client").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation(),Et("حذف العميل","هل أنت متأكد من حذف هذا العميل؟",()=>{c.softDelete(l.CLIENTS,e.dataset.id),N(l.CLIENTS,e.dataset.id,"delete"),w("تم حذف العميل","success"),window.location.hash="/clients",Ke(document.getElementById("page-content"))})})})}function De(e,t={}){const s=t.id&&t.id!=="new",a=s?c.getById(l.CLIENTS,t.id):null;P(s?"تعديل بيانات العميل":"إضافة عميل جديد"),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1>${s?"<i class='bx bx-edit'></i> تعديل بيانات العميل":"<i class='bx bx-plus'></i> إضافة عميل جديد"}</h1>
          <div class="page-header-sub">${s?a?.name||"":"أدخل بيانات العميل الجديد"}</div>
        </div>
        <div class="flex gap-2">
            ${s&&a?.driveFolderUrl?`<a href="${a?.driveFolderUrl}" target="_blank" class="btn btn-secondary" title="فتح مجلد درايف"><i class='bx bxl-google-drive text-blue-500'></i> فتح المجلد</a>`:""}
            ${s&&a?.driveFolderId&&!a?.nationalId?`<button type="button" id="btn-sync-drive" class="btn btn-primary" title="مزامنة للبحث عن الرقم القومي بالصور"><i class='bx bx-refresh'></i> مزامنة درايف</button>`:""}
            <button class="btn btn-secondary" onclick="window.location.hash='/clients'">↩ العودة</button>
        </div>
      </div>
      
      <form id="client-form">
        <div class="card" style="max-width: 800px;">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">اسم العميل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-name" value="${a?.name||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">الرقم القومي / السجل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-national-id" value="${a?.nationalId||""}" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">الهاتف <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-phone" value="${a?.phone||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">العنوان</label>
              <input type="text" class="form-input" id="client-address" value="${a?.address||""}" />
            </div>
          </div>
          
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">رقم التوكيل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-poa" value="${a?.poaNumber||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">مكتب التوثيق <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-notary" value="${a?.notaryOffice||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ التوكيل <span class="required">*</span></label>
              <input type="date" class="form-input" id="client-poa-date" value="${a?.poaDate||""}" required />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea class="form-textarea" id="client-notes">${a?.notes||""}</textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6 form-actions-fixed">
          <button type="submit" class="btn btn-primary">
            ${s?"💾 حفظ التعديلات":"✓ إنشاء العميل"}
          </button>
          <button type="button" class="btn btn-secondary" onclick="window.location.hash='/clients'">إلغاء</button>
        </div>
      </form>
    </div>
  `,e.querySelector("#client-form").addEventListener("submit",p=>{p.preventDefault();const d=Je({name:document.getElementById("client-name").value.trim(),nationalId:document.getElementById("client-national-id").value.trim(),phone:document.getElementById("client-phone").value.trim(),address:document.getElementById("client-address").value.trim(),poaNumber:document.getElementById("client-poa").value.trim(),notaryOffice:document.getElementById("client-notary").value.trim(),poaDate:document.getElementById("client-poa-date").value,notes:document.getElementById("client-notes").value.trim(),driveFolderUrl:a?.driveFolderUrl||"",driveFolderId:a?.driveFolderId||""});if(!d.name||!d.nationalId||!d.phone||!d.poaNumber||!d.notaryOffice||!d.poaDate){w("يرجى ملء جميع الحقول المطلوبة","error");return}if(s)c.update(l.CLIENTS,t.id,d),N(l.CLIENTS,t.id,"update",d),w("تم تحديث بيانات العميل","success");else{const g=c.create(l.CLIENTS,d);N(l.CLIENTS,g.id,"create",d),w("تم إنشاء العميل بنجاح","success")}window.location.hash="/clients"});const n=e.querySelector("#btn-sync-drive");async function o(p=!1){if(!a?.driveFolderId)return;const d=n?n.innerHTML:"";n&&(n.innerHTML="<i class='bx bx-loader-alt bx-spin'></i> جاري المزامنة...",n.disabled=!0);try{const r=await fetch(`/api/sync-drive?folderId=${encodeURIComponent(a.driveFolderId)}`),m=await r.json();if(!r.ok)throw new Error(m.error||"حدث خطأ أثناء المزامنة");m.nationalId?(document.getElementById("client-national-id").value=m.nationalId,w("تم العثور على الرقم القومي تلقائياً من ملفات درايف!","success"),n&&(n.style.display="none")):p||w("لم يتم العثور على رقم قومي في صور المجلد.","warning")}catch(g){console.error(g),p||w(g.message,"error")}finally{n&&(n.innerHTML=d,n.disabled=!1)}}n&&(n.addEventListener("click",()=>{o(!1)}),s&&!a?.nationalId&&o(!0))}function kt(e){P("القضايا");const t=c.getAll(l.CASES);c.getAll(l.CLIENTS),c.getAll(l.USERS),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-folder-open'></i> القضايا</h1>
          <div class="page-header-sub">${t.length} قضية</div>
        </div>
        ${ht("createCase")?`<button class="btn btn-primary" onclick="window.location.hash='/cases/new'"><i class='bx bx-plus'></i> إضافة قضية</button>`:""}
      </div>
      
      <div class="filter-bar">
        <div class="search-input">
          <span class="search-icon">🔍</span>
          <input type="text" id="case-search" placeholder="بحث برقم القضية أو اسم العميل أو الخصم..." />
        </div>
        <select class="filter-select" id="filter-type">
          <option value="">كل الأنواع</option>
          ${_e.map(a=>`<option value="${a}">${a}</option>`).join("")}
        </select>
        <select class="filter-select" id="filter-status">
          <option value="">كل الحالات</option>
          ${Me.map(a=>`<option value="${a}">${a}</option>`).join("")}
        </select>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>رقم القضية</th>
              <th>النوع</th>
              <th>العميل</th>
              <th>الخصم</th>
              <th>المحكمة</th>
              <th>الموضوع</th>
              <th>المرحلة</th>
              <th>الحالة</th>
              <th>المسؤول</th>
            </tr>
          </thead>
          <tbody id="case-table-body">
          </tbody>
        </table>
      </div>
    </div>
  `;function s(){const a=document.getElementById("case-search").value.toLowerCase(),n=document.getElementById("filter-type").value,o=document.getElementById("filter-status").value;let p=t;a&&(p=p.filter(g=>{const r=c.getById(l.CLIENTS,g.clientId);return g.caseNo.includes(a)||g.subject.toLowerCase().includes(a)||g.opponentName.toLowerCase().includes(a)||g.court.toLowerCase().includes(a)||r&&r.name.toLowerCase().includes(a)})),n&&(p=p.filter(g=>g.caseType===n)),o&&(p=p.filter(g=>g.status===o));const d=document.getElementById("case-table-body");if(p.length===0){d.innerHTML='<tr><td colspan="9"><div class="empty-state"><p>لا توجد قضايا</p></div></td></tr>';return}d.innerHTML=p.map(g=>{const r=c.getById(l.CLIENTS,g.clientId),m=c.getById(l.USERS,g.ownerId),y=me[g.caseType]||"civil",$=Ue[g.status]||"active";return`
        <tr class="clickable-row" onclick="window.location.hash='/cases/${g.id}'">
          <td><strong>${g.caseNo||""}/${g.year||""}</strong></td>
          <td><span class="badge badge-${y}">${g.caseType||"—"}</span></td>
          <td>${r?r.name:"—"}</td>
          <td>${g.opponentName||"—"}</td>
          <td class="text-sm">${g.court||"—"}</td>
          <td class="text-sm">${g.subject||"—"}</td>
          <td>${g.stageType||"—"}</td>
          <td><span class="badge badge-${$}">${g.status||"—"}</span></td>
          <td class="text-sm">${m?m.name:"—"}</td>
        </tr>
      `}).join("")}s(),document.getElementById("case-search").addEventListener("input",s),document.getElementById("filter-type").addEventListener("change",s),document.getElementById("filter-status").addEventListener("change",s)}function Le(e,t={}){const s=t.id&&!window.location.hash.includes("/new"),a=s?c.getById(l.CASES,t.id):null,n=c.getAll(l.CLIENTS),o=c.getAll(l.USERS);P(s?"تعديل القضية":"إضافة قضية جديدة"),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1>${s?"<i class='bx bx-edit'></i> تعديل القضية":"<i class='bx bx-plus'></i> إضافة قضية جديدة"}</h1>
          <div class="page-header-sub">${s?`القضية ${a?.caseNo}/${a?.year}`:"يتم إنشاء القضية فقط بعد الحصول على رقم القضية وتاريخ أول جلسة"}</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/cases'">↩ العودة</button>
      </div>
      
      <form id="case-form">
        <div class="card" style="max-width: 900px;">
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bx-list-check'></i> بيانات القضية الأساسية</h3>
          
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">رقم القضية <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-no" value="${a?.caseNo||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">السنة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-year" value="${a?.year||new Date().getFullYear()}" required />
            </div>
            <div class="form-group">
              <label class="form-label">نوع المرحلة <span class="required">*</span></label>
              <select class="form-select" id="case-stage" required>
                <option value="">اختر المرحلة</option>
                ${lt.map(r=>`<option value="${r}" ${a?.stageType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">نوع القضية <span class="required">*</span></label>
              <select class="form-select" id="case-type" required>
                <option value="">اختر النوع</option>
                ${_e.map(r=>`<option value="${r}" ${a?.caseType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" id="criminal-stage-group" style="display: ${a?.caseType==="جنائي"?"block":"none"};">
              <label class="form-label">مرحلة القضية الجنائية <span class="required">*</span></label>
              <select class="form-select" id="case-criminal-stage">
                <option value="">اختر المرحلة الجنائية</option>
                ${ct.map(r=>`<option value="${r}" ${a?.criminalStageType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <hr style="border-color: var(--border-primary); margin: var(--space-6) 0;" />
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bxs-user-detail'></i> أطراف القضية</h3>
          
          <div class="form-row">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">العملاء <span class="required">*</span></label>
              <div class="client-tags" id="client-tags-container">
                ${(a?.clientIds||(a?.clientId?[a.clientId]:[])).map(r=>{const m=n.find($=>$.id===r),y=a?.primaryClientId===r;return m?`<span class="client-tag ${y?"primary":""}" data-client-id="${r}">${m.name}${y?" (رئيسي)":""}<button class="client-tag-remove" data-remove-id="${r}">&times;</button></span>`:""}).join("")}
              </div>
              <div class="flex gap-2">
                <select class="form-select" id="add-client-select" style="flex:1;">
                  <option value="">اختر عميل للإضافة...</option>
                  ${n.map(r=>`<option value="${r.id}">${r.name}</option>`).join("")}
                </select>
                <button type="button" class="btn btn-secondary btn-sm" id="add-client-btn"><i class='bx bx-plus'></i> إضافة</button>
              </div>
            </div>
          </div>
          
          <div class="form-group" id="primary-client-group" style="display: ${(a?.clientIds?.length||0)>1?"block":"none"};">
            <label class="form-label">العميل الرئيسي <span class="required">*</span></label>
            <div id="primary-client-radios">
              ${(a?.clientIds||[]).map(r=>{const m=n.find(y=>y.id===r);return m?`<label class="primary-select-radio"><input type="radio" name="primary-client" value="${r}" ${a?.primaryClientId===r?"checked":""} />${m.name}</label>`:""}).join("")}
            </div>
            <div class="form-hint">سيتم عرض اسم العميل الرئيسي في التقويم ولوحة التحكم</div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">صفة العميل <span class="required">*</span></label>
              <select class="form-select" id="case-client-role" required>
                <option value="">اختر الصفة</option>
                ${Ee.map(r=>`<option value="${r}" ${a?.clientRole===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">اسم الخصم <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-opponent" value="${a?.opponentName||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">صفة الخصم <span class="required">*</span></label>
              <select class="form-select" id="case-opponent-role" required>
                <option value="">اختر الصفة</option>
                ${Ee.map(r=>`<option value="${r}" ${a?.opponentRole===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <hr style="border-color: var(--border-primary); margin: var(--space-6) 0;" />
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bxs-bank'></i> بيانات المحكمة</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المحكمة / الجهة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-court" value="${a?.court||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">الدائرة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-circuit" value="${a?.circuit||""}" required />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">موضوع القضية (سطر واحد) <span class="required">*</span></label>
            <input type="text" class="form-input" id="case-subject" value="${a?.subject||""}" required />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">تاريخ أول جلسة <span class="required">*</span></label>
              <input type="date" class="form-input" id="case-first-session" value="${a?.firstSessionDate||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">المحامي المسؤول <span class="required">*</span></label>
              <select class="form-select" id="case-owner" required>
                <option value="">اختر المحامي</option>
                ${o.filter(r=>r.role!=="متدرب").map(r=>`<option value="${r.id}" ${a?.ownerId===r.id?"selected":""}>${r.name} (${r.role})</option>`).join("")}
              </select>
            </div>
          </div>
          
          ${s?`
          <div class="form-group">
            <label class="form-label">حالة القضية</label>
            <select class="form-select" id="case-status">
              ${Me.map(r=>`<option value="${r}" ${a?.status===r?"selected":""}>${r}</option>`).join("")}
            </select>
          </div>
          `:""}
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea class="form-textarea" id="case-notes">${a?.notes||""}</textarea>
          </div>
          
          <div id="case-form-errors" class="form-error mb-4" style="display: none;"></div>
        </div>
        
        <div class="flex gap-3 mt-6 form-actions-fixed">
          <button type="submit" class="btn btn-primary">
            ${s?"💾 حفظ التعديلات":"✓ إنشاء القضية"}
          </button>
          <button type="button" class="btn btn-secondary" onclick="window.location.hash='/cases'">إلغاء</button>
        </div>
      </form>
    </div>
  `,document.getElementById("case-type").addEventListener("change",r=>{const m=document.getElementById("criminal-stage-group");m.style.display=r.target.value==="جنائي"?"block":"none"});let p=a?.clientIds?[...a.clientIds]:a?.clientId?[a.clientId]:[],d=a?.primaryClientId||a?.clientId||"";function g(){const r=document.getElementById("client-tags-container"),m=document.getElementById("primary-client-group"),y=document.getElementById("primary-client-radios");r.innerHTML=p.map($=>{const f=n.find(i=>i.id===$),h=d===$;return f?`<span class="client-tag ${h?"primary":""}" data-client-id="${$}">${f.name}${h?" (رئيسي)":""}<button class="client-tag-remove" data-remove-id="${$}">&times;</button></span>`:""}).join(""),r.querySelectorAll(".client-tag-remove").forEach($=>{$.addEventListener("click",f=>{f.preventDefault();const h=$.dataset.removeId;p=p.filter(i=>i!==h),d===h&&(d=p[0]||""),g()})}),p.length>1?(m.style.display="block",y.innerHTML=p.map($=>{const f=n.find(h=>h.id===$);return f?`<label class="primary-select-radio"><input type="radio" name="primary-client" value="${$}" ${d===$?"checked":""} />${f.name}</label>`:""}).join(""),y.querySelectorAll('input[type="radio"]').forEach($=>{$.addEventListener("change",()=>{d=$.value,g()})})):(m.style.display="none",p.length===1&&(d=p[0]))}document.getElementById("add-client-btn").addEventListener("click",()=>{const r=document.getElementById("add-client-select"),m=r.value;m&&(p.includes(m)||(p.push(m),p.length===1&&(d=m),r.value="",g()))}),g(),document.getElementById("case-form").addEventListener("submit",r=>{r.preventDefault();const m=mt({caseNo:document.getElementById("case-no").value.trim(),year:document.getElementById("case-year").value.trim(),stageType:document.getElementById("case-stage").value,clientId:d,clientIds:[...p],primaryClientId:d,clientRole:document.getElementById("case-client-role").value,opponentName:document.getElementById("case-opponent").value.trim(),opponentRole:document.getElementById("case-opponent-role").value,court:document.getElementById("case-court").value.trim(),circuit:document.getElementById("case-circuit").value.trim(),caseType:document.getElementById("case-type").value,subject:document.getElementById("case-subject").value.trim(),firstSessionDate:document.getElementById("case-first-session").value,ownerId:document.getElementById("case-owner").value,status:s?document.getElementById("case-status")?.value||a.status:"نشطة",criminalStageType:document.getElementById("case-criminal-stage")?.value||"",notes:document.getElementById("case-notes").value.trim()}),y=[];if(m.caseNo||y.push("رقم القضية مطلوب"),m.year||y.push("السنة مطلوبة"),m.stageType||y.push("نوع المرحلة مطلوب"),p.length===0&&y.push("يجب إضافة عميل واحد على الأقل"),p.length>1&&!d&&y.push("يجب اختيار العميل الرئيسي عند وجود عدة عملاء"),m.clientRole||y.push("صفة العميل مطلوبة"),m.opponentName||y.push("اسم الخصم مطلوب"),m.opponentRole||y.push("صفة الخصم مطلوبة"),m.court||y.push("المحكمة مطلوبة"),m.circuit||y.push("الدائرة مطلوبة"),m.caseType||y.push("نوع القضية مطلوب"),m.subject||y.push("موضوع القضية مطلوب"),m.firstSessionDate||y.push("تاريخ أول جلسة مطلوب"),m.ownerId||y.push("المحامي المسؤول مطلوب"),m.caseType==="جنائي"&&!m.criminalStageType&&y.push("مرحلة القضية الجنائية مطلوبة"),s&&m.status==="مغلقة"){const $=c.query(l.ACTIONS,h=>h.caseId===t.id&&h.caseId!==""&&h.status!=="مكتمل"),f=c.query(l.DEADLINES,h=>h.caseId===t.id&&h.status==="مفتوح");$.length>0&&y.push(`لا يمكن إغلاق القضية: يوجد ${$.length} إجراء مفتوح مرتبط بها`),f.length>0&&y.push(`لا يمكن إغلاق القضية: يوجد ${f.length} موعد نهائي مفتوح`)}if(y.length>0){const $=document.getElementById("case-form-errors");$.style.display="block",$.innerHTML=y.join("<br>"),w("يرجى تصحيح الأخطاء","error");return}if(s)c.update(l.CASES,t.id,m),N(l.CASES,t.id,"update",m),w("تم تحديث القضية","success"),window.location.hash=`/cases/${t.id}`;else{const $=c.create(l.CASES,m);N(l.CASES,$.id,"create",m);const f=c.create(l.SESSIONS,{caseId:$.id,date:m.firstSessionDate,sessionType:m.caseType==="جنائي"&&m.criminalStageType==="تحقيقات نيابة"?"تحقيق":"جلسة استماع",decisionResult:"",nextSessionDate:"",notes:"جلسة أولى – تم إنشاؤها تلقائياً"});N(l.SESSIONS,f.id,"create",{auto:!0,caseId:$.id}),w("تم إنشاء القضية وجلستها الأولى بنجاح","success"),window.location.hash=`/cases/${$.id}`}})}const Dt=[{decisionType:"تأجيل لإعادة الإعلان",actionType:"إعلان/خدمة",executionProof:"تاريخ التقديم للمحضر + رقم المرجع + النتيجة",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل لتصريح",actionType:"تصريح محكمة",executionProof:"رقم التصريح + التاريخ + المرفق",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل لمذكرة ومستندات",actionType:"حزمة تحضير",executionProof:"تفاصيل التقديم",subTasks:[{title:"صياغة المذكرة",completed:!1},{title:"مراجعة المذكرة",completed:!1},{title:"تحضير المستندات",completed:!1},{title:"تصوير ونسخ",completed:!1},{title:"تقديم الحزمة",completed:!1}],requiresNextDate:!0},{decisionType:"إحالة لخبير",actionType:"متابعة خبير",executionProof:"متابعة الموعد + تقديم الملاحظات + استلام التقرير",subTasks:[{title:"متابعة موعد الخبير",completed:!1},{title:"تقديم ملاحظات",completed:!1},{title:"استلام التقرير",completed:!1}],requiresNextDate:!0},{decisionType:"شطب",actionType:"تجديد من الشطب",executionProof:"تقديم طلب التجديد",subTasks:[],requiresNextDate:!1},{decisionType:"صدور حكم",actionType:"مراجعة حكم",executionProof:"مراجعة الحكم وتحديد الإجراء التالي",subTasks:[],requiresNextDate:!1},{decisionType:"حبس احتياطي",actionType:"حضور تجديد حبس",executionProof:"حضور جلسة التجديد",subTasks:[],requiresNextDate:!1,urgent:!0},{decisionType:"طلب تحقيقات",actionType:"متابعة تحقيق",executionProof:"استلام التحقيق + الخطوة التالية",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل للمرافعة",actionType:"حزمة تحضير",executionProof:"تحضير المرافعة",subTasks:[{title:"تحضير نقاط المرافعة",completed:!1},{title:"مراجعة القضية",completed:!1}],requiresNextDate:!0},{decisionType:"تأجيل للاطلاع",actionType:"حزمة تحضير",executionProof:"الاطلاع والتحضير",subTasks:[{title:"الاطلاع على المستندات",completed:!1},{title:"تحضير الرد",completed:!1}],requiresNextDate:!0},{decisionType:"تأجيل عام",actionType:"أخرى",executionProof:"",subTasks:[],requiresNextDate:!0},{decisionType:"إحالة للمحكمة",actionType:"أخرى",executionProof:"إنشاء قضية جديدة مرتبطة",subTasks:[],requiresNextDate:!1,createsLinkedCase:!0},{decisionType:"نطق بالحكم",actionType:"مراجعة حكم",executionProof:"مراجعة الحكم وتحديد الإجراء التالي",subTasks:[],requiresNextDate:!1}];function fe(){const e=c.getAll(l.DECISION_MAP);return e.length===0?(Dt.forEach(t=>{c.create(l.DECISION_MAP,t)}),c.getAll(l.DECISION_MAP)):e}function pe(e){return fe().find(s=>s.decisionType===e)||null}function Lt(e,t){return c.update(l.DECISION_MAP,e,t)}function At(e){return c.create(l.DECISION_MAP,e)}function Bt(e){return c.softDelete(l.DECISION_MAP,e)}function Ct(e){const t=pe(e);return t?t.createsLinkedCase===!0:!1}function oe(e,t){c.getAll(e).length===0&&t.forEach((a,n)=>{c.create(e,{label:a,order:n})})}function ee(){return oe(l.LOOKUP_ACTION_TYPES,Fe),c.getAll(l.LOOKUP_ACTION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0)).map(e=>e.label)}function Ve(){return oe(l.LOOKUP_DECISION_TYPES,Ye),c.getAll(l.LOOKUP_DECISION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0)).map(e=>e.label)}function Nt(){return oe(l.LOOKUP_ACTION_TYPES,Fe),c.getAll(l.LOOKUP_ACTION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0))}function qt(){return oe(l.LOOKUP_DECISION_TYPES,Ye),c.getAll(l.LOOKUP_DECISION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0))}function Ot(e,t){const a=c.getAll(e).reduce((n,o)=>Math.max(n,o.order??0),0);return c.create(e,{label:t.trim(),order:a+1})}function Pt(e,t,s){return c.update(e,t,{label:s.trim()})}function jt(e,t){const s=c.getById(e,t);if(!s)return{ok:!1};const a=fe();let n=null;return e===l.LOOKUP_ACTION_TYPES?n=a.some(o=>o.actionType===s.label):n=a.some(o=>o.decisionType===s.label),c.softDelete(e,t),n?{ok:!0,warning:`"${s.label}" محذوف من القائمة لكنه لا يزال مرتبطاً بربط قرارات. يُنصح بمراجعة صفحة ربط القرارات.`}:{ok:!0}}function We(e,t){if(!ae()){w("تعديل الإجراءات متاح للشركاء فقط","error");return}const s=c.getById(l.ACTIONS,e);if(!s)return;const a=c.getAll(l.CLIENTS),n=c.getAll(l.CASES),p=c.getAll(l.USERS).filter(f=>f.active&&ve.includes(f.role)),d=s.status==="مكتمل",g=ee();function r(f){return f?n.filter(h=>(h.clientIds||(h.clientId?[h.clientId]:[])).includes(f)||h.primaryClientId===f||h.clientId===f):[]}const m=r(s.clientId),y=`
    <form id="edit-action-partner-form" autocomplete="off">

      ${d?`
      <div style="background:var(--status-progress-bg);border-right:3px solid var(--status-progress);
                  padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);
                  margin-bottom:var(--space-4);font-size:var(--text-sm);">
        <i class='bx bx-error'></i> هذا الإجراء مكتمل. تعديل تفاصيل التنفيذ يتطلب إدخال سبب التعديل.
      </div>`:""}

      <div class="form-hint" style="color:var(--risk-high);margin-bottom:var(--space-4);">
        <i class='bx bx-error'></i> الحقول المشار إليها بـ <strong>(حساس)</strong> تتطلب ذكر سبب التعديل
      </div>

      <!-- Type + Priority -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">نوع الإجراء <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-action-type">
            ${g.map(f=>`<option value="${f}" ${s.actionType===f?"selected":""}>${f}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select class="form-select" id="ea-priority">
            <option value="">بدون أولوية</option>
            ${be.map(f=>`<option value="${f}" ${s.priority===f?"selected":""}>${f}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Title -->
      <div class="form-group">
        <label class="form-label">عنوان / وصف الإجراء</label>
        <input type="text" class="form-input" id="ea-title"
               value="${(s.title||"").replace(/"/g,"&quot;")}" />
      </div>

      <!-- Client (MANDATORY) + Case (optional, cascades) -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">العميل <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-client" required>
            <option value="">اختر العميل</option>
            ${a.map(f=>`<option value="${f.id}" ${s.clientId===f.id?"selected":""}>${f.name}</option>`).join("")}
          </select>
          <div class="form-hint">يجب أن يبقى الإجراء مرتبطاً بعميل دائماً</div>
        </div>
        <div class="form-group">
          <label class="form-label">القضية
            <span class="form-optional">(اختياري – حساس)</span></label>
          <select class="form-select" id="ea-case">
            <option value="">بدون قضية (مستوى العميل)</option>
            ${m.map(f=>`<option value="${f.id}" ${s.caseId===f.id?"selected":""}>${f.caseNo}/${f.year} – ${f.subject}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Responsible + Due Date -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المحامي المسؤول <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-responsible">
            ${p.map(f=>`<option value="${f.id}" ${s.responsibleUserId===f.id?"selected":""}>${f.name} (${f.role})</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق</label>
          <input type="date" class="form-input" id="ea-due-date" value="${s.dueDate||""}" />
        </div>
      </div>

      <!-- Post-completion execution fields (Partner can edit) -->
      ${d?`
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ التنفيذ
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <input type="date" class="form-input" id="ea-exec-date" value="${s.executionDate||""}" />
        </div>
        <div class="form-group">
          <label class="form-label">تفاصيل التنفيذ / الإثبات
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <textarea class="form-textarea" id="ea-exec-details" style="min-height:60px;">${s.executionDetails||""}</textarea>
        </div>
      </div>`:""}

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea class="form-textarea" id="ea-notes">${s.notes||""}</textarea>
      </div>

      <!-- Edit Reason — required when sensitive fields change -->
      <div class="form-group">
        <label class="form-label" style="color:var(--risk-high);">
          سبب التعديل <span class="required">*</span>
        </label>
        <textarea class="form-textarea" id="ea-edit-reason"
          placeholder="اذكر سبب التعديل بوضوح (مطلوب عند تعديل الحقول الحساسة)..."></textarea>
        <div class="form-hint">
          مطلوب عند تغيير: نوع الإجراء، المسؤول، العميل، القضية، أو تفاصيل التنفيذ
        </div>
      </div>

      <div id="ea-errors" class="form-error mt-4" style="display:none;"></div>
    </form>`;_("تعديل الإجراء (شريك)",y,{footer:`
    <button class="btn btn-primary" id="ea-save-btn">💾 حفظ التعديلات</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`,large:!0}),document.getElementById("ea-client")?.addEventListener("change",()=>{const f=document.getElementById("ea-client").value,h=document.getElementById("ea-case");if(!h)return;const i=r(f);h.innerHTML='<option value="">بدون قضية (مستوى العميل)</option>'+i.map(b=>`<option value="${b.id}">${b.caseNo}/${b.year} – ${b.subject}</option>`).join("")}),document.getElementById("ea-save-btn").addEventListener("click",()=>{const f=document.getElementById("ea-action-type").value,h=document.getElementById("ea-title").value.trim(),i=document.getElementById("ea-priority").value,b=document.getElementById("ea-client").value,E=document.getElementById("ea-case")?.value||"",u=document.getElementById("ea-responsible").value,I=document.getElementById("ea-due-date").value,x=document.getElementById("ea-notes").value.trim(),k=d&&document.getElementById("ea-exec-date")?.value||s.executionDate,A=d&&document.getElementById("ea-exec-details")?.value?.trim()||s.executionDetails,D=document.getElementById("ea-edit-reason").value.trim(),C=[s.actionType!==f,s.responsibleUserId!==u,s.clientId!==b,s.caseId!==E,d&&(s.executionDate!==k||s.executionDetails!==A)].some(Boolean),v=[];if(b||v.push("العميل مطلوب – لا يمكن إزالة ربط الإجراء بعميل"),f||v.push("نوع الإجراء مطلوب"),u||v.push("المحامي المسؤول مطلوب"),C&&!D&&v.push("سبب التعديل مطلوب عند تغيير الحقول الحساسة"),E){const T=c.getById(l.CASES,E);T&&((T.clientIds||(T.clientId?[T.clientId]:[])).includes(b)||T.primaryClientId===b||T.clientId===b||v.push("القضية المختارة لا تنتمي للعميل المحدد"))}if(v.length>0){const T=document.getElementById("ea-errors");T.style.display="block",T.innerHTML=v.join("<br>");return}const S={actionType:f,title:h,priority:i,clientId:b,caseId:E,responsibleUserId:u,dueDate:I,notes:x,executionDate:k,executionDetails:A};xt(e,s,S,D),c.update(l.ACTIONS,e,S),w("تم حفظ التعديلات بنجاح","success"),O(),typeof t=="function"&&t()})}function _t(e,t){const s=c.getById(l.ACTIONS,e);if(!s)return;if(s.status==="مكتمل"){w("هذا الإجراء مكتمل بالفعل ولا يمكن تعديل تقدمه","warning");return}const a=`
    <form id="progress-update-form" autocomplete="off">

      <!-- Read-only action context -->
      <div style="background:var(--bg-tertiary);border-radius:var(--radius-md);
                  padding:var(--space-3) var(--space-4);margin-bottom:var(--space-4);
                  font-size:var(--text-sm);">
        <div><strong>نوع الإجراء:</strong> ${s.actionType}</div>
        ${s.title?`<div><strong>الوصف:</strong> ${s.title}</div>`:""}
        ${s.dueDate?`<div><strong>الاستحقاق:</strong> ${s.dueDate}</div>`:""}
      </div>

      <!-- Status -->
      <div class="form-group">
        <label class="form-label">الحالة <span class="required">*</span></label>
        <select class="form-select" id="pu-status">
          <option value="مفتوح"       ${s.status==="مفتوح"?"selected":""}>مفتوح</option>
          <option value="قيد التنفيذ" ${s.status==="قيد التنفيذ"?"selected":""}>قيد التنفيذ</option>
          <option value="معلق"        ${s.status==="معلق"?"selected":""}>معلق</option>
          <option value="مكتمل"       >مكتمل</option>
        </select>
      </div>

      <!-- Progress notes -->
      <div class="form-group">
        <label class="form-label">ملاحظات التقدم</label>
        <textarea class="form-textarea" id="pu-notes"
          placeholder="أضف ملاحظات حول التقدم في تنفيذ الإجراء...">${s.notes||""}</textarea>
      </div>

      <!-- Execution fields — shown/required only when status = مكتمل -->
      <div id="pu-completion-fields" style="display:none;">
        <div class="form-group">
          <label class="form-label">تاريخ التنفيذ <span class="required">*</span></label>
          <input type="date" class="form-input" id="pu-exec-date" value="${s.executionDate||""}" />
        </div>
        <div class="form-group">
          <label class="form-label">تفاصيل التنفيذ / الإثبات <span class="required">*</span></label>
          <textarea class="form-textarea" id="pu-exec-details"
            placeholder="رقم المحضر، مرجع التصريح، إيصال التقديم...">${s.executionDetails||""}</textarea>
        </div>
      </div>

      <div id="pu-errors" class="form-error mt-4" style="display:none;"></div>
    </form>`;_("تحديث تقدم الإجراء",a,{footer:`
    <button class="btn btn-primary" id="pu-save-btn">✓ حفظ التقدم</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`});const o=document.getElementById("pu-status"),p=document.getElementById("pu-completion-fields");o?.addEventListener("change",()=>{p.style.display=o.value==="مكتمل"?"block":"none"}),document.getElementById("pu-save-btn").addEventListener("click",()=>{const d=document.getElementById("pu-status").value,g=document.getElementById("pu-notes").value.trim(),r=document.getElementById("pu-exec-date")?.value||"",m=document.getElementById("pu-exec-details")?.value?.trim()||"",y=[];if(d==="مكتمل"&&(r||y.push("تاريخ التنفيذ مطلوب لإكمال الإجراء"),m||y.push("تفاصيل التنفيذ / الإثبات مطلوبة لإكمال الإجراء")),y.length>0){const i=document.getElementById("pu-errors");i.style.display="block",i.innerHTML=y.join("<br>");return}const $={status:d,notes:g};d==="مكتمل"&&($.executionDate=r,$.executionDetails=m),c.update(l.ACTIONS,e,$);const f=d==="مكتمل"?"complete":"status_change";N(l.ACTIONS,e,f,{oldStatus:s.status,newStatus:d,notes:g});const h=d==="مكتمل"?"تم إكمال الإجراء ✓":`تم تحديث الحالة إلى: ${d}`;w(h,"success"),O(),typeof t=="function"&&t()})}function G(e,t={}){const s=c.getById(l.CASES,t.id);if(!s){e.innerHTML=`<div class="empty-state"><h3>القضية غير موجودة</h3><button class="btn btn-primary" onclick="window.location.hash='/cases'">العودة للقضايا</button></div>`;return}const a=c.getById(l.CLIENTS,s.primaryClientId||s.clientId),p=(s.clientIds||(s.clientId?[s.clientId]:[])).map(i=>c.getById(l.CLIENTS,i)).filter(Boolean).length>1?`${a?a.name:"—"} وآخرون`:a?a.name:"—",d=c.getById(l.USERS,s.ownerId),g=c.query(l.SESSIONS,i=>i.caseId===t.id).sort((i,b)=>new Date(b.date)-new Date(i.date)),r=c.query(l.ACTIONS,i=>i.caseId===t.id),m=c.query(l.DEADLINES,i=>i.caseId===t.id),y=c.getAll(l.USERS),$=r.filter(i=>i.status!=="مكتمل");m.filter(i=>i.status==="مفتوح");const f=me[s.caseType]||"civil",h=Ue[s.status]||"active";P(`القضية ${s.caseNo}/${s.year}`),e.innerHTML=`
    <div class="animate-fade-in">
      <!-- Case Header -->
      <div class="case-detail-header">
        <div class="case-detail-info">
          <div class="case-badges">
            <span class="badge badge-${f}">${s.caseType}</span>
            <span class="badge badge-${h}">${s.status}</span>
            ${s.criminalStageType?`<span class="badge badge-criminal">${s.criminalStageType}</span>`:""}
          </div>
          <h1>القضية ${s.caseNo}/${s.year}</h1>
          <p class="text-secondary mb-4">${s.subject}</p>
          
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-item-label">العميل</div>
              <div class="detail-item-value">${p} (${s.clientRole})</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">الخصم</div>
              <div class="detail-item-value">${s.opponentName} (${s.opponentRole})</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المحكمة</div>
              <div class="detail-item-value">${s.court}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">الدائرة</div>
              <div class="detail-item-value">${s.circuit}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المرحلة</div>
              <div class="detail-item-value">${s.stageType}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المسؤول</div>
              <div class="detail-item-value">${d?d.name:"—"}</div>
            </div>
          </div>
        </div>
        <div class="case-detail-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.location.hash='/cases/${t.id}/edit'"><i class='bx bx-edit'></i> تعديل</button>
          <button class="btn btn-secondary btn-sm" onclick="window.location.hash='/cases'">↩ العودة</button>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn active" data-tab="sessions">
          <i class='bx bx-list-check'></i> الجلسات <span class="tab-count">${g.length}</span>
        </button>
        <button class="tab-btn" data-tab="actions">
          <i class='bx bxs-zap'></i> الإجراءات <span class="tab-count">${r.length}</span>
        </button>
        <button class="tab-btn" data-tab="deadlines">
          <i class='bx bxs-time'></i> المواعيد النهائية <span class="tab-count">${m.length}</span>
        </button>
      </div>
      
      <!-- Sessions Tab -->
      <div class="tab-panel active" id="tab-sessions">
        <div class="flex justify-between items-center mb-4">
          <h3>الجلسات${s.caseType==="جنائي"&&s.criminalStageType==="تحقيقات نيابة"?" / التحقيقات":""}</h3>
          <button class="btn btn-primary btn-sm" id="add-session-btn"><i class='bx bx-plus'></i> إضافة جلسة</button>
        </div>
        <div class="timeline" id="sessions-timeline">
          ${g.length===0?'<div class="empty-state"><p>لا توجد جلسات بعد</p></div>':""}
          ${g.map(i=>{const b=i.sessionType==="تحقيق",E=i.decisionResult?.includes("حكم"),u=i.status==="مغلق";return`
              <div class="timeline-item">
                <div class="timeline-dot ${E?"judgment":""} ${b?"investigation":""}"></div>
                <div class="timeline-content">
                  <div class="flex justify-between items-center">
                    <div class="timeline-date">${j(i.date)}</div>
                    <div class="flex items-center gap-2">
                      <span class="session-status-badge ${u?"session-status-closed":"session-status-open"}">${u?"مغلق":"مفتوح"}</span>
                      <span class="badge badge-${b?"criminal":"civil"}">${i.sessionType}</span>
                    </div>
                  </div>
                  <div class="timeline-title">${i.decisionResult||"بدون قرار بعد"}</div>
                  ${i.closureReason?`<div class="text-xs text-secondary mt-1">سبب الإغلاق: ${i.closureReason}</div>`:""}
                  ${i.nextSessionDate?`<div class="text-xs text-secondary mt-2">الجلسة التالية: ${j(i.nextSessionDate)}</div>`:""}
                  ${i.notes?`<div class="timeline-desc mt-2">${i.notes}</div>`:""}
                  <div class="flex gap-2 mt-2">
                    <button class="btn btn-ghost btn-sm edit-session-btn" data-id="${i.id}"><i class='bx bx-edit'></i> تعديل</button>
                    ${u?"":`<button class="btn btn-primary btn-sm close-session-btn" data-id="${i.id}">✓ إغلاق الجلسة</button>`}
                  </div>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
      
      <!-- Actions Tab -->
      <div class="tab-panel" id="tab-actions">
        <div class="flex justify-between items-center mb-4">
          <h3>الإجراءات</h3>
          <div class="flex gap-2">
            ${$.length>0?`<span class="badge badge-progress">${$.length} مفتوح</span>`:""}
            <button class="btn btn-primary btn-sm" id="create-action-btn"><i class='bx bx-plus'></i> إنشاء إجراء</button>
          </div>
        </div>
        ${r.length===0?'<div class="empty-state"><p>لا توجد إجراءات بعد</p></div>':""}
        ${r.map(i=>{const b=c.getById(l.USERS,i.responsibleUserId),E=i.clientId?c.getById(l.CLIENTS,i.clientId):null,u=Re[i.status]||"open",I=i.dueDate&&ne(i.dueDate)&&i.status!=="مكتمل",x=ae(),k=U(),A=i.status!=="مكتمل"&&(ae()||k&&i.responsibleUserId===k.id),D=St(i.id),C=D.length===0?'<div class="text-xs text-secondary" style="padding:var(--space-2) 0">لا توجد سجلات تعديل</div>':D.map(v=>{const S=v.changes,T=new Date(v.timestamp).toLocaleString("ar-EG",{dateStyle:"short",timeStyle:"short"});if(v.action==="field_change"&&S&&S.field)return`<div class="action-history-entry">
                        <span class="action-history-time">${T}</span>
                        <span class="action-history-who">${v.userName}</span>
                        <span class="action-history-change">غيّر <strong>${S.fieldLabel}</strong>: <span class="old-val">${S.oldValue||"—"}</span> ← <span class="new-val">${S.newValue||"—"}</span>${S.editReason?` (السبب: ${S.editReason})`:""}</span>
                    </div>`;const B={create:"إنشاء",complete:"إكمال",update:"تعديل",delete:"حذف"}[v.action]||v.action;return`<div class="action-history-entry">
                    <span class="action-history-time">${T}</span>
                    <span class="action-history-who">${v.userName}</span>
                    <span class="action-history-change">${B}</span>
                </div>`}).join("");return`
            <div class="card mb-4 ${I?"risk-flag high":""}" style="border-right: 3px solid ${i.status==="مكتمل"?"var(--status-completed)":i.status==="معلق"?"var(--status-blocked)":"var(--status-progress)"};"
                 data-action-id="${i.id}">

              <!-- Header row: type + badges + buttons -->
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${i.actionType}</strong>
                  <span class="badge badge-${u}">${i.status}</span>
                  ${I?'<span class="badge badge-blocked">متأخر</span>':""}
                  ${i.caseId?"":'<span class="badge badge-open" style="font-size:9px;">مستوى العميل</span>'}
                </div>
                <div class="flex gap-2">
                  ${A?`<button class="btn btn-primary btn-sm complete-action-btn" data-id="${i.id}">✓ إكمال</button>`:""}
                  ${x?`<button class="btn btn-ghost btn-sm edit-action-btn" data-id="${i.id}" title="تعديل الإجراء (شريك فقط)"><i class='bx bx-edit'></i> تعديل</button>`:""}
                </div>
              </div>

              <!-- Details -->
              ${E?`<div class="text-xs text-secondary mb-1">العميل: <strong>${E.name}</strong></div>`:""}
              <div class="text-sm text-secondary">المسؤول: ${b?b.name:"—"}</div>
              ${i.title?`<div class="text-sm text-secondary mt-1">الوصف: ${i.title}</div>`:""}
              ${i.priority?`<span class="badge badge-progress" style="margin-top:4px;display:inline-block;">أولوية: ${i.priority}</span>`:""}
              ${i.dueDate?`<div class="text-xs text-secondary mt-1">تاريخ الاستحقاق: ${j(i.dueDate)}</div>`:""}
              ${i.executionDate?`<div class="text-xs text-accent mt-1">تم التنفيذ: ${j(i.executionDate)}</div>`:""}
              ${i.executionDetails?`<div class="text-sm mt-2" style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-sm);">${i.executionDetails}</div>`:""}
              ${i.notes?`<div class="text-xs text-secondary mt-2">${i.notes}</div>`:""}

              <!-- Sub-tasks -->
              ${i.subTasks&&i.subTasks.length>0?`
                <div class="mt-4">
                  <div class="text-xs font-semibold text-secondary mb-2">المهام الفرعية:</div>
                  <ul class="subtask-list">
                    ${i.subTasks.map((v,S)=>`
                      <li class="subtask-item ${v.completed?"completed":""}">
                        <input type="checkbox" ${v.completed?"checked":""} class="subtask-check" data-action-id="${i.id}" data-idx="${S}" />
                        <span>${v.title}</span>
                      </li>
                    `).join("")}
                  </ul>
                </div>
              `:""}

              <!-- Action History (toggle) -->
              <div class="action-history" id="history-${i.id}">
                <button class="action-history-toggle" data-target="history-body-${i.id}">
                  🕒 سجل التعديلات (${D.length})
                </button>
                <div class="action-history-body" id="history-body-${i.id}" style="display:none;">
                  ${C}
                </div>
              </div>

            </div>
          `}).join("")}
      </div>
      
      <!-- Deadlines Tab -->
      <div class="tab-panel" id="tab-deadlines">
        <div class="flex justify-between items-center mb-4">
          <h3>المواعيد النهائية</h3>
          <button class="btn btn-primary btn-sm" id="add-deadline-btn"><i class='bx bx-plus'></i> إضافة موعد</button>
        </div>
        ${m.length===0?'<div class="empty-state"><p>لا توجد مواعيد نهائية</p></div>':""}
        ${m.map(i=>{const b=c.getById(l.USERS,i.responsibleUserId),E=He[i.status]||"open",u=J(i.endDate),I=i.status==="مفتوح"&&u<0,x=i.status==="مفتوح"&&u>=0&&u<=3;return`
            <div class="card mb-4" style="border-right: 3px solid ${I?"var(--risk-high)":x?"var(--risk-medium)":i.status==="مكتمل"?"var(--status-completed)":"var(--status-open)"};">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${i.deadlineType}</strong>
                  <span class="badge badge-${E}">${i.status}</span>
                  ${I?'<span class="badge badge-blocked">متأخر!</span>':""}
                  ${x?'<span class="badge badge-progress">يقترب</span>':""}
                </div>
                ${i.status==="مفتوح"?`<button class="btn btn-primary btn-sm complete-deadline-btn" data-id="${i.id}">✓ إكمال</button>`:""}
              </div>
              <div class="flex gap-6 text-sm text-secondary">
                <span>من: ${j(i.startDate)}</span>
                <span>إلى: ${j(i.endDate)}</span>
                <span>المسؤول: ${b?b.name:"—"}</span>
              </div>
              ${i.status==="مفتوح"?`<div class="text-xs mt-2 ${I?"text-accent":""}">${I?`متأخر بـ ${Math.abs(u)} يوم`:u===0?"اليوم!":`متبقي ${u} يوم`}</div>`:""}
              ${i.completionNote?`<div class="text-sm mt-2" style="background: var(--bg-tertiary); padding: var(--space-3); border-radius: var(--radius-sm);">ملاحظة الإكمال: ${i.completionNote}</div>`:""}
            </div>
          `}).join("")}
      </div>
    </div>
  `,e.querySelectorAll(".tab-btn").forEach(i=>{i.addEventListener("click",()=>{e.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active")),e.querySelectorAll(".tab-panel").forEach(b=>b.classList.remove("active")),i.classList.add("active"),document.getElementById(`tab-${i.dataset.tab}`).classList.add("active")})}),e.querySelector("#add-session-btn")?.addEventListener("click",()=>{de(t.id,s,y,e,t)}),e.querySelector("#create-action-btn")?.addEventListener("click",()=>{const i=s.primaryClientId||s.clientId||"";Mt(t.id,i,s,y,e,t)}),e.querySelectorAll(".edit-session-btn").forEach(i=>{i.addEventListener("click",()=>{const b=c.getById(l.SESSIONS,i.dataset.id);b&&de(t.id,s,y,e,t,b,!1)})}),e.querySelectorAll(".close-session-btn").forEach(i=>{i.addEventListener("click",()=>{const b=c.getById(l.SESSIONS,i.dataset.id);b&&de(t.id,s,y,e,t,b,!0)})}),e.querySelectorAll(".complete-action-btn").forEach(i=>{i.addEventListener("click",()=>{Ut(i.dataset.id,e,t)})}),e.querySelectorAll(".edit-action-btn").forEach(i=>{i.addEventListener("click",()=>{We(i.dataset.id,()=>G(e,t))})}),e.querySelectorAll(".action-history-toggle").forEach(i=>{i.addEventListener("click",()=>{const b=document.getElementById(i.dataset.target);if(!b)return;const E=b.style.display==="none";b.style.display=E?"block":"none",i.classList.toggle("open",E)})}),e.querySelectorAll(".subtask-check").forEach(i=>{i.addEventListener("change",()=>{const b=c.getById(l.ACTIONS,i.dataset.actionId);if(b){const E=parseInt(i.dataset.idx);b.subTasks[E].completed=i.checked,c.update(l.ACTIONS,b.id,{subTasks:b.subTasks}),N(l.ACTIONS,b.id,"update",{subTaskIndex:E,completed:i.checked})}})}),e.querySelector("#add-deadline-btn")?.addEventListener("click",()=>{Rt(t.id,y,e,t)}),e.querySelectorAll(".complete-deadline-btn").forEach(i=>{i.addEventListener("click",()=>{Ht(i.dataset.id,e,t)})})}function Mt(e,t,s,a,n,o){const p=a.filter(r=>r.active&&ve.includes(r.role)),d=`
    <form id="create-action-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">نوع الإجراء <span class="required">*</span></label>
          <select class="form-select" id="ca-action-type" required>
            <option value="">اختر النوع</option>
            ${ee().map(r=>`<option value="${r}">${r}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select class="form-select" id="ca-priority">
            <option value="">بدون أولوية</option>
            ${be.map(r=>`<option value="${r}">${r}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">وصف / عنوان الإجراء</label>
        <input type="text" class="form-input" id="ca-title" placeholder="وصف مختصر للإجراء..." />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المحامي المسؤول <span class="required">*</span></label>
          <select class="form-select" id="ca-responsible" required>
            <option value="">اختر المحامي المسؤول</option>
            ${p.map(r=>`<option value="${r.id}" ${r.id===s.ownerId?"selected":""}>${r.name} (${r.role})</option>`).join("")}
          </select>
          <div class="form-hint">يُعرض فقط المستخدمون النشطون</div>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق</label>
          <input type="date" class="form-input" id="ca-due-date" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea class="form-textarea" id="ca-notes" placeholder="أي ملاحظات إضافية..."></textarea>
      </div>

      <div id="ca-errors" class="form-error mt-4" style="display:none;"></div>
    </form>
  `;_("إنشاء إجراء يدوي",d,{footer:`
    <button class="btn btn-primary" id="save-create-action-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `,large:!0}),document.getElementById("save-create-action-btn").addEventListener("click",()=>{const r=document.getElementById("ca-action-type").value,m=document.getElementById("ca-title").value.trim(),y=document.getElementById("ca-priority").value,$=document.getElementById("ca-responsible").value,f=document.getElementById("ca-due-date").value,h=document.getElementById("ca-notes").value.trim(),i=[];if(r||i.push("نوع الإجراء مطلوب"),$||i.push("المحامي المسؤول مطلوب – يجب اختياره"),i.length>0){const u=document.getElementById("ca-errors");u.style.display="block",u.innerHTML=i.join("<br>");return}const b=ye({clientId:t,caseId:e,sessionId:"",actionType:r,title:m,priority:y,responsibleUserId:$,status:"مفتوح",dueDate:f,notes:h}),E=c.create(l.ACTIONS,b);N(l.ACTIONS,E.id,"create",{manual:!0,actionType:r,responsibleUserId:$,caseId:e}),w(`تم إنشاء الإجراء: ${r}`,"success"),O(),G(n,o)})}function de(e,t,s,a,n,o=null,p=!1){const d=!!o,r=t.caseType==="جنائي"&&t.criminalStageType==="تحقيقات نيابة"?"التحقيق":"الجلسة",m=p,y=`
    <form id="session-modal-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ ${r} <span class="required">*</span></label>
          <input type="date" class="form-input" id="session-date" value="${o?.date||""}" required />
        </div>
        <div class="form-group">
          <label class="form-label">نوع ${r} <span class="required">*</span></label>
          <select class="form-select" id="session-type" required>
            <option value="">اختر النوع</option>
            ${dt.map(i=>`<option value="${i}" ${o?.sessionType===i?"selected":""}>${i}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">نتيجة القرار <span class="required">*</span></label>
        <select class="form-select" id="session-decision" required>
          <option value="">اختر القرار</option>
          ${Ve().map(i=>`<option value="${i}" ${o?.decisionResult===i?"selected":""}>${i}</option>`).join("")}
        </select>
      </div>
      
      <div class="form-group" id="next-date-group">
        <label class="form-label">تاريخ الجلسة التالية <span class="required" id="next-date-required">*</span></label>
        <input type="date" class="form-input" id="session-next-date" value="${o?.nextSessionDate||""}" />
        <div class="form-hint">مطلوب إذا كان القرار يتطلب تأجيل</div>
      </div>
      
      <div class="form-group" id="closure-reason-group" style="display: none;">
        <label class="form-label">سبب عدم وجود جلسة تالية <span class="required">*</span></label>
        <select class="form-select" id="session-closure-reason">
          <option value="">اختر السبب</option>
          ${rt.map(i=>`<option value="${i}" ${o?.closureReason===i?"selected":""}>${i}</option>`).join("")}
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea class="form-textarea" id="session-notes">${o?.notes||""}</textarea>
      </div>
      
      <div id="session-action-preview" class="mt-4" style="display:none;">
        <div class="risk-flag medium">
          <span class="risk-icon"><i class='bx bxs-zap'></i></span>
          <span id="action-preview-text"></span>
        </div>
      </div>
      
      <div id="session-form-errors" class="form-error mt-4" style="display:none;"></div>
    </form>
  `,f=`
    <button class="btn btn-primary" id="save-session-btn">${m?"✓ حفظ وإغلاق الجلسة":d?"💾 حفظ":"✓ حفظ الجلسة وإنشاء الإجراء"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;_(`${m?"إغلاق":d?"تعديل":"إضافة"} ${r}`,y,{footer:f,large:!0});function h(){const i=document.getElementById("session-decision").value,b=pe(i),E=document.getElementById("session-action-preview"),u=document.getElementById("action-preview-text"),I=document.getElementById("next-date-required"),x=document.getElementById("closure-reason-group"),k=document.getElementById("next-date-group"),A=b?b.requiresNextDate:!1;b?(E.style.display="block",u.textContent=`سيتم إنشاء إجراء تلقائي: ${b.actionType}`,b.subTasks?.length>0&&(u.textContent+=` (${b.subTasks.length} مهام فرعية)`)):E.style.display="none",A?(k.style.display="block",I.style.display="inline",x.style.display="none"):i?(k.style.display="block",I.style.display="none",m?x.style.display="block":x.style.display="none"):(k.style.display="block",I.style.display="inline",x.style.display="none")}document.getElementById("session-decision").addEventListener("change",h),h(),document.getElementById("save-session-btn").addEventListener("click",()=>{const i=document.getElementById("session-date").value,b=document.getElementById("session-type").value,E=document.getElementById("session-decision").value,u=document.getElementById("session-next-date").value,I=document.getElementById("session-closure-reason")?.value||"",x=document.getElementById("session-notes").value,k=[];i||k.push("تاريخ الجلسة مطلوب"),b||k.push("نوع الجلسة مطلوب"),m&&!E&&k.push("لا يمكن إغلاق الجلسة بدون تسجيل القرار/النتيجة"),!m&&!E&&k.push("نتيجة القرار مطلوبة");const A=pe(E),D=A?A.requiresNextDate:!1;if(D&&!u&&k.push("تاريخ الجلسة التالية مطلوب لهذا النوع من القرار"),m&&!D&&E&&!u&&!I&&k.push("يجب اختيار سبب عدم وجود جلسة تالية لإغلاق الجلسة"),k.length>0){const B=document.getElementById("session-form-errors");B.style.display="block",B.innerHTML=k.join("<br>");return}const C=m?"مغلق":o?.status||"مفتوح",v=xe({caseId:e,date:i,sessionType:b,decisionResult:E,nextSessionDate:u,status:C,closureReason:m?I:o?.closureReason||"",notes:x});let S;if(d?(c.update(l.SESSIONS,o.id,v),N(l.SESSIONS,o.id,"update",v),S={...o,...v}):(S=c.create(l.SESSIONS,v),N(l.SESSIONS,S.id,"create",v)),u&&c.query(l.SESSIONS,L=>L.caseId===e&&L.date===u&&L.id!==S.id).length===0){const L=xe({caseId:e,date:u,sessionType:b,decisionResult:"",nextSessionDate:"",status:"مفتوح",closureReason:"",notes:"جلسة تالية – تم إنشاؤها تلقائياً"}),R=c.create(l.SESSIONS,L);N(l.SESSIONS,R.id,"create",{auto:!0,fromSession:S.id})}let T=!1;if(A)try{if(c.query(l.ACTIONS,L=>L.sessionId===S.id&&L.actionType===A.actionType).length===0){const L=c.getById(l.CASES,e),R=ye({caseId:e,sessionId:S.id,actionType:A.actionType,responsibleUserId:L?.ownerId||"",status:"مفتوح",subTasks:A.subTasks?A.subTasks.map(F=>({...F})):[],dueDate:u||"",notes:A.executionProof?`إثبات التنفيذ المطلوب: ${A.executionProof}`:""}),H=c.create(l.ACTIONS,R);N(l.ACTIONS,H.id,"create",{auto:!0,decision:E,sessionId:S.id}),T=!0,console.log("Action automatically created:",H)}else console.log("Action of this type already exists for this session, skipping creation.")}catch(B){console.error("Error creating action:",B),w("حدث خطأ أثناء إنشاء الإجراء التلقائي","error")}w(T?`تم ${m?"إغلاق":"حفظ"} الجلسة وإنشاء إجراء: ${A.actionType}`:m?"تم إغلاق الجلسة بنجاح":"تم حفظ الجلسة","success"),!d&&Ct(E)&&c.getById(l.CASES,e)&&w("يمكنك الآن إنشاء قضية محكمة مرتبطة من صفحة القضايا","info",5e3),O(),G(a,n)})}function Ut(e,t,s){const a=c.getById(l.ACTIONS,e);if(!a)return;const n=`
    <form id="complete-action-form">
      <div class="mb-4">
        <strong>نوع الإجراء:</strong> ${a.actionType}
      </div>
      ${a.notes?`<div class="text-sm text-secondary mb-4">${a.notes}</div>`:""}
      
      <div class="form-group">
        <label class="form-label">تاريخ التنفيذ <span class="required">*</span></label>
        <input type="date" class="form-input" id="action-exec-date" required />
      </div>
      
      <div class="form-group">
        <label class="form-label">تفاصيل التنفيذ / إثبات <span class="required">*</span></label>
        <textarea class="form-textarea" id="action-exec-details" required placeholder="أدخل تفاصيل التنفيذ والإثبات (مثل: رقم المحضر، مرجع التصريح، إيصال التقديم...)"></textarea>
      </div>
      
      <div id="complete-action-errors" class="form-error" style="display:none;"></div>
    </form>
  `;_("إكمال الإجراء",n,{footer:`
    <button class="btn btn-primary" id="confirm-complete-action">✓ تأكيد الإكمال</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("confirm-complete-action").addEventListener("click",()=>{const p=document.getElementById("action-exec-date").value,d=document.getElementById("action-exec-details").value.trim();if(!p||!d){const g=document.getElementById("complete-action-errors");g.style.display="block",g.innerHTML="تاريخ التنفيذ وتفاصيل التنفيذ مطلوبان",w("لا يمكن إكمال الإجراء بدون بيانات التنفيذ","error");return}c.update(l.ACTIONS,e,{status:"مكتمل",executionDate:p,executionDetails:d}),N(l.ACTIONS,e,"complete",{executionDate:p}),w("تم إكمال الإجراء بنجاح","success"),O(),G(t,s)})}function Rt(e,t,s,a){const n=`
    <form id="deadline-modal-form">
      <div class="form-group">
        <label class="form-label">نوع الموعد النهائي <span class="required">*</span></label>
        <select class="form-select" id="deadline-type" required>
          <option value="">اختر النوع</option>
          ${ze.map(p=>`<option value="${p}">${p}</option>`).join("")}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ البداية <span class="required">*</span></label>
          <input type="date" class="form-input" id="deadline-start" required />
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ النهاية <span class="required">*</span></label>
          <input type="date" class="form-input" id="deadline-end" required />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">المسؤول <span class="required">*</span></label>
        <select class="form-select" id="deadline-responsible" required>
          <option value="">اختر المسؤول</option>
          ${t.map(p=>`<option value="${p.id}">${p.name}</option>`).join("")}
        </select>
      </div>
      <div id="deadline-form-errors" class="form-error" style="display:none;"></div>
    </form>
  `;_("إضافة موعد نهائي",n,{footer:`
    <button class="btn btn-primary" id="save-deadline-btn">✓ إضافة الموعد</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-deadline-btn").addEventListener("click",()=>{const p=document.getElementById("deadline-type").value,d=document.getElementById("deadline-start").value,g=document.getElementById("deadline-end").value,r=document.getElementById("deadline-responsible").value;if(!p||!d||!g||!r){document.getElementById("deadline-form-errors").style.display="block",document.getElementById("deadline-form-errors").innerHTML="جميع الحقول مطلوبة";return}const m=bt({caseId:e,deadlineType:p,startDate:d,endDate:g,responsibleUserId:r}),y=c.create(l.DEADLINES,m);N(l.DEADLINES,y.id,"create",m),w("تم إضافة الموعد النهائي","success"),O(),G(s,a)})}function Ht(e,t,s){_("إكمال الموعد النهائي",`
    <form id="complete-deadline-form">
      <div class="form-group">
        <label class="form-label">ملاحظة الإكمال <span class="required">*</span></label>
        <textarea class="form-textarea" id="deadline-completion-note" required placeholder="أدخل ملاحظة الإكمال..."></textarea>
      </div>
      <div id="deadline-complete-errors" class="form-error" style="display:none;"></div>
    </form>
  `,{footer:`
    <button class="btn btn-primary" id="confirm-complete-deadline">✓ تأكيد الإكمال</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("confirm-complete-deadline").addEventListener("click",()=>{const o=document.getElementById("deadline-completion-note").value.trim();if(!o){document.getElementById("deadline-complete-errors").style.display="block",document.getElementById("deadline-complete-errors").innerHTML="ملاحظة الإكمال مطلوبة";return}c.update(l.DEADLINES,e,{status:"مكتمل",completionNote:o}),N(l.DEADLINES,e,"complete",{completionNote:o}),w("تم إكمال الموعد النهائي","success"),O(),G(t,s)})}function X(e){P("الإجراءات");const t=U(),s=t?Z(t):null,a=s==="lawyer"||s==="trainee";let n=c.getAll(l.ACTIONS);a&&t&&(n=n.filter(i=>i.responsibleUserId===t.id));const o=c.getAll(l.CASES),p=c.getAll(l.CLIENTS),d=c.getAll(l.USERS);function g(){if(!a)return p;const i=new Set;return o.forEach(b=>{const E=b.ownerId===(t&&t.id),u=n.some(I=>I.caseId===b.id&&I.responsibleUserId===(t&&t.id));(E||u)&&(b.primaryClientId&&i.add(b.primaryClientId),b.clientId&&i.add(b.clientId),(b.clientIds||[]).forEach(I=>i.add(I)))}),p.filter(b=>i.has(b.id))}const r=g();e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-zap'></i> الإجراءات</h1>
          <div class="page-header-sub">
            ${n.filter(i=>i.status!=="مكتمل").length} إجراء مفتوح من ${n.length} إجمالي${a?" (مهامي فقط)":""}
          </div>
        </div>
        <button class="btn btn-primary" id="global-create-action-btn"><i class='bx bx-plus'></i> إنشاء إجراء</button>
      </div>

      <div class="filter-bar">
        <div class="search-input">
          <span class="search-icon">🔍</span>
          <input type="text" id="action-search" placeholder="بحث بالعميل، القضية، النوع..." />
        </div>
        <select class="filter-select" id="filter-action-type">
          <option value="">كل الأنواع</option>
          ${ee().map(i=>`<option value="${i}">${i}</option>`).join("")}
        </select>
        <select class="filter-select" id="filter-action-status">
          <option value="">كل الحالات</option>
          <option value="مفتوح">مفتوح</option>
          <option value="قيد التنفيذ">قيد التنفيذ</option>
          <option value="مكتمل">مكتمل</option>
          <option value="معلق">معلق</option>
        </select>
        <select class="filter-select" id="filter-action-scope">
          <option value="">كل الإجراءات</option>
          <option value="case">مرتبطة بقضية</option>
          <option value="client">على مستوى العميل</option>
        </select>
        ${a?"":`
        <select class="filter-select" id="filter-responsible">
          <option value="">كل المحامين</option>
          ${d.map(i=>`<option value="${i.id}">${i.name} (${i.role})</option>`).join("")}
        </select>`}
      </div>

      <div id="actions-container"></div>
    </div>
  `;function m(){const i=document.getElementById("action-search").value.toLowerCase(),b=document.getElementById("filter-action-type").value,E=document.getElementById("filter-action-status").value,u=document.getElementById("filter-action-scope").value,I=a?"":document.getElementById("filter-responsible")?.value||"";let x=n;b&&(x=x.filter(D=>D.actionType===b)),E&&(x=x.filter(D=>D.status===E)),u==="case"&&(x=x.filter(D=>!!D.caseId)),u==="client"&&(x=x.filter(D=>!D.caseId)),I&&(x=x.filter(D=>D.responsibleUserId===I)),i&&(x=x.filter(D=>{const C=D.caseId?c.getById(l.CASES,D.caseId):null,v=D.clientId?c.getById(l.CLIENTS,D.clientId):null;return D.actionType.toLowerCase().includes(i)||D.title&&D.title.toLowerCase().includes(i)||D.notes&&D.notes.toLowerCase().includes(i)||C&&(C.caseNo.includes(i)||C.subject.toLowerCase().includes(i))||v&&v.name.toLowerCase().includes(i)}));const k={};x.forEach(D=>{const C=D.actionType||"غير محدد";k[C]||(k[C]=[]),k[C].push(D)});const A=document.getElementById("actions-container");if(Object.keys(k).length===0){A.innerHTML='<div class="empty-state"><p>لا توجد إجراءات</p></div>';return}A.innerHTML=Object.entries(k).map(([D,C])=>`
      <div class="action-group">
        <div class="action-group-header">
          <span class="action-group-icon"><i class='bx bxs-zap'></i></span>
          <span class="action-group-title">${D}</span>
          <span class="action-group-count">${C.length}</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>العميل</th>
                <th>القضية</th>
                <th>الوصف</th>
                <th>المسؤول</th>
                <th>الحالة</th>
                <th>الأولوية</th>
                <th>تاريخ الاستحقاق</th>
                <th>إجراء</th>
              </tr>
            </thead>
            <tbody>
              ${C.map(v=>{const S=v.caseId?c.getById(l.CASES,v.caseId):null,B=(v.clientId?c.getById(l.CLIENTS,v.clientId):null)||(S?c.getById(l.CLIENTS,S.primaryClientId||S.clientId):null),L=c.getById(l.USERS,v.responsibleUserId),R=Re[v.status]||"open",H=v.dueDate&&ne(v.dueDate)&&v.status!=="مكتمل",F=!v.caseId,z=ae(),M=t&&v.responsibleUserId===t.id,le=!a||F||t&&S&&(S.ownerId===t.id||v.responsibleUserId===t.id),et=z?`<button class="btn btn-ghost btn-sm action-edit-btn" data-id="${v.id}" title="تعديل شامل"><i class='bx bx-edit'></i> تعديل</button>`:"",tt=!z&&M&&v.status!=="مكتمل"?`<button class="btn btn-primary btn-sm action-progress-btn" data-id="${v.id}"><i class='bx bxs-zap'></i> تحديث التقدم</button>`:"",st=S&&le?`<button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${v.caseId}'">عرض القضية ←</button>`:S&&!le?'<span class="text-secondary text-xs">لا يوجد وصول</span>':"";return`
                  <tr class="${H?"risk-flag high":""}">
                    <td>
                      <span class="text-sm font-semibold">${B?B.name:"—"}</span>
                    </td>
                    <td>
                      ${S?le?`<a href="#/cases/${v.caseId}" style="color:var(--text-link);">${S.caseNo}/${S.year}</a>`:`<span class="text-secondary">${S.caseNo}/${S.year}</span>`:'<span class="badge badge-open" style="font-size:10px;">مستوى العميل</span>'}
                    </td>
                    <td class="text-sm">${v.title||"—"}</td>
                    <td>${L?L.name:"—"}</td>
                    <td>
                      <span class="badge badge-${R}">${v.status}</span>
                      ${H?'<span class="badge badge-blocked">متأخر</span>':""}
                    </td>
                    <td>${v.priority?`<span class="badge badge-progress">${v.priority}</span>`:"—"}</td>
                    <td>${j(v.dueDate)}</td>
                    <td>
                      <div class="flex gap-2" style="align-items:center;">
                        ${et}
                        ${tt}
                        ${st}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `).join("")}m();function y(){document.querySelectorAll(".action-edit-btn").forEach(i=>{i.addEventListener("click",()=>{We(i.dataset.id,()=>X(e))})}),document.querySelectorAll(".action-progress-btn").forEach(i=>{i.addEventListener("click",()=>{_t(i.dataset.id,()=>X(e))})})}const $=m;function f(){$(),y()}document.getElementById("action-search").removeEventListener("input",m),document.getElementById("action-search").addEventListener("input",f),document.getElementById("filter-action-type").removeEventListener("change",m),document.getElementById("filter-action-type").addEventListener("change",f),document.getElementById("filter-action-status").removeEventListener("change",m),document.getElementById("filter-action-status").addEventListener("change",f),document.getElementById("filter-action-scope").removeEventListener("change",m),document.getElementById("filter-action-scope").addEventListener("change",f),a||document.getElementById("filter-responsible")?.addEventListener("change",f),y(),e.querySelector("#global-create-action-btn")?.addEventListener("click",()=>{Ft(r,o,d,a,t,e)});function h(){X(e)}e._refreshActionList=h}function Ft(e,t,s,a,n,o){const p=s.filter(h=>h.active&&ve.includes(h.role)),g=`
    <form id="global-action-form" autocomplete="off">

      <!-- Client + Case row -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">العميل <span class="required">*</span></label>
          <!-- Searchable client: text filter above select -->
          <input type="text" class="form-input mb-2" id="gca-client-search"
                 placeholder="ابحث بالاسم..." autocomplete="off" />
          <select class="form-select" id="gca-client" required>
            <option value="">اختر العميل...</option>
            ${e.map(h=>`<option value="${h.id}">${h.name}</option>`).join("")}
          </select>
          <div class="form-hint">الإجراء لا يُحفظ بدون تحديد العميل</div>
        </div>

        <div class="form-group">
          <label class="form-label">القضية <span class="form-optional">(اختياري)</span></label>
          <select class="form-select" id="gca-case" disabled>
            <option value="">اختر العميل أولاً...</option>
          </select>
          <div class="form-hint" id="gca-case-hint">اختر العميل لتحميل قضاياه</div>
        </div>
      </div>

      <!-- Type + Priority row -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">نوع الإجراء <span class="required">*</span></label>
          <select class="form-select" id="gca-action-type" required>
            <option value="">اختر النوع</option>
            ${ee().map(h=>`<option value="${h}">${h}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية <span class="form-optional">(اختياري)</span></label>
          <select class="form-select" id="gca-priority">
            <option value="">بدون أولوية</option>
            ${be.map(h=>`<option value="${h}">${h}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Title (required for global actions) -->
      <div class="form-group">
        <label class="form-label">عنوان / وصف الإجراء <span class="required">*</span></label>
        <input type="text" class="form-input" id="gca-title" required
               placeholder="وصف مختصر وواضح للإجراء المطلوب..." />
      </div>

      <!-- Responsible + Due Date row -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المحامي المسؤول <span class="required">*</span></label>
          <select class="form-select" id="gca-responsible" required>
            <option value="">اختر المحامي المسؤول</option>
            ${p.map(h=>`<option value="${h.id}">${h.name} (${h.role})</option>`).join("")}
          </select>
          <div class="form-hint">يُعرض المستخدمون النشطون فقط</div>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق <span class="form-optional">(اختياري)</span></label>
          <input type="date" class="form-input" id="gca-due-date" />
        </div>
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">ملاحظات <span class="form-optional">(اختياري)</span></label>
        <textarea class="form-textarea" id="gca-notes"
                  placeholder="أي معلومات إضافية متعلقة بالإجراء..."></textarea>
      </div>

      <div id="gca-errors" class="form-error mt-4" style="display:none;"></div>
    </form>
  `;_("إنشاء إجراء جديد",g,{footer:`
    <button class="btn btn-primary" id="gca-save-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `,large:!0});const m=document.getElementById("gca-client-search"),y=document.getElementById("gca-client"),$=document.getElementById("gca-case"),f=document.getElementById("gca-case-hint");Array.from(y.options),m.addEventListener("input",()=>{const h=m.value.trim().toLowerCase();y.innerHTML='<option value="">اختر العميل...</option>',e.filter(b=>b.name.toLowerCase().includes(h)).forEach(b=>{const E=document.createElement("option");E.value=b.id,E.textContent=b.name,y.appendChild(E)})}),y.addEventListener("change",()=>{const h=y.value;if($.innerHTML="",$.disabled=!0,!h){$.innerHTML='<option value="">اختر العميل أولاً...</option>',f.textContent="اختر العميل لتحميل قضاياه";return}const i=t.filter(E=>(E.clientIds||(E.clientId?[E.clientId]:[])).includes(h)||E.primaryClientId===h||E.clientId===h),b=a&&n?i.filter(E=>E.ownerId===n.id||c.getAll(l.ACTIONS).some(u=>u.caseId===E.id&&u.responsibleUserId===n.id)):i;$.innerHTML='<option value="">بدون قضية (إجراء على مستوى العميل)</option>',b.forEach(E=>{const u=document.createElement("option");u.value=E.id,u.textContent=`${E.caseNo}/${E.year} – ${E.subject}`,u.dataset.ownerId=E.ownerId||"",$.appendChild(u)}),$.disabled=!1,f.textContent=b.length===0?"لا توجد قضايا متاحة لهذا العميل":`${b.length} قضية – اختياري`}),$.addEventListener("change",()=>{const i=$.options[$.selectedIndex]?.dataset?.ownerId;if(i){const b=document.getElementById("gca-responsible");b&&Array.from(b.options).find(u=>u.value===i)&&(b.value=i)}}),document.getElementById("gca-save-btn").addEventListener("click",()=>{const h=document.getElementById("gca-client").value,i=document.getElementById("gca-case").value,b=document.getElementById("gca-action-type").value,E=document.getElementById("gca-title").value.trim(),u=document.getElementById("gca-priority").value,I=document.getElementById("gca-responsible").value,x=document.getElementById("gca-due-date").value,k=document.getElementById("gca-notes").value.trim(),A=[];if(h||A.push("العميل مطلوب – لا يمكن حفظ الإجراء بدون تحديد العميل"),b||A.push("نوع الإجراء مطلوب"),E||A.push("عنوان / وصف الإجراء مطلوب"),I||A.push("المحامي المسؤول مطلوب"),i){const T=c.getById(l.CASES,i);T&&((T.clientIds||(T.clientId?[T.clientId]:[])).includes(h)||T.primaryClientId===h||T.clientId===h||A.push("القضية المختارة لا تنتمي للعميل المحدد"))}if(A.length>0){const T=document.getElementById("gca-errors");T.style.display="block",T.innerHTML=A.join("<br>");return}const D=ye({clientId:h,caseId:i||"",sessionId:"",actionType:b,title:E,priority:u,responsibleUserId:I,status:"مفتوح",dueDate:x,notes:k}),C=c.create(l.ACTIONS,D);N(l.ACTIONS,C.id,"create",{source:"global",clientId:h,caseId:i||null,actionType:b,responsibleUserId:I});const v=c.getById(l.CLIENTS,h)?.name||"";w(`تم إنشاء الإجراء: ${b} – ${v} (${i?"ضمن القضية":"على مستوى العميل"})`,"success"),O(),X(o)})}function zt(e){P("المواعيد النهائية");const t=c.getAll(l.DEADLINES);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-time'></i> المواعيد النهائية</h1>
          <div class="page-header-sub">${t.filter(a=>a.status==="مفتوح").length} موعد مفتوح</div>
        </div>
      </div>
      
      <div class="filter-bar">
        <select class="filter-select" id="filter-dl-type">
          <option value="">كل الأنواع</option>
          ${ze.map(a=>`<option value="${a}">${a}</option>`).join("")}
        </select>
        <select class="filter-select" id="filter-dl-status">
          <option value="">كل الحالات</option>
          <option value="مفتوح">مفتوح</option>
          <option value="مكتمل">مكتمل</option>
          <option value="منتهي">منتهي</option>
        </select>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>النوع</th>
              <th>القضية</th>
              <th>من</th>
              <th>إلى</th>
              <th>المتبقي</th>
              <th>المسؤول</th>
              <th>الحالة</th>
              <th>إجراء</th>
            </tr>
          </thead>
          <tbody id="dl-table-body">
          </tbody>
        </table>
      </div>
    </div>
  `;function s(){const a=document.getElementById("filter-dl-type").value,n=document.getElementById("filter-dl-status").value;let o=t;a&&(o=o.filter(d=>d.deadlineType===a)),n&&(o=o.filter(d=>d.status===n)),o.sort((d,g)=>new Date(d.endDate)-new Date(g.endDate));const p=document.getElementById("dl-table-body");if(o.length===0){p.innerHTML='<tr><td colspan="8"><div class="empty-state"><p>لا توجد مواعيد نهائية</p></div></td></tr>';return}p.innerHTML=o.map(d=>{const g=c.getById(l.CASES,d.caseId),r=c.getById(l.USERS,d.responsibleUserId),m=He[d.status]||"open",y=J(d.endDate),$=d.status==="مفتوح"&&y<0,f=d.status==="مفتوح"&&y>=0&&y<=3;return`
        <tr class="${$?"risk-flag high":f?"risk-flag medium":""}">
          <td><strong>${d.deadlineType}</strong></td>
          <td>
            <a href="#/cases/${d.caseId}" style="color: var(--text-link);">
              ${g?g.caseNo+"/"+g.year:"—"}
            </a>
          </td>
          <td>${j(d.startDate)}</td>
          <td>${j(d.endDate)}</td>
          <td>
            ${d.status==="مفتوح"?$?`<span class="badge badge-blocked">متأخر ${Math.abs(y)} يوم</span>`:y===0?'<span class="badge badge-progress">اليوم!</span>':`<span class="badge ${f?"badge-progress":"badge-open"}">${y} يوم</span>`:"—"}
          </td>
          <td>${r?r.name:"—"}</td>
          <td><span class="badge badge-${m}">${d.status}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${d.caseId}'">عرض ←</button>
          </td>
        </tr>
      `}).join("")}s(),document.getElementById("filter-dl-type").addEventListener("change",s),document.getElementById("filter-dl-status").addEventListener("change",s)}function ge(e){if(P("ربط القرارات بالإجراءات"),!Q()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=fe();e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-cog'></i> ربط القرارات بالإجراءات</h1>
          <div class="page-header-sub">إعدادات الربط التلقائي بين قرارات الجلسات والإجراءات المطلوبة</div>
        </div>
        <button class="btn btn-primary" id="add-mapping-btn"><i class='bx bx-plus'></i> إضافة ربط</button>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>نوع القرار</th>
              <th>الإجراء المنشأ تلقائياً</th>
              <th>إثبات التنفيذ</th>
              <th>يتطلب تاريخ تالي</th>
              <th>مهام فرعية</th>
              <th>عاجل</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(s=>`
              <tr>
                <td><strong>${s.decisionType}</strong></td>
                <td><span class="badge badge-open">${s.actionType}</span></td>
                <td class="text-sm">${s.executionProof||"—"}</td>
                <td>${s.requiresNextDate?"✅":"❌"}</td>
                <td>${s.subTasks?.length>0?`${s.subTasks.length} مهام`:"—"}</td>
                <td>${s.urgent?"<i class='bx bxs-circle'></i>":"—"}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-mapping" data-id="${s.id}"><i class='bx bx-edit'></i></button>
                    <button class="btn btn-ghost btn-sm delete-mapping" data-id="${s.id}"><i class='bx bx-trash'></i></button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,e.querySelector("#add-mapping-btn").addEventListener("click",()=>{Ae(null,e)}),e.querySelectorAll(".edit-mapping").forEach(s=>{s.addEventListener("click",()=>{const a=t.find(n=>n.id===s.dataset.id);a&&Ae(a,e)})}),e.querySelectorAll(".delete-mapping").forEach(s=>{s.addEventListener("click",()=>{Bt(s.dataset.id),w("تم حذف الربط","success"),ge(e)})})}function Ae(e,t){const s=!!e,a=Ve(),n=ee(),o=`
    <form id="mapping-form">
      <div class="form-group">
        <label class="form-label">نوع القرار <span class="required">*</span></label>
        <select class="form-select" id="map-decision" required>
          <option value="">اختر</option>
          ${a.map(d=>`<option value="${d}" ${e?.decisionType===d?"selected":""}>${d}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">الإجراء المنشأ <span class="required">*</span></label>
        <select class="form-select" id="map-action" required>
          <option value="">اختر</option>
          ${n.map(d=>`<option value="${d}" ${e?.actionType===d?"selected":""}>${d}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">إثبات التنفيذ المطلوب</label>
        <input type="text" class="form-input" id="map-proof" value="${e?.executionProof||""}" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="map-requires-date" ${e?.requiresNextDate!==!1?"checked":""} />
            <span>يتطلب تاريخ جلسة تالية</span>
          </label>
        </div>
        <div class="form-group">
          <label class="form-checkbox">
            <input type="checkbox" id="map-urgent" ${e?.urgent?"checked":""} />
            <span>إجراء عاجل</span>
          </label>
        </div>
      </div>
    </form>
  `;_(s?"تعديل الربط":"إضافة ربط جديد",o,{footer:`
    <button class="btn btn-primary" id="save-mapping">${s?"💾 حفظ":"✓ إضافة"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-mapping").addEventListener("click",()=>{const d={decisionType:document.getElementById("map-decision").value,actionType:document.getElementById("map-action").value,executionProof:document.getElementById("map-proof").value,requiresNextDate:document.getElementById("map-requires-date").checked,urgent:document.getElementById("map-urgent").checked};if(!d.decisionType||!d.actionType){w("نوع القرار والإجراء مطلوبان","error");return}s?Lt(e.id,d):At(d),w(s?"تم تحديث الربط":"تم إضافة الربط","success"),O(),ge(t)})}const Xe="/api";function Ze(e){if(P("إدارة المستخدمين"),!Q()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=c.getAll(l.USERS);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-user-detail'></i> إدارة المستخدمين</h1>
          <div class="page-header-sub">${t.length} مستخدم</div>
        </div>
        <button class="btn btn-primary" id="add-user-btn"><i class='bx bx-plus'></i> إضافة مستخدم</button>
      </div>

      <div class="card" style="margin-bottom:16px; padding:14px 18px; background:var(--bg-card); border:1px solid var(--border-primary); border-radius:var(--radius-md);">
        <div style="display:flex; align-items:center; gap:10px; color:var(--text-secondary); font-size:var(--text-sm);">
          <i class='bx bx-info-circle' style="font-size:18px; color:var(--accent-primary);"></i>
          <span>لإضافة مستخدم جديد: أضف المستخدم وعيّن له كلمة مرور مباشرةً. المستخدم يمكنه تغيير كلمة مروره بعد تسجيل الدخول من أيقونة حسابه في الشريط العلوي.</span>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الدور</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>الحالة</th>
              <th>كلمة المرور</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${t.map(s=>`
              <tr>
                <td><strong>${s.name}</strong></td>
                <td><span class="badge badge-open">${s.role}</span></td>
                <td>${s.email||"—"}</td>
                <td>${s.phone||"—"}</td>
                <td><span class="badge ${s.active?"badge-active":"badge-expired"}">${s.active?"نشط":"غير نشط"}</span></td>
                <td>
                  <button class="btn btn-ghost btn-sm set-password-btn" data-id="${s.id}" data-name="${s.name}" title="تعيين كلمة مرور">
                    <i class='bx bx-key'></i> تعيين كلمة مرور
                  </button>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-user" data-id="${s.id}" title="تعديل"><i class='bx bx-edit'></i></button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,e.querySelector("#add-user-btn").addEventListener("click",()=>Be(null,e)),e.querySelectorAll(".edit-user").forEach(s=>{s.addEventListener("click",()=>{const a=c.getById(l.USERS,s.dataset.id);a&&Be(a,e)})}),e.querySelectorAll(".set-password-btn").forEach(s=>{s.addEventListener("click",()=>{Yt(s.dataset.id,s.dataset.name)})})}async function Yt(e,t){const s=`
    <div style="margin-bottom:12px; color:var(--text-secondary); font-size:var(--text-sm);">
      تعيين كلمة مرور جديدة للمستخدم: <strong style="color:var(--text-primary);">${t}</strong>
    </div>
    <div class="form-group">
      <label class="form-label">كلمة المرور الجديدة <span class="required">*</span></label>
      <input type="password" class="form-input" id="adm-pw" placeholder="8 أحرف على الأقل" autocomplete="new-password" />
    </div>
    <div class="form-group">
      <label class="form-label">تأكيد كلمة المرور <span class="required">*</span></label>
      <input type="password" class="form-input" id="adm-pw-confirm" placeholder="••••••••" autocomplete="new-password" />
    </div>
    <div id="adm-pw-error" class="form-error" style="display:none;"></div>
  `;_("تعيين كلمة مرور",s,{footer:`
    <button class="btn btn-primary" id="adm-pw-save"><i class='bx bx-check'></i> تعيين كلمة المرور</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("adm-pw-save").addEventListener("click",async()=>{const n=document.getElementById("adm-pw").value,o=document.getElementById("adm-pw-confirm").value,p=document.getElementById("adm-pw-error");if(p.style.display="none",!n||n.length<8){p.textContent="كلمة المرور يجب أن تكون 8 أحرف على الأقل",p.style.display="block";return}if(n!==o){p.textContent="كلمتا المرور غير متطابقتين",p.style.display="block";return}const d=document.getElementById("adm-pw-save");d.disabled=!0,d.textContent="جارٍ الحفظ...";try{const g=await fetch(`${Xe}/auth/admin-set-password`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${ie()}`},body:JSON.stringify({userId:e,password:n})}),r=await g.json();if(!g.ok){p.textContent=r.error||"حدث خطأ",p.style.display="block",d.disabled=!1,d.innerHTML="<i class='bx bx-check'></i> تعيين كلمة المرور";return}w(`✅ تم تعيين كلمة مرور ${t} بنجاح`,"success"),O()}catch{p.textContent="تعذر الاتصال بالخادم",p.style.display="block",d.disabled=!1,d.innerHTML="<i class='bx bx-check'></i> تعيين كلمة المرور"}})}function Be(e,t){const s=!!e,a=`
    <form>
      <div class="form-group">
        <label class="form-label">الاسم <span class="required">*</span></label>
        <input type="text" class="form-input" id="user-name" value="${e?.name||""}" required />
      </div>
      <div class="form-group">
        <label class="form-label">الدور <span class="required">*</span></label>
        <select class="form-select" id="user-role" required>
          ${ut.map(o=>`<option value="${o}" ${e?.role===o?"selected":""}>${o}</option>`).join("")}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">البريد الإلكتروني</label>
          <input type="email" class="form-input" id="user-email" value="${e?.email||""}" />
        </div>
        <div class="form-group">
          <label class="form-label">الهاتف</label>
          <input type="text" class="form-input" id="user-phone" value="${e?.phone||""}" />
        </div>
      </div>
      ${s?`
      <div class="form-group">
        <label class="form-checkbox">
          <input type="checkbox" id="user-active" ${e?.active?"checked":""} />
          <span>مستخدم نشط</span>
        </label>
      </div>
      `:`
      <div style="background:var(--bg-input); border:1px solid var(--border-primary); border-radius:var(--radius-md); padding:14px; margin-top:4px;">
        <div style="font-size:var(--text-sm); font-weight:600; color:var(--text-primary); margin-bottom:10px;">
          <i class='bx bx-key'></i> كلمة المرور الأولية
        </div>
        <div class="form-row">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">كلمة المرور <span class="required">*</span></label>
            <input type="password" class="form-input" id="user-password" placeholder="8 أحرف على الأقل" autocomplete="new-password" />
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">تأكيد كلمة المرور <span class="required">*</span></label>
            <input type="password" class="form-input" id="user-password-confirm" placeholder="••••••••" autocomplete="new-password" />
          </div>
        </div>
      </div>
      `}
      <div id="user-form-error" class="form-error" style="display:none; margin-top:8px;"></div>
    </form>
  `;_(s?"تعديل المستخدم":"إضافة مستخدم جديد",a,{footer:`
    <button class="btn btn-primary" id="save-user">${s?"💾 حفظ":"✓ إضافة المستخدم"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-user").addEventListener("click",async()=>{const o=document.getElementById("user-form-error");o.style.display="none";const p=document.getElementById("user-name").value.trim(),d=document.getElementById("user-role").value,g=document.getElementById("user-email").value.trim(),r=document.getElementById("user-phone").value.trim(),m=s?document.getElementById("user-active")?.checked:!0;if(!p){o.textContent="اسم المستخدم مطلوب",o.style.display="block";return}if(s){const y=Se({name:p,role:d,email:g,phone:r,active:m});c.update(l.USERS,e.id,y),N(l.USERS,e.id,"update",y),w("تم تحديث المستخدم","success")}else{const y=document.getElementById("user-password").value,$=document.getElementById("user-password-confirm").value;if(!y||y.length<8){o.textContent="كلمة المرور يجب أن تكون 8 أحرف على الأقل",o.style.display="block";return}if(y!==$){o.textContent="كلمتا المرور غير متطابقتين",o.style.display="block";return}const f=Se({name:p,role:d,email:g,phone:r,active:!0}),h=c.create(l.USERS,f);N(l.USERS,h.id,"create",f);try{const i=await fetch(`${Xe}/auth/admin-set-password`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${ie()}`},body:JSON.stringify({userId:h.id,password:y})});if(i.ok)w(`✅ تم إضافة ${p} وتعيين كلمة مروره بنجاح`,"success");else{const b=await i.json();w(`تم إنشاء المستخدم لكن فشل تعيين كلمة المرور: ${b.error}`,"warning")}}catch{w("تم إنشاء المستخدم لكن تعذر الاتصال بالخادم لتعيين كلمة المرور","warning")}}O(),Ze(t)})}function Jt(e){if(P("سجل المراجعة"),!Q()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=wt(100);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bx-list-check'></i> سجل المراجعة</h1>
          <div class="page-header-sub">آخر ${t.length} عملية</div>
        </div>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>التاريخ والوقت</th>
              <th>المستخدم</th>
              <th>العملية</th>
              <th>الكيان</th>
              <th>معرف الكيان</th>
            </tr>
          </thead>
          <tbody>
            ${t.length===0?'<tr><td colspan="5"><div class="empty-state"><p>لا توجد عمليات مسجلة</p></div></td></tr>':""}
            ${t.map(s=>{const a={clients:"عميل",cases:"قضية",sessions:"جلسة",actions:"إجراء",deadlines:"موعد نهائي",users:"مستخدم",decision_map:"ربط قرار"}[s.entityType]||s.entityType;return`
                <tr>
                  <td class="text-sm">${new Date(s.timestamp).toLocaleString("ar-EG",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                  <td>${s.userName||"—"}</td>
                  <td><span class="badge badge-${s.action==="create"?"open":s.action==="delete"?"blocked":"progress"}">${Tt(s.action)}</span></td>
                  <td>${a}</td>
                  <td class="text-xs" style="font-family: monospace; color: var(--text-tertiary);">${s.entityId?s.entityId.substr(0,12):"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Gt(e){if(P("إعدادات النظام"),!Q()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}se(e)}function se(e,t="notifications"){const s=c.getSetting("workdayEndTime")||"17:00",a=Nt(),n=qt();e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-cog'></i> إعدادات النظام</h1>
          <div class="page-header-sub">إدارة إعدادات النظام وقوائم القرارات والإجراءات</div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="settings-tabs" style="display:flex;gap:var(--space-2);margin-bottom:var(--space-6);border-bottom:2px solid var(--border-secondary);">
        <button class="settings-tab-btn ${t==="notifications"?"active":""}" data-tab="notifications"
          style="padding:var(--space-3) var(--space-5);background:none;border:none;cursor:pointer;
                 font-size:var(--text-sm);font-family:var(--font-primary);color:${t==="notifications"?"var(--accent-primary)":"var(--text-secondary)"};
                 border-bottom:2px solid ${t==="notifications"?"var(--accent-primary)":"transparent"};margin-bottom:-2px;transition:all var(--transition-fast);">
          🔔 إعدادات الإشعارات
        </button>
        <button class="settings-tab-btn ${t==="actions"?"active":""}" data-tab="actions"
          style="padding:var(--space-3) var(--space-5);background:none;border:none;cursor:pointer;
                 font-size:var(--text-sm);font-family:var(--font-primary);color:${t==="actions"?"var(--accent-primary)":"var(--text-secondary)"};
                 border-bottom:2px solid ${t==="actions"?"var(--accent-primary)":"transparent"};margin-bottom:-2px;transition:all var(--transition-fast);">
          ⚡ أنواع الإجراءات <span class="badge badge-open" style="font-size:10px;">${a.length}</span>
        </button>
        <button class="settings-tab-btn ${t==="decisions"?"active":""}" data-tab="decisions"
          style="padding:var(--space-3) var(--space-5);background:none;border:none;cursor:pointer;
                 font-size:var(--text-sm);font-family:var(--font-primary);color:${t==="decisions"?"var(--accent-primary)":"var(--text-secondary)"};
                 border-bottom:2px solid ${t==="decisions"?"var(--accent-primary)":"transparent"};margin-bottom:-2px;transition:all var(--transition-fast);">
          ⚖️ أنواع القرارات <span class="badge badge-open" style="font-size:10px;">${n.length}</span>
        </button>
      </div>

      <!-- Tab: Notifications -->
      <div id="tab-notifications" style="display:${t==="notifications"?"block":"none"}">
        <div class="card" style="max-width:600px;">
          <h3 class="mb-4" style="color:var(--accent-primary);">🔔 إعدادات الإشعارات</h3>
          <div class="form-group">
            <label class="form-label">وقت نهاية يوم العمل <span class="required">*</span></label>
            <input type="time" class="form-input" id="workday-end-time" value="${s}" style="max-width:200px;" />
            <div class="form-hint">سيتم عرض إشعار بالجلسات غير المكتملة عند هذا الوقت يومياً</div>
          </div>
          <div class="flex gap-3 mt-6">
            <button class="btn btn-primary" id="save-settings-btn">💾 حفظ الإعدادات</button>
          </div>
        </div>
      </div>

      <!-- Tab: Action Types -->
      <div id="tab-actions" style="display:${t==="actions"?"block":"none"}">
        ${Ce("action",a,"أنواع الإجراءات","⚡")}
      </div>

      <!-- Tab: Decision Types -->
      <div id="tab-decisions" style="display:${t==="decisions"?"block":"none"}">
        ${Ce("decision",n,"أنواع القرارات","⚖️")}
      </div>
    </div>`,e.querySelectorAll(".settings-tab-btn").forEach(o=>{o.addEventListener("click",()=>se(e,o.dataset.tab))}),e.querySelector("#save-settings-btn")?.addEventListener("click",()=>{const o=document.getElementById("workday-end-time").value;if(!o){w("وقت نهاية يوم العمل مطلوب","error");return}c.setSetting("workdayEndTime",o),w("تم حفظ الإعدادات بنجاح","success")}),Ne(e,"action",l.LOOKUP_ACTION_TYPES,()=>se(e,"actions")),Ne(e,"decision",l.LOOKUP_DECISION_TYPES,()=>se(e,"decisions"))}function Ce(e,t,s,a){return`
    <div class="card">
      <div class="flex gap-4 align-center mb-4" style="justify-content:space-between;flex-wrap:wrap;">
        <h3 style="color:var(--accent-primary);margin:0;">${a} ${s}</h3>
        <div class="flex gap-3 align-center" style="flex-wrap:wrap;">
          <input type="text" class="form-input" id="${e}-search"
                 placeholder="بحث..." style="max-width:200px;height:36px;padding:0 var(--space-3);" />
          <button class="btn btn-primary btn-sm" id="${e}-add-btn">
            <i class='bx bx-plus'></i> إضافة
          </button>
        </div>
      </div>

      <!-- Add row (hidden by default) -->
      <div id="${e}-add-row" style="display:none;margin-bottom:var(--space-4);">
        <div class="flex gap-3 align-center">
          <input type="text" class="form-input" id="${e}-add-input"
                 placeholder="اسم النوع الجديد..." style="flex:1;" />
          <button class="btn btn-primary btn-sm" id="${e}-add-confirm">✓ إضافة</button>
          <button class="btn btn-secondary btn-sm" id="${e}-add-cancel">إلغاء</button>
        </div>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:60px;">#</th>
              <th>الاسم</th>
              <th style="width:120px;">إجراءات</th>
            </tr>
          </thead>
          <tbody id="${e}-list">
            ${t.map((n,o)=>Kt(e,n,o+1)).join("")}
          </tbody>
        </table>
      </div>
      ${t.length===0?'<div class="empty-state"><p>لا توجد عناصر. أضف عنصراً جديداً.</p></div>':""}
    </div>`}function Kt(e,t,s){return`
    <tr data-id="${t.id}" class="${e}-row">
      <td class="text-secondary text-sm">${s}</td>
      <td>
        <span class="${e}-label">${t.label}</span>
        <input type="text" class="${e}-edit-input form-input" value="${t.label.replace(/"/g,"&quot;")}"
               style="display:none;width:100%;" />
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm ${e}-edit-btn" data-id="${t.id}" title="تعديل">
            <i class='bx bx-edit'></i>
          </button>
          <button class="btn btn-ghost btn-sm ${e}-save-btn" data-id="${t.id}"
                  style="display:none;color:var(--status-open);" title="حفظ">
            <i class='bx bx-check'></i>
          </button>
          <button class="btn btn-ghost btn-sm ${e}-cancel-btn" data-id="${t.id}"
                  style="display:none;" title="إلغاء">
            <i class='bx bx-x'></i>
          </button>
          <button class="btn btn-ghost btn-sm ${e}-delete-btn" data-id="${t.id}"
                  style="color:var(--risk-high);" title="حذف">
            <i class='bx bx-trash'></i>
          </button>
        </div>
      </td>
    </tr>`}function Ne(e,t,s,a){e.querySelector(`#${t}-search`)?.addEventListener("input",n=>{const o=n.target.value.toLowerCase();e.querySelectorAll(`.${t}-row`).forEach(p=>{const d=p.querySelector(`.${t}-label`)?.textContent?.toLowerCase()||"";p.style.display=d.includes(o)?"":"none"})}),e.querySelector(`#${t}-add-btn`)?.addEventListener("click",()=>{const n=e.querySelector(`#${t}-add-row`);n.style.display="block",e.querySelector(`#${t}-add-input`)?.focus()}),e.querySelector(`#${t}-add-cancel`)?.addEventListener("click",()=>{e.querySelector(`#${t}-add-row`).style.display="none",e.querySelector(`#${t}-add-input`).value=""}),e.querySelector(`#${t}-add-confirm`)?.addEventListener("click",()=>{const o=e.querySelector(`#${t}-add-input`)?.value?.trim();if(!o){w("الاسم مطلوب","error");return}Ot(s,o),w(`تمت إضافة "${o}"`,"success"),a()}),e.querySelectorAll(`.${t}-edit-btn`).forEach(n=>{n.addEventListener("click",()=>{const o=e.querySelector(`[data-id="${n.dataset.id}"].${t}-row`);o.querySelector(`.${t}-label`).style.display="none",o.querySelector(`.${t}-edit-input`).style.display="block",o.querySelector(`.${t}-edit-btn`).style.display="none",o.querySelector(`.${t}-delete-btn`).style.display="none",o.querySelector(`.${t}-save-btn`).style.display="inline-flex",o.querySelector(`.${t}-cancel-btn`).style.display="inline-flex",o.querySelector(`.${t}-edit-input`)?.focus()})}),e.querySelectorAll(`.${t}-cancel-btn`).forEach(n=>{n.addEventListener("click",()=>{const o=e.querySelector(`[data-id="${n.dataset.id}"].${t}-row`);o.querySelector(`.${t}-label`).style.display="",o.querySelector(`.${t}-edit-input`).style.display="none",o.querySelector(`.${t}-edit-btn`).style.display="inline-flex",o.querySelector(`.${t}-delete-btn`).style.display="inline-flex",o.querySelector(`.${t}-save-btn`).style.display="none",o.querySelector(`.${t}-cancel-btn`).style.display="none"})}),e.querySelectorAll(`.${t}-save-btn`).forEach(n=>{n.addEventListener("click",()=>{const p=e.querySelector(`[data-id="${n.dataset.id}"].${t}-row`).querySelector(`.${t}-edit-input`)?.value?.trim();if(!p){w("الاسم لا يمكن أن يكون فارغاً","error");return}Pt(s,n.dataset.id,p),w("تم التحديث","success"),a()})}),e.querySelectorAll(`.${t}-delete-btn`).forEach(n=>{n.addEventListener("click",()=>{if(!confirm("هل تريد حذف هذا العنصر؟"))return;const o=jt(s,n.dataset.id);o.ok&&(o.warning?w(o.warning,"warning",6e3):w("تم الحذف","success"),a())})})}function Vt(e){P("التقويم");let t=new Date;t.setDate(1);function s(){const n=t.getFullYear(),o=t.getMonth(),p=c.getAll(l.SESSIONS),d=c.getAll(l.DEADLINES).filter(v=>v.status==="مفتوح"),g=c.getAll(l.CASES),r=c.getAll(l.CLIENTS),m={};function y(v){if(!v)return"—";const S=v.clientIds||(v.clientId?[v.clientId]:[]),T=v.primaryClientId||v.clientId,B=r.find(L=>L.id===T);return S.length>1&&B?B.name+" وآخرون":B?B.name:"—"}function $(v){return v?v.split("T")[0]:null}function f(v,S,T,B){const L=$(v);if(!L)return;const[R,H]=L.split("-").map(Number);if(R!==n||H-1!==o)return;m[L]||(m[L]=[]);const F=g.find(M=>M.id===T),z=y(F);m[L].push({type:S,title:z,caseId:T,label:B})}p.forEach(v=>{v.date&&f(v.date,"session",v.caseId,"جلسة")}),d.forEach(v=>{v.endDate&&f(v.endDate,"deadline",v.caseId,"موعد نهائي")});const h=new Date(n,o,1),i=new Date(n,o+1,0),b=h.getDay(),E=i.getDate(),u=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],I=["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"],x=new Date().toISOString().split("T")[0],k=3;let A="";for(let v=0;v<b;v++)A+='<div class="cal-day cal-day-empty"></div>';for(let v=1;v<=E;v++){const S=String(o+1).padStart(2,"0"),T=String(v).padStart(2,"0"),B=`${n}-${S}-${T}`,L=m[B]||[],R=B===x,H=L.slice(0,k),F=L.length-k;let z=H.map(M=>`
                <div class="cal-event cal-event-${M.type}"
                     data-caseid="${M.caseId}"
                     title="${M.title} – ${M.label}"
                     style="cursor:pointer; user-select:none;">
                    <span class="cal-dot cal-dot-${M.type}"></span>
                    <span class="cal-event-title">${M.title}</span>
                    <span class="cal-event-label">${M.label}</span>
                </div>
            `).join("");F>0&&(z+=`<button class="cal-more-btn" data-date="${B}">+${F} المزيد</button>`),A+=`
                <div class="cal-day ${R?"cal-day-today":""}" data-date="${B}"
                     style="user-select:none;">
                    <div class="cal-day-number">${v}</div>
                    <div class="cal-day-events">${z}</div>
                </div>
            `}const D=[];for(let v=1;v<=E;v++){const S=String(o+1).padStart(2,"0"),T=String(v).padStart(2,"0"),B=`${n}-${S}-${T}`,L=m[B];L&&L.length>0&&D.push({dateStr:B,day:v,events:L})}const C=D.length>0?D.map(({dateStr:v,day:S,events:T})=>`<div class="cal-agenda-day">
                    <div class="cal-agenda-day-header">
                        <div class="cal-agenda-day-num ${v===x?"today":""}">${S}</div>
                        <span>${u[o]} ${n}</span>
                    </div>
                    <div class="cal-agenda-day-events">
                        ${T.map(L=>`
                        <div class="cal-agenda-event" data-caseid="${L.caseId}" style="cursor:pointer;">
                            <span class="cal-agenda-event-dot" style="background:${L.type==="session"?"hsl(210,90%,56%)":"hsl(30,90%,56%)"}"></span>
                            <div class="cal-agenda-event-info">
                                <div class="cal-agenda-event-title">${L.title}</div>
                                <div class="cal-agenda-event-sub">${L.label}</div>
                            </div>
                        </div>`).join("")}
                    </div>
                </div>`).join(""):'<div class="cal-agenda-empty">📅 لا توجد أحداث هذا الشهر</div>';e.innerHTML=`
        <div class="animate-fade-in">
            <div class="cal-header">
                <button class="btn btn-ghost btn-sm" id="cal-prev">→</button>
                <h2 class="cal-month-title">${u[o]} ${n}</h2>
                <button class="btn btn-ghost btn-sm" id="cal-next">←</button>
                <button class="btn btn-secondary btn-sm" id="cal-today" style="margin-right: auto;">اليوم</button>
            </div>
            <div class="cal-legend">
                <span class="cal-legend-item"><span class="cal-dot cal-dot-session"></span> جلسة</span>
                <span class="cal-legend-item"><span class="cal-dot cal-dot-deadline"></span> موعد نهائي (مفتوح)</span>
                <span class="cal-legend-note text-xs text-secondary" style="margin-right:auto;">للعرض فقط – لا يمكن التعديل أو السحب</span>
            </div>
            <div class="cal-grid">
                <div class="cal-weekdays">
                    ${I.map(v=>`<div class="cal-weekday">${v}</div>`).join("")}
                </div>
                <div class="cal-days">
                    ${A}
                </div>
            </div>
            <div class="cal-agenda">
                ${C}
            </div>
        </div>
        `,e.querySelector("#cal-prev").addEventListener("click",()=>{t.setMonth(t.getMonth()-1),s()}),e.querySelector("#cal-next").addEventListener("click",()=>{t.setMonth(t.getMonth()+1),s()}),e.querySelector("#cal-today").addEventListener("click",()=>{t=new Date,t.setDate(1),s()}),e.querySelectorAll(".cal-event").forEach(v=>{v.addEventListener("click",S=>{S.stopPropagation();const T=v.dataset.caseid;T&&(window.location.hash=`/cases/${T}`)})}),e.querySelectorAll(".cal-agenda-event").forEach(v=>{v.addEventListener("click",()=>{const S=v.dataset.caseid;S&&(window.location.hash=`/cases/${S}`)})}),e.querySelectorAll(".cal-more-btn").forEach(v=>{v.addEventListener("click",S=>{S.stopPropagation();const T=v.dataset.date,B=m[T]||[];a(v,B,T)})}),e.querySelectorAll(".cal-day, .cal-event").forEach(v=>{v.setAttribute("draggable","false"),v.addEventListener("dragstart",S=>S.preventDefault())})}function a(n,o,p){document.querySelectorAll(".cal-popover").forEach(y=>y.remove());const g=new Date(p+"T00:00:00").toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}),r=document.createElement("div");r.className="cal-popover",r.innerHTML=`
            <div class="cal-popover-header">
                <span>${g}</span>
                <button class="cal-popover-close">&times;</button>
            </div>
            <div class="cal-popover-list">
                ${o.map(y=>`
                    <div class="cal-popover-item" data-caseid="${y.caseId}" style="cursor:pointer;">
                        <span class="cal-dot cal-dot-${y.type}"></span>
                        <span class="cal-popover-client">${y.title}</span>
                        <span class="cal-popover-type">${y.label}</span>
                    </div>
                `).join("")}
            </div>
        `,n.parentElement.appendChild(r),r.querySelector(".cal-popover-close").addEventListener("click",()=>r.remove()),r.querySelectorAll(".cal-popover-item").forEach(y=>{y.addEventListener("click",()=>{const $=y.dataset.caseid;$&&(window.location.hash=`/cases/${$}`),r.remove()})});const m=y=>{r.contains(y.target)||(r.remove(),document.removeEventListener("click",m))};setTimeout(()=>document.addEventListener("click",m),10)}s()}let he=!1;function Wt(){setInterval(qe,60*1e3),qe()}function qe(){const e=c.getSetting("workdayEndTime");if(!e)return;const t=new Date,[s,a]=e.split(":").map(Number),n=t.getHours()*60+t.getMinutes(),o=s*60+a;if(n<o){he&&Oe();return}const p=t.toISOString().split("T")[0],g=c.getAll(l.SESSIONS).filter(r=>r.date===p&&(!r.decisionResult||r.status!=="مغلق"));g.length>0?Xt(g):Oe()}function Xt(e){he=!0;const t=document.getElementById("notification-bar");if(!t)return;const s=c.getAll(l.CASES),a=c.getAll(l.CLIENTS);t.innerHTML=`
        <div class="notif-bar">
            <div class="notif-bar-content">
                <span class="notif-bar-icon">🔔</span>
                <span class="notif-bar-text">لديك <strong>${e.length}</strong> جلسات اليوم بدون نتائج مسجلة</span>
                <button class="notif-bar-toggle" id="notif-toggle">عرض التفاصيل ▼</button>
            </div>
            <div class="notif-bar-list" id="notif-list" style="display: none;">
                ${e.map(n=>{const o=s.find(g=>g.id===n.caseId),p=o?o.primaryClientId||o.clientId:"",d=a.find(g=>g.id===p);return`
                        <div class="notif-item">
                            <div class="notif-item-info">
                                <div class="notif-item-client">${d?d.name:"—"}</div>
                                <div class="notif-item-details">
                                    القضية ${o?o.caseNo+"/"+o.year:"—"}
                                    ${o?" – "+o.court:""}
                                </div>
                            </div>
                            <button class="btn btn-primary btn-sm notif-record-btn" data-caseid="${n.caseId}">تسجيل النتيجة الآن</button>
                        </div>
                    `}).join("")}
            </div>
        </div>
    `,t.style.display="block",t.querySelector("#notif-toggle")?.addEventListener("click",()=>{const n=t.querySelector("#notif-list"),o=t.querySelector("#notif-toggle");n.style.display==="none"?(n.style.display="block",o.textContent="إخفاء التفاصيل ▲"):(n.style.display="none",o.textContent="عرض التفاصيل ▼")}),t.querySelectorAll(".notif-record-btn").forEach(n=>{n.addEventListener("click",()=>{window.location.hash=`/cases/${n.dataset.caseid}`})})}function Oe(){he=!1;const e=document.getElementById("notification-bar");e&&(e.innerHTML="",e.style.display="none")}function Zt(e,t={}){P("استيراد عملاء من ملفات PDF");const s=c.getSetting("drive_pdf_folder_id")||"";e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxl-google-drive'></i> استيراد من Google Drive</h1>
          <div class="page-header-sub">قم بمسح مجلد Drive لاكتشاف وإضافة مجلدات العملاء تلقائياً</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/clients'">↩ العودة إلى العملاء</button>
      </div>
      
      <div class="card mb-6">
        <h3 class="font-bold mb-4">إعدادات المسح</h3>
        <div class="flex gap-4 items-end">
            <div class="form-group flex-1">
                <label class="form-label">رابط مجلد جوجل درايف (Folder Link) <span class="required">*</span></label>
                <input type="text" id="drive-folder-id" class="form-input" value="${s}" placeholder="https://drive.google.com/drive/folders/1BxiMVs..."/>
                <div class="text-sm mt-1 text-gray-500">
                    ضع رابط المجلد الذي يحتوي على مجلدات بأسماء العملاء. تأكد من مشاركة المجلد مع حساب الخدمة.
                </div>
            </div>
            <button id="btn-scan" class="btn btn-primary" style="margin-bottom: 27px;">
                <i class='bx bx-scan'></i> مسح أسماء المجلدات
            </button>
        </div>
      </div>

      <div class="card" id="scan-results-card" style="display: none;">
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold">العملاء المكتشفون</h3>
            <button id="btn-import-selected" class="btn btn-success" disabled>
                <i class='bx bx-import'></i> استيراد المحددين
            </button>
        </div>

        <div class="table-container">
            <table class="data-table" id="import-table">
                <thead>
                    <tr>
                        <th width="40"><input type="checkbox" id="selectAllDetected" /></th>
                        <th>اسم العميل المستخرج</th>
                        <th>الرقم القومي</th>
                        <th>الملف المصدري</th>
                    </tr>
                </thead>
                <tbody id="import-table-body">
                    <!-- Results will be placed here -->
                </tbody>
            </table>
        </div>
      </div>

      <div id="loading-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center; flex-direction: column; color: white;">
          <i class='bx bx-loader-alt bx-spin' style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h2 class="text-xl">جاري جلب قائمة العملاء من Google Drive...</h2>
          <p class="mt-2 text-gray-300">يرجى الانتظار، جاري اكتشاف المجلدات.</p>
      </div>
    </div>
    `;const a=e.querySelector("#btn-scan"),n=e.querySelector("#drive-folder-id"),o=e.querySelector("#loading-overlay"),p=e.querySelector("#scan-results-card"),d=e.querySelector("#import-table-body"),g=e.querySelector("#btn-import-selected"),r=e.querySelector("#selectAllDetected");let m=[];a.addEventListener("click",async()=>{const f=n.value.trim();if(!f){w("الرجاء إدخال رقم تعريف المجلد (Folder ID)","error");return}c.setSetting("drive_pdf_folder_id",f),o.style.display="flex";try{const i=await fetch(`/api/scan-drive-pdfs?folderId=${encodeURIComponent(f)}`),b=await i.json();if(!i.ok)throw new Error(b.error||"حدث خطأ أثناء المسح");m=b.clients||[],m.length===0?(w("لم يتم العثور على أي بيانات عملاء في المجلد.","warning"),p.style.display="none"):(w(`تم اكتشاف ${m.length} عميل`,"success"),y(m),p.style.display="block")}catch(h){console.error(h),w(h.message,"error")}finally{o.style.display="none"}});function y(f){d.innerHTML="",f.forEach((i,b)=>{const E=document.createElement("tr");E.innerHTML=`
                <td><input type="checkbox" class="client-checkbox" data-index="${b}" /></td>
                <td><input type="text" class="form-input w-full p-1" id="name-${b}" value="${i.name}" /></td>
                <td><input type="text" class="form-input w-full p-1" id="nid-${b}" value="${i.nationalId}" /></td>
                <td>
                    <span class="badge" title="File ID: ${i.sourceFileId}">
                        ${i.sourceFile}
                    </span>
                </td>
            `,d.appendChild(E)}),$(),e.querySelectorAll(".client-checkbox").forEach(i=>{i.addEventListener("change",$)})}r.addEventListener("change",f=>{e.querySelectorAll(".client-checkbox").forEach(i=>{i.checked=f.target.checked}),$()});function $(){const f=Array.from(e.querySelectorAll(".client-checkbox")).some(h=>h.checked);g.disabled=!f}g.addEventListener("click",()=>{const f=e.querySelectorAll(".client-checkbox");let h=0;f.forEach(i=>{if(i.checked){const b=i.getAttribute("data-index"),E=e.querySelector(`#name-${b}`).value.trim(),u=e.querySelector(`#nid-${b}`).value.trim(),I=m[b],x=Je({name:E||I.name,nationalId:u||I.nationalId,notes:`تم إضافته من المسح الآلي للملف: ${I.sourceFile}`,driveFolderUrl:I.driveFolderUrl||"",driveFolderId:I.sourceFileId||""}),k=c.create(l.CLIENTS,x);N(l.CLIENTS,k.id,"create",x),h++}}),w(`تم استيراد ${h} عميل بنجاح`,"success"),setTimeout(()=>{window.location.hash="/clients"},1500)})}const Qt="/api";function es(){const e=document.getElementById("auth-root");e.classList.remove("hidden"),e.innerHTML=`
    <div class="auth-bg">
        <div class="auth-grid"></div>
        <div class="auth-bg-orb"></div>
    </div>

    <div class="auth-card">
        <div class="auth-brand">
            <div class="auth-logo-img-wrap">
                <img src="/logo-transparent.png" alt="شعار مكتب سرية للمحاماة" class="auth-logo-img" />
            </div>
            <div class="auth-brand-name">مكتب سرية للمحاماة</div>
            <div class="auth-brand-sub">نظام إدارة القضايا</div>
        </div>

        <h2 class="auth-title">تسجيل الدخول</h2>
        <p class="auth-subtitle">أدخل بيانات حسابك للمتابعة</p>

        <div id="login-error" style="display:none;" class="auth-error">
            <i class='bx bx-error-circle'></i>
            <span id="login-error-text"></span>
        </div>

        <form class="auth-form" id="login-form" novalidate>
            <div class="auth-field">
                <label class="auth-label" for="login-email">البريد الإلكتروني</label>
                <div style="position:relative;">
                    <i class='bx bx-envelope auth-field-icon'></i>
                    <input
                        class="auth-input"
                        type="email"
                        id="login-email"
                        placeholder="example@office.com"
                        autocomplete="email"
                        dir="ltr"
                        required
                    />
                </div>
            </div>

            <div class="auth-field">
                <label class="auth-label" for="login-password">كلمة المرور</label>
                <div style="position:relative;">
                    <i class='bx bx-lock-alt auth-field-icon'></i>
                    <input
                        class="auth-input has-toggle"
                        type="password"
                        id="login-password"
                        placeholder="••••••••"
                        autocomplete="current-password"
                        required
                    />
                    <button type="button" class="auth-pw-toggle" id="pw-toggle" title="إظهار/إخفاء كلمة المرور" tabindex="-1">
                        <i class='bx bx-hide' id="pw-toggle-icon"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="auth-btn" id="login-btn">
                <span>دخول</span>
            </button>
        </form>

        <div class="auth-footer">
            <p>لا تملك كلمة مرور؟ تحقق من بريدك الإلكتروني للحصول على رابط الدعوة</p>
        </div>
    </div>
    `;const t=document.getElementById("login-password"),s=document.getElementById("pw-toggle"),a=document.getElementById("pw-toggle-icon");s.addEventListener("click",()=>{const o=t.type==="password";t.type=o?"text":"password",a.className=o?"bx bx-show":"bx bx-hide"}),document.getElementById("login-form").addEventListener("submit",async o=>{o.preventDefault(),await ts()}),setTimeout(()=>document.getElementById("login-email")?.focus(),100)}async function ts(){const e=document.getElementById("login-email").value.trim(),t=document.getElementById("login-password").value,s=document.getElementById("login-btn"),a=document.getElementById("login-error");if(document.getElementById("login-error-text"),a.style.display="none",!e||!t){re("يرجى إدخال البريد الإلكتروني وكلمة المرور");return}s.classList.add("loading"),s.disabled=!0;try{const n=await fetch(`${Qt}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})}),o=await n.json();if(!n.ok){re(o.error||"خطأ في تسجيل الدخول");return}localStorage.setItem("slf_jwt",o.token),localStorage.setItem("slf_current_user",JSON.stringify(o.user)),document.getElementById("auth-root").classList.add("hidden"),window.dispatchEvent(new CustomEvent("auth:login",{detail:o.user}))}catch{re("تعذر الاتصال بالخادم، يرجى المحاولة مجدداً")}finally{s.classList.remove("loading"),s.disabled=!1}}function re(e){const t=document.getElementById("login-error"),s=document.getElementById("login-error-text");t&&s&&(s.textContent=e,t.style.display="flex")}const ss="/api";function as(){const e=document.getElementById("auth-root");e.classList.remove("hidden");const s=new URLSearchParams(window.location.search).get("token");if(!s){e.innerHTML=`
        <div class="auth-bg"><div class="auth-grid"></div><div class="auth-bg-orb"></div></div>
        <div class="auth-card">
            <div class="auth-brand">
                <div class="auth-logo-img-wrap">
                    <img src="/logo-transparent.png" alt="شعار مكتب سرية للمحاماة" class="auth-logo-img" />
                </div>
                <div class="auth-brand-name">مكتب سرية للمحاماة</div>
            </div>
            <div class="auth-error" style="margin-top: 24px;">
                <i class='bx bx-error-circle'></i>
                <span>رابط الدعوة غير صالح أو منتهي الصلاحية</span>
            </div>
            <div class="auth-footer" style="margin-top: 24px;">
                <a href="/" style="color:var(--accent-primary);">العودة لتسجيل الدخول</a>
            </div>
        </div>`;return}e.innerHTML=`
    <div class="auth-bg">
        <div class="auth-grid"></div>
        <div class="auth-bg-orb"></div>
    </div>

    <div class="auth-card">
        <div class="auth-brand">
            <div class="auth-logo-img-wrap">
                <img src="/logo-transparent.png" alt="شعار مكتب سرية للمحاماة" class="auth-logo-img" />
            </div>
            <div class="auth-brand-name">مكتب سرية للمحاماة</div>
            <div class="auth-brand-sub">تعيين كلمة المرور</div>
        </div>

        <h2 class="auth-title">أهلاً بك!</h2>
        <p class="auth-subtitle">قم بتعيين كلمة مرور لتفعيل حسابك</p>

        <div id="sp-message" style="display:none;"></div>

        <form class="auth-form" id="set-pw-form" novalidate>
            <div class="auth-field">
                <label class="auth-label" for="sp-password">كلمة المرور الجديدة</label>
                <div style="position:relative;">
                    <i class='bx bx-lock auth-field-icon'></i>
                    <input
                        class="auth-input has-toggle"
                        type="password"
                        id="sp-password"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        required
                    />
                    <button type="button" class="auth-pw-toggle" id="sp-pw-toggle" tabindex="-1">
                        <i class='bx bx-hide' id="sp-pw-icon"></i>
                    </button>
                </div>
                <div class="auth-strength-wrap">
                    <div class="auth-strength-bar">
                        <div class="auth-strength-fill" id="strength-fill"></div>
                    </div>
                    <div class="auth-strength-label" id="strength-label"></div>
                </div>
            </div>

            <div class="auth-field">
                <label class="auth-label" for="sp-confirm">تأكيد كلمة المرور</label>
                <div style="position:relative;">
                    <i class='bx bx-lock-open auth-field-icon'></i>
                    <input
                        class="auth-input has-toggle"
                        type="password"
                        id="sp-confirm"
                        placeholder="••••••••"
                        autocomplete="new-password"
                        required
                    />
                    <button type="button" class="auth-pw-toggle" id="sp-confirm-toggle" tabindex="-1">
                        <i class='bx bx-hide' id="sp-confirm-icon"></i>
                    </button>
                </div>
            </div>

            <button type="submit" class="auth-btn" id="sp-btn">
                <span>تعيين كلمة المرور</span>
            </button>
        </form>
    </div>
    `,Pe("sp-password","sp-pw-toggle","sp-pw-icon"),Pe("sp-confirm","sp-confirm-toggle","sp-confirm-icon"),document.getElementById("sp-password").addEventListener("input",a=>{ns(a.target.value)}),document.getElementById("set-pw-form").addEventListener("submit",async a=>{a.preventDefault(),await is(s)}),setTimeout(()=>document.getElementById("sp-password")?.focus(),100)}function Pe(e,t,s){const a=document.getElementById(e),n=document.getElementById(t),o=document.getElementById(s);n.addEventListener("click",()=>{const p=a.type==="password";a.type=p?"text":"password",o.className=p?"bx bx-show":"bx bx-hide"})}function ns(e){const t=document.getElementById("strength-fill"),s=document.getElementById("strength-label");let a=0;e.length>=8&&a++,/[A-Z]/.test(e)&&a++,/[0-9]/.test(e)&&a++,/[^A-Za-z0-9]/.test(e)&&a++;const n=[{pct:"0%",color:"transparent",text:""},{pct:"25%",color:"#ef4444",text:"ضعيفة جداً"},{pct:"50%",color:"#f59e0b",text:"ضعيفة"},{pct:"75%",color:"#60a5fa",text:"جيدة"},{pct:"100%",color:"#10b981",text:"قوية ✓"}],o=e.length===0?n[0]:n[Math.max(1,a)];t.style.width=o.pct,t.style.backgroundColor=o.color,s.textContent=o.text,s.style.color=o.color}async function is(e){const t=document.getElementById("sp-password").value,s=document.getElementById("sp-confirm").value,a=document.getElementById("sp-btn");if(K("",""),t.length<8){K("error","كلمة المرور يجب أن تكون 8 أحرف على الأقل");return}if(t!==s){K("error","كلمتا المرور غير متطابقتين");return}a.classList.add("loading"),a.disabled=!0;try{const n=await fetch(`${ss}/auth/set-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e,password:t})}),o=await n.json();if(!n.ok){K("error",o.error||"خطأ في تعيين كلمة المرور");return}K("success","تم تعيين كلمة المرور بنجاح! جارٍ تحويلك لتسجيل الدخول..."),setTimeout(()=>{const p=new URL(window.location.href);p.searchParams.delete("token"),window.history.replaceState({},"",p.pathname),window.location.hash="/login",window.location.reload()},1800)}catch{K("error","تعذر الاتصال بالخادم، يرجى المحاولة مجدداً")}finally{a.classList.remove("loading"),a.disabled=!1}}function K(e,t){const s=document.getElementById("sp-message");if(s){if(!t){s.style.display="none";return}s.className=e==="error"?"auth-error":"auth-success",s.innerHTML=`<i class='bx ${e==="error"?"bx-error-circle":"bx-check-circle"}'></i><span>${t}</span>`,s.style.display="flex"}}async function os(){const t=new URLSearchParams(window.location.search).get("token"),s=window.location.hash;if(t||s==="#/set-password"){as();return}if(!yt()){es(),window.addEventListener("auth:login",()=>{document.getElementById("auth-root").classList.add("hidden"),je()},{once:!0});return}await je()}async function je(){const e=[l.CLIENTS,l.CASES,l.SESSIONS,l.ACTIONS,l.DEADLINES,l.USERS];await c.syncFromServer(e),It();let t=U();if(!t){const s=c.getAll(l.USERS);s.length>0&&(Ge(s[0]),t=s[0])}$t(),us(),ps(),q("/",we),q("/dashboard",we),q("/clients",Ke),q("/clients/new",De),q("/clients/:id/edit",De),q("/clients/import",Zt),q("/cases",kt),q("/cases/new",Le),q("/cases/:id",G),q("/cases/:id/edit",Le),q("/actions",X),q("/deadlines",zt),q("/calendar",Vt),q("/admin/mapping",ge),q("/admin/users",Ze),q("/admin/audit",Jt),q("/admin/settings",Gt),ls(),it(),window.addEventListener("hashchange",()=>{Qe(window.location.hash.replace("#","")||"/dashboard")}),Wt(),(!window.location.hash||window.location.hash==="#")&&at("/dashboard")}function ls(){const e=document.getElementById("topbar"),t=U();e.innerHTML=`
    <div class="topbar-start">
      <button class="hamburger-btn" id="mobile-menu-btn" aria-label="فتح القائمة">
        <span></span><span></span><span></span>
      </button>
      <div class="topbar-title" id="topbar-page-title">لوحة التحكم</div>
    </div>
    <div class="topbar-actions">
      <div class="flex items-center gap-2">
        <span class="text-sm text-secondary topbar-username hidden-mobile">${t?t.name:""}</span>
        <span class="badge badge-open" style="font-size:var(--text-xs);">${t?t.role:""}</span>
        <button id="change-pw-btn" class="btn btn-ghost btn-sm" title="تغيير كلمة المرور" style="display:flex;align-items:center;gap:4px;">
          <i class='bx bx-key'></i>
          <span class="hidden-mobile">حسابي</span>
        </button>
        <button id="logout-btn" class="btn btn-ghost btn-sm" title="تسجيل الخروج" style="display:flex;align-items:center;gap:4px;">
          <i class='bx bx-log-out'></i>
          <span class="hidden-mobile">خروج</span>
        </button>
      </div>
    </div>
  `,e.querySelector("#logout-btn").addEventListener("click",()=>{confirm("هل تريد تسجيل الخروج؟")&&ft()}),e.querySelector("#change-pw-btn").addEventListener("click",ds),document.getElementById("mobile-menu-btn").addEventListener("click",rs)}const cs="/api";function ds(){_("تغيير كلمة المرور",`
      <p style="color:var(--text-secondary); font-size:var(--text-sm); margin-bottom:16px;">
        يمكنك تغيير كلمة مرور حسابك من هنا. إذا كانت هذه أول مرة تغير فيها كلمة المرور، أدخل كلمة المرور التي عيّنها لك المسؤول في خانة "كلمة المرور الحالية".
      </p>
      <div class="form-group">
        <label class="form-label">كلمة المرور الحالية <span class="required">*</span></label>
        <input type="password" class="form-input" id="cp-current" placeholder="كلمة مرورك الحالية" autocomplete="current-password" />
      </div>
      <div class="form-group">
        <label class="form-label">كلمة المرور الجديدة <span class="required">*</span></label>
        <input type="password" class="form-input" id="cp-new" placeholder="8 أحرف على الأقل" autocomplete="new-password" />
      </div>
      <div class="form-group">
        <label class="form-label">تأكيد كلمة المرور الجديدة <span class="required">*</span></label>
        <input type="password" class="form-input" id="cp-confirm" placeholder="••••••••" autocomplete="new-password" />
      </div>
      <div id="cp-error" class="form-error" style="display:none;"></div>
      <div id="cp-success" class="form-success" style="display:none; color:var(--color-success, #10b981); background:rgba(16,185,129,0.1); border-radius:var(--radius-md); padding:10px 14px; margin-top:8px;"></div>
    `,{footer:`
      <button class="btn btn-primary" id="cp-save-btn"><i class='bx bx-check'></i> تغيير كلمة المرور</button>
      <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
    `}),document.getElementById("cp-save-btn").addEventListener("click",async()=>{const s=document.getElementById("cp-error"),a=document.getElementById("cp-success");s.style.display="none",a.style.display="none";const n=document.getElementById("cp-current").value,o=document.getElementById("cp-new").value,p=document.getElementById("cp-confirm").value;if(!n){s.textContent="أدخل كلمة المرور الحالية",s.style.display="block";return}if(!o||o.length<8){s.textContent="كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل",s.style.display="block";return}if(o!==p){s.textContent="كلمتا المرور غير متطابقتين",s.style.display="block";return}const d=document.getElementById("cp-save-btn");d.disabled=!0,d.textContent="جارٍ الحفظ...";try{const g=await fetch(`${cs}/auth/change-password`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${ie()}`},body:JSON.stringify({currentPassword:n,newPassword:o})}),r=await g.json();if(!g.ok){s.textContent=r.error||"حدث خطأ",s.style.display="block",d.disabled=!1,d.innerHTML="<i class='bx bx-check'></i> تغيير كلمة المرور";return}a.innerHTML="<i class='bx bx-check-circle'></i> ✅ تم تغيير كلمة المرور بنجاح!",a.style.display="block",d.style.display="none",setTimeout(()=>O(),2e3)}catch{s.textContent="تعذر الاتصال بالخادم",s.style.display="block",d.disabled=!1,d.innerHTML="<i class='bx bx-check'></i> تغيير كلمة المرور"}})}function rs(){const e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e.classList.contains("open")?Ie():(e.classList.add("open"),t&&t.classList.add("active"),document.body.style.overflow="hidden")}function Ie(){const e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e.classList.remove("open"),t&&t.classList.remove("active"),document.body.style.overflow=""}function us(){if(document.getElementById("sidebar-overlay"))return;const e=document.createElement("div");e.id="sidebar-overlay",e.className="sidebar-overlay",e.addEventListener("click",Ie),document.getElementById("app").appendChild(e)}function ps(){if(document.getElementById("bottom-nav"))return;const e=c.count(l.ACTIONS,s=>s.status!=="مكتمل"),t=document.createElement("nav");t.id="bottom-nav",t.className="bottom-nav",t.innerHTML=`
    <button class="bottom-nav-item" data-route="/dashboard" onclick="window.location.hash='/dashboard'">
      <span class="bn-icon"><i class='bx bxs-dashboard'></i></span>
      لوحة التحكم
    </button>
    <button class="bottom-nav-item" data-route="/cases" onclick="window.location.hash='/cases'">
      <span class="bn-icon"><i class='bx bxs-folder-open'></i></span>
      القضايا
    </button>
    <button class="bottom-nav-item" data-route="/clients" onclick="window.location.hash='/clients'">
      <span class="bn-icon"><i class='bx bxs-group'></i></span>
      العملاء
    </button>
    <button class="bottom-nav-item" data-route="/actions" onclick="window.location.hash='/actions'">
      <span class="bn-icon"><i class='bx bxs-zap'></i></span>
      ${e>0?`<span class="bn-badge">${e}</span>`:""}
      الإجراءات
    </button>
    <button class="bottom-nav-item" data-route="/calendar" onclick="window.location.hash='/calendar'">
      <span class="bn-icon"><i class='bx bxs-calendar'></i></span>
      التقويم
    </button>
  `,document.getElementById("app").appendChild(t),Qe(window.location.hash.replace("#","")||"/dashboard")}function Qe(e){const t=document.getElementById("bottom-nav");t&&t.querySelectorAll(".bottom-nav-item").forEach(s=>{const a=s.dataset.route;s.classList.toggle("active",e===a||a!=="/"&&e.startsWith(a))})}function P(e){const t=document.getElementById("topbar-page-title");t&&(t.textContent=e)}function j(e){return e?new Date(e).toLocaleDateString("ar-EG",{year:"numeric",month:"short",day:"numeric"}):"—"}function J(e){if(!e)return 1/0;const t=new Date(e),s=new Date;return s.setHours(0,0,0,0),t.setHours(0,0,0,0),Math.ceil((t-s)/(1e3*60*60*24))}function ne(e){return J(e)<0}document.addEventListener("DOMContentLoaded",os);
