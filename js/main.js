let scripts=[];const $=s=>document.querySelector(s);const isNew=s=>{if(!s.new)return false;if(!s.newUntil)return true;return new Date(s.newUntil+'T23:59:59')>=new Date()};const total=s=>s.male+s.female+s.any;const meta=s=>`${total(s)}人（男${s.male}・女${s.female}・不問${s.any}）｜${s.genres.join('・')}｜約${s.minutes}分`;
function card(s){const visual=s.image?`<img src="${s.image}" alt="">`:'<span class="noImage">NO IMAGE</span>';return `<article class="card"><a href="${s.url}" target="_blank" rel="noopener"><div class="thumb">${visual}${isNew(s)?'<span class="badge">NEW</span>':''}</div><div class="cardBody"><h3>${s.title}</h3><div class="meta">${meta(s)}</div></div></a></article>`}
function render(){const p=$('#people').value,g=$('#genre').value,m=Number($('#minutes').value);const found=scripts.filter(s=>(p==='all'||total(s)===Number(p))&&(g==='all'||s.genres.includes(g))&&s.minutes<=m);$('#count').textContent=`${found.length}件の台本が見つかりました`;$('#results').innerHTML=found.map(s=>`<article class="result"><h3><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></h3><div class="meta">${meta(s)}</div></article>`).join('')||'<p>この条件に合う台本はありません。</p>'}
fetch('data/scripts.json').then(r=>r.json()).then(data=>{scripts=data;const peopleCounts=[...new Set(scripts.map(total).filter(n=>Number.isFinite(n)&&n>0))].sort((a,b)=>a-b);$('#people').innerHTML='<option value="all">指定なし</option>'+peopleCounts.map(n=>`<option value="${n}">${n}人</option>`).join('');const genres=[...new Set(scripts.flatMap(s=>s.genres||[]).map(g=>String(g).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ja'));$('#genre').innerHTML='<option value="all">指定なし</option>'+genres.map(g=>`<option value="${g.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}">${g.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</option>`).join('');const sliderScripts=[...scripts].sort((a,b)=>Number(isNew(b))-Number(isNew(a)));$('#slider').innerHTML=sliderScripts.map(card).join('');render()}).catch(()=>{$('#count').textContent='台本データを読み込めませんでした。'});['people','genre','minutes'].forEach(id=>$('#'+id).addEventListener('change',render));$('#prev').addEventListener('click',()=>$('#slider').scrollBy({left:-330,behavior:'smooth'}));$('#next').addEventListener('click',()=>$('#slider').scrollBy({left:330,behavior:'smooth'}));const drawer=$('#drawer'),overlay=$('#overlay');function menu(open){drawer.classList.toggle('open',open);overlay.classList.toggle('open',open)}$('#menuBtn').addEventListener('click',()=>menu(true));$('#closeBtn').addEventListener('click',()=>menu(false));overlay.addEventListener('click',()=>menu(false));drawer.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>menu(false)));

// 台本感想フォーム → Google Forms
const feedbackForm=$('#feedbackForm'),feedbackScript=$('#feedbackScript'),feedbackStatus=$('#feedbackStatus'),feedbackSubmit=$('#feedbackSubmit');
function fillFeedbackScripts(){
 if(!feedbackScript)return;
 const list=$('#feedbackScriptList');
 if(!list)return;
 const esc=v=>String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const options=[...scripts].sort((a,b)=>String(a.title).localeCompare(String(b.title),'ja'));
 list.innerHTML=options.map(s=>`<option value="${esc(s.title)}"></option>`).join('');
}
const feedbackWait=setInterval(()=>{if(scripts.length){clearInterval(feedbackWait);fillFeedbackScripts()}},100);
if(feedbackForm)feedbackForm.addEventListener('submit',async e=>{
 e.preventDefault();
 const script=feedbackScript.value,name=$('#feedbackName').value.trim(),message=$('#feedbackMessage').value.trim();
 if(!script||!message){feedbackStatus.textContent='台本名と感想・メッセージを入力してください。';return}
 if(!scripts.some(s=>s.title===script)){feedbackStatus.textContent='候補にある台本名を選択してください。';return}
 feedbackSubmit.disabled=true;feedbackStatus.textContent='送信しています…';
 const data=new URLSearchParams();
 data.set('entry.472955166',script);data.set('entry.2095848672',name);data.set('entry.1119787238',message);
 try{
  await fetch('https://docs.google.com/forms/d/e/1FAIpQLSfXirjBrC3XCKEGbyIdU8zYKqYMGFkuq7yGz-z3K0J2yw14Uw/formResponse',{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data.toString()});
  feedbackForm.reset();feedbackStatus.textContent='感想を送信しました。ありがとうございます！';
 }catch(err){feedbackStatus.textContent='送信できませんでした。時間をおいてもう一度お試しください。'}
 finally{feedbackSubmit.disabled=false}
});
