const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE_KEY = 'satmythuat-pwa-v1';
const DENSITY = 0.00785;
const materialOptions = [
  {value:'box40x80x2', label:'Hộp 40×80×2', kgm:3.6424},
  {value:'box20x40x1.4', label:'Hộp 20×40×1,4', kgm:1.2573},
  {value:'square10', label:'Vuông đặc 10×10', kgm:0.7850},
  {value:'square12', label:'Vuông đặc 12×12', kgm:1.1304},
  {value:'square14', label:'Vuông đặc 14×14', kgm:1.5386},
  {value:'square15', label:'Vuông đặc 15×15', kgm:1.7663},
  {value:'square16', label:'Vuông đặc 16×16', kgm:2.0096},
  {value:'square18', label:'Vuông đặc 18×18', kgm:2.5434},
  {value:'square20', label:'Vuông đặc 20×20', kgm:3.1400},
  {value:'round6', label:'Tròn đặc Ø6', kgm:0.2220},
  {value:'round8', label:'Tròn đặc Ø8', kgm:0.3946},
  {value:'round10', label:'Tròn đặc Ø10', kgm:0.6165},
  {value:'round12', label:'Tròn đặc Ø12', kgm:0.8870},
  {value:'round14', label:'Tròn đặc Ø14', kgm:1.2080},
  {value:'round16', label:'Tròn đặc Ø16', kgm:1.5780},
  {value:'round18', label:'Tròn đặc Ø18', kgm:1.9970},
  {value:'round20', label:'Tròn đặc Ø20', kgm:2.4660},
  {value:'flat15x3', label:'La 15×3', kgm:0.3533},
  {value:'flat20x3', label:'La 20×3', kgm:0.4710},
  {value:'flat25x3', label:'La 25×3', kgm:0.5888},
  {value:'flat30x3', label:'La 30×3', kgm:0.7065},
  {value:'flat40x3', label:'La 40×3', kgm:0.9420},
  {value:'flat50x3', label:'La 50×3', kgm:1.1775},
  {value:'flat60x3', label:'La 60×3', kgm:1.4130},
  {value:'flat70x3', label:'La 70×3', kgm:1.6485},
  {value:'custom', label:'Tự nhập kg/m', kgm:0}
];
const sampleData = {
  straight: [
    {name:'Tay vịn', length:2950, qty:1, material:'box40x80x2', kgm:3.6424},
    {name:'Thanh ngang khung', length:2850, qty:2, material:'box20x40x1.4', kgm:1.2573},
    {name:'Thanh đứng khung', length:760, qty:2, material:'box20x40x1.4', kgm:1.2573},
    {name:'Chân', length:85, qty:3, material:'custom', kgm:0},
    {name:'Thanh nối khung – tay vịn', length:60, qty:3, material:'custom', kgm:0}
  ],
  bent: [],
  accessories: []
};
let state = loadState();
let drawingObjectUrl = null, overlayObjectUrl = null, deferredInstall = null, toastTimer = null;

