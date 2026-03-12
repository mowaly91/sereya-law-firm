(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const p of i.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&n(p)}).observe(document,{childList:!0,subtree:!0});function t(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=t(o);fetch(o.href,i)}})();const Y={};function q(e,s){Y[e]=s}function Ue(e){window.location.hash=e}function Pe(e){if(Y[e])return{handler:Y[e],params:{}};for(const s in Y){const t=s.split("/").filter(Boolean),n=e.split("/").filter(Boolean);if(t.length!==n.length)continue;const o={};let i=!0;for(let p=0;p<t.length;p++)if(t[p].startsWith(":"))o[t[p].slice(1)]=n[p];else if(t[p]!==n[p]){i=!1;break}if(i)return{handler:Y[s],params:o}}return null}function pe(){const e=window.location.hash.slice(1)||"/",s=Pe(e);if(s){const t=document.getElementById("page-content");t&&(t.innerHTML="",s.handler(t,s.params)),document.querySelectorAll(".sidebar-link").forEach(n=>{const o=n.getAttribute("data-route");o===e||e.startsWith(o)&&o!=="/"?n.classList.add("active"):n.classList.remove("active")})}else{const t=document.getElementById("page-content");t&&(t.innerHTML=`
        <div class="empty-state">
          <div class="icon">🔍</div>
          <h3>الصفحة غير موجودة</h3>
          <p>الصفحة المطلوبة غير متوفرة</p>
          <button class="btn btn-primary" onclick="window.location.hash='/'">العودة للرئيسية</button>
        </div>
      `)}}function He(){window.addEventListener("hashchange",pe),pe()}const J="slf_";function G(e){return J+e}function _e(){return Date.now().toString(36)+Math.random().toString(36).substr(2,9)}const d={getAll(e){const s=localStorage.getItem(G(e));return(s?JSON.parse(s):[]).filter(n=>!n._deleted)},getAllIncludingDeleted(e){const s=localStorage.getItem(G(e));return s?JSON.parse(s):[]},getById(e,s){return this.getAll(e).find(n=>n.id===s)||null},create(e,s){const t=this.getAllIncludingDeleted(e),n={...s,id:_e(),_createdAt:new Date().toISOString(),_updatedAt:new Date().toISOString(),_deleted:!1};return t.push(n),localStorage.setItem(G(e),JSON.stringify(t)),n},update(e,s,t){const n=this.getAllIncludingDeleted(e),o=n.findIndex(p=>p.id===s);if(o===-1)return null;const i={...n[o]};return n[o]={...n[o],...t,id:n[o].id,_createdAt:n[o]._createdAt,_updatedAt:new Date().toISOString(),_deleted:n[o]._deleted},localStorage.setItem(G(e),JSON.stringify(n)),{oldItem:i,newItem:n[o]}},softDelete(e,s){const t=this.getAllIncludingDeleted(e),n=t.findIndex(o=>o.id===s);return n===-1?!1:(t[n]._deleted=!0,t[n]._deletedAt=new Date().toISOString(),localStorage.setItem(G(e),JSON.stringify(t)),!0)},query(e,s){return this.getAll(e).filter(s)},count(e,s){return s?this.query(e,s).length:this.getAll(e).length},clear(e){localStorage.removeItem(G(e))},clearAll(){Object.keys(localStorage).forEach(e=>{e.startsWith(J)&&localStorage.removeItem(e)})},getSetting(e){const s=localStorage.getItem(J+"settings"),t=s?JSON.parse(s):{};return t[e]!==void 0?t[e]:null},setSetting(e,s){const t=localStorage.getItem(J+"settings"),n=t?JSON.parse(t):{};n[e]=s,localStorage.setItem(J+"settings",JSON.stringify(n))}},xe=["مدني","جنائي","إداري","أسرة","عمالي","تجاري"],ne={مدني:"civil",جنائي:"criminal",إداري:"admin",أسرة:"family",عمالي:"labor",تجاري:"commercial"},Fe=["أول درجة","استئناف","نقض"],ze=["تحقيقات نيابة","جنحة","جناية","استئناف","نقض"],me=["مدعي","مدعى عليه","مستأنف","مستأنف ضده","متهم","مجني عليه","طاعن","مطعون ضده"],we=["نشطة","حكم","مغلقة"],Te={نشطة:"active",حكم:"judgment",مغلقة:"closed"},De={مفتوح:"open","قيد التنفيذ":"progress",مكتمل:"completed",معلق:"blocked"},Ce={مفتوح:"open",مكتمل:"completed",منتهي:"expired"},Ge=["جلسة استماع","حكم","خبير","تحقيق","تجديد","نطق بالحكم","مرافعة","تأجيل"],Ye=["حجز للحكم","صدور حكم نهائي","شطب نهائي","حفظ","أخرى"],K=["إعلان/خدمة","تصريح محكمة","حزمة تحضير","متابعة خبير","تجديد من الشطب","مراجعة حكم","حضور تجديد حبس","متابعة تحقيق","استئناف","طعن","معارضة","أخرى"],ie=["عالية","متوسطة","منخفضة"],le=["شريك","محامي مسؤول","محامي","متدرب"],ke=["استئناف","نقض","معارضة","استئناف حبس","تجديد بعد الشطب","أخرى"],Ae=["تأجيل لإعادة الإعلان","تأجيل لتصريح","تأجيل لمذكرة ومستندات","إحالة لخبير","شطب","صدور حكم","حبس احتياطي","إخلاء سبيل","طلب تحقيقات","إحالة للمحكمة","حفظ","تأجيل للمرافعة","تأجيل للاطلاع","تأجيل عام","نطق بالحكم"],Je=["شريك","محامي مسؤول","محامي","متدرب"],Ve={شريك:"partner","محامي مسؤول":"caseOwner",محامي:"lawyer",متدرب:"trainee"},l={CLIENTS:"clients",CASES:"cases",SESSIONS:"sessions",ACTIONS:"actions",DEADLINES:"deadlines",USERS:"users",AUDIT:"audit",DECISION_MAP:"decision_map",SETTINGS:"settings"};function Ke(e){return{name:e.name||"",nationalId:e.nationalId||"",phone:e.phone||"",address:e.address||"",poaNumber:e.poaNumber||"",notaryOffice:e.notaryOffice||"",poaDate:e.poaDate||"",attachments:e.attachments||[],notes:e.notes||""}}function We(e){return{caseNo:e.caseNo||"",year:e.year||new Date().getFullYear().toString(),stageType:e.stageType||"",clientId:e.clientId||"",clientIds:e.clientIds||(e.clientId?[e.clientId]:[]),primaryClientId:e.primaryClientId||e.clientId||"",clientRole:e.clientRole||"",opponentName:e.opponentName||"",opponentRole:e.opponentRole||"",court:e.court||"",circuit:e.circuit||"",caseType:e.caseType||"",subject:e.subject||"",firstSessionDate:e.firstSessionDate||"",ownerId:e.ownerId||"",status:e.status||"نشطة",criminalStageType:e.criminalStageType||"",linkedProsecutionId:e.linkedProsecutionId||"",notes:e.notes||""}}function ve(e){return{caseId:e.caseId||"",date:e.date||"",sessionType:e.sessionType||"",decisionResult:e.decisionResult||"",nextSessionDate:e.nextSessionDate||"",status:e.status||"مفتوح",closureReason:e.closureReason||"",notes:e.notes||"",attachments:e.attachments||[]}}function oe(e){return{clientId:e.clientId||"",caseId:e.caseId||"",sessionId:e.sessionId||"",actionType:e.actionType||"",title:e.title||"",priority:e.priority||"",responsibleUserId:e.responsibleUserId||"",status:e.status||"مفتوح",executionDate:e.executionDate||"",executionDetails:e.executionDetails||"",subTasks:e.subTasks||[],dueDate:e.dueDate||"",notes:e.notes||"",attachments:e.attachments||[]}}function Xe(e){return{caseId:e.caseId||"",deadlineType:e.deadlineType||"",startDate:e.startDate||"",endDate:e.endDate||"",responsibleUserId:e.responsibleUserId||"",status:e.status||"مفتوح",completionNote:e.completionNote||""}}function Qe(e){return{name:e.name||"",role:e.role||"محامي",email:e.email||"",phone:e.phone||"",active:e.active!==void 0?e.active:!0}}let Q=null;function ce(e){Q=e,localStorage.setItem("slf_current_user",JSON.stringify(e))}function U(){if(!Q){const e=localStorage.getItem("slf_current_user");e&&(Q=JSON.parse(e))}return Q}function W(e){return e&&Ve[e.role]||null}const Ze={partner:{createCase:!0,editCase:"all",createSession:!0,editSession:"all",completeAction:!0,createDeadline:!0,closeCase:!0,deleteRecords:"soft",adminConfig:!0,viewAll:!0,lockUnlock:!0},caseOwner:{createCase:!0,editCase:"own",createSession:!0,editSession:"own",completeAction:!0,createDeadline:!0,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1},lawyer:{createCase:!1,editCase:"assigned",createSession:"assigned",editSession:"assigned",completeAction:"assigned",createDeadline:!1,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1},trainee:{createCase:!1,editCase:!1,createSession:!1,editSession:!1,completeAction:"addDetails",createDeadline:!1,closeCase:!1,deleteRecords:!1,adminConfig:!1,viewAll:!1,lockUnlock:!1}};function et(e,s={}){const t=U();if(!t)return!1;const n=W(t);if(!n)return!1;const o=Ze[n];if(!o)return!1;const i=o[e];return i===!0?!0:i===!1||i===void 0?!1:i==="all"?!0:i==="own"?s.ownerId===t.id:i==="assigned"?s.ownerId===t.id||s.responsibleUserId===t.id||s.assignedTo===t.id:i==="addDetails"?s.responsibleUserId===t.id||s.assignedTo===t.id:i==="soft"}function X(){const e=U();return e?W(e)==="partner":!1}function Z(){const e=U();return e?W(e)==="partner":!1}function tt(){if(d.getAll(l.USERS).length>0)return;const s=d.create(l.USERS,{name:"أحمد أحمد سريا",role:"شريك",email:"ahmed@serya.law",phone:"01000000001",active:!0});d.create(l.USERS,{name:"فتحي أحمد سريا",role:"شريك",email:"fathy@serya.law",phone:"01000000002",active:!0});const t=d.create(l.USERS,{name:"محمد عبد الرحمن",role:"محامي مسؤول",email:"mohamed@serya.law",phone:"01000000003",active:!0}),n=d.create(l.USERS,{name:"سارة أحمد",role:"محامي",email:"sara@serya.law",phone:"01000000004",active:!0});d.create(l.USERS,{name:"يوسف محمود",role:"متدرب",email:"youssef@serya.law",phone:"01000000005",active:!0}),ce(s);const o=d.create(l.CLIENTS,{name:"شركة النور للتجارة",nationalId:"12345678901234",phone:"01100000001",address:"القاهرة - المعادي - شارع 9",poaNumber:"POA-2025-001",notaryOffice:"مكتب توثيق المعادي",poaDate:"2025-01-15",notes:"عميل مهم - قضايا تجارية"}),i=d.create(l.CLIENTS,{name:"أحمد محمد إبراهيم",nationalId:"28501012345678",phone:"01200000002",address:"الجيزة - الدقي",poaNumber:"POA-2025-002",notaryOffice:"مكتب توثيق الدقي",poaDate:"2025-02-10",notes:""}),p=d.create(l.CLIENTS,{name:"فاطمة حسن علي",nationalId:"29001234567890",phone:"01500000003",address:"الإسكندرية - سموحة",poaNumber:"POA-2025-003",notaryOffice:"مكتب توثيق سموحة",poaDate:"2025-03-05",notes:"قضية أسرة"}),v=d.create(l.CASES,{caseNo:"1234",year:"2025",stageType:"أول درجة",clientId:o.id,clientIds:[o.id],primaryClientId:o.id,clientRole:"مدعي",opponentName:"شركة الفجر للاستيراد",opponentRole:"مدعى عليه",court:"محكمة القاهرة الاقتصادية",circuit:"الدائرة الثالثة",caseType:"مدني",subject:"مطالبة بمستحقات تجارية",firstSessionDate:"2026-03-01",ownerId:t.id,status:"نشطة"}),y=d.create(l.CASES,{caseNo:"5678",year:"2025",stageType:"أول درجة",clientId:i.id,clientIds:[i.id],primaryClientId:i.id,clientRole:"متهم",opponentName:"النيابة العامة",opponentRole:"سلطة اتهام",court:"نيابة شمال القاهرة",circuit:"",caseType:"جنائي",criminalStageType:"تحقيقات نيابة",subject:"تحقيق جنائي - نصب",firstSessionDate:"2026-02-28",ownerId:s.id,status:"نشطة"}),r=d.create(l.CASES,{caseNo:"9101",year:"2026",stageType:"استئناف",clientId:p.id,clientIds:[p.id,o.id],primaryClientId:p.id,clientRole:"مستأنف",opponentName:"خالد حسن محمود",opponentRole:"مستأنف ضده",court:"محكمة استئناف الإسكندرية",circuit:"الدائرة الأولى أسرة",caseType:"أسرة",subject:"استئناف حكم نفقة",firstSessionDate:"2026-03-05",ownerId:t.id,status:"نشطة"}),m=d.create(l.SESSIONS,{caseId:v.id,date:"2026-03-01",sessionType:"جلسة استماع",decisionResult:"تأجيل لإعادة الإعلان",nextSessionDate:"2026-03-15",notes:"لم يحضر المدعى عليه - تأجيل لإعادة الإعلان"});d.create(l.ACTIONS,{caseId:v.id,sessionId:m.id,actionType:"إعلان/خدمة",responsibleUserId:n.id,status:"مفتوح",dueDate:"2026-03-10",notes:"إعادة إعلان المدعى عليه - شركة الفجر للاستيراد"});const f=d.create(l.SESSIONS,{caseId:y.id,date:"2026-02-28",sessionType:"تحقيق",decisionResult:"حبس احتياطي",nextSessionDate:"2026-03-14",notes:"تم حبس المتهم احتياطياً 15 يوماً"});d.create(l.ACTIONS,{caseId:y.id,sessionId:f.id,actionType:"حضور تجديد حبس",responsibleUserId:s.id,status:"مفتوح",dueDate:"2026-03-13",notes:"حضور جلسة تجديد الحبس الاحتياطي"}),d.create(l.DEADLINES,{caseId:y.id,deadlineType:"استئناف حبس",startDate:"2026-02-28",endDate:"2026-03-07",responsibleUserId:s.id,status:"مفتوح",completionNote:""}),d.create(l.ACTIONS,{caseId:r.id,sessionId:"",actionType:"حزمة تحضير",responsibleUserId:t.id,status:"قيد التنفيذ",dueDate:"2026-03-03",subTasks:[{title:"صياغة المذكرة",completed:!0},{title:"مراجعة المذكرة",completed:!1},{title:"تحضير المستندات",completed:!1},{title:"تقديم الحزمة",completed:!1}],notes:"تحضير مذكرة الاستئناف ومستنداتها"}),d.setSetting("workdayEndTime","17:00"),console.log("✅ Seed data loaded successfully")}function st(){const e=document.getElementById("sidebar"),s=U(),t=d.count(l.ACTIONS,o=>o.status!=="مكتمل"),n=d.count(l.DEADLINES,o=>o.status==="مفتوح");e.innerHTML=`
    <div class="sidebar-logo flex flex-col items-center gap-2">
      <img src="/logo-transparent.png" alt="Saryia Logo" style="width: 120px; margin-bottom: -10px;" />
      <h2 style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--accent-primary);">مكتب سرية للمحاماه</h2>
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
          ${t>0?`<span class="badge">${t}</span>`:""}
        </button>
        <button class="sidebar-link" data-route="/deadlines" onclick="window.location.hash='/deadlines'">
          <span class="icon"><i class='bx bxs-time'></i></span>
          المواعيد النهائية
          ${n>0?`<span class="badge">${n}</span>`:""}
        </button>
      </div>
      
      ${X()?`
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
      <div class="sidebar-user-avatar">${s?s.name.charAt(0):"?"}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${s?s.name:"مستخدم"}</div>
        <div class="sidebar-user-role">${s?s.role:""}</div>
      </div>
    </div>
  `}function be(e){M("لوحة التحكم");const s=U(),t=s?W(s):null,n=t==="lawyer"||t==="trainee",o=d.getAll(l.CASES),i=d.getAll(l.SESSIONS);let p=d.getAll(l.ACTIONS);n&&s&&(p=p.filter(c=>c.responsibleUserId===s.id));const v=d.getAll(l.DEADLINES),y=d.getAll(l.CLIENTS),r=o.filter(c=>c.status==="نشطة").length,m=p.filter(c=>c.status!=="مكتمل").length,f=v.filter(c=>c.status==="مفتوح").length,u=new Date;u.setHours(0,0,0,0);const w=new Date(u);w.setDate(w.getDate()+7);const I=i.filter(c=>{if(!c.nextSessionDate)return!1;const h=new Date(c.nextSessionDate);return h>=u&&h<=w}).sort((c,h)=>new Date(c.nextSessionDate)-new Date(h.nextSessionDate)),a=o.filter(c=>{if(!c.firstSessionDate)return!1;const h=new Date(c.firstSessionDate);return h>=u&&h<=w}),b={};p.filter(c=>c.status!=="مكتمل").forEach(c=>{b[c.actionType]||(b[c.actionType]=[]),b[c.actionType].push(c)});const $=[];I.forEach(c=>{const h=F(c.nextSessionDate);if(h<=3){const x=p.filter(T=>T.sessionId===c.id&&T.status!=="مكتمل");if(x.length>0){const T=d.getById(l.CASES,c.caseId);$.push({level:"high",icon:"<i class='bx bxs-circle'></i>",text:`جلسة خلال ${h} أيام مع ${x.length} إجراء مفتوح – القضية ${T?T.caseNo:""}/${T?T.year:""}`})}}}),p.filter(c=>c.actionType==="حضور تجديد حبس"&&c.status!=="مكتمل").forEach(c=>{const h=d.getById(l.CASES,c.caseId);$.push({level:"high",icon:"<i class='bx bxs-bell-ring'></i>",text:`إجراء حبس احتياطي مفتوح – القضية ${h?h.caseNo:""}/${h?h.year:""}`})}),p.filter(c=>c.status!=="مكتمل"&&c.dueDate&&ee(c.dueDate)).forEach(c=>{const h=d.getById(l.CASES,c.caseId);$.push({level:"medium",icon:"<i class='bx bx-error'></i>",text:`إجراء متأخر: ${c.actionType} – القضية ${h?h.caseNo:""}/${h?h.year:""}`})}),v.filter(c=>c.status==="مفتوح"&&c.endDate&&ee(c.endDate)).forEach(c=>{const h=d.getById(l.CASES,c.caseId);$.push({level:"high",icon:"<i class='bx bxs-circle'></i>",text:`موعد نهائي متأخر: ${c.deadlineType} – القضية ${h?h.caseNo:""}/${h?h.year:""}`})}),e.innerHTML=`
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
              <div class="card-value">${y.length}</div>
              <div class="card-label">العملاء</div>
            </div>
            <div class="card-icon blue"><i class='bx bxs-group'></i></div>
          </div>
        </div>
      </div>
      
      <!-- Risk Flags -->
      ${$.length>0?`
        <div class="widget widget-full-width mb-6">
          <div class="widget-header">
            <div class="widget-title"><i class='bx bxs-flag'></i> تنبيهات المخاطر</div>
            <span class="badge badge-blocked">${$.length}</span>
          </div>
          <div class="widget-body">
            <div class="risk-flags-container">
              ${$.map(c=>`
                <div class="risk-flag ${c.level}">
                  <span class="risk-icon">${c.icon}</span>
                  <span>${c.text}</span>
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
            <span class="badge badge-open">${I.length+a.length}</span>
          </div>
          <div class="widget-body">
            ${I.length+a.length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد جلسات قادمة</p>
              </div>
            `:""}
            ${a.map(c=>{const h=d.getById(l.CLIENTS,c.clientId),x=F(c.firstSessionDate);return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${c.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${c.caseNo}/${c.year}</div>
                    <div class="widget-item-sub">${h?h.name:""} – ${c.subject}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${x<=1?"text-accent":""}">${j(c.firstSessionDate)}</div>
                    <div class="text-xs ${x<=1?"text-accent":"text-secondary"}">${x===0?"اليوم":x===1?"غداً":`خلال ${x} أيام`}</div>
                  </div>
                </div>
              `}).join("")}
            ${I.map(c=>{const h=d.getById(l.CASES,c.caseId),x=F(c.nextSessionDate);return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${c.caseId}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">القضية ${h?h.caseNo+"/"+h.year:""}</div>
                    <div class="widget-item-sub">${c.decisionResult} → ${c.sessionType}</div>
                  </div>
                  <div>
                    <div class="widget-item-date ${x<=1?"text-accent":""}">${j(c.nextSessionDate)}</div>
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
            ${Object.entries(b).map(([c,h])=>`
              <div class="widget-item">
                <div class="widget-item-info">
                  <div class="widget-item-title">${c}</div>
                  <div class="widget-item-sub">${h.length} إجراء</div>
                </div>
                <span class="badge badge-progress">${h.length}</span>
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
            ${v.filter(c=>c.status==="مفتوح").length===0?`
              <div class="empty-state" style="padding: var(--space-6);">
                <p>لا توجد مواعيد نهائية مفتوحة</p>
              </div>
            `:""}
            ${v.filter(c=>c.status==="مفتوح").sort((c,h)=>new Date(c.endDate)-new Date(h.endDate)).map(c=>{const h=d.getById(l.CASES,c.caseId),x=F(c.endDate),T=x<0?"badge-blocked":x<=3?"badge-progress":"badge-open";return`
                  <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${c.caseId}'">
                    <div class="widget-item-info">
                      <div class="widget-item-title">${c.deadlineType}</div>
                      <div class="widget-item-sub">القضية ${h?h.caseNo+"/"+h.year:""}</div>
                    </div>
                    <div>
                      <div class="widget-item-date">${j(c.endDate)}</div>
                      <span class="badge ${T}">${x<0?"متأخر":x===0?"اليوم":`${x} يوم`}</span>
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
            ${o.slice(-5).reverse().map(c=>{const h=d.getById(l.CLIENTS,c.clientId),x=ne[c.caseType]||"civil";return`
                <div class="widget-item clickable-row" onclick="window.location.hash='/cases/${c.id}'">
                  <div class="widget-item-info">
                    <div class="widget-item-title">${c.caseNo}/${c.year} – ${c.subject}</div>
                    <div class="widget-item-sub">${h?h.name:""}</div>
                  </div>
                  <span class="badge badge-${x}">${c.caseType}</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    </div>
  `}function k(e,s="success",t=3e3){const n=document.getElementById("toast-root"),o=document.createElement("div");o.className=`toast toast-${s}`;const i={success:"✓",error:"✕",warning:"⚠",info:"ℹ"};o.innerHTML=`<span>${i[s]||""}</span> ${e}`,n.appendChild(o),setTimeout(()=>{o.style.opacity="0",o.style.transform="translateY(-10px)",o.style.transition="all 300ms ease-out",setTimeout(()=>o.remove(),300)},t)}function P(e,s,t={}){const n=document.getElementById("modal-root"),o=t.large?"modal-lg":"",i=document.createElement("div");i.className="modal-overlay",i.id="active-modal",i.innerHTML=`
    <div class="modal ${o}">
      <div class="modal-header">
        <h2 class="modal-title">${e}</h2>
        <button class="modal-close" id="modal-close-btn">&times;</button>
      </div>
      <div class="modal-body">
        ${s}
      </div>
      ${t.footer?`<div class="modal-footer">${t.footer}</div>`:""}
    </div>
  `,n.appendChild(i),i.querySelector("#modal-close-btn").addEventListener("click",O),i.addEventListener("click",v=>{v.target===i&&O()});const p=v=>{v.key==="Escape"&&(O(),document.removeEventListener("keydown",p))};return document.addEventListener("keydown",p),i}function O(){const e=document.getElementById("active-modal");e&&(e.style.opacity="0",setTimeout(()=>e.remove(),150))}function at(e,s,t){const n=`
    <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">${s}</p>
  `,i=P(e,n,{footer:`
    <button class="btn btn-primary" id="confirm-yes">تأكيد</button>
    <button class="btn btn-secondary" id="confirm-no">إلغاء</button>
  `});i.querySelector("#confirm-yes").addEventListener("click",()=>{t(),O()}),i.querySelector("#confirm-no").addEventListener("click",O)}function L(e,s,t,n={}){const o=U(),i={entityType:e,entityId:s,action:t,userId:o?o.id:"system",userName:o?o.name:"النظام",timestamp:new Date().toISOString(),changes:n};return d.create(l.AUDIT,i),i}function nt(e,s,t,n=""){const o=U(),i=new Date().toISOString(),p={actionType:"نوع الإجراء",title:"العنوان / الوصف",dueDate:"تاريخ الاستحقاق",responsibleUserId:"المحامي المسؤول",priority:"الأولوية",notes:"الملاحظات",clientId:"العميل",caseId:"القضية",executionDate:"تاريخ التنفيذ",executionDetails:"تفاصيل التنفيذ / الإثبات",status:"الحالة"},v=["actionType","responsibleUserId","clientId","caseId","executionDate","executionDetails"],y=[];return Object.keys(p).forEach(r=>{const m=String(s[r]||""),f=String(t[r]||"");if(m===f)return;const u=v.includes(r),w={entityType:l.ACTIONS,entityId:e,action:"field_change",userId:o?o.id:"system",userName:o?o.name:"النظام",timestamp:i,changes:{field:r,fieldLabel:p[r]||r,oldValue:m,newValue:f,sensitive:u,editReason:u?n:""}};d.create(l.AUDIT,w),y.push(w)}),y}function it(e){return d.query(l.AUDIT,s=>s.entityId===e).sort((s,t)=>new Date(t.timestamp)-new Date(s.timestamp))}function lt(e=50){return d.getAll(l.AUDIT).sort((s,t)=>new Date(t.timestamp)-new Date(s.timestamp)).slice(0,e)}function ot(e){return{create:"إنشاء",update:"تعديل",complete:"إكمال",delete:"حذف",status_change:"تغيير حالة",field_change:"تعديل حقل"}[e]||e}function Le(e){M("العملاء");const s=d.getAll(l.CLIENTS);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-group'></i> العملاء</h1>
          <div class="page-header-sub">${s.length} عميل</div>
        </div>
        <button class="btn btn-primary" id="add-client-btn">
          <i class='bx bx-plus'></i> إضافة عميل
        </button>
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
            ${fe(s)}
          </tbody>
        </table>
      </div>
    </div>
  `,e.querySelector("#client-search").addEventListener("input",t=>{const n=t.target.value.toLowerCase(),o=s.filter(i=>i.name.toLowerCase().includes(n)||i.nationalId.includes(n)||i.phone.includes(n));document.getElementById("client-table-body").innerHTML=fe(o),ge()}),e.querySelector("#add-client-btn").addEventListener("click",()=>{window.location.hash="/clients/new"}),ge()}function fe(e){return e.length===0?'<tr><td colspan="7"><div class="empty-state"><p>لا يوجد عملاء</p></div></td></tr>':e.map(s=>`
    <tr class="clickable-row" data-id="${s.id}">
      <td><strong>${s.name}</strong></td>
      <td>${s.nationalId}</td>
      <td>${s.phone}</td>
      <td>${s.poaNumber}</td>
      <td>${s.notaryOffice}</td>
      <td>${j(s.poaDate)}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-ghost btn-sm edit-client" data-id="${s.id}"><i class='bx bx-edit'></i></button>
          <button class="btn btn-ghost btn-sm delete-client" data-id="${s.id}"><i class='bx bx-trash'></i></button>
        </div>
      </td>
    </tr>
  `).join("")}function ge(){document.querySelectorAll(".edit-client").forEach(e=>{e.addEventListener("click",s=>{s.stopPropagation(),window.location.hash=`/clients/${e.dataset.id}/edit`})}),document.querySelectorAll(".delete-client").forEach(e=>{e.addEventListener("click",s=>{s.stopPropagation(),at("حذف العميل","هل أنت متأكد من حذف هذا العميل؟",()=>{d.softDelete(l.CLIENTS,e.dataset.id),L(l.CLIENTS,e.dataset.id,"delete"),k("تم حذف العميل","success"),window.location.hash="/clients",Le(document.getElementById("page-content"))})})})}function ye(e,s={}){const t=s.id&&s.id!=="new",n=t?d.getById(l.CLIENTS,s.id):null;M(t?"تعديل بيانات العميل":"إضافة عميل جديد"),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1>${t?"<i class='bx bx-edit'></i> تعديل بيانات العميل":"<i class='bx bx-plus'></i> إضافة عميل جديد"}</h1>
          <div class="page-header-sub">${t?n?.name||"":"أدخل بيانات العميل الجديد"}</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/clients'">↩ العودة</button>
      </div>
      
      <div class="card" style="max-width: 800px;">
        <form id="client-form">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">اسم العميل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-name" value="${n?.name||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">الرقم القومي / السجل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-national-id" value="${n?.nationalId||""}" required />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">الهاتف <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-phone" value="${n?.phone||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">العنوان</label>
              <input type="text" class="form-input" id="client-address" value="${n?.address||""}" />
            </div>
          </div>
          
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">رقم التوكيل <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-poa" value="${n?.poaNumber||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">مكتب التوثيق <span class="required">*</span></label>
              <input type="text" class="form-input" id="client-notary" value="${n?.notaryOffice||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">تاريخ التوكيل <span class="required">*</span></label>
              <input type="date" class="form-input" id="client-poa-date" value="${n?.poaDate||""}" required />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea class="form-textarea" id="client-notes">${n?.notes||""}</textarea>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button type="submit" class="btn btn-primary">
              ${t?"💾 حفظ التعديلات":"✓ إنشاء العميل"}
            </button>
            <button type="button" class="btn btn-secondary" onclick="window.location.hash='/clients'">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `,e.querySelector("#client-form").addEventListener("submit",o=>{o.preventDefault();const i=Ke({name:document.getElementById("client-name").value.trim(),nationalId:document.getElementById("client-national-id").value.trim(),phone:document.getElementById("client-phone").value.trim(),address:document.getElementById("client-address").value.trim(),poaNumber:document.getElementById("client-poa").value.trim(),notaryOffice:document.getElementById("client-notary").value.trim(),poaDate:document.getElementById("client-poa-date").value,notes:document.getElementById("client-notes").value.trim()});if(!i.name||!i.nationalId||!i.phone||!i.poaNumber||!i.notaryOffice||!i.poaDate){k("يرجى ملء جميع الحقول المطلوبة","error");return}if(t)d.update(l.CLIENTS,s.id,i),L(l.CLIENTS,s.id,"update",i),k("تم تحديث بيانات العميل","success");else{const p=d.create(l.CLIENTS,i);L(l.CLIENTS,p.id,"create",i),k("تم إنشاء العميل بنجاح","success")}window.location.hash="/clients"})}function ct(e){M("القضايا");const s=d.getAll(l.CASES);d.getAll(l.CLIENTS),d.getAll(l.USERS),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-folder-open'></i> القضايا</h1>
          <div class="page-header-sub">${s.length} قضية</div>
        </div>
        ${et("createCase")?`<button class="btn btn-primary" onclick="window.location.hash='/cases/new'"><i class='bx bx-plus'></i> إضافة قضية</button>`:""}
      </div>
      
      <div class="filter-bar">
        <div class="search-input">
          <span class="search-icon">🔍</span>
          <input type="text" id="case-search" placeholder="بحث برقم القضية أو اسم العميل أو الخصم..." />
        </div>
        <select class="filter-select" id="filter-type">
          <option value="">كل الأنواع</option>
          ${xe.map(n=>`<option value="${n}">${n}</option>`).join("")}
        </select>
        <select class="filter-select" id="filter-status">
          <option value="">كل الحالات</option>
          ${we.map(n=>`<option value="${n}">${n}</option>`).join("")}
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
  `;function t(){const n=document.getElementById("case-search").value.toLowerCase(),o=document.getElementById("filter-type").value,i=document.getElementById("filter-status").value;let p=s;n&&(p=p.filter(y=>{const r=d.getById(l.CLIENTS,y.clientId);return y.caseNo.includes(n)||y.subject.toLowerCase().includes(n)||y.opponentName.toLowerCase().includes(n)||y.court.toLowerCase().includes(n)||r&&r.name.toLowerCase().includes(n)})),o&&(p=p.filter(y=>y.caseType===o)),i&&(p=p.filter(y=>y.status===i));const v=document.getElementById("case-table-body");if(p.length===0){v.innerHTML='<tr><td colspan="9"><div class="empty-state"><p>لا توجد قضايا</p></div></td></tr>';return}v.innerHTML=p.map(y=>{const r=d.getById(l.CLIENTS,y.clientId),m=d.getById(l.USERS,y.ownerId),f=ne[y.caseType]||"civil",u=Te[y.status]||"active";return`
        <tr class="clickable-row" onclick="window.location.hash='/cases/${y.id}'">
          <td><strong>${y.caseNo}/${y.year}</strong></td>
          <td><span class="badge badge-${f}">${y.caseType}</span></td>
          <td>${r?r.name:"—"}</td>
          <td>${y.opponentName}</td>
          <td class="text-sm">${y.court}</td>
          <td class="text-sm">${y.subject}</td>
          <td>${y.stageType}</td>
          <td><span class="badge badge-${u}">${y.status}</span></td>
          <td class="text-sm">${m?m.name:"—"}</td>
        </tr>
      `}).join("")}t(),document.getElementById("case-search").addEventListener("input",t),document.getElementById("filter-type").addEventListener("change",t),document.getElementById("filter-status").addEventListener("change",t)}function he(e,s={}){const t=s.id&&!window.location.hash.includes("/new"),n=t?d.getById(l.CASES,s.id):null,o=d.getAll(l.CLIENTS),i=d.getAll(l.USERS);M(t?"تعديل القضية":"إضافة قضية جديدة"),e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1>${t?"<i class='bx bx-edit'></i> تعديل القضية":"<i class='bx bx-plus'></i> إضافة قضية جديدة"}</h1>
          <div class="page-header-sub">${t?`القضية ${n?.caseNo}/${n?.year}`:"يتم إنشاء القضية فقط بعد الحصول على رقم القضية وتاريخ أول جلسة"}</div>
        </div>
        <button class="btn btn-secondary" onclick="window.location.hash='/cases'">↩ العودة</button>
      </div>
      
      <div class="card" style="max-width: 900px;">
        <form id="case-form">
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bx-list-check'></i> بيانات القضية الأساسية</h3>
          
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">رقم القضية <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-no" value="${n?.caseNo||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">السنة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-year" value="${n?.year||new Date().getFullYear()}" required />
            </div>
            <div class="form-group">
              <label class="form-label">نوع المرحلة <span class="required">*</span></label>
              <select class="form-select" id="case-stage" required>
                <option value="">اختر المرحلة</option>
                ${Fe.map(r=>`<option value="${r}" ${n?.stageType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">نوع القضية <span class="required">*</span></label>
              <select class="form-select" id="case-type" required>
                <option value="">اختر النوع</option>
                ${xe.map(r=>`<option value="${r}" ${n?.caseType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
            <div class="form-group" id="criminal-stage-group" style="display: ${n?.caseType==="جنائي"?"block":"none"};">
              <label class="form-label">مرحلة القضية الجنائية <span class="required">*</span></label>
              <select class="form-select" id="case-criminal-stage">
                <option value="">اختر المرحلة الجنائية</option>
                ${ze.map(r=>`<option value="${r}" ${n?.criminalStageType===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <hr style="border-color: var(--border-primary); margin: var(--space-6) 0;" />
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bxs-user-detail'></i> أطراف القضية</h3>
          
          <div class="form-row">
            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label">العملاء <span class="required">*</span></label>
              <div class="client-tags" id="client-tags-container">
                ${(n?.clientIds||(n?.clientId?[n.clientId]:[])).map(r=>{const m=o.find(u=>u.id===r),f=n?.primaryClientId===r;return m?`<span class="client-tag ${f?"primary":""}" data-client-id="${r}">${m.name}${f?" (رئيسي)":""}<button class="client-tag-remove" data-remove-id="${r}">&times;</button></span>`:""}).join("")}
              </div>
              <div class="flex gap-2">
                <select class="form-select" id="add-client-select" style="flex:1;">
                  <option value="">اختر عميل للإضافة...</option>
                  ${o.map(r=>`<option value="${r.id}">${r.name}</option>`).join("")}
                </select>
                <button type="button" class="btn btn-secondary btn-sm" id="add-client-btn"><i class='bx bx-plus'></i> إضافة</button>
              </div>
            </div>
          </div>
          
          <div class="form-group" id="primary-client-group" style="display: ${(n?.clientIds?.length||0)>1?"block":"none"};">
            <label class="form-label">العميل الرئيسي <span class="required">*</span></label>
            <div id="primary-client-radios">
              ${(n?.clientIds||[]).map(r=>{const m=o.find(f=>f.id===r);return m?`<label class="primary-select-radio"><input type="radio" name="primary-client" value="${r}" ${n?.primaryClientId===r?"checked":""} />${m.name}</label>`:""}).join("")}
            </div>
            <div class="form-hint">سيتم عرض اسم العميل الرئيسي في التقويم ولوحة التحكم</div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">صفة العميل <span class="required">*</span></label>
              <select class="form-select" id="case-client-role" required>
                <option value="">اختر الصفة</option>
                ${me.map(r=>`<option value="${r}" ${n?.clientRole===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">اسم الخصم <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-opponent" value="${n?.opponentName||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">صفة الخصم <span class="required">*</span></label>
              <select class="form-select" id="case-opponent-role" required>
                <option value="">اختر الصفة</option>
                ${me.map(r=>`<option value="${r}" ${n?.opponentRole===r?"selected":""}>${r}</option>`).join("")}
              </select>
            </div>
          </div>
          
          <hr style="border-color: var(--border-primary); margin: var(--space-6) 0;" />
          <h3 class="mb-4" style="color: var(--accent-primary);"><i class='bx bxs-bank'></i> بيانات المحكمة</h3>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">المحكمة / الجهة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-court" value="${n?.court||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">الدائرة <span class="required">*</span></label>
              <input type="text" class="form-input" id="case-circuit" value="${n?.circuit||""}" required />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">موضوع القضية (سطر واحد) <span class="required">*</span></label>
            <input type="text" class="form-input" id="case-subject" value="${n?.subject||""}" required />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">تاريخ أول جلسة <span class="required">*</span></label>
              <input type="date" class="form-input" id="case-first-session" value="${n?.firstSessionDate||""}" required />
            </div>
            <div class="form-group">
              <label class="form-label">المحامي المسؤول <span class="required">*</span></label>
              <select class="form-select" id="case-owner" required>
                <option value="">اختر المحامي</option>
                ${i.filter(r=>r.role!=="متدرب").map(r=>`<option value="${r.id}" ${n?.ownerId===r.id?"selected":""}>${r.name} (${r.role})</option>`).join("")}
              </select>
            </div>
          </div>
          
          ${t?`
          <div class="form-group">
            <label class="form-label">حالة القضية</label>
            <select class="form-select" id="case-status">
              ${we.map(r=>`<option value="${r}" ${n?.status===r?"selected":""}>${r}</option>`).join("")}
            </select>
          </div>
          `:""}
          
          <div class="form-group">
            <label class="form-label">ملاحظات</label>
            <textarea class="form-textarea" id="case-notes">${n?.notes||""}</textarea>
          </div>
          
          <div id="case-form-errors" class="form-error mb-4" style="display: none;"></div>
          
          <div class="flex gap-3 mt-6">
            <button type="submit" class="btn btn-primary">
              ${t?"💾 حفظ التعديلات":"✓ إنشاء القضية"}
            </button>
            <button type="button" class="btn btn-secondary" onclick="window.location.hash='/cases'">إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  `,document.getElementById("case-type").addEventListener("change",r=>{const m=document.getElementById("criminal-stage-group");m.style.display=r.target.value==="جنائي"?"block":"none"});let p=n?.clientIds?[...n.clientIds]:n?.clientId?[n.clientId]:[],v=n?.primaryClientId||n?.clientId||"";function y(){const r=document.getElementById("client-tags-container"),m=document.getElementById("primary-client-group"),f=document.getElementById("primary-client-radios");r.innerHTML=p.map(u=>{const w=o.find(a=>a.id===u),I=v===u;return w?`<span class="client-tag ${I?"primary":""}" data-client-id="${u}">${w.name}${I?" (رئيسي)":""}<button class="client-tag-remove" data-remove-id="${u}">&times;</button></span>`:""}).join(""),r.querySelectorAll(".client-tag-remove").forEach(u=>{u.addEventListener("click",w=>{w.preventDefault();const I=u.dataset.removeId;p=p.filter(a=>a!==I),v===I&&(v=p[0]||""),y()})}),p.length>1?(m.style.display="block",f.innerHTML=p.map(u=>{const w=o.find(I=>I.id===u);return w?`<label class="primary-select-radio"><input type="radio" name="primary-client" value="${u}" ${v===u?"checked":""} />${w.name}</label>`:""}).join(""),f.querySelectorAll('input[type="radio"]').forEach(u=>{u.addEventListener("change",()=>{v=u.value,y()})})):(m.style.display="none",p.length===1&&(v=p[0]))}document.getElementById("add-client-btn").addEventListener("click",()=>{const r=document.getElementById("add-client-select"),m=r.value;m&&(p.includes(m)||(p.push(m),p.length===1&&(v=m),r.value="",y()))}),y(),document.getElementById("case-form").addEventListener("submit",r=>{r.preventDefault();const m=We({caseNo:document.getElementById("case-no").value.trim(),year:document.getElementById("case-year").value.trim(),stageType:document.getElementById("case-stage").value,clientId:v,clientIds:[...p],primaryClientId:v,clientRole:document.getElementById("case-client-role").value,opponentName:document.getElementById("case-opponent").value.trim(),opponentRole:document.getElementById("case-opponent-role").value,court:document.getElementById("case-court").value.trim(),circuit:document.getElementById("case-circuit").value.trim(),caseType:document.getElementById("case-type").value,subject:document.getElementById("case-subject").value.trim(),firstSessionDate:document.getElementById("case-first-session").value,ownerId:document.getElementById("case-owner").value,status:t?document.getElementById("case-status")?.value||n.status:"نشطة",criminalStageType:document.getElementById("case-criminal-stage")?.value||"",notes:document.getElementById("case-notes").value.trim()}),f=[];if(m.caseNo||f.push("رقم القضية مطلوب"),m.year||f.push("السنة مطلوبة"),m.stageType||f.push("نوع المرحلة مطلوب"),p.length===0&&f.push("يجب إضافة عميل واحد على الأقل"),p.length>1&&!v&&f.push("يجب اختيار العميل الرئيسي عند وجود عدة عملاء"),m.clientRole||f.push("صفة العميل مطلوبة"),m.opponentName||f.push("اسم الخصم مطلوب"),m.opponentRole||f.push("صفة الخصم مطلوبة"),m.court||f.push("المحكمة مطلوبة"),m.circuit||f.push("الدائرة مطلوبة"),m.caseType||f.push("نوع القضية مطلوب"),m.subject||f.push("موضوع القضية مطلوب"),m.firstSessionDate||f.push("تاريخ أول جلسة مطلوب"),m.ownerId||f.push("المحامي المسؤول مطلوب"),m.caseType==="جنائي"&&!m.criminalStageType&&f.push("مرحلة القضية الجنائية مطلوبة"),t&&m.status==="مغلقة"){const u=d.query(l.ACTIONS,I=>I.caseId===s.id&&I.caseId!==""&&I.status!=="مكتمل"),w=d.query(l.DEADLINES,I=>I.caseId===s.id&&I.status==="مفتوح");u.length>0&&f.push(`لا يمكن إغلاق القضية: يوجد ${u.length} إجراء مفتوح مرتبط بها`),w.length>0&&f.push(`لا يمكن إغلاق القضية: يوجد ${w.length} موعد نهائي مفتوح`)}if(f.length>0){const u=document.getElementById("case-form-errors");u.style.display="block",u.innerHTML=f.join("<br>"),k("يرجى تصحيح الأخطاء","error");return}if(t)d.update(l.CASES,s.id,m),L(l.CASES,s.id,"update",m),k("تم تحديث القضية","success"),window.location.hash=`/cases/${s.id}`;else{const u=d.create(l.CASES,m);L(l.CASES,u.id,"create",m);const w=d.create(l.SESSIONS,{caseId:u.id,date:m.firstSessionDate,sessionType:m.caseType==="جنائي"&&m.criminalStageType==="تحقيقات نيابة"?"تحقيق":"جلسة استماع",decisionResult:"",nextSessionDate:"",notes:"جلسة أولى – تم إنشاؤها تلقائياً"});L(l.SESSIONS,w.id,"create",{auto:!0,caseId:u.id}),k("تم إنشاء القضية وجلستها الأولى بنجاح","success"),window.location.hash=`/cases/${u.id}`}})}const dt=[{decisionType:"تأجيل لإعادة الإعلان",actionType:"إعلان/خدمة",executionProof:"تاريخ التقديم للمحضر + رقم المرجع + النتيجة",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل لتصريح",actionType:"تصريح محكمة",executionProof:"رقم التصريح + التاريخ + المرفق",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل لمذكرة ومستندات",actionType:"حزمة تحضير",executionProof:"تفاصيل التقديم",subTasks:[{title:"صياغة المذكرة",completed:!1},{title:"مراجعة المذكرة",completed:!1},{title:"تحضير المستندات",completed:!1},{title:"تصوير ونسخ",completed:!1},{title:"تقديم الحزمة",completed:!1}],requiresNextDate:!0},{decisionType:"إحالة لخبير",actionType:"متابعة خبير",executionProof:"متابعة الموعد + تقديم الملاحظات + استلام التقرير",subTasks:[{title:"متابعة موعد الخبير",completed:!1},{title:"تقديم ملاحظات",completed:!1},{title:"استلام التقرير",completed:!1}],requiresNextDate:!0},{decisionType:"شطب",actionType:"تجديد من الشطب",executionProof:"تقديم طلب التجديد",subTasks:[],requiresNextDate:!1},{decisionType:"صدور حكم",actionType:"مراجعة حكم",executionProof:"مراجعة الحكم وتحديد الإجراء التالي",subTasks:[],requiresNextDate:!1},{decisionType:"حبس احتياطي",actionType:"حضور تجديد حبس",executionProof:"حضور جلسة التجديد",subTasks:[],requiresNextDate:!1,urgent:!0},{decisionType:"طلب تحقيقات",actionType:"متابعة تحقيق",executionProof:"استلام التحقيق + الخطوة التالية",subTasks:[],requiresNextDate:!0},{decisionType:"تأجيل للمرافعة",actionType:"حزمة تحضير",executionProof:"تحضير المرافعة",subTasks:[{title:"تحضير نقاط المرافعة",completed:!1},{title:"مراجعة القضية",completed:!1}],requiresNextDate:!0},{decisionType:"تأجيل للاطلاع",actionType:"حزمة تحضير",executionProof:"الاطلاع والتحضير",subTasks:[{title:"الاطلاع على المستندات",completed:!1},{title:"تحضير الرد",completed:!1}],requiresNextDate:!0},{decisionType:"تأجيل عام",actionType:"أخرى",executionProof:"",subTasks:[],requiresNextDate:!0},{decisionType:"إحالة للمحكمة",actionType:"أخرى",executionProof:"إنشاء قضية جديدة مرتبطة",subTasks:[],requiresNextDate:!1,createsLinkedCase:!0},{decisionType:"نطق بالحكم",actionType:"مراجعة حكم",executionProof:"مراجعة الحكم وتحديد الإجراء التالي",subTasks:[],requiresNextDate:!1}];function Be(){const e=d.getAll(l.DECISION_MAP);return e.length===0?(dt.forEach(s=>{d.create(l.DECISION_MAP,s)}),d.getAll(l.DECISION_MAP)):e}function ae(e){return Be().find(t=>t.decisionType===e)||null}function rt(e,s){return d.update(l.DECISION_MAP,e,s)}function ut(e){return d.create(l.DECISION_MAP,e)}function pt(e){return d.softDelete(l.DECISION_MAP,e)}function mt(e){const s=ae(e);return s?s.createsLinkedCase===!0:!1}function Ne(e,s){if(!Z()){k("تعديل الإجراءات متاح للشركاء فقط","error");return}const t=d.getById(l.ACTIONS,e);if(!t)return;const n=d.getAll(l.CLIENTS),o=d.getAll(l.CASES),p=d.getAll(l.USERS).filter(u=>u.active&&le.includes(u.role)),v=t.status==="مكتمل";function y(u){return u?o.filter(w=>(w.clientIds||(w.clientId?[w.clientId]:[])).includes(u)||w.primaryClientId===u||w.clientId===u):[]}const r=y(t.clientId),m=`
    <form id="edit-action-partner-form" autocomplete="off">

      ${v?`
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
            ${K.map(u=>`<option value="${u}" ${t.actionType===u?"selected":""}>${u}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select class="form-select" id="ea-priority">
            <option value="">بدون أولوية</option>
            ${ie.map(u=>`<option value="${u}" ${t.priority===u?"selected":""}>${u}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Title -->
      <div class="form-group">
        <label class="form-label">عنوان / وصف الإجراء</label>
        <input type="text" class="form-input" id="ea-title"
               value="${(t.title||"").replace(/"/g,"&quot;")}" />
      </div>

      <!-- Client (MANDATORY) + Case (optional, cascades) -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">العميل <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-client" required>
            <option value="">اختر العميل</option>
            ${n.map(u=>`<option value="${u.id}" ${t.clientId===u.id?"selected":""}>${u.name}</option>`).join("")}
          </select>
          <div class="form-hint">يجب أن يبقى الإجراء مرتبطاً بعميل دائماً</div>
        </div>
        <div class="form-group">
          <label class="form-label">القضية
            <span class="form-optional">(اختياري – حساس)</span></label>
          <select class="form-select" id="ea-case">
            <option value="">بدون قضية (مستوى العميل)</option>
            ${r.map(u=>`<option value="${u.id}" ${t.caseId===u.id?"selected":""}>${u.caseNo}/${u.year} – ${u.subject}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Responsible + Due Date -->
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المحامي المسؤول <span class="required">*</span>
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <select class="form-select" id="ea-responsible">
            ${p.map(u=>`<option value="${u.id}" ${t.responsibleUserId===u.id?"selected":""}>${u.name} (${u.role})</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الاستحقاق</label>
          <input type="date" class="form-input" id="ea-due-date" value="${t.dueDate||""}" />
        </div>
      </div>

      <!-- Post-completion execution fields (Partner can edit) -->
      ${v?`
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ التنفيذ
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <input type="date" class="form-input" id="ea-exec-date" value="${t.executionDate||""}" />
        </div>
        <div class="form-group">
          <label class="form-label">تفاصيل التنفيذ / الإثبات
            <span style="font-size:10px;color:var(--text-tertiary);">(حساس)</span></label>
          <textarea class="form-textarea" id="ea-exec-details" style="min-height:60px;">${t.executionDetails||""}</textarea>
        </div>
      </div>`:""}

      <!-- Notes -->
      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea class="form-textarea" id="ea-notes">${t.notes||""}</textarea>
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
    </form>`;P("تعديل الإجراء (شريك)",m,{footer:`
    <button class="btn btn-primary" id="ea-save-btn">💾 حفظ التعديلات</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`,large:!0}),document.getElementById("ea-client")?.addEventListener("change",()=>{const u=document.getElementById("ea-client").value,w=document.getElementById("ea-case");if(!w)return;const I=y(u);w.innerHTML='<option value="">بدون قضية (مستوى العميل)</option>'+I.map(a=>`<option value="${a.id}">${a.caseNo}/${a.year} – ${a.subject}</option>`).join("")}),document.getElementById("ea-save-btn").addEventListener("click",()=>{const u=document.getElementById("ea-action-type").value,w=document.getElementById("ea-title").value.trim(),I=document.getElementById("ea-priority").value,a=document.getElementById("ea-client").value,b=document.getElementById("ea-case")?.value||"",$=document.getElementById("ea-responsible").value,c=document.getElementById("ea-due-date").value,h=document.getElementById("ea-notes").value.trim(),x=v&&document.getElementById("ea-exec-date")?.value||t.executionDate,T=v&&document.getElementById("ea-exec-details")?.value?.trim()||t.executionDetails,D=document.getElementById("ea-edit-reason").value.trim(),g=[t.actionType!==u,t.responsibleUserId!==$,t.clientId!==a,t.caseId!==b,v&&(t.executionDate!==x||t.executionDetails!==T)].some(Boolean),C=[];if(a||C.push("العميل مطلوب – لا يمكن إزالة ربط الإجراء بعميل"),u||C.push("نوع الإجراء مطلوب"),$||C.push("المحامي المسؤول مطلوب"),g&&!D&&C.push("سبب التعديل مطلوب عند تغيير الحقول الحساسة"),b){const S=d.getById(l.CASES,b);S&&((S.clientIds||(S.clientId?[S.clientId]:[])).includes(a)||S.primaryClientId===a||S.clientId===a||C.push("القضية المختارة لا تنتمي للعميل المحدد"))}if(C.length>0){const S=document.getElementById("ea-errors");S.style.display="block",S.innerHTML=C.join("<br>");return}const E={actionType:u,title:w,priority:I,clientId:a,caseId:b,responsibleUserId:$,dueDate:c,notes:h,executionDate:x,executionDetails:T};nt(e,t,E,D),d.update(l.ACTIONS,e,E),k("تم حفظ التعديلات بنجاح","success"),O(),typeof s=="function"&&s()})}function vt(e,s){const t=d.getById(l.ACTIONS,e);if(!t)return;if(t.status==="مكتمل"){k("هذا الإجراء مكتمل بالفعل ولا يمكن تعديل تقدمه","warning");return}const n=`
    <form id="progress-update-form" autocomplete="off">

      <!-- Read-only action context -->
      <div style="background:var(--bg-tertiary);border-radius:var(--radius-md);
                  padding:var(--space-3) var(--space-4);margin-bottom:var(--space-4);
                  font-size:var(--text-sm);">
        <div><strong>نوع الإجراء:</strong> ${t.actionType}</div>
        ${t.title?`<div><strong>الوصف:</strong> ${t.title}</div>`:""}
        ${t.dueDate?`<div><strong>الاستحقاق:</strong> ${t.dueDate}</div>`:""}
      </div>

      <!-- Status -->
      <div class="form-group">
        <label class="form-label">الحالة <span class="required">*</span></label>
        <select class="form-select" id="pu-status">
          <option value="مفتوح"       ${t.status==="مفتوح"?"selected":""}>مفتوح</option>
          <option value="قيد التنفيذ" ${t.status==="قيد التنفيذ"?"selected":""}>قيد التنفيذ</option>
          <option value="معلق"        ${t.status==="معلق"?"selected":""}>معلق</option>
          <option value="مكتمل"       >مكتمل</option>
        </select>
      </div>

      <!-- Progress notes -->
      <div class="form-group">
        <label class="form-label">ملاحظات التقدم</label>
        <textarea class="form-textarea" id="pu-notes"
          placeholder="أضف ملاحظات حول التقدم في تنفيذ الإجراء...">${t.notes||""}</textarea>
      </div>

      <!-- Execution fields — shown/required only when status = مكتمل -->
      <div id="pu-completion-fields" style="display:none;">
        <div class="form-group">
          <label class="form-label">تاريخ التنفيذ <span class="required">*</span></label>
          <input type="date" class="form-input" id="pu-exec-date" value="${t.executionDate||""}" />
        </div>
        <div class="form-group">
          <label class="form-label">تفاصيل التنفيذ / الإثبات <span class="required">*</span></label>
          <textarea class="form-textarea" id="pu-exec-details"
            placeholder="رقم المحضر، مرجع التصريح، إيصال التقديم...">${t.executionDetails||""}</textarea>
        </div>
      </div>

      <div id="pu-errors" class="form-error mt-4" style="display:none;"></div>
    </form>`;P("تحديث تقدم الإجراء",n,{footer:`
    <button class="btn btn-primary" id="pu-save-btn">✓ حفظ التقدم</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>`});const i=document.getElementById("pu-status"),p=document.getElementById("pu-completion-fields");i?.addEventListener("change",()=>{p.style.display=i.value==="مكتمل"?"block":"none"}),document.getElementById("pu-save-btn").addEventListener("click",()=>{const v=document.getElementById("pu-status").value,y=document.getElementById("pu-notes").value.trim(),r=document.getElementById("pu-exec-date")?.value||"",m=document.getElementById("pu-exec-details")?.value?.trim()||"",f=[];if(v==="مكتمل"&&(r||f.push("تاريخ التنفيذ مطلوب لإكمال الإجراء"),m||f.push("تفاصيل التنفيذ / الإثبات مطلوبة لإكمال الإجراء")),f.length>0){const a=document.getElementById("pu-errors");a.style.display="block",a.innerHTML=f.join("<br>");return}const u={status:v,notes:y};v==="مكتمل"&&(u.executionDate=r,u.executionDetails=m),d.update(l.ACTIONS,e,u);const w=v==="مكتمل"?"complete":"status_change";L(l.ACTIONS,e,w,{oldStatus:t.status,newStatus:v,notes:y});const I=v==="مكتمل"?"تم إكمال الإجراء ✓":`تم تحديث الحالة إلى: ${v}`;k(I,"success"),O(),typeof s=="function"&&s()})}function z(e,s={}){const t=d.getById(l.CASES,s.id);if(!t){e.innerHTML=`<div class="empty-state"><h3>القضية غير موجودة</h3><button class="btn btn-primary" onclick="window.location.hash='/cases'">العودة للقضايا</button></div>`;return}const n=d.getById(l.CLIENTS,t.primaryClientId||t.clientId),p=(t.clientIds||(t.clientId?[t.clientId]:[])).map(a=>d.getById(l.CLIENTS,a)).filter(Boolean).length>1?`${n?n.name:"—"} وآخرون`:n?n.name:"—",v=d.getById(l.USERS,t.ownerId),y=d.query(l.SESSIONS,a=>a.caseId===s.id).sort((a,b)=>new Date(b.date)-new Date(a.date)),r=d.query(l.ACTIONS,a=>a.caseId===s.id),m=d.query(l.DEADLINES,a=>a.caseId===s.id),f=d.getAll(l.USERS),u=r.filter(a=>a.status!=="مكتمل");m.filter(a=>a.status==="مفتوح");const w=ne[t.caseType]||"civil",I=Te[t.status]||"active";M(`القضية ${t.caseNo}/${t.year}`),e.innerHTML=`
    <div class="animate-fade-in">
      <!-- Case Header -->
      <div class="case-detail-header">
        <div class="case-detail-info">
          <div class="case-badges">
            <span class="badge badge-${w}">${t.caseType}</span>
            <span class="badge badge-${I}">${t.status}</span>
            ${t.criminalStageType?`<span class="badge badge-criminal">${t.criminalStageType}</span>`:""}
          </div>
          <h1>القضية ${t.caseNo}/${t.year}</h1>
          <p class="text-secondary mb-4">${t.subject}</p>
          
          <div class="detail-grid">
            <div class="detail-item">
              <div class="detail-item-label">العميل</div>
              <div class="detail-item-value">${p} (${t.clientRole})</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">الخصم</div>
              <div class="detail-item-value">${t.opponentName} (${t.opponentRole})</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المحكمة</div>
              <div class="detail-item-value">${t.court}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">الدائرة</div>
              <div class="detail-item-value">${t.circuit}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المرحلة</div>
              <div class="detail-item-value">${t.stageType}</div>
            </div>
            <div class="detail-item">
              <div class="detail-item-label">المسؤول</div>
              <div class="detail-item-value">${v?v.name:"—"}</div>
            </div>
          </div>
        </div>
        <div class="case-detail-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.location.hash='/cases/${s.id}/edit'"><i class='bx bx-edit'></i> تعديل</button>
          <button class="btn btn-secondary btn-sm" onclick="window.location.hash='/cases'">↩ العودة</button>
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn active" data-tab="sessions">
          <i class='bx bx-list-check'></i> الجلسات <span class="tab-count">${y.length}</span>
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
          <h3>الجلسات${t.caseType==="جنائي"&&t.criminalStageType==="تحقيقات نيابة"?" / التحقيقات":""}</h3>
          <button class="btn btn-primary btn-sm" id="add-session-btn"><i class='bx bx-plus'></i> إضافة جلسة</button>
        </div>
        <div class="timeline" id="sessions-timeline">
          ${y.length===0?'<div class="empty-state"><p>لا توجد جلسات بعد</p></div>':""}
          ${y.map(a=>{const b=a.sessionType==="تحقيق",$=a.decisionResult?.includes("حكم"),c=a.status==="مغلق";return`
              <div class="timeline-item">
                <div class="timeline-dot ${$?"judgment":""} ${b?"investigation":""}"></div>
                <div class="timeline-content">
                  <div class="flex justify-between items-center">
                    <div class="timeline-date">${j(a.date)}</div>
                    <div class="flex items-center gap-2">
                      <span class="session-status-badge ${c?"session-status-closed":"session-status-open"}">${c?"مغلق":"مفتوح"}</span>
                      <span class="badge badge-${b?"criminal":"civil"}">${a.sessionType}</span>
                    </div>
                  </div>
                  <div class="timeline-title">${a.decisionResult||"بدون قرار بعد"}</div>
                  ${a.closureReason?`<div class="text-xs text-secondary mt-1">سبب الإغلاق: ${a.closureReason}</div>`:""}
                  ${a.nextSessionDate?`<div class="text-xs text-secondary mt-2">الجلسة التالية: ${j(a.nextSessionDate)}</div>`:""}
                  ${a.notes?`<div class="timeline-desc mt-2">${a.notes}</div>`:""}
                  <div class="flex gap-2 mt-2">
                    <button class="btn btn-ghost btn-sm edit-session-btn" data-id="${a.id}"><i class='bx bx-edit'></i> تعديل</button>
                    ${c?"":`<button class="btn btn-primary btn-sm close-session-btn" data-id="${a.id}">✓ إغلاق الجلسة</button>`}
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
            ${u.length>0?`<span class="badge badge-progress">${u.length} مفتوح</span>`:""}
            <button class="btn btn-primary btn-sm" id="create-action-btn"><i class='bx bx-plus'></i> إنشاء إجراء</button>
          </div>
        </div>
        ${r.length===0?'<div class="empty-state"><p>لا توجد إجراءات بعد</p></div>':""}
        ${r.map(a=>{const b=d.getById(l.USERS,a.responsibleUserId),$=a.clientId?d.getById(l.CLIENTS,a.clientId):null,c=De[a.status]||"open",h=a.dueDate&&ee(a.dueDate)&&a.status!=="مكتمل",x=Z(),T=U(),D=a.status!=="مكتمل"&&(Z()||T&&a.responsibleUserId===T.id),g=it(a.id),C=g.length===0?'<div class="text-xs text-secondary" style="padding:var(--space-2) 0">لا توجد سجلات تعديل</div>':g.map(E=>{const S=E.changes,A=new Date(E.timestamp).toLocaleString("ar-EG",{dateStyle:"short",timeStyle:"short"});if(E.action==="field_change"&&S&&S.field)return`<div class="action-history-entry">
                        <span class="action-history-time">${A}</span>
                        <span class="action-history-who">${E.userName}</span>
                        <span class="action-history-change">غيّر <strong>${S.fieldLabel}</strong>: <span class="old-val">${S.oldValue||"—"}</span> ← <span class="new-val">${S.newValue||"—"}</span>${S.editReason?` (السبب: ${S.editReason})`:""}</span>
                    </div>`;const B={create:"إنشاء",complete:"إكمال",update:"تعديل",delete:"حذف"}[E.action]||E.action;return`<div class="action-history-entry">
                    <span class="action-history-time">${A}</span>
                    <span class="action-history-who">${E.userName}</span>
                    <span class="action-history-change">${B}</span>
                </div>`}).join("");return`
            <div class="card mb-4 ${h?"risk-flag high":""}" style="border-right: 3px solid ${a.status==="مكتمل"?"var(--status-completed)":a.status==="معلق"?"var(--status-blocked)":"var(--status-progress)"};"
                 data-action-id="${a.id}">

              <!-- Header row: type + badges + buttons -->
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${a.actionType}</strong>
                  <span class="badge badge-${c}">${a.status}</span>
                  ${h?'<span class="badge badge-blocked">متأخر</span>':""}
                  ${a.caseId?"":'<span class="badge badge-open" style="font-size:9px;">مستوى العميل</span>'}
                </div>
                <div class="flex gap-2">
                  ${D?`<button class="btn btn-primary btn-sm complete-action-btn" data-id="${a.id}">✓ إكمال</button>`:""}
                  ${x?`<button class="btn btn-ghost btn-sm edit-action-btn" data-id="${a.id}" title="تعديل الإجراء (شريك فقط)"><i class='bx bx-edit'></i> تعديل</button>`:""}
                </div>
              </div>

              <!-- Details -->
              ${$?`<div class="text-xs text-secondary mb-1">العميل: <strong>${$.name}</strong></div>`:""}
              <div class="text-sm text-secondary">المسؤول: ${b?b.name:"—"}</div>
              ${a.title?`<div class="text-sm text-secondary mt-1">الوصف: ${a.title}</div>`:""}
              ${a.priority?`<span class="badge badge-progress" style="margin-top:4px;display:inline-block;">أولوية: ${a.priority}</span>`:""}
              ${a.dueDate?`<div class="text-xs text-secondary mt-1">تاريخ الاستحقاق: ${j(a.dueDate)}</div>`:""}
              ${a.executionDate?`<div class="text-xs text-accent mt-1">تم التنفيذ: ${j(a.executionDate)}</div>`:""}
              ${a.executionDetails?`<div class="text-sm mt-2" style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-sm);">${a.executionDetails}</div>`:""}
              ${a.notes?`<div class="text-xs text-secondary mt-2">${a.notes}</div>`:""}

              <!-- Sub-tasks -->
              ${a.subTasks&&a.subTasks.length>0?`
                <div class="mt-4">
                  <div class="text-xs font-semibold text-secondary mb-2">المهام الفرعية:</div>
                  <ul class="subtask-list">
                    ${a.subTasks.map((E,S)=>`
                      <li class="subtask-item ${E.completed?"completed":""}">
                        <input type="checkbox" ${E.completed?"checked":""} class="subtask-check" data-action-id="${a.id}" data-idx="${S}" />
                        <span>${E.title}</span>
                      </li>
                    `).join("")}
                  </ul>
                </div>
              `:""}

              <!-- Action History (toggle) -->
              <div class="action-history" id="history-${a.id}">
                <button class="action-history-toggle" data-target="history-body-${a.id}">
                  🕒 سجل التعديلات (${g.length})
                </button>
                <div class="action-history-body" id="history-body-${a.id}" style="display:none;">
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
        ${m.map(a=>{const b=d.getById(l.USERS,a.responsibleUserId),$=Ce[a.status]||"open",c=F(a.endDate),h=a.status==="مفتوح"&&c<0,x=a.status==="مفتوح"&&c>=0&&c<=3;return`
            <div class="card mb-4" style="border-right: 3px solid ${h?"var(--risk-high)":x?"var(--risk-medium)":a.status==="مكتمل"?"var(--status-completed)":"var(--status-open)"};">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <strong>${a.deadlineType}</strong>
                  <span class="badge badge-${$}">${a.status}</span>
                  ${h?'<span class="badge badge-blocked">متأخر!</span>':""}
                  ${x?'<span class="badge badge-progress">يقترب</span>':""}
                </div>
                ${a.status==="مفتوح"?`<button class="btn btn-primary btn-sm complete-deadline-btn" data-id="${a.id}">✓ إكمال</button>`:""}
              </div>
              <div class="flex gap-6 text-sm text-secondary">
                <span>من: ${j(a.startDate)}</span>
                <span>إلى: ${j(a.endDate)}</span>
                <span>المسؤول: ${b?b.name:"—"}</span>
              </div>
              ${a.status==="مفتوح"?`<div class="text-xs mt-2 ${h?"text-accent":""}">${h?`متأخر بـ ${Math.abs(c)} يوم`:c===0?"اليوم!":`متبقي ${c} يوم`}</div>`:""}
              ${a.completionNote?`<div class="text-sm mt-2" style="background: var(--bg-tertiary); padding: var(--space-3); border-radius: var(--radius-sm);">ملاحظة الإكمال: ${a.completionNote}</div>`:""}
            </div>
          `}).join("")}
      </div>
    </div>
  `,e.querySelectorAll(".tab-btn").forEach(a=>{a.addEventListener("click",()=>{e.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active")),e.querySelectorAll(".tab-panel").forEach(b=>b.classList.remove("active")),a.classList.add("active"),document.getElementById(`tab-${a.dataset.tab}`).classList.add("active")})}),e.querySelector("#add-session-btn")?.addEventListener("click",()=>{se(s.id,t,f,e,s)}),e.querySelector("#create-action-btn")?.addEventListener("click",()=>{const a=t.primaryClientId||t.clientId||"";bt(s.id,a,t,f,e,s)}),e.querySelectorAll(".edit-session-btn").forEach(a=>{a.addEventListener("click",()=>{const b=d.getById(l.SESSIONS,a.dataset.id);b&&se(s.id,t,f,e,s,b,!1)})}),e.querySelectorAll(".close-session-btn").forEach(a=>{a.addEventListener("click",()=>{const b=d.getById(l.SESSIONS,a.dataset.id);b&&se(s.id,t,f,e,s,b,!0)})}),e.querySelectorAll(".complete-action-btn").forEach(a=>{a.addEventListener("click",()=>{ft(a.dataset.id,e,s)})}),e.querySelectorAll(".edit-action-btn").forEach(a=>{a.addEventListener("click",()=>{Ne(a.dataset.id,()=>z(e,s))})}),e.querySelectorAll(".action-history-toggle").forEach(a=>{a.addEventListener("click",()=>{const b=document.getElementById(a.dataset.target);if(!b)return;const $=b.style.display==="none";b.style.display=$?"block":"none",a.classList.toggle("open",$)})}),e.querySelectorAll(".subtask-check").forEach(a=>{a.addEventListener("change",()=>{const b=d.getById(l.ACTIONS,a.dataset.actionId);if(b){const $=parseInt(a.dataset.idx);b.subTasks[$].completed=a.checked,d.update(l.ACTIONS,b.id,{subTasks:b.subTasks}),L(l.ACTIONS,b.id,"update",{subTaskIndex:$,completed:a.checked})}})}),e.querySelector("#add-deadline-btn")?.addEventListener("click",()=>{gt(s.id,f,e,s)}),e.querySelectorAll(".complete-deadline-btn").forEach(a=>{a.addEventListener("click",()=>{yt(a.dataset.id,e,s)})})}function bt(e,s,t,n,o,i){const p=n.filter(r=>r.active&&le.includes(r.role)),v=`
    <form id="create-action-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">نوع الإجراء <span class="required">*</span></label>
          <select class="form-select" id="ca-action-type" required>
            <option value="">اختر النوع</option>
            ${K.map(r=>`<option value="${r}">${r}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية</label>
          <select class="form-select" id="ca-priority">
            <option value="">بدون أولوية</option>
            ${ie.map(r=>`<option value="${r}">${r}</option>`).join("")}
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
            ${p.map(r=>`<option value="${r.id}" ${r.id===t.ownerId?"selected":""}>${r.name} (${r.role})</option>`).join("")}
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
  `;P("إنشاء إجراء يدوي",v,{footer:`
    <button class="btn btn-primary" id="save-create-action-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `,large:!0}),document.getElementById("save-create-action-btn").addEventListener("click",()=>{const r=document.getElementById("ca-action-type").value,m=document.getElementById("ca-title").value.trim(),f=document.getElementById("ca-priority").value,u=document.getElementById("ca-responsible").value,w=document.getElementById("ca-due-date").value,I=document.getElementById("ca-notes").value.trim(),a=[];if(r||a.push("نوع الإجراء مطلوب"),u||a.push("المحامي المسؤول مطلوب – يجب اختياره"),a.length>0){const c=document.getElementById("ca-errors");c.style.display="block",c.innerHTML=a.join("<br>");return}const b=oe({clientId:s,caseId:e,sessionId:"",actionType:r,title:m,priority:f,responsibleUserId:u,status:"مفتوح",dueDate:w,notes:I}),$=d.create(l.ACTIONS,b);L(l.ACTIONS,$.id,"create",{manual:!0,actionType:r,responsibleUserId:u,caseId:e}),k(`تم إنشاء الإجراء: ${r}`,"success"),O(),z(o,i)})}function se(e,s,t,n,o,i=null,p=!1){const v=!!i,r=s.caseType==="جنائي"&&s.criminalStageType==="تحقيقات نيابة"?"التحقيق":"الجلسة",m=p,f=`
    <form id="session-modal-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ ${r} <span class="required">*</span></label>
          <input type="date" class="form-input" id="session-date" value="${i?.date||""}" required />
        </div>
        <div class="form-group">
          <label class="form-label">نوع ${r} <span class="required">*</span></label>
          <select class="form-select" id="session-type" required>
            <option value="">اختر النوع</option>
            ${Ge.map(a=>`<option value="${a}" ${i?.sessionType===a?"selected":""}>${a}</option>`).join("")}
          </select>
        </div>
      </div>
      
      <div class="form-group">
        <label class="form-label">نتيجة القرار <span class="required">*</span></label>
        <select class="form-select" id="session-decision" required>
          <option value="">اختر القرار</option>
          ${Ae.map(a=>`<option value="${a}" ${i?.decisionResult===a?"selected":""}>${a}</option>`).join("")}
        </select>
      </div>
      
      <div class="form-group" id="next-date-group">
        <label class="form-label">تاريخ الجلسة التالية <span class="required" id="next-date-required">*</span></label>
        <input type="date" class="form-input" id="session-next-date" value="${i?.nextSessionDate||""}" />
        <div class="form-hint">مطلوب إذا كان القرار يتطلب تأجيل</div>
      </div>
      
      <div class="form-group" id="closure-reason-group" style="display: none;">
        <label class="form-label">سبب عدم وجود جلسة تالية <span class="required">*</span></label>
        <select class="form-select" id="session-closure-reason">
          <option value="">اختر السبب</option>
          ${Ye.map(a=>`<option value="${a}" ${i?.closureReason===a?"selected":""}>${a}</option>`).join("")}
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea class="form-textarea" id="session-notes">${i?.notes||""}</textarea>
      </div>
      
      <div id="session-action-preview" class="mt-4" style="display:none;">
        <div class="risk-flag medium">
          <span class="risk-icon"><i class='bx bxs-zap'></i></span>
          <span id="action-preview-text"></span>
        </div>
      </div>
      
      <div id="session-form-errors" class="form-error mt-4" style="display:none;"></div>
    </form>
  `,w=`
    <button class="btn btn-primary" id="save-session-btn">${m?"✓ حفظ وإغلاق الجلسة":v?"💾 حفظ":"✓ حفظ الجلسة وإنشاء الإجراء"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `;P(`${m?"إغلاق":v?"تعديل":"إضافة"} ${r}`,f,{footer:w,large:!0});function I(){const a=document.getElementById("session-decision").value,b=ae(a),$=document.getElementById("session-action-preview"),c=document.getElementById("action-preview-text"),h=document.getElementById("next-date-required"),x=document.getElementById("closure-reason-group"),T=document.getElementById("next-date-group"),D=b?b.requiresNextDate:!1;b?($.style.display="block",c.textContent=`سيتم إنشاء إجراء تلقائي: ${b.actionType}`,b.subTasks?.length>0&&(c.textContent+=` (${b.subTasks.length} مهام فرعية)`)):$.style.display="none",D?(T.style.display="block",h.style.display="inline",x.style.display="none"):a?(T.style.display="block",h.style.display="none",m?x.style.display="block":x.style.display="none"):(T.style.display="block",h.style.display="inline",x.style.display="none")}document.getElementById("session-decision").addEventListener("change",I),I(),document.getElementById("save-session-btn").addEventListener("click",()=>{const a=document.getElementById("session-date").value,b=document.getElementById("session-type").value,$=document.getElementById("session-decision").value,c=document.getElementById("session-next-date").value,h=document.getElementById("session-closure-reason")?.value||"",x=document.getElementById("session-notes").value,T=[];a||T.push("تاريخ الجلسة مطلوب"),b||T.push("نوع الجلسة مطلوب"),m&&!$&&T.push("لا يمكن إغلاق الجلسة بدون تسجيل القرار/النتيجة"),!m&&!$&&T.push("نتيجة القرار مطلوبة");const D=ae($),g=D?D.requiresNextDate:!1;if(g&&!c&&T.push("تاريخ الجلسة التالية مطلوب لهذا النوع من القرار"),m&&!g&&$&&!c&&!h&&T.push("يجب اختيار سبب عدم وجود جلسة تالية لإغلاق الجلسة"),T.length>0){const B=document.getElementById("session-form-errors");B.style.display="block",B.innerHTML=T.join("<br>");return}const C=m?"مغلق":i?.status||"مفتوح",E=ve({caseId:e,date:a,sessionType:b,decisionResult:$,nextSessionDate:c,status:C,closureReason:m?h:i?.closureReason||"",notes:x});let S;if(v?(d.update(l.SESSIONS,i.id,E),L(l.SESSIONS,i.id,"update",E),S={...i,...E}):(S=d.create(l.SESSIONS,E),L(l.SESSIONS,S.id,"create",E)),c&&d.query(l.SESSIONS,N=>N.caseId===e&&N.date===c&&N.id!==S.id).length===0){const N=ve({caseId:e,date:c,sessionType:b,decisionResult:"",nextSessionDate:"",status:"مفتوح",closureReason:"",notes:"جلسة تالية – تم إنشاؤها تلقائياً"}),H=d.create(l.SESSIONS,N);L(l.SESSIONS,H.id,"create",{auto:!0,fromSession:S.id})}let A=!1;if(D)try{if(d.query(l.ACTIONS,N=>N.sessionId===S.id&&N.actionType===D.actionType).length===0){const N=d.getById(l.CASES,e),H=oe({caseId:e,sessionId:S.id,actionType:D.actionType,responsibleUserId:N?.ownerId||"",status:"مفتوح",subTasks:D.subTasks?D.subTasks.map(R=>({...R})):[],dueDate:c||"",notes:D.executionProof?`إثبات التنفيذ المطلوب: ${D.executionProof}`:""}),_=d.create(l.ACTIONS,H);L(l.ACTIONS,_.id,"create",{auto:!0,decision:$,sessionId:S.id}),A=!0,console.log("Action automatically created:",_)}else console.log("Action of this type already exists for this session, skipping creation.")}catch(B){console.error("Error creating action:",B),k("حدث خطأ أثناء إنشاء الإجراء التلقائي","error")}k(A?`تم ${m?"إغلاق":"حفظ"} الجلسة وإنشاء إجراء: ${D.actionType}`:m?"تم إغلاق الجلسة بنجاح":"تم حفظ الجلسة","success"),!v&&mt($)&&d.getById(l.CASES,e)&&k("يمكنك الآن إنشاء قضية محكمة مرتبطة من صفحة القضايا","info",5e3),O(),z(n,o)})}function ft(e,s,t){const n=d.getById(l.ACTIONS,e);if(!n)return;const o=`
    <form id="complete-action-form">
      <div class="mb-4">
        <strong>نوع الإجراء:</strong> ${n.actionType}
      </div>
      ${n.notes?`<div class="text-sm text-secondary mb-4">${n.notes}</div>`:""}
      
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
  `;P("إكمال الإجراء",o,{footer:`
    <button class="btn btn-primary" id="confirm-complete-action">✓ تأكيد الإكمال</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("confirm-complete-action").addEventListener("click",()=>{const p=document.getElementById("action-exec-date").value,v=document.getElementById("action-exec-details").value.trim();if(!p||!v){const y=document.getElementById("complete-action-errors");y.style.display="block",y.innerHTML="تاريخ التنفيذ وتفاصيل التنفيذ مطلوبان",k("لا يمكن إكمال الإجراء بدون بيانات التنفيذ","error");return}d.update(l.ACTIONS,e,{status:"مكتمل",executionDate:p,executionDetails:v}),L(l.ACTIONS,e,"complete",{executionDate:p}),k("تم إكمال الإجراء بنجاح","success"),O(),z(s,t)})}function gt(e,s,t,n){const o=`
    <form id="deadline-modal-form">
      <div class="form-group">
        <label class="form-label">نوع الموعد النهائي <span class="required">*</span></label>
        <select class="form-select" id="deadline-type" required>
          <option value="">اختر النوع</option>
          ${ke.map(p=>`<option value="${p}">${p}</option>`).join("")}
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
          ${s.map(p=>`<option value="${p.id}">${p.name}</option>`).join("")}
        </select>
      </div>
      <div id="deadline-form-errors" class="form-error" style="display:none;"></div>
    </form>
  `;P("إضافة موعد نهائي",o,{footer:`
    <button class="btn btn-primary" id="save-deadline-btn">✓ إضافة الموعد</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-deadline-btn").addEventListener("click",()=>{const p=document.getElementById("deadline-type").value,v=document.getElementById("deadline-start").value,y=document.getElementById("deadline-end").value,r=document.getElementById("deadline-responsible").value;if(!p||!v||!y||!r){document.getElementById("deadline-form-errors").style.display="block",document.getElementById("deadline-form-errors").innerHTML="جميع الحقول مطلوبة";return}const m=Xe({caseId:e,deadlineType:p,startDate:v,endDate:y,responsibleUserId:r}),f=d.create(l.DEADLINES,m);L(l.DEADLINES,f.id,"create",m),k("تم إضافة الموعد النهائي","success"),O(),z(t,n)})}function yt(e,s,t){P("إكمال الموعد النهائي",`
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
  `}),document.getElementById("confirm-complete-deadline").addEventListener("click",()=>{const i=document.getElementById("deadline-completion-note").value.trim();if(!i){document.getElementById("deadline-complete-errors").style.display="block",document.getElementById("deadline-complete-errors").innerHTML="ملاحظة الإكمال مطلوبة";return}d.update(l.DEADLINES,e,{status:"مكتمل",completionNote:i}),L(l.DEADLINES,e,"complete",{completionNote:i}),k("تم إكمال الموعد النهائي","success"),O(),z(s,t)})}function V(e){M("الإجراءات");const s=U(),t=s?W(s):null,n=t==="lawyer"||t==="trainee";let o=d.getAll(l.ACTIONS);n&&s&&(o=o.filter(a=>a.responsibleUserId===s.id));const i=d.getAll(l.CASES),p=d.getAll(l.CLIENTS),v=d.getAll(l.USERS);function y(){if(!n)return p;const a=new Set;return i.forEach(b=>{const $=b.ownerId===(s&&s.id),c=o.some(h=>h.caseId===b.id&&h.responsibleUserId===(s&&s.id));($||c)&&(b.primaryClientId&&a.add(b.primaryClientId),b.clientId&&a.add(b.clientId),(b.clientIds||[]).forEach(h=>a.add(h)))}),p.filter(b=>a.has(b.id))}const r=y();e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-zap'></i> الإجراءات</h1>
          <div class="page-header-sub">
            ${o.filter(a=>a.status!=="مكتمل").length} إجراء مفتوح من ${o.length} إجمالي${n?" (مهامي فقط)":""}
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
          ${K.map(a=>`<option value="${a}">${a}</option>`).join("")}
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
        ${n?"":`
        <select class="filter-select" id="filter-responsible">
          <option value="">كل المحامين</option>
          ${v.map(a=>`<option value="${a.id}">${a.name} (${a.role})</option>`).join("")}
        </select>`}
      </div>

      <div id="actions-container"></div>
    </div>
  `;function m(){const a=document.getElementById("action-search").value.toLowerCase(),b=document.getElementById("filter-action-type").value,$=document.getElementById("filter-action-status").value,c=document.getElementById("filter-action-scope").value,h=n?"":document.getElementById("filter-responsible")?.value||"";let x=o;b&&(x=x.filter(g=>g.actionType===b)),$&&(x=x.filter(g=>g.status===$)),c==="case"&&(x=x.filter(g=>!!g.caseId)),c==="client"&&(x=x.filter(g=>!g.caseId)),h&&(x=x.filter(g=>g.responsibleUserId===h)),a&&(x=x.filter(g=>{const C=g.caseId?d.getById(l.CASES,g.caseId):null,E=g.clientId?d.getById(l.CLIENTS,g.clientId):null;return g.actionType.toLowerCase().includes(a)||g.title&&g.title.toLowerCase().includes(a)||g.notes&&g.notes.toLowerCase().includes(a)||C&&(C.caseNo.includes(a)||C.subject.toLowerCase().includes(a))||E&&E.name.toLowerCase().includes(a)}));const T={};x.forEach(g=>{T[g.actionType]||(T[g.actionType]=[]),T[g.actionType].push(g)});const D=document.getElementById("actions-container");if(Object.keys(T).length===0){D.innerHTML='<div class="empty-state"><p>لا توجد إجراءات</p></div>';return}D.innerHTML=Object.entries(T).map(([g,C])=>`
      <div class="action-group">
        <div class="action-group-header">
          <span class="action-group-icon"><i class='bx bxs-zap'></i></span>
          <span class="action-group-title">${g}</span>
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
              ${C.map(E=>{const S=E.caseId?d.getById(l.CASES,E.caseId):null,B=(E.clientId?d.getById(l.CLIENTS,E.clientId):null)||(S?d.getById(l.CLIENTS,S.primaryClientId||S.clientId):null),N=d.getById(l.USERS,E.responsibleUserId),H=De[E.status]||"open",_=E.dueDate&&ee(E.dueDate)&&E.status!=="مكتمل",R=!E.caseId,ue=Z(),Oe=s&&E.responsibleUserId===s.id,te=!n||R||s&&S&&(S.ownerId===s.id||E.responsibleUserId===s.id),Re=ue?`<button class="btn btn-ghost btn-sm action-edit-btn" data-id="${E.id}" title="تعديل شامل"><i class='bx bx-edit'></i> تعديل</button>`:"",je=!ue&&Oe&&E.status!=="مكتمل"?`<button class="btn btn-primary btn-sm action-progress-btn" data-id="${E.id}"><i class='bx bxs-zap'></i> تحديث التقدم</button>`:"",Me=S&&te?`<button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${E.caseId}'">عرض القضية ←</button>`:S&&!te?'<span class="text-secondary text-xs">لا يوجد وصول</span>':"";return`
                  <tr class="${_?"risk-flag high":""}">
                    <td>
                      <span class="text-sm font-semibold">${B?B.name:"—"}</span>
                    </td>
                    <td>
                      ${S?te?`<a href="#/cases/${E.caseId}" style="color:var(--text-link);">${S.caseNo}/${S.year}</a>`:`<span class="text-secondary">${S.caseNo}/${S.year}</span>`:'<span class="badge badge-open" style="font-size:10px;">مستوى العميل</span>'}
                    </td>
                    <td class="text-sm">${E.title||"—"}</td>
                    <td>${N?N.name:"—"}</td>
                    <td>
                      <span class="badge badge-${H}">${E.status}</span>
                      ${_?'<span class="badge badge-blocked">متأخر</span>':""}
                    </td>
                    <td>${E.priority?`<span class="badge badge-progress">${E.priority}</span>`:"—"}</td>
                    <td>${j(E.dueDate)}</td>
                    <td>
                      <div class="flex gap-2" style="align-items:center;">
                        ${Re}
                        ${je}
                        ${Me}
                      </div>
                    </td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `).join("")}m();function f(){document.querySelectorAll(".action-edit-btn").forEach(a=>{a.addEventListener("click",()=>{Ne(a.dataset.id,()=>V(e))})}),document.querySelectorAll(".action-progress-btn").forEach(a=>{a.addEventListener("click",()=>{vt(a.dataset.id,()=>V(e))})})}const u=m;function w(){u(),f()}document.getElementById("action-search").removeEventListener("input",m),document.getElementById("action-search").addEventListener("input",w),document.getElementById("filter-action-type").removeEventListener("change",m),document.getElementById("filter-action-type").addEventListener("change",w),document.getElementById("filter-action-status").removeEventListener("change",m),document.getElementById("filter-action-status").addEventListener("change",w),document.getElementById("filter-action-scope").removeEventListener("change",m),document.getElementById("filter-action-scope").addEventListener("change",w),n||document.getElementById("filter-responsible")?.addEventListener("change",w),f(),e.querySelector("#global-create-action-btn")?.addEventListener("click",()=>{ht(r,i,v,n,s,e)});function I(){V(e)}e._refreshActionList=I}function ht(e,s,t,n,o,i){const p=t.filter(I=>I.active&&le.includes(I.role)),y=`
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
            ${e.map(I=>`<option value="${I.id}">${I.name}</option>`).join("")}
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
            ${K.map(I=>`<option value="${I}">${I}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الأولوية <span class="form-optional">(اختياري)</span></label>
          <select class="form-select" id="gca-priority">
            <option value="">بدون أولوية</option>
            ${ie.map(I=>`<option value="${I}">${I}</option>`).join("")}
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
            ${p.map(I=>`<option value="${I.id}">${I.name} (${I.role})</option>`).join("")}
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
  `;P("إنشاء إجراء جديد",y,{footer:`
    <button class="btn btn-primary" id="gca-save-btn">✓ إنشاء الإجراء</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `,large:!0});const m=document.getElementById("gca-client-search"),f=document.getElementById("gca-client"),u=document.getElementById("gca-case"),w=document.getElementById("gca-case-hint");Array.from(f.options),m.addEventListener("input",()=>{const I=m.value.trim().toLowerCase();f.innerHTML='<option value="">اختر العميل...</option>',e.filter(b=>b.name.toLowerCase().includes(I)).forEach(b=>{const $=document.createElement("option");$.value=b.id,$.textContent=b.name,f.appendChild($)})}),f.addEventListener("change",()=>{const I=f.value;if(u.innerHTML="",u.disabled=!0,!I){u.innerHTML='<option value="">اختر العميل أولاً...</option>',w.textContent="اختر العميل لتحميل قضاياه";return}const a=s.filter($=>($.clientIds||($.clientId?[$.clientId]:[])).includes(I)||$.primaryClientId===I||$.clientId===I),b=n&&o?a.filter($=>$.ownerId===o.id||d.getAll(l.ACTIONS).some(c=>c.caseId===$.id&&c.responsibleUserId===o.id)):a;u.innerHTML='<option value="">بدون قضية (إجراء على مستوى العميل)</option>',b.forEach($=>{const c=document.createElement("option");c.value=$.id,c.textContent=`${$.caseNo}/${$.year} – ${$.subject}`,c.dataset.ownerId=$.ownerId||"",u.appendChild(c)}),u.disabled=!1,w.textContent=b.length===0?"لا توجد قضايا متاحة لهذا العميل":`${b.length} قضية – اختياري`}),u.addEventListener("change",()=>{const a=u.options[u.selectedIndex]?.dataset?.ownerId;if(a){const b=document.getElementById("gca-responsible");b&&Array.from(b.options).find(c=>c.value===a)&&(b.value=a)}}),document.getElementById("gca-save-btn").addEventListener("click",()=>{const I=document.getElementById("gca-client").value,a=document.getElementById("gca-case").value,b=document.getElementById("gca-action-type").value,$=document.getElementById("gca-title").value.trim(),c=document.getElementById("gca-priority").value,h=document.getElementById("gca-responsible").value,x=document.getElementById("gca-due-date").value,T=document.getElementById("gca-notes").value.trim(),D=[];if(I||D.push("العميل مطلوب – لا يمكن حفظ الإجراء بدون تحديد العميل"),b||D.push("نوع الإجراء مطلوب"),$||D.push("عنوان / وصف الإجراء مطلوب"),h||D.push("المحامي المسؤول مطلوب"),a){const A=d.getById(l.CASES,a);A&&((A.clientIds||(A.clientId?[A.clientId]:[])).includes(I)||A.primaryClientId===I||A.clientId===I||D.push("القضية المختارة لا تنتمي للعميل المحدد"))}if(D.length>0){const A=document.getElementById("gca-errors");A.style.display="block",A.innerHTML=D.join("<br>");return}const g=oe({clientId:I,caseId:a||"",sessionId:"",actionType:b,title:$,priority:c,responsibleUserId:h,status:"مفتوح",dueDate:x,notes:T}),C=d.create(l.ACTIONS,g);L(l.ACTIONS,C.id,"create",{source:"global",clientId:I,caseId:a||null,actionType:b,responsibleUserId:h});const E=d.getById(l.CLIENTS,I)?.name||"";k(`تم إنشاء الإجراء: ${b} – ${E} (${a?"ضمن القضية":"على مستوى العميل"})`,"success"),O(),V(i)})}function It(e){M("المواعيد النهائية");const s=d.getAll(l.DEADLINES);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-time'></i> المواعيد النهائية</h1>
          <div class="page-header-sub">${s.filter(n=>n.status==="مفتوح").length} موعد مفتوح</div>
        </div>
      </div>
      
      <div class="filter-bar">
        <select class="filter-select" id="filter-dl-type">
          <option value="">كل الأنواع</option>
          ${ke.map(n=>`<option value="${n}">${n}</option>`).join("")}
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
  `;function t(){const n=document.getElementById("filter-dl-type").value,o=document.getElementById("filter-dl-status").value;let i=s;n&&(i=i.filter(v=>v.deadlineType===n)),o&&(i=i.filter(v=>v.status===o)),i.sort((v,y)=>new Date(v.endDate)-new Date(y.endDate));const p=document.getElementById("dl-table-body");if(i.length===0){p.innerHTML='<tr><td colspan="8"><div class="empty-state"><p>لا توجد مواعيد نهائية</p></div></td></tr>';return}p.innerHTML=i.map(v=>{const y=d.getById(l.CASES,v.caseId),r=d.getById(l.USERS,v.responsibleUserId),m=Ce[v.status]||"open",f=F(v.endDate),u=v.status==="مفتوح"&&f<0,w=v.status==="مفتوح"&&f>=0&&f<=3;return`
        <tr class="${u?"risk-flag high":w?"risk-flag medium":""}">
          <td><strong>${v.deadlineType}</strong></td>
          <td>
            <a href="#/cases/${v.caseId}" style="color: var(--text-link);">
              ${y?y.caseNo+"/"+y.year:"—"}
            </a>
          </td>
          <td>${j(v.startDate)}</td>
          <td>${j(v.endDate)}</td>
          <td>
            ${v.status==="مفتوح"?u?`<span class="badge badge-blocked">متأخر ${Math.abs(f)} يوم</span>`:f===0?'<span class="badge badge-progress">اليوم!</span>':`<span class="badge ${w?"badge-progress":"badge-open"}">${f} يوم</span>`:"—"}
          </td>
          <td>${r?r.name:"—"}</td>
          <td><span class="badge badge-${m}">${v.status}</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="window.location.hash='/cases/${v.caseId}'">عرض ←</button>
          </td>
        </tr>
      `}).join("")}t(),document.getElementById("filter-dl-type").addEventListener("change",t),document.getElementById("filter-dl-status").addEventListener("change",t)}function de(e){if(M("ربط القرارات بالإجراءات"),!X()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const s=Be();e.innerHTML=`
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
            ${s.map(t=>`
              <tr>
                <td><strong>${t.decisionType}</strong></td>
                <td><span class="badge badge-open">${t.actionType}</span></td>
                <td class="text-sm">${t.executionProof||"—"}</td>
                <td>${t.requiresNextDate?"✅":"❌"}</td>
                <td>${t.subTasks?.length>0?`${t.subTasks.length} مهام`:"—"}</td>
                <td>${t.urgent?"<i class='bx bxs-circle'></i>":"—"}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-mapping" data-id="${t.id}"><i class='bx bx-edit'></i></button>
                    <button class="btn btn-ghost btn-sm delete-mapping" data-id="${t.id}"><i class='bx bx-trash'></i></button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,e.querySelector("#add-mapping-btn").addEventListener("click",()=>{Ie(null,e)}),e.querySelectorAll(".edit-mapping").forEach(t=>{t.addEventListener("click",()=>{const n=s.find(o=>o.id===t.dataset.id);n&&Ie(n,e)})}),e.querySelectorAll(".delete-mapping").forEach(t=>{t.addEventListener("click",()=>{pt(t.dataset.id),k("تم حذف الربط","success"),de(e)})})}function Ie(e,s){const t=!!e,n=`
    <form id="mapping-form">
      <div class="form-group">
        <label class="form-label">نوع القرار <span class="required">*</span></label>
        <select class="form-select" id="map-decision" required>
          <option value="">اختر</option>
          ${Ae.map(i=>`<option value="${i}" ${e?.decisionType===i?"selected":""}>${i}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">الإجراء المنشأ <span class="required">*</span></label>
        <select class="form-select" id="map-action" required>
          <option value="">اختر</option>
          ${K.map(i=>`<option value="${i}" ${e?.actionType===i?"selected":""}>${i}</option>`).join("")}
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
  `;P(t?"تعديل الربط":"إضافة ربط جديد",n,{footer:`
    <button class="btn btn-primary" id="save-mapping">${t?"💾 حفظ":"✓ إضافة"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-mapping").addEventListener("click",()=>{const i={decisionType:document.getElementById("map-decision").value,actionType:document.getElementById("map-action").value,executionProof:document.getElementById("map-proof").value,requiresNextDate:document.getElementById("map-requires-date").checked,urgent:document.getElementById("map-urgent").checked};if(!i.decisionType||!i.actionType){k("نوع القرار والإجراء مطلوبان","error");return}t?rt(e.id,i):ut(i),k(t?"تم تحديث الربط":"تم إضافة الربط","success"),O(),de(s)})}function qe(e){if(M("إدارة المستخدمين"),!X()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const s=d.getAll(l.USERS);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bxs-user-detail'></i> إدارة المستخدمين</h1>
          <div class="page-header-sub">${s.length} مستخدم</div>
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
            ${s.map(t=>`
              <tr>
                <td><strong>${t.name}</strong></td>
                <td><span class="badge badge-open">${t.role}</span></td>
                <td>${t.email||"—"}</td>
                <td>${t.phone||"—"}</td>
                <td><span class="badge ${t.active?"badge-active":"badge-expired"}">${t.active?"نشط":"غير نشط"}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-ghost btn-sm edit-user" data-id="${t.id}"><i class='bx bx-edit'></i></button>
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `,e.querySelector("#add-user-btn").addEventListener("click",()=>$e(null,e)),e.querySelectorAll(".edit-user").forEach(t=>{t.addEventListener("click",()=>{const n=d.getById(l.USERS,t.dataset.id);n&&$e(n,e)})})}function $e(e,s){const t=!!e,n=`
    <form>
      <div class="form-group">
        <label class="form-label">الاسم <span class="required">*</span></label>
        <input type="text" class="form-input" id="user-name" value="${e?.name||""}" required />
      </div>
      <div class="form-group">
        <label class="form-label">الدور <span class="required">*</span></label>
        <select class="form-select" id="user-role" required>
          ${Je.map(i=>`<option value="${i}" ${e?.role===i?"selected":""}>${i}</option>`).join("")}
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
      ${t?`
      <div class="form-group">
        <label class="form-checkbox">
          <input type="checkbox" id="user-active" ${e?.active?"checked":""} />
          <span>مستخدم نشط</span>
        </label>
      </div>
      `:""}
    </form>
  `;P(t?"تعديل المستخدم":"إضافة مستخدم",n,{footer:`
    <button class="btn btn-primary" id="save-user">${t?"💾 حفظ":"✓ إضافة"}</button>
    <button class="btn btn-secondary" onclick="document.getElementById('active-modal')?.remove()">إلغاء</button>
  `}),document.getElementById("save-user").addEventListener("click",()=>{const i=Qe({name:document.getElementById("user-name").value.trim(),role:document.getElementById("user-role").value,email:document.getElementById("user-email").value.trim(),phone:document.getElementById("user-phone").value.trim(),active:t?document.getElementById("user-active")?.checked:!0});if(!i.name){k("اسم المستخدم مطلوب","error");return}if(t)d.update(l.USERS,e.id,i),L(l.USERS,e.id,"update",i);else{const p=d.create(l.USERS,i);L(l.USERS,p.id,"create",i)}k(t?"تم تحديث المستخدم":"تم إضافة المستخدم","success"),O(),qe(s)})}function $t(e){if(M("سجل المراجعة"),!X()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const s=lt(100);e.innerHTML=`
    <div class="animate-fade-in">
      <div class="page-header">
        <div>
          <h1><i class='bx bx-list-check'></i> سجل المراجعة</h1>
          <div class="page-header-sub">آخر ${s.length} عملية</div>
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
            ${s.length===0?'<tr><td colspan="5"><div class="empty-state"><p>لا توجد عمليات مسجلة</p></div></td></tr>':""}
            ${s.map(t=>{const n={clients:"عميل",cases:"قضية",sessions:"جلسة",actions:"إجراء",deadlines:"موعد نهائي",users:"مستخدم",decision_map:"ربط قرار"}[t.entityType]||t.entityType;return`
                <tr>
                  <td class="text-sm">${new Date(t.timestamp).toLocaleString("ar-EG",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
                  <td>${t.userName||"—"}</td>
                  <td><span class="badge badge-${t.action==="create"?"open":t.action==="delete"?"blocked":"progress"}">${ot(t.action)}</span></td>
                  <td>${n}</td>
                  <td class="text-xs" style="font-family: monospace; color: var(--text-tertiary);">${t.entityId?t.entityId.substr(0,12):"—"}</td>
                </tr>
              `}).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function Et(e){if(M("إعدادات النظام"),!X()){e.innerHTML='<div class="empty-state"><h3>غير مصرح</h3><p>هذه الصفحة متاحة للشركاء فقط</p></div>';return}const s=d.getSetting("workdayEndTime")||"17:00";e.innerHTML=`
    <div class="animate-fade-in">
        <div class="page-header">
            <div>
                <h1><i class='bx bxs-cog'></i> إعدادات النظام</h1>
                <div class="page-header-sub">الإعدادات العامة للنظام</div>
            </div>
        </div>

        <div class="card" style="max-width: 600px;">
            <h3 class="mb-4" style="color: var(--accent-primary);">🔔 إعدادات الإشعارات</h3>

            <div class="form-group">
                <label class="form-label">وقت نهاية يوم العمل <span class="required">*</span></label>
                <input type="time" class="form-input" id="workday-end-time" value="${s}" />
                <div class="form-hint">سيتم عرض إشعار بالجلسات غير المكتملة عند هذا الوقت يومياً</div>
            </div>

            <div class="flex gap-3 mt-6">
                <button class="btn btn-primary" id="save-settings-btn">💾 حفظ الإعدادات</button>
            </div>
        </div>
    </div>
    `,e.querySelector("#save-settings-btn").addEventListener("click",()=>{const t=document.getElementById("workday-end-time").value;if(!t){k("وقت نهاية يوم العمل مطلوب","error");return}d.setSetting("workdayEndTime",t),k("تم حفظ الإعدادات بنجاح","success")})}function St(e){M("التقويم");let s=new Date;s.setDate(1);function t(){const o=s.getFullYear(),i=s.getMonth(),p=d.getAll(l.SESSIONS),v=d.getAll(l.DEADLINES).filter(g=>g.status==="مفتوح"),y=d.getAll(l.CASES),r=d.getAll(l.CLIENTS),m={};function f(g){if(!g)return"—";const C=g.clientIds||(g.clientId?[g.clientId]:[]),E=g.primaryClientId||g.clientId,S=r.find(A=>A.id===E);return C.length>1&&S?S.name+" وآخرون":S?S.name:"—"}function u(g){return g?g.split("T")[0]:null}function w(g,C,E,S){const A=u(g);if(!A)return;const[B,N]=A.split("-").map(Number);if(B!==o||N-1!==i)return;m[A]||(m[A]=[]);const H=y.find(R=>R.id===E),_=f(H);m[A].push({type:C,title:_,caseId:E,label:S})}p.forEach(g=>{g.date&&w(g.date,"session",g.caseId,"جلسة")}),v.forEach(g=>{g.endDate&&w(g.endDate,"deadline",g.caseId,"موعد نهائي")});const I=new Date(o,i,1),a=new Date(o,i+1,0),b=I.getDay(),$=a.getDate(),c=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],h=["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"],x=new Date().toISOString().split("T")[0],T=3;let D="";for(let g=0;g<b;g++)D+='<div class="cal-day cal-day-empty"></div>';for(let g=1;g<=$;g++){const C=String(i+1).padStart(2,"0"),E=String(g).padStart(2,"0"),S=`${o}-${C}-${E}`,A=m[S]||[],B=S===x,N=A.slice(0,T),H=A.length-T;let _=N.map(R=>`
                <div class="cal-event cal-event-${R.type}"
                     data-caseid="${R.caseId}"
                     title="${R.title} – ${R.label}"
                     style="cursor:pointer; user-select:none;">
                    <span class="cal-dot cal-dot-${R.type}"></span>
                    <span class="cal-event-title">${R.title}</span>
                    <span class="cal-event-label">${R.label}</span>
                </div>
            `).join("");H>0&&(_+=`<button class="cal-more-btn" data-date="${S}">+${H} المزيد</button>`),D+=`
                <div class="cal-day ${B?"cal-day-today":""}" data-date="${S}"
                     style="user-select:none;">
                    <div class="cal-day-number">${g}</div>
                    <div class="cal-day-events">${_}</div>
                </div>
            `}e.innerHTML=`
        <div class="animate-fade-in">
            <div class="cal-header">
                <button class="btn btn-ghost btn-sm" id="cal-prev">→</button>
                <h2 class="cal-month-title">${c[i]} ${o}</h2>
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
                    ${h.map(g=>`<div class="cal-weekday">${g}</div>`).join("")}
                </div>
                <div class="cal-days">
                    ${D}
                </div>
            </div>
        </div>
        `,e.querySelector("#cal-prev").addEventListener("click",()=>{s.setMonth(s.getMonth()-1),t()}),e.querySelector("#cal-next").addEventListener("click",()=>{s.setMonth(s.getMonth()+1),t()}),e.querySelector("#cal-today").addEventListener("click",()=>{s=new Date,s.setDate(1),t()}),e.querySelectorAll(".cal-event").forEach(g=>{g.addEventListener("click",C=>{C.stopPropagation();const E=g.dataset.caseid;E&&(window.location.hash=`/cases/${E}`)})}),e.querySelectorAll(".cal-more-btn").forEach(g=>{g.addEventListener("click",C=>{C.stopPropagation();const E=g.dataset.date,S=m[E]||[];n(g,S,E)})}),e.querySelectorAll(".cal-day, .cal-event").forEach(g=>{g.setAttribute("draggable","false"),g.addEventListener("dragstart",C=>C.preventDefault())})}function n(o,i,p){document.querySelectorAll(".cal-popover").forEach(f=>f.remove());const y=new Date(p+"T00:00:00").toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"}),r=document.createElement("div");r.className="cal-popover",r.innerHTML=`
            <div class="cal-popover-header">
                <span>${y}</span>
                <button class="cal-popover-close">&times;</button>
            </div>
            <div class="cal-popover-list">
                ${i.map(f=>`
                    <div class="cal-popover-item" data-caseid="${f.caseId}" style="cursor:pointer;">
                        <span class="cal-dot cal-dot-${f.type}"></span>
                        <span class="cal-popover-client">${f.title}</span>
                        <span class="cal-popover-type">${f.label}</span>
                    </div>
                `).join("")}
            </div>
        `,o.parentElement.appendChild(r),r.querySelector(".cal-popover-close").addEventListener("click",()=>r.remove()),r.querySelectorAll(".cal-popover-item").forEach(f=>{f.addEventListener("click",()=>{const u=f.dataset.caseid;u&&(window.location.hash=`/cases/${u}`),r.remove()})});const m=f=>{r.contains(f.target)||(r.remove(),document.removeEventListener("click",m))};setTimeout(()=>document.addEventListener("click",m),10)}t()}let re=!1;function xt(){setInterval(Ee,60*1e3),Ee()}function Ee(){const e=d.getSetting("workdayEndTime");if(!e)return;const s=new Date,[t,n]=e.split(":").map(Number),o=s.getHours()*60+s.getMinutes(),i=t*60+n;if(o<i){re&&Se();return}const p=s.toISOString().split("T")[0],y=d.getAll(l.SESSIONS).filter(r=>r.date===p&&(!r.decisionResult||r.status!=="مغلق"));y.length>0?wt(y):Se()}function wt(e){re=!0;const s=document.getElementById("notification-bar");if(!s)return;const t=d.getAll(l.CASES),n=d.getAll(l.CLIENTS);s.innerHTML=`
        <div class="notif-bar">
            <div class="notif-bar-content">
                <span class="notif-bar-icon">🔔</span>
                <span class="notif-bar-text">لديك <strong>${e.length}</strong> جلسات اليوم بدون نتائج مسجلة</span>
                <button class="notif-bar-toggle" id="notif-toggle">عرض التفاصيل ▼</button>
            </div>
            <div class="notif-bar-list" id="notif-list" style="display: none;">
                ${e.map(o=>{const i=t.find(y=>y.id===o.caseId),p=i?i.primaryClientId||i.clientId:"",v=n.find(y=>y.id===p);return`
                        <div class="notif-item">
                            <div class="notif-item-info">
                                <div class="notif-item-client">${v?v.name:"—"}</div>
                                <div class="notif-item-details">
                                    القضية ${i?i.caseNo+"/"+i.year:"—"}
                                    ${i?" – "+i.court:""}
                                </div>
                            </div>
                            <button class="btn btn-primary btn-sm notif-record-btn" data-caseid="${o.caseId}">تسجيل النتيجة الآن</button>
                        </div>
                    `}).join("")}
            </div>
        </div>
    `,s.style.display="block",s.querySelector("#notif-toggle")?.addEventListener("click",()=>{const o=s.querySelector("#notif-list"),i=s.querySelector("#notif-toggle");o.style.display==="none"?(o.style.display="block",i.textContent="إخفاء التفاصيل ▲"):(o.style.display="none",i.textContent="عرض التفاصيل ▼")}),s.querySelectorAll(".notif-record-btn").forEach(o=>{o.addEventListener("click",()=>{window.location.hash=`/cases/${o.dataset.caseid}`})})}function Se(){re=!1;const e=document.getElementById("notification-bar");e&&(e.innerHTML="",e.style.display="none")}function Tt(){if(tt(),!U()){const s=d.getAll(l.USERS);s.length>0&&ce(s[0])}st(),q("/",be),q("/dashboard",be),q("/clients",Le),q("/clients/new",ye),q("/clients/:id/edit",ye),q("/cases",ct),q("/cases/new",he),q("/cases/:id",z),q("/cases/:id/edit",he),q("/actions",V),q("/deadlines",It),q("/calendar",St),q("/admin/mapping",de),q("/admin/users",qe),q("/admin/audit",$t),q("/admin/settings",Et),Dt(),He(),xt(),(!window.location.hash||window.location.hash==="#")&&Ue("/dashboard")}function Dt(){const e=document.getElementById("topbar"),s=U();e.innerHTML=`
    <div>
      <div class="topbar-title" id="topbar-page-title">لوحة التحكم</div>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-ghost btn-sm" id="mobile-menu-btn" style="display:none;">☰</button>
      <div class="flex items-center gap-3">
        <span class="text-sm text-secondary">${s?s.name:""}</span>
        <select id="user-switcher" class="filter-select" style="min-width: 160px; font-size: var(--text-xs);">
          ${d.getAll(l.USERS).map(t=>`<option value="${t.id}" ${s&&s.id===t.id?"selected":""}>${t.name} (${t.role})</option>`).join("")}
        </select>
      </div>
    </div>
  `,e.querySelector("#user-switcher").addEventListener("change",t=>{const n=d.getById(l.USERS,t.target.value);n&&(ce(n),location.reload())})}function M(e){const s=document.getElementById("topbar-page-title");s&&(s.textContent=e)}function j(e){return e?new Date(e).toLocaleDateString("ar-EG",{year:"numeric",month:"short",day:"numeric"}):"—"}function F(e){if(!e)return 1/0;const s=new Date(e),t=new Date;return t.setHours(0,0,0,0),s.setHours(0,0,0,0),Math.ceil((s-t)/(1e3*60*60*24))}function ee(e){return F(e)<0}document.addEventListener("DOMContentLoaded",Tt);
