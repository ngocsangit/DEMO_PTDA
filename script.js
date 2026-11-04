const $=s=>document.querySelector(s);
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const fmt=n=>n.toLocaleString("vi-VN")+"đ",esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const hash=async p=>{try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(p));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}catch(e){return btoa(p)}};
const FORMS=["Viên nén","Viên sủi","Dung dịch","Gói bột"];
const DATA=[
["Paracetamol 500mg","Giảm đau, hạ sốt","Hộp 100 viên",45000,0,"Paracetamol 500mg","Giảm đau, hạ sốt nhẹ","Không dùng khi quá mẫn với thành phần thuốc","Công ty Dược phẩm A",120,0],
["Vitamin C 1000mg","Vitamin & khoáng chất","Tuýp 20 viên sủi",68000,0,"Acid ascorbic 1000mg","Bổ sung vitamin C","Theo hướng dẫn trên bao bì","Công ty Dược phẩm B",80,1],
["Amoxicillin 500mg","Kháng sinh","Hộp 20 viên",52000,1,"Amoxicillin 500mg","Điều trị nhiễm khuẩn","Không dùng khi dị ứng penicillin","Công ty Dược phẩm A",40,0],
["Berberin 100mg","Tiêu hóa","Lọ 100 viên",18000,0,"Berberin 100mg","Hỗ trợ điều trị tiêu chảy","Theo hướng dẫn của dược sĩ","Công ty Dược phẩm C",60,0],
["Oresol","Tiêu hóa","Hộp 20 gói",36000,0,"Muối khoáng & glucose","Bù nước và điện giải","Pha đúng tỉ lệ theo hướng dẫn","Công ty Dược phẩm C",0,3],
["Cetirizine 10mg","Dị ứng","Hộp 10 viên",25000,1,"Cetirizine 10mg","Giảm triệu chứng dị ứng","Thận trọng khi lái xe","Công ty Dược phẩm D",55,0],
["Ibuprofen 400mg","Giảm đau, hạ sốt","Hộp 30 viên",39000,0,"Ibuprofen 400mg","Giảm đau, kháng viêm","Thận trọng với bệnh dạ dày","Công ty Dược phẩm B",70,0],
["Vitamin D3","Vitamin & khoáng chất","Lọ 20ml",95000,0,"Cholecalciferol","Bổ sung vitamin D","Không vượt liều khuyến cáo","Công ty Dược phẩm E",35,2],
["Azithromycin 250mg","Kháng sinh","Hộp 6 viên",78000,1,"Azithromycin 250mg","Điều trị nhiễm khuẩn","Theo chỉ định của bác sĩ","Công ty Dược phẩm A",25,0],
["Men tiêu hóa","Tiêu hóa","Hộp 10 ống",56000,0,"Lợi khuẩn","Hỗ trợ tiêu hóa","Bảo quản nơi khô mát","Công ty Dược phẩm D",90,2],
["Loratadine 10mg","Dị ứng","Hộp 10 viên",22000,0,"Loratadine 10mg","Giảm triệu chứng dị ứng","Hỏi dược sĩ khi mang thai","Công ty Dược phẩm E",48,0],
["Kẽm Gluconat","Vitamin & khoáng chất","Hộp 30 viên",64000,0,"Kẽm 10mg","Bổ sung khoáng chất","Dùng sau ăn","Công ty Dược phẩm B",66,0]
].map((a,i)=>({id:i+1,name:a[0],cat:a[1],unit:a[2],price:a[3],rx:a[4],ing:a[5],use:a[6],warn:a[7],maker:a[8],stock:a[9],form:FORMS[a[10]]}));
const MAKERS=[...new Set(DATA.map(d=>d.maker))];
let cats=ls.get("cats",[["Giảm đau, hạ sốt","Các thuốc giảm đau hạ sốt thông thường",1],["Kháng sinh","Các loại kháng sinh điều trị nhiễm khuẩn",1],["Vitamin & khoáng chất","Thực phẩm bổ sung và vitamin",1],["Tiêu hóa","Men tiêu hóa, thuốc đau dạ dày",1],["Dị ứng","Thuốc chống dị ứng, kháng histamine",1],["Tim mạch","Thuốc hỗ trợ điều trị huyết áp, tim mạch",0]].map((c,i)=>({id:i+1,name:c[0],desc:c[1],on:c[2]})));
let users=ls.get("users",[]),sess=ls.get("sess",null),lock=ls.get("lock",{n:0,until:0});
let F={cat:"Tất cả",kw:"",max:100000,rx:true,otc:true,forms:[],maker:"",sort:"pop",page:1,sel:3,qty:1,open:false},cq="",coupon=0,aq="",authErr={},loginMsg="";
const user=()=>users.find(u=>u.email==sess);
const byId=id=>DATA.find(d=>d.id==id);

