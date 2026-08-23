const districts = [
  {id:'baoan-center',name:'宝安中心',zone:'baoan',zoneLabel:'宝安西部走廊',grade:'A',price:'约 5–6.5 万/㎡',total:500,commute:25,liquidity:'强',risk:'总价敏感',position:'优先研究 · 成熟核心商品房',summary:'前海、南山外溢与宝安成熟城市界面叠加，核心优势不是“不会跌”，而是下行后更容易恢复。',tags:['就业可达性强','配套已兑现','稀缺性较好'],nextCheck:'按小区核对真实成交、楼龄、物业、噪音与同片区新房竞争。',point:[22.553,113.883],polygon:[[22.57,113.85],[22.57,113.91],[22.53,113.92],[22.52,113.86]]},
  {id:'xixiang',name:'西乡',zone:'baoan',zoneLabel:'宝安西部走廊',grade:'B+',price:'待补真实成交',total:430,commute:30,liquidity:'中上',risk:'位置分化',position:'可研究 · 重点看通勤半径',summary:'承接宝安中心与西部生活走廊，靠近地铁、就业和成熟配套的房源更有韧性，外围则要折价。',tags:['过渡板块','地铁敏感','小区差异大'],nextCheck:'用到地铁站和目标工作地的实际通勤时间筛选，而不是只看行政区。',point:[22.581,113.862],polygon:[[22.62,113.84],[22.62,113.89],[22.57,113.91],[22.57,113.85]]},
  {id:'fuyong',name:'福永',zone:'baoan',zoneLabel:'宝安西部走廊',grade:'B',price:'待补真实成交',total:360,commute:40,liquidity:'中',risk:'噪音/供应',position:'审慎研究 · 先排除硬伤',summary:'机场、产业、地铁是变量，但必须确认就业能否沉淀为稳定居住需求，同时排查噪音、旧改和新增供应。',tags:['产业变量','机场噪音','供应核查'],nextCheck:'逐个小区核查噪音、旧改、地铁距离和近 12 个月成交。',point:[22.652,113.815],polygon:[[22.69,113.78],[22.69,113.85],[22.62,113.89],[22.62,113.81]]},
  {id:'shajing',name:'沙井核心',zone:'baoan',zoneLabel:'宝安西部走廊',grade:'B',price:'约 3–3.5 万/㎡*',total:320,commute:50,liquidity:'中',risk:'可替代供应',position:'价格合适才买 · 自住优先',summary:'低总价和西部生活半径是优势，但二手房会与周边新房、松岗和光明形成竞争，不能为远期规划支付溢价。',tags:['低总价','以价换量','供应替代'],nextCheck:'确认总价差是否足够大，并比较同预算下光明、松岗和新房选项。',point:[22.746,113.829],polygon:[[22.79,113.79],[22.79,113.87],[22.69,113.85],[22.69,113.78]]},
  {id:'guangming-core',name:'光明核心',zone:'guangming',zoneLabel:'光明片区',grade:'B+',price:'约 3.4–4 万/㎡*',total:380,commute:45,liquidity:'中',risk:'兑现节奏',position:'可以研究 · 只挑核心',summary:'科学城与产业叙事需要经过“高收入就业—人口留下—购买力—二手接盘”链条，不能只凭规划买房。',tags:['科学城','产业兑现','人才房变量'],nextCheck:'核对就业人口、商业配套、通勤和保障房供应，再比较商品房折价。',point:[22.748,113.935],polygon:[[22.80,113.88],[22.80,113.99],[22.71,114.02],[22.69,113.90]]},
  {id:'guangming-outer',name:'光明外围',zone:'guangming',zoneLabel:'光明片区',grade:'C',price:'待补真实成交',total:300,commute:55,liquidity:'偏弱',risk:'供应/流动性',position:'谨慎 · 除非折价足够大',summary:'产业距离、配套兑现和新房供应可能同时压制二手流动性，长期自住也要把通勤与生活成本算进去。',tags:['规划依赖','供应较多','流动性弱'],nextCheck:'先做“如果 5 年后换房，谁会接盘”的压力测试。',point:[22.806,113.892],polygon:[[22.86,113.84],[22.86,113.96],[22.80,113.99],[22.76,113.88]]}
];

