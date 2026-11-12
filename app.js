const prices={
 quests:{title:'КВЕСТ-ПРОГРАММЫ',rows:[['Квест «Гарри Поттер»','4 500 ₽','До 10 человек'],['Квест «Gravity Falls»','4 000 ₽','До 10 человек'],['Квест «Нора Хоббита»','4 000 ₽','До 10 человек'],['Актёр на квест','1 800 ₽','Дополнительная услуга'],['Дополнительный человек на квест','600 ₽','За каждого участника сверх 10']]},
 karting:{title:'КАРТИНГ',rows:[['Прокат — 7 минут','400 ₽','За участника'],['Прокат — 14 минут','700 ₽','За участника'],['Прокат — 21 минута','1 050 ₽','За участника'],['Прокат — 30 минут','1 400 ₽','За участника']]},
 labyrinth:{title:'ЛАБИРИНТ',rows:[['Лазертаг — 60 минут','1 000 ₽ / чел.','Минимум 5 участников'],['AMONG US — 60 минут','1 000 ₽ / чел.','Минимум 5 участников'],['Прятки в темноте — 60 минут','700 ₽ / чел.','Минимум 5 участников']]},
 rooms:{title:'АРЕНДА КОМНАТ',rows:[['Комната 5–11 человек — 60 минут','1 800 ₽','За комнату'],['Комната 5–11 человек — 180 минут','4 700 ₽','За комнату'],['Комната 12–20 человек — 60 минут','2 000 ₽','За комнату'],['Комната 12–20 человек — 180 минут','5 500 ₽','За комнату'],['Комната PARTY (20+ человек) — 60 минут','2 500 ₽','За комнату'],['Комната PARTY (20+ человек) — 180 минут','7 000 ₽','За комнату']]},
 extras:{title:'ДОПОЛНИТЕЛЬНЫЕ УСЛУГИ',rows:[['Ведущий — до 10 человек','4 500 ₽',''],['Ведущий — от 11 человек','6 000 ₽',''],['Разбитие пиньяты','3 000 ₽',''],['SECRET BOX — до 10 человек','4 000 ₽',''],['SECRET BOX — от 11 человек','6 000 ₽',''],['Оформление комнаты','3 500 ₽',''],['Поздравление','1 800 ₽','']]}
};
const priceContent=document.querySelector('#price-content');
function showPrices(key){const data=prices[key];priceContent.innerHTML=`<div class="price-group-title">${data.title}</div>`+data.rows.map(r=>`<div class="price-row"><div><strong>${r[0]}</strong>${r[2]?`<small>${r[2]}</small>`:''}</div><span>${r[1]}</span></div>`).join('');document.querySelectorAll('.price-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===key))}
document.querySelectorAll('.price-tab').forEach(b=>b.addEventListener('click',()=>showPrices(b.dataset.tab)));showPrices('quests');

const serviceCatalog=[
 {id:'laser',group:'Лабиринт',name:'Лазертаг — 60 минут',rate:1000,kind:'person',min:5},
 {id:'among',group:'Лабиринт',name:'Among Us — 60 минут',rate:1000,kind:'person',min:5},
 {id:'hide',group:'Лабиринт',name:'Прятки в темноте — 60 минут',rate:700,kind:'person',min:5},
 {id:'kart7',group:'Картинг',name:'Картинг — 7 минут',rate:400,kind:'person'},
 {id:'kart14',group:'Картинг',name:'Картинг — 14 минут',rate:700,kind:'person'},
 {id:'kart21',group:'Картинг',name:'Картинг — 21 минута',rate:1050,kind:'person'},
 {id:'kart30',group:'Картинг',name:'Картинг — 30 минут',rate:1400,kind:'person'},
 {id:'potter',group:'Квесты',name:'Квест «Гарри Поттер»',rate:4500,kind:'quest'},
 {id:'gravity',group:'Квесты',name:'Квест «Gravity Falls»',rate:4000,kind:'quest'},
 {id:'hobbit',group:'Квесты',name:'Квест «Нора Хоббита»',rate:4000,kind:'quest'}
];
const extrasCatalog=[
 {id:'host',name:'Ведущий',rate:4500,rateLarge:6000},
 {id:'actor',name:'Актёр на квест',rate:1800},
 {id:'pinata',name:'Разбитие пиньяты',rate:3000},
 {id:'secret',name:'SECRET BOX',rate:4000,rateLarge:6000},
 {id:'decor',name:'Оформление комнаты',rate:3500},
 {id:'greeting',name:'Поздравление именинника',rate:1800}
];
const roomCatalog=[
 {id:'room11',name:'Комната на 5–11 человек',one:1800,three:4700,limit:11,min:5},
 {id:'room20',name:'Комната на 12–20 человек',one:2000,three:5500,limit:20,min:12},
 {id:'party',name:'Комната PARTY (20+ человек)',one:2500,three:7000,min:21}
];
const money=n=>new Intl.NumberFormat('ru-RU').format(Math.round(n))+' ₽';
const builderItems=document.querySelector('#builder-items');
const peopleInput=document.querySelector('#calc-people');
const hoursInput=document.querySelector('#calc-hours');
let items=[],nextItemId=1;
function addItem(type,id){
 const item={uid:nextItemId++,type,id};
 items.push(item);renderItems();calculate();
}
function removeItem(uid){items=items.filter(x=>x.uid!==uid);renderItems();calculate()}
function optionList(type,selected){
 const list=type==='activity'?serviceCatalog:type==='extra'?extrasCatalog:roomCatalog;
 const groups=type==='activity'?['Лабиринт','Картинг','Квесты']:null;
 if(groups)return groups.map(g=>`<optgroup label="${g}">${list.filter(x=>x.group===g).map(x=>`<option value="${x.id}" ${x.id===selected?'selected':''}>${x.name}</option>`).join('')}</optgroup>`).join('');
 return list.map(x=>`<option value="${x.id}" ${x.id===selected?'selected':''}>${x.name}</option>`).join('');
}
function renderItems(){
 builderItems.innerHTML=items.map(item=>{
  const list=item.type==='activity'?serviceCatalog:item.type==='extra'?extrasCatalog:roomCatalog;
  const entry=list.find(x=>x.id===item.id)||list[0];
  const amount=item.type==='activity'&&entry.kind==='person'?money(entry.rate)+' / чел.':item.type==='activity'?money(entry.rate)+' до 10 чел.':item.type==='extra'?'доп. услуга':'аренда по часам';
  return `<div class="builder-item" data-uid="${item.uid}">
   <div class="builder-item-main"><span class="builder-kind">${item.type==='activity'?'АКТИВНОСТЬ':item.type==='extra'?'ДОПОЛНИТЕЛЬНО':'АРЕНДА КОМНАТЫ'}</span>
    <select class="builder-select" aria-label="Выберите услугу">${optionList(item.type,item.id)}</select>
    <small class="builder-rate">${amount}</small>
   </div><div class="builder-item-total" data-total-for="${item.uid}">—</div>
   <button type="button" class="remove-item" aria-label="Удалить позицию" data-remove="${item.uid}">×</button>
  </div>`;
 }).join('');
 builderItems.querySelectorAll('.builder-select').forEach(select=>select.addEventListener('change',e=>{
  const uid=Number(e.target.closest('.builder-item').dataset.uid);
  const item=items.find(x=>x.uid===uid);item.id=e.target.value;renderItems();calculate();
 }));
 builderItems.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>removeItem(Number(btn.dataset.remove))));
}
function roomPrice(room,hours){
 const h=Math.max(1,Math.min(12,Number(hours)||1));
 if(h<=2)return room.one*h;
 if(h===3)return room.three;
 return room.three+(h-3)*room.one;
}
function calculate(){
 const people=Math.max(1,Math.min(50,Number(peopleInput.value)||1));
 const hours=Math.max(1,Math.min(12,Number(hoursInput.value)||1));
 peopleInput.value=people;hoursInput.value=hours;
 let total=0,details=[],notes=[];
 items.forEach(item=>{
  const list=item.type==='activity'?serviceCatalog:item.type==='extra'?extrasCatalog:roomCatalog;
  const entry=list.find(x=>x.id===item.id);if(!entry)return;
  let amount=0,description='';
  if(item.type==='activity'&&entry.kind==='person'){
   amount=entry.rate*people;description=`${people} × ${money(entry.rate)}`;
   if(entry.min&&people<entry.min)notes.push(`${entry.name}: по прайсу требуется минимум ${entry.min} участников.`);
  }else if(item.type==='activity'&&entry.kind==='quest'){
   amount=entry.rate+Math.max(0,people-10)*600;
   description=people>10?`${money(entry.rate)} + ${people-10} × 600 ₽ за дополнительных гостей`:`до 10 участников включено`;
  }else if(item.type==='extra'){
   amount=entry.rateLarge?(people>=11?entry.rateLarge:entry.rate):entry.rate;
   description=entry.rateLarge?(people>=11?'тариф от 11 гостей':'тариф до 10 гостей'):'фиксированная стоимость';
  }else{
   amount=roomPrice(entry,hours);
   description=`${hours} ч. аренды`;
   if(entry.min&&people<entry.min)notes.push(`${entry.name}: проверьте, подходит ли эта комната для ${people} гостей.`);
   if(entry.limit&&people>entry.limit)notes.push(`${entry.name}: количество гостей превышает указанный диапазон.`);
   if(hours>3)notes.push('Аренда свыше 3 часов рассчитана как тариф за 3 часа плюс дополнительные часы по цене одного часа.');
  }
  total+=amount;details.push({uid:item.uid,name:entry.name,amount,description});
  const out=builderItems.querySelector(`[data-total-for="${item.uid}"]`);if(out)out.textContent=money(amount);
 });
 document.querySelector('#calc-total').textContent=money(total);
 document.querySelector('#calc-detail').textContent=items.length?`${items.length} позиций · ${people} гостей · ${hours} ч. аренды`:'Добавьте активности, чтобы увидеть расчёт';
 document.querySelector('#calc-notes').innerHTML=[...new Set(notes)].map(x=>`<div>• ${x}</div>`).join('');
 return {people,hours,total,details,notes:[...new Set(notes)]};
}
document.querySelector('#add-activity').onclick=()=>addItem('activity','laser');
document.querySelector('#add-extra').onclick=()=>addItem('extra','host');
document.querySelector('#add-room').onclick=()=>{if(items.some(x=>x.type==='room')){document.querySelector('#calc-notes').textContent='В смету уже добавлена аренда комнаты. Измените её позицию, чтобы выбрать другой тип.';return}addItem('room','room11')};
[peopleInput,hoursInput].forEach(el=>el.addEventListener('input',calculate));
addItem('activity','laser');
document.querySelector('#calc-book').onclick=()=>{
 const c=calculate();
 if(!c.details.length){document.querySelector('#calc-notes').textContent='Сначала добавьте хотя бы одну услугу.';return}
 document.querySelector('#booking-program').value='Свой вариант';
 document.querySelector('#booking-form [name=people]').value=c.people;
 document.querySelector('#booking-form [name=comment]').value='Состав программы:\n'+c.details.map(x=>`• ${x.name}: ${money(x.amount)} (${x.description})`).join('\n')+`\nДлительность аренды: ${c.hours} ч.\nИтого ориентировочно: ${money(c.total)}.`+(c.notes.length?'\nПримечания: '+c.notes.join(' '):'');
 document.querySelector('#booking').scrollIntoView({behavior:'smooth'});
};