const MAXQ=10,now=()=>new Date().toISOString();
let gt=ls.get("guest_token",null);if(!gt){gt="g"+Date.now().toString(36)+Math.random().toString(36).slice(2,8);ls.set("guest_token",gt)}
const DB={t:{carts:ls.get("tbl_carts",[]),cart_items:ls.get("tbl_cart_items",[])},
 save(){ls.set("tbl_carts",this.t.carts);ls.set("tbl_cart_items",this.t.cart_items)},
 id(tb){return Math.max(0,...this.t[tb].map(r=>r.id))+1}};
const CartAPI={
 _own(){return sess?{email:sess}:{token:gt}},
 _find(o){return DB.t.carts.find(c=>c.status=="active"&&(o.email?c.user_email==o.email:c.guest_token==o.token))},
 _cart(o){let c=this._find(o);if(!c){const t=now();c={id:DB.id("carts"),user_email:o.email||null,guest_token:o.email?null:o.token,status:"active",created_at:t,updated_at:t};DB.t.carts.push(c)}return c},
 _line(c,pid){return c&&DB.t.cart_items.find(i=>i.cart_id==c.id&&i.product_id==pid)},
 _check(d,q){if(!Number.isInteger(q)||q<1||q>MAXQ)return this._err(400,"Số lượng mỗi sản phẩm phải từ 1 đến "+MAXQ);if(!d.stock)return this._err(409,"Sản phẩm đã hết hàng");if(q>d.stock)return this._err(409,"Vượt quá tồn kho ("+d.stock+")");return null},
 _ok(m,st){return{...this.get(),status:st||200,message:m}},
 _err(st,m){return{...this.get(),ok:false,status:st,message:m}},

 get(){const c=this._find(this._own()),rows=c?DB.t.cart_items.filter(i=>i.cart_id==c.id):[];
  const items=rows.map(i=>{const d=byId(i.product_id);return{product_id:i.product_id,name:d.name,unit:d.unit,rx:d.rx,stock:d.stock,max:Math.min(MAXQ,d.stock),unit_price:i.unit_price,quantity:i.quantity,line_total:i.unit_price*i.quantity}});
  const subtotal=items.reduce((a,i)=>a+i.line_total,0),shipping=!subtotal||subtotal>=200000?0:20000,discount=Math.round(subtotal*coupon),count=items.reduce((a,i)=>a+i.quantity,0);
  return{ok:true,status:200,message:"OK",data:{items,count,subtotal,shipping,discount,total:subtotal+shipping-discount}}},
 qty(pid){const l=this._line(this._find(this._own()),pid);return l?l.quantity:0},

 add(pid,n){const d=byId(pid);if(!d)return this._err(404,"Không tìm thấy sản phẩm");n=Number(n);if(!Number.isInteger(n)||n<1)return this._err(400,"Số lượng không hợp lệ");
  const o=this._own(),c0=this._find(o),ex=this._line(c0,d.id),cur=ex?ex.quantity:0,q=n+cur;
  if(q>MAXQ)return this._err(400,"Mỗi sản phẩm chỉ mua tối đa "+MAXQ+" (trong giỏ đã có "+cur+")");
  const e=this._check(d,q);if(e)return e;
  const c=c0||this._cart(o),t=now();
  if(ex){ex.quantity=q;ex.unit_price=d.price;ex.updated_at=t}else DB.t.cart_items.push({id:DB.id("cart_items"),cart_id:c.id,product_id:d.id,quantity:q,unit_price:d.price,created_at:t,updated_at:t});
  c.updated_at=t;DB.save();return this._ok("Đã thêm vào giỏ hàng",201)},

 update(pid,q){const d=byId(pid),c=this._find(this._own()),ex=this._line(c,pid);if(!d||!ex)return this._err(404,"Sản phẩm không có trong giỏ");q=Number(q);
  const e=this._check(d,q);if(e)return e;const t=now();ex.quantity=q;ex.unit_price=d.price;ex.updated_at=t;c.updated_at=t;DB.save();return this._ok("Đã cập nhật số lượng")},

 remove(pid){const c=this._find(this._own()),ex=this._line(c,pid);if(!ex)return this._err(404,"Sản phẩm không có trong giỏ");
  DB.t.cart_items=DB.t.cart_items.filter(i=>i!==ex);c.updated_at=now();DB.save();return this._ok("Đã xóa sản phẩm khỏi giỏ")},

 clear(){const c=this._find(this._own());if(c){DB.t.cart_items=DB.t.cart_items.filter(i=>i.cart_id!=c.id);c.updated_at=now();DB.save()}return this._ok("Đã xóa toàn bộ giỏ hàng")},

 merge(email){const g=this._find({token:gt});let moved=0,capped=0;if(!g)return{moved,capped};
  const rows=DB.t.cart_items.filter(i=>i.cart_id==g.id);
  if(rows.length){const u=this._cart({email}),t=now();
   rows.forEach(r=>{const d=byId(r.product_id);if(!d)return;const ex=this._line(u,d.id),want=r.quantity+(ex?ex.quantity:0),q=Math.min(want,MAXQ,d.stock);if(q<1)return;if(q<want)capped++;
    if(ex){ex.quantity=q;ex.unit_price=d.price;ex.updated_at=t}else DB.t.cart_items.push({id:DB.id("cart_items"),cart_id:u.id,product_id:d.id,quantity:q,unit_price:d.price,created_at:t,updated_at:t});moved++});
   u.updated_at=t}
  DB.t.cart_items=DB.t.cart_items.filter(i=>i.cart_id!=g.id);DB.t.carts=DB.t.carts.filter(c=>c.id!=g.id);DB.save();return{moved,capped}}
};
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),2000)}
const route=()=>(location.hash.slice(1)||"shop");
const go=r=>{location.hash=r};
function add(id,n){const r=CartAPI.add(id,n);toast(r.ok?"Đã thêm "+byId(id).name+" vào giỏ":r.message);draw()}
const count=n=>DATA.filter(d=>d.cat==n).length;
function filtered(){const k=F.kw.trim().toLowerCase(),act=cats.filter(c=>c.on).map(c=>c.name);
 let l=DATA.filter(d=>act.includes(d.cat)&&(F.cat=="Tất cả"||d.cat==F.cat)&&(!k||d.name.toLowerCase().includes(k)||("mt"+String(d.id).padStart(4,"0")).includes(k))&&d.price<=F.max&&(d.rx?F.rx:F.otc)&&(!F.forms.length||F.forms.includes(d.form))&&(!F.maker||d.maker==F.maker));
 if(F.sort=="asc")l.sort((a,b)=>a.price-b.price);if(F.sort=="desc")l.sort((a,b)=>b.price-a.price);if(F.sort=="name")l.sort((a,b)=>a.name.localeCompare(b.name,"vi"));return l}
