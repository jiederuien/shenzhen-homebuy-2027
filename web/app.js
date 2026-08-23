const districts = [
  {id:'baoan-center',name:'宝安中心',zone:'成熟核心商品房',grade:'A',price:'约 5–6.5 万/㎡',liquidity:'强',risk:'总价敏感',position:'优先研究 · 成熟核心商品房',summary:'前海、南山外溢与宝安成熟城市界面叠加，核心优势不是“不会跌”，而是下行后更容易恢复。',tags:['就业可达性强','配套已兑现','稀缺性较好'],nextCheck:'按小区核对真实成交、楼龄、物业、噪音与同片区新房竞争。'},
  {id:'xixiang',name:'西乡',zone:'宝安西部过渡带',grade:'B+',price:'待补真实成交',liquidity:'中上',risk:'位置分化',position:'可研究 · 重点看通勤半径',summary:'承接宝安中心与西部生活走廊，靠近地铁、就业和成熟配套的房源更有韧性，外围则要折价。',tags:['过渡板块','地铁敏感','小区差异大'],nextCheck:'用到地铁站和目标工作地的实际通勤时间筛选，而不是只看行政区。'},
  {id:'fuyong',name:'福永',zone:'机场与西部产业带',grade:'B',price:'待补真实成交',liquidity:'中',risk:'噪音/供应',position:'审慎研究 · 先排除硬伤',summary:'机场、产业、地铁是变量，但必须确认就业能否沉淀为稳定居住需求，同时排查噪音、旧改和新增供应。',tags:['产业变量','机场噪音','供应核查'],nextCheck:'逐个小区核查噪音、旧改、地铁距离和近 12 个月成交。'},
  {id:'shajing',name:'沙井核心',zone:'低总价自住方向',grade:'B',price:'约 3–3.5 万/㎡*',liquidity:'中',risk:'可替代供应',position:'价格合适才买 · 自住优先',summary:'低总价和西部生活半径是优势，但二手房会与周边新房、松岗和光明形成竞争，不能为远期规划支付溢价。',tags:['低总价','以价换量','供应替代'],nextCheck:'确认总价差是否足够大，并比较同预算下光明、松岗和新房选项。'},
  {id:'guangming-core',name:'光明核心',zone:'产业兑现观察区',grade:'B+',price:'约 3.4–4 万/㎡*',liquidity:'中',risk:'兑现节奏',position:'可以研究 · 只挑核心',summary:'科学城与产业叙事需要经过“高收入就业—人口留下—购买力—二手接盘”链条，不能只凭规划买房。',tags:['科学城','产业兑现','人才房变量'],nextCheck:'核对就业人口、商业配套、通勤和保障房供应，再比较商品房折价。'},
  {id:'guangming-outer',name:'光明外围',zone:'高替代风险区域',grade:'C',price:'待补真实成交',liquidity:'偏弱',risk:'供应/流动性',position:'谨慎 · 除非折价足够大',summary:'产业距离、配套兑现和新房供应可能同时压制二手流动性，长期自住也要把通勤与生活成本算进去。',tags:['规划依赖','供应较多','流动性弱'],nextCheck:'先做“如果 5 年后换房，谁会接盘”的压力测试。'}
];

const $ = (selector) => document.querySelector(selector);
const body = $('#comparison-body');

