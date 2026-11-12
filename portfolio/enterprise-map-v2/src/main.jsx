import React, { useMemo, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlow, Background, Controls, Handle, MarkerType, Position } from '@xyflow/react';
import * as Tabs from '@radix-ui/react-tabs';
import {
  ArrowRight, ArrowUpRight, ChevronRight, Network, Database, Factory,
  Coins, Users, GitBranch, Search, CheckCircle2, Sparkles, Target,
  Route, ShieldCheck, ClipboardList, CircleDot,
  Layers3, Info, Workflow, Menu, X, Boxes
} from 'lucide-react';
import '@xyflow/react/dist/style.css';
import './styles.css';

const NAV = [
  { key: 'home', text: '全景首页', sub: 'OVERVIEW' },
  { key: 'map', text: '业务架构', sub: 'BUSINESS MAP' },
  { key: 'delivery', text: '项目治理', sub: 'DELIVERY OS' },
  { key: 'cases', text: '实战案例', sub: 'CASE STUDIES' }
];
const DOMAINS = [
  { id: 'sales', name: '销售', en: 'SALES', icon: 'sales', text: '从客户需求到订单履约', tint: 'blue' },
  { id: 'research', name: '研发', en: 'R&D', icon: 'research', text: '从需求到受控 BOM', tint: 'violet' },
  { id: 'purchase', name: '采购', en: 'PROCUREMENT', icon: 'purchase', text: '从采购需求到入库', tint: 'mint' },
  { id: 'production', name: '生产', en: 'MANUFACTURING', icon: 'production', text: '从计划到产品完工', tint: 'orange' },
  { id: 'warehouse', name: '仓储', en: 'WAREHOUSE', icon: 'warehouse', text: '从收发存到库存追溯', tint: 'cyan' },
  { id: 'finance', name: '财务', en: 'FINANCE', icon: 'finance', text: '从业务事实到财务结果', tint: 'indigo' }
];
const iconMap = { sales: Target, research: Layers3, purchase: ClipboardList, production: Factory, warehouse: Boxes, finance: Coins, company: Network };
const step = (name, role, system, input, output, rule, exception) => ({ name, role, system, input, output, rule, exception });
const FLOWS = {
  sales: [
    step('识别客户需求','销售 / 客户经理','CRM（候选）','客户线索、需求','商机及需求记录','确认真实需求及成功标准','信息缺漏、需求多次变更'),
    step('报价与合同','销售 / 技术','CRM / 报价平台（候选）','客户需求、价格规则','报价单、合同','价格权限、版本与审批必须可追溯','折扣越权、技术选型错误'),
    step('销售订单','商务 / 销售','ERP（候选）','已确认合同','销售订单','数量、交期、付款条件与版本一致','客户变更未同步'),
    step('交付与出库','仓储 / 物流','ERP / WMS（候选）','有效订单、发货通知','出库单、签收信息','区分单据审核、实物交接和正式交付','库存不足、分批出库、退货'),
    step('应收与开票','财务','ERP 财务（候选）','出库/交付与结算依据','应收、发票记录','收入、应收与开票的条件分别核验','金额不一致、跨期'),
    step('收款与核销','财务 / 资金','ERP / 资金系统（候选）','银行收款信息、应收','收款及核销记录','按客户、订单、发票建立可追溯关联','部分收款、跨单核销')
  ],
  research: [
    step('产品需求','产品 / 研发','PLM / 需求管理','市场和客户需求','需求清单','明确需求边界、优先级和责任人','需求描述不完整'),
    step('设计开发','研发','CAD / PLM','批准的需求','图纸、设计 BOM','设计版本与评审意见留痕','图纸与业务版本不一致'),
    step('BOM 发布','研发 / 工程','PLM → ERP（候选）','已审核设计 BOM','生产 BOM','物料、版本、生效条件需核验','替代料与生效日期冲突'),
    step('工程变更','研发 / 生产','PLM / ERP','变更申请','新版本及执行记录','区分在制、在库与未来订单范围','变更没有传递至下游')
  ],
  purchase: [
    step('采购需求','计划 / 采购','ERP / MRP','缺料及计划','采购申请','来源需求、数量和批准责任明确','重复采购'),
    step('询价比价','采购','SRM / ERP（候选）','申请与供应商资料','供应商与价格建议','价格、质量、交期必须可比','报价口径不一致'),
    step('采购订单','采购','ERP','已批准决策','采购订单','版本、交期、付款条款可追溯','变更未通知需求部门'),
    step('收货检验','仓储 / 品质','WMS / QMS / ERP','到货实物和订单','收货及检验记录','待检、合格、不合格库存区分','收货与订单不符'),
    step('应付结算','财务','ERP 财务','采购、收货、发票','应付与付款记录','单据匹配及差异处理依据完整','暂估与发票差异')
  ],
  production: [
    step('需求与排产','计划','ERP / APS','销售需求、产能','生产计划','需求、交期、资源协调','产能冲突'),
    step('工单与领料','车间 / 仓储','ERP / WMS','生产工单、有效 BOM','领料及物料批次','实际用料与计划差异可追溯','缺料、超领'),
    step('制造执行','生产 / 工艺','MES（候选）','工单和作业指导','工序执行记录','人员、设备、工序状态明确','返工、报废、停机'),
    step('检验与入库','品质 / 仓储','QMS / MES / ERP','完工品、检验结果','合格/不合格入库','检验放行与库存可用分开','未检先入')
  ],
  warehouse: [
    step('接收入库','仓库','WMS / ERP','采购收货、生产完工','入库记录','实物、来源单据、批次一致','重复入库'),
    step('库位与库存','仓库','WMS（候选）','已入库物料','批次、库位、结存','库龄及批次策略须按企业确认','账物位不一致'),
    step('拣货与出库','仓库 / 业务','ERP / WMS','已批准出库需求','拣货、出库单','责任、授权与实际交接清晰','错发、少发、跨批次'),
    step('盘点与调整','仓储 / 财务','ERP / WMS','实物盘点与系统库存','差异调整与审批','先查根因再处理库存差异','调整掩盖流程问题')
  ],
  finance: [
    step('业务事实','销售 / 采购 / 仓储','业务系统','合同、交付、入出库','有效业务事件','事实来源、状态及时间准确','业务发生但未录单'),
    step('往来核算','财务','ERP 财务','业务单据及发票','应收应付与余额','核销及账龄规则可追溯','账实差异'),
    step('成本归集','成本会计','ERP 成本','生产领料、完工、费用','成本分摊结果','成本对象与计价规则清楚','负库存、跨期'),
    step('凭证与结账','总账会计','ERP 总账','已核算业务及凭证','报表、期间结账','账账、账实、业务财务核对','差异未清就结账')
  ]
};
const COMPANY = [
  step('客户与市场','销售','CRM（候选）','需求及线索','已确认需求','需求可追溯','跨部门口径不一致'),
  step('产品与研发','研发','PLM（候选）','需求、设计','BOM 与技术资料','版本受控','工程变更断点'),
  step('供应与采购','采购','ERP / SRM（候选）','物料需求','供应与到货','供需匹配','缺料或重复采购'),
  step('制造与质量','生产','ERP / MES / QMS（候选）','计划、物料','完工与检验','工艺、质量追溯','工单、质量状态不一致'),
  step('交付与库存','仓储','ERP / WMS（候选）','成品、订单','出库与签收','库存与履约对应','错发与分批交付'),
  step('收款与经营','财务','ERP 财务（候选）','交付与结算依据','核算及资金结果','业财对账闭环','业务完成但账务未闭环')
];
const STAGES = [
  { n:'01', name:'识别经营问题', en:'DISCOVER', summary:'先判断真正需要解决的问题与经营价值。', task:'明确业务目标、问题影响范围、频率、损失与优先级，避免把“系统不好用”直接当需求。', output:'问题陈述 · 影响评估 · 成功指标', risk:'没有证据就马上采购或开发系统。', icon: Search },
  { n:'02', name:'业务调研', en:'RESEARCH', summary:'在现场还原 AS-IS 现状业务。', task:'访谈负责人和关键用户，沿着真实单据及岗位交接逐步走完流程，标记例外和待确认点。', output:'AS-IS 流程 · 责任清单 · 数据来源', risk:'把访谈讨论误当成正式批准的制度。', icon: ClipboardList },
  { n:'03', name:'识别根因', en:'DIAGNOSE', summary:'用结构化方法区别不同问题类型。', task:'区分制度、职责、流程、数据、技术和组织协作问题，检验因果关系与影响面。', output:'根因树 · 证据等级 · 候选改进点', risk:'把所有问题都归因于软件功能不够。', icon: GitBranch },
  { n:'04', name:'设计目标方案', en:'DESIGN', summary:'先做方案取舍，再确定系统与 AI。', task:'提出 TO-BE 流程并比较流程优化、配置、集成、自研和 AI 辅助的成本、风险与收益。', output:'TO-BE 流程 · 系统边界 · 方案对比', risk:'接口权限、数据质量和业务规则未验证就承诺自动化。', icon: Layers3 },
  { n:'05', name:'项目实施', en:'DELIVER', summary:'以可控范围、资源和责任推进落地。', task:'明确项目章程、RACI、进度、资源、预算、变更和风险，用阶段验收组织协同。', output:'实施计划 · 测试记录 · 培训与上线准备', risk:'IT 自己完成系统，却没有关键用户共同验收。', icon: Workflow },
  { n:'06', name:'验收与复盘', en:'VALIDATE', summary:'用业务结果而非上线动作证明成功。', task:'核对成功指标、异常处理、业务满意度及运行稳定性，保留可复查的结论与后续改进。', output:'验收证据 · 效果对比 · 复盘记录', risk:'把功能上线等同于业务价值已经实现。', icon: CheckCircle2 }
];
const DIAGNOSIS = [
  { title:'系统上线后，业务部门不认可', category:'需求 / 流程 / 组织', inspect:'检查关键用户是否参与 AS-IS/TO-BE 评审，验收责任与业务培训是否建立。', plan:'重新识别具体反对原因，分段交付并由业务方共同验证。' },
  { title:'销售订单、仓库出库、财务账对不上', category:'单据 / 规则 / 数据', inspect:'逐笔核对行级关联、版本、时间事件、分批履约、核销与接口失败。', plan:'先恢复业务事实链，再评估需要流程规则或系统集成改造。' },
  { title:'AI 试点热闹，但始终没有效果', category:'业务场景 / 数据 / 权限', inspect:'确认高频任务、数据准确性、可调用接口、人工复核点和业务指标。', plan:'选择规则清楚的小场景试点，验证节省时间与错误率后再扩大。' }
];
const CASES = [
  { id:'after', number:'CASE / 01', tag:'流程方案已梳理 · 业务验收待确认', title:'售后以旧换新：打通新件出库与旧件回收', lead:'跨越售后、仓库与财务的业务流程，单一 ERP 视角无法展示所有责任与异常。', area:'售后 / 库存 / 财务', data:[
    ['起点 / 业务问题','换件需求、审批、出库、旧件暂存、回收入库与核销缺少统一可视化路径。'],
    ['解决思路','拆分业务场景、角色责任、系统边界、输入输出和异常；对国内及海外分支分别标记待确认。'],
    ['实现手段','先用脱敏流程模型和可编辑流程图讨论；系统集成、自动台账和财务核销均不能当作已上线成果。'],
    ['证据与结果','已形成流程设计和争议清单；业务部门逐节点确认与生产系统实施结果尚无完成证据。']
  ]},
  { id:'sales', number:'CASE / 02', tag:'教学模型 · 不代表已实施项目', title:'销售到回款：用一笔订单串起业务与财务', lead:'将客户需求、合同、销售订单、交付、应收及收款核销组织成可追溯业务链。', area:'销售 / 仓储 / 财务', data:[
    ['起点 / 业务问题','不同部门单据看似各自完成，但整体履约与资金闭环难以一眼追踪。'],
    ['解决思路','用统一的业务对象和行级引用关系穿透订单、分批出库、开票和部分回款。'],
    ['实现手段','将岗位、流程动作、ERP/CRM/WMS 候选分工和数据流放到一套关联模型里展示。'],
    ['证据与结果','目前为合成教学示例，未实际接入企业数据，未计算企业真实收益指标。']
  ]}
];
const PERSPECTIVES = [
  { id:'business', title:'业务', icon: Route },
  { id:'role', title:'岗位', icon: Users },
  { id:'system', title:'系统', icon: Boxes },
  { id:'data', title:'数据', icon: Database },
  { id:'improve', title:'改进', icon: Sparkles }
];
function scrollTop(){ if (typeof window !== 'undefined') window.scrollTo({ top:0, behavior:'smooth' }); }
function Pill({ children, tone='muted', icon:Icon }){return <span className={'pill pill-'+tone}>{Icon?<Icon size={13}/>:null}{children}</span>;}
function OutlineButton({children,onClick,className=''}){return <button type="button" className={'btn btn-outline '+className} onClick={onClick}>{children}</button>;}
function GlowButton({children,onClick}){return <button type="button" className="btn btn-glow" onClick={onClick}>{children}<ArrowUpRight size={17}/></button>;}
function SectionTitle({number,kicker,title,description,action}){return <div className="section-title"><div><div className="section-kicker"><span>{number}</span><span className="kicker-line"></span>{kicker}</div><h2>{title}</h2>{description?<p>{description}</p>:null}</div>{action}</div>;}
function SiteHeader({page,onPage}){
  const [mobile,setMobile]=useState(false);
  const navigate=(key)=>{onPage(key);setMobile(false);scrollTop();};
  return <header className="site-header">
    <div className="brand" onClick={()=>navigate('home')} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')navigate('home');}}>
      <div className="brand-symbol"><Network size={21} strokeWidth={2.1}/></div>
      <span className="brand-name">ENTR<span className="brand-dot">.</span>OS</span><span className="brand-caption">企业数字化架构</span>
    </div>
    <nav className={'desktop-nav'+(mobile?' mobile-open':'')} aria-label="一级导航">
      {NAV.map(n=><button type="button" key={n.key} onClick={()=>navigate(n.key)} className={page===n.key?'nav-active':''}><span>{n.text}</span><small>{n.sub}</small></button>)}
    </nav>
    <div className="header-meta"><span className="live-dot"/><span>PORTFOLIO / V2</span><Pill tone="light">交互演示</Pill></div>
    <button className="menu-toggle" aria-label={mobile?'关闭菜单':'展开菜单'} aria-expanded={mobile} onClick={()=>setMobile(!mobile)}>{mobile?<X size={23}/>:<Menu size={23}/>}</button>
  </header>;
}
function HeroDiagram(){
 return <div className="hero-visual" aria-hidden="true">
   <div className="hero-visual-head"><span><CircleDot size={13}/> LIVE ARCHITECTURE</span><span className="hero-visual-corner">▤</span></div>
   <div className="hero-map">
      <span className="hero-map-glow"/>
      <div className="hero-beam b1"/><div className="hero-beam b2"/><div className="hero-beam b3"/>
      <div className="hero-float hf1"><span className="visual-icon vi-blue"><Target size={18}/></span><div><strong>业务价值</strong><small>BUSINESS VALUE</small></div></div>
      <div className="hero-float hf2"><span className="visual-icon vi-purple"><Workflow size={18}/></span><div><strong>流程治理</strong><small>PROCESS DESIGN</small></div></div>
      <div className="hero-float hf3"><span className="visual-icon vi-mint"><Database size={18}/></span><div><strong>系统架构</strong><small>SYSTEM / DATA</small></div></div>
      <div className="hero-core"><div className="core-ring"><Network size={42}/></div><div className="core-label">END TO END</div><div className="core-caption">数字化闭环</div></div>
   </div>
   <div className="hero-visual-foot"><span>BUSINESS ↔ PROCESS ↔ SYSTEM</span><span className="visual-bars"><i/><i/><i/><i/><i/></span></div>
 </div>;
}
function HomePage({onPage,onDomain}){
 return <>
  <section className="hero wrap">
   <div className="hero-copy">
     <div className="eyebrow"><span className="tiny-square"/> ENTERPRISE ARCHITECTURE · DIGITAL TRANSFORMATION</div>
     <h1>不只看一套系统。<br/><em>看懂一家企业</em><br/>如何运转。</h1>
     <p className="hero-subtitle">从经营痛点识别，到端到端业务设计、系统能力匹配与项目交付。用一张可以不断深入的地图，表达企业数字化的全局思考。</p>
     <div className="hero-ctas"><GlowButton onClick={()=>onPage('map')}>探索企业业务地图</GlowButton><OutlineButton onClick={()=>onPage('delivery')}>查看项目方法论 <ArrowRight size={15}/></OutlineButton></div>
     <div className="hero-notes"><span><span className="mini-check">✓</span> 业务架构为先</span><span><span className="mini-check">✓</span> 项目管理保障落地</span><span><span className="mini-check">✓</span> 用证据验证价值</span></div>
   </div>
   <HeroDiagram/>
  </section>
  <section className="wrap stats-band" aria-label="作品演示结构">
   <div><strong>06</strong><span>核心业务领域</span></div><div><strong>05</strong><span>节点观察视角</span></div><div><strong>06</strong><span>项目治理阶段</span></div><div className="stats-note"><Info size={15}/> 以上是演示内容规模，不是企业实际业绩数据。</div>
  </section>
  <section className="wrap content-section">
   <SectionTitle number="01" kicker="THE OPERATING MODEL" title={<>从业务出发，<span className="headline-highlight">一层层看见全局。</span></>} description="这不是六个互不相干的系统介绍，而是一套可以追踪业务、岗位、单据、规则和改进机会的关系网络。" action={<button className="text-link" onClick={()=>onPage('map')}>进入业务架构 <ArrowUpRight size={17}/></button>}/>
   <div className="bento-grid">
     <button className="bento-tile bento-main" onClick={()=>onPage('map')}><span className="bento-index">01 / BUSINESS ARCHITECTURE</span><div className="bento-network"><div className="mini-node">客户需求</div><span>→</span><div className="mini-node">订单交付</div><span>→</span><div className="mini-node active">财务闭环</div></div><h3>端到端业务价值流</h3><p>从客户需求出发，追踪一笔业务如何穿越多个岗位和系统，最终形成经营结果。</p><span className="tile-link">打开交互地图 <ArrowUpRight size={15}/></span></button>
     <button className="bento-tile bento-side" onClick={()=>onPage('delivery')}><span className="bento-index">02 / DELIVERY GOVERNANCE</span><div className="bento-number">06<span> / PHASES</span></div><h3>从痛点到交付</h3><p>调研、根因、方案、实施、验收，每一步都要有责任和证据。</p><span className="tile-link">查看方法论 <ArrowUpRight size={15}/></span></button>
     <button className="bento-tile bento-small" onClick={()=>onPage('map')}><div className="bento-illustration"><Layers3 size={31}/><span>ERP</span><span>MES</span><span>CRM</span></div><h3>跨系统协同</h3><p>不以软件为中心，而以业务能力和数据责任划定边界。</p></button>
     <button className="bento-tile bento-small alt" onClick={()=>onPage('cases')}><div className="bento-illustration"><ShieldCheck size={34}/><span className="verified-mark">✓ 可核验</span></div><h3>实战与证据</h3><p>清楚区分已完成、候选方案与等待业务验收的事项。</p></button>
   </div>
  </section>
  <section className="wrap content-section domains-section">
    <SectionTitle number="02" kicker="EXPLORE THE BUSINESS" title="选择一个业务，继续向下探索。" description="每个业务域都连接着上下游部门，不只是一个孤立的软件模块。"/>
    <div className="domain-grid">{DOMAINS.map(d=>{const Icon=iconMap[d.icon];return <button key={d.id} className={'domain-tile domain-'+d.tint} onClick={()=>onDomain(d.id)}><span className="domain-icon"><Icon size={25}/></span><span className="domain-en">{d.en}</span><strong>{d.name}</strong><small>{d.text}</small><ArrowUpRight className="domain-arrow" size={18}/></button>})}</div>
  </section>
  <section className="wrap cta-section"><div><div className="eyebrow">HOW I APPROACH A PROBLEM</div><h2>真正的数字化，不是把流程搬进系统。</h2><p>是看清为什么要改变、改变什么，以及如何证明改变有效。</p></div><GlowButton onClick={()=>onPage('delivery')}>探索项目治理路径</GlowButton></section>
 </>;
}
function ArchitectureNode({data}){
  const Icon=iconMap[data.icon]||Network;
  return <div className={'architecture-node'+(data.active?' selected':'')+' '+(data.company?' company-node':'')}>
   <Handle type="target" position={Position.Left} isConnectable={false} className="flow-handle"/>
   <div className="architecture-top"><span className="architecture-icon"><Icon size={19}/></span><span className="architecture-index">{data.index}</span></div>
   <strong>{data.label}</strong><small>{data.role}</small><div className="node-foot"><span>{data.systemLabel}</span><ChevronRight size={13}/></div>
   <Handle type="source" position={Position.Right} isConnectable={false} className="flow-handle"/>
  </div>;
}
const NODE_TYPES={architecture:ArchitectureNode};
const FIELD_LABELS={
 business:[['输入', 'input'],['业务动作', 'name'],['输出', 'output'],['关键规则', 'rule']],
 role:[['负责/协同岗位','role'],['输入交接','input'],['输出交接','output'],['责任核验','responsibility']],
 system:[['候选承载系统','system'],['实际业务能力','name'],['系统边界','authority'],['系统关注点','exception']],
 data:[['上游输入对象','input'],['下游输出对象','output'],['追溯关联','trace'],['例外情形','exception']],
 improve:[['风险或断点','exception'],['根因方向','cause'],['改进方式','method'],['验收依据','accept']]
};
const EXTRA={
 responsibility:'岗位与最终审批权应由企业流程负责人确认。',
 authority:'系统能力及权威数据来源需在实际企业核对。',
 trace:'核对业务对象 ID、来源单据、版本、状态和关联行。',
 cause:'先区分制度、职责、流程、数据还是技术问题。',
 method:'比较流程优化、系统配置、接口集成或 AI 辅助。',
 accept:'由业务方确认规则，用受控样例验证执行结果。'
};
function BusinessMap({ initialDomain='company' }){
 const [domain,setDomain]=useState(initialDomain);
 const [selected,setSelected]=useState(initialDomain+'-0');
 const steps=domain==='company'?COMPANY:FLOWS[domain];
 const domainInfo=DOMAINS.find(d=>d.id===domain);
 const selectedIndex=Number((selected.split('-').pop()))||0;
 const safeIndex=Math.min(selectedIndex,steps.length-1);
 const current=steps[safeIndex];
 const domainId=domain==='company'?'company':domain;
 const nodes=useMemo(()=>steps.map((s,i)=>({
  id:domainId+'-'+i, type:'architecture', position:{x:i*275+35,y:160+((i%2===0)?0:32)},
  draggable:false, selectable:true,
  data:{label:s.name,role:s.role,index:String(i+1).padStart(2,'0'),active:i===safeIndex,icon:domain==='company'?DOMAINS[i]?.id:'company',company:domain==='company',systemLabel:s.system}
 })),[domainId,steps,safeIndex,domain]);
 const edges=useMemo(()=>steps.slice(0,-1).map((s,i)=>({
   id:'edge-'+i,source:domainId+'-'+i,target:domainId+'-'+(i+1),type:'smoothstep',
   animated:i===safeIndex-1||i===safeIndex,
   style:{stroke:i===safeIndex-1||i===safeIndex?'#75c8f5':'#6882a8',strokeWidth:2},
   markerEnd:{type:MarkerType.ArrowClosed,color:'#78b8dd',width:17,height:17}
 })),[domainId,steps,safeIndex]);
 const onSelectDomain=(d)=>{setDomain(d);setSelected(d+'-0');};
 const onNodeClick=useCallback((_,n)=>setSelected(n.id),[]);
 return <main className="wrap inner-page map-page">
  <div className="inner-hero"><div className="eyebrow"><span className="tiny-square"/> BUSINESS ARCHITECTURE / INTERACTIVE MAP</div><h1>把企业业务，<em>连接起来。</em></h1><p>先看端到端价值流，再逐层穿透岗位、系统、数据和业务断点。点击节点，查看每一步的职责与逻辑。</p></div>
  <div className="map-toolbar"><div className="domain-pills"><button className={domain==='company'?'active':''} onClick={()=>onSelectDomain('company')}><Network size={15}/> 企业全景</button>{DOMAINS.map(d=><button key={d.id} className={domain===d.id?'active':''} onClick={()=>onSelectDomain(d.id)}>{d.name}</button>)}</div><Pill tone="mint" icon={CircleDot}>交互式画布</Pill></div>
  <div className="map-layout">
   <div className="map-canvas-card">
     <div className="canvas-title"><div><span className="eyebrow">ARCHITECTURE VIEW</span><h2>{domain==='company'?'典型制造业 · 跨职能价值链':domainInfo.name+' · 端到端业务流程'}</h2><small>{domain==='company'?'这是简化的示意价值流，不代表各业务在所有企业都线性执行。':'支持拖动画布、滚轮缩放及单击节点查看详情。'}</small></div><span className="map-count">{String(steps.length).padStart(2,'0')} NODES</span></div>
     <div className="flow-stage">
       <ReactFlow key={domainId} nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} onNodeClick={onNodeClick}
         fitView fitViewOptions={{padding:0.2}} minZoom={0.3} maxZoom={1.8}
         nodesDraggable={false} nodesConnectable={false} elementsSelectable={true}
         proOptions={{hideAttribution:false}} >
           <Background variant="dots" gap={23} size={1.3} color="#2a405a"/>
           <Controls showInteractive={false} className="flow-controls"/>
       </ReactFlow>
     </div>
     <div className="canvas-caption"><span><CircleDot size={13}/> 点击任意节点查看细节</span><span>滚轮缩放 · 拖动画布 · 右下角按钮调整视图</span></div>
   </div>
   <div className="inspector">
     <div className="inspector-heading"><span className="inspector-overline"><span className="pulse-spot"/> NODE INSPECTOR / {String(safeIndex+1).padStart(2,'0')}</span><h3>{current.name}</h3><p>{current.role} · {domain==='company'?'跨领域业务视角':domainInfo.name+'业务'}</p></div>
     <Tabs.Root defaultValue="business" key={domainId+'-'+safeIndex} className="inspector-tabs">
      <Tabs.List aria-label="节点观察视角" className="inspector-tablist">{PERSPECTIVES.map(p=>{const Icon=p.icon;return <Tabs.Trigger key={p.id} value={p.id}><Icon size={14}/><span>{p.title}</span></Tabs.Trigger>})}</Tabs.List>
      {PERSPECTIVES.map(p=><Tabs.Content key={p.id} value={p.id} className="inspector-content"><div className="fields">{FIELD_LABELS[p.id].map(([label,key])=><div className="field" key={label}><span>{label}</span><strong>{current[key]||EXTRA[key]}</strong></div>)}</div>{p.id==='improve'?<div className="inspector-advice"><Sparkles size={18}/><span>建议方案必须有业务责任人确认，不能因 AI 推断而直接上线。</span></div>:null}</Tabs.Content>)}
     </Tabs.Root>
     <div className="inspector-foot"><ShieldCheck size={16}/> 结构化示例 · 非企业实时数据</div>
   </div>
  </div>
  <div className="map-under"><div><Workflow size={23}/><strong>从一条业务，追到整个系统网络。</strong><p>每条连接都应有业务含义、上下游对象和可验证的关联关系，而不是为了好看随意连线。</p></div><div><Database size={23}/><strong>数据可信，流程才可能真正闭环。</strong><p>流程图只是表达方式；系统的实际配置、单据状态与财务结果仍以权威系统核实为准。</p></div></div>
 </main>;
}
function DeliveryPage(){
 const [phase,setPhase]=useState(0); const [issue,setIssue]=useState(0);
 const active=STAGES[phase],Icon=active.icon,dx=DIAGNOSIS[issue];
 return <main className="wrap inner-page delivery-page">
  <div className="inner-hero"><div className="eyebrow"><span className="tiny-square"/> PROJECT DELIVERY OPERATING SYSTEM</div><h1>从业务痛点，<em>走到可验证的成果。</em></h1><p>项目管理不是单纯排进度，而是让需求、责任、成本、风险与验收形成完整闭环。</p></div>
  <section className="delivery-section">
    <SectionTitle number="01" kicker="THE DELIVERY LOOP" title="数字化项目六阶段" description="点击阶段，查看具体分析动作、交付物与最容易忽视的风险。"/>
    <div className="stage-track">{STAGES.map((s,i)=>{const I=s.icon;return <button key={s.n} onClick={()=>setPhase(i)} className={'stage-item'+(phase===i?' active':'')}><span className="stage-number">{s.n}</span><span className="stage-icon"><I size={22}/></span><strong>{s.name}</strong><small>{s.en}</small></button>})}</div>
    <div className="stage-detail"><div className="stage-detail-major"><div className="eyebrow">PHASE {active.n} / {active.en}</div><div className="stage-detail-heading"><span className="stage-big-icon"><Icon size={29}/></span><div><h3>{active.name}</h3><p>{active.summary}</p></div></div><div className="stage-task">{active.task}</div><div className="stage-output"><CheckCircle2 size={17}/><span><strong>阶段交付</strong>{active.output}</span></div></div><div className="stage-detail-risk"><span>RISK / 常见误区</span><h4>哪些事情，不能想当然？</h4><p>{active.risk}</p><span className="risk-marker">!</span></div></div>
  </section>
  <section className="diagnosis-section">
    <SectionTitle number="02" kicker="ROOT CAUSE THINKING" title="一个问题，可能根本不是系统问题。" description="不要在听到痛点时立刻采购系统：先区分制度、流程、岗位、数据和技术。"/>
    <div className="diagnosis-wrap"><div className="diagnosis-list">{DIAGNOSIS.map((x,i)=><button key={i} className={issue===i?'active':''} onClick={()=>setIssue(i)}><span className="dia-index">SCENARIO 0{i+1}</span><strong>{x.title}</strong><span>{x.category}</span><ArrowUpRight size={18}/></button>)}</div><div className="diagnosis-result"><Pill tone="mint" icon={CircleDot}>候选诊断方法</Pill><h3>{dx.title}</h3><div><span>先做什么调查？</span><p>{dx.inspect}</p></div><div><span>如何推动下一步？</span><p>{dx.plan}</p></div><small><Info size={13}/> 示例是分析框架，不是某家企业已验证的根因结论。</small></div></div>
  </section>
  <div className="bottom-quote"><div className="quote-mark">“</div><p>一个项目成功与否，最终不是看系统上线了没有，<br/><strong>而是看业务问题有没有真正解决。</strong></p><span>FROM SOFTWARE GO-LIVE TO BUSINESS OUTCOME</span></div>
 </main>;
}
function CasesPage(){
 const [caseId,setCaseId]=useState('after');
 const c=CASES.find(x=>x.id===caseId)||CASES[0];
 return <main className="wrap inner-page cases-page">
  <div className="inner-hero"><div className="eyebrow"><span className="tiny-square"/> CASE STUDIES / EVIDENCE FIRST</div><h1>方法论要有方向，<em>案例要有证据。</em></h1><p>一条业务链是如何识别、拆解和改进的？这里优先展示可披露的分析过程，并严格区分实际成果与尚未验收的方案。</p></div>
  <div className="case-selector">{CASES.map(x=><button key={x.id} className={x.id===caseId?'active':''} onClick={()=>setCaseId(x.id)}><span>{x.number}</span><strong>{x.title}</strong><small>{x.area}</small><ArrowUpRight size={18}/></button>)}</div>
  <div className="case-hero"><div><span className="eyebrow">{c.number} / FIELD NOTES</span><h2>{c.title}</h2><p>{c.lead}</p><Pill tone="amber" icon={Info}>{c.tag}</Pill></div><div className="case-hero-symbol"><Network size={88} strokeWidth={.8}/><div className="case-orbit"/></div></div>
  <div className="case-story">{c.data.map(([title,body],i)=><div className="story-row" key={title}><span className="story-num">0{i+1}</span><div><strong>{title}</strong><p>{body}</p></div><CircleDot size={15}/></div>)}</div>
  <div className="case-note"><ShieldCheck size={20}/><p>本公开演示没有任何客户信息、交易明细或公司内部原始数据；对未完成的系统接入、业务验收和收益指标不会虚报。</p></div>
 </main>;
}
function Footer({onPage}){return <footer className="site-footer"><div className="wrap footer-content"><div><div className="footer-brand"><Network size={23}/><strong>ENTR.OS</strong></div><p>以企业业务为原点，建立值得信任的数字化能力。</p></div><div className="footer-links">{NAV.map(n=><button key={n.key} onClick={()=>{onPage(n.key);scrollTop()}}>{n.text}</button>)}</div><div className="footer-end">© 2026 · 企业数字化全景演示<br/>合成结构 / 不连接真实业务系统</div></div></footer>;}
function App(){
 const [page,setPage]=useState('home');
 const [initialDomain,setInitialDomain]=useState('company');
 const navigate=(p)=>{setPage(p);scrollTop();};
 const goDomain=(d)=>{setInitialDomain(d);navigate('map');};
 return <div className="site"><SiteHeader page={page} onPage={navigate}/>
  {page==='home'?<HomePage onPage={navigate} onDomain={goDomain}/>:page==='map'?<BusinessMap key={initialDomain} initialDomain={initialDomain}/>:page==='delivery'?<DeliveryPage/>:<CasesPage/>}
  <Footer onPage={navigate}/>
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