function head(){const u=user(),r=route(),n=CartAPI.get().data.count;
 $("#nav").innerHTML=`<a data-go="shop" class="${r=="shop"?"on":""}">Thuốc</a><a data-go="cart" class="${r=="cart"?"on":""}">Giỏ hàng (${n})</a>`+(u&&u.role=="admin"?`<a data-go="admin" class="${r=="admin"?"on":""}">Quản trị</a>`:"");
 $("#hr").innerHTML=u?`<span class="mute">Xin chào, ${esc(u.name)}</span><button class="btn o" data-act="logout">Đăng xuất</button>`:`<button class="btn o" data-go="login">Đăng nhập</button><button class="btn" data-go="register">Đăng ký</button>`}
function shop(){const l=filtered(),pg=Math.max(1,Math.ceil(l.length/6));if(F.page>pg)F.page=pg;const s=byId(F.sel);
 const list=l.slice((F.page-1)*6,F.page*6);
 const filt=`<div class="panel" style="margin-bottom:14px"><div class="row"><h3>▼ Bộ lọc tìm kiếm</h3><span class="lnk" data-act="reset">Xóa tất cả</span></div><div style="margin:8px 0"><b>Khoảng giá (VNĐ)</b><input type="range" id="fmax" min="10000" max="100000" step="1000" value="${F.max}"><div class="row mute"><span>10.000đ</span><b>Dưới ${fmt(F.max)}</b></div></div>
 <div style="margin:8px 0"><b>Loại thuốc</b><br><label><input type="checkbox" id="fotc" ${F.otc?"checked":""}> Thuốc không kê đơn (OTC)</label><br><label><input type="checkbox" id="frx" ${F.rx?"checked":""}> Thuốc kê đơn (Rx)</label></div>
 <div style="margin:8px 0"><b>Dạng bào chế</b><div class="row" style="justify-content:flex-start;flex-wrap:wrap;margin-top:6px">${FORMS.map(f=>`<button class="chip ${F.forms.includes(f)?"on":""}" data-form="${f}">${f}</button>`).join("")}</div></div>
 <b>Hãng sản xuất</b><select id="fmk" style="margin-top:6px"><option value="">Tất cả nhà sản xuất</option>${MAKERS.map(m=>`<option ${F.maker==m?"selected":""}>${m}</option>`).join("")}</select></div>`;
 const det=s?`<h3>Chi tiết thuốc</h3><div class="img dimg">💊</div><div class="row" style="justify-content:flex-start"><b style="font-size:16px">${esc(s.name)}</b>${s.rx?'<span class="tag">Thuốc kê đơn</span>':""}</div><div class="price" style="font-size:19px;margin:6px 0">${fmt(s.price)} / ${esc(s.unit.split(" ")[0].toLowerCase())}</div><dl><dt>Mã thuốc: </dt><dd>MT${String(s.id).padStart(4,"0")}</dd><dt>Thành phần: </dt><dd>${esc(s.ing)}</dd><dt>Công dụng: </dt><dd>${esc(s.use)}</dd><dt>Lưu ý: </dt><dd>${esc(s.warn)}</dd><dt>Nhà sản xuất: </dt><dd>${esc(s.maker)}</dd><dt>Tồn kho: </dt><dd>${s.stock||"Hết hàng"}</dd></dl><div class="row" style="margin-bottom:10px"><span>Số lượng</span><span class="qty"><button data-q="-1">−</button><b>${F.qty}</b><button data-q="1">+</button></span></div><button class="btn" style="width:100%" data-addsel ${s.stock?"":"disabled"}>${s.stock?"Thêm vào giỏ":"Hết hàng"}</button>`:`<h3>Chi tiết thuốc</h3><p class="mute">Chọn một sản phẩm để xem.</p>`;
 return `<div class="shop"><aside class="panel"><h3>Nhóm thuốc</h3><div class="cats">${["Tất cả",...cats.filter(c=>c.on).map(c=>c.name)].map(c=>`<div class="${c==F.cat?"on":""}" data-cat="${esc(c)}">${esc(c)}</div>`).join("")}</div></aside>
 <main><div class="row" style="margin-bottom:10px"><h2 style="margin:0">Danh sách thuốc</h2><input id="q" type="search" placeholder="Tìm thuốc (tên hoặc mã)..." value="${esc(F.kw)}" style="max-width:240px"></div>
 <button class="chip" data-act="tf" style="margin-bottom:10px">${F.open?"Ẩn bộ lọc":"Hiện bộ lọc"}</button>${F.open?filt:""}
 <div class="row" style="margin-bottom:10px"><span class="mute">Tìm thấy ${l.length} thuốc phù hợp</span><span>Sắp xếp: <select id="fs" style="width:auto"><option value="pop">Phổ biến nhất</option><option value="asc" ${F.sort=="asc"?"selected":""}>Giá thấp đến cao</option><option value="desc" ${F.sort=="desc"?"selected":""}>Giá cao đến thấp</option><option value="name" ${F.sort=="name"?"selected":""}>Tên A-Z</option></select></span></div>
 <div class="grid">${list.map(d=>`<div class="card ${F.sel==d.id?"sel":""}" data-id="${d.id}"><div class="img">💊</div><b>${esc(d.name)}</b><div class="unit">${esc(d.unit)}</div><div class="price">${fmt(d.price)}</div><div class="row" style="margin-top:6px">${d.rx?'<span class="tag">Thuốc kê đơn</span>':d.stock?'<span class="mute" style="font-size:11px">OTC</span>':'<span class="tag">Hết hàng</span>'}<button class="sm" data-add="${d.id}" title="Thêm vào giỏ">🛒</button></div></div>`).join("")||'<p class="mute" style="grid-column:1/-1;text-align:center;padding:30px">Không tìm thấy sản phẩm phù hợp.</p>'}</div>
 ${pg>1?`<div class="pager"><span data-pg="${F.page-1}">‹</span>${Array.from({length:pg},(_,i)=>`<span data-pg="${i+1}" class="${i+1==F.page?"on":""}">${i+1}</span>`).join("")}<span data-pg="${F.page+1}">›</span></div>`:""}</main>
 <aside class="panel">${det}</aside></div>`}