function clone(v){return JSON.parse(JSON.stringify(v));}
function loadState(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY));if(v&&v.straight&&v.bent&&v.accessories)return v;}catch(e){}return clone(sampleData);}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));$('#saveState').innerHTML='<i></i> Đã lưu trên máy';}catch(e){$('#saveState').innerHTML='<i style="background:#d59b45"></i> Không lưu được';}}
function fmt(n,d=2){return Number(n||0).toLocaleString('vi-VN',{minimumFractionDigits:d,maximumFractionDigits:d});}
function kgmFor(material){return (materialOptions.find(x=>x.value===material)||{}).kgm||0;}
function materialSelect(value){return `<select class="material-select" data-field="material">${materialOptions.map(m=>`<option value="${m.value}" ${m.value===value?'selected':''}>${m.label}</option>`).join('')}</select>`;}
function rowInput(field,value,cls='num-input',type='number',step='1'){return `<input class="${cls}" data-field="${field}" type="${type}" ${type==='number'?`min="0" step="${step}"`:''} value="${escapeHtml(value??'')}">`;}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function rowHtml(row, index, type){
  if(type==='straight')return `<tr data-index="${index}"><td>${rowInput('name',row.name,'name-input','text')}</td><td>${rowInput('length',row.length,'num-input')}</td><td>${rowInput('qty',row.qty,'num-input')}</td><td>${materialSelect(row.material)}</td><td>${rowInput('kgm',row.kgm,'kg-input','number','0.0001')}</td><td><button class="delete-row" title="Xóa dòng" aria-label="Xóa dòng">×</button></td></tr>`;
  if(type==='bent')return `<tr data-index="${index}"><td>${rowInput('name',row.name,'name-input','text')}</td><td>${rowInput('center',row.center,'num-input')}</td><td>${rowInput('blank',row.blank,'num-input')}</td><td>${rowInput('qty',row.qty,'num-input')}</td><td>${rowInput('kgm',row.kgm,'kg-input','number','0.0001')}</td><td><button class="delete-row" title="Xóa dòng" aria-label="Xóa dòng">×</button></td></tr>`;
  return `<tr data-index="${index}"><td>${rowInput('name',row.name,'name-input','text')}</td><td>${rowInput('qty',row.qty,'num-input')}</td><td>${rowInput('unitKg',row.unitKg,'kg-input','number','0.001')}</td><td class="row-calc">${fmt((+row.qty||0)*(+row.unitKg||0))} kg</td><td><button class="delete-row" title="Xóa dòng" aria-label="Xóa dòng">×</button></td></tr>`;
}
function renderRows(){
  $('#straightRows').innerHTML=state.straight.map((r,i)=>rowHtml(r,i,'straight')).join('');
  $('#bentRows').innerHTML=state.bent.map((r,i)=>rowHtml(r,i,'bent')).join('');
  $('#accessoryRows').innerHTML=state.accessories.map((r,i)=>rowHtml(r,i,'accessory')).join('');
  updateTotals();
}
function updateTotals(){
  const s=state.straight.reduce((a,r)=>{const m=(+r.length||0)*(+r.qty||0)/1000;return {m:a.m+m,kg:a.kg+m*(+r.kgm||0)}},{m:0,kg:0});
  const b=state.bent.reduce((a,r)=>{const center=(+r.center||0)*(+r.qty||0)/1000;const blank=((+r.blank||0)>0?+r.blank:+r.center||0)*(+r.qty||0)/1000;return {m:a.m+center,blank:a.blank+blank,kg:a.kg+blank*(+r.kgm||0)}},{m:0,blank:0,kg:0});
  const ac=state.accessories.reduce((a,r)=>({count:a.count+(+r.qty||0),kg:a.kg+(+r.qty||0)*(+r.unitKg||0)}),{count:0,kg:0});
  $('#totalMeters').textContent=fmt(s.m+b.m);$('#straightMeters').textContent=`${fmt(s.m)} m`;$('#bentMeters').textContent=`${fmt(b.m)} m`;
  $('#straightKg').textContent=`${fmt(s.kg)} kg`;$('#bentKg').textContent=`${fmt(b.kg)} kg`;$('#totalKg').textContent=fmt(s.kg+b.kg);
  $('#straightTotalLine').textContent=`${fmt(s.m)} m`;$('#straightTotalWeight').textContent=`${fmt(s.kg)} kg`;
  $('#bentTotalLine').textContent=`${fmt(b.m)} m tâm`;$('#bentTotalWeight').textContent=`${fmt(b.kg)} kg`;
  $('#accessoryCount').textContent=`${fmt(ac.count,0)} cái`;$('#accessoryKg').textContent=`${fmt(ac.kg)} kg`;
  $$('#accessoryRows tr').forEach((tr,i)=>{const cell=$('td:nth-child(4)',tr);if(cell)cell.textContent=`${fmt((+state.accessories[i].qty||0)*(+state.accessories[i].unitKg||0))} kg`;});
}
function addRow(type){if(type==='straight')state.straight.push({name:'Thanh mới',length:0,qty:1,material:'custom',kgm:0});if(type==='bent')state.bent.push({name:'Hoa văn mới',center:0,blank:0,qty:1,kgm:0});if(type==='accessories')state.accessories.push({name:'Hoa / lá',qty:1,unitKg:0});renderRows();persist();}
function handleTableInput(e){const tr=e.target.closest('tr');if(!tr)return;const table=e.target.closest('tbody');const type=table.id==='straightRows'?'straight':table.id==='bentRows'?'bent':'accessories';const row=state[type][+tr.dataset.index];if(!row)return;const field=e.target.dataset.field;if(!field)return;let value=e.target.value;if(e.target.type==='number')value=value===''?0:Number(value);if(field==='material'){row.material=value;row.kgm=kgmFor(value);const kgInput=$('[data-field="kgm"]',tr);if(kgInput)kgInput.value=row.kgm||'';}else row[field]=value;updateTotals();persist();}
function handleTableClick(e){const btn=e.target.closest('.delete-row');if(!btn)return;const tr=btn.closest('tr');const body=tr.closest('tbody');const type=body.id==='straightRows'?'straight':body.id==='bentRows'?'bent':'accessories';state[type].splice(+tr.dataset.index,1);renderRows();persist();}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400);}
function showScreen(name){$$('.screen').forEach(s=>s.classList.toggle('active',s.id===`screen-${name}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.screen===name));window.scrollTo({top:0,behavior:'smooth'});}

$('#straightRows').addEventListener('input',handleTableInput);$('#straightRows').addEventListener('change',handleTableInput);$('#straightRows').addEventListener('click',handleTableClick);
$('#bentRows').addEventListener('input',handleTableInput);$('#bentRows').addEventListener('change',handleTableInput);$('#bentRows').addEventListener('click',handleTableClick);
$('#accessoryRows').addEventListener('input',handleTableInput);$('#accessoryRows').addEventListener('change',handleTableInput);$('#accessoryRows').addEventListener('click',handleTableClick);
$('#addStraight').addEventListener('click',()=>addRow('straight'));$('#addBent').addEventListener('click',()=>addRow('bent'));$('#addAccessory').addEventListener('click',()=>addRow('accessories'));
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));
$('#resetBtn').addEventListener('click',()=>{if(confirm('Khôi phục dữ liệu mẫu? Các dòng anh đã nhập trên thiết bị sẽ bị thay thế.')){state=clone(sampleData);renderRows();persist();toast('Đã khôi phục dữ liệu mẫu.');}});
$('#toggleFormula').addEventListener('click',()=>{const box=$('#formulaContent'),open=box.hidden;box.hidden=!open;$('#toggleFormula').textContent=open?'Thu gọn⌃':'Mở chi tiết⌄';$('#toggleFormula').setAttribute('aria-expanded',String(open));});

function clearDrawingUrls(){if(drawingObjectUrl)URL.revokeObjectURL(drawingObjectUrl);drawingObjectUrl=null;}
$('#drawingInput').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;clearDrawingUrls();drawingObjectUrl=URL.createObjectURL(file);$('#sourceImage').hidden=true;$('#overlayImage').hidden=true;$('#emptyView').hidden=true;$('#pdfFrame').hidden=true;
  if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){$('#pdfFrame').src=drawingObjectUrl;$('#pdfFrame').hidden=false;$('#viewerTitle').textContent=file.name;$('#viewerSub').textContent='PDF · trình xem tích hợp của trình duyệt';$('#showOriginal').checked=true;$('#showOriginal').disabled=true;$('#showOverlay').disabled=true;$('#overlayStatus').textContent='Lớp phủ ảnh chỉ áp dụng cho ảnh raster trong bản demo; PDF chưa hỗ trợ căn lớp phủ.';}
  else{$('#sourceImage').src=drawingObjectUrl;$('#sourceImage').hidden=false;$('#viewerTitle').textContent=file.name;$('#viewerSub').textContent='Ảnh gốc · không chỉnh sửa';$('#showOriginal').disabled=false;$('#showOverlay').disabled=false;$('#showOriginal').checked=true;$('#showOverlay').checked=true;$('#overlayStatus').textContent=overlayObjectUrl?'Đã nạp lớp phủ PNG.':'Chưa có lớp centerline / skeleton được tạo trong bản demo.';}
  $('#fileCaption').textContent=`${file.name} · ${(file.size/1024/1024).toFixed(2)} MB`;e.target.value='';toast('Đã mở bản vẽ trong vùng xem.');});
$('#overlayInput').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(overlayObjectUrl)URL.revokeObjectURL(overlayObjectUrl);overlayObjectUrl=URL.createObjectURL(file);$('#overlayImage').src=overlayObjectUrl;$('#overlayImage').hidden=false;$('#overlayImage').style.opacity=(+$('#overlayOpacity').value)/100;$('#showOverlay').checked=true;$('#overlayStatus').textContent=`Đã nạp lớp phủ: ${file.name}. Hãy kiểm tra cùng hệ tọa độ / tỷ lệ với ảnh gốc.`;e.target.value='';toast('Đã nạp lớp phủ.');});
$('#showOriginal').addEventListener('change',e=>{$('#sourceImage').style.opacity=e.target.checked?'1':'0';});
$('#showOverlay').addEventListener('change',e=>{$('#overlayImage').hidden=!e.target.checked;});
$('#overlayOpacity').addEventListener('input',e=>{const n=+e.target.value;$('#overlayImage').style.opacity=n/100;$('#opacityValue').textContent=`${n}%`;});
$('#fitDrawing').addEventListener('click',()=>{$('#drawingStage').scrollTo({top:0,left:0,behavior:'smooth'});toast('Đã đưa vùng xem về đầu bản vẽ.');});

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('#installBtn').hidden=false;});
$('#installBtn').addEventListener('click',async()=>{if(!deferredInstall){toast('Trên iPhone: dùng Chia sẻ → Thêm vào MH chính.');return;}deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('#installBtn').hidden=true;});
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
renderRows();persist();
