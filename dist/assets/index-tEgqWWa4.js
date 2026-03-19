(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const o of i)if(o.type==="childList")for(const p of o.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&a(p)}).observe(document,{childList:!0,subtree:!0});function s(i){const o={};return i.integrity&&(o.integrity=i.integrity),i.referrerPolicy&&(o.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?o.credentials="include":i.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(i){if(i.ep)return;i.ep=!0;const o=s(i);fetch(i.href,o)}})();const X={};function q(e,t){X[e]=t}function nt(e){window.location.hash=e}function it(e){if(X[e])return{handler:X[e],params:{}};for(const t in X){const s=t.split("/").filter(Boolean),a=e.split("/").filter(Boolean);if(s.length!==a.length)continue;const i={};let o=!0;for(let p=0;p<s.length;p++)if(s[p].startsWith(":"))i[s[p].slice(1)]=a[p];else if(s[p]!==a[p]){o=!1;break}if(o)return{handler:X[t],params:i}}return null}function $e(){const e=window.location.hash.slice(1)||"/",t=it(e);if(t){const s=document.getElementById("page-content");s&&(s.innerHTML="",t.handler(s,t.params)),document.querySelectorAll(".sidebar-link").forEach(a=>{const i=a.getAttribute("data-route");i===e||e.startsWith(i)&&i!=="/"?a.classList.add("active"):a.classList.remove("active")})}else{const s=document.getElementById("page-content");s&&(s.innerHTML=`
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>الصفحة غير موجودة</h3>
          <p>الصفحة المطلوبة غير متوفرة</p>
          <button class="btn btn-primary" onclick="window.location.hash='/'">العودة للرئيسية</button>
        </div>
      `)}}function ot(){window.addEventListener("hashchange",$e),$e()}const Z="slf_",ue="/api";function Y(e){return Z+e}function lt(){return Date.now().toString(36)+Math.random().toString(36).substr(2,9)}async function ce(e,t,s=null,a=null){try{let i=`${ue}/${t}`;a&&e!=="POST"&&(i+=`/${a}`);const o=localStorage.getItem("slf_jwt")||"",p={method:e,headers:{"Content-Type":"application/json",...o?{Authorization:`Bearer ${o}`}:{}}};s&&(p.body=JSON.stringify(s));const d=await fetch(i,p);d.ok||console.error(`Backend sync failed for ${t} ${e}`,await d.text())}catch(i){console.error(`Backend sync network error for ${t} ${e}:`,i)}}const c={getAll(e){const t=localStorage.getItem(Y(e));return(t?JSON.parse(t):[]).filter(a=>!a._deleted)},getAllIncludingDeleted(e){const t=localStorage.getItem(Y(e));return t?JSON.parse(t):[]},getById(e,t){return this.getAll(e).find(a=>a.id===t)||null},query(e,t){return this.getAll(e).filter(t)},count(e,t){return t?this.query(e,t).length:this.getAll(e).length},create(e,t){const s=this.getAllIncludingDeleted(e),a={...t,id:lt(),_createdAt:new Date().toISOString(),_updatedAt:new Date().toISOString(),_deleted:!1};return s.push(a),localStorage.setItem(Y(e),JSON.stringify(s)),ce("POST",e,a),a},update(e,t,s){const a=this.getAllIncludingDeleted(e),i=a.findIndex(p=>p.id===t);if(i===-1)return null;const o={...a[i]};return a[i]={...a[i],...s,id:a[i].id,_createdAt:a[i]._createdAt,_updatedAt:new Date().toISOString(),_deleted:a[i]._deleted},localStorage.setItem(Y(e),JSON.stringify(a)),ce("PUT",e,a[i],t),{oldItem:o,newItem:a[i]}},softDelete(e,t){const s=this.getAllIncludingDeleted(e),a=s.findIndex(i=>i.id===t);return a===-1?!1:(s[a]._deleted=!0,s[a]._deletedAt=new Date().toISOString(),localStorage.setItem(Y(e),JSON.stringify(s)),ce("DELETE",e,null,t),!0)},clear(e){localStorage.removeItem(Y(e))},clearAll(){Object.keys(localStorage).forEach(e=>{e.startsWith(Z)&&localStorage.removeItem(e)})},getSetting(e){const t=localStorage.getItem(Z+"settings"),s=t?JSON.parse(t):{};return s[e]!==void 0?s[e]:null},setSetting(e,t){const s=localStorage.getItem(Z+"settings"),a=s?JSON.parse(s):{};a[e]=t,localStorage.setItem(Z+"settings",JSON.stringify(a)),fetch(`${ue}/settings`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:e,value:t})}).catch(i=>console.error("Setting sync error",i))},async syncFromServer(e){try{console.log("Syncing from server...");const t=localStorage.getItem("slf_jwt")||"",s=t?{Authorization:`Bearer ${t}`}:{};for(let a of e){const i=await fetch(`${ue}/${a}`,{headers:s});if(i.ok){const o=await i.json();Array.isArray(o)?localStorage.setItem(Y(a),JSON.stringify(o)):console.warn(`sync: skipping '${a}' – server returned non-array response`)}}return console.log("Sync complete!"),!0}catch(t){return console.error("Critical error syncing from backend:",t),!1}}},Ue=["مدني","جنائي","إداري","أسرة","عمالي","تجاري"],me={مدني:"civil",جنائي:"criminal",إداري:"admin",أسرة:"family",عمالي:"labor",تجاري:"commercial"},ct=["أول درجة","استئناف","نقض"],dt=["تحقيقات نيابة","جنحة","جناية","استئناف","نقض"],xe=["مدعي","مدعى عليه","مستأنف","مستأنف ضده","متهم","مجني عليه","طاعن","مطعون ضده"],_e=["نشطة","حكم","مغلقة"],Re={نشطة:"active",حكم:"judgment",مغلقة:"closed"},He={مفتوح:"open","قيد التنفيذ":"progress",مكتمل:"completed",معلق:"blocked"},Fe={مفتوح:"open",مكتمل:"completed",منتهي:"expired"},rt=["جلسة استماع","حكم","خبير","تحقيق","تجديد","نطق بالحكم","مرافعة","تأجيل"],ut=["حجز للحكم","صدور حكم نهائي","شطب نهائي","حفظ","أخرى"],ze=["إعلان/خدمة","تصريح محكمة","حزمة تحضير","متابعة خبير","تجديد من الشطب","مراجعة حكم","حضور تجديد حبس","متابعة تحقيق","استئناف","طعن","معارضة","أخرى"],be=["عالية","متوسطة","منخفضة"],ve=["شريك","محامي مسؤول","محامي","متدرب"],Ye=["استئناف","نقض","معارضة","استئناف حبس","تجديد بعد الشطب","أخرى"],Je=["تأجيل لإعادة الإعلان","تأجيل لتصريح","تأجيل لمذكرة ومستندات","إحالة لخبير","شطب","صدور حكم","حبس احتياطي","إخلاء سبيل","طلب تحقيقات","إحالة للمحكمة","حفظ","تأجيل للمرافعة","تأجيل للاطلاع","تأجيل عام","نطق بالحكم"],pt=["شريك","محامي مسؤول","محامي","متدرب"],mt={admin:"partner",شريك:"partner","محامي مسؤول":"caseOwner",محامي:"lawyer",متدرب:"trainee"},l={CLIENTS:"clients",CASES:"cases",SESSIONS:"sessions",ACTIONS:"actions",DEADLINES:"deadlines",USERS:"users",AUDIT:"audit",DECISION_MAP:"decision_map",SETTINGS:"settings",LOOKUP_ACTION_TYPES:"lookup_action_types",LOOKUP_DECISION_TYPES:"lookup_decision_types"};function Ge(e){return{name:e.name||"",nationalId:e.nationalId||"",phone:e.phone||"",address:e.address||"",poaNumber:e.poaNumber||"",notaryOffice:e.notaryOffice||"",poaDate:e.poaDate||"",attachments:e.attachments||[],notes:e.notes||"",driveFolderUrl:e.driveFolderUrl||"",driveFolderId:e.driveFolderId||""}}function bt(e){return{caseNo:e.caseNo||"",year:e.year||new Date().getFullYear().toString(),stageType:e.stageType||"",clientId:e.clientId||"",clientIds:e.clientIds||(e.clientId?[e.clientId]:[]),primaryClientId:e.primaryClientId||e.clientId||"",clientRole:e.clientRole||"",opponentName:e.opponentName||"",opponentRole:e.opponentRole||"",court:e.court||"",circuit:e.circuit||"",caseType:e.caseType||"",subject:e.subject||"",firstSessionDate:e.firstSessionDate||"",ownerId:e.ownerId||"",status:e.status||"نشطة",criminalStageType:e.criminalStageType||"",linkedProsecutionId:e.linkedProsecutionId||"",notes:e.notes||""}}function Ee(e){return{caseId:e.caseId||"",date:e.date||"",sessionType:e.sessionType||"",decisionResult:e.decisionResult||"",nextSessionDate:e.nextSessionDate||"",status:e.status||"مفتوح",closureReason:e.closureReason||"",notes:e.notes||"",attachments:e.attachments||[]}}function ye(e){return{clientId:e.clientId||"",caseId:e.caseId||"",sessionId:e.sessionId||"",actionType:e.actionType||"",title:e.title||"",priority:e.priority||"",responsibleUserId:e.responsibleUserId||"",status:e.status||"مفتوح",executionDate:e.executionDate||"",executionDetails:e.executionDetails||"",subTasks:e.subTasks||[],dueDate:e.dueDate||"",notes:e.notes||"",attachments:e.attachments||[]}}function vt(e){return{caseId:e.caseId||"",deadlineType:e.deadlineType||"",startDate:e.startDate||"",endDate:e.endDate||"",responsibleUserId:e.responsibleUserId||"",status:e.status||"مفتوح",completionNote:e.completionNote||""}}function Se(e){return{name:e.name||"",role:e.role||"محامي",email:e.email||"",phone:e.phone||"",active:e.active!==void 0?e.active:!0}}function V(){return localStorage.getItem("slf_jwt")||null}function yt(){localStorage.removeItem("slf_jwt")}function gt(){const e=V();if(!e)return!1;try{return JSON.parse(atob(e.split(".")[1])).exp*1e3>Date.now()}catch{return!1}}function ft(){yt(),localStorage.removeItem("slf_current_user"),window.location.href=window.location.pathname+window.location.search}let se=null;function Ke(e){se=e,localStorage.setItem("slf_current_user",JSON.stringify(e))}function _(){if(!se){const e=localStorage.getItem("slf_current_user");e&&(se=JSON.parse(e))}return se}function ee(e){return e&&mt[e.role]||null}const ht={partner:{createCase:!0,editCase:"all",createSession:!0,editSession:"all",completeAction:!0,createDeadline:!0,closeCase:!0,deleteRecords:"soft",adminConfig:!0,viewAll:!0,lockUnlock:!0},caseOwner:{createCase:!0,editCase:"own",createSession:!0,editSession:"own",completeAction:!0,createDeadline:!0,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1},lawyer:{createCase:!1,editCase:"assigned",createSession:"assigned",editSession:"assigned",completeAction:"assigned",createDeadline:!1,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1},trainee:{createCase:!1,editCase:!1,createSession:!1,editSession:!1,completeAction:"addDetails",createDeadline:!1,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1}};function It(e,t={}){const s=_();if(!s)return!1;const a=ee(s);if(!a)return!1;const i=ht[a];if(!i)return!1;const o=i[e];return o===!0?!0:o===!1||o===void 0?!1:o==="all"?!0:o==="own"?t.ownerId===s.id:o==="assigned"?t.ownerId===s.id||t.responsibleUserId===s.id||t.assignedTo===s.id:o==="addDetails"?t.responsibleUserId===s.id||t.assignedTo===s.id:o==="soft"}function W(){const e=_();return e?ee(e)==="partner":!1}function ne(){const e=_();return e?ee(e)==="partner":!1}function $t(){if(c.getAll(l.USERS).length>0)return;const t=c.create(l.USERS,{name:"أحمد أحمد سريا",role:"شريك",email:"ahmed@serya.law",phone:"01000000001",active:!0});c.create(l.USERS,{name:"فتحي أحمد سريا",role:"شريك",email:"fathy@serya.law",phone:"01000000002",active:!0});const s=c.create(l.USERS,{name:"محمد عبد الرحمن",role:"محامي مسؤول",email:"mohamed@serya.law",phone:"01000000003",active:!0}),a=c.create(l.USERS,{name:"سارة أحمد",role:"محامي",email:"sara@serya.law",phone:"01000000004",active:!0});c.create(l.USERS,{name:"يوسف محمود",role:"متدرب",email:"youssef@serya.law",phone:"01000000005",active:!0}),Ke(t);const i=c.create(l.CLIENTS,{name:"شركة النور للتجارة",nationalId:"12345678901234",phone:"01100000001",address:"القاهرة - المعادي - شارع 9",poaNumber:"POA-2025-001",notaryOffice:"مكتب توثيق المعادي",poaDate:"2025-01-15",notes:"عميل مهم - قضايا تجارية"}),o=c.create(l.CLIENTS,{name:"أحمد محمد إبراهيم",nationalId:"28501012345678",phone:"01200000002",address:"الجيزة - الدقي",poaNumber:"POA-2025-002",notaryOffice:"مكتب توثيق الدقي",poaDate:"2025-02-10",notes:""}),p=c.create(l.CLIENTS,{name:"فاطمة حسن علي",nationalId:"29001234567890",phone:"01500000003",address:"الإسكندرية - سموحة",poaNumber:"POA-2025-003",notaryOffice:"مكتب توثيق سموحة",poaDate:"2025-03-05",notes:"قضية أسرة"}),d=c.create(l.CASES,{caseNo:"1234",year:"2025",stageType:"أول درجة",clientId:i.id,clientIds:[i.id],primaryClientId:i.id,clientRole:"مدعي",opponentName:"شركة الفجر للاستيراد",opponentRole:"مدعى عليه",court:"محكمة القاهرة الاقتصادية",circuit:"الدائرة الثالثة",caseType:"مدني",subject:"مطالبة بمستحقات تجارية",firstSessionDate:"2026-03-01",ownerId:s.id,status:"نشطة"}),f=c.create(l.CASES,{caseNo:"5678",year:"2025",stageType:"أول درجة",clientId:o.id,clientIds:[o.id],primaryClientId:o.id,clientRole:"متهم",opponentName:"النيابة العامة",opponentRole:"سلطة اتهام",court:"نيابة شمال القاهرة",circuit:"",caseType:"جنائي",criminalStageType:"تحقيقات نيابة",subject:"تحقيق جنائي - نصب",firstSessionDate:"2026-02-28",ownerId:t.id,status:"نشطة"}),r=c.create(l.CASES,{caseNo:"9101",year:"2026",stageType:"استئناف",clientId:p.id,clientIds:[p.id,i.id],primaryClientId:p.id,clientRole:"مستأنف",opponentName:"خالد حسن محمود",opponentRole:"مستأنف ضده",court:"محكمة استئناف الإسكندرية",circuit:"الدائرة الأولى أسرة",caseType:"أسرة",subject:"استئناف حكم نفقة",firstSessionDate:"2026-03-05",ownerId:s.id,status:"نشطة"}),b=c.create(l.SESSIONS,{caseId:d.id,date:"2026-03-01",sessionType:"جلسة استماع",decisionResult:"تأجيل لإعادة الإعلان",nextSessionDate:"2026-03-15",notes:"لم يحضر المدعى عليه - تأجيل لإعادة الإعلان"});c.create(l.ACTIONS,{caseId:d.id,sessionId:b.id,actionType:"إعلان/خدمة",responsibleUserId:a.id,status:"مفتوح",dueDate:"2026-03-10",notes:"إعادة إعلان المدعى عليه - شركة الفجر للاستيراد"});const g=c.create(l.SESSIONS,{caseId:f.id,date:"2026-02-28",sessionType:"تحقيق",decisionResult:"حبس احتياطي",nextSessionDate:"2026-03-14",notes:"تم حبس المتهم احتياطياً 15 يوماً"});c.create(l.ACTIONS,{caseId:f.id,sessionId:g.id,actionType:"حضور تجديد حبس",responsibleUserId:t.id,status:"مفتوح",dueDate:"2026-03-13",notes:"حضور جلسة تجديد الحبس الاحتياطي"}),c.create(l.DEADLINES,{caseId:f.id,deadlineType:"استئناف حبس",startDate:"2026-02-28",endDate:"2026-03-07",responsibleUserId:t.id,status:"مفتوح",completionNote:""}),c.create(l.ACTIONS,{caseId:r.id,sessionId:"",actionType:"حزمة تحضير",responsibleUserId:s.id,status:"قيد التنفيذ",dueDate:"2026-03-03",subTasks:[{title:"صياغة المذكرة",completed:!0},{title:"مراجعة المذكرة",completed:!1},{title:"تحضير المستندات",completed:!1},{title:"تقديم الحزمة",completed:!1}],notes:"تحضير مذكرة الاستئناف ومستنداتها"}),c.setSetting("workdayEndTime","17:00"),console.log("✅ Seed data loaded successfully")}function xt(){const e=document.getElementById("sidebar"),t=_(),s=c.count(l.ACTIONS,i=>i.status!=="مكتمل"),a=c.count(l.DEADLINES,i=>i.status==="مفتوح");e.innerHTML=`
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
      
      ${W()?`
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
  `,e.querySelectorAll(".sidebar-link").forEach(i=>{i.addEventListener("click",()=>{window.innerWidth<=768&&Ie()})})}function we(e){j("لوحة التحكم");const t=_(),s=t?ee(t):null,a=s==="lawyer"||s==="trainee",i=c.getAll(l.CASES),o=c.getAll(l.SESSIONS);let p=c.getAll(l.ACTIONS);a&&t&&(p=p.filter(u=>u.responsibleUserId===t.id));const d=c.getAll(l.DEADLINES),f=c.getAll(l.CLIENTS),r=i.filter(u=>u.status==="نشطة").length,b=p.filter(u=>u.status!=="مكتمل").length,g=d.filter(u=>u.status==="مفتوح").length,$=new Date;$.setHours(0,0,0,0);const y=new Date($);y.setDate(y.getDate()+7);const h=o.filter(u=>{if(!u.nextSessionDate)return!1;const I=new Date(u.nextSessionDate);return I>=$&&I<=y}).sort((u,I)=>new Date(u.nextSessionDate)-new Date(I.nextSessionDate)),n=i.filter(u=>{if(!u.firstSessionDate)return!1;const I=new Date(u.firstSessionDate);return I>=$&&I<=y}),v={};p.filter(u=>u.status!=="مكتمل").forEach(u=>{v[u.actionType]||(v[u.actionType]=[]),v[u.actionType].push(u)});const x=[];h.forEach(u=>{const I=J(u.nextSessionDate);if(I<=3){const S=p.filter(L=>L.sessionId===u.id&&L.status!=="مكتمل");if(S.length>0){const L=c.getById(l.CASES,u.caseId);x.push({level:"high",icon:"<i class='bx bxs-circle'></i>",text:`جلسة خلال ${I} أيام مع ${S.length} إجراء مفتوح – القضية ${L?L.caseNo:""}/${L?L.year:""}`})}}}),p.filter(u=>u.actionType==="حضور تجديد حبس"&&u.status!=="مكتمل").forEach(u=>{const I=c.getById(l.CASES,u.caseId);x.push({level:"high",icon:"<i class='bx bxs-bell-ring'></i>",text:`إجراء حبس احتياطي مفتوح – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),p.filter(u=>u.status!=="مكتمل"&&u.dueDate&&ie(u.dueDate)).forEach(u=>{const I=c.getById(l.CASES,u.caseId);x.push({level:"medium",icon:"<i class='bx bx-error'></i>",text:`إجراء متأخر: ${u.actionType} – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),d.filter(u=>u.status==="مفتوح"&&u.endDate&&ie(u.endDate)).forEach(u=>{const I=c.getById(l.CASES,u.caseId);x.push({level:"high",icon:"<i class='bx bxs-circle'></i>",text:`موعد نهائي متأخر: ${u.deadlineType} – القضية ${I?I.caseNo:""}/${I?I.year:""}`})}),e.innerHTML=`
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
              <div class="card-value">${b}</div>
              <div class="card-label">إجراءات مفتوحة</div>
            </div>
            <div class="card-icon amber"><i class='bx bxs-zap'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${g}</div>
              <div class="card-label">مواعيد نهائية</div>
            </div>
            <div class="card-icon red"><i class='bx bxs-time'></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-value">${f.length}</div>
              <div class="card-label">العملاء</div>
            </div>
            <div class="card-icon blue"><i class='bx bxs-group'></i></div>
          </div>
        </div>
      </div>
      
      <!-- Risk Flags -->
      ${x.length>0?`
        <div class="widget widget-full-width mb-6">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-flag'></i> تنبيهات المخاطر</div>
            <span class="badge badge-blocked">${x.length}</span>
          </div>
          <div class="widget-body">
            <div class="risk-flags-container">
              ${x.map(u=>`
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
            <span class="badge badge-open">${h.length+n.length}</span>
          </div>
          <div class="widget-body">
            ${h.length+n.length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد جلسات قادمة</p>
              </div>
            `:""}
            ${n.map(u=>{const I=c.getById(l.CLIENTS,u.clientId),S=J(u.firstSessionDate);return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${u.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${u.caseNo}/${u.year}</div>
                    <div class="widget-item-sub">${I?I.name:""} – ${u.subject}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${S<=1?"text-accent":""}">${P(u.firstSessionDate)}</div>
                    <div class="text-xs ${S<=1?"text-accent":"text-secondary"}">${S===0?"اليوم":S===1?"غداً":`خلال ${S} أيام`}</div>
                  </div>
                </div>
              `}).join("")}
            ${h.map(u=>{const I=c.getById(l.CASES,u.caseId),S=J(u.nextSessionDate);return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${u.caseId}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${I?I.caseNo+"/"+I.year:""}</div>
                    <div class="widget-item-sub">${u.decisionResult} → ${u.sessionType}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${S<=1?"text-accent":""}">${P(u.nextSessionDate)}</div>
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
            <span class="badge badge-progress">${b}</span>
          </div>
          <div class="widget-body">
            ${Object.keys(v).length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد إجراءات مفتوحة</p>
              </div>
            `:""}
            ${Object.entries(v).map(([u,I])=>`
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
            <span class="badge badge-blocked">${g}</span>
          </div>
          <div class="widget-body">
            ${d.filter(u=>u.status==="مفتوح").length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد مواعيد نهائية مفتوحة</p>
              </div>
            `:""}
            ${d.filter(u=>u.status==="مفتوح").sort((u,I)=>new Date(u.endDate)-new Date(I.endDate)).map(u=>{const I=c.getById(l.CASES,u.caseId),S=J(u.endDate),L=S<0?"badge-blocked":S<=3?"badge-progress":"badge-open";return`
                  <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${u.caseId}'">
                    <div class="widget-item-info">
                      <div class="widget-item-title">${u.deadlineType}</div>
                      <div class="widget-item-sub">القضية ${I?I.caseNo+"/"+I.year:""}</div>
                    </div>
                    <div>
                      <div class="widget-item-date">${P(u.endDate)}</div>
                      <span class="badge ${L}">${S<0?"متأخر":S===0?"اليوم":`${S} يوم`}</span>
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
            ${i.slice(-5).reverse().map(u=>{const I=c.getById(l.CLIENTS,u.clientId),S=me[u.caseType]||"civil";return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${u.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">${u.caseNo}/${u.year} – ${u.subject}</div>
                    <div class="widget-item-sub">${I?I.name:""}</div>
                  </div>
                  <span class="badge badge-${S}">${u.caseType}</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    </div>
  `}function k(e,t="success",s=3e3){const a=document.getElementById("toast-root"),i=document.createElement("div");i.className=`toast toast-${t}`;const o={success:"✓",error:"✕",warning:"⚠",info:"ℹ"};i.innerHTML=`<span>${o[t]||""}</span> ${e}`,a.appendChild(i),setTimeout(()=>{i.style.opacity="0",i.style.transform="translateY(-10px)",i.style.transition="all 300ms ease-out",setTimeout(()=>i.remove(),300)},s)}function M(e,t,s={}){const a=document.getElementById("modal-root"),i=s.large?"modal-lg":"",o=document.createElement("div");o.className="modal-overlay",o.id="active-modal",o.innerHTML=`
    <div class="modal ${i}">
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
  `,o=M(e,a,{footer:`
    <button class="btn btn-primary" id="confirm-yes">تأكيد</button>
    <button class="btn btn-secondary" id="confirm-no">إلغاء</button>
  `});o.querySelector("#confirm-yes").addEventListener("click",()=>{s(),O()}),o.querySelector("#confirm-no").addEventListener("click",O)}function N(e,t,s,a={}){const i=_(),o={entityType:e,entityId:t,action:s,userId:i?i.id:"system",userName:i?i.name:"النظام",timestamp:new Date().toISOString(),changes:a};return c.create(l.AUDIT,o),o}function St(e,t,s,a=""){const i=_(),o=new Date().toISOString(),p={actionType:"نوع الإجراء",title:"العنوان / الوصف",dueDate:"تاريخ الاستحقاق",responsibleUserId:"المحامي المسؤول",priority:"الأولوية",notes:"الملاحظات",clientId:"العميل",caseId:"القضية",executionDate:"تاريخ التنفيذ",executionDetails:"تفاصيل التنفيذ / الإثبات",status:"الحالة"},d=["actionType","responsibleUserId","clientId","caseId","executionDate","executionDetails"],f=[];return Object.keys(p).forEach(r=>{const b=String(t[r]||""),g=String(s[r]||"");if(b===g)return;const $=d.includes(r),y={entityType:l.ACTIONS,entityId:e,action:"field_change",userId:i?i.id:"system",userName:i?i.name:"النظام",timestamp:o,changes:{field:r,fieldLabel:p[r]||r,oldValue:b,newValue:g,sensitive:$,editReason:$?a:""}};c.create(l.AUDIT,y),f.push(y)}),f}function wt(e){return c.query(l.AUDIT,t=>t.entityId===e).sort((t,s)=>new Date(s.timestamp)-new Date(t.timestamp))}function Tt(e=50){return c.getAll(l.AUDIT).sort((t,s)=>new Date(s.timestamp)-new Date(t.timestamp)).slice(0,e)}function kt(e){return{create:"إنشاء",update:"تعديل",complete:"إكمال",delete:"حذف",status_change:"تغيير حالة",field_change:"تعديل حقل"}[e]||e}function Ve(e){j("العملاء");const t=c.getAll(l.CLIENTS);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-group'></i> العملاء</h1>
          <div class="page-header-sub">${t.length} عميل</div>
        </div>
        <div class="flex gap-2">
            ${W()?`
            <button class="btn btn-secondary" onclick="window.location.hash='/clients/import-sheet'">
                <i class='bx bxs-spreadsheet'></i> استيراد من Sheets
            </button>`:""}
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
  `,e.querySelector("#client-search").addEventListener("input",s=>{const a=s.target.value.toLowerCase(),i=t.filter(o=>o.name.toLowerCase().includes(a)||o.nationalId.includes(a)||o.phone.includes(a));document.getElementById("client-table-body").innerHTML=Te(i),ke()}),e.querySelector("#add-client-btn").addEventListener("click",()=>{window.location.hash="/clients/new"}),ke()}function Te(e){return e.length===0?'<tr><td colspan="7"><div class="empty-state"><p>لا يوجد عملاء</p></div></td></tr>':e.map(t=>{const s=t.driveFolderUrl?`<a href="${t.driveFolderUrl}" target="_blank" class="btn btn-ghost btn-sm" title="فتح مجلد درايف"><i class='bx bxl-google-drive text-blue-500'></i></a>`:"";return`
    <tr class="clickable-row" data-id="${t.id}">
      <td><strong>${t.name||"—"}</strong></td>
      <td>${t.nationalId||""}</td>
      <td>${t.phone||""}</td>
      <td>${t.poaNumber||""}</td>
      <td>${t.notaryOffice||""}</td>
      <td>${P(t.poaDate)}</td>
      <td>
        <div class="table-actions">
          ${s}
          <button class="btn btn-ghost btn-sm edit-client" data-id="${t.id}"><i class='bx bx-edit'></i></button>
          <button class="btn btn-ghost btn-sm delete-client" data-id="${t.id}"><i class='bx bx-trash'></i></button>
        </div>
      </td>
    </tr>
  `}).join("")}function ke(){document.querySelectorAll(".edit-client").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation(),window.location.hash=`/clients/${e.dataset.id}/edit`})}),document.querySelectorAll(".delete-client").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation(),Et("حذف العميل","هل أنت متأكد من حذف هذا العميل؟",()=>{c.softDelete(l.CLIENTS,e.dataset.id),N(l.CLIENTS,e.dataset.id,"delete"),k("تم حذف العميل","success"),window.location.hash="/clients",Ve(document.getElementById("page-content"))})})})}function Le(e,t={}){const s=t.id&&t.id!=="new",a=s?c.getById(l.CLIENTS,t.id):null;j(s?"تعديل بيانات العميل":"إضافة عميل جديد"),e.innerHTML=`
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
  `,e.querySelector("#client-form").addEventListener("submit",p=>{p.preventDefault();const d=Ge({name:document.getElementById("client-name").value.trim(),nationalId:document.getElementById("client-national-id").value.trim(),phone:document.getElementById("client-phone").value.trim(),address:document.getElementById("client-address").value.trim(),poaNumber:document.getElementById("client-poa").value.trim(),notaryOffice:document.getElementById("client-notary").value.trim(),poaDate:document.getElementById("client-poa-date").value,notes:document.getElementById("client-notes").value.trim(),driveFolderUrl:a?.driveFolderUrl||"",driveFolderId:a?.driveFolderId||""});if(!d.name||!d.nationalId||!d.phone||!d.poaNumber||!d.notaryOffice||!d.poaDate){k("يرجى ملء جميع الحقول المطلوبة","error");return}if(s)c.update(l.CLIENTS,t.id,d),N(l.CLIENTS,t.id,"update",d),k("تم تحديث بيانات العميل","success");else{const f=c.create(l.CLIENTS,d);N(l.CLIENTS,f.id,"create",d),k("تم إنشاء العميل بنجاح","success")}window.location.hash="/clients"});const i=e.querySelector("#btn-sync-drive");async function o(p=!1){if(!a?.driveFolderId)return;const d=i?i.innerHTML:"";i&&(i.innerHTML="<i class='bx bx-loader-alt bx-spin'></i> جاري المزامنة...",i.disabled=!0);try{const r=await fetch(`/api/sync-drive?folderId=${encodeURIComponent(a.driveFolderId)}`),b=await r.json();if(!r.ok)throw new Error(b.error||"حدث خطأ أثناء المزامنة");b.nationalId?(document.getElementById("client-national-id").value=b.nationalId,k("تم العثور على الرقم القومي تلقائياً من ملفات درايف!","success"),i&&(i.style.display="none")):p||k("لم يتم العثور على رقم قومي في صور المجلد.","warning")}catch(f){console.error(f),p||k(f.message,"error")}finally{i&&(i.innerHTML=d,i.disabled=!1)}}i&&(i.addEventListener("click",()=>{o(!1)}),s&&!a?.nationalId&&o(!0))}function Lt(e){j("القضايا");const t=c.getAll(l.CASES);c.getAll(l.CLIENTS),c.getAll(l.USERS),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-folder-open'></i> القضايا</h1>
          <div class="page-header-sub">${t.length} قضية</div>
        </div>
        ${It("createCase")?`<button class="btn btn-primary" onclick="window.location.hash='/cases/new'"><i class='bx bx-plus'></i> إضافة قضية</button>`:""}
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
  `;function s(){const a=document.getElementById("case-search").value.toLowerCase(),i=document.getElementById("filter-type").value,o=document.getElementById("filter-status").value;let p=t;a&&(p=p.filter(f=>{const r=c.getById(l.CLIENTS,f.clientId);return f.caseNo.includes(a)||f.subject.toLowerCase().includes(a)||f.opponentName.toLowerCase().includes(a)||f.court.toLowerCase().includes(a)||r&&r.name.toLowerCase().includes(a)})),i&&(p=p.filter(f=>f.caseType===i)),o&&(p=p.filter(f=>f.status===o));const d=document.getElementById("case-table-body");if(p.length===0){d.innerHTML='<tr><td colspan="9"><div class="empty-state"><p>لا توجد قضايا</p></div></td></tr>';return}d.innerHTML=p.map(f=>{const r=c.getById(l.CLIENTS,f.clientId),b=c.getById(l.USERS,f.ownerId),g=me[f.caseType]||"civil",$=Re[f.status]||"active";return`
        <tr class="clickable-row" onclick="window.location.hash='/cases/${f.id}'">
          <td><strong>${f.caseNo||""}/${f.year||""}</strong></td>
          <td><span class="badge badge-${g}">${f.caseType||"—"}</span></td>
          <td>${r?r.name:"—"}</td>
          <td>${f.opponentName||"—"}</td>
          <td class="text-sm">${f.court||"—"}</td>
          <td class="text-sm">${f.subject||"—"}</td>
          <td>${f.stageType||"—"}</td>
          <td><span class="badge badge-${$}">${f.status||"—"}</span></td>
          <td class="text-sm">${b?b.name:"—"}</td>
        </tr>
      `}).join("")}s(),document.getElementById("case-search").addEventListener("input",s),document.getElementById("filter-type").addEventListener("change",s),document.getElementById("filter-status").addEventListener("change",s)}function De(e,t={}){const s=t.id&&!window.location.hash.includes("/new"),a=s?c.getById(l.CASES,t.id):null,i=c.getAll(l.CLIENTS),o=c.getAll(l.USERS);j(s?"تعديل القضية":"إضافة قضية جديدة"),e.innerHTML=`
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
                ${ct.map(r=>`<option value="${r}" ${a?.stageType===r?"selected":""}>${r}</option>`).join("")}
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
                ${dt.map(r=>`<option value="${r}" ${a?.criminalStageType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <hr style="border-color: var(--border-primary); margin: var(--space-6) 0;" />
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bxs-user-detail'></i> أطراف القضية</h3>
          
          <div class="form-row">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">العملاء <span class="required">*</span></label>
              <div class="client-tags" id="client-tags-container">
                ${(a?.clientIds||(a?.clientId?[a.clientId]:[])).map(r=>{const b=i.find($=>$.id===r),g=a?.primaryClientId===r;return b?`<span class="client-tag ${g?"primary":""}" data-client-id="${r}">${b.name}${g?" (رئيسي)":""}<button class="client-tag-remove" data-remove-id="${r}">&times;</button></span>`:""}).join("")}
              </div>
              <div class="flex gap-2">
                <select class="form-select" id="add-client-select" style="flex:1;">
                  <option value="">اختر عميل للإضافة...</option>
                  ${i.map(r=>`<option value="${r.id}">${r.name}</option>`).join("")}
                </select>
                <button type="button" class="btn btn-secondary btn-sm" id="add-client-btn"><i class='bx bx-plus'></i> إضافة</button>
              </div>
            </div>
          </div>
          
          <div class="form-group" id="primary-client-group" style="display: ${(a?.clientIds?.length||0)>1?"block":"none"};">
            <label class="form-label">العميل الرئيسي <span class="required">*</span></label>
            <div id="primary-client-radios">
              ${(a?.clientIds||[]).map(r=>{const b=i.find(g=>g.id===r);return b?`<label class="primary-select-radio"><input type="radio" name="primary-client" value="${r}" ${a?.primaryClientId===r?"checked":""} />${b.name}</label>`:""}).join("")}
            </div>
            <div class="form-hint">سيتم عرض اسم العميل الرئيسي في التقويم ولوحة التحكم</div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">صفة العميل <span class="required">*</span></label>
              <select class="form-select" id="case-client-role" required>
                <option value="">اختر الصفة</option>
                ${xe.map(r=>`<option value="${r}" ${a?.clientRole===r?"selected":""}>${r}</option>`).join("")}
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
                ${xe.map(r=>`<option value="${r}" ${a?.opponentRole===r?"selected":""}>${r}</option>`).join("")}
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
  `,document.getElementById("case-type").addEventListener("change",r=>{const b=document.getElementById("criminal-stage-group");b.style.display=r.target.value==="جنائي"?"block":"none"});let p=a?.clientIds?[...a.clientIds]:a?.clientId?[a.clientId]:[],d=a?.primaryClientId||a?.clientId||"";function f(){const r=document.getElementById("client-tags-container"),b=document.getElementById("primary-client-group"),g=document.getElementById("primary-client-radios");r.innerHTML=p.map($=>{const y=i.find(n=>n.id===$),h=d===$;return y?`<span class="client-tag ${h?"primary":""}" data-client-id="${$}">${y.name}${h?" (رئيسي)":""}<button class="client-tag-remove" data-remove-id="${$}">&times;</button></span>`:""}).join(""),r.querySelectorAll(".client-tag-remove").forEach($=>{$.addEventListener("click",y=>{y.preventDefault();const h=$.dataset.removeId;p=p.filter(n=>n!==h),d===h&&(d=p[0]||""),f()})}),p.length>1?(b.style.display="block",g.innerHTML=p.map($=>{const y=i.find(h=>h.id===$);return y?`<label class="primary-select-radio"><input type="radio" name="primary-client" value="${$}" ${d===$?"checked":""} />${y.name}</label>`:""}).join(""),g.querySelectorAll('input[type="radio"]').forEach($=>{$.addEventListener("change",()=>{d=$.value,f()})})):(b.style.display="none",p.length===1&&(d=p[0]))}document.getElementById("add-client-btn").addEventListener("click",()=>{const r=document.getElementById("add-client-select"),b=r.value;b&&(p.includes(b)||(p.push(b),p.length===1&&(d=b),r.value="",f()))}),f(),document.getElementById("case-form").addEventListener("submit",r=>{r.preventDefault();const b=bt({caseNo:document.getElementById("case-no").value.trim(),year:document.getElementById("case-year").value.trim(),stageType:document.getElementById("case-stage").value,clientId:d,clientIds:[...p],primaryClientId:d,clientRole:document.getElementById("case-client-role").value,opponentName:document.getElementById("case-opponent").value.trim(),opponentRole:document.getElementById("case-opponent-role").value,court:document.getElementById("case-court").value.trim(),circuit:document.getElementById("case-circuit").value.trim(),caseType:document.getElementById("case-type").value,subject:document.getElementById("case-subject").value.trim(),firstSessionDate:document.getElementById("case-first-session").value,ownerId:document.getElementById("case-owner").value,status:s?document.getElementById("case-status")?.value||a.status:"نشطة",criminalStageType:document.getElementById("case-criminal-stage")?.value||"",notes:document.getElementById("case-notes").value.trim()}),g=[];if(b.caseNo||g.push("رقم القضية مطلوب"),b.year||g.push("السنة مطلوبة"),b.stageType||g.push("نوع المرحلة مطلوب"),p.length===0&&g.push("يجب إضافة عميل واحد على الأقل"),p.length>1&&!d&&g.push("يجب اختيار العميل الرئيسي عند وجود عدة عملاء"),b.clientRole||g.push("صفة العميل مطلوبة"),b.opponentName||g.push("اسم الخصم مطلوب"),b.opponentRole||g.push("صفة الخصم مطلوبة"),b.court||g.push("المحكمة مطلوبة"),b.circuit||g.push("الدائرة مطلوبة"),b.caseType||g.push("نوع القضية مطلوب"),b.subject||g.push("موضوع القضية مطلوب"),b.firstSessionDate||g.push("تاريخ أول جلسة مطلوب"),b.ownerId||g.push("المحامي المسؤول مطلوب"),b.caseType==="جنائي"&&!b.criminalStageType&&g.push("مرحلة القضية الجنائية مطلوبة"),s&&b.status==="مغلقة"){const $=c.query(l.ACTIONS,h=>h.caseId===t.id&&h.caseId!==""&&h.status!=="مكتمل"),y=c.query(l.DEADLINES,h=>h.caseId===t.id&&h.status==="مفتوح");$.length>0&&g.push(`لا يمكن إغلاق القضية: يوجد ${$.length} إجراء مفتوح مرتبط بها`),y.length>0&&g.push(`لا يمكن إغلاق القضية: يوجد ${y.length} موعد نهائي مفتوح`)}if(g.length>0){const $=document.getElementById("case-form-errors");$.style.display="block",$.innerHTML=g.join("<br>"),k("يرجى تصحيح الأخطاء","error");return}if(s)c.update(l.CASES,t.id,b),N(l.CASES,t.id,"update",b),k("تم تحديث القضية","success"),window.location.hash=`/cases/${t.id}`;else{const $=c.create(l.CASES,b);N(l.CASES,$.id,"create",b);const y=c.create(l.SESSIONS,{caseId:$.id,date:b.firstSessionDate,sessionType:b.caseType==="جنائي"&&b.criminalStageType==="تحقيقات نيابة"?"تحقيق":"جلسة استماع",decisionResult:"",nextSessionDate:"",notes:"جلسة أولى – تم إنشاؤها تلقائياً"});N(l.SESSIONS,y.id,"create",{auto:!0,caseId:$.id}),k("تم إنشاء القضية وجلستها الأولى بنجاح","success"),window.location.hash=`/cases/${$.id}`}})}const Dt=[{decisionType:"تأجيل لإعادة الإعلان",actionType:"إعلان/خدمة",executionProof:"تاريخ التقديم للمحضر + رقم المرجع + النتيجة",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل لتصريح",actionType:"تصريح محكمة",executionProof:"رقم التصريح + التاريخ + المرفق",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل لمذكرة ومستندات",actionType:"حزمة تحضير",executionProof:"تفاصيل التقديم",subTasks:[{title:"صياغة المذكرة",completed:!1},{title:"مراجعة المذكرة",completed:!1},{title:"تحضير المستندات",completed:!1},{title:"تصوير ونسخ",completed:!1},{title:"تقديم الحزمة",completed:!1}],requiresNextDate:!0},{decisionType:"إحالة لخبير",actionType:"متابعة خبير",executionProof:"متابعة الموعد + تقديم الملاحظات + استلام التقرير",subTasks:[{title:"متابعة موعد الخبير",completed:!1},{title:"تقديم ملاحظات",completed:!1},{title:"استلام التقرير",completed:!1}],requiresNextDate:!0},{decisionType:"شطب",actionType:"تجديد من الشطب",executionProof:"تقديم طلب التجديد",subTasks:[],requiresNextDate:!1},{decisionType:"صدور حكم",actionType:"مراجعة حكم",executionProof:"مراجعة الحكم وتحديد الإجراء التالي",subTasks:[],requiresNextDate:!1},{decisionType:"حبس احتياطي",actionType:"حضور تجديد حبس",executionProof:"حضور جلسة التجديد",subTasks:[],requiresNextDate:!1,urgent:!0},{decisionType:"طلب تحقيقات",actionType:"متابعة تحقيق",executionProof:"استلام التحقيق + الخطوة التالية",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل للمرافعة",actionType:"حزمة تحضير",executionProof:"تحضير المرافعة",subTasks:[{title:"تحضير نقاط المرافعة",completed:!1},{title:"مراجعة القضية",completed:!1}],requiresNextDate:!0},{decisionType:"تأجيل للاطلاع",actionType:"حزمة تحضير",executionProof:"الاطلاع والتحضير",subTasks:[{title:"الاطلاع على المستندات",completed:!1},{title:"تحضير الرد",completed:!1}],requiresNextDate:!0},{decisionType:"تأجيل عام",actionType:"أخرى",executionProof:"",subTasks:[],requiresNextDate:!0},{decisionType:"إحالة للمحكمة",actionType:"أخرى",executionProof:"إنشاء قضية جديدة مرتبطة",subTasks:[],requiresNextDate:!1,createsLinkedCase:!0},{decisionType:"نطق بالحكم",actionType:"مراجعة حكم",executionProof:"مراجعة الحكم وتحديد الإجراء التالي",subTasks:[],requiresNextDate:!1}];function ge(){const e=c.getAll(l.DECISION_MAP);return e.length===0?(Dt.forEach(t=>{c.create(l.DECISION_MAP,t)}),c.getAll(l.DECISION_MAP)):e}function pe(e){return ge().find(s=>s.decisionType===e)||null}function At(e,t){return c.update(l.DECISION_MAP,e,t)}function Ct(e){return c.create(l.DECISION_MAP,e)}function Bt(e){return c.softDelete(l.DECISION_MAP,e)}function Nt(e){const t=pe(e);return t?t.createsLinkedCase===!0:!1}function oe(e,t){c.getAll(e).length===0&&t.forEach((a,i)=>{c.create(e,{label:a,order:i})})}function te(){return oe(l.LOOKUP_ACTION_TYPES,ze),c.getAll(l.LOOKUP_ACTION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0)).map(e=>e.label)}function We(){return oe(l.LOOKUP_DECISION_TYPES,Je),c.getAll(l.LOOKUP_DECISION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0)).map(e=>e.label)}function qt(){return oe(l.LOOKUP_ACTION_TYPES,ze),c.getAll(l.LOOKUP_ACTION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0))}function Ot(){return oe(l.LOOKUP_DECISION_TYPES,Je),c.getAll(l.LOOKUP_DECISION_TYPES).sort((e,t)=>(e.order??0)-(t.order??0))}function jt(e,t){const a=c.getAll(e).reduce((i,o)=>Math.max(i,o.order??0),0);return c.create(e,{label:t.trim(),order:a+1})}function Pt(e,t,s){return c.update(e,t,{label:s.trim()})}function Mt(e,t){const s=c.getById(e,t);if(!s)return{ok:!1};const a=ge();let i=null;return e===l.LOOKUP_ACTION_TYPES?i=a.some(o=>o.actionType===s.label):i=a.some(o=>o.decisionType===s.label),c.softDelete(e,t),i?{ok:!0,warning:`"${s.label}" محذوف من القائمة لكنه لا يزال مرتبطاً بربط قرارات. يُنصح بمراجعة صفحة ربط القرارات.`}:{ok:!0}}function Xe(e,t){if(!ne()){k("تعديل الإجراءات متاح للشركاء فقط","error");return}const s=c.getById(l.ACTIONS,e);if(!s)return;const a=c.getAll(l.CLIENTS),i=c.getAll(l.CASES),p=c.getAll(l.USERS).filter(y=>y.active&&ve.includes(y.role)),d=s.status==="مكتمل",f=te();function r(y){return y?i.filter(h=>(h.clientIds||(h.clientId?[h.clientId]:[])).includes(y)||h.primaryClientId===y||h.clientId===y):[]}const b=r(s.clientId),g=`
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
            ${f.map(y=>`<option value="${y}" ${s.actionType===y?"selected":""}>${y}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select class="form-select" id="ea-priority">
            <option value="">بدون أولوية</option>
            ${be.map(y=>`<option value="${y}" ${s.priority===y?"selected":""}>${y}</option>`).join("")}
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
            ${b.map(y=>`<option value="${y.id}" ${s.caseId===y.id?"selected":""}>${y.caseNo}/${y.year} – ${y.subject}</option>`).join("")}
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
    </form>`;M("تعديل الإجراء (شريك)",g,{footer:`
    <button class="btn btn-primary" id="ea-save-btn">💾 حفظ التعديلات</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`,large:!0}),document.getElementById("ea-client")?.addEventListener("change",()=>{const y=document.getElementById("ea-client").value,h=document.getElementById("ea-case");if(!h)return;const n=r(y);h.innerHTML='<option value="">بدون قضية (مستوى العميل)</option>'+n.map(v=>`<option value="${v.id}">${v.caseNo}/${v.year} – ${v.subject}</option>`).join("")}),document.getElementById("ea-save-btn").addEventListener("click",()=>{const y=document.getElementById("ea-action-type").value,h=document.getElementById("ea-title").value.trim(),n=document.getElementById("ea-priority").value,v=document.getElementById("ea-client").value,x=document.getElementById("ea-case")?.value||"",u=document.getElementById("ea-responsible").value,I=document.getElementById("ea-due-date").value,S=document.getElementById("ea-notes").value.trim(),L=d&&document.getElementById("ea-exec-date")?.value||s.executionDate,D=d&&document.getElementById("ea-exec-details")?.value?.trim()||s.executionDetails,A=document.getElementById("ea-edit-reason").value.trim(),T=[s.actionType!==y,s.responsibleUserId!==u,s.clientId!==v,s.caseId!==x,d&&(s.executionDate!==L||s.executionDetails!==D)].some(Boolean),m=[];if(v||m.push("العميل مطلوب – لا يمكن إزالة ربط الإجراء بعميل"),y||m.push("نوع الإجراء مطلوب"),u||m.push("المحامي المسؤول مطلوب"),T&&!A&&m.push("سبب التعديل مطلوب عند تغيير الحقول الحساسة"),x){const E=c.getById(l.CASES,x);E&&((E.clientIds||(E.clientId?[E.clientId]:[])).includes(v)||E.primaryClientId===v||E.clientId===v||m.push("القضية المختارة لا تنتمي للعميل المحدد"))}if(m.length>0){const E=document.getElementById("ea-errors");E.style.display="block",E.innerHTML=m.join("<br>");return}const w={actionType:y,title:h,priority:n,clientId:v,caseId:x,responsibleUserId:u,dueDate:I,notes:S,executionDate:L,executionDetails:D};St(e,s,w,A),c.update(l.ACTIONS,e,w),k("تم حفظ التعديلات بنجاح","success"),O(),typeof t=="function"&&t()})}function Ut(e,t){const s=c.getById(l.ACTIONS,e);if(!s)return;if(s.status==="مكتمل"){k("هذا الإجراء مكتمل بالفعل ولا يمكن تعديل تقدمه","warning");return}const a=`
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
    </form>`;M("تحديث تقدم الإجراء",a,{footer:`
    <button class="btn btn-primary" id="pu-save-btn">✓ حفظ التقدم</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`});const o=document.getElementById("pu-status"),p=document.getElementById("pu-completion-fields");o?.addEventListener("change",()=>{p.style.display=o.value==="مكتمل"?"block":"none"}),document.getElementById("pu-save-btn").addEventListener("click",()=>{const d=document.getElementById("pu-status").value,f=document.getElementById("pu-notes").value.trim(),r=document.getElementById("pu-exec-date")?.value||"",b=document.getElementById("pu-exec-details")?.value?.trim()||"",g=[];if(d==="مكتمل"&&(r||g.push("تاريخ التنفيذ مطلوب لإكمال الإجراء"),b||g.push("تفاصيل التنفيذ / الإثبات مطلوبة لإكمال الإجراء")),g.length>0){const n=document.getElementById("pu-errors");n.style.display="block",n.innerHTML=g.join("<br>");return}const $={status:d,notes:f};d==="مكتمل"&&($.executionDate=r,$.executionDetails=b),c.update(l.ACTIONS,e,$);const y=d==="مكتمل"?"complete":"status_change";N(l.ACTIONS,e,y,{oldStatus:s.status,newStatus:d,notes:f});const h=d==="مكتمل"?"تم إكمال الإجراء ✓":`تم تحديث الحالة إلى: ${d}`;k(h,"success"),O(),typeof t=="function"&&t()})}function G(e,t={}){const s=c.getById(l.CASES,t.id);if(!s){e.innerHTML=`<div class="empty-state"><h3>القضية غير موجودة</h3><button class="btn btn-primary" onclick="window.location.hash='/cases'">العودة للقضايا</button></div>`;return}const a=c.getById(l.CLIENTS,s.primaryClientId||s.clientId),p=(s.clientIds||(s.clientId?[s.clientId]:[])).map(n=>c.getById(l.CLIENTS,n)).filter(Boolean).length>1?`${a?a.name:"—"} وآخرون`:a?a.name:"—",d=c.getById(l.USERS,s.ownerId),f=c.query(l.SESSIONS,n=>n.caseId===t.id).sort((n,v)=>new Date(v.date)-new Date(n.date)),r=c.query(l.ACTIONS,n=>n.caseId===t.id),b=c.query(l.DEADLINES,n=>n.caseId===t.id),g=c.getAll(l.USERS),$=r.filter(n=>n.status!=="مكتمل");b.filter(n=>n.status==="مفتوح");const y=me[s.caseType]||"civil",h=Re[s.status]||"active";j(`القضية ${s.caseNo}/${s.year}`),e.innerHTML=`
    <div class="animate-fade-in">
      <!-- Case Header -->
      <div class="case-detail-header">
        <div class="case-detail-info">
          <div class="case-badges">
            <span class="badge badge-${y}">${s.caseType}</span>
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
          <i class='bx bx-list-check'></i> الجلسات <span class="tab-count">${f.length}</span>
        </button>
        <button class="tab-btn" data-tab="actions">
          <i class='bx bxs-zap'></i> الإجراءات <span class="tab-count">${r.length}</span>
        </button>
        <button class="tab-btn" data-tab="deadlines">
          <i class='bx bxs-time'></i> المواعيد النهائية <span class="tab-count">${b.length}</span>
        </button>
      </div>
      
      <!-- Sessions Tab -->
      <div class="tab-panel active" id="tab-sessions">
        <div class="flex justify-between items-center mb-4">
          <h3>الجلسات${s.caseType==="جنائي"&&s.criminalStageType==="تحقيقات نيابة"?" / التحقيقات":""}</h3>
          <button class="btn btn-primary btn-sm" id="add-session-btn"><i class='bx bx-plus'></i> إضافة جلسة</button>
        </div>
        <div class="timeline" id="sessions-timeline">
          ${f.length===0?'<div class="empty-state"><p>لا توجد جلسات بعد</p></div>':""}
          ${f.map(n=>{const v=n.sessionType==="تحقيق",x=n.decisionResult?.includes("حكم"),u=n.status==="مغلق";return`
              <div class="timeline-item">
                <div class="timeline-dot ${x?"judgment":""} ${v?"investigation":""}"></div>
                <div class="timeline-content">
                  <div class="flex justify-between items-center">
                    <div class="timeline-date">${P(n.date)}</div>
                    <div class="flex items-center gap-2">
                      <span class="session-status-badge ${u?"session-status-closed":"session-status-open"}">${u?"مغلق":"مفتوح"}</span>
                      <span class="badge badge-${v?"criminal":"civil"}">${n.sessionType}</span>
                    </div>
                  </div>
                  <div class="timeline-title">${n.decisionResult||"بدون قرار بعد"}</div>
                  ${n.closureReason?`<div class="text-xs text-secondary mt-1">سبب الإغلاق: ${n.closureReason}</div>`:""}
                  ${n.nextSessionDate?`<div class="text-xs text-secondary mt-2">الجلسة التالية: ${P(n.nextSessionDate)}</div>`:""}
                  ${n.notes?`<div class="timeline-desc mt-2">${n.notes}</div>`:""}
                  <div class="flex gap-2 mt-2">
                    <button class="btn btn-ghost btn-sm edit-session-btn" data-id="${n.id}"><i class='bx bx-edit'></i> تعديل</button>
                    ${u?"":`<button class="btn btn-primary btn-sm close-session-btn" data-id="${n.id}">✓ إغلاق الجلسة</button>`}
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
        ${r.map(n=>{const v=c.getById(l.USERS,n.responsibleUserId),x=n.clientId?c.getById(l.CLIENTS,n.clientId):null,u=He[n.status]||"open",I=n.dueDate&&ie(n.dueDate)&&n.status!=="مكتمل",S=ne(),L=_(),D=n.status!=="مكتمل"&&(ne()||L&&n.responsibleUserId===L.id),A=wt(n.id),T=A.length===0?'<div class="text-xs text-secondary" style="padding:var(--space-2) 0">لا توجد سجلات تعديل</div>':A.map(m=>{const w=m.changes,E=new Date(m.timestamp).toLocaleString("ar-EG",{dateStyle:"short",timeStyle:"short"});if(m.action==="field_change"&&w&&w.field)return`<div class="action-history-entry">
                        <span class="action-history-time">${E}</span>
                        <span class="action-history-who">${m.userName}</span>
                        <span class="action-history-change">غيّر <strong>${w.fieldLabel}</strong>: <span class="old-val">${w.oldValue||"—"}</span> ← <span class="new-val">${w.newValue||"—"}</span>${w.editReason?` (السبب: ${w.editReason})`:""}</span>
                    </div>`;const B={create:"إنشاء",complete:"إكمال",update:"تعديل",delete:"حذف"}[m.action]||m.action;return`<div class="action-history-entry">
                    <span class="action-history-time">${E}</span>
                    <span class="action-history-who">${m.userName}</span>
                    <span class="action-history-change">${B}</span>
                </div>`}).join("");return`
            <div class="card mb-4 ${I?"risk-flag high":""}" style="border-right: 3px solid ${n.status==="مكتمل"?"var(--status-completed)":n.status==="معلق"?"var(--status-blocked)":"var(--status-progress)"};"
                 data-action-id="${n.id}">

              <!-- Header row: type + badges + buttons -->
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${n.actionType}</strong>
                  <span class="badge badge-${u}">${n.status}</span>
                  ${I?'<span class="badge badge-blocked">متأخر</span>':""}
                  ${n.caseId?"":'<span class="badge badge-open" style="font-size:9px;">مستوى العميل</span>'}
                </div>
                <div class="flex gap-2">
                  ${D?`<button class="btn btn-primary btn-sm complete-action-btn" data-id="${n.id}">✓ إكمال</button>`:""}
                  ${S?`<button class="btn btn-ghost btn-sm edit-action-btn" data-id="${n.id}" title="تعديل الإجراء (شريك فقط)"><i class='bx bx-edit'></i> تعديل</button>`:""}
                </div>
              </div>

              <!-- Details -->
              ${x?`<div class="text-xs text-secondary mb-1">العميل: <strong>${x.name}</strong></div>`:""}
              <div class="text-sm text-secondary">المسؤول: ${v?v.name:"—"}</div>
              ${n.title?`<div class="text-sm text-secondary mt-1">الوصف: ${n.title}</div>`:""}
              ${n.priority?`<span class="badge badge-progress" style="margin-top:4px;display:inline-block;">أولوية: ${n.priority}</span>`:""}
              ${n.dueDate?`<div class="text-xs text-secondary mt-1">تاريخ الاستحقاق: ${P(n.dueDate)}</div>`:""}
              ${n.executionDate?`<div class="text-xs text-accent mt-1">تم التنفيذ: ${P(n.executionDate)}</div>`:""}
              ${n.executionDetails?`<div class="text-sm mt-2" style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-sm);">${n.executionDetails}</div>`:""}
              ${n.notes?`<div class="text-xs text-secondary mt-2">${n.notes}</div>`:""}

              <!-- Sub-tasks -->
              ${n.subTasks&&n.subTasks.length>0?`
                <div class="mt-4">
                  <div class="text-xs font-semibold text-secondary mb-2">المهام الفرعية:</div>
                  <ul class="subtask-list">
                    ${n.subTasks.map((m,w)=>`
                      <li class="subtask-item ${m.completed?"completed":""}">
                        <input type="checkbox" ${m.completed?"checked":""} class="subtask-check" data-action-id="${n.id}" data-idx="${w}" />
                        <span>${m.title}</span>
                      </li>
                    `).join("")}
                  </ul>
                </div>
              `:""}

              <!-- Action History (toggle) -->
              <div class="action-history" id="history-${n.id}">
                <button class="action-history-toggle" data-target="history-body-${n.id}">
                  🕒 سجل التعديلات (${A.length})
                </button>
                <div class="action-history-body" id="history-body-${n.id}" style="display:none;">
                  ${T}
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
        ${b.length===0?'<div class="empty-state"><p>لا توجد مواعيد نهائية</p></div>':""}
        ${b.map(n=>{const v=c.getById(l.USERS,n.responsibleUserId),x=Fe[n.status]||"open",u=J(n.endDate),I=n.status==="مفتوح"&&u<0,S=n.status==="مفتوح"&&u>=0&&u<=3;return`
            <div class="card mb-4" style="border-right: 3px solid ${I?"var(--risk-high)":S?"var(--risk-medium)":n.status==="مكتمل"?"var(--status-completed)":"var(--status-open)"};">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${n.deadlineType}</strong>
                  <span class="badge badge-${x}">${n.status}</span>
                  ${I?'<span class="badge badge-blocked">متأخر!</span>':""}
                  ${S?'<span class="badge badge-progress">يقترب</span>':""}
                </div>
                ${n.status==="مفتوح"?`<button class="btn btn-primary btn-sm complete-deadline-btn" data-id="${n.id}">✓ إكمال</button>`:""}
              </div>
              <div class="flex gap-6 text-sm text-secondary">
                <span>من: ${P(n.startDate)}</span>
                <span>إلى: ${P(n.endDate)}</span>
                <span>المسؤول: ${v?v.name:"—"}</span>
              </div>
              ${n.status==="مفتوح"?`<div class="text-xs mt-2 ${I?"text-accent":""}">${I?`متأخر بـ ${Math.abs(u)} يوم`:u===0?"اليوم!":`متبقي ${u} يوم`}</div>`:""}
              ${n.completionNote?`<div class="text-sm mt-2" style="background: var(--bg-tertiary); padding: var(--space-3); border-radius: var(--radius-sm);">ملاحظة الإكمال: ${n.completionNote}</div>`:""}
            </div>
          `}).join("")}
      </div>
    </div>
  `,e.querySelectorAll(".tab-btn").forEach(n=>{n.addEventListener("click",()=>{e.querySelectorAll(".tab-btn").forEach(v=>v.classList.remove("active")),e.querySelectorAll(".tab-panel").forEach(v=>v.classList.remove("active")),n.classList.add("active"),document.getElementById(`tab-${n.dataset.tab}`).classList.add("active")})}),e.querySelector("#add-session-btn")?.addEventListener("click",()=>{de(t.id,s,g,e,t)}),e.querySelector("#create-action-btn")?.addEventListener("click",()=>{const n=s.primaryClientId||s.clientId||"";_t(t.id,n,s,g,e,t)}),e.querySelectorAll(".edit-session-btn").forEach(n=>{n.addEventListener("click",()=>{const v=c.getById(l.SESSIONS,n.dataset.id);v&&de(t.id,s,g,e,t,v,!1)})}),e.querySelectorAll(".close-session-btn").forEach(n=>{n.addEventListener("click",()=>{const v=c.getById(l.SESSIONS,n.dataset.id);v&&de(t.id,s,g,e,t,v,!0)})}),e.querySelectorAll(".complete-action-btn").forEach(n=>{n.addEventListener("click",()=>{Rt(n.dataset.id,e,t)})}),e.querySelectorAll(".edit-action-btn").forEach(n=>{n.addEventListener("click",()=>{Xe(n.dataset.id,()=>G(e,t))})}),e.querySelectorAll(".action-history-toggle").forEach(n=>{n.addEventListener("click",()=>{const v=document.getElementById(n.dataset.target);if(!v)return;const x=v.style.display==="none";v.style.display=x?"block":"none",n.classList.toggle("open",x)})}),e.querySelectorAll(".subtask-check").forEach(n=>{n.addEventListener("change",()=>{const v=c.getById(l.ACTIONS,n.dataset.actionId);if(v){const x=parseInt(n.dataset.idx);v.subTasks[x].completed=n.checked,c.update(l.ACTIONS,v.id,{subTasks:v.subTasks}),N(l.ACTIONS,v.id,"update",{subTaskIndex:x,completed:n.checked})}})}),e.querySelector("#add-deadline-btn")?.addEventListener("click",()=>{Ht(t.id,g,e,t)}),e.querySelectorAll(".complete-deadline-btn").forEach(n=>{n.addEventListener("click",()=>{Ft(n.dataset.id,e,t)})})}function _t(e,t,s,a,i,o){const p=a.filter(r=>r.active&&ve.includes(r.role)),d=`
    <form id="create-action-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">نوع الإجراء <span class="required">*</span></label>
          <select class="form-select" id="ca-action-type" required>
            <option value="">اختر النوع</option>
            ${te().map(r=>`<option value="${r}">${r}</option>`).join("")}
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
  `;M("إنشاء إجراء يدوي",d,{footer:`
    <button class="btn btn-primary" id="save-create-action-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `,large:!0}),document.getElementById("save-create-action-btn").addEventListener("click",()=>{const r=document.getElementById("ca-action-type").value,b=document.getElementById("ca-title").value.trim(),g=document.getElementById("ca-priority").value,$=document.getElementById("ca-responsible").value,y=document.getElementById("ca-due-date").value,h=document.getElementById("ca-notes").value.trim(),n=[];if(r||n.push("نوع الإجراء مطلوب"),$||n.push("المحامي المسؤول مطلوب – يجب اختياره"),n.length>0){const u=document.getElementById("ca-errors");u.style.display="block",u.innerHTML=n.join("<br>");return}const v=ye({clientId:t,caseId:e,sessionId:"",actionType:r,title:b,priority:g,responsibleUserId:$,status:"مفتوح",dueDate:y,notes:h}),x=c.create(l.ACTIONS,v);N(l.ACTIONS,x.id,"create",{manual:!0,actionType:r,responsibleUserId:$,caseId:e}),k(`تم إنشاء الإجراء: ${r}`,"success"),O(),G(i,o)})}function de(e,t,s,a,i,o=null,p=!1){const d=!!o,r=t.caseType==="جنائي"&&t.criminalStageType==="تحقيقات نيابة"?"التحقيق":"الجلسة",b=p,g=`
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
            ${rt.map(n=>`<option value="${n}" ${o?.sessionType===n?"selected":""}>${n}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">نتيجة القرار <span class="required">*</span></label>
        <select class="form-select" id="session-decision" required>
          <option value="">اختر القرار</option>
          ${We().map(n=>`<option value="${n}" ${o?.decisionResult===n?"selected":""}>${n}</option>`).join("")}
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
          ${ut.map(n=>`<option value="${n}" ${o?.closureReason===n?"selected":""}>${n}</option>`).join("")}
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
    <button class="btn btn-primary" id="save-session-btn">${b?"✓ حفظ وإغلاق الجلسة":d?"💾 حفظ":"✓ حفظ الجلسة وإنشاء الإجراء"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;M(`${b?"إغلاق":d?"تعديل":"إضافة"} ${r}`,g,{footer:y,large:!0});function h(){const n=document.getElementById("session-decision").value,v=pe(n),x=document.getElementById("session-action-preview"),u=document.getElementById("action-preview-text"),I=document.getElementById("next-date-required"),S=document.getElementById("closure-reason-group"),L=document.getElementById("next-date-group"),D=v?v.requiresNextDate:!1;v?(x.style.display="block",u.textContent=`سيتم إنشاء إجراء تلقائي: ${v.actionType}`,v.subTasks?.length>0&&(u.textContent+=` (${v.subTasks.length} مهام فرعية)`)):x.style.display="none",D?(L.style.display="block",I.style.display="inline",S.style.display="none"):n?(L.style.display="block",I.style.display="none",b?S.style.display="block":S.style.display="none"):(L.style.display="block",I.style.display="inline",S.style.display="none")}document.getElementById("session-decision").addEventListener("change",h),h(),document.getElementById("save-session-btn").addEventListener("click",()=>{const n=document.getElementById("session-date").value,v=document.getElementById("session-type").value,x=document.getElementById("session-decision").value,u=document.getElementById("session-next-date").value,I=document.getElementById("session-closure-reason")?.value||"",S=document.getElementById("session-notes").value,L=[];n||L.push("تاريخ الجلسة مطلوب"),v||L.push("نوع الجلسة مطلوب"),b&&!x&&L.push("لا يمكن إغلاق الجلسة بدون تسجيل القرار/النتيجة"),!b&&!x&&L.push("نتيجة القرار مطلوبة");const D=pe(x),A=D?D.requiresNextDate:!1;if(A&&!u&&L.push("تاريخ الجلسة التالية مطلوب لهذا النوع من القرار"),b&&!A&&x&&!u&&!I&&L.push("يجب اختيار سبب عدم وجود جلسة تالية لإغلاق الجلسة"),L.length>0){const B=document.getElementById("session-form-errors");B.style.display="block",B.innerHTML=L.join("<br>");return}const T=b?"مغلق":o?.status||"مفتوح",m=Ee({caseId:e,date:n,sessionType:v,decisionResult:x,nextSessionDate:u,status:T,closureReason:b?I:o?.closureReason||"",notes:S});let w;if(d?(c.update(l.SESSIONS,o.id,m),N(l.SESSIONS,o.id,"update",m),w={...o,...m}):(w=c.create(l.SESSIONS,m),N(l.SESSIONS,w.id,"create",m)),u&&c.query(l.SESSIONS,C=>C.caseId===e&&C.date===u&&C.id!==w.id).length===0){const C=Ee({caseId:e,date:u,sessionType:v,decisionResult:"",nextSessionDate:"",status:"مفتوح",closureReason:"",notes:"جلسة تالية – تم إنشاؤها تلقائياً"}),R=c.create(l.SESSIONS,C);N(l.SESSIONS,R.id,"create",{auto:!0,fromSession:w.id})}let E=!1;if(D)try{if(c.query(l.ACTIONS,C=>C.sessionId===w.id&&C.actionType===D.actionType).length===0){const C=c.getById(l.CASES,e),R=ye({caseId:e,sessionId:w.id,actionType:D.actionType,responsibleUserId:C?.ownerId||"",status:"مفتوح",subTasks:D.subTasks?D.subTasks.map(F=>({...F})):[],dueDate:u||"",notes:D.executionProof?`إثبات التنفيذ المطلوب: ${D.executionProof}`:""}),H=c.create(l.ACTIONS,R);N(l.ACTIONS,H.id,"create",{auto:!0,decision:x,sessionId:w.id}),E=!0,console.log("Action automatically created:",H)}else console.log("Action of this type already exists for this session, skipping creation.")}catch(B){console.error("Error creating action:",B),k("حدث خطأ أثناء إنشاء الإجراء التلقائي","error")}k(E?`تم ${b?"إغلاق":"حفظ"} الجلسة وإنشاء إجراء: ${D.actionType}`:b?"تم إغلاق الجلسة بنجاح":"تم حفظ الجلسة","success"),!d&&Nt(x)&&c.getById(l.CASES,e)&&k("يمكنك الآن إنشاء قضية محكمة مرتبطة من صفحة القضايا","info",5e3),O(),G(a,i)})}function Rt(e,t,s){const a=c.getById(l.ACTIONS,e);if(!a)return;const i=`
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
  `;M("إكمال الإجراء",i,{footer:`
    <button class="btn btn-primary" id="confirm-complete-action">✓ تأكيد الإكمال</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("confirm-complete-action").addEventListener("click",()=>{const p=document.getElementById("action-exec-date").value,d=document.getElementById("action-exec-details").value.trim();if(!p||!d){const f=document.getElementById("complete-action-errors");f.style.display="block",f.innerHTML="تاريخ التنفيذ وتفاصيل التنفيذ مطلوبان",k("لا يمكن إكمال الإجراء بدون بيانات التنفيذ","error");return}c.update(l.ACTIONS,e,{status:"مكتمل",executionDate:p,executionDetails:d}),N(l.ACTIONS,e,"complete",{executionDate:p}),k("تم إكمال الإجراء بنجاح","success"),O(),G(t,s)})}function Ht(e,t,s,a){const i=`
    <form id="deadline-modal-form">
      <div class="form-group">
        <label class="form-label">نوع الموعد النهائي <span class="required">*</span></label>
        <select class="form-select" id="deadline-type" required>
          <option value="">اختر النوع</option>
          ${Ye.map(p=>`<option value="${p}">${p}</option>`).join("")}
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
  `;M("إضافة موعد نهائي",i,{footer:`
    <button class="btn btn-primary" id="save-deadline-btn">✓ إضافة الموعد</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-deadline-btn").addEventListener("click",()=>{const p=document.getElementById("deadline-type").value,d=document.getElementById("deadline-start").value,f=document.getElementById("deadline-end").value,r=document.getElementById("deadline-responsible").value;if(!p||!d||!f||!r){document.getElementById("deadline-form-errors").style.display="block",document.getElementById("deadline-form-errors").innerHTML="جميع الحقول مطلوبة";return}const b=vt({caseId:e,deadlineType:p,startDate:d,endDate:f,responsibleUserId:r}),g=c.create(l.DEADLINES,b);N(l.DEADLINES,g.id,"create",b),k("تم إضافة الموعد النهائي","success"),O(),G(s,a)})}function Ft(e,t,s){M("إكمال الموعد النهائي",`
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
  `}),document.getElementById("confirm-complete-deadline").addEventListener("click",()=>{const o=document.getElementById("deadline-completion-note").value.trim();if(!o){document.getElementById("deadline-complete-errors").style.display="block",document.getElementById("deadline-complete-errors").innerHTML="ملاحظة الإكمال مطلوبة";return}c.update(l.DEADLINES,e,{status:"مكتمل",completionNote:o}),N(l.DEADLINES,e,"complete",{completionNote:o}),k("تم إكمال الموعد النهائي","success"),O(),G(t,s)})}function Q(e){j("الإجراءات");const t=_(),s=t?ee(t):null,a=s==="lawyer"||s==="trainee";let i=c.getAll(l.ACTIONS);a&&t&&(i=i.filter(n=>n.responsibleUserId===t.id));const o=c.getAll(l.CASES),p=c.getAll(l.CLIENTS),d=c.getAll(l.USERS);function f(){if(!a)return p;const n=new Set;return o.forEach(v=>{const x=v.ownerId===(t&&t.id),u=i.some(I=>I.caseId===v.id&&I.responsibleUserId===(t&&t.id));(x||u)&&(v.primaryClientId&&n.add(v.primaryClientId),v.clientId&&n.add(v.clientId),(v.clientIds||[]).forEach(I=>n.add(I)))}),p.filter(v=>n.has(v.id))}const r=f();e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-zap'></i> الإجراءات</h1>
          <div class="page-header-sub">
            ${i.filter(n=>n.status!=="مكتمل").length} إجراء مفتوح من ${i.length} إجمالي${a?" (مهامي فقط)":""}
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
          ${te().map(n=>`<option value="${n}">${n}</option>`).join("")}
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
          ${d.map(n=>`<option value="${n.id}">${n.name} (${n.role})</option>`).join("")}
        </select>`}
      </div>

      <div id="actions-container"></div>
    </div>
  `;function b(){const n=document.getElementById("action-search").value.toLowerCase(),v=document.getElementById("filter-action-type").value,x=document.getElementById("filter-action-status").value,u=document.getElementById("filter-action-scope").value,I=a?"":document.getElementById("filter-responsible")?.value||"";let S=i;v&&(S=S.filter(A=>A.actionType===v)),x&&(S=S.filter(A=>A.status===x)),u==="case"&&(S=S.filter(A=>!!A.caseId)),u==="client"&&(S=S.filter(A=>!A.caseId)),I&&(S=S.filter(A=>A.responsibleUserId===I)),n&&(S=S.filter(A=>{const T=A.caseId?c.getById(l.CASES,A.caseId):null,m=A.clientId?c.getById(l.CLIENTS,A.clientId):null;return A.actionType.toLowerCase().includes(n)||A.title&&A.title.toLowerCase().includes(n)||A.notes&&A.notes.toLowerCase().includes(n)||T&&(T.caseNo.includes(n)||T.subject.toLowerCase().includes(n))||m&&m.name.toLowerCase().includes(n)}));const L={};S.forEach(A=>{const T=A.actionType||"غير محدد";L[T]||(L[T]=[]),L[T].push(A)});const D=document.getElementById("actions-container");if(Object.keys(L).length===0){D.innerHTML='<div class="empty-state"><p>لا توجد إجراءات</p></div>';return}D.innerHTML=Object.entries(L).map(([A,T])=>`
      <div class="action-group">
        <div class="action-group-header">
          <span class="action-group-icon"><i class='bx bxs-zap'></i></span>
          <span class="action-group-title">${A}</span>
          <span class="action-group-count">${T.length}</span>
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
              ${T.map(m=>{const w=m.caseId?c.getById(l.CASES,m.caseId):null,B=(m.clientId?c.getById(l.CLIENTS,m.clientId):null)||(w?c.getById(l.CLIENTS,w.primaryClientId||w.clientId):null),C=c.getById(l.USERS,m.responsibleUserId),R=He[m.status]||"open",H=m.dueDate&&ie(m.dueDate)&&m.status!=="مكتمل",F=!m.caseId,z=ne(),U=t&&m.responsibleUserId===t.id,le=!a||F||t&&w&&(w.ownerId===t.id||m.responsibleUserId===t.id),tt=z?`<button class="btn btn-ghost btn-sm action-edit-btn" data-id="${m.id}" title="تعديل شامل"><i class='bx bx-edit'></i> تعديل</button>`:"",st=!z&&U&&m.status!=="مكتمل"?`<button class="btn btn-primary btn-sm action-progress-btn" data-id="${m.id}"><i class='bx bxs-zap'></i> تحديث التقدم</button>`:"",at=w&&le?`<button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${m.caseId}'">عرض القضية ←</button>`:w&&!le?'<span class="text-secondary text-xs">لا يوجد وصول</span>':"";return`
                  <tr class="${H?"risk-flag high":""}">
                    <td>
                      <span class="text-sm font-semibold">${B?B.name:"—"}</span>
                    </td>
                    <td>
                      ${w?le?`<a href="#/cases/${m.caseId}" style="color:var(--text-link);">${w.caseNo}/${w.year}</a>`:`<span class="text-secondary">${w.caseNo}/${w.year}</span>`:'<span class="badge badge-open" style="font-size:10px;">مستوى العميل</span>'}
                    </td>
                    <td class="text-sm">${m.title||"—"}</td>
                    <td>${C?C.name:"—"}</td>
                    <td>
                      <span class="badge badge-${R}">${m.status}</span>
                      ${H?'<span class="badge badge-blocked">متأخر</span>':""}
                    </td>
                    <td>${m.priority?`<span class="badge badge-progress">${m.priority}</span>`:"—"}</td>
                    <td>${P(m.dueDate)}</td>
                    <td>
                      <div class="flex gap-2" style="align-items:center;">
                        ${tt}
                        ${st}
                        ${at}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `).join("")}b();function g(){document.querySelectorAll(".action-edit-btn").forEach(n=>{n.addEventListener("click",()=>{Xe(n.dataset.id,()=>Q(e))})}),document.querySelectorAll(".action-progress-btn").forEach(n=>{n.addEventListener("click",()=>{Ut(n.dataset.id,()=>Q(e))})})}const $=b;function y(){$(),g()}document.getElementById("action-search").removeEventListener("input",b),document.getElementById("action-search").addEventListener("input",y),document.getElementById("filter-action-type").removeEventListener("change",b),document.getElementById("filter-action-type").addEventListener("change",y),document.getElementById("filter-action-status").removeEventListener("change",b),document.getElementById("filter-action-status").addEventListener("change",y),document.getElementById("filter-action-scope").removeEventListener("change",b),document.getElementById("filter-action-scope").addEventListener("change",y),a||document.getElementById("filter-responsible")?.addEventListener("change",y),g(),e.querySelector("#global-create-action-btn")?.addEventListener("click",()=>{zt(r,o,d,a,t,e)});function h(){Q(e)}e._refreshActionList=h}function zt(e,t,s,a,i,o){const p=s.filter(h=>h.active&&ve.includes(h.role)),f=`
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
            ${te().map(h=>`<option value="${h}">${h}</option>`).join("")}
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
  `;M("إنشاء إجراء جديد",f,{footer:`
    <button class="btn btn-primary" id="gca-save-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `,large:!0});const b=document.getElementById("gca-client-search"),g=document.getElementById("gca-client"),$=document.getElementById("gca-case"),y=document.getElementById("gca-case-hint");Array.from(g.options),b.addEventListener("input",()=>{const h=b.value.trim().toLowerCase();g.innerHTML='<option value="">اختر العميل...</option>',e.filter(v=>v.name.toLowerCase().includes(h)).forEach(v=>{const x=document.createElement("option");x.value=v.id,x.textContent=v.name,g.appendChild(x)})}),g.addEventListener("change",()=>{const h=g.value;if($.innerHTML="",$.disabled=!0,!h){$.innerHTML='<option value="">اختر العميل أولاً...</option>',y.textContent="اختر العميل لتحميل قضاياه";return}const n=t.filter(x=>(x.clientIds||(x.clientId?[x.clientId]:[])).includes(h)||x.primaryClientId===h||x.clientId===h),v=a&&i?n.filter(x=>x.ownerId===i.id||c.getAll(l.ACTIONS).some(u=>u.caseId===x.id&&u.responsibleUserId===i.id)):n;$.innerHTML='<option value="">بدون قضية (إجراء على مستوى العميل)</option>',v.forEach(x=>{const u=document.createElement("option");u.value=x.id,u.textContent=`${x.caseNo}/${x.year} – ${x.subject}`,u.dataset.ownerId=x.ownerId||"",$.appendChild(u)}),$.disabled=!1,y.textContent=v.length===0?"لا توجد قضايا متاحة لهذا العميل":`${v.length} قضية – اختياري`}),$.addEventListener("change",()=>{const n=$.options[$.selectedIndex]?.dataset?.ownerId;if(n){const v=document.getElementById("gca-responsible");v&&Array.from(v.options).find(u=>u.value===n)&&(v.value=n)}}),document.getElementById("gca-save-btn").addEventListener("click",()=>{const h=document.getElementById("gca-client").value,n=document.getElementById("gca-case").value,v=document.getElementById("gca-action-type").value,x=document.getElementById("gca-title").value.trim(),u=document.getElementById("gca-priority").value,I=document.getElementById("gca-responsible").value,S=document.getElementById("gca-due-date").value,L=document.getElementById("gca-notes").value.trim(),D=[];if(h||D.push("العميل مطلوب – لا يمكن حفظ الإجراء بدون تحديد العميل"),v||D.push("نوع الإجراء مطلوب"),x||D.push("عنوان / وصف الإجراء مطلوب"),I||D.push("المحامي المسؤول مطلوب"),n){const E=c.getById(l.CASES,n);E&&((E.clientIds||(E.clientId?[E.clientId]:[])).includes(h)||E.primaryClientId===h||E.clientId===h||D.push("القضية المختارة لا تنتمي للعميل المحدد"))}if(D.length>0){const E=document.getElementById("gca-errors");E.style.display="block",E.innerHTML=D.join("<br>");return}const A=ye({clientId:h,caseId:n||"",sessionId:"",actionType:v,title:x,priority:u,responsibleUserId:I,status:"مفتوح",dueDate:S,notes:L}),T=c.create(l.ACTIONS,A);N(l.ACTIONS,T.id,"create",{source:"global",clientId:h,caseId:n||null,actionType:v,responsibleUserId:I});const m=c.getById(l.CLIENTS,h)?.name||"";k(`تم إنشاء الإجراء: ${v} – ${m} (${n?"ضمن القضية":"على مستوى العميل"})`,"success"),O(),Q(o)})}function Yt(e){j("المواعيد النهائية");const t=c.getAll(l.DEADLINES);e.innerHTML=`
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
          ${Ye.map(a=>`<option value="${a}">${a}</option>`).join("")}
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
  `;function s(){const a=document.getElementById("filter-dl-type").value,i=document.getElementById("filter-dl-status").value;let o=t;a&&(o=o.filter(d=>d.deadlineType===a)),i&&(o=o.filter(d=>d.status===i)),o.sort((d,f)=>new Date(d.endDate)-new Date(f.endDate));const p=document.getElementById("dl-table-body");if(o.length===0){p.innerHTML='<tr><td colspan="8"><div class="empty-state"><p>لا توجد مواعيد نهائية</p></div></td></tr>';return}p.innerHTML=o.map(d=>{const f=c.getById(l.CASES,d.caseId),r=c.getById(l.USERS,d.responsibleUserId),b=Fe[d.status]||"open",g=J(d.endDate),$=d.status==="مفتوح"&&g<0,y=d.status==="مفتوح"&&g>=0&&g<=3;return`
        <tr class="${$?"risk-flag high":y?"risk-flag medium":""}">
          <td><strong>${d.deadlineType}</strong></td>
          <td>
            <a href="#/cases/${d.caseId}" style="color: var(--text-link);">
              ${f?f.caseNo+"/"+f.year:"—"}
            </a>
          </td>
          <td>${P(d.startDate)}</td>
          <td>${P(d.endDate)}</td>
          <td>
            ${d.status==="مفتوح"?$?`<span class="badge badge-blocked">متأخر ${Math.abs(g)} يوم</span>`:g===0?'<span class="badge badge-progress">اليوم!</span>':`<span class="badge ${y?"badge-progress":"badge-open"}">${g} يوم</span>`:"—"}
          </td>
          <td>${r?r.name:"—"}</td>
          <td><span class="badge badge-${b}">${d.status}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${d.caseId}'">عرض ←</button>
          </td>
        </tr>
      `}).join("")}s(),document.getElementById("filter-dl-type").addEventListener("change",s),document.getElementById("filter-dl-status").addEventListener("change",s)}function fe(e){if(j("ربط القرارات بالإجراءات"),!W()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=ge();e.innerHTML=`
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
  `,e.querySelector("#add-mapping-btn").addEventListener("click",()=>{Ae(null,e)}),e.querySelectorAll(".edit-mapping").forEach(s=>{s.addEventListener("click",()=>{const a=t.find(i=>i.id===s.dataset.id);a&&Ae(a,e)})}),e.querySelectorAll(".delete-mapping").forEach(s=>{s.addEventListener("click",()=>{Bt(s.dataset.id),k("تم حذف الربط","success"),fe(e)})})}function Ae(e,t){const s=!!e,a=We(),i=te(),o=`
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
          ${i.map(d=>`<option value="${d}" ${e?.actionType===d?"selected":""}>${d}</option>`).join("")}
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
  `;M(s?"تعديل الربط":"إضافة ربط جديد",o,{footer:`
    <button class="btn btn-primary" id="save-mapping">${s?"💾 حفظ":"✓ إضافة"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-mapping").addEventListener("click",()=>{const d={decisionType:document.getElementById("map-decision").value,actionType:document.getElementById("map-action").value,executionProof:document.getElementById("map-proof").value,requiresNextDate:document.getElementById("map-requires-date").checked,urgent:document.getElementById("map-urgent").checked};if(!d.decisionType||!d.actionType){k("نوع القرار والإجراء مطلوبان","error");return}s?At(e.id,d):Ct(d),k(s?"تم تحديث الربط":"تم إضافة الربط","success"),O(),fe(t)})}const Ze="/api";function Qe(e){if(j("إدارة المستخدمين"),!W()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=c.getAll(l.USERS);e.innerHTML=`
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
  `,e.querySelector("#add-user-btn").addEventListener("click",()=>Ce(null,e)),e.querySelectorAll(".edit-user").forEach(s=>{s.addEventListener("click",()=>{const a=c.getById(l.USERS,s.dataset.id);a&&Ce(a,e)})}),e.querySelectorAll(".set-password-btn").forEach(s=>{s.addEventListener("click",()=>{Jt(s.dataset.id,s.dataset.name)})})}async function Jt(e,t){const s=`
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
  `;M("تعيين كلمة مرور",s,{footer:`
    <button class="btn btn-primary" id="adm-pw-save"><i class='bx bx-check'></i> تعيين كلمة المرور</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("adm-pw-save").addEventListener("click",async()=>{const i=document.getElementById("adm-pw").value,o=document.getElementById("adm-pw-confirm").value,p=document.getElementById("adm-pw-error");if(p.style.display="none",!i||i.length<8){p.textContent="كلمة المرور يجب أن تكون 8 أحرف على الأقل",p.style.display="block";return}if(i!==o){p.textContent="كلمتا المرور غير متطابقتين",p.style.display="block";return}const d=document.getElementById("adm-pw-save");d.disabled=!0,d.textContent="جارٍ الحفظ...";try{const f=await fetch(`${Ze}/auth/admin-set-password`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${V()}`},body:JSON.stringify({userId:e,password:i})}),r=await f.json();if(!f.ok){p.textContent=r.error||"حدث خطأ",p.style.display="block",d.disabled=!1,d.innerHTML="<i class='bx bx-check'></i> تعيين كلمة المرور";return}k(`✅ تم تعيين كلمة مرور ${t} بنجاح`,"success"),O()}catch{p.textContent="تعذر الاتصال بالخادم",p.style.display="block",d.disabled=!1,d.innerHTML="<i class='bx bx-check'></i> تعيين كلمة المرور"}})}function Ce(e,t){const s=!!e,a=`
    <form>
      <div class="form-group">
        <label class="form-label">الاسم <span class="required">*</span></label>
        <input type="text" class="form-input" id="user-name" value="${e?.name||""}" required />
      </div>
      <div class="form-group">
        <label class="form-label">الدور <span class="required">*</span></label>
        <select class="form-select" id="user-role" required>
          ${pt.map(o=>`<option value="${o}" ${e?.role===o?"selected":""}>${o}</option>`).join("")}
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
  `;M(s?"تعديل المستخدم":"إضافة مستخدم جديد",a,{footer:`
    <button class="btn btn-primary" id="save-user">${s?"💾 حفظ":"✓ إضافة المستخدم"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-user").addEventListener("click",async()=>{const o=document.getElementById("user-form-error");o.style.display="none";const p=document.getElementById("user-name").value.trim(),d=document.getElementById("user-role").value,f=document.getElementById("user-email").value.trim(),r=document.getElementById("user-phone").value.trim(),b=s?document.getElementById("user-active")?.checked:!0;if(!p){o.textContent="اسم المستخدم مطلوب",o.style.display="block";return}if(s){const g=Se({name:p,role:d,email:f,phone:r,active:b});c.update(l.USERS,e.id,g),N(l.USERS,e.id,"update",g),k("تم تحديث المستخدم","success")}else{const g=document.getElementById("user-password").value,$=document.getElementById("user-password-confirm").value;if(!g||g.length<8){o.textContent="كلمة المرور يجب أن تكون 8 أحرف على الأقل",o.style.display="block";return}if(g!==$){o.textContent="كلمتا المرور غير متطابقتين",o.style.display="block";return}const y=Se({name:p,role:d,email:f,phone:r,active:!0}),h=c.create(l.USERS,y);N(l.USERS,h.id,"create",y);try{const n=await fetch(`${Ze}/auth/admin-set-password`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${V()}`},body:JSON.stringify({userId:h.id,password:g})});if(n.ok)k(`✅ تم إضافة ${p} وتعيين كلمة مروره بنجاح`,"success");else{const v=await n.json();k(`تم إنشاء المستخدم لكن فشل تعيين كلمة المرور: ${v.error}`,"warning")}}catch{k("تم إنشاء المستخدم لكن تعذر الاتصال بالخادم لتعيين كلمة المرور","warning")}}O(),Qe(t)})}function Gt(e){if(j("سجل المراجعة"),!W()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const t=Tt(100);e.innerHTML=`
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
                  <td><span class="badge badge-${s.action==="create"?"open":s.action==="delete"?"blocked":"progress"}">${kt(s.action)}</span></td>
                  <td>${a}</td>
                  <td class="text-xs" style="font-family: monospace; color: var(--text-tertiary);">${s.entityId?s.entityId.substr(0,12):"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Kt(e){if(j("إعدادات النظام"),!W()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}ae(e)}function ae(e,t="notifications"){const s=c.getSetting("workdayEndTime")||"17:00",a=qt(),i=Ot();e.innerHTML=`
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
          ⚖️ أنواع القرارات <span class="badge badge-open" style="font-size:10px;">${i.length}</span>
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
        ${Be("action",a,"أنواع الإجراءات","⚡")}
      </div>

      <!-- Tab: Decision Types -->
      <div id="tab-decisions" style="display:${t==="decisions"?"block":"none"}">
        ${Be("decision",i,"أنواع القرارات","⚖️")}
      </div>
    </div>`,e.querySelectorAll(".settings-tab-btn").forEach(o=>{o.addEventListener("click",()=>ae(e,o.dataset.tab))}),e.querySelector("#save-settings-btn")?.addEventListener("click",()=>{const o=document.getElementById("workday-end-time").value;if(!o){k("وقت نهاية يوم العمل مطلوب","error");return}c.setSetting("workdayEndTime",o),k("تم حفظ الإعدادات بنجاح","success")}),Ne(e,"action",l.LOOKUP_ACTION_TYPES,()=>ae(e,"actions")),Ne(e,"decision",l.LOOKUP_DECISION_TYPES,()=>ae(e,"decisions"))}function Be(e,t,s,a){return`
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
            ${t.map((i,o)=>Vt(e,i,o+1)).join("")}
          </tbody>
        </table>
      </div>
      ${t.length===0?'<div class="empty-state"><p>لا توجد عناصر. أضف عنصراً جديداً.</p></div>':""}
    </div>`}function Vt(e,t,s){return`
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
    </tr>`}function Ne(e,t,s,a){e.querySelector(`#${t}-search`)?.addEventListener("input",i=>{const o=i.target.value.toLowerCase();e.querySelectorAll(`.${t}-row`).forEach(p=>{const d=p.querySelector(`.${t}-label`)?.textContent?.toLowerCase()||"";p.style.display=d.includes(o)?"":"none"})}),e.querySelector(`#${t}-add-btn`)?.addEventListener("click",()=>{const i=e.querySelector(`#${t}-add-row`);i.style.display="block",e.querySelector(`#${t}-add-input`)?.focus()}),e.querySelector(`#${t}-add-cancel`)?.addEventListener("click",()=>{e.querySelector(`#${t}-add-row`).style.display="none",e.querySelector(`#${t}-add-input`).value=""}),e.querySelector(`#${t}-add-confirm`)?.addEventListener("click",()=>{const o=e.querySelector(`#${t}-add-input`)?.value?.trim();if(!o){k("الاسم مطلوب","error");return}jt(s,o),k(`تمت إضافة "${o}"`,"success"),a()}),e.querySelectorAll(`.${t}-edit-btn`).forEach(i=>{i.addEventListener("click",()=>{const o=e.querySelector(`[data-id="${i.dataset.id}"].${t}-row`);o.querySelector(`.${t}-label`).style.display="none",o.querySelector(`.${t}-edit-input`).style.display="block",o.querySelector(`.${t}-edit-btn`).style.display="none",o.querySelector(`.${t}-delete-btn`).style.display="none",o.querySelector(`.${t}-save-btn`).style.display="inline-flex",o.querySelector(`.${t}-cancel-btn`).style.display="inline-flex",o.querySelector(`.${t}-edit-input`)?.focus()})}),e.querySelectorAll(`.${t}-cancel-btn`).forEach(i=>{i.addEventListener("click",()=>{const o=e.querySelector(`[data-id="${i.dataset.id}"].${t}-row`);o.querySelector(`.${t}-label`).style.display="",o.querySelector(`.${t}-edit-input`).style.display="none",o.querySelector(`.${t}-edit-btn`).style.display="inline-flex",o.querySelector(`.${t}-delete-btn`).style.display="inline-flex",o.querySelector(`.${t}-save-btn`).style.display="none",o.querySelector(`.${t}-cancel-btn`).style.display="none"})}),e.querySelectorAll(`.${t}-save-btn`).forEach(i=>{i.addEventListener("click",()=>{const p=e.querySelector(`[data-id="${i.dataset.id}"].${t}-row`).querySelector(`.${t}-edit-input`)?.value?.trim();if(!p){k("الاسم لا يمكن أن يكون فارغاً","error");return}Pt(s,i.dataset.id,p),k("تم التحديث","success"),a()})}),e.querySelectorAll(`.${t}-delete-btn`).forEach(i=>{i.addEventListener("click",()=>{if(!confirm("هل تريد حذف هذا العنصر؟"))return;const o=Mt(s,i.dataset.id);o.ok&&(o.warning?k(o.warning,"warning",6e3):k("تم الحذف","success"),a())})})}function Wt(e){j("التقويم");let t=new Date;t.setDate(1);function s(){const i=t.getFullYear(),o=t.getMonth(),p=c.getAll(l.SESSIONS),d=c.getAll(l.DEADLINES).filter(m=>m.status==="مفتوح"),f=c.getAll(l.CASES),r=c.getAll(l.CLIENTS),b={};function g(m){if(!m)return"—";const w=m.clientIds||(m.clientId?[m.clientId]:[]),E=m.primaryClientId||m.clientId,B=r.find(C=>C.id===E);return w.length>1&&B?B.name+" وآخرون":B?B.name:"—"}function $(m){return m?m.split("T")[0]:null}function y(m,w,E,B){const C=$(m);if(!C)return;const[R,H]=C.split("-").map(Number);if(R!==i||H-1!==o)return;b[C]||(b[C]=[]);const F=f.find(U=>U.id===E),z=g(F);b[C].push({type:w,title:z,caseId:E,label:B})}p.forEach(m=>{m.date&&y(m.date,"session",m.caseId,"جلسة")}),d.forEach(m=>{m.endDate&&y(m.endDate,"deadline",m.caseId,"موعد نهائي")});const h=new Date(i,o,1),n=new Date(i,o+1,0),v=h.getDay(),x=n.getDate(),u=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],I=["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"],S=new Date().toISOString().split("T")[0],L=3;let D="";for(let m=0;m<v;m++)D+='<div class="cal-day cal-day-empty"></div>';for(let m=1;m<=x;m++){const w=String(o+1).padStart(2,"0"),E=String(m).padStart(2,"0"),B=`${i}-${w}-${E}`,C=b[B]||[],R=B===S,H=C.slice(0,L),F=C.length-L;let z=H.map(U=>`
                <div class="cal-event cal-event-${U.type}"
                     data-caseid="${U.caseId}"
                     title="${U.title} – ${U.label}"
                     style="cursor:pointer; user-select:none;">
                    <span class="cal-dot cal-dot-${U.type}"></span>
                    <span class="cal-event-title">${U.title}</span>
                    <span class="cal-event-label">${U.label}</span>
                </div>
            `).join("");F>0&&(z+=`<button class="cal-more-btn" data-date="${B}">+${F} المزيد</button>`),D+=`
                <div class="cal-day ${R?"cal-day-today":""}" data-date="${B}"
                     style="user-select:none;">
                    <div class="cal-day-number">${m}</div>
                    <div class="cal-day-events">${z}</div>
                </div>
            `}const A=[];for(let m=1;m<=x;m++){const w=String(o+1).padStart(2,"0"),E=String(m).padStart(2,"0"),B=`${i}-${w}-${E}`,C=b[B];C&&C.length>0&&A.push({dateStr:B,day:m,events:C})}const T=A.length>0?A.map(({dateStr:m,day:w,events:E})=>`<div class="cal-agenda-day">
                    <div class="cal-agenda-day-header">
                        <div class="cal-agenda-day-num ${m===S?"today":""}">${w}</div>
                        <span>${u[o]} ${i}</span>
                    </div>
                    <div class="cal-agenda-day-events">
                        ${E.map(C=>`
                        <div class="cal-agenda-event" data-caseid="${C.caseId}" style="cursor:pointer;">
                            <span class="cal-agenda-event-dot" style="background:${C.type==="session"?"hsl(210,90%,56%)":"hsl(30,90%,56%)"}"></span>
                            <div class="cal-agenda-event-info">
                                <div class="cal-agenda-event-title">${C.title}</div>
                                <div class="cal-agenda-event-sub">${C.label}</div>
                            </div>
                        </div>`).join("")}
                    </div>
                </div>`).join(""):'<div class="cal-agenda-empty">📅 لا توجد أحداث هذا الشهر</div>';e.innerHTML=`
        <div class="animate-fade-in">
            <div class="cal-header">
                <button class="btn btn-ghost btn-sm" id="cal-prev">→</button>
                <h2 class="cal-month-title">${u[o]} ${i}</h2>
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
                    ${I.map(m=>`<div class="cal-weekday">${m}</div>`).join("")}
                </div>
                <div class="cal-days">
                    ${D}
                </div>
            </div>
            <div class="cal-agenda">
                ${T}
            </div>
        </div>
        `,e.querySelector("#cal-prev").addEventListener("click",()=>{t.setMonth(t.getMonth()-1),s()}),e.querySelector("#cal-next").addEventListener("click",()=>{t.setMonth(t.getMonth()+1),s()}),e.querySelector("#cal-today").addEventListener("click",()=>{t=new Date,t.setDate(1),s()}),e.querySelectorAll(".cal-event").forEach(m=>{m.addEventListener("click",w=>{w.stopPropagation();const E=m.dataset.caseid;E&&(window.location.hash=`/cases/${E}`)})}),e.querySelectorAll(".cal-agenda-event").forEach(m=>{m.addEventListener("click",()=>{const w=m.dataset.caseid;w&&(window.location.hash=`/cases/${w}`)})}),e.querySelectorAll(".cal-more-btn").forEach(m=>{m.addEventListener("click",w=>{w.stopPropagation();const E=m.dataset.date,B=b[E]||[];a(m,B,E)})}),e.querySelectorAll(".cal-day, .cal-event").forEach(m=>{m.setAttribute("draggable","false"),m.addEventListener("dragstart",w=>w.preventDefault())})}function a(i,o,p){document.querySelectorAll(".cal-popover").forEach(g=>g.remove());const f=new Date(p+"T00:00:00").toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}),r=document.createElement("div");r.className="cal-popover",r.innerHTML=`
            <div class="cal-popover-header">
                <span>${f}</span>
                <button class="cal-popover-close">&times;</button>
            </div>
            <div class="cal-popover-list">
                ${o.map(g=>`
                    <div class="cal-popover-item" data-caseid="${g.caseId}" style="cursor:pointer;">
                        <span class="cal-dot cal-dot-${g.type}"></span>
                        <span class="cal-popover-client">${g.title}</span>
                        <span class="cal-popover-type">${g.label}</span>
                    </div>
                `).join("")}
            </div>
        `,i.parentElement.appendChild(r),r.querySelector(".cal-popover-close").addEventListener("click",()=>r.remove()),r.querySelectorAll(".cal-popover-item").forEach(g=>{g.addEventListener("click",()=>{const $=g.dataset.caseid;$&&(window.location.hash=`/cases/${$}`),r.remove()})});const b=g=>{r.contains(g.target)||(r.remove(),document.removeEventListener("click",b))};setTimeout(()=>document.addEventListener("click",b),10)}s()}let he=!1;function Xt(){setInterval(qe,60*1e3),qe()}function qe(){const e=c.getSetting("workdayEndTime");if(!e)return;const t=new Date,[s,a]=e.split(":").map(Number),i=t.getHours()*60+t.getMinutes(),o=s*60+a;if(i<o){he&&Oe();return}const p=t.toISOString().split("T")[0],f=c.getAll(l.SESSIONS).filter(r=>r.date===p&&(!r.decisionResult||r.status!=="مغلق"));f.length>0?Zt(f):Oe()}function Zt(e){he=!0;const t=document.getElementById("notification-bar");if(!t)return;const s=c.getAll(l.CASES),a=c.getAll(l.CLIENTS);t.innerHTML=`
        <div class="notif-bar">
            <div class="notif-bar-content">
                <span class="notif-bar-icon">🔔</span>
                <span class="notif-bar-text">لديك <strong>${e.length}</strong> جلسات اليوم بدون نتائج مسجلة</span>
                <button class="notif-bar-toggle" id="notif-toggle">عرض التفاصيل ▼</button>
            </div>
            <div class="notif-bar-list" id="notif-list" style="display: none;">
                ${e.map(i=>{const o=s.find(f=>f.id===i.caseId),p=o?o.primaryClientId||o.clientId:"",d=a.find(f=>f.id===p);return`
                        <div class="notif-item">
                            <div class="notif-item-info">
                                <div class="notif-item-client">${d?d.name:"—"}</div>
                                <div class="notif-item-details">
                                    القضية ${o?o.caseNo+"/"+o.year:"—"}
                                    ${o?" – "+o.court:""}
                                </div>
                            </div>
                            <button class="btn btn-primary btn-sm notif-record-btn" data-caseid="${i.caseId}">تسجيل النتيجة الآن</button>
                        </div>
                    `}).join("")}
            </div>
        </div>
    `,t.style.display="block",t.querySelector("#notif-toggle")?.addEventListener("click",()=>{const i=t.querySelector("#notif-list"),o=t.querySelector("#notif-toggle");i.style.display==="none"?(i.style.display="block",o.textContent="إخفاء التفاصيل ▲"):(i.style.display="none",o.textContent="عرض التفاصيل ▼")}),t.querySelectorAll(".notif-record-btn").forEach(i=>{i.addEventListener("click",()=>{window.location.hash=`/cases/${i.dataset.caseid}`})})}function Oe(){he=!1;const e=document.getElementById("notification-bar");e&&(e.innerHTML="",e.style.display="none")}function Qt(e,t={}){j("استيراد عملاء من ملفات PDF");const s=c.getSetting("drive_pdf_folder_id")||"";e.innerHTML=`
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
    `;const a=e.querySelector("#btn-scan"),i=e.querySelector("#drive-folder-id"),o=e.querySelector("#loading-overlay"),p=e.querySelector("#scan-results-card"),d=e.querySelector("#import-table-body"),f=e.querySelector("#btn-import-selected"),r=e.querySelector("#selectAllDetected");let b=[];a.addEventListener("click",async()=>{const y=i.value.trim();if(!y){k("الرجاء إدخال رقم تعريف المجلد (Folder ID)","error");return}c.setSetting("drive_pdf_folder_id",y),o.style.display="flex";try{const n=await fetch(`/api/scan-drive-pdfs?folderId=${encodeURIComponent(y)}`),v=await n.json();if(!n.ok)throw new Error(v.error||"حدث خطأ أثناء المسح");b=v.clients||[],b.length===0?(k("لم يتم العثور على أي بيانات عملاء في المجلد.","warning"),p.style.display="none"):(k(`تم اكتشاف ${b.length} عميل`,"success"),g(b),p.style.display="block")}catch(h){console.error(h),k(h.message,"error")}finally{o.style.display="none"}});function g(y){d.innerHTML="",y.forEach((n,v)=>{const x=document.createElement("tr");x.innerHTML=`
                <td><input type="checkbox" class="client-checkbox" data-index="${v}" /></td>
                <td><input type="text" class="form-input w-full p-1" id="name-${v}" value="${n.name}" /></td>
                <td><input type="text" class="form-input w-full p-1" id="nid-${v}" value="${n.nationalId}" /></td>
                <td>
                    <span class="badge" title="File ID: ${n.sourceFileId}">
                        ${n.sourceFile}
                    </span>
                </td>
            `,d.appendChild(x)}),$(),e.querySelectorAll(".client-checkbox").forEach(n=>{n.addEventListener("change",$)})}r.addEventListener("change",y=>{e.querySelectorAll(".client-checkbox").forEach(n=>{n.checked=y.target.checked}),$()});function $(){const y=Array.from(e.querySelectorAll(".client-checkbox")).some(h=>h.checked);f.disabled=!y}f.addEventListener("click",()=>{const y=e.querySelectorAll(".client-checkbox");let h=0;y.forEach(n=>{if(n.checked){const v=n.getAttribute("data-index"),x=e.querySelector(`#name-${v}`).value.trim(),u=e.querySelector(`#nid-${v}`).value.trim(),I=b[v],S=Ge({name:x||I.name,nationalId:u||I.nationalId,notes:`تم إضافته من المسح الآلي للملف: ${I.sourceFile}`,driveFolderUrl:I.driveFolderUrl||"",driveFolderId:I.sourceFileId||""}),L=c.create(l.CLIENTS,S);N(l.CLIENTS,L.id,"create",S),h++}}),k(`تم استيراد ${h} عميل بنجاح`,"success"),setTimeout(()=>{window.location.hash="/clients"},1500)})}const je="/api";function es(e){j("استيراد عملاء من Google Sheets"),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-spreadsheet'></i> استيراد عملاء من Google Sheets</h1>
          <div class="page-header-sub">اقرأ بيانات العملاء مباشرةً من جدول Google Sheets وأضفهم إلى النظام</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/clients'">↩ العودة إلى العملاء</button>
      </div>

      <!-- Step 1: Sheet URL input -->
      <div class="card mb-4" id="step-input-card">
        <h3 class="font-bold mb-4"><span class="badge badge-primary" style="margin-left:8px;">1</span> رابط الجدول</h3>
        <div class="flex gap-3 items-end" style="flex-wrap:wrap;">
          <div class="form-group flex-1" style="min-width:240px;">
            <label class="form-label">رابط Google Sheet <span class="required">*</span></label>
            <input type="text" id="sheet-url" class="form-input" 
              placeholder="https://docs.google.com/spreadsheets/d/..." />
          </div>
          <div class="form-group" style="min-width:140px;">
            <label class="form-label">اسم الصفحة (اختياري)</label>
            <input type="text" id="tab-name" class="form-input" placeholder="Sheet1" />
          </div>
          <button id="btn-preview" class="btn btn-primary" style="margin-bottom:27px;">
            <i class='bx bx-search'></i> معاينة البيانات
          </button>
        </div>

        <!-- Header reference -->
        <div class="mt-3 p-3 rounded" style="background:rgba(99,102,241,0.08); font-size:var(--text-sm); color:var(--text-secondary);">
          <i class='bx bx-info-circle'></i>
          الأعمدة المطلوبة في الجدول:
          <code style="margin-right:6px; direction:rtl;">الفهرس | اسم الموكل | الهاتف | الرقم القومى | رقم التوكيل | مكتب التوثيق | drive link</code>
        </div>
      </div>

      <!-- Loading -->
      <div id="loading-bar" style="display:none; text-align:center; padding:2rem;">
        <i class='bx bx-loader-alt bx-spin' style="font-size:2.5rem; color:var(--accent-primary);"></i>
        <p class="mt-3" style="color:var(--text-secondary);">جاري قراءة البيانات من Google Sheets...</p>
      </div>

      <!-- Step 2: Preview results -->
      <div id="preview-section" style="display:none;">
        <div class="card mb-4">
          <div class="flex justify-between items-center mb-4" style="flex-wrap:wrap; gap:12px;">
            <h3 class="font-bold"><span class="badge badge-primary" style="margin-left:8px;">2</span> نتائج المعاينة</h3>
            <div class="flex gap-2" style="flex-wrap:wrap;">
              <span class="badge badge-open" id="stat-valid">0 صف صحيح</span>
              <span class="badge badge-closed" id="stat-invalid">0 صف خاطئ</span>
              <span class="badge" style="background:rgba(245,158,11,0.15);color:#d97706;" id="stat-conflict">0 تعارض</span>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex gap-2 mb-4" id="preview-tabs">
            <button class="btn btn-primary btn-sm tab-btn active" data-tab="valid">الصفوف الصحيحة</button>
            <button class="btn btn-ghost btn-sm tab-btn" data-tab="invalid">الصفوف الخاطئة</button>
            <button class="btn btn-ghost btn-sm tab-btn" data-tab="conflicts">التعارضات</button>
          </div>

          <!-- Valid rows -->
          <div id="tab-valid">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th width="40"><input type="checkbox" id="select-all-valid" /></th>
                    <th>#</th>
                    <th>اسم الموكل</th>
                    <th>الرقم القومى</th>
                    <th>الهاتف</th>
                    <th>رقم التوكيل</th>
                    <th>مكتب التوثيق</th>
                    <th>الفهرس</th>
                  </tr>
                </thead>
                <tbody id="valid-tbody"></tbody>
              </table>
            </div>
          </div>

          <!-- Invalid rows -->
          <div id="tab-invalid" style="display:none;">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>رقم الصف</th>
                    <th>البيانات الخام</th>
                    <th>الأخطاء</th>
                  </tr>
                </thead>
                <tbody id="invalid-tbody"></tbody>
              </table>
            </div>
          </div>

          <!-- Conflicts -->
          <div id="tab-conflicts" style="display:none;">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>رقم الصف</th>
                    <th>الرقم القومى</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody id="conflicts-tbody"></tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Step 3: Commit -->
        <div class="card" id="commit-card" style="display:none;">
          <h3 class="font-bold mb-4"><span class="badge badge-primary" style="margin-left:8px;">3</span> تأكيد الاستيراد</h3>
          <div class="flex gap-3 items-center" style="flex-wrap:wrap;">
            <div class="form-group" style="min-width:180px; margin-bottom:0;">
              <label class="form-label">وضع الاستيراد</label>
              <select id="import-mode" class="form-input">
                <option value="upsert">Upsert (إضافة + تحديث)</option>
                <option value="create">إضافة جديدة فقط</option>
                <option value="skip">تخطي المكرر</option>
              </select>
            </div>
            <button id="btn-commit" class="btn btn-success" style="align-self:flex-end;">
              <i class='bx bx-import'></i> استيراد الصفوف المختارة
            </button>
          </div>
          <div class="mt-3 text-sm" style="color:var(--text-secondary);">
            <i class='bx bx-info-circle'></i>
            Upsert: إذا كان الرقم القومي موجوداً سيتم تحديث البيانات، وإلا سيتم إنشاء عميل جديد.
          </div>
        </div>
      </div>

      <!-- Commit Results -->
      <div id="commit-results" style="display:none;" class="card mt-4">
        <h3 class="font-bold mb-3">نتائج الاستيراد</h3>
        <div id="commit-summary"></div>
      </div>
    </div>
    `;let t={validRows:[],invalidRows:[],conflicts:[]};const s=e.querySelector("#sheet-url"),a=e.querySelector("#tab-name"),i=e.querySelector("#btn-preview"),o=e.querySelector("#loading-bar"),p=e.querySelector("#preview-section"),d=e.querySelector("#stat-valid"),f=e.querySelector("#stat-invalid"),r=e.querySelector("#stat-conflict"),b=e.querySelector("#valid-tbody"),g=e.querySelector("#invalid-tbody"),$=e.querySelector("#conflicts-tbody"),y=e.querySelector("#select-all-valid"),h=e.querySelector("#commit-card"),n=e.querySelector("#btn-commit"),v=e.querySelector("#import-mode"),x=e.querySelector("#commit-results"),u=e.querySelector("#commit-summary");e.querySelectorAll(".tab-btn").forEach(T=>{T.addEventListener("click",()=>{e.querySelectorAll(".tab-btn").forEach(m=>{m.classList.remove("btn-primary","active"),m.classList.add("btn-ghost")}),T.classList.add("btn-primary","active"),T.classList.remove("btn-ghost"),["valid","invalid","conflicts"].forEach(m=>{e.querySelector(`#tab-${m}`).style.display=T.dataset.tab===m?"":"none"})})}),i.addEventListener("click",async()=>{const T=s.value.trim();if(!T){k("أدخل رابط الجدول","error");return}o.style.display="block",p.style.display="none",x.style.display="none";try{const m=V(),w=await fetch(`${je}/clients/import/google-sheet/preview`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m}`},body:JSON.stringify({sheetUrl:T,tabName:a.value.trim()||void 0})}),E=await w.json();if(!w.ok)throw new Error(E.error||"حدث خطأ أثناء المعاينة");t=E,I(E)}catch(m){console.error(m),k(m.message,"error")}finally{o.style.display="none"}});function I({validRows:T,invalidRows:m,conflicts:w}){d.textContent=`${T.length} صف صحيح`,f.textContent=`${m.length} صف خاطئ`,r.textContent=`${w.length} تعارض`,b.innerHTML=T.length===0?'<tr><td colspan="8" class="text-center" style="color:var(--text-secondary); padding:2rem;">لا توجد صفوف صحيحة</td></tr>':T.map(E=>`
                <tr>
                  <td><input type="checkbox" class="row-check" data-row='${JSON.stringify(E)}' checked /></td>
                  <td>${E.rowNumber}</td>
                  <td>${D(E.data.name||E.data.fullNameAr)}</td>
                  <td style="font-family:monospace;">${D(E.data.nationalId)}</td>
                  <td>${D(E.data.phone)}</td>
                  <td>${D(E.data.powerOfAttorneyNo||E.data.poaNumber)}</td>
                  <td>${D(E.data.notaryOffice)}</td>
                  <td>${D(E.data.sourceIndex)}</td>
                </tr>`).join(""),g.innerHTML=m.length===0?'<tr><td colspan="3" class="text-center" style="color:var(--text-secondary); padding:2rem;">لا توجد صفوف خاطئة ✅</td></tr>':m.map(E=>`
                <tr>
                  <td>${E.rowNumber}</td>
                  <td style="font-size:var(--text-xs); max-width:240px; overflow:hidden; text-overflow:ellipsis;">${D((E.rawRow||[]).join(" | "))}</td>
                  <td>${E.errors.map(B=>`<div class="badge badge-closed" style="margin-bottom:3px;">${D(B)}</div>`).join("")}</td>
                </tr>`).join(""),$.innerHTML=w.length===0?'<tr><td colspan="3" class="text-center" style="color:var(--text-secondary); padding:2rem;">لا توجد تعارضات ✅</td></tr>':w.map(E=>`
                <tr>
                  <td>${E.rowNumber}</td>
                  <td style="font-family:monospace;">${A(E.nationalId)}</td>
                  <td>
                    <span class="badge" style="background:rgba(245,158,11,0.15);color:#d97706;">موجود بالفعل</span>
                    <a href="#/clients/${E.existingClientId}/edit" class="btn btn-ghost btn-sm" style="margin-right:6px;">عرض</a>
                  </td>
                </tr>`).join(""),p.style.display="",h.style.display=T.length>0?"":"none",y.checked=!0,S()}y.addEventListener("change",()=>{e.querySelectorAll(".row-check").forEach(T=>T.checked=y.checked),S()}),e.addEventListener("change",T=>{T.target.classList.contains("row-check")&&S()});function S(){const T=e.querySelectorAll(".row-check:checked").length;n.innerHTML=`<i class='bx bx-import'></i> استيراد ${T} صف`,n.disabled=T===0}n.addEventListener("click",async()=>{const T=[...e.querySelectorAll(".row-check:checked")];if(T.length===0){k("اختر صفاً واحداً على الأقل","error");return}const m=T.map(E=>JSON.parse(E.dataset.row)),w=v.value;n.disabled=!0,n.innerHTML="<i class='bx bx-loader-alt bx-spin'></i> جاري الاستيراد...";try{const E=V(),B=await fetch(`${je}/clients/import/google-sheet/commit`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${E}`},body:JSON.stringify({rows:m,mode:w})}),C=await B.json();if(!B.ok&&B.status!==409)throw new Error(C.error||"خطأ أثناء الاستيراد");L(C),k(`تم: ${C.created} إضافة، ${C.updated} تحديث`,"success")}catch(E){k(E.message,"error")}finally{n.disabled=!1,S()}});function L(T){x.style.display="",u.innerHTML=`
          <div class="flex gap-4" style="flex-wrap:wrap; margin-bottom:1rem;">
            <div class="card" style="flex:1; min-width:120px; text-align:center; padding:1rem; background:rgba(16,185,129,0.1);">
              <div style="font-size:2rem; font-weight:bold; color:#10b981;">${T.created}</div>
              <div style="color:var(--text-secondary);">تمت إضافتهم</div>
            </div>
            <div class="card" style="flex:1; min-width:120px; text-align:center; padding:1rem; background:rgba(99,102,241,0.1);">
              <div style="font-size:2rem; font-weight:bold; color:var(--accent-primary);">${T.updated}</div>
              <div style="color:var(--text-secondary);">تم تحديثهم</div>
            </div>
            <div class="card" style="flex:1; min-width:120px; text-align:center; padding:1rem; background:rgba(107,114,128,0.1);">
              <div style="font-size:2rem; font-weight:bold; color:var(--text-secondary);">${T.skipped}</div>
              <div style="color:var(--text-secondary);">تم تخطيهم</div>
            </div>
            ${T.errors&&T.errors.length>0?`
            <div class="card" style="flex:1; min-width:120px; text-align:center; padding:1rem; background:rgba(239,68,68,0.1);">
              <div style="font-size:2rem; font-weight:bold; color:#ef4444;">${T.errors.length}</div>
              <div style="color:var(--text-secondary);">أخطاء</div>
            </div>`:""}
          </div>
          ${T.errors&&T.errors.length>0?`
            <div class="mt-2">
              ${T.errors.map(m=>`<div class="badge badge-closed" style="margin:2px;">${D(m.error)} (صف ${m.rowNumber})</div>`).join("")}
            </div>`:""}
          <button class="btn btn-primary mt-3" onclick="window.location.hash='/clients'">
            <i class='bx bxs-group'></i> عرض قائمة العملاء
          </button>
        `}function D(T){return T?String(T).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):"—"}function A(T){return!T||T.length<8?"***":T.substring(0,3)+"********"+T.substring(11)}}const ts="/api";function ss(){const e=document.getElementById("auth-root");e.classList.remove("hidden"),e.innerHTML=`
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
    `;const t=document.getElementById("login-password"),s=document.getElementById("pw-toggle"),a=document.getElementById("pw-toggle-icon");s.addEventListener("click",()=>{const o=t.type==="password";t.type=o?"text":"password",a.className=o?"bx bx-show":"bx bx-hide"}),document.getElementById("login-form").addEventListener("submit",async o=>{o.preventDefault(),await as()}),setTimeout(()=>document.getElementById("login-email")?.focus(),100)}async function as(){const e=document.getElementById("login-email").value.trim(),t=document.getElementById("login-password").value,s=document.getElementById("login-btn"),a=document.getElementById("login-error");if(document.getElementById("login-error-text"),a.style.display="none",!e||!t){re("يرجى إدخال البريد الإلكتروني وكلمة المرور");return}s.classList.add("loading"),s.disabled=!0;try{const i=await fetch(`${ts}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:t})}),o=await i.json();if(!i.ok){re(o.error||"خطأ في تسجيل الدخول");return}localStorage.setItem("slf_jwt",o.token),localStorage.setItem("slf_current_user",JSON.stringify(o.user)),document.getElementById("auth-root").classList.add("hidden"),window.dispatchEvent(new CustomEvent("auth:login",{detail:o.user}))}catch{re("تعذر الاتصال بالخادم، يرجى المحاولة مجدداً")}finally{s.classList.remove("loading"),s.disabled=!1}}function re(e){const t=document.getElementById("login-error"),s=document.getElementById("login-error-text");t&&s&&(s.textContent=e,t.style.display="flex")}const ns="/api";function is(){const e=document.getElementById("auth-root");e.classList.remove("hidden");const s=new URLSearchParams(window.location.search).get("token");if(!s){e.innerHTML=`
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
    `,Pe("sp-password","sp-pw-toggle","sp-pw-icon"),Pe("sp-confirm","sp-confirm-toggle","sp-confirm-icon"),document.getElementById("sp-password").addEventListener("input",a=>{os(a.target.value)}),document.getElementById("set-pw-form").addEventListener("submit",async a=>{a.preventDefault(),await ls(s)}),setTimeout(()=>document.getElementById("sp-password")?.focus(),100)}function Pe(e,t,s){const a=document.getElementById(e),i=document.getElementById(t),o=document.getElementById(s);i.addEventListener("click",()=>{const p=a.type==="password";a.type=p?"text":"password",o.className=p?"bx bx-show":"bx bx-hide"})}function os(e){const t=document.getElementById("strength-fill"),s=document.getElementById("strength-label");let a=0;e.length>=8&&a++,/[A-Z]/.test(e)&&a++,/[0-9]/.test(e)&&a++,/[^A-Za-z0-9]/.test(e)&&a++;const i=[{pct:"0%",color:"transparent",text:""},{pct:"25%",color:"#ef4444",text:"ضعيفة جداً"},{pct:"50%",color:"#f59e0b",text:"ضعيفة"},{pct:"75%",color:"#60a5fa",text:"جيدة"},{pct:"100%",color:"#10b981",text:"قوية ✓"}],o=e.length===0?i[0]:i[Math.max(1,a)];t.style.width=o.pct,t.style.backgroundColor=o.color,s.textContent=o.text,s.style.color=o.color}async function ls(e){const t=document.getElementById("sp-password").value,s=document.getElementById("sp-confirm").value,a=document.getElementById("sp-btn");if(K("",""),t.length<8){K("error","كلمة المرور يجب أن تكون 8 أحرف على الأقل");return}if(t!==s){K("error","كلمتا المرور غير متطابقتين");return}a.classList.add("loading"),a.disabled=!0;try{const i=await fetch(`${ns}/auth/set-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:e,password:t})}),o=await i.json();if(!i.ok){K("error",o.error||"خطأ في تعيين كلمة المرور");return}K("success","تم تعيين كلمة المرور بنجاح! جارٍ تحويلك لتسجيل الدخول..."),setTimeout(()=>{const p=new URL(window.location.href);p.searchParams.delete("token"),window.history.replaceState({},"",p.pathname),window.location.hash="/login",window.location.reload()},1800)}catch{K("error","تعذر الاتصال بالخادم، يرجى المحاولة مجدداً")}finally{a.classList.remove("loading"),a.disabled=!1}}function K(e,t){const s=document.getElementById("sp-message");if(s){if(!t){s.style.display="none";return}s.className=e==="error"?"auth-error":"auth-success",s.innerHTML=`<i class='bx ${e==="error"?"bx-error-circle":"bx-check-circle"}'></i><span>${t}</span>`,s.style.display="flex"}}async function cs(){const t=new URLSearchParams(window.location.search).get("token"),s=window.location.hash;if(t||s==="#/set-password"){is();return}if(!gt()){ss(),window.addEventListener("auth:login",()=>{document.getElementById("auth-root").classList.add("hidden"),Me()},{once:!0});return}await Me()}async function Me(){const e=[l.CLIENTS,l.CASES,l.SESSIONS,l.ACTIONS,l.DEADLINES,l.USERS];await c.syncFromServer(e),$t();let t=_();if(!t){const s=c.getAll(l.USERS);s.length>0&&(Ke(s[0]),t=s[0])}xt(),ms(),bs(),q("/",we),q("/dashboard",we),q("/clients",Ve),q("/clients/new",Le),q("/clients/:id/edit",Le),q("/clients/import",Qt),q("/clients/import-sheet",es),q("/cases",Lt),q("/cases/new",De),q("/cases/:id",G),q("/cases/:id/edit",De),q("/actions",Q),q("/deadlines",Yt),q("/calendar",Wt),q("/admin/mapping",fe),q("/admin/users",Qe),q("/admin/audit",Gt),q("/admin/settings",Kt),ds(),ot(),window.addEventListener("hashchange",()=>{et(window.location.hash.replace("#","")||"/dashboard")}),Xt(),(!window.location.hash||window.location.hash==="#")&&nt("/dashboard")}function ds(){const e=document.getElementById("topbar"),t=_();e.innerHTML=`
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
  `,e.querySelector("#logout-btn").addEventListener("click",()=>{confirm("هل تريد تسجيل الخروج؟")&&ft()}),e.querySelector("#change-pw-btn").addEventListener("click",us),document.getElementById("mobile-menu-btn").addEventListener("click",ps)}const rs="/api";function us(){M("تغيير كلمة المرور",`
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
    `}),document.getElementById("cp-save-btn").addEventListener("click",async()=>{const s=document.getElementById("cp-error"),a=document.getElementById("cp-success");s.style.display="none",a.style.display="none";const i=document.getElementById("cp-current").value,o=document.getElementById("cp-new").value,p=document.getElementById("cp-confirm").value;if(!i){s.textContent="أدخل كلمة المرور الحالية",s.style.display="block";return}if(!o||o.length<8){s.textContent="كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل",s.style.display="block";return}if(o!==p){s.textContent="كلمتا المرور غير متطابقتين",s.style.display="block";return}const d=document.getElementById("cp-save-btn");d.disabled=!0,d.textContent="جارٍ الحفظ...";try{const f=await fetch(`${rs}/auth/change-password`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${V()}`},body:JSON.stringify({currentPassword:i,newPassword:o})}),r=await f.json();if(!f.ok){s.textContent=r.error||"حدث خطأ",s.style.display="block",d.disabled=!1,d.innerHTML="<i class='bx bx-check'></i> تغيير كلمة المرور";return}a.innerHTML="<i class='bx bx-check-circle'></i> ✅ تم تغيير كلمة المرور بنجاح!",a.style.display="block",d.style.display="none",setTimeout(()=>O(),2e3)}catch{s.textContent="تعذر الاتصال بالخادم",s.style.display="block",d.disabled=!1,d.innerHTML="<i class='bx bx-check'></i> تغيير كلمة المرور"}})}function ps(){const e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e.classList.contains("open")?Ie():(e.classList.add("open"),t&&t.classList.add("active"),document.body.style.overflow="hidden")}function Ie(){const e=document.getElementById("sidebar"),t=document.getElementById("sidebar-overlay");e.classList.remove("open"),t&&t.classList.remove("active"),document.body.style.overflow=""}function ms(){if(document.getElementById("sidebar-overlay"))return;const e=document.createElement("div");e.id="sidebar-overlay",e.className="sidebar-overlay",e.addEventListener("click",Ie),document.getElementById("app").appendChild(e)}function bs(){if(document.getElementById("bottom-nav"))return;const e=c.count(l.ACTIONS,s=>s.status!=="مكتمل"),t=document.createElement("nav");t.id="bottom-nav",t.className="bottom-nav",t.innerHTML=`
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
  `,document.getElementById("app").appendChild(t),et(window.location.hash.replace("#","")||"/dashboard")}function et(e){const t=document.getElementById("bottom-nav");t&&t.querySelectorAll(".bottom-nav-item").forEach(s=>{const a=s.dataset.route;s.classList.toggle("active",e===a||a!=="/"&&e.startsWith(a))})}function j(e){const t=document.getElementById("topbar-page-title");t&&(t.textContent=e)}function P(e){return e?new Date(e).toLocaleDateString("ar-EG",{year:"numeric",month:"short",day:"numeric"}):"—"}function J(e){if(!e)return 1/0;const t=new Date(e),s=new Date;return s.setHours(0,0,0,0),t.setHours(0,0,0,0),Math.ceil((t-s)/(1e3*60*60*24))}function ie(e){return J(e)<0}document.addEventListener("DOMContentLoaded",cs);