function cartV(){const v=CartAPI.get().data,it=v.items;
 return `<div class="row" style="margin-bottom:16px"><div><h1>Giỏ hàng của bạn</h1><span class="mute">Quản lý các sản phẩm thuốc đã chọn trước khi thanh toán</span></div><span class="lnk" data-go="shop">＋ Thêm thuốc khác</span></div>
 ${it.length&&!user()?`<div class="panel note">Bạn chưa đăng nhập. <span class="lnk" data-go="login">Đăng nhập</span> để lưu giỏ hàng — giỏ tạm này sẽ được gộp vào giỏ của tài khoản.</div>`:""}
 ${it.length?`<div class="crow hd"><div>Sản phẩm thuốc</div><div>Đơn giá</div><div>Số lượng</div><div>Thành tiền</div></div>`+it.map(i=>`<div class="crow"><div class="row" style="justify-content:flex-start;gap:14px"><div class="img">💊</div><div><b>${esc(i.name)}</b><div class="unit">${esc(i.unit)}</div>${i.rx?'<span class="tag">Thuốc kê đơn</span>':""}</div></div><div><b>${fmt(i.unit_price)}</b></div><div><span class="qty"><button data-cm="${i.product_id}" ${i.quantity<=1?"disabled":""} aria-label="Giảm số lượng">−</button><input type="number" min="1" max="${i.max}" value="${i.quantity}" data-qi="${i.product_id}" aria-label="Số lượng"><button data-cp="${i.product_id}" ${i.quantity>=i.max?"disabled":""} aria-label="Tăng số lượng">+</button></span><div class="unit">Tối đa ${i.max} / sản phẩm</div><div><span class="lnk" style="font-size:12px" data-cd="${i.product_id}">Xóa</span></div></div><div class="price" style="font-size:16px">${fmt(i.line_total)}</div></div>`).join("")
 :`<div class="panel" style="text-align:center;padding:40px"><p class="mute">Giỏ hàng đang trống.</p><button class="btn" data-go="shop">Chọn thuốc</button></div>`}
 ${it.length?`<div class="panel sum"><h2>Tóm tắt đơn hàng</h2><div class="row" style="gap:10px;margin-bottom:10px"><input id="cp" placeholder="Mã giảm giá (ví dụ: YTE2026)" value="${esc(cq)}"><button class="btn d" data-act="coupon">Áp dụng</button></div><div class="row"><span>Tạm tính (${v.count} sản phẩm):</span><b>${fmt(v.subtotal)}</b></div><div class="row"><span>Phí vận chuyển:</span><b class="${v.shipping?"":"price"}">${v.shipping?fmt(v.shipping):"Miễn phí"}</b></div>${v.discount?`<div class="row"><span>Giảm giá:</span><b class="price">−${fmt(v.discount)}</b></div>`:""}<div class="row tot"><span>Tổng cộng:</span><span class="price">${fmt(v.total)}</span></div><div class="row" style="margin-top:12px"><button class="btn o" data-act="clear">Xóa toàn bộ giỏ</button><button class="btn" data-act="checkout">Thanh toán</button></div></div>`:""}`}
