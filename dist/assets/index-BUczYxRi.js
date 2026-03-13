(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const p of o.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&a(p)}).observe(document,{childList:!0,subtree:!0});function s(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=s(n);fetch(n.href,o)}})();const V={};function q(e,t){V[e]=t}function tt(e){window.location.hash=e}function st(e){if(V[e])return{handler:V[e],params:{}};for(const t in V){const s=t.split("/").filter(Boolean),a=e.split("/").filter(Boolean);if(s.length!==a.length)continue;const n={};let o=!0;for(let p=0;p<s.length;p++)if(s[p].startsWith(":"))n[s[p].slice(1)]=a[p];else if(s[p]!==a[p]){o=!1;break}if(o)return{handler:V[t],params:n}}return null}function Ie(){const e=window.location.hash.slice(1)||"/",t=st(e);if(t){const s=document.getElementById("page-content");s&&(s.innerHTML="",t.handler(s,t.params)),document.querySelectorAll(".sidebar-link").forEach(a=>{const n=a.getAttribute("data-route");n===e||e.startsWith(n)&&n!=="/"?a.classList.add("active"):a.classList.remove("active")})}else{const s=document.getElementById("page-content");s&&(s.innerHTML=`
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>الصفحة غير موجودة</h3>
          <p>الصفحة المطلوبة غير متوفرة</p>
          <button class="btn btn-primary" onclick="window.location.hash='/'">العودة للرئيسية</button>
        </div>
      `)}}function at(){window.addEventListener("hashchange",Ie),Ie()}const W="slf_",re="/api";function Y(e){return W+e}function nt(){return Date.now().toString(36)+Math.random().toString(36).substr(2,9)}async function le(e,t,s=null,a=null){try{let n=`${re}/${t}`;a&&e!=="POST"&&(n+=`/${a}`);const o=localStorage.getItem("slf_jwt")||"",p={method:e,headers:{"Content-Type":"application/json",...o?{Authorization:`Bearer ${o}`}:{}}};s&&(p.body=JSON.stringify(s));const u=await fetch(n,p);u.ok||console.error(`Backend sync failed for ${t} ${e}`,await u.text())}catch(n){console.error(`Backend sync network error for ${t} ${e}:`,n)}}const c={getAll(e){const t=localStorage.getItem(Y(e));return(t?JSON.parse(t):[]).filter(a=>!a._deleted)},getAllIncludingDeleted(e){const t=localStorage.getItem(Y(e));return t?JSON.parse(t):[]},getById(e,t){return this.getAll(e).find(a=>a.id===t)||null},query(e,t){return this.getAll(e).filter(t)},count(e,t){return t?this.query(e,t).length:this.getAll(e).length},create(e,t){const s=this.getAllIncludingDeleted(e),a={...t,id:nt(),_createdAt:new Date().toISOString(),_updatedAt:new Date().toISOString(),_deleted:!1};return s.push(a),localStorage.setItem(Y(e),JSON.stringify(s)),le("POST",e,a),a},update(e,t,s){const a=this.getAllIncludingDeleted(e),n=a.findIndex(p=>p.id===t);if(n===-1)return null;const o={...a[n]};return a[n]={...a[n],...s,id:a[n].id,_createdAt:a[n]._createdAt,_updatedAt:new Date().toISOString(),_deleted:a[n]._deleted},localStorage.setItem(Y(e),JSON.stringify(a)),le("PUT",e,a[n],t),{oldItem:o,newItem:a[n]}},softDelete(e,t){const s=this.getAllIncludingDeleted(e),a=s.findIndex(n=>n.id===t);return a===-1?!1:(s[a]._deleted=!0,s[a]._deletedAt=new Date().toISOString(),localStorage.setItem(Y(e),JSON.stringify(s)),le("DELETE",e,null,t),!0)},clear(e){localStorage.removeItem(Y(e))},clearAll(){Object.keys(localStorage).forEach(e=>{e.startsWith(W)&&localStorage.removeItem(e)})},getSetting(e){const t=localStorage.getItem(W+"settings"),s=t?JSON.parse(t):{};return s[e]!==void 0?s[e]:null},setSetting(e,t){const s=localStorage.getItem(W+"settings"),a=s?JSON.parse(s):{};a[e]=t,localStorage.setItem(W+"settings",JSON.stringify(a)),fetch(`${re}/settings`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:e,value:t})}).catch(n=>console.error("Setting sync error",n))},async syncFromServer(e){try{console.log("Syncing from server...");const t=localStorage.getItem("slf_jwt")||"",s=t?{Authorization:`Bearer ${t}`}:{};for(let a of e){const n=await fetch(`${re}/${a}`,{headers:s});if(n.ok){const o=await n.json();Array.isArray(o)?localStorage.setItem(Y(a),JSON.stringify(o)):console.warn(`sync: skipping '${a}' – server returned non-array response`)}}return console.log("Sync complete!"),!0}catch(t){return console.error("Critical error syncing from backend:",t),!1}}},Ue=["مدني","جنائي","إداري","أسرة","عمالي","تجاري"],pe={مدني:"civil",جنائي:"criminal",إداري:"admin",أسرة:"family",عمالي:"labor",تجاري:"commercial"},it=["أول درجة","استئناف","نقض"],ot=["تحقيقات نيابة","جنحة","جناية","استئناف","نقض"],$e=["مدعي","مدعى عليه","مستأنف","مستأنف ضده","متهم","مجني عليه","طاعن","مطعون ضده"],_e=["نشطة","حكم","مغلقة"],je={نشطة:"active",حكم:"judgment",مغلقة:"closed"},Pe={مفتوح:"open","قيد التنفيذ":"progress",مكتمل:"completed",معلق:"blocked"},Re={مفتوح:"open",مكتمل:"completed",منتهي:"expired"},lt=["جلسة استماع","حكم","خبير","تحقيق","تجديد","نطق بالحكم","مرافعة","تأجيل"],ct=["حجز للحكم","صدور حكم نهائي","شطب نهائي","حفظ","أخرى"],Me=["إعلان/خدمة","تصريح محكمة","حزمة تحضير","متابعة خبير","تجديد من الشطب","مراجعة حكم","حضور تجديد حبس","متابعة تحقيق","استئناف","طعن","معارضة","أخرى"],me=["عالية","متوسطة","منخفضة"],be=["شريك","محامي مسؤول","محامي","متدرب"],He=["استئناف","نقض","معارضة","استئناف حبس","تجديد بعد الشطب","أخرى"],Fe=["تأجيل لإعادة الإعلان","تأجيل لتصريح","تأجيل لمذكرة ومستندات","إحالة لخبير","شطب","صدور حكم","حبس احتياطي","إخلاء سبيل","طلب تحقيقات","إحالة للمحكمة","حفظ","تأجيل للمرافعة","تأجيل للاطلاع","تأجيل عام","نطق بالحكم"],dt=["شريك","محامي مسؤول","محامي","متدرب"],rt={شريك:"partner","محامي مسؤول":"caseOwner",محامي:"lawyer",متدرب:"trainee"},l={CLIENTS:"clients",CASES:"cases",SESSIONS:"sessions",ACTIONS:"actions",DEADLINES:"deadlines",USERS:"users",AUDIT:"audit",DECISION_MAP:"decision_map",SETTINGS:"settings",LOOKUP_ACTION_TYPES:"lookup_action_types",LOOKUP_DECISION_TYPES:"lookup_decision_types"};function ze(e){return{name:e.name||"",nationalId:e.nationalId||"",phone:e.phone||"",address:e.address||"",poaNumber:e.poaNumber||"",notaryOffice:e.notaryOffice||"",poaDate:e.poaDate||"",attachments:e.attachments||[],notes:e.notes||"",driveFolderUrl:e.driveFolderUrl||"",driveFolderId:e.driveFolderId||""}}function ut(e){return{caseNo:e.caseNo||"",year:e.year||new Date().getFullYear().toString(),stageType:e.stageType||"",clientId:e.clientId||"",clientIds:e.clientIds||(e.clientId?[e.clientId]:[]),primaryClientId:e.primaryClientId||e.clientId||"",clientRole:e.clientRole||"",opponentName:e.opponentName||"",opponentRole:e.opponentRole||"",court:e.court||"",circuit:e.circuit||"",caseType:e.caseType||"",subject:e.subject||"",firstSessionDate:e.firstSessionDate||"",ownerId:e.ownerId||"",status:e.status||"نشطة",criminalStageType:e.criminalStageType||"",linkedProsecutionId:e.linkedProsecutionId||"",notes:e.notes||""}}function Ee(e){return{caseId:e.caseId||"",date:e.date||"",sessionType:e.sessionType||"",decisionResult:e.decisionResult||"",nextSessionDate:e.nextSessionDate||"",status:e.status||"مفتوح",closureReason:e.closureReason||"",notes:e.notes||"",attachments:e.attachments||[]}}function ve(e){return{clientId:e.clientId||"",caseId:e.caseId||"",sessionId:e.sessionId||"",actionType:e.actionType||"",title:e.title||"",priority:e.priority||"",responsibleUserId:e.responsibleUserId||"",status:e.status||"مفتوح",executionDate:e.executionDate||"",executionDetails:e.executionDetails||"",subTasks:e.subTasks||[],dueDate:e.dueDate||"",notes:e.notes||"",attachments:e.attachments||[]}}function pt(e){return{caseId:e.caseId||"",deadlineType:e.deadlineType||"",startDate:e.startDate||"",endDate:e.endDate||"",responsibleUserId:e.responsibleUserId||"",status:e.status||"مفتوح",completionNote:e.completionNote||""}}function mt(e){return{name:e.name||"",role:e.role||"محامي",email:e.email||"",phone:e.phone||"",active:e.active!==void 0?e.active:!0}}function Ye(){return localStorage.getItem("slf_jwt")||null}function bt(){localStorage.removeItem("slf_jwt")}function vt(){const e=Ye();if(!e)return!1;try{return JSON.parse(atob(e.split(".")[1])).exp*1e3>Date.now()}catch{return!1}}function yt(){bt(),localStorage.removeItem("slf_current_user"),window.location.href=window.location.pathname+window.location.search}let te=null;function Ge(e){te=e,localStorage.setItem("slf_current_user",JSON.stringify(e))}function R(){if(!te){const e=localStorage.getItem("slf_current_user");e&&(te=JSON.parse(e))}return te}function Z(e){return e&&rt[e.role]||null}const ft={partner:{createCase:!0,editCase:"all",createSession:!0,editSession:"all",completeAction:!0,createDeadline:!0,closeCase:!0,deleteRecords:"soft",adminConfig:!0,viewAll:!0,lockUnlock:!0},caseOwner:{createCase:!0,editCase:"own",createSession:!0,editSession:"own",completeAction:!0,createDeadline:!0,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1},lawyer:{createCase:!1,editCase:"assigned",createSession:"assigned",editSession:"assigned",completeAction:"assigned",createDeadline:!1,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1},trainee:{createCase:!1,editCase:!1,createSession:!1,editSession:!1,completeAction:"addDetails",createDeadline:!1,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1}};function gt(e,t={}){const s=R();if(!s)return!1;const a=Z(s);if(!a)return!1;const n=ft[a];if(!n)return!1;const o=n[e];return o===!0?!0:o===!1||o===void 0?!1:o==="all"?!0:o==="own"?t.ownerId===s.id:o==="assigned"?t.ownerId===s.id||t.responsibleUserId===s.id||t.assignedTo===s.id:o==="addDetails"?t.responsibleUserId===s.id||t.assignedTo===s.id:o==="soft"}function Q(){const e=R();return e?Z(e)==="partner":!1}function ae(){const e=R();return e?Z(e)==="partner":!1}function ht(){if(c.getAll(l.USERS).length>0)return;const t=c.create(l.USERS,{name:"أحمد أحمد سريا",role:"شريك",email:"ahmed@serya.law",phone:"01000000001",active:!0});c.create(l.USERS,{name:"فتحي أحمد سريا",role:"شريك",email:"fathy@serya.law",phone:"01000000002",active:!0});const s=c.create(l.USERS,{name:"محمد عبد الرحمن",role:"محامي مسؤول",email:"mohamed@serya.law",phone:"01000000003",active:!0}),a=c.create(l.USERS,{name:"سارة أحمد",role:"محامي",email:"sara@serya.law",phone:"01000000004",active:!0});c.create(l.USERS,{name:"يوسف محمود",role:"متدرب",email:"youssef@serya.law",phone:"01000000005",active:!0}),Ge(t);const n=c.create(l.CLIENTS,{name:"شركة النور للتجارة",nationalId:"12345678901234",phone:"01100000001",address:"القاهرة - المعادي - شارع 9",poaNumber:"POA-2025-001",notaryOffice:"مكتب توثيق المعادي",poaDate:"2025-01-15",notes:"عميل مهم - قضايا تجارية"}),o=c.create(l.CLIENTS,{name:"أحمد محمد إبراهيم",nationalId:"28501012345678",phone:"01200000002",address:"الجيزة - الدقي",poaNumber:"POA-2025-002",notaryOffice:"مكتب توثيق الدقي",poaDate:"2025-02-10",notes:""}),p=c.create(l.CLIENTS,{name:"فاطمة حسن علي",nationalId:"29001234567890",phone:"01500000003",address:"الإسكندرية - سموحة",poaNumber:"POA-2025-003",notaryOffice:"مكتب توثيق سموحة",poaDate:"2025-03-05",notes:"قضية أسرة"}),u=c.create(l.CASES,{caseNo:"1234",year:"2025",stageType:"أول درجة",clientId:n.id,clientIds:[n.id],primaryClientId:n.id,clientRole:"مدعي",opponentName:"شركة الفجر للاستيراد",opponentRole:"مدعى عليه",court:"محكمة القاهرة الاقتصادية",circuit:"الدائرة الثالثة",caseType:"مدني",subject:"مطالبة بمستحقات تجارية",firstSessionDate:"2026-03-01",ownerId:s.id,status:"نشطة"}),h=c.create(l.CASES,{caseNo:"5678",year:"2025",stageType:"أول درجة",clientId:o.id,clientIds:[o.id],primaryClientId:o.id,clientRole:"متهم",opponentName:"النيابة العامة",opponentRole:"سلطة اتهام",court:"نيابة شمال القاهرة",circuit:"",caseType:"جنائي",criminalStageType:"تحقيقات نيابة",subject:"تحقيق جنائي - نصب",firstSessionDate:"2026-02-28",ownerId:t.id,status:"نشطة"}),r=c.create(l.CASES,{caseNo:"9101",year:"2026",stageType:"استئناف",clientId:p.id,clientIds:[p.id,n.id],primaryClientId:p.id,clientRole:"مستأنف",opponentName:"خالد حسن محمود",opponentRole:"مستأنف ضده",court:"محكمة استئناف الإسكندرية",circuit:"الدائرة الأولى أسرة",caseType:"أسرة",subject:"استئناف حكم نفقة",firstSessionDate:"2026-03-05",ownerId:s.id,status:"نشطة"}),m=c.create(l.SESSIONS,{caseId:u.id,date:"2026-03-01",sessionType:"جلسة استماع",decisionResult:"تأجيل لإعادة الإعلان",nextSessionDate:"2026-03-15",notes:"لم يحضر المدعى عليه - تأجيل لإعادة الإعلان"});c.create(l.ACTIONS,{caseId:u.id,sessionId:m.id,actionType:"إعلان/خدمة",responsibleUserId:a.id,status:"مفتوح",dueDate:"2026-03-10",notes:"إعادة إعلان المدعى عليه - شركة الفجر للاستيراد"});const f=c.create(l.SESSIONS,{caseId:h.id,date:"2026-02-28",sessionType:"تحقيق",decisionResult:"حبس احتياطي",nextSessionDate:"2026-03-14",notes:"تم حبس المتهم احتياطياً 15 يوماً"});c.create(l.ACTIONS,{caseId:h.id,sessionId:f.id,actionType:"حضور تجديد حبس",responsibleUserId:t.id,status:"مفتوح",dueDate:"2026-03-13",notes:"حضور جلسة تجديد الحبس الاحتياطي"}),c.create(l.DEADLINES,{caseId:h.id,deadlineType:"استئناف حبس",startDate:"2026-02-28",endDate:"2026-03-07",responsibleUserId:t.id,status:"مفتوح",completionNote:""}),c.create(l.ACTIONS,{caseId:r.id,sessionId:"",actionType:"حزمة تحضير",responsibleUserId:s.id,status:"قيد التنفيذ",dueDate:"2026-03-03",subTasks:[{title:"صياغة المذكرة",completed:!0},{title:"مراجعة المذكرة",completed:!1},{title:"تحضير المستندات",completed:!1},{title:"تقديم الحزمة",completed:!1}],notes:"تحضير مذكرة الاستئناف ومستنداتها"}),c.setSetting("workdayEndTime","17:00"),console.log("✅ Seed data loaded successfully")}function It(){const e=document.getElementById("sidebar"),t=R(),s=c.count(l.ACTIONS,n=>n.status!=="مكتمل"),a=c.count(l.DEADLINES,n=>n.status==="مفتوح");e.innerHTML=`
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
  `,e.querySelectorAll(".sidebar-link").forEach(n=>{n.addEventListener("click",()=>{window.innerWidth<=768&&he()})})}function Se(e){U("لوحة التحكم");const t=R(),s=t?Z(t):null,a=s==="lawyer"||s==="trainee",n=c.getAll(l.CASES),o=c.getAll(l.SESSIONS);let p=c.getAll(l.ACTIONS);a&&t&&(p=p.filter(d=>d.responsibleUserId===t.id));const u=c.getAll(l.DEADLINES),h=c.getAll(l.CLIENTS),r=n.filter(d=>d.status==="نشطة").length,m=p.filter(d=>d.status!=="مكتمل").length,f=u.filter(d=>d.status==="مفتوح").length,$=new Date;$.setHours(0,0,0,0);const y=new Date($);y.setDate(y.getDate()+7);const g=o.filter(d=>{if(!d.nextSessionDate)return!1;const I=new Date(d.nextSessionDate);return I>=$&&I<=y}).sort((d,I)=>new Date(d.nextSessionDate)-new Date(I.nextSessionDate)),i=n.filter(d=>{if(!d.firstSessionDate)return!1;const I=new Date(d.firstSessionDate);return I>=$&&I<=y}),b={};p.filter(d=>d.status!=="مكتمل").forEach(d=>{b[d.actionType]||(b[d.actionType]=[]),b[d.actionType].push(d)});const E=[];g.forEach(d=>{const I=G(d.nextSessionDate);if(I<=3){const S=p.filter(k=>k.sessionId===d.id&&k.status!=="مكتمل");if(S.length>0){const k=c.getById(l.CASES,d.caseId);E.push({level:"high",icon:"<i class='bx bxs-circle'></i>",text:`جلسة خلال ${I} أيام مع ${S.length} إجراء مفتوح – القضية ${k?k.caseNo:""}/${k?k.year:""}`})}}}),p.filter(d=>d.actionType==="حضور تجديد حبس"&&d.status!=="مكتمل").forEach(d=>{const I=c.getById(l.CASES,d.caseId);E.push({level:"high",icon:"<i class='bx bxs-bell-ring'></i>",text:`إجراء حبس احتياطي مفتوح – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),p.filter(d=>d.status!=="مكتمل"&&d.dueDate&&ne(d.dueDate)).forEach(d=>{const I=c.getById(l.CASES,d.caseId);E.push({level:"medium",icon:"<i class='bx bx-error'></i>",text:`إجراء متأخر: ${d.actionType} – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),u.filter(d=>d.status==="مفتوح"&&d.endDate&&ne(d.endDate)).forEach(d=>{const I=c.getById(l.CASES,d.caseId);E.push({level:"high",icon:"<i class='bx bxs-circle'></i>",text:`موعد نهائي متأخر: ${d.deadlineType} – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),e.innerHTML=`
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
              <div class="card-value">${f}</div>
              <div class="card-label">مواعيد نهائية</div>
            </div>
            <div class="card-icon red"><i class='bx bxs-time'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${h.length}</div>
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
              ${E.map(d=>`
                <div class="risk-flag ${d.level}">
                  <span class="risk-icon">${d.icon}</span>
                  <span>${d.text}</span>
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
            <span class="badge badge-open">${g.length+i.length}</span>
          </div>
          <div class="widget-body">
            ${g.length+i.length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد جلسات قادمة</p>
              </div>
            `:""}
            ${i.map(d=>{const I=c.getById(l.CLIENTS,d.clientId),S=G(d.firstSessionDate);return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${d.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${d.caseNo}/${d.year}</div>
                    <div class="widget-item-sub">${I?I.name:""} – ${d.subject}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${S<=1?"text-accent":""}">${_(d.firstSessionDate)}</div>
                    <div class="text-xs ${S<=1?"text-accent":"text-secondary"}">${S===0?"اليوم":S===1?"غداً":`خلال ${S} أيام`}</div>
                  </div>
                </div>
              `}).join("")}
            ${g.map(d=>{const I=c.getById(l.CASES,d.caseId),S=G(d.nextSessionDate);return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${d.caseId}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${I?I.caseNo+"/"+I.year:""}</div>
                    <div class="widget-item-sub">${d.decisionResult} → ${d.sessionType}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${S<=1?"text-accent":""}">${_(d.nextSessionDate)}</div>
                    <div class="text-xs ${S<=1?"text-accent":"text-secondary"}">${S===0?"اليوم":S===1?"غداً":`خلال ${S} أيام`}</div>
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
            ${Object.entries(b).map(([d,I])=>`
              <div class="widget-item">
                <div class="widget-item-info">
                  <div class="widget-item-title">${d}</div>
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
            <span class="badge badge-blocked">${f}</span>
          </div>
          <div class="widget-body">
            ${u.filter(d=>d.status==="مفتوح").length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد مواعيد نهائية مفتوحة</p>
              </div>
            `:""}
            ${u.filter(d=>d.status==="مفتوح").sort((d,I)=>new Date(d.endDate)-new Date(I.endDate)).map(d=>{const I=c.getById(l.CASES,d.caseId),S=G(d.endDate),k=S<0?"badge-blocked":S<=3?"badge-progress":"badge-open";return`
                  <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${d.caseId}'">
                    <div class="widget-item-info">
                      <div class="widget-item-title">${d.deadlineType}</div>
                      <div class="widget-item-sub">القضية ${I?I.caseNo+"/"+I.year:""}</div>
                    </div>
                    <div>
                      <div class="widget-item-date">${_(d.endDate)}</div>
                      <span class="badge ${k}">${S<0?"متأخر":S===0?"اليوم":`${S} يوم`}</span>
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
            ${n.slice(-5).reverse().map(d=>{const I=c.getById(l.CLIENTS,d.clientId),S=pe[d.caseType]||"civil";return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${d.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">${d.caseNo}/${d.year} – ${d.subject}</div>
                    <div class="widget-item-sub">${I?I.name:""}</div>
                  </div>
                  <span class="badge badge-${S}">${d.caseType}</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    </div>
  `}function w(e,t="success",s=3e3){const a=document.getElementById("toast-root"),n=document.createElement("div");n.className=`toast toast-${t}`;const o={success:"✓",error:"✕",warning:"⚠",info:"ℹ"};n.innerHTML=`<span>${o[t]||""}</span> ${e}`,a.appendChild(n),setTimeout(()=>{n.style.opacity="0",n.style.transform="translateY(-10px)",n.style.transition="all 300ms ease-out",setTimeout(()=>n.remove(),300)},s)}function j(e,t,s={}){const a=document.getElementById("modal-root"),n=s.large?"modal-lg":"",o=document.createElement("div");o.className="modal-overlay",o.id="active-modal",o.innerHTML=`
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
  `,a.appendChild(o),o.querySelector("#modal-close-btn").addEventListener("click",O),o.addEventListener("click",u=>{u.target===o&&O()});const p=u=>{u.key==="Escape"&&(O(),document.removeEventListener("keydown",p))};return document.addEventListener("keydown",p),o}function O(){const e=document.getElementById("active-modal");e&&(e.style.opacity="0",setTimeout(()=>e.remove(),150))}function $t(e,t,s){const a=`
    <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">${t}</p>
  `,o=j(e,a,{footer:`
    <button class="btn btn-primary" id="confirm-yes">تأكيد</button>
    <button class="btn btn-secondary" id="confirm-no">إلغاء</button>
  `});o.querySelector("#confirm-yes").addEventListener("click",()=>{s(),O()}),o.querySelector("#confirm-no").addEventListener("click",O)}function N(e,t,s,a={}){const n=R(),o={entityType:e,entityId:t,action:s,userId:n?n.id:"system",userName:n?n.name:"النظام",timestamp:new Date().toISOString(),changes:a};return c.create(l.AUDIT,o),o}function Et(e,t,s,a=""){const n=R(),o=new Date().toISOString(),p={actionType:"نوع الإجراء",title:"العنوان / الوصف",dueDate:"تاريخ الاستحقاق",responsibleUserId:"المحامي المسؤول",priority:"الأولوية",notes:"الملاحظات",clientId:"العميل",caseId:"القضية",executionDate:"تاريخ التنفيذ",executionDetails:"تفاصيل التنفيذ / الإثبات",status:"الحالة"},u=["actionType","responsibleUserId","clientId","caseId","executionDate","executionDetails"],h=[];return Object.keys(p).forEach(r=>{const m=String(t[r]||""),f=String(s[r]||"");if(m===f)return;const $=u.includes(r),y={entityType:l.ACTIONS,entityId:e,action:"field_change",userId:n?n.id:"system",userName:n?n.name:"النظام",timestamp:o,changes:{field:r,fieldLabel:p[r]||r,oldValue:m,newValue:f,sensitive:$,editReason:$?a:""}};c.create(l.AUDIT,y),h.push(y)}),h}function St(e){return c.query(l.AUDIT,t=>t.entityId===e).sort((t,s)=>new Date(s.timestamp)-new Date(t.timestamp))}function xt(e=50){return c.getAll(l.AUDIT).sort((t,s)=>new Date(s.timestamp)-new Date(t.timestamp)).slice(0,e)}function wt(e){return{create:"إنشاء",update:"تعديل",complete:"إكمال",delete:"حذف",status_change:"تغيير حالة",field_change:"تعديل حقل"}[e]||e}function Je(e){U("العملاء");const t=c.getAll(l.CLIENTS);e.innerHTML=`
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
            ${xe(t)}
          </tbody>
        </table>
      </div>
    </div>
  `,e.querySelector("#client-search").addEventListener("input",s=>{const a=s.target.value.toLowerCase(),n=t.filter(o=>o.name.toLowerCase().includes(a)||o.nationalId.includes(a)||o.phone.includes(a));document.getElementById("client-table-body").innerHTML=xe(n),we()}),e.querySelector("#add-client-btn").addEventListener("click",()=>{window.location.hash="/clients/new"}),we()}function xe(e){return e.length===0?'<tr><td colspan="7"><div class="empty-state"><p>لا يوجد عملاء</p></div></td></tr>':e.map(t=>{const s=t.driveFolderUrl?`<a href="${t.driveFolderUrl}" target="_blank" class="btn btn-ghost btn-sm" title="فتح مجلد درايف"><i class='bx bxl-google-drive text-blue-500'></i></a>`:"";return`
    <tr class="clickable-row" data-id="${t.id}">
      <td><strong>${t.name||"—"}</strong></td>
      <td>${t.nationalId||""}</td>
      <td>${t.phone||""}</td>
      <td>${t.poaNumber||""}</td>
      <td>${t.notaryOffice||""}</td>
      <td>${_(t.poaDate)}</td>
      <td>
        <div class="table-actions">
          ${s}
          <button class="btn btn-ghost btn-sm edit-client" data-id="${t.id}"><i class='bx bx-edit'></i></button>
          <button class="btn btn-ghost btn-sm delete-client" data-id="${t.id}"><i class='bx bx-trash'></i></button>
        </div>
      </td>
    </tr>
  `}).join("")}function we(){document.querySelectorAll(".edit-client").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation(),window.location.hash=`/clients/${e.dataset.id}/edit`})}),document.querySelectorAll(".delete-client").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation(),$t("حذف العميل","هل أنت متأكد من حذف هذا العميل؟",()=>{c.softDelete(l.CLIENTS,e.dataset.id),N(l.CLIENTS,e.dataset.id,"delete"),w("تم حذف العميل","success"),window.location.hash="/clients",Je(document.getElementById("page-content"))})})})}function Te(e,t={}){const s=t.id&&t.id!=="new",a=s?c.getById(l.CLIENTS,t.id):null;U(s?"تعديل بيانات العميل":"إضافة عميل جديد"),e.innerHTML=`
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
  `,e.querySelector("#client-form").addEventListener("submit",p=>{p.preventDefault();const u=ze({name:document.getElementById("client-name").value.trim(),nationalId:document.getElementById("client-national-id").value.trim(),phone:document.getElementById("client-phone").value.trim(),address:document.getElementById("client-address").value.trim(),poaNumber:document.getElementById("client-poa").value.trim(),notaryOffice:document.getElementById("client-notary").value.trim(),poaDate:document.getElementById("client-poa-date").value,notes:document.getElementById("client-notes").value.trim(),driveFolderUrl:a?.driveFolderUrl||"",driveFolderId:a?.driveFolderId||""});if(!u.name||!u.nationalId||!u.phone||!u.poaNumber||!u.notaryOffice||!u.poaDate){w("يرجى ملء جميع الحقول المطلوبة","error");return}if(s)c.update(l.CLIENTS,t.id,u),N(l.CLIENTS,t.id,"update",u),w("تم تحديث بيانات العميل","success");else{const h=c.create(l.CLIENTS,u);N(l.CLIENTS,h.id,"create",u),w("تم إنشاء العميل بنجاح","success")}window.location.hash="/clients"});const n=e.querySelector("#btn-sync-drive");async function o(p=!1){if(!a?.driveFolderId)return;const u=n?n.innerHTML:"";n&&(n.innerHTML="<i class='bx bx-loader-alt bx-spin'></i> جاري المزامنة...",n.disabled=!0);try{const r=await fetch(`/api/sync-drive?folderId=${encodeURIComponent(a.driveFolderId)}`),m=await r.json();if(!r.ok)throw new Error(m.error||"حدث خطأ أثناء المزامنة");m.nationalId?(document.getElementById("client-national-id").value=m.nationalId,w("تم العثور على الرقم القومي تلقائياً من ملفات درايف!","success"),n&&(n.style.display="none")):p||w("لم يتم العثور على رقم قومي في صور المجلد.","warning")}catch(h){console.error(h),p||w(h.message,"error")}finally{n&&(n.innerHTML=u,n.disabled=!1)}}n&&(n.addEventListener("click",()=>{o(!1)}),s&&!a?.nationalId&&o(!0))}function Tt(e){U("القضايا");const t=c.getAll(l.CASES);c.getAll(l.CLIENTS),c.getAll(l.USERS),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-folder-open'></i> القضايا</h1>
          <div class="page-header-sub">${t.length} قضية</div>
        </div>
        ${gt("createCase")?`<button class="btn btn-primary" onclick="window.location.hash='/cases/new'"><i class='bx bx-plus'></i> إضافة قضية</button>`:""}
      </div>
      
      <div class="filter-bar">
        <div class="search-input">
          <span class="search-icon">🔍</span>
          <input type="text" id="case-search" placeholder="بحث برقم القضية أو اسم العميل أو الخصم..." />
        </div>
        <select class="filter-select" id="filter-type">
          <option value="">كل الأنواع</option>
          ${Ue.map(a=>`<option value="${a}">${a}</option>`).join("")}
        </select>
        <select class="filter-select" id="filter-status">
          <option value="">كل الحالات</option>
          ${_e.map(a=>`<option value="${a}">${a}</option>`).join("")}
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
  `;function s(){const a=document.getElementById("case-search").value.toLowerCase(),n=document.getElementById("filter-type").value,o=document.getElementById("filter-status").value;let p=t;a&&(p=p.filter(h=>{const r=c.getById(l.CLIENTS,h.clientId);return h.caseNo.includes(a)||h.subject.toLowerCase().includes(a)||h.opponentName.toLowerCase().includes(a)||h.court.toLowerCase().includes(a)||r&&r.name.toLowerCase().includes(a)})),n&&(p=p.filter(h=>h.caseType===n)),o&&(p=p.filter(h=>h.status===o));const u=document.getElementById("case-table-body");if(p.length===0){u.innerHTML='<tr><td colspan="9"><div class="empty-state"><p>لا توجد قضايا</p></div></td></tr>';return}u.innerHTML=p.map(h=>{const r=c.getById(l.CLIENTS,h.clientId),m=c.getById(l.USERS,h.ownerId),f=pe[h.caseType]||"civil",$=je[h.status]||"active";return`
        <tr class="clickable-row" onclick="window.location.hash='/cases/${h.id}'">
          <td><strong>${h.caseNo||""}/${h.year||""}</strong></td>
          <td><span class="badge badge-${f}">${h.caseType||"—"}</span></td>
          <td>${r?r.name:"—"}</td>
          <td>${h.opponentName||"—"}</td>
          <td class="text-sm">${h.court||"—"}</td>
          <td class="text-sm">${h.subject||"—"}</td>
          <td>${h.stageType||"—"}</td>
          <td><span class="badge badge-${$}">${h.status||"—"}</span></td>
          <td class="text-sm">${m?m.name:"—"}</td>
        </tr>
      `}).join("")}s(),document.getElementById("case-search").addEventListener("input",s),document.getElementById("filter-type").addEventListener("change",s),document.getElementById("filter-status").addEventListener("change",s)}function ke(e,t={}){const s=t.id&&!window.location.hash.includes("/new"),a=s?c.getById(l.CASES,t.id):null,n=c.getAll(l.CLIENTS),o=c.getAll(l.USERS);U(s?"تعديل القضية":"إضافة قضية جديدة"),e.innerHTML=`
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
                ${it.map(r=>`<option value="${r}" ${a?.stageType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">نوع القضية <span class="required">*</span></label>
              <select class="form-select" id="case-type" required>
                <option value="">اختر النوع</option>
                ${Ue.map(r=>`<option value="${r}" ${a?.caseType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" id="criminal-stage-group" style="display: ${a?.caseType==="جنائي"?"block":"none"};">
              <label class="form-label">مرحلة القضية الجنائية <span class="required">*</span></label>
              <select class="form-select" id="case-criminal-stage">
                <option value="">اختر المرحلة الجنائية</option>
                ${ot.map(r=>`<option value="${r}" ${a?.criminalStageType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <hr style="border-color: var(--border-primary); margin: var(--space-6) 0;" />
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bxs-user-detail'></i> أطراف القضية</h3>
          
          <div class="form-row">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">العملاء <span class="required">*</span></label>
              <div class="client-tags" id="client-tags-container">
                ${(a?.clientIds||(a?.clientId?[a.clientId]:[])).map(r=>{const m=n.find($=>$.id===r),f=a?.primaryClientId===r;return m?`<span class="client-tag ${f?"primary":""}" data-client-id="${r}">${m.name}${f?" (رئيسي)":""}<button class="client-tag-remove" data-remove-id="${r}">&times;</button></span>`:""}).join("")}
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
              ${(a?.clientIds||[]).map(r=>{const m=n.find(f=>f.id===r);return m?`<label class="primary-select-radio"><input type="radio" name="primary-client" value="${r}" ${a?.primaryClientId===r?"checked":""} />${m.name}</label>`:""}).join("")}
            </div>
            <div class="form-hint">سيتم عرض اسم العميل الرئيسي في التقويم ولوحة التحكم</div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">صفة العميل <span class="required">*</span></label>
              <select class="form-select" id="case-client-role" required>
                <option value="">اختر الصفة</option>
                ${$e.map(r=>`<option value="${r}" ${a?.clientRole===r?"selected":""}>${r}</option>`).join("")}
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
                ${$e.map(r=>`<option value="${r}" ${a?.opponentRole===r?"selected":""}>${r}</option>`).join("")}
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
              ${_e.map(r=>`<option value="${r}" ${a?.status===r?"selected":""}>${r}</option>`).join("")}
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
  `,document.getElementById("case-type").addEventListener("change",r=>{const m=document.getElementById("criminal-stage-group");m.style.display=r.target.value==="جنائي"?"block":"none"});let p=a?.clientIds?[...a.clientIds]:a?.clientId?[a.clientId]:[],u=a?.primaryClientId||a?.clientId||"";function h(){const r=document.getElementById("client-tags-container"),m=document.getElementById("primary-client-group"),f=document.getElementById("primary-client-radios");r.innerHTML=p.map($=>{const y=n.find(i=>i.id===$),g=u===$;return y?`<span class="client-tag ${g?"primary":""}" data-client-id="${$}">${y.name}${g?" (رئيسي)":""}<button class="client-tag-remove" data-remove-id="${$}">&times;</button></span>`:""}).join(""),r.querySelectorAll(".client-tag-remove").forEach($=>{$.addEventListener("click",y=>{y.preventDefault();const g=$.dataset.removeId;p=p.filter(i=>i!==g),u===g&&(u=p[0]||""),h()})}),p.length>1?(m.style.display="block",f.innerHTML=p.map($=>{const y=n.find(g=>g.id===$);return y?`<label class="primary-select-radio"><input type="radio" name="primary-client" value="${$}" ${u===$?"checked":""} />${y.name}</label>`:""}).join(""),f.querySelectorAll('input[type="radio"]').forEach($=>{$.addEventListener("change",()=>{u=$.value,h()})})):(m.style.display="none",p.length===1&&(u=p[0]))}document.getElementById("add-client-btn").addEventListener("click",()=>{const r=document.getElementById("add-client-select"),m=r.value;m&&(p.includes(m)||(p.push(m),p.length===1&&(u=m),r.value="",h()))}),h(),document.getElementById("case-form").addEventListener("submit",r=>{r.preventDefault();const m=ut({caseNo:document.getElementById("case-no").value.trim(),year:document.getElementById("case-year").value.trim(),stageType:document.getElementById("case-stage").value,clientId:u,clientIds:[...p],primaryClientId:u,clientRole:document.getElementById("case-client-role").value,opponentName:document.getElementById("case-opponent").value.trim(),opponentRole:document.getElementById("case-opponent-role").value,court:document.getElementById("case-court").value.trim(),circuit:document.getElementById("case-circuit").value.trim(),caseType:document.getElementById("case-type").value,subject:document.getElementById("case-subject").value.trim(),firstSessionDate:document.getElementById("case-first-session").value,ownerId:document.getElementById("case-owner").value,status:s?document.getElementById("case-status")?.value||a.status:"نشطة",criminalStageType:document.getElementById("case-criminal-stage")?.value||"",notes:document.getElementById("case-notes").value.trim()}),f=[];if(m.caseNo||f.push("رقم القضية مطلوب"),m.year||f.push("السنة مطلوبة"),m.stageType||f.push("نوع المرحلة مطلوب"),p.length===0&&f.push("يجب إضافة عميل واحد على الأقل"),p.length>1&&!u&&f.push("يجب اختيار العميل الرئيسي عند وجود عدة عملاء"),m.clientRole||f.push("صفة العميل مطلوبة"),m.opponentName||f.push("اسم الخصم مطلوب"),m.opponentRole||f.push("صفة الخصم مطلوبة"),m.court||f.push("المحكمة مطلوبة"),m.circuit||f.push("الدائرة مطلوبة"),m.caseType||f.push("نوع القضية مطلوب"),m.subject||f.push("موضوع القضية مطلوب"),m.firstSessionDate||f.push("تاريخ أول جلسة مطلوب"),m.ownerId||f.push("المحامي المسؤول مطلوب"),m.caseType==="جنائي"&&!m.criminalStageType&&f.push("مرحلة القضية الجنائية مطلوبة"),s&&m.status==="مغلقة"){const $=c.query(l.ACTIONS,g=>g.caseId===t.id&&g.caseId!==""&&g.status!=="مكتمل"),y=c.query(l.DEADLINES,g=>g.caseId===t.id&&g.status==="مفتوح");$.length>0&&f.push(`لا يمكن إغلاق القضية: يوجد ${$.length} إجراء مفتوح مرتبط بها`),y.length>0&&f.push(`لا يمكن إغلاق القضية: يوجد ${y.length} موعد نهائي مفتوح`)}if(f.length>0){const $=document.getElementById("case-form-errors");$.style.display="block",$.innerHTML=f.join("<br>"),w("يرجى تصحيح الأخطاء","error");return}if(s)c.update(l.CASES,t.id,m),N(l.CASES,t.id,"update",m),w("تم تحديث القضية","success"),window.location.hash=`/cases/${t.id}`;else{const $=c.create(l.CASES,m);N(l.CASES,$.id,"create",m);const y=c.create(l.SESSIONS,{caseId:$.id,date:m.firstSessionDate,sessionType:m.caseType==="جنائي"&&m.criminalStageType==="تحقيقات نيابة"?"تحقيق":"جلسة استماع",decisionResult:"",nextSessionDate:"",notes:"جلسة أولى – تم إنشاؤها تلقائياً"});N(l.SESSIONS,y.id,"create",{auto:!0,caseId:$.id}),w("تم إنشاء القضية وجلستها الأولى بنجاح","success"),window.location.hash=`/cases/${$.id}`}})}const kt=[{decisionType:"تأجيل لإعادة الإعلان",actionType:"إعلان/خدمة",executionProof:"تاريخ التقديم للمحضر + رقم المرجع + النتيجة",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل لتصريح",actionType:"تصريح محكمة",executionProof:"رقم التصريح + التاريخ + المرفق",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل لمذكرة ومستندات",actionType:"حزمة تحضير",executionProof:"تفاصيل التقديم",subTasks:[{title:"صياغة المذكرة",completed:!1},{title:"مراجعة المذكرة",completed:!1},{title:"تحضير المستندات",completed:!1},{title:"تصوير ونسخ",completed:!1},{title:"تقديم الحزمة",completed:!1}],requiresNextDate:!0},{decisionType:"إحالة لخبير",actionType:"متابعة خبير",executionProof:"متابعة الموعد + تقديم الملاحظات + استلام التقرير",subTasks:[{title:"متابعة موعد الخبير",completed:!1},{title:"تقديم ملاحظات",completed:!1},{title:"استلام التقرير",completed:!1}],requiresNextDate:!0},{decisionType:"شطب",actionType:"تجديد من الشطب",executionProof:"تقديم طلب التجديد",subTasks:[],requiresNextDate:!1},{decisionType:"صدور حكم",actionType:"مراجعة حكم",executionProof:"مراجعة الحكم وتحديد الإجراء التالي",subTasks:[],requiresNextDate:!1},{decisionType:"حبس احتياطي",actionType:"حضور تجديد حبس",executionProof:"حضور جلسة التجديد",subTasks:[],requiresNextDate:!1,urgent:!0},{decisionType:"طلب تحقيقات",actionType:"متابعة تحقيق",executionProof:"استلام التحقيق + الخطوة التالية",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل للمرافعة",actionType:"حزمة تحضير",executionProof:"تحضير المرافعة",subTasks:[{title:"تحضير نقاط المرافعة",completed:!1},{title:"مراجعة القضية",completed:!1}],requiresNextDate:!0},{decisionType:"تأجيل للاطلاع",actionType:"حزمة تحضير",executionProof:"الاطلاع والتحضير",subTasks:[{title:"الاطلاع على المستندات",completed:!1},{title:"تحضير الرد",completed:!1}],requiresNextDate:!0},{decisionType:"تأجيل عام",actionType:"أخرى",executionProof:"",subTasks:[],requiresNextDate:!0},{decisionType:"إحالة للمحكمة",actionType:"أخرى",executionProof:"إنشاء قضية جديدة مرتبطة",subTasks:[],requiresNextDate:!1,createsLinkedCase:!0},{decisionType:"نطق بالحكم",actionType:"مراجعة حكم",executionProof:"مراجعة الحكم وتحديد الإجراء التالي",subTasks:[],requiresNextDate:!1}];function ye(){const e=c.getAll(l.DECISION_MAP);return e.length===0?(kt.forEach(t=>{c.create(l.DECISION_MAP,t)}),c.getAll(l.DECISION_MAP)):e}function ue(e){return ye().find(s=>s.decisionType===e)||null}function Dt(e,t){return c.update(l.DECISION_MAP,e,t)}function Lt(e){return c.create(l.DECISION_MAP,e)}function At(e){return c.softDelete(l.DECISION_MAP,e)}function Ct(e){const t=ue(e);return t?t.createsLinkedCase===!0:!1}function ie(e,t){c.getAll(e).length===0&&t.forEach((a,n)=>{c.create(e,{label:a,order:n})})}function ee(){return ie(l.LOOKUP_ACTION_TYPES,Me),c.getAll(l.LOOKUP_ACTION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0)).map(e=>e.label)}function Ke(){return ie(l.LOOKUP_DECISION_TYPES,Fe),c.getAll(l.LOOKUP_DECISION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0)).map(e=>e.label)}function Bt(){return ie(l.LOOKUP_ACTION_TYPES,Me),c.getAll(l.LOOKUP_ACTION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0))}function Nt(){return ie(l.LOOKUP_DECISION_TYPES,Fe),c.getAll(l.LOOKUP_DECISION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0))}function qt(e,t){const a=c.getAll(e).reduce((n,o)=>Math.max(n,o.order??0),0);return c.create(e,{label:t.trim(),order:a+1})}function Ot(e,t,s){return c.update(e,t,{label:s.trim()})}function Ut(e,t){const s=c.getById(e,t);if(!s)return{ok:!1};const a=ye();let n=null;return e===l.LOOKUP_ACTION_TYPES?n=a.some(o=>o.actionType===s.label):n=a.some(o=>o.decisionType===s.label),c.softDelete(e,t),n?{ok:!0,warning:`"${s.label}" محذوف من القائمة لكنه لا يزال مرتبطاً بربط قرارات. يُنصح بمراجعة صفحة ربط القرارات.`}:{ok:!0}}function Ve(e,t){if(!ae()){w("تعديل الإجراءات متاح للشركاء فقط","error");return}const s=c.getById(l.ACTIONS,e);if(!s)return;const a=c.getAll(l.CLIENTS),n=c.getAll(l.CASES),p=c.getAll(l.USERS).filter(y=>y.active&&be.includes(y.role)),u=s.status==="مكتمل",h=ee();function r(y){return y?n.filter(g=>(g.clientIds||(g.clientId?[g.clientId]:[])).includes(y)||g.primaryClientId===y||g.clientId===y):[]}const m=r(s.clientId),f=`
    <form id="edit-action-partner-form" autocomplete="off">

      ${u?`
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
            ${h.map(y=>`<option value="${y}" ${s.actionType===y?"selected":""}>${y}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select class="form-select" id="ea-priority">
            <option value="">بدون أولوية</option>
            ${me.map(y=>`<option value="${y}" ${s.priority===y?"selected":""}>${y}</option>`).join("")}
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
            ${a.map(y=>`<option value="${y.id}" ${s.clientId===y.id?"selected":""}>${y.name}</option>`).join("")}
          </select>
          <div class="form-hint">يجب أن يبقى الإجراء مرتبطاً بعميل دائماً</div>
        </div>
        <div class="form-group">
          <label class="form-label">القضية
            <span class="form-optional">(اختياري – حساس)</span></label>
          <select class="form-select" id="ea-case">
            <option value="">بدون قضية (مستوى العميل)</option>
            ${m.map(y=>`<option value="${y.id}" ${s.caseId===y.id?"selected":""}>${y.caseNo}/${y.year} – ${y.subject}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Responsible + Due Date -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المحامي المسؤول <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-responsible">
            ${p.map(y=>`<option value="${y.id}" ${s.responsibleUserId===y.id?"selected":""}>${y.name} (${y.role})</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق</label>
          <input type="date" class="form-input" id="ea-due-date" value="${s.dueDate||""}" />
        </div>
      </div>

      <!-- Post-completion execution fields (Partner can edit) -->
      ${u?`
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
    </form>`;j("تعديل الإجراء (شريك)",f,{footer:`
    <button class="btn btn-primary" id="ea-save-btn">💾 حفظ التعديلات</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`,large:!0}),document.getElementById("ea-client")?.addEventListener("change",()=>{const y=document.getElementById("ea-client").value,g=document.getElementById("ea-case");if(!g)return;const i=r(y);g.innerHTML='<option value="">بدون قضية (مستوى العميل)</option>'+i.map(b=>`<option value="${b.id}">${b.caseNo}/${b.year} – ${b.subject}</option>`).join("")}),document.getElementById("ea-save-btn").addEventListener("click",()=>{const y=document.getElementById("ea-action-type").value,g=document.getElementById("ea-title").value.trim(),i=document.getElementById("ea-priority").value,b=document.getElementById("ea-client").value,E=document.getElementById("ea-case")?.value||"",d=document.getElementById("ea-responsible").value,I=document.getElementById("ea-due-date").value,S=document.getElementById("ea-notes").value.trim(),k=u&&document.getElementById("ea-exec-date")?.value||s.executionDate,A=u&&document.getElementById("ea-exec-details")?.value?.trim()||s.executionDetails,D=document.getElementById("ea-edit-reason").value.trim(),B=[s.actionType!==y,s.responsibleUserId!==d,s.clientId!==b,s.caseId!==E,u&&(s.executionDate!==k||s.executionDetails!==A)].some(Boolean),v=[];if(b||v.push("العميل مطلوب – لا يمكن إزالة ربط الإجراء بعميل"),y||v.push("نوع الإجراء مطلوب"),d||v.push("المحامي المسؤول مطلوب"),B&&!D&&v.push("سبب التعديل مطلوب عند تغيير الحقول الحساسة"),E){const T=c.getById(l.CASES,E);T&&((T.clientIds||(T.clientId?[T.clientId]:[])).includes(b)||T.primaryClientId===b||T.clientId===b||v.push("القضية المختارة لا تنتمي للعميل المحدد"))}if(v.length>0){const T=document.getElementById("ea-errors");T.style.display="block",T.innerHTML=v.join("<br>");return}const x={actionType:y,title:g,priority:i,clientId:b,caseId:E,responsibleUserId:d,dueDate:I,notes:S,executionDate:k,executionDetails:A};Et(e,s,x,D),c.update(l.ACTIONS,e,x),w("تم حفظ التعديلات بنجاح","success"),O(),typeof t=="function"&&t()})}function _t(e,t){const s=c.getById(l.ACTIONS,e);if(!s)return;if(s.status==="مكتمل"){w("هذا الإجراء مكتمل بالفعل ولا يمكن تعديل تقدمه","warning");return}const a=`
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
    </form>`;j("تحديث تقدم الإجراء",a,{footer:`
    <button class="btn btn-primary" id="pu-save-btn">✓ حفظ التقدم</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`});const o=document.getElementById("pu-status"),p=document.getElementById("pu-completion-fields");o?.addEventListener("change",()=>{p.style.display=o.value==="مكتمل"?"block":"none"}),document.getElementById("pu-save-btn").addEventListener("click",()=>{const u=document.getElementById("pu-status").value,h=document.getElementById("pu-notes").value.trim(),r=document.getElementById("pu-exec-date")?.value||"",m=document.getElementById("pu-exec-details")?.value?.trim()||"",f=[];if(u==="مكتمل"&&(r||f.push("تاريخ التنفيذ مطلوب لإكمال الإجراء"),m||f.push("تفاصيل التنفيذ / الإثبات مطلوبة لإكمال الإجراء")),f.length>0){const i=document.getElementById("pu-errors");i.style.display="block",i.innerHTML=f.join("<br>");return}const $={status:u,notes:h};u==="مكتمل"&&($.executionDate=r,$.executionDetails=m),c.update(l.ACTIONS,e,$);const y=u==="مكتمل"?"complete":"status_change";N(l.ACTIONS,e,y,{oldStatus:s.status,newStatus:u,notes:h});const g=u==="مكتمل"?"تم إكمال الإجراء ✓":`تم تحديث الحالة إلى: ${u}`;w(g,"success"),O(),typeof t=="function"&&t()})}function J(e,t={}){const s=c.getById(l.CASES,t.id);if(!s){e.innerHTML=`<div class="empty-state"><h3>القضية غير موجودة</h3><button class="btn btn-primary" onclick="window.location.hash='/cases'">العودة للقضايا</button></div>`;return}const a=c.getById(l.CLIENTS,s.primaryClientId||s.clientId),p=(s.clientIds||(s.clientId?[s.clientId]:[])).map(i=>c.getById(l.CLIENTS,i)).filter(Boolean).length>1?`${a?a.name:"—"} وآخرون`:a?a.name:"—",u=c.getById(l.USERS,s.ownerId),h=c.query(l.SESSIONS,i=>i.caseId===t.id).sort((i,b)=>new Date(b.date)-new Date(i.date)),r=c.query(l.ACTIONS,i=>i.caseId===t.id),m=c.query(l.DEADLINES,i=>i.caseId===t.id),f=c.getAll(l.USERS),$=r.filter(i=>i.status!=="مكتمل");m.filter(i=>i.status==="مفتوح");const y=pe[s.caseType]||"civil",g=je[s.status]||"active";U(`القضية ${s.caseNo}/${s.year}`),e.innerHTML=`
    <div class="animate-fade-in">
      <!-- Case Header -->
      <div class="case-detail-header">
        <div class="case-detail-info">
          <div class="case-badges">
            <span class="badge badge-${y}">${s.caseType}</span>
            <span class="badge badge-${g}">${s.status}</span>
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
              <div class="detail-item-value">${u?u.name:"—"}</div>
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
          <i class='bx bx-list-check'></i> الجلسات <span class="tab-count">${h.length}</span>
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
          ${h.length===0?'<div class="empty-state"><p>لا توجد جلسات بعد</p></div>':""}
          ${h.map(i=>{const b=i.sessionType==="تحقيق",E=i.decisionResult?.includes("حكم"),d=i.status==="مغلق";return`
              <div class="timeline-item">
                <div class="timeline-dot ${E?"judgment":""} ${b?"investigation":""}"></div>
                <div class="timeline-content">
                  <div class="flex justify-between items-center">
                    <div class="timeline-date">${_(i.date)}</div>
                    <div class="flex items-center gap-2">
                      <span class="session-status-badge ${d?"session-status-closed":"session-status-open"}">${d?"مغلق":"مفتوح"}</span>
                      <span class="badge badge-${b?"criminal":"civil"}">${i.sessionType}</span>
                    </div>
                  </div>
                  <div class="timeline-title">${i.decisionResult||"بدون قرار بعد"}</div>
                  ${i.closureReason?`<div class="text-xs text-secondary mt-1">سبب الإغلاق: ${i.closureReason}</div>`:""}
                  ${i.nextSessionDate?`<div class="text-xs text-secondary mt-2">الجلسة التالية: ${_(i.nextSessionDate)}</div>`:""}
                  ${i.notes?`<div class="timeline-desc mt-2">${i.notes}</div>`:""}
                  <div class="flex gap-2 mt-2">
                    <button class="btn btn-ghost btn-sm edit-session-btn" data-id="${i.id}"><i class='bx bx-edit'></i> تعديل</button>
                    ${d?"":`<button class="btn btn-primary btn-sm close-session-btn" data-id="${i.id}">✓ إغلاق الجلسة</button>`}
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
        ${r.map(i=>{const b=c.getById(l.USERS,i.responsibleUserId),E=i.clientId?c.getById(l.CLIENTS,i.clientId):null,d=Pe[i.status]||"open",I=i.dueDate&&ne(i.dueDate)&&i.status!=="مكتمل",S=ae(),k=R(),A=i.status!=="مكتمل"&&(ae()||k&&i.responsibleUserId===k.id),D=St(i.id),B=D.length===0?'<div class="text-xs text-secondary" style="padding:var(--space-2) 0">لا توجد سجلات تعديل</div>':D.map(v=>{const x=v.changes,T=new Date(v.timestamp).toLocaleString("ar-EG",{dateStyle:"short",timeStyle:"short"});if(v.action==="field_change"&&x&&x.field)return`<div class="action-history-entry">
                        <span class="action-history-time">${T}</span>
                        <span class="action-history-who">${v.userName}</span>
                        <span class="action-history-change">غيّر <strong>${x.fieldLabel}</strong>: <span class="old-val">${x.oldValue||"—"}</span> ← <span class="new-val">${x.newValue||"—"}</span>${x.editReason?` (السبب: ${x.editReason})`:""}</span>
                    </div>`;const C={create:"إنشاء",complete:"إكمال",update:"تعديل",delete:"حذف"}[v.action]||v.action;return`<div class="action-history-entry">
                    <span class="action-history-time">${T}</span>
                    <span class="action-history-who">${v.userName}</span>
                    <span class="action-history-change">${C}</span>
                </div>`}).join("");return`
            <div class="card mb-4 ${I?"risk-flag high":""}" style="border-right: 3px solid ${i.status==="مكتمل"?"var(--status-completed)":i.status==="معلق"?"var(--status-blocked)":"var(--status-progress)"};"
                 data-action-id="${i.id}">

              <!-- Header row: type + badges + buttons -->
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${i.actionType}</strong>
                  <span class="badge badge-${d}">${i.status}</span>
                  ${I?'<span class="badge badge-blocked">متأخر</span>':""}
                  ${i.caseId?"":'<span class="badge badge-open" style="font-size:9px;">مستوى العميل</span>'}
                </div>
                <div class="flex gap-2">
                  ${A?`<button class="btn btn-primary btn-sm complete-action-btn" data-id="${i.id}">✓ إكمال</button>`:""}
                  ${S?`<button class="btn btn-ghost btn-sm edit-action-btn" data-id="${i.id}" title="تعديل الإجراء (شريك فقط)"><i class='bx bx-edit'></i> تعديل</button>`:""}
                </div>
              </div>

              <!-- Details -->
              ${E?`<div class="text-xs text-secondary mb-1">العميل: <strong>${E.name}</strong></div>`:""}
              <div class="text-sm text-secondary">المسؤول: ${b?b.name:"—"}</div>
              ${i.title?`<div class="text-sm text-secondary mt-1">الوصف: ${i.title}</div>`:""}
              ${i.priority?`<span class="badge badge-progress" style="margin-top:4px;display:inline-block;">أولوية: ${i.priority}</span>`:""}
              ${i.dueDate?`<div class="text-xs text-secondary mt-1">تاريخ الاستحقاق: ${_(i.dueDate)}</div>`:""}
              ${i.executionDate?`<div class="text-xs text-accent mt-1">تم التنفيذ: ${_(i.executionDate)}</div>`:""}
              ${i.executionDetails?`<div class="text-sm mt-2" style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-sm);">${i.executionDetails}</div>`:""}
              ${i.notes?`<div class="text-xs text-secondary mt-2">${i.notes}</div>`:""}

              <!-- Sub-tasks -->
              ${i.subTasks&&i.subTasks.length>0?`
                <div class="mt-4">
                  <div class="text-xs font-semibold text-secondary mb-2">المهام الفرعية:</div>
                  <ul class="subtask-list">
                    ${i.subTasks.map((v,x)=>`
                      <li class="subtask-item ${v.completed?"completed":""}">
                        <input type="checkbox" ${v.completed?"checked":""} class="subtask-check" data-action-id="${i.id}" data-idx="${x}" />
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
                  ${B}
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
        ${m.map(i=>{const b=c.getById(l.USERS,i.responsibleUserId),E=Re[i.status]||"open",d=G(i.endDate),I=i.status==="مفتوح"&&d<0,S=i.status==="مفتوح"&&d>=0&&d<=3;return`
            <div class="card mb-4" style="border-right: 3px solid ${I?"var(--risk-high)":S?"var(--risk-medium)":i.status==="مكتمل"?"var(--status-completed)":"var(--status-open)"};">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${i.deadlineType}</strong>
                  <span class="badge badge-${E}">${i.status}</span>
                  ${I?'<span class="badge badge-blocked">متأخر!</span>':""}
                  ${S?'<span class="badge badge-progress">يقترب</span>':""}
                </div>
                ${i.status==="مفتوح"?`<button class="btn btn-primary btn-sm complete-deadline-btn" data-id="${i.id}">✓ إكمال</button>`:""}
              </div>
              <div class="flex gap-6 text-sm text-secondary">
                <span>من: ${_(i.startDate)}</span>
                <span>إلى: ${_(i.endDate)}</span>
                <span>المسؤول: ${b?b.name:"—"}</span>
              </div>
              ${i.status==="مفتوح"?`<div class="text-xs mt-2 ${I?"text-accent":""}">${I?`متأخر بـ ${Math.abs(d)} يوم`:d===0?"اليوم!":`متبقي ${d} يوم`}</div>`:""}
              ${i.completionNote?`<div class="text-sm mt-2" style="background: var(--bg-tertiary); padding: var(--space-3); border-radius: var(--radius-sm);">ملاحظة الإكمال: ${i.completionNote}</div>`:""}
            </div>
          `}).join("")}
      </div>
    </div>
  `,e.querySelectorAll(".tab-btn").forEach(i=>{i.addEventListener("click",()=>{e.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active")),e.querySelectorAll(".tab-panel").forEach(b=>b.classList.remove("active")),i.classList.add("active"),document.getElementById(`tab-${i.dataset.tab}`).classList.add("active")})}),e.querySelector("#add-session-btn")?.addEventListener("click",()=>{ce(t.id,s,f,e,t)}),e.querySelector("#create-action-btn")?.addEventListener("click",()=>{const i=s.primaryClientId||s.clientId||"";jt(t.id,i,s,f,e,t)}),e.querySelectorAll(".edit-session-btn").forEach(i=>{i.addEventListener("click",()=>{const b=c.getById(l.SESSIONS,i.dataset.id);b&&ce(t.id,s,f,e,t,b,!1)})}),e.querySelectorAll(".close-session-btn").forEach(i=>{i.addEventListener("click",()=>{const b=c.getById(l.SESSIONS,i.dataset.id);b&&ce(t.id,s,f,e,t,b,!0)})}),e.querySelectorAll(".complete-action-btn").forEach(i=>{i.addEventListener("click",()=>{Pt(i.dataset.id,e,t)})}),e.querySelectorAll(".edit-action-btn").forEach(i=>{i.addEventListener("click",()=>{Ve(i.dataset.id,()=>J(e,t))})}),e.querySelectorAll(".action-history-toggle").forEach(i=>{i.addEventListener("click",()=>{const b=document.getElementById(i.dataset.target);if(!b)return;const E=b.style.display==="none";b.style.display=E?"block":"none",i.classList.toggle("open",E)})}),e.querySelectorAll(".subtask-check").forEach(i=>{i.addEventListener("change",()=>{const b=c.getById(l.ACTIONS,i.dataset.actionId);if(b){const E=parseInt(i.dataset.idx);b.subTasks[E].completed=i.checked,c.update(l.ACTIONS,b.id,{subTasks:b.subTasks}),N(l.ACTIONS,b.id,"update",{subTaskIndex:E,completed:i.checked})}})}),e.querySelector("#add-deadline-btn")?.addEventListener("click",()=>{Rt(t.id,f,e,t)}),e.querySelectorAll(".complete-deadline-btn").forEach(i=>{i.addEventListener("click",()=>{Mt(i.dataset.id,e,t)})})}function jt(e,t,s,a,n,o){const p=a.filter(r=>r.active&&be.includes(r.role)),u=`
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
            ${me.map(r=>`<option value="${r}">${r}</option>`).join("")}
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
  `;j("إنشاء إجراء يدوي",u,{footer:`
    <button class="btn btn-primary" id="save-create-action-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `,large:!0}),document.getElementById("save-create-action-btn").addEventListener("click",()=>{const r=document.getElementById("ca-action-type").value,m=document.getElementById("ca-title").value.trim(),f=document.getElementById("ca-priority").value,$=document.getElementById("ca-responsible").value,y=document.getElementById("ca-due-date").value,g=document.getElementById("ca-notes").value.trim(),i=[];if(r||i.push("نوع الإجراء مطلوب"),$||i.push("المحامي المسؤول مطلوب – يجب اختياره"),i.length>0){const d=document.getElementById("ca-errors");d.style.display="block",d.innerHTML=i.join("<br>");return}const b=ve({clientId:t,caseId:e,sessionId:"",actionType:r,title:m,priority:f,responsibleUserId:$,status:"مفتوح",dueDate:y,notes:g}),E=c.create(l.ACTIONS,b);N(l.ACTIONS,E.id,"create",{manual:!0,actionType:r,responsibleUserId:$,caseId:e}),w(`تم إنشاء الإجراء: ${r}`,"success"),O(),J(n,o)})}function ce(e,t,s,a,n,o=null,p=!1){const u=!!o,r=t.caseType==="جنائي"&&t.criminalStageType==="تحقيقات نيابة"?"التحقيق":"الجلسة",m=p,f=`
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
            ${lt.map(i=>`<option value="${i}" ${o?.sessionType===i?"selected":""}>${i}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">نتيجة القرار <span class="required">*</span></label>
        <select class="form-select" id="session-decision" required>
          <option value="">اختر القرار</option>
          ${Ke().map(i=>`<option value="${i}" ${o?.decisionResult===i?"selected":""}>${i}</option>`).join("")}
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
          ${ct.map(i=>`<option value="${i}" ${o?.closureReason===i?"selected":""}>${i}</option>`).join("")}
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
  `,y=`
    <button class="btn btn-primary" id="save-session-btn">${m?"✓ حفظ وإغلاق الجلسة":u?"💾 حفظ":"✓ حفظ الجلسة وإنشاء الإجراء"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;j(`${m?"إغلاق":u?"تعديل":"إضافة"} ${r}`,f,{footer:y,large:!0});function g(){const i=document.getElementById("session-decision").value,b=ue(i),E=document.getElementById("session-action-preview"),d=document.getElementById("action-preview-text"),I=document.getElementById("next-date-required"),S=document.getElementById("closure-reason-group"),k=document.getElementById("next-date-group"),A=b?b.requiresNextDate:!1;b?(E.style.display="block",d.textContent=`سيتم إنشاء إجراء تلقائي: ${b.actionType}`,b.subTasks?.length>0&&(d.textContent+=` (${b.subTasks.length} مهام فرعية)`)):E.style.display="none",A?(k.style.display="block",I.style.display="inline",S.style.display="none"):i?(k.style.display="block",I.style.display="none",m?S.style.display="block":S.style.display="none"):(k.style.display="block",I.style.display="inline",S.style.display="none")}document.getElementById("session-decision").addEventListener("change",g),g(),document.getElementById("save-session-btn").addEventListener("click",()=>{const i=document.getElementById("session-date").value,b=document.getElementById("session-type").value,E=document.getElementById("session-decision").value,d=document.getElementById("session-next-date").value,I=document.getElementById("session-closure-reason")?.value||"",S=document.getElementById("session-notes").value,k=[];i||k.push("تاريخ الجلسة مطلوب"),b||k.push("نوع الجلسة مطلوب"),m&&!E&&k.push("لا يمكن إغلاق الجلسة بدون تسجيل القرار/النتيجة"),!m&&!E&&k.push("نتيجة القرار مطلوبة");const A=ue(E),D=A?A.requiresNextDate:!1;if(D&&!d&&k.push("تاريخ الجلسة التالية مطلوب لهذا النوع من القرار"),m&&!D&&E&&!d&&!I&&k.push("يجب اختيار سبب عدم وجود جلسة تالية لإغلاق الجلسة"),k.length>0){const C=document.getElementById("session-form-errors");C.style.display="block",C.innerHTML=k.join("<br>");return}const B=m?"مغلق":o?.status||"مفتوح",v=Ee({caseId:e,date:i,sessionType:b,decisionResult:E,nextSessionDate:d,status:B,closureReason:m?I:o?.closureReason||"",notes:S});let x;if(u?(c.update(l.SESSIONS,o.id,v),N(l.SESSIONS,o.id,"update",v),x={...o,...v}):(x=c.create(l.SESSIONS,v),N(l.SESSIONS,x.id,"create",v)),d&&c.query(l.SESSIONS,L=>L.caseId===e&&L.date===d&&L.id!==x.id).length===0){const L=Ee({caseId:e,date:d,sessionType:b,decisionResult:"",nextSessionDate:"",status:"مفتوح",closureReason:"",notes:"جلسة تالية – تم إنشاؤها تلقائياً"}),M=c.create(l.SESSIONS,L);N(l.SESSIONS,M.id,"create",{auto:!0,fromSession:x.id})}let T=!1;if(A)try{if(c.query(l.ACTIONS,L=>L.sessionId===x.id&&L.actionType===A.actionType).length===0){const L=c.getById(l.CASES,e),M=ve({caseId:e,sessionId:x.id,actionType:A.actionType,responsibleUserId:L?.ownerId||"",status:"مفتوح",subTasks:A.subTasks?A.subTasks.map(F=>({...F})):[],dueDate:d||"",notes:A.executionProof?`إثبات التنفيذ المطلوب: ${A.executionProof}`:""}),H=c.create(l.ACTIONS,M);N(l.ACTIONS,H.id,"create",{auto:!0,decision:E,sessionId:x.id}),T=!0,console.log("Action automatically created:",H)}else console.log("Action of this type already exists for this session, skipping creation.")}catch(C){console.error("Error creating action:",C),w("حدث خطأ أثناء إنشاء الإجراء التلقائي","error")}w(T?`تم ${m?"إغلاق":"حفظ"} الجلسة وإنشاء إجراء: ${A.actionType}`:m?"تم إغلاق الجلسة بنجاح":"تم حفظ الجلسة","success"),!u&&Ct(E)&&c.getById(l.CASES,e)&&w("يمكنك الآن إنشاء قضية محكمة مرتبطة من صفحة القضايا","info",5e3),O(),J(a,n)})}function Pt(e,t,s){const a=c.getById(l.ACTIONS,e);if(!a)return;const n=`
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
  `;j("إكمال الإجراء",n,{footer:`
    <button class="btn btn-primary" id="confirm-complete-action">✓ تأكيد الإكمال</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("confirm-complete-action").addEventListener("click",()=>{const p=document.getElementById("action-exec-date").value,u=document.getElementById("action-exec-details").value.trim();if(!p||!u){const h=document.getElementById("complete-action-errors");h.style.display="block",h.innerHTML="تاريخ التنفيذ وتفاصيل التنفيذ مطلوبان",w("لا يمكن إكمال الإجراء بدون بيانات التنفيذ","error");return}c.update(l.ACTIONS,e,{status:"مكتمل",executionDate:p,executionDetails:u}),N(l.ACTIONS,e,"complete",{executionDate:p}),w("تم إكمال الإجراء بنجاح","success"),O(),J(t,s)})}function Rt(e,t,s,a){const n=`
    <form id="deadline-modal-form">
      <div class="form-group">
        <label class="form-label">نوع الموعد النهائي <span class="required">*</span></label>
        <select class="form-select" id="deadline-type" required>
          <option value="">اختر النوع</option>
          ${He.map(p=>`<option value="${p}">${p}</option>`).join("")}
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
  `;j("إضافة موعد نهائي",n,{footer:`
    <button class="btn btn-primary" id="save-deadline-btn">✓ إضافة الموعد</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-deadline-btn").addEventListener("click",()=>{const p=document.getElementById("deadline-type").value,u=document.getElementById("deadline-start").value,h=document.getElementById("deadline-end").value,r=document.getElementById("deadline-responsible").value;if(!p||!u||!h||!r){document.getElementById("deadline-form-errors").style.display="block",document.getElementById("deadline-form-errors").innerHTML="جميع الحقول مطلوبة";return}const m=pt({caseId:e,deadlineType:p,startDate:u,endDate:h,responsibleUserId:r}),f=c.create(l.DEADLINES,m);N(l.DEADLINES,f.id,"create",m),w("تم إضافة الموعد النهائي","success"),O(),J(s,a)})}function Mt(e,t,s){j("إكمال الموعد النهائي",`
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
  `}),document.getElementById("confirm-complete-deadline").addEventListener("click",()=>{const o=document.getElementById("deadline-completion-note").value.trim();if(!o){document.getElementById("deadline-complete-errors").style.display="block",document.getElementById("deadline-complete-errors").innerHTML="ملاحظة الإكمال مطلوبة";return}c.update(l.DEADLINES,e,{status:"مكتمل",completionNote:o}),N(l.DEADLINES,e,"complete",{completionNote:o}),w("تم إكمال الموعد النهائي","success"),O(),J(t,s)})}function X(e){U("الإجراءات");const t=R(),s=t?Z(t):null,a=s==="lawyer"||s==="trainee";let n=c.getAll(l.ACTIONS);a&&t&&(n=n.filter(i=>i.responsibleUserId===t.id));const o=c.getAll(l.CASES),p=c.getAll(l.CLIENTS),u=c.getAll(l.USERS);function h(){if(!a)return p;const i=new Set;return o.forEach(b=>{const E=b.ownerId===(t&&t.id),d=n.some(I=>I.caseId===b.id&&I.responsibleUserId===(t&&t.id));(E||d)&&(b.primaryClientId&&i.add(b.primaryClientId),b.clientId&&i.add(b.clientId),(b.clientIds||[]).forEach(I=>i.add(I)))}),p.filter(b=>i.has(b.id))}const r=h();e.innerHTML=`
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
          ${u.map(i=>`<option value="${i.id}">${i.name} (${i.role})</option>`).join("")}
        </select>`}
      </div>

      <div id="actions-container"></div>
    </div>
  `;function m(){const i=document.getElementById("action-search").value.toLowerCase(),b=document.getElementById("filter-action-type").value,E=document.getElementById("filter-action-status").value,d=document.getElementById("filter-action-scope").value,I=a?"":document.getElementById("filter-responsible")?.value||"";let S=n;b&&(S=S.filter(D=>D.actionType===b)),E&&(S=S.filter(D=>D.status===E)),d==="case"&&(S=S.filter(D=>!!D.caseId)),d==="client"&&(S=S.filter(D=>!D.caseId)),I&&(S=S.filter(D=>D.responsibleUserId===I)),i&&(S=S.filter(D=>{const B=D.caseId?c.getById(l.CASES,D.caseId):null,v=D.clientId?c.getById(l.CLIENTS,D.clientId):null;return D.actionType.toLowerCase().includes(i)||D.title&&D.title.toLowerCase().includes(i)||D.notes&&D.notes.toLowerCase().includes(i)||B&&(B.caseNo.includes(i)||B.subject.toLowerCase().includes(i))||v&&v.name.toLowerCase().includes(i)}));const k={};S.forEach(D=>{const B=D.actionType||"غير محدد";k[B]||(k[B]=[]),k[B].push(D)});const A=document.getElementById("actions-container");if(Object.keys(k).length===0){A.innerHTML='<div class="empty-state"><p>لا توجد إجراءات</p></div>';return}A.innerHTML=Object.entries(k).map(([D,B])=>`
      <div class="action-group">
        <div class="action-group-header">
          <span class="action-group-icon"><i class='bx bxs-zap'></i></span>
          <span class="action-group-title">${D}</span>
          <span class="action-group-count">${B.length}</span>
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
              ${B.map(v=>{const x=v.caseId?c.getById(l.CASES,v.caseId):null,C=(v.clientId?c.getById(l.CLIENTS,v.clientId):null)||(x?c.getById(l.CLIENTS,x.primaryClientId||x.clientId):null),L=c.getById(l.USERS,v.responsibleUserId),M=Pe[v.status]||"open",H=v.dueDate&&ne(v.dueDate)&&v.status!=="مكتمل",F=!v.caseId,z=ae(),P=t&&v.responsibleUserId===t.id,oe=!a||F||t&&x&&(x.ownerId===t.id||v.responsibleUserId===t.id),Ze=z?`<button class="btn btn-ghost btn-sm action-edit-btn" data-id="${v.id}" title="تعديل شامل"><i class='bx bx-edit'></i> تعديل</button>`:"",Qe=!z&&P&&v.status!=="مكتمل"?`<button class="btn btn-primary btn-sm action-progress-btn" data-id="${v.id}"><i class='bx bxs-zap'></i> تحديث التقدم</button>`:"",et=x&&oe?`<button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${v.caseId}'">عرض القضية ←</button>`:x&&!oe?'<span class="text-secondary text-xs">لا يوجد وصول</span>':"";return`
                  <tr class="${H?"risk-flag high":""}">
                    <td>
                      <span class="text-sm font-semibold">${C?C.name:"—"}</span>
                    </td>
                    <td>
                      ${x?oe?`<a href="#/cases/${v.caseId}" style="color:var(--text-link);">${x.caseNo}/${x.year}</a>`:`<span class="text-secondary">${x.caseNo}/${x.year}</span>`:'<span class="badge badge-open" style="font-size:10px;">مستوى العميل</span>'}
                    </td>
                    <td class="text-sm">${v.title||"—"}</td>
                    <td>${L?L.name:"—"}</td>
                    <td>
                      <span class="badge badge-${M}">${v.status}</span>
                      ${H?'<span class="badge badge-blocked">متأخر</span>':""}
                    </td>
                    <td>${v.priority?`<span class="badge badge-progress">${v.priority}</span>`:"—"}</td>
                    <td>${_(v.dueDate)}</td>
                    <td>
                      <div class="flex gap-2" style="align-items:center;">
                        ${Ze}
                        ${Qe}
                        ${et}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `).join("")}m();function f(){document.querySelectorAll(".action-edit-btn").forEach(i=>{i.addEventListener("click",()=>{Ve(i.dataset.id,()=>X(e))})}),document.querySelectorAll(".action-progress-btn").forEach(i=>{i.addEventListener("click",()=>{_t(i.dataset.id,()=>X(e))})})}const $=m;function y(){$(),f()}document.getElementById("action-search").removeEventListener("input",m),document.getElementById("action-search").addEventListener("input",y),document.getElementById("filter-action-type").removeEventListener("change",m),document.getElementById("filter-action-type").addEventListener("change",y),document.getElementById("filter-action-status").removeEventListener("change",m),document.getElementById("filter-action-status").addEventListener("change",y),document.getElementById("filter-action-scope").removeEventListener("change",m),document.getElementById("filter-action-scope").addEventListener("change",y),a||document.getElementById("filter-responsible")?.addEventListener("change",y),f(),e.querySelector("#global-create-action-btn")?.addEventListener("click",()=>{Ht(r,o,u,a,t,e)});function g(){X(e)}e._refreshActionList=g}function Ht(e,t,s,a,n,o){const p=s.filter(g=>g.active&&be.includes(g.role)),h=`
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
            ${e.map(g=>`<option value="${g.id}">${g.name}</option>`).join("")}
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
            ${ee().map(g=>`<option value="${g}">${g}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية <span class="form-optional">(اختياري)</span></label>
          <select class="form-select" id="gca-priority">
            <option value="">بدون أولوية</option>
            ${me.map(g=>`<option value="${g}">${g}</option>`).join("")}
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
            ${p.map(g=>`<option value="${g.id}">${g.name} (${g.role})</option>`).join("")}
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
  `;j("إنشاء إجراء جديد",h,{footer:`
    <button class="btn btn-primary" id="gca-save-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `,large:!0});const m=document.getElementById("gca-client-search"),f=document.getElementById("gca-client"),$=document.getElementById("gca-case"),y=document.getElementById("gca-case-hint");Array.from(f.options),m.addEventListener("input",()=>{const g=m.value.trim().toLowerCase();f.innerHTML='<option value="">اختر العميل...</option>',e.filter(b=>b.name.toLowerCase().includes(g)).forEach(b=>{const E=document.createElement("option");E.value=b.id,E.textContent=b.name,f.appendChild(E)})}),f.addEventListener("change",()=>{const g=f.value;if($.innerHTML="",$.disabled=!0,!g){$.innerHTML='<option value="">اختر العميل أولاً...</option>',y.textContent="اختر العميل لتحميل قضاياه";return}const i=t.filter(E=>(E.clientIds||(E.clientId?[E.clientId]:[])).includes(g)||E.primaryClientId===g||E.clientId===g),b=a&&n?i.filter(E=>E.ownerId===n.id||c.getAll(l.ACTIONS).some(d=>d.caseId===E.id&&d.responsibleUserId===n.id)):i;$.innerHTML='<option value="">بدون قضية (إجراء على مستوى العميل)</option>',b.forEach(E=>{const d=document.createElement("option");d.value=E.id,d.textContent=`${E.caseNo}/${E.year} – ${E.subject}`,d.dataset.ownerId=E.ownerId||"",$.appendChild(d)}),$.disabled=!1,y.textContent=b.length===0?"لا توجد قضايا متاحة لهذا العميل":`${b.length} قضية – اختياري`}),$.addEventListener("change",()=>{const i=$.options[$.selectedIndex]?.dataset?.ownerId;if(i){const b=document.getElementById("gca-responsible");b&&Array.from(b.options).find(d=>d.value===i)&&(b.value=i)}}),document.getElementById("gca-save-btn").addEventListener("click",()=>{const g=document.getElementById("gca-client").value,i=document.getElementById("gca-case").value,b=document.getElementById("gca-action-type").value,E=document.getElementById("gca-title").value.trim(),d=document.getElementById("gca-priority").value,I=document.getElementById("gca-responsible").value,S=document.getElementById("gca-due-date").value,k=document.getElementById("gca-notes").value.trim(),A=[];if(g||A.push("العميل مطلوب – لا يمكن حفظ الإجراء بدون تحديد العميل"),b||A.push("نوع الإجراء مطلوب"),E||A.push("عنوان / وصف الإجراء مطلوب"),I||A.push("المحامي المسؤول مطلوب"),i){const T=c.getById(l.CASES,i);T&&((T.clientIds||(T.clientId?[T.clientId]:[])).includes(g)||T.primaryClientId===g||T.clientId===g||A.push("القضية المختارة لا تنتمي للعميل المحدد"))}if(A.length>0){const T=document.getElementById("gca-errors");T.style.display="block",T.innerHTML=A.join("<br>");return}const D=ve({clientId:g,caseId:i||"",sessionId:"",actionType:b,title:E,priority:d,responsibleUserId:I,status:"مفتوح",dueDate:S,notes:k}),B=c.create(l.ACTIONS,D);N(l.ACTIONS,B.id,"create",{source:"global",clientId:g,caseId:i||null,actionType:b,responsibleUserId:I});const v=c.getById(l.CLIENTS,g)?.name||"";w(`تم إنشاء الإجراء: ${b} – ${v} (${i?"ضمن القضية":"على مستوى العميل"})`,"success"),O(),X(o)})}function Ft(e){U("المواعيد النهائية");const t=c.getAll(l.DEADLINES);e.innerHTML=`
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
          ${He.map(a=>`<option value="${a}">${a}</option>`).join("")}
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
  `;function s(){const a=document.getElementById("filter-dl-type").value,n=document.getElementById("filter-dl-status").value;let o=t;a&&(o=o.filter(u=>u.deadlineType===a)),n&&(o=o.filter(u=>u.status===n)),o.sort((u,h)=>new Date(u.endDate)-new Date(h.endDate));const p=document.getElementById("dl-table-body");if(o.length===0){p.innerHTML='<tr><td colspan="8"><div class="empty-state"><p>لا توجد مواعيد نهائية</p></div></td></tr>';return}p.innerHTML=o.map(u=>{const h=c.getById(l.CASES,u.caseId),r=c.getById(l.USERS,u.responsibleUserId),m=Re[u.status]||"open",f=G(u.endDate),$=u.status==="مفتوح"&&f<0,y=u.status==="مفتوح"&&f>=0&&f<=3;return`
        <tr class="${$?"risk-flag high":y?"risk-flag medium":""}">
          <td><strong>${u.deadlineType}</strong></td>
          <td>
            <a href="#/cases/${u.caseId}" style="color: var(--text-link);">
              ${h?h.caseNo+"/"+h.year:"—"}
            </a>
          </td>
          <td>${_(u.startDate)}</td>
          <td>${_(u.endDate)}</td>
          <td>
            ${u.status==="مفتوح"?$?`<span class="badge badge-blocked">متأخر ${Math.abs(f)} يوم</span>`:f===0?'<span class="badge badge-progress">اليوم!</span>':`<span class="badge ${y?"badge-progress":"badge-open"}">${f} يوم</span>`:"—"}
          </td>
          <td>${r?r.name:"—"}</td>
          <td><span class="badge badge-${m}">${u.status}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${u.caseId}'">عرض ←</button>
          </td>
        </tr>
      `}).join("")}s(),document.getElementById("filter-dl-type").addEventListener("change",s),document.getElementById("filter-dl-status").addEventListener("change",s)}function fe(e){if(U("ربط القرارات بالإجراءات"),!Q()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=ye();e.innerHTML=`
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
  `,e.querySelector("#add-mapping-btn").addEventListener("click",()=>{De(null,e)}),e.querySelectorAll(".edit-mapping").forEach(s=>{s.addEventListener("click",()=>{const a=t.find(n=>n.id===s.dataset.id);a&&De(a,e)})}),e.querySelectorAll(".delete-mapping").forEach(s=>{s.addEventListener("click",()=>{At(s.dataset.id),w("تم حذف الربط","success"),fe(e)})})}function De(e,t){const s=!!e,a=Ke(),n=ee(),o=`
    <form id="mapping-form">
      <div class="form-group">
        <label class="form-label">نوع القرار <span class="required">*</span></label>
        <select class="form-select" id="map-decision" required>
          <option value="">اختر</option>
          ${a.map(u=>`<option value="${u}" ${e?.decisionType===u?"selected":""}>${u}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">الإجراء المنشأ <span class="required">*</span></label>
        <select class="form-select" id="map-action" required>
          <option value="">اختر</option>
          ${n.map(u=>`<option value="${u}" ${e?.actionType===u?"selected":""}>${u}</option>`).join("")}
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
  `;j(s?"تعديل الربط":"إضافة ربط جديد",o,{footer:`
    <button class="btn btn-primary" id="save-mapping">${s?"💾 حفظ":"✓ إضافة"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-mapping").addEventListener("click",()=>{const u={decisionType:document.getElementById("map-decision").value,actionType:document.getElementById("map-action").value,executionProof:document.getElementById("map-proof").value,requiresNextDate:document.getElementById("map-requires-date").checked,urgent:document.getElementById("map-urgent").checked};if(!u.decisionType||!u.actionType){w("نوع القرار والإجراء مطلوبان","error");return}s?Dt(e.id,u):Lt(u),w(s?"تم تحديث الربط":"تم إضافة الربط","success"),O(),fe(t)})}const zt="/api";function We(e){if(U("إدارة المستخدمين"),!Q()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=c.getAll(l.USERS);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-user-detail'></i> إدارة المستخدمين</h1>
          <div class="page-header-sub">${t.length} مستخدم</div>
        </div>
        <button class="btn btn-primary" id="add-user-btn"><i class='bx bx-plus'></i> إضافة مستخدم</button>
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
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-user" data-id="${s.id}" title="تعديل"><i class='bx bx-edit'></i></button>
                    ${s.email?`<button class="btn btn-ghost btn-sm send-invite" data-id="${s.id}" data-email="${s.email}" title="إرسال دعوة"><i class='bx bx-envelope'></i></button>`:""}
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,e.querySelector("#add-user-btn").addEventListener("click",()=>Le(null,e)),e.querySelectorAll(".edit-user").forEach(s=>{s.addEventListener("click",()=>{const a=c.getById(l.USERS,s.dataset.id);a&&Le(a,e)})}),e.querySelectorAll(".send-invite").forEach(s=>{s.addEventListener("click",()=>Yt(s.dataset.id,s.dataset.email))})}async function Yt(e,t){const s=Ye();try{const a=await fetch(`${zt}/auth/send-invite`,{method:"POST",headers:{"Content-Type":"application/json",...s?{Authorization:`Bearer ${s}`}:{}},body:JSON.stringify({userId:e})}),n=await a.json();if(!a.ok){w(n.error||"فشل إرسال الدعوة","error");return}const o=`
        <div style="margin-bottom: 16px;">
          <p style="color:var(--text-secondary); margin-bottom: 12px;">
            ${n.emailSent?`✅ تم إرسال الدعوة إلى <strong>${t}</strong>`:"⚠️ لم يتم إرسال البريد (SMTP غير مهيأ). انسخ الرابط أدناه وأرسله للمستخدم:"}
          </p>
          <div style="background:var(--bg-input); border:1px solid var(--border-primary); border-radius:var(--radius-md); padding:12px; word-break:break-all; font-size:var(--text-xs); color:var(--text-secondary); direction:ltr; text-align:left;">
            ${n.inviteLink}
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:10px;" onclick="navigator.clipboard.writeText('${n.inviteLink}').then(()=>this.textContent='✓ تم النسخ')">
            <i class='bx bx-copy'></i> نسخ الرابط
          </button>
        </div>`;j("رابط الدعوة",o,{footer:`<button class="btn btn-primary" onclick="document.getElementById('active-modal')?.remove()">إغلاق</button>`})}catch{w("تعذر الاتصال بالخادم","error")}}function Le(e,t){const s=!!e,a=`
    <form>
      <div class="form-group">
        <label class="form-label">الاسم <span class="required">*</span></label>
        <input type="text" class="form-input" id="user-name" value="${e?.name||""}" required />
      </div>
      <div class="form-group">
        <label class="form-label">الدور <span class="required">*</span></label>
        <select class="form-select" id="user-role" required>
          ${dt.map(o=>`<option value="${o}" ${e?.role===o?"selected":""}>${o}</option>`).join("")}
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
      `:""}
    </form>
  `;j(s?"تعديل المستخدم":"إضافة مستخدم",a,{footer:`
    <button class="btn btn-primary" id="save-user">${s?"💾 حفظ":"✓ إضافة"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-user").addEventListener("click",()=>{const o=mt({name:document.getElementById("user-name").value.trim(),role:document.getElementById("user-role").value,email:document.getElementById("user-email").value.trim(),phone:document.getElementById("user-phone").value.trim(),active:s?document.getElementById("user-active")?.checked:!0});if(!o.name){w("اسم المستخدم مطلوب","error");return}if(s)c.update(l.USERS,e.id,o),N(l.USERS,e.id,"update",o);else{const p=c.create(l.USERS,o);N(l.USERS,p.id,"create",o)}w(s?"تم تحديث المستخدم":"تم إضافة المستخدم","success"),O(),We(t)})}function Gt(e){if(U("سجل المراجعة"),!Q()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=xt(100);e.innerHTML=`
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
                  <td><span class="badge badge-${s.action==="create"?"open":s.action==="delete"?"blocked":"progress"}">${wt(s.action)}</span></td>
                  <td>${a}</td>
                  <td class="text-xs" style="font-family: monospace; color: var(--text-tertiary);">${s.entityId?s.entityId.substr(0,12):"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Jt(e){if(U("إعدادات النظام"),!Q()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}se(e)}function se(e,t="notifications"){const s=c.getSetting("workdayEndTime")||"17:00",a=Bt(),n=Nt();e.innerHTML=`
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
        ${Ae("action",a,"أنواع الإجراءات","⚡")}
      </div>

      <!-- Tab: Decision Types -->
      <div id="tab-decisions" style="display:${t==="decisions"?"block":"none"}">
        ${Ae("decision",n,"أنواع القرارات","⚖️")}
      </div>
    </div>`,e.querySelectorAll(".settings-tab-btn").forEach(o=>{o.addEventListener("click",()=>se(e,o.dataset.tab))}),e.querySelector("#save-settings-btn")?.addEventListener("click",()=>{const o=document.getElementById("workday-end-time").value;if(!o){w("وقت نهاية يوم العمل مطلوب","error");return}c.setSetting("workdayEndTime",o),w("تم حفظ الإعدادات بنجاح","success")}),Ce(e,"action",l.LOOKUP_ACTION_TYPES,()=>se(e,"actions")),Ce(e,"decision",l.LOOKUP_DECISION_TYPES,()=>se(e,"decisions"))}function Ae(e,t,s,a){return`
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
    </tr>`}function Ce(e,t,s,a){e.querySelector(`#${t}-search`)?.addEventListener("input",n=>{const o=n.target.value.toLowerCase();e.querySelectorAll(`.${t}-row`).forEach(p=>{const u=p.querySelector(`.${t}-label`)?.textContent?.toLowerCase()||"";p.style.display=u.includes(o)?"":"none"})}),e.querySelector(`#${t}-add-btn`)?.addEventListener("click",()=>{const n=e.querySelector(`#${t}-add-row`);n.style.display="block",e.querySelector(`#${t}-add-input`)?.focus()}),e.querySelector(`#${t}-add-cancel`)?.addEventListener("click",()=>{e.querySelector(`#${t}-add-row`).style.display="none",e.querySelector(`#${t}-add-input`).value=""}),e.querySelector(`#${t}-add-confirm`)?.addEventListener("click",()=>{const o=e.querySelector(`#${t}-add-input`)?.value?.trim();if(!o){w("الاسم مطلوب","error");return}qt(s,o),w(`تمت إضافة "${o}"`,"success"),a()}),e.querySelectorAll(`.${t}-edit-btn`).forEach(n=>{n.addEventListener("click",()=>{const o=e.querySelector(`[data-id="${n.dataset.id}"].${t}-row`);o.querySelector(`.${t}-label`).style.display="none",o.querySelector(`.${t}-edit-input`).style.display="block",o.querySelector(`.${t}-edit-btn`).style.display="none",o.querySelector(`.${t}-delete-btn`).style.display="none",o.querySelector(`.${t}-save-btn`).style.display="inline-flex",o.querySelector(`.${t}-cancel-btn`).style.display="inline-flex",o.querySelector(`.${t}-edit-input`)?.focus()})}),e.querySelectorAll(`.${t}-cancel-btn`).forEach(n=>{n.addEventListener("click",()=>{const o=e.querySelector(`[data-id="${n.dataset.id}"].${t}-row`);o.querySelector(`.${t}-label`).style.display="",o.querySelector(`.${t}-edit-input`).style.display="none",o.querySelector(`.${t}-edit-btn`).style.display="inline-flex",o.querySelector(`.${t}-delete-btn`).style.display="inline-flex",o.querySelector(`.${t}-save-btn`).style.display="none",o.querySelector(`.${t}-cancel-btn`).style.display="none"})}),e.querySelectorAll(`.${t}-save-btn`).forEach(n=>{n.addEventListener("click",()=>{const p=e.querySelector(`[data-id="${n.dataset.id}"].${t}-row`).querySelector(`.${t}-edit-input`)?.value?.trim();if(!p){w("الاسم لا يمكن أن يكون فارغاً","error");return}Ot(s,n.dataset.id,p),w("تم التحديث","success"),a()})}),e.querySelectorAll(`.${t}-delete-btn`).forEach(n=>{n.addEventListener("click",()=>{if(!confirm("هل تريد حذف هذا العنصر؟"))return;const o=Ut(s,n.dataset.id);o.ok&&(o.warning?w(o.warning,"warning",6e3):w("تم الحذف","success"),a())})})}function Vt(e){U("التقويم");let t=new Date;t.setDate(1);function s(){const n=t.getFullYear(),o=t.getMonth(),p=c.getAll(l.SESSIONS),u=c.getAll(l.DEADLINES).filter(v=>v.status==="مفتوح"),h=c.getAll(l.CASES),r=c.getAll(l.CLIENTS),m={};function f(v){if(!v)return"—";const x=v.clientIds||(v.clientId?[v.clientId]:[]),T=v.primaryClientId||v.clientId,C=r.find(L=>L.id===T);return x.length>1&&C?C.name+" وآخرون":C?C.name:"—"}function $(v){return v?v.split("T")[0]:null}function y(v,x,T,C){const L=$(v);if(!L)return;const[M,H]=L.split("-").map(Number);if(M!==n||H-1!==o)return;m[L]||(m[L]=[]);const F=h.find(P=>P.id===T),z=f(F);m[L].push({type:x,title:z,caseId:T,label:C})}p.forEach(v=>{v.date&&y(v.date,"session",v.caseId,"جلسة")}),u.forEach(v=>{v.endDate&&y(v.endDate,"deadline",v.caseId,"موعد نهائي")});const g=new Date(n,o,1),i=new Date(n,o+1,0),b=g.getDay(),E=i.getDate(),d=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],I=["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"],S=new Date().toISOString().split("T")[0],k=3;let A="";for(let v=0;v<b;v++)A+='<div class="cal-day cal-day-empty"></div>';for(let v=1;v<=E;v++){const x=String(o+1).padStart(2,"0"),T=String(v).padStart(2,"0"),C=`${n}-${x}-${T}`,L=m[C]||[],M=C===S,H=L.slice(0,k),F=L.length-k;let z=H.map(P=>`
                <div class="cal-event cal-event-${P.type}"
                     data-caseid="${P.caseId}"
                     title="${P.title} – ${P.label}"
                     style="cursor:pointer; user-select:none;">
                    <span class="cal-dot cal-dot-${P.type}"></span>
                    <span class="cal-event-title">${P.title}</span>
                    <span class="cal-event-label">${P.label}</span>
                </div>
            `).join("");F>0&&(z+=`<button class="cal-more-btn" data-date="${C}">+${F} المزيد</button>`),A+=`
                <div class="cal-day ${M?"cal-day-today":""}" data-date="${C}"
                     style="user-select:none;">
                    <div class="cal-day-number">${v}</div>
                    <div class="cal-day-events">${z}</div>
                </div>
            `}const D=[];for(let v=1;v<=E;v++){const x=String(o+1).padStart(2,"0"),T=String(v).padStart(2,"0"),C=`${n}-${x}-${T}`,L=m[C];L&&L.length>0&&D.push({dateStr:C,day:v,events:L})}const B=D.length>0?D.map(({dateStr:v,day:x,events:T})=>`<div class="cal-agenda-day">
                    <div class="cal-agenda-day-header">
                        <div class="cal-agenda-day-num ${v===S?"today":""}">${x}</div>
                        <span>${d[o]} ${n}</span>
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
                <h2 class="cal-month-title">${d[o]} ${n}</h2>
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
                ${B}
            </div>
        </div>
        `,e.querySelector("#cal-prev").addEventListener("click",()=>{t.setMonth(t.getMonth()-1),s()}),e.querySelector("#cal-next").addEventListener("click",()=>{t.setMonth(t.getMonth()+1),s()}),e.querySelector("#cal-today").addEventListener("click",()=>{t=new Date,t.setDate(1),s()}),e.querySelectorAll(".cal-event").forEach(v=>{v.addEventListener("click",x=>{x.stopPropagation();const T=v.dataset.caseid;T&&(window.location.hash=`/cases/${T}`)})}),e.querySelectorAll(".cal-agenda-event").forEach(v=>{v.addEventListener("click",()=>{const x=v.dataset.caseid;x&&(window.location.hash=`/cases/${x}`)})}),e.querySelectorAll(".cal-more-btn").forEach(v=>{v.addEventListener("click",x=>{x.stopPropagation();const T=v.dataset.date,C=m[T]||[];a(v,C,T)})}),e.querySelectorAll(".cal-day, .cal-event").forEach(v=>{v.setAttribute("draggable","false"),v.addEventListener("dragstart",x=>x.preventDefault())})}function a(n,o,p){document.querySelectorAll(".cal-popover").forEach(f=>f.remove());const h=new Date(p+"T00:00:00").toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}),r=document.createElement("div");r.className="cal-popover",r.innerHTML=`
            <div class="cal-popover-header">
                <span>${h}</span>
                <button class="cal-popover-close">&times;</button>
            </div>
            <div class="cal-popover-list">
                ${o.map(f=>`
                    <div class="cal-popover-item" data-caseid="${f.caseId}" style="cursor:pointer;">
                        <span class="cal-dot cal-dot-${f.type}"></span>
                        <span class="cal-popover-client">${f.title}</span>
                        <span class="cal-popover-type">${f.label}</span>
                    </div>
                `).join("")}
            </div>
        `,n.parentElement.appendChild(r),r.querySelector(".cal-popover-close").addEventListener("click",()=>r.remove()),r.querySelectorAll(".cal-popover-item").forEach(f=>{f.addEventListener("click",()=>{const $=f.dataset.caseid;$&&(window.location.hash=`/cases/${$}`),r.remove()})});const m=f=>{r.contains(f.target)||(r.remove(),document.removeEventListener("click",m))};setTimeout(()=>document.addEventListener("click",m),10)}s()}let ge=!1;function Wt(){setInterval(Be,60*1e3),Be()}function Be(){const e=c.getSetting("workdayEndTime");if(!e)return;const t=new Date,[s,a]=e.split(":").map(Number),n=t.getHours()*60+t.getMinutes(),o=s*60+a;if(n<o){ge&&Ne();return}const p=t.toISOString().split("T")[0],h=c.getAll(l.SESSIONS).filter(r=>r.date===p&&(!r.decisionResult||r.status!=="مغلق"));h.length>0?Xt(h):Ne()}function Xt(e){ge=!0;const t=document.getElementById("notification-bar");if(!t)return;const s=c.getAll(l.CASES),a=c.getAll(l.CLIENTS);t.innerHTML=`
        <div class="notif-bar">
            <div class="notif-bar-content">
                <span class="notif-bar-icon">🔔</span>
                <span class="notif-bar-text">لديك <strong>${e.length}</strong> جلسات اليوم بدون نتائج مسجلة</span>
                <button class="notif-bar-toggle" id="notif-toggle">عرض التفاصيل ▼</button>
            </div>
            <div class="notif-bar-list" id="notif-list" style="display: none;">
                ${e.map(n=>{const o=s.find(h=>h.id===n.caseId),p=o?o.primaryClientId||o.clientId:"",u=a.find(h=>h.id===p);return`
                        <div class="notif-item">
                            <div class="notif-item-info">
                                <div class="notif-item-client">${u?u.name:"—"}</div>
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
    `,t.style.display="block",t.querySelector("#notif-toggle")?.addEventListener("click",()=>{const n=t.querySelector("#notif-list"),o=t.querySelector("#notif-toggle");n.style.display==="none"?(n.style.display="block",o.textContent="إخفاء التفاصيل ▲"):(n.style.display="none",o.textContent="عرض التفاصيل ▼")}),t.querySelectorAll(".notif-record-btn").forEach(n=>{n.addEventListener("click",()=>{window.location.hash=`/cases/${n.dataset.caseid}`})})}function Ne(){ge=!1;const e=document.getElementById("notification-bar");e&&(e.innerHTML="",e.style.display="none")}function Zt(e,t={}){U("استيراد عملاء من ملفات PDF");const s=c.getSetting("drive_pdf_folder_id")||"";e.innerHTML=`
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
    `;const a=e.querySelector("#btn-scan"),n=e.querySelector("#drive-folder-id"),o=e.querySelector("#loading-overlay"),p=e.querySelector("#scan-results-card"),u=e.querySelector("#import-table-body"),h=e.querySelector("#btn-import-selected"),r=e.querySelector("#selectAllDetected");let m=[];a.addEventListener("click",async()=>{const y=n.value.trim();if(!y){w("الرجاء إدخال رقم تعريف المجلد (Folder ID)","error");return}c.setSetting("drive_pdf_folder_id",y),o.style.display="flex";try{const i=await fetch(`/api/scan-drive-pdfs?folderId=${encodeURIComponent(y)}`),b=await i.json();if(!i.ok)throw new Error(b.error||"حدث خطأ أثناء المسح");m=b.clients||[],m.length===0?(w("لم يتم العثور على أي بيانات عملاء في المجلد.","warning"),p.style.display="none"):(w(`تم اكتشاف ${m.length} عميل`,"success"),f(m),p.style.display="block")}catch(g){console.error(g),w(g.message,"error")}finally{o.style.display="none"}});function f(y){u.innerHTML="",y.forEach((i,b)=>{const E=document.createElement("tr");E.innerHTML=`
                <td><input type="checkbox" class="client-checkbox" data-index="${b}" /></td>
                <td><input type="text" class="form-input w-full p-1" id="name-${b}" value="${i.name}" /></td>
                <td><input type="text" class="form-input w-full p-1" id="nid-${b}" value="${i.nationalId}" /></td>
                <td>
                    <span class="badge" title="File ID: ${i.sourceFileId}">
                        ${i.sourceFile}
                    </span>
                </td>
            `,u.appendChild(E)}),$(),e.querySelectorAll(".client-checkbox").forEach(i=>{i.addEventListener("change",$)})}r.addEventListener("change",y=>{e.querySelectorAll(".client-checkbox").forEach(i=>{i.checked=y.target.checked}),$()});function $(){const y=Array.from(e.querySelectorAll(".client-checkbox")).some(g=>g.checked);h.disabled=!y}h.addEventListener("click",()=>{const y=e.querySelectorAll(".client-checkbox");let g=0;y.forEach(i=>{if(i.checked){const b=i.getAttribute("data-index"),E=e.querySelector(`#name-${b}`).value.trim(),d=e.querySelector(`#nid-${b}`).value.trim(),I=m[b],S=ze({name:E||I.name,nationalId:d||I.nationalId,notes:`تم إضافته من المسح الآلي للملف: ${I.sourceFile}`,driveFolderUrl:I.driveFolderUrl||"",driveFolderId:I.sourceFileId||""}),k=c.create(l.CLIENTS,S);N(l.CLIENTS,k.id,"create",S),g++}}),w(`تم استيراد ${g} عميل بنجاح`,"success"),setTimeout(()=>{window.location.hash="/clients"},1500)})}const Qt="/api";function es(){const e=document.getElementById("auth-root");e.classList.remove("hidden"),e.innerHTML=`
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
    `;const t=document.getElementById("login-password"),s=document.getElementById("pw-toggle"),a=document.getElementById("pw-toggle-icon");s.addEventListener("click",()=>{const o=t.type==="password";t.type=o?"text":"password",a.className=o?"bx bx-show":"bx bx-hide"}),document.getElementById("login-form").addEventListener("submit",async o=>{o.preventDefault(),await ts()}),setTimeout(()=>document.getElementById("login-email")?.focus(),100)}async function ts(){const e=document.getElementById("login-email").value.trim(),t=document.getElementById("login-password").value,s=document.getElementById("login-btn"),a=document.getElementById("login-error");if(document.getElementById("login-error-text"),a.style.display="none",!e||!t){de("يرجى إدخال البريد الإلكتروني وكلمة المرور");return}s.classList.add("loading"),s.disabled=!0;try{const n=await fetch(`${Qt}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})}),o=await n.json();if(!n.ok){de(o.error||"خطأ في تسجيل الدخول");return}localStorage.setItem("slf_jwt",o.token),localStorage.setItem("slf_current_user",JSON.stringify(o.user)),document.getElementById("auth-root").classList.add("hidden"),window.dispatchEvent(new CustomEvent("auth:login",{detail:o.user}))}catch{de("تعذر الاتصال بالخادم، يرجى المحاولة مجدداً")}finally{s.classList.remove("loading"),s.disabled=!1}}function de(e){const t=document.getElementById("login-error"),s=document.getElementById("login-error-text");t&&s&&(s.textContent=e,t.style.display="flex")}const ss="/api";function as(){const e=document.getElementById("auth-root");e.classList.remove("hidden");const s=new URLSearchParams(window.location.search).get("token");if(!s){e.innerHTML=`
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
    `,qe("sp-password","sp-pw-toggle","sp-pw-icon"),qe("sp-confirm","sp-confirm-toggle","sp-confirm-icon"),document.getElementById("sp-password").addEventListener("input",a=>{ns(a.target.value)}),document.getElementById("set-pw-form").addEventListener("submit",async a=>{a.preventDefault(),await is(s)}),setTimeout(()=>document.getElementById("sp-password")?.focus(),100)}function qe(e,t,s){const a=document.getElementById(e),n=document.getElementById(t),o=document.getElementById(s);n.addEventListener("click",()=>{const p=a.type==="password";a.type=p?"text":"password",o.className=p?"bx bx-show":"bx bx-hide"})}function ns(e){const t=document.getElementById("strength-fill"),s=document.getElementById("strength-label");let a=0;e.length>=8&&a++,/[A-Z]/.test(e)&&a++,/[0-9]/.test(e)&&a++,/[^A-Za-z0-9]/.test(e)&&a++;const n=[{pct:"0%",color:"transparent",text:""},{pct:"25%",color:"#ef4444",text:"ضعيفة جداً"},{pct:"50%",color:"#f59e0b",text:"ضعيفة"},{pct:"75%",color:"#60a5fa",text:"جيدة"},{pct:"100%",color:"#10b981",text:"قوية ✓"}],o=e.length===0?n[0]:n[Math.max(1,a)];t.style.width=o.pct,t.style.backgroundColor=o.color,s.textContent=o.text,s.style.color=o.color}async function is(e){const t=document.getElementById("sp-password").value,s=document.getElementById("sp-confirm").value,a=document.getElementById("sp-btn");if(K("",""),t.length<8){K("error","كلمة المرور يجب أن تكون 8 أحرف على الأقل");return}if(t!==s){K("error","كلمتا المرور غير متطابقتين");return}a.classList.add("loading"),a.disabled=!0;try{const n=await fetch(`${ss}/auth/set-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e,password:t})}),o=await n.json();if(!n.ok){K("error",o.error||"خطأ في تعيين كلمة المرور");return}K("success","تم تعيين كلمة المرور بنجاح! جارٍ تحويلك لتسجيل الدخول..."),setTimeout(()=>{const p=new URL(window.location.href);p.searchParams.delete("token"),window.history.replaceState({},"",p.pathname),window.location.hash="/login",window.location.reload()},1800)}catch{K("error","تعذر الاتصال بالخادم، يرجى المحاولة مجدداً")}finally{a.classList.remove("loading"),a.disabled=!1}}function K(e,t){const s=document.getElementById("sp-message");if(s){if(!t){s.style.display="none";return}s.className=e==="error"?"auth-error":"auth-success",s.innerHTML=`<i class='bx ${e==="error"?"bx-error-circle":"bx-check-circle"}'></i><span>${t}</span>`,s.style.display="flex"}}async function os(){const t=new URLSearchParams(window.location.search).get("token"),s=window.location.hash;if(t||s==="#/set-password"){as();return}if(!vt()){es(),window.addEventListener("auth:login",()=>{document.getElementById("auth-root").classList.add("hidden"),Oe()},{once:!0});return}await Oe()}async function Oe(){const e=[l.CLIENTS,l.CASES,l.SESSIONS,l.ACTIONS,l.DEADLINES,l.USERS];await c.syncFromServer(e),ht();let t=R();if(!t){const s=c.getAll(l.USERS);s.length>0&&(Ge(s[0]),t=s[0])}It(),ds(),rs(),q("/",Se),q("/dashboard",Se),q("/clients",Je),q("/clients/new",Te),q("/clients/:id/edit",Te),q("/clients/import",Zt),q("/cases",Tt),q("/cases/new",ke),q("/cases/:id",J),q("/cases/:id/edit",ke),q("/actions",X),q("/deadlines",Ft),q("/calendar",Vt),q("/admin/mapping",fe),q("/admin/users",We),q("/admin/audit",Gt),q("/admin/settings",Jt),ls(),at(),window.addEventListener("hashchange",()=>{Xe(window.location.hash.replace("#","")||"/dashboard")}),Wt(),(!window.location.hash||window.location.hash==="#")&&tt("/dashboard")}function ls(){const e=document.getElementById("topbar"),t=R();e.innerHTML=`
    <div class="topbar-start">
      <button class="hamburger-btn" id="mobile-menu-btn" aria-label="فتح القائمة">
        <span></span><span></span><span></span>
      </button>
      <div class="topbar-title" id="topbar-page-title">لوحة التحكم</div>
    </div>
    <div class="topbar-actions">
      <div class="flex items-center gap-2">
        <span class="text-sm text-secondary topbar-username">${t?t.name:""}</span>
        <span class="badge badge-open" style="font-size:var(--text-xs);">${t?t.role:""}</span>
        <button id="logout-btn" class="btn btn-ghost btn-sm" title="تسجيل الخروج" style="display:flex;align-items:center;gap:4px;">
          <i class='bx bx-log-out'></i>
          <span class="hidden-mobile">خروج</span>
        </button>
      </div>
    </div>
  `,e.querySelector("#logout-btn").addEventListener("click",()=>{confirm("هل تريد تسجيل الخروج؟")&&yt()}),document.getElementById("mobile-menu-btn").addEventListener("click",cs)}function cs(){const e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e.classList.contains("open")?he():(e.classList.add("open"),t&&t.classList.add("active"),document.body.style.overflow="hidden")}function he(){const e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e.classList.remove("open"),t&&t.classList.remove("active"),document.body.style.overflow=""}function ds(){if(document.getElementById("sidebar-overlay"))return;const e=document.createElement("div");e.id="sidebar-overlay",e.className="sidebar-overlay",e.addEventListener("click",he),document.getElementById("app").appendChild(e)}function rs(){if(document.getElementById("bottom-nav"))return;const e=c.count(l.ACTIONS,s=>s.status!=="مكتمل"),t=document.createElement("nav");t.id="bottom-nav",t.className="bottom-nav",t.innerHTML=`
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
  `,document.getElementById("app").appendChild(t),Xe(window.location.hash.replace("#","")||"/dashboard")}function Xe(e){const t=document.getElementById("bottom-nav");t&&t.querySelectorAll(".bottom-nav-item").forEach(s=>{const a=s.dataset.route;s.classList.toggle("active",e===a||a!=="/"&&e.startsWith(a))})}function U(e){const t=document.getElementById("topbar-page-title");t&&(t.textContent=e)}function _(e){return e?new Date(e).toLocaleDateString("ar-EG",{year:"numeric",month:"short",day:"numeric"}):"—"}function G(e){if(!e)return 1/0;const t=new Date(e),s=new Date;return s.setHours(0,0,0,0),t.setHours(0,0,0,0),Math.ceil((t-s)/(1e3*60*60*24))}function ne(e){return G(e)<0}document.addEventListener("DOMContentLoaded",os);