const map = L.map('map', { zoomControl: true, attributionControl: true }).setView([22.64, 113.89], 11.2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const mapPoints = {
  'baoan-center': [22.553, 113.883],
  xixiang: [22.581, 113.862],
  fuyong: [22.652, 113.815],
  shajing: [22.746, 113.829],
  'guangming-core': [22.748, 113.935],
  'guangming-outer': [22.806, 113.892]
};
const markerLayers = new Map();
function markerColor(grade){ return grade.startsWith('A') ? '#2f806d' : grade.startsWith('B') ? '#c28a36' : '#c9634d'; }
districts.forEach(item => {
  const color = markerColor(item.grade);
  const marker = L.circleMarker(mapPoints[item.id], { radius: item.grade === 'A' ? 13 : 11, color: '#fff', weight: 3, fillColor: color, fillOpacity: .93 });
  marker.bindTooltip(`<strong>${item.name}</strong><br><span>${item.grade} · ${item.zone}</span>`, { direction: 'top', offset: [0, -8], opacity: .96 });
  marker.on('click', () => renderDetail(item.id));
  marker.addTo(map);
  markerLayers.set(item.id, marker);
});
L.marker([22.525, 113.93], { icon: L.divIcon({ className: 'map-label', html: '<span>南山 · 深圳湾 · 前海</span>', iconSize: [170, 22], iconAnchor: [85, 11] }) }).addTo(map);
L.polyline([[22.53,113.91],[22.58,113.87],[22.64,113.83],[22.75,113.83]], { color: '#4d8d7a', weight: 3, opacity: .55, dashArray: '7 8' }).addTo(map);
L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

function gradeClass(grade){ return grade.startsWith('A') ? 'grade-a' : grade.startsWith('B') ? 'grade-b' : 'grade-c'; }
function renderDetail(id){
  const item = districts.find(d => d.id === id) || districts[0];
  $('#detail-name').textContent = item.name;
  $('#detail-grade').textContent = item.grade;
  $('#detail-grade').className = `grade-badge ${gradeClass(item.grade)}-bg`;
  $('#detail-position').textContent = item.position;
  $('#detail-summary').textContent = item.summary;
  $('#detail-price').textContent = item.price;
  $('#detail-liquidity').textContent = item.liquidity;
  $('#detail-risk').textContent = item.risk;
  $('#detail-grade-copy').textContent = `${item.grade} · ${item.zone}`;
  $('#detail-next').textContent = item.nextCheck;
  $('#detail-tags').innerHTML = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
  document.querySelectorAll('.district').forEach(el => el.classList.toggle('selected', el.dataset.district === id));
  document.querySelectorAll('tbody tr').forEach(el => el.classList.toggle('active-row', el.dataset.district === id));
  markerLayers.forEach((marker, markerId) => marker.setStyle({ radius: markerId === id ? 16 : (districts.find(d => d.id === markerId).grade === 'A' ? 13 : 11), weight: markerId === id ? 5 : 3 }));
}

body.innerHTML = districts.map(item => `<tr data-district="${item.id}"><td>${item.name}</td><td><span class="table-grade ${gradeClass(item.grade)}">${item.grade}</span></td><td>${item.price.replace('*','')}</td><td>${item.liquidity}</td><td>${item.grade.startsWith('A') ? '优先研究' : item.grade === 'C' ? '谨慎/观望' : '核实价格'}</td></tr>`).join('');
document.querySelectorAll('[data-district]').forEach(el => el.addEventListener('click', () => renderDetail(el.dataset.district)));

const pathCopy = {
  commodity:{label:'适合：看重流动性与换房弹性',title:'买地段，也买退出权',copy:'商品房的核心价值是市场化流动性。预算允许时，宁可缩小面积，也优先保证就业可达性、成熟配套和二手接盘能力。',items:['核对真实成交，不用平台挂牌均价代替','测算月供压力与 8—10 年持有周期','检查楼龄、物业、噪音、户型和产权']},
  talent:{label:'适合：长期自住，优先降低居住成本',title:'买折价，但要读懂规则',copy:'人才房的优势是初始成本可能显著更低，代价是资格、转让、完全产权和退出安排受政策约束。先确认规则，再比较折价。',items:['核对资格、配售价格和项目官方文件','确认转让、回购、继承和完全产权安排','把换房时间表与退出限制放在一起测算']}
};
document.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.toggle('active', b === btn));
  const data = pathCopy[btn.dataset.path];
  $('#path-label').textContent = data.label; $('#path-title').textContent = data.title; $('#path-copy').textContent = data.copy;
  $('#path-checklist').innerHTML = data.items.map(item => `<li>${item}</li>`).join('');
}));

renderDetail('baoan-center');