function adminV(){const u=user();if(!u||u.role!="admin")return `<div class="panel"><div class="alert">Bạn không có quyền truy cập trang quản trị.</div><button class="btn" data-go="login">Đăng nhập Admin</button></div>`;
 const l=cats.filter(c=>c.name.toLowerCase().includes(aq.toLowerCase()));
 return `<div class="row" style="margin-bottom:16px"><div><h1>Quản lý Danh mục thuốc</h1><span class="mute">Thêm, sửa, xóa và quản lý trạng thái các nhóm thuốc trong hệ thống</span></div><button class="btn" data-act="newcat">＋ Thêm nhóm thuốc mới</button></div>
 <div class="panel"><div class="row" style="margin-bottom:14px"><input id="aq" placeholder="Tìm tên nhóm thuốc..." value="${esc(aq)}" style="max-width:340px"><span class="mute">Tổng cộng: ${cats.length} nhóm thuốc</span></div><div class="sc"><table><tr><th>STT</th><th>Tên nhóm thuốc</th><th>Mô tả</th><th style="text-align:center">Số lượng thuốc</th><th>Trạng thái</th><th>Thao tác</th></tr>
 ${l.map((c,i)=>`<tr><td class="mute">${i+1}</td><td><b>${esc(c.name)}</b></td><td class="mute">${esc(c.desc)}</td><td style="text-align:center"><b>${count(c.name)}</b></td><td><span class="${c.on?"ok":"off"}">${c.on?"Hoạt động":"Tạm ẩn"}</span></td><td><span style="cursor:pointer" data-ec="${c.id}" title="Sửa">✏️</span> <span style="cursor:pointer" data-dc="${c.id}" title="Xóa">🗑️</span></td></tr>`).join("")||'<tr><td colspan="6" class="mute" style="text-align:center">Không tìm thấy nhóm thuốc.</td></tr>'}</table></div></div>`}