document.querySelectorAll('.choose-package').forEach(btn=>btn.addEventListener('click',()=>{
 const extreme=btn.dataset.package==='extreme';
 document.querySelector('#booking-program').value=extreme?'Экстрим-Таг':'Luxury';
 document.querySelector('#booking').scrollIntoView({behavior:'smooth'});
 document.querySelector('#booking-form [name=people]').value=extreme?8:10;
}));
document.querySelector('#booking-form').addEventListener('submit',e=>{
 e.preventDefault();const f=e.currentTarget;const data=Object.fromEntries(new FormData(f).entries());if(!data.consent)return;
 const saved=JSON.parse(localStorage.getItem('questtag_demo_requests')||'[]');
 saved.push({...data,createdAt:new Date().toISOString(),status:'Демо — заявка не отправлена'});
 localStorage.setItem('questtag_demo_requests',JSON.stringify(saved));
 document.querySelector('#booking-status').textContent='Черновик заявки сохранён в этом браузере. Для реальной отправки потребуется подключить сервер приёма заявок.';
 f.reset();f.querySelector('[name=people]').value=8;
});

const chat=document.querySelector('#chat-messages');
const chatHistory=[];
function addMessage(text,who){
 const d=document.createElement('div');d.className='message '+who;d.textContent=text;chat.appendChild(d);chat.scrollTop=chat.scrollHeight;
}
async function sendChat(question){
 const q=question.trim();if(!q)return;
 addMessage(q,'user');
 const send=document.querySelector('#chat-form button');send.disabled=true;
 const pending=document.createElement('div');pending.className='message bot typing';pending.textContent='Готовлю ответ…';chat.appendChild(pending);chat.scrollTop=chat.scrollHeight;
 try{
  const base=(window.QUESTTAG_API_URL||'').replace(/\/$/,'');
  if(!base)throw new Error('GigaChat ещё не настроен: добавьте адрес backend в config.js.');
  const response=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:q,history:chatHistory.slice(-10)})});
  const data=await response.json();
  if(!response.ok)throw new Error(data.detail||'Не удалось получить ответ консультанта.');
  pending.remove();const reply=String(data.reply||'Не удалось получить ответ.');addMessage(reply,'bot');
  chatHistory.push({role:'user',content:q},{role:'assistant',content:reply});
 }catch(error){
  pending.remove();addMessage(error.message.includes('Failed to fetch')?'Не удалось связаться с сервером консультанта. Попробуйте позже или оставьте заявку через форму.':error.message,'bot');
 }finally{send.disabled=false;document.querySelector('#chat-text').focus()}
}
document.querySelector('#chat-form').addEventListener('submit',e=>{e.preventDefault();const input=document.querySelector('#chat-text');const value=input.value;input.value='';sendChat(value)});
document.querySelectorAll('[data-question]').forEach(btn=>btn.addEventListener('click',()=>sendChat(btn.dataset.question)));

document.querySelector('.menu-btn').addEventListener('click',()=>document.querySelector('.topbar').classList.toggle('nav-open'));
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>document.querySelector('.topbar').classList.remove('nav-open')));
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelectorAll('input[type=date]').forEach(el=>{el.min=new Date().toISOString().slice(0,10)});