const $ = selector => document.querySelector(selector);
const body = $('#comparison-body');
const filters = {zone:'all',home:'commodity',budget:999,commute:999};
const map = L.map('map',{zoomControl:true,attributionControl:true}).setView([22.65,113.89],11.15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
const markerLayers = new Map(); const areaLayers = new Map();
const colorFor = grade => grade.startsWith('A') ? '#2f806d' : grade.startsWith('B') ? '#c28a36' : '#c9634d';
const fillFor = grade => grade.startsWith('A') ? '#b8ddce' : grade.startsWith('B') ? '#ead39d' : '#efc1ad';

districts.forEach(item=>{
  const area=L.polygon(item.polygon,{color:colorFor(item.grade),weight:1.5,fillColor:fillFor(item.grade),fillOpacity:.22});
  area.bindTooltip(`<strong>${item.name}</strong><br><span>${item.grade} · ${item.zoneLabel}</span>`,{sticky:true,opacity:.96}); area.on('click',()=>renderDetail(item.id)); area.addTo(map); areaLayers.set(item.id,area);
  const marker=L.circleMarker(item.point,{radius:item.grade==='A'?13:11,color:'#fff',weight:3,fillColor:colorFor(item.grade),fillOpacity:.95});
  marker.bindTooltip(`<strong>${item.name}</strong><br><span>${item.grade} · ${item.zoneLabel}</span>`,{direction:'top',offset:[0,-8],opacity:.96}); marker.on('click',()=>renderDetail(item.id)); marker.addTo(map); markerLayers.set(item.id,marker);
});
L.marker([22.525,113.93],{icon:L.divIcon({className:'map-label',html:'<span>南山 · 深圳湾 · 前海</span>',iconSize:[170,22],iconAnchor:[85,11]})}).addTo(map);
L.polyline([[22.53,113.91],[22.58,113.87],[22.64,113.83],[22.75,113.83]],{color:'#4d8d7a',weight:4,opacity:.66,dashArray:'8 8'}).bindTooltip('西部就业 / 生活走廊').addTo(map);
L.polyline([[22.55,113.94],[22.65,113.94],[22.75,113.94]],{color:'#5579a8',weight:3,opacity:.7,dashArray:'3 8'}).bindTooltip('光明产业观察走廊').addTo(map);
L.control.scale({imperial:false,position:'bottomleft'}).addTo(map);

function gradeClass(grade){return grade.startsWith('A')?'grade-a':grade.startsWith('B')?'grade-b':'grade-c';}
function matches(item){return (filters.zone==='all'||item.zone===filters.zone)&&item.total<=filters.budget&&item.commute<=filters.commute;}
function renderDetail(id){
  const item=districts.find(d=>d.id===id)||districts[0]; $('#detail-name').textContent=item.name; $('#detail-grade').textContent=item.grade; $('#detail-grade').className=`grade-badge ${gradeClass(item.grade)}-bg`;
  $('#detail-position').textContent=filters.home==='talent'?'人才房视角 · 先核验产权与资格':item.position; $('#detail-summary').textContent=filters.home==='talent'?`${item.name} 的人才房判断：先确认项目资格、配售价格、转让限制和完全产权安排，再与周边商品房折价比较。${item.summary}`:item.summary;
  $('#detail-price').textContent=item.price; $('#detail-liquidity').textContent=item.liquidity; $('#detail-risk').textContent=item.risk; $('#detail-grade-copy').textContent=`${item.grade} · ${item.zoneLabel}`; $('#detail-next').textContent=item.nextCheck; $('#detail-tags').innerHTML=item.tags.map(tag=>`<span class="tag">${tag}</span>`).join('');
  markerLayers.forEach((marker,markerId)=>{const d=districts.find(x=>x.id===markerId),ok=matches(d);marker.setStyle({radius:markerId===id?16:(d.grade==='A'?13:11),weight:markerId===id?5:3,opacity:ok?1:.22,fillOpacity:ok?.95:.12});});
  areaLayers.forEach((layer,layerId)=>{const d=districts.find(x=>x.id===layerId),ok=matches(d);layer.setStyle({opacity:ok?1:.18,fillOpacity:layerId===id?.42:(ok?.22:.04),weight:layerId===id?3:1.5});});
}
function renderTable(){
  const visible=districts.filter(matches); body.innerHTML=visible.map(item=>`<tr data-district="${item.id}"><td>${item.name}</td><td><span class="table-grade ${gradeClass(item.grade)}">${item.grade}</span></td><td>${item.price.replace('*','')}</td><td>${item.liquidity}</td><td>${item.grade.startsWith('A')?'优先研究':item.grade==='C'?'谨慎/观望':'核实价格'}</td></tr>`).join('')||'<tr><td colspan="5">当前筛选没有匹配板块，请放宽条件。</td></tr>';
  document.querySelectorAll('tbody tr[data-district]').forEach(row=>row.addEventListener('click',()=>renderDetail(row.dataset.district)));
  $('#result-count').textContent=`${visible.length} 个板块 · 研究阶段`; $('#filter-summary').textContent=`${filters.zone==='all'?'全深圳':filters.zone==='baoan'?'宝安西部走廊':'光明片区'} · ${filters.home==='commodity'?'商品房':'人才房'} · ${filters.budget===999?'不限预算':filters.budget+' 万以内'} · ${filters.commute===999?'不限通勤':filters.commute+' 分钟内'}`; renderDetail(visible[0]?.id||'baoan-center');
}
[['zone-filter','zone'],['home-filter','home'],['budget-filter','budget'],['commute-filter','commute']].forEach(([id,key])=>$('#'+id).addEventListener('change',e=>{filters[key]=['budget','commute'].includes(key)?Number(e.target.value):e.target.value;renderTable();}));
$('#reset-filters').addEventListener('click',()=>{Object.assign(filters,{zone:'all',home:'commodity',budget:999,commute:999}); $('#zone-filter').value='all'; $('#home-filter').value='commodity'; $('#budget-filter').value='999'; $('#commute-filter').value='999'; renderTable();});
renderTable();