function authV(){const E=authErr,r=route();const fld=(id,l,t,ph,k)=>`<div class="f"><label>${l}</label><input id="${id}" type="${t||"text"}" placeholder="${ph||""}" class="${E[k||id]?"e":""}">${E[k||id]?`<div class="err">${E[k||id]}</div>`:""}</div>`;
 return `<div class="auth"><div class="panel"><h2>Đăng ký tài khoản</h2>${fld("rn","Họ và tên","text","Nguyễn Văn An")}${fld("rid","Email hoặc số điện thoại","text","an.nguyen@mail.com")}${fld("rp","Mật khẩu (tối thiểu 8 ký tự)","password","","rp")}${fld("rp2","Nhập lại mật khẩu","password","")}<button class="btn" style="width:100%" data-act="register">Đăng ký</button><p class="mute" style="text-align:center">Đã có tài khoản? <span class="lnk" data-go="login">Đăng nhập</span></p></div>
 <div class="panel"><h2>Đăng nhập</h2>${loginMsg?`<div class="alert">${esc(loginMsg)}</div>`:""}${fld("li","Email hoặc số điện thoại","text","an.nguyen@mail.com")}${fld("lp","Mật khẩu","password","")}<button class="btn" style="width:100%" data-act="login">Đăng nhập</button><p style="text-align:center"><span class="lnk">Quên mật khẩu?</span> | <span class="lnk" data-go="register">Đăng ký</span></p><hr style="border:0;border-top:1px solid var(--line)"><p class="mute" style="font-size:12px">Tài khoản demo: admin@pharma.vn / Admin@123 (Quản trị viên). Sau khi đăng nhập, menu hiển thị theo vai trò.</p></div></div>`}
function draw(){const r=route();head();const a=$("#app"),keep=document.activeElement&&document.activeElement.id;a.innerHTML=r=="cart"?cartV():r=="admin"?adminV():(r=="login"||r=="register")?authV():shop();
 if(keep&&$("#"+keep)&&(keep=="q"||keep=="aq")){const e=$("#"+keep);e.focus();e.setSelectionRange(e.value.length,e.value.length)}}
function modal(c){const v=c||{name:"",desc:"",on:1};$("#mbox").innerHTML=`<h2>${c?"Sửa":"Thêm"} nhóm thuốc</h2><div class="f"><label>Tên nhóm thuốc</label><input id="mn" value="${esc(v.name)}"></div><div class="f"><label>Mô tả</label><input id="md" value="${esc(v.desc)}"></div><div class="f"><label>Trạng thái</label><select id="ms"><option value="1" ${v.on?"selected":""}>Hoạt động</option><option value="0" ${v.on?"":"selected"}>Tạm ẩn</option></select></div><div class="row"><button class="btn o" data-act="mx">Hủy</button><button class="btn" data-act="msave" data-id="${c?c.id:""}">Lưu</button></div>`;$("#modal").classList.add("on")}
const isEmail=s=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),isPhone=s=>/^0\d{9}$/.test(s);
document.addEventListener("click",async e=>{const t=e.target,g=a=>t.closest("["+a+"]");let x;
 if(x=g("data-go")){go(x.dataset.go);authErr={};loginMsg=""}
 else if(x=g("data-add")){add(+x.dataset.add,1)}
 else if(x=g("data-id")){F.sel=+x.dataset.id;F.qty=1;draw()}
 else if(x=g("data-cat")){F.cat=x.dataset.cat;F.page=1;draw()}
 else if(x=g("data-pg")){F.page=Math.max(1,+x.dataset.pg);draw()}
 else if(x=g("data-q")){const s=byId(F.sel);F.qty=Math.max(1,Math.min(s.stock||1,MAXQ,F.qty+ +x.dataset.q));draw()}
 else if(g("data-addsel")){add(F.sel,F.qty);F.qty=1;draw()}
 else if(x=g("data-form")){const f=x.dataset.form;F.forms=F.forms.includes(f)?F.forms.filter(i=>i!=f):[...F.forms,f];F.page=1;draw()}
 else if(x=g("data-cp")){const i=x.dataset.cp,r=CartAPI.update(i,CartAPI.qty(i)+1);if(!r.ok)toast(r.message);draw()}
 else if(x=g("data-cm")){const i=x.dataset.cm,r=CartAPI.update(i,CartAPI.qty(i)-1);if(!r.ok)toast(r.message);draw()}
 else if(x=g("data-cd")){const i=x.dataset.cd,r=CartAPI.remove(i);toast(r.ok?"Đã xóa "+byId(i).name+" khỏi giỏ":r.message);draw()}
 else if(x=g("data-ec")){modal(cats.find(c=>c.id==x.dataset.ec))}
 else if(x=g("data-dc")){const c=cats.find(c=>c.id==x.dataset.dc),n=count(c.name);if(n){toast(`Không thể xóa: còn ${n} sản phẩm thuộc nhóm "${c.name}"`)}else if(confirm("Xóa nhóm thuốc "+c.name+"?")){cats=cats.filter(i=>i!=c);ls.set("cats",cats);toast("Đã xóa nhóm thuốc");draw()}}
 else if(x=g("data-act")){const a=x.dataset.act;
  if(a=="tf"){F.open=!F.open;draw()}
  else if(a=="reset"){F={...F,cat:"Tất cả",max:100000,rx:true,otc:true,forms:[],maker:"",kw:"",page:1};draw()}
  else if(a=="clear"){CartAPI.clear();draw();toast("Đã xóa toàn bộ giỏ hàng")}
  else if(a=="coupon"){cq=$("#cp").value.trim().toUpperCase();coupon=cq=="YTE2026"?0.05:0;toast(coupon?"Áp dụng giảm 5%":"Mã giảm giá không hợp lệ");draw()}
  else if(a=="checkout"){if(!user()){toast("Vui lòng đăng nhập để thanh toán");go("login")}else{CartAPI.clear();coupon=0;cq="";toast("Đặt hàng thành công (demo)");draw()}}
  else if(a=="logout"){sess=null;ls.set("sess",null);toast("Đã đăng xuất");go("shop");draw()}
  else if(a=="newcat")modal();else if(a=="mx")$("#modal").classList.remove("on");
  else if(a=="msave"){const n=$("#mn").value.trim(),id=x.dataset.id;if(!n){toast("Vui lòng nhập tên nhóm");return}if(cats.some(c=>c.name.toLowerCase()==n.toLowerCase()&&c.id!=id)){toast("Tên nhóm đã tồn tại");return}
   if(id){const c=cats.find(c=>c.id==id);c.name=n;c.desc=$("#md").value.trim();c.on=+$("#ms").value}else cats.push({id:Math.max(0,...cats.map(c=>c.id))+1,name:n,desc:$("#md").value.trim(),on:+$("#ms").value});
   ls.set("cats",cats);$("#modal").classList.remove("on");toast("Đã lưu nhóm thuốc");draw()}
  else if(a=="register"){const n=$("#rn").value.trim(),id=$("#rid").value.trim().toLowerCase(),p=$("#rp").value,p2=$("#rp2").value;authErr={};
   if(!n)authErr.rn="Vui lòng nhập họ tên";if(!isEmail(id)&&!isPhone(id))authErr.rid="Email hoặc số điện thoại không hợp lệ";else if(users.some(u=>u.email==id))authErr.rid="Email hoặc số điện thoại đã được sử dụng";
   if(p.length<8)authErr.rp="Mật khẩu phải có ít nhất 8 ký tự";if(p2!==p)authErr.rp2="Mật khẩu nhập lại không khớp";
   if(Object.keys(authErr).length){draw();$("#rn").value=n;$("#rid").value=id;return}
   users.push({name:n,email:id,role:"customer",pw:await hash(p)});ls.set("users",users);authErr={};loginMsg="";toast("Đăng ký thành công, hãy đăng nhập");go("login");draw()}
  else if(a=="login"){const id=$("#li").value.trim().toLowerCase(),p=$("#lp").value;
   if(Date.now()<lock.until){loginMsg="Tài khoản tạm khóa. Vui lòng thử lại sau "+Math.ceil((lock.until-Date.now())/60000)+" phút.";draw();return}
   const u=users.find(u=>u.email==id);
   if(u&&u.pw==await hash(p)){sess=u.email;ls.set("sess",sess);lock={n:0,until:0};ls.set("lock",lock);loginMsg="";const m=CartAPI.merge(u.email);toast(m.moved?"Đăng nhập thành công. Đã gộp "+m.moved+" sản phẩm từ giỏ tạm vào giỏ của bạn"+(m.capped?" (một số mặt hàng được giới hạn tối đa 10 / theo tồn kho)":""):"Đăng nhập thành công");go(u.role=="admin"?"admin":"shop");draw()}
   else{lock.n++;if(lock.n>=5){lock={n:0,until:Date.now()+9e5};loginMsg="Sai 5 lần liên tiếp. Tài khoản bị khóa 15 phút."}else loginMsg="Sai thông tin đăng nhập. Sai 5 lần liên tiếp tài khoản sẽ bị khóa 15 phút.";ls.set("lock",lock);draw()}}}
});
document.addEventListener("input",e=>{const i=e.target.id;if(i=="q"){F.kw=e.target.value;F.page=1;draw()}else if(i=="aq"){aq=e.target.value;draw()}else if(i=="fmax"){F.max=+e.target.value;F.page=1;draw()}});
document.addEventListener("change",e=>{const i=e.target.id;if(i=="fs"){F.sort=e.target.value;draw()}else if(i=="fmk"){F.maker=e.target.value;F.page=1;draw()}else if(i=="fotc"){F.otc=e.target.checked;F.page=1;draw()}else if(i=="frx"){F.rx=e.target.checked;F.page=1;draw()}
 else if(e.target.dataset.qi){const p=e.target.dataset.qi,mx=Math.min(MAXQ,byId(p).stock);let n=Math.round(+e.target.value);if(!(n>=1))n=1;if(n>mx){n=mx;toast("Tối đa "+mx+" cho mỗi sản phẩm")}const r=CartAPI.update(p,n);if(!r.ok)toast(r.message);draw()}});
addEventListener("hashchange",draw);
(async()=>{if(!users.length){users=[{name:"Quản trị viên",email:"admin@pharma.vn",role:"admin",pw:await hash("Admin@123")}];ls.set("users",users)}draw()})();