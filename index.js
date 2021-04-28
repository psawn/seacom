const express = require("express");
//const test = require("test/test.js");
const flash = require('connect-flash');
const moment = require('moment');
const PORT = process.env.PORT || 5000;
const bodyParser = require("body-parser");
const session = require('express-session');
const mssql = require("mssql");
const config = {
    server: 'localhost',
    user:'sa',
    password:'123456',
    database:'seacom',
    options: {
        trustedConnection: true,
        encrypt: false,
        enableArithAbort: true
    }
}
const app = express();

app.use(express.static(__dirname + '/public'));
app.listen(PORT,function () {
    console.log("server is running...");
})

app.use(express.static("public"));
app.set("view engine","ejs");

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


mssql.connect(config,function (err) {
    if(err) console.log(err);
    else console.log("ket noi DB thanh cong!");
})

const default_sql = "select * from nhomsanpham;" +
    "select * from dichvu;" +
    "select * from nhomtintuc_cap1;";
const default_sql_user = "select * from sanpham;";
const db = new mssql.Request();

// code viewer
app.get("/",async function (req,res) {
    const sql_text= default_sql_user;
    let data = {
        dssanpham:[],
        message: req.flash('info'),
    }
    try {
        const rows = await db.query(sql_text);
        data.dssanpham = rows.recordsets[0]
        //let catsArr = ["Maine Coon", "Sphynx", "Toyger", "Balinese", "Burmese", "Russian Blue", "Turkish Van", "Exotic", "Selkirk Rex", "Korat"];
        //let randomCat = test.getRandomCat(catsArr);
        //console.log(randomCat)
    } catch (e) {
        
    }
    res.render("viewer/home",data);
});

app.post("/luu-thong-tin",async function (req,res) {
    const tencongty = req.body.organizationname;
    const tennguoi = req.body.tennguoi;
    const email = req.body.email;
    const sdt = req.body.phonenumber;
    const message = req.body.tinnhan;
    var ngaygui = moment(Date.now()).format('YYYY/MM/DD');
    const sql_text = "INSERT INTO lienhekhachhang(tencongty,tennguoilienhe,email,sdt,tinnhan,ngaygui)" +
        `VALUES(N'${tencongty}',N'${tennguoi}','${email}','${sdt}',N'${message}','${ngaygui}');`;
    try {
        await db.query(sql_text);
    } catch (e) {

    }
    req.flash('info', 'success');
    res.redirect(req.get('referer'));
    //res.redirect('/');
})

app.get("/tim-kiem",async function(req,res){
    let keyword = req.query.search;
    let page = req.query.page !== undefined?req.query.page:1;
    const limit = 2;
    let sql_text = default_sql_user + 
        `select a.tieude,a.anhdaidien,a.idtintuc,a.idnhomtintuc_cap1 from tintuc as a where a.tieude like N'%${keyword}%' order by idtintuc,ngaydang desc offset ${(page-1)*limit} rows fetch first ${limit} rows only;` +
        `select count(a.idtintuc) as total from tintuc as a where a.tieude like N'%${keyword}%';`;
    let data ={
        dssanpham:[],
        message: req.flash('info'),
        tintuc:[],
        keyword:keyword,
        page:parseInt(page),
        total:0,
        pageNumber:1,
        a:2
    }    
    try {
        const rows = await db.query(sql_text);
        data.dssanpham = rows.recordsets[0];
        data.tintuc = rows.recordsets[1];
        data.total =  rows.recordsets[2][0].total;
        data.pageNumber = Math.ceil(data.total/limit);
    } catch (e){

    }
    res.render("viewer/search",data)
})

app.get("/tintuc",async function (req,res){
    let page = req.query.page !== undefined?req.query.page:1;
    const limit = 2;
    const sql_text= default_sql_user +
        "select * from nhomtintuc_cap1;"+
        `select * from tintuc where is_active=1 order by idtintuc,ngaydang desc offset ${(page-1)*limit} rows fetch first ${limit} rows only ;`+
        "select count(idtintuc) as total from tintuc where is_active=1";
    let data = {
        dssanpham:[],
        nhomtintuc_cap1:[],
        tintuc:[],
        message: req.flash('info'),
        page:parseInt(page),
        total:0,
        pageNumber:1,
        a:1,
        // biến a dùng để check điều kiện pagination
    }
    try {
        const rows = await db.query(sql_text);
        data.dssanpham = rows.recordsets[0];
        data.nhomtintuc_cap1 = rows.recordsets[1];
        data.tintuc = rows.recordsets[2];
        data.total =  rows.recordsets[3][0].total;
        data.pageNumber = Math.ceil(data.total/limit);
    } catch (e) {

    }
    res.render("viewer/tintuc",data);
})

app.get("/tintuc/:id",async function (req,res){
    let page = req.query.page !== undefined?req.query.page:1;
    const limit = 2;
    IDNhomTinTuc = req.params.id;
    const sql_text= default_sql_user +
        "select * from nhomtintuc_cap1;"+
        `select * from tintuc where is_active=1 and idnhomtintuc_cap1 = `+ IDNhomTinTuc +` order by ngaydang desc offset ${(page-1)*limit} rows fetch first ${limit} rows only;`+
        "select count(idtintuc) as total from tintuc where is_active=1 and idnhomtintuc_cap1 =" + IDNhomTinTuc;
    let data = {
        dssanpham:[],
        nhomtintuc_cap1:[],
        tintuc:[],
        message: req.flash('info'),
        page:parseInt(page),
        total:0,
        pageNumber:1,
        a:0
    }    
    try {
        const rows = await db.query(sql_text);
        data.dssanpham = rows.recordsets[0];
        data.nhomtintuc_cap1 = rows.recordsets[1];
        data.tintuc = rows.recordsets[2];
        data.total =  rows.recordsets[3][0].total;
        data.pageNumber = Math.ceil(data.total/limit);
    } catch (e) {

    }
    res.render("viewer/tintuc",data);
})

app.get("/tintuc/:id/chitiet/:idtintuc",async function(req,res){
    IDNhomTinTuc = req.params.id;
    IDTinTuc = req.params.idtintuc;
    const sql_text= default_sql_user +
        "select * from nhomtintuc_cap1;" +
        "select idtintuc,idnhomtintuc_cap1,idnhomtintuc_cap2,tieude,noidung,anhnoidung,format(ngaydang,'dd/MM/yyyy') as ngaydang,is_active,caption from tintuc where is_active=1 and idtintuc = " + IDTinTuc +";" +
        "select top 3 * from tintuc where is_active=1 and idnhomtintuc_cap1 = "+ IDNhomTinTuc + " EXCEPT select * from tintuc where idtintuc = " + IDTinTuc;
    let data = {
        dssanpham:[],
        nhomtintuc_cap1:[],
        tintuc:[],
        tintuclienquan:[],
        message: req.flash('info'),
    }
    try {
        const rows = await db.query(sql_text);
        data.dssanpham = rows.recordsets[0];
        data.nhomtintuc_cap1 = rows.recordsets[1];
        data.tintuc = rows.recordsets[2];
        data.tintuclienquan = rows.recordsets[3];
    } catch (e) {

    }
    
    res.render("viewer/chitiettintuc",data);
})

app.get("/sanpham/:id",async function (req,res){
    const IDSanPham = req.params.id;
    const sql_text= default_sql_user +
    "select * from sanpham where idsanpham = " + IDSanPham;
    let data = {
        dssanpham:[],
        chitietsanpham:[],
        message: req.flash('info'),
    }
    try {
        const rows = await db.query(sql_text);
        data.dssanpham = rows.recordsets[0];
        data.chitietsanpham = rows.recordsets[1];
    } catch (e) {
        
    }
    res.render("viewer/sanpham",data);
})

app.get("/lienhe",async function (req,res){
    const sql_text= default_sql_user;
    let data = {
        dssanpham:[],
        message: req.flash('info'),
    }
    try {
        const rows = await db.query(sql_text);
        data.dssanpham = rows.recordsets[0]
    }catch (e) {

    }
    res.render("viewer/lienhe",data);
})

app.get("/dichvu",async function (req,res){
    const sql_text= default_sql_user;
    let data = {
        dssanpham:[],
        message: req.flash('info'),
    }
    try {
        const rows = await db.query(sql_text);
        data.dssanpham = rows.recordsets[0]
    }catch (e) {

    }
    res.render("viewer/dichvu",data);
})
// code admin
app.get("/admin-login",async function (req,res) {
    req.session.destroy();
    res.render("admin/admin-login",{
        alert: ' &nbsp;',
    });
})

app.post("/login",async function (req,res) {
    var username  = req.body.TenDangNhap;
    var password = req.body.MatKhau;
    const sql_text = "select count(username) as count from admin where username = "+`'${username}'`+" and password = "+`'${password}'`;
    const rows = await db.query(sql_text);
    if((rows.recordsets[0][0].count)!=0) {
        req.session.TenDangNhap = username;
        res.redirect("/admin");
    }
    else {
        res.render("admin/admin-login",{
            alert:'Moi nhap lai tai khoan hoac mat khau',
        })
    }
})

app.get("/admin/thongtinkhachhang",async function (req,res){
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql
            +"select * from lienhekhachhang;"
            +"select max(id) as max from lienhekhachhang;";
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
            lienhekhachhang:[],
            max:[]
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.lienhekhachhang = rows.recordsets[3];
            data.max = rows.recordsets[4];
        } catch (e) {
            res.redirect(`/admin-login`);
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/thongtinkhachhang",data);
    }
    else {
        res.redirect(`/admin-login`);
    }
})

app.get("/admin",async function (req,res) {
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql;
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
        } catch (e) {
            res.redirect(`/admin-login`);
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/admin",data);
    }
    else {
        res.redirect(`/admin-login`);
    }
})

app.get("/admin/tintuc/:id",async function (req,res) {
    const DanhMucID = req.params.id;
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql +
            "select * from nhomtintuc_cap1 where idnhomtintuc_cap1 = " +DanhMucID +";" +
            "select * from nhomtintuc_cap2 where idnhomtintuc_cap1 = " +DanhMucID +";" +
            "select idtintuc,idnhomtintuc_cap1,idnhomtintuc_cap2,tieude,noidung,anhdaidien,anhnoidung,format(ngaydang,'dd/MM/yyyy') as ngaydang,is_active from tintuc where idnhomtintuc_cap1 = " + DanhMucID +";";
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
            nhomtintuc_cap1:[],
            nhomtintuc_cap2:[],
            tintuc:[],
            title:'Tin tức',
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.nhomtintuc_cap1 = rows.recordsets[3];
            data.nhomtintuc_cap2 = rows.recordsets[4];
            data.tintuc = rows.recordsets[5];
        } catch (e) {
            res.redirect(`/admin-login`);
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/tintuc",data);
    }
    else {
        res.redirect(`/admin-login`);
    }
});

app.get("/admin/data/:id/:iddanhmuc_cap2",function (req,res){
    const IDDanhMucCap1 = req.params.id;
    const IDDanhMucCap2 = req.params.iddanhmuc_cap2;
    const sql_text="select * from tintuc where iddanhmuc_cap1 = " +IDDanhMucCap1 +" and iddanhmuc_cap2 = " +IDDanhMucCap2;
    db.query(sql_text,(err,response)=>{
        if (err) throw err
        res.json(response)
    });
})

app.get("/admin/tintuc/chitiet/:id", async function (req,res) {
    const TinTucID = req.params.id;
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text=default_sql+
            "select * from nhomtintuc_cap1;" +
            "select * from nhomtintuc_cap2;" +
            "select idtintuc,idnhomtintuc_cap1,idnhomtintuc_cap2,tieude,noidung,anhdaidien,anhnoidung,format(ngaydang,'yyyy-MM-dd') as ngaydang,is_active,caption from tintuc where idtintuc = " + TinTucID + ";" +
            "select nhomtintuc_cap1.idnhomtintuc_cap1,tennhomtintuc_cap1 from nhomtintuc_cap1,tintuc where nhomtintuc_cap1.idnhomtintuc_cap1=tintuc.idnhomtintuc_cap1 and idtintuc = " +  TinTucID + ";";
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
            nhomtintuc_cap1:[],
            nhomtintuc_cap2:[],
            tintuc:[],
            tendanhmuc:[],
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.nhomtintuc_cap1 = rows.recordsets[3];
            data.nhomtintuc_cap2 = rows.recordsets[4];
            data.tintuc = rows.recordsets[5];
            data.tendanhmuc = rows.recordsets[6];
        } catch (e) {

        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/chitiet",data);
    }
    else {
        res.redirect(`/admin-login`);
    }
})

app.get("/admin/themtintuc",async function (req,res) {
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql+
            "select * from nhomtintuc_cap2;" //+
            //"select * from nhomtintuc_cap2;";
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
            nhomtintuc_cap2:[],
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.nhomtintuc_cap2 = rows.recordsets[3];
        } catch (e) {
            res.redirect(`/admin-login`);
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/themtintuc",data);
    }
    else {
        res.redirect(`/admin-login`);
    }
})

app.post("/admin/themtintuc",async function (req,res) {
    var NgayDang = req.body.ngaydang;
    var Is_Active = req.body.is_active;
    const ThuMucCha = req.body.thumuccha;
    const ThuMucCon = req.body.thumuccon;
    const TieuDe = req.body.tieude;
    const NoiDung = req.body.noidung;
    const AnhDaiDien = req.body.anhdaidien;
    const AnhNoiDung = req.body.anhnoidung;
    const Caption = req.body.caption;
    if(Is_Active=='true') {
        Is_Active=1;
    } else {
        Is_Active=0;
    }
    const sql_text ="insert into tintuc(idnhomtintuc_cap1,idnhomtintuc_cap2,tieude,noidung,anhdaidien,anhnoidung,ngaydang,is_active,caption)"
    + `values(${ThuMucCha},${ThuMucCon},N'${TieuDe}',N'${NoiDung}',N'${AnhDaiDien}',N'${AnhNoiDung}','${NgayDang}',${Is_Active},N'${Caption}')`;
    db.query(sql_text);
    req.flash('info', '<div id="success-add-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Thêm tin tức thành công</strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>')
    res.redirect(`/admin/themtintuc`);
})

app.post("/admin/tintuc/chitiet/sua",function (req,res) {
    const TinTucID = req.body.idtintuc;
    var NgayDang = req.body.ngaydang;
    var Is_Active = req.body.is_active;
    const ThuMucCha = req.body.thumuccha;
    const ThuMucCon = req.body.thumuccon;
    const TieuDe = req.body.tieude;
    const NoiDung = req.body.noidung;
    const AnhDaiDien = req.body.anhdaidien;
    const AnhNoiDung = req.body.anhnoidung;
    const Caption = req.body.caption;
    if(Is_Active=='true') {
        Is_Active=1;
    } else {
        Is_Active=0;
    }
    const sql_text="update tintuc set idnhomtintuc_cap1 = " + `${ThuMucCha}, idnhomtintuc_cap2 = ${ThuMucCon},tieude = N'${TieuDe}', noidung = N'${NoiDung}', anhdaidien = N'${AnhDaiDien}', anhnoidung = N'${AnhNoiDung}', ngaydang = N'${NgayDang}', is_active = ${Is_Active}, caption = N'${Caption}' where idtintuc = ${TinTucID}`;
    db.query(sql_text);
    req.flash('info', '<div id="success-update-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Chỉnh sửa tin tức thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>')
    res.redirect(`/admin/tintuc/chitiet/${TinTucID}`);
    
})

app.post("/admin/tintuc/chitiet/xoa",async function (req,res) {
    const TinTucID = req.body.idtintuc;
    var IDThuMucCha;
    const sql_text="select idnhomtintuc_cap1 from tintuc where idtintuc = "+ `${TinTucID}` + ";delete from tintuc where idtintuc = " +`${TinTucID}` ;
    try {
        const rows = await db.query(sql_text);
        IDThuMucCha = rows.recordsets[0][0].idnhomtintuc_cap1;
    } catch (e) {

    }
    req.flash('info', '<div id="success-delete-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Xóa tin tức thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>')
    setTimeout(function a(){res.redirect(`/admin/tintuc/${IDThuMucCha}`);},1500);
    
})

app.get("/admin/dichvu/:id",async function (req,res) {
    const DichVuID = req.params.id;
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql
            + "select * from dichvucon where iddichvu = " + DichVuID
            + ";select * from dichvu where iddichvu = " +DichVuID
            + ";select idctkm,tieude,noidung,mactkm,format(ngaybatdau,'dd/MM/yyyy') as ngaybatdau,format(ngayketthuc,'dd/MM/yyyy') ngayketthuc, phantramkhuyenmai, is_active from ctkm where iddichvu = " + DichVuID;
        let data = {
            nhomsanpham: [],
            dichvu: [],
            nhomtintuc:[],
            dichvucon: [],
            ctkm: [],
            tendichvu:[],
            title: 'Dịch vụ',
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.dichvucon = rows.recordsets[3];
            data.tendichvu = rows.recordsets[4];
            data.ctkm = rows.recordsets[5];
        } catch (e) {
            res.redirect(`/admin-login`);
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/dichvu",data);
    }
    else {
        res.redirect(`/admin-login`);
    }
})

app.get("/admin/dichvu/chitiet/:id",async function (req,res) {
    const DichVuConID = req.params.id;
    sess = req.session;
    if (sess.TenDangNhap) {
        const sql_text=default_sql
        +"select * from dichvucon,dichvu where dichvu.iddichvu = dichvucon.iddichvu and iddichvucon = " + DichVuConID;
        let data = {
            nhomsanpham: [],
            dichvu: [],
            nhomtintuc:[],
            dichvucon: [],
            tendichvu:[],
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.dichvucon = rows.recordsets[3];
        } catch (e) {

        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/chitietdichvu",data );
    } else {
        res.redirect(`/admin-login`);
    }
})

app.post("/admin/dichvu/chitiet/sua",function (req,res) {
    const DichVuConID = req.body.iddichvucon;
    const MaDichVu = req.body.madichvu;
    const Gia = req.body.gia;
    var Is_Active = req.body.is_active;
    var TrangThai = req.body.trangthai;
    const NoiDung = req.body.noidung;
    const AnhDaiDien = req.body.anhdaidien;

    if(Is_Active=='true') {
        Is_Active=1;
    } else {
        Is_Active=0;
    }
    if(TrangThai=='true') {
        TrangThai=1;
    } else {
        TrangThai=0;
    }
    const sql_text = "update dichvucon set madichvucon = " + `N'${MaDichVu}'` + " ,gia = " + Gia + " ,is_active = " + Is_Active + " ,trangthai = " + TrangThai + " ,noidung = " + `N'${NoiDung}'` + " ,anhdaidien = " + `N'${AnhDaiDien}' where iddichvucon = ` + DichVuConID;
    db.query(sql_text);
    req.flash('info', '<div id="success-update-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Chỉnh sửa dịch vụ thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>')
    res.redirect(`/admin/dichvu/chitiet/${DichVuConID}`);
})

app.post("/admin/dichvu/chitiet/xoa",async function (req,res) {
    const DichVuConID = req.body.iddichvucon;
    var DichVuChaID;
    const sql_text = "select iddichvu from dichvucon where iddichvucon = "+ DichVuConID
    +";delete from dichvucon_ctkm where iddichvucon = " + DichVuConID
    +";delete from dichvucon where iddichvucon = " + DichVuConID ;
    try {
        const rows = await db.query(sql_text);
        DichVuChaID = rows.recordsets[0][0].iddichvu;
    } catch (e) {
        
    }
    req.flash('info', '<div id="success-delete-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Xóa dịch vụ thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>')
    res.redirect(`/admin/dichvu/${DichVuChaID}`);
})

app.get("/admin/dichvu/khuyenmai/chitiet/:id",async function (req,res) {
    const CTKMID = req.params.id;
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql
            +"select tendichvu,idctkm,tieude,noidung,mactkm,format(ngaybatdau,'yyyy-MM-dd') as ngaybatdau,format(ngayketthuc,'yyyy-MM-dd') as ngayketthuc,phantramkhuyenmai,is_active,ctkm.iddichvu from ctkm,dichvu where ctkm.iddichvu=dichvu.iddichvu and idctkm =" + CTKMID
            +"select id,idctkm,madichvucon from dichvucon,dichvucon_ctkm where dichvucon.iddichvucon = dichvucon_ctkm.iddichvucon and idctkm = " + CTKMID
            +"select madichvucon from dichvucon where iddichvu = (select iddichvu from ctkm where idctkm =" + CTKMID+")" 
            +"select tendichvu from dichvu,ctkm where ctkm.iddichvu = dichvu.iddichvu and idctkm = " + CTKMID;
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
            ctkm:[],
            ctkm_dichvu:[],
            madichvucon:[],
            message: req.flash('info'),
            CTKMID : CTKMID,
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.ctkm = rows.recordsets[3];
            data.ctkm_dichvu = rows.recordsets[4];
            data.madichvucon= rows.recordsets[5];
        } catch (e) {
            
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/chitietkhuyenmai",data );
    }
    else {
        res.redirect(`/admin-login`);
    }
})

app.post("/admin/dichvu/khuyenmai/sua",function (req,res) {
    const IDCTKM = req.body.idctkm;
    const MaCTKM = req.body.mactkm;
    const PhanTramKM = req.body.phantramkhuyenmai;
    var Is_Active = req.body.is_active;
    var NgayBatDau = req.body.ngaybatdau;
    var NgayKetThuc = req.body.ngayketthuc;
    const TieuDe = req.body.tieude;
    const NoiDung = req.body.noidung;
    if(Is_Active=='true') {
        Is_Active=1;
    } else {
        Is_Active=0;
    }
    const sql_text = "update ctkm set mactkm = " + `N'${MaCTKM}'` + ", phantramkhuyenmai = " + PhanTramKM + ", is_active = " + Is_Active + ", ngaybatdau = " + `'${NgayBatDau}'` + ", ngayketthuc = " + `'${NgayKetThuc}'` + ", tieude = " + `N'${TieuDe}'` + ", noidung = " + `N'${NoiDung}'` + " where idctkm = " + IDCTKM;
    db.query(sql_text);
    req.flash('info', '<div id="success-update-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Chỉnh sửa khuyến mại thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>');
    res.redirect(`/admin/dichvu/khuyenmai/chitiet/${IDCTKM}`)

})

app.post("/admin/dichvu/khuyenmai/xoa",async function (req,res) {
    const IDCTKM = req.body.idctkm;
    var IDDichVu;
    const sql_text = "select iddichvu from ctkm where idctkm = " + IDCTKM +
    ";delete from dichvucon_ctkm where idctkm = " + IDCTKM +
    ";delete from ctkm where idctkm = " + IDCTKM ;
    try {
        const rows = await db.query(sql_text);
        IDDichVu = rows.recordsets[0][0].iddichvu;
    } catch (e) {

    }
    req.flash('info', '<div id="success-delete-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Xóa khuyến mại thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>')
    res.redirect(`/admin/dichvu/${IDDichVu}`);
})

app.post("/admin/dichvu/khuyenmai/apdung",function (req,res) {
    MaDichVuCon = req.body.madichvucon;
    IDCTKM = req.body.idctkm;
    const sql_text = "insert into dichvucon_ctkm(iddichvucon,idctkm) values ((Select iddichvucon from dichvucon where madichvucon='"+MaDichVuCon+"'),"+IDCTKM+")";
    if(!MaDichVuCon) {
        req.flash('info', '<div id="success-update-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
                '  <strong>Chưa có dịch vụ được chọn </strong> ' +
                '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
                '    <span aria-hidden="true">&times;</span>\n' +
                '  </button>\n' +
                '</div>');
        res.redirect(`/admin/dichvu/khuyenmai/chitiet/${IDCTKM}`)
    } else {
        db.query(sql_text,error => {
            if(error) {
                req.flash('info', '<div id="success-update-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
                    '  <strong>Chương trình đã được áp dụng </strong> ' +
                    '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
                    '    <span aria-hidden="true">&times;</span>\n' +
                    '  </button>\n' +
                    '</div>');
                res.redirect(`/admin/dichvu/khuyenmai/chitiet/${IDCTKM}`)
            } else {
                req.flash('info', '<div id="success-update-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
                    '  <strong>Áp dụng thành công </strong> ' +
                    '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
                    '    <span aria-hidden="true">&times;</span>\n' +
                    '  </button>\n' +
                    '</div>');
                res.redirect(`/admin/dichvu/khuyenmai/chitiet/${IDCTKM}`)
            }
        });
    }
})

app.get("/admin/dichvu/khuyenmai/boapdung/:id",async function(req,res){
    IDDichVu_CTKM = req.params.id;
    var IDCTKM;
    const sql_text = "select * from dichvucon_ctkm where id = " + IDDichVu_CTKM +";delete from dichvucon_ctkm where id =" + IDDichVu_CTKM;
    try {
        const rows = await db.query(sql_text);
        IDCTKM = rows.recordsets[0][0].idctkm;
    } catch (e) {

    }
    req.flash('info', '<div id="success-delete-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Bỏ áp dụng dịch vụ thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>')
    res.redirect(`/admin/dichvu/khuyenmai/chitiet/${IDCTKM}`);
    
})

app.get("/admin/sanpham/:id",async function (req,res){
    const NhomSanPhamID = req.params.id;
    sess = req.session;
    if (sess.TenDangNhap) {
        const sql_text=default_sql+
        "select * from nhomsanpham where idnhomsanpham = " +NhomSanPhamID +
        "; select * from sanpham where idnhomsanpham = " + NhomSanPhamID;
        let data = {
            nhomsanpham: [],
            dichvu: [],
            nhomtintuc:[],
            nhomsanphamhientai:[],
            sanpham:[],
            title:'Sản phẩm',
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.nhomsanphamhientai = rows.recordsets[3];
            data.sanpham = rows.recordsets[4];
        } catch (e){

        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/sanpham",data );
    } else {
        res.redirect(`/admin-login`);
    }
})

app.get("/admin/sanpham/chitiet/:id",async function(req,res){
    IDSanPham = req.params.id;
    sess = req.session;
    if (sess.TenDangNhap) {
        const sql_text=default_sql + 
        "select * from sanpham where idsanpham = " + IDSanPham;
        let data = {
            nhomsanpham: [],
            dichvu: [],
            nhomtintuc:[],
            sanpham:[],
            title:'Sản phẩm',
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
            data.sanpham = rows.recordsets[3];
        } catch (e) {

        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/chitietsanpham",data);
    } else {
        res.redirect(`/admin-login`);
    }
    
})

app.post("/admin/sanpham/chitiet/sua",async function(req,res){
    const IDNhomSanPham = req.body.idnhomsanpham;
    const IDSanPham = req.body.idsanpham;
    const MaSanPham = req.body.masanpham;
    var Is_Active = req.body.is_active;
    var TrangThai = req.body.trangthai;
    const Gia = req.body.gia;
    const TenSanPham = req.body.tensanpham;
    const PhuKien = req.body.phukien;
    const MoTa = req.body.mota;
    const AnhDaiDien = req.body.anhdaidien;
    const AnhNoiDung = req.body.anhnoidung;
    if(Is_Active=='true') {
        Is_Active=1;
    } else {
        Is_Active=0;
    }
    if(TrangThai=='true') {
        TrangThai=1;
    } else {
        TrangThai=0;
    }
    const sql_text = "update sanpham set idnhomsanpham = " + IDNhomSanPham + ", masanpham = " + `N'${MaSanPham}'` + ", is_active = " + Is_Active + ", trangthai = " + TrangThai + ", gia = " + Gia + ", tensanpham = " + `N'${TenSanPham}'` + ", phukien = " + `N'${PhuKien}'` +", mota = " + `N'${MoTa}'` + ", anhdaidien = " + `N'${AnhDaiDien}'` + ", anhnoidung = " + `N'${AnhNoiDung}'` + "where idsanpham = " + IDSanPham;
    db.query(sql_text);
    req.flash('info', '<div id="success-update-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Chỉnh sửa sản phẩm thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>');
    res.redirect(`/admin/sanpham/chitiet/${IDSanPham}`)
})

app.post("/admin/sanpham/chitiet/xoa",async function(req,res){
    const IDSanPham = req.body.idsanpham;
    var IDNhomSanPham;
    const sql_text = "select nhomsanpham.idnhomsanpham from nhomsanpham,sanpham where nhomsanpham.idnhomsanpham = sanpham.idnhomsanpham and idsanpham = " +IDSanPham+
    ";delete from sanpham where idsanpham = " + IDSanPham;
    try {
        const rows=await db.query(sql_text);
        IDNhomSanPham= rows.recordsets[0][0].idnhomsanpham;
    } catch (e) {

    }
    req.flash('info', '<div id="success-delete-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
        '  <strong>Xóa sản phẩm thành công </strong> ' +
        '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
        '    <span aria-hidden="true">&times;</span>\n' +
        '  </button>\n' +
        '</div>')
    res.redirect(`/admin/sanpham/${IDNhomSanPham}`);
})

app.get("/admin/themdichvu",async function (req,res) {
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql;
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
        } catch (e) {
            res.redirect(`/admin-login`);
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/themdichvu",data);
    }
    else {
        res.redirect(`/admin-login`);
    }

})

app.post("/admin/themdichvu", function (req,res) {
    IDDichVu = req.body.iddichvu;
    MaDichVuCon = req.body.madichvucon.toUpperCase();
    Gia = req.body.gia;
    Is_Active = req.body.is_active;
    TrangThai = req.body.trangthai;
    NoiDung = req.body.noidung;
    AnhDaiDien = req.body.anhdaidien;
    
    const sql_text = "insert into dichvucon(iddichvu,madichvucon,gia,is_active,trangthai,noidung,anhdaidien)" + `values(${IDDichVu},N'${MaDichVuCon}',${Gia},${Is_Active},${TrangThai},N'${NoiDung}',N'${AnhDaiDien}')`;
    db.query(sql_text);
    req.flash('info', '<div id="success-add-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
    '  <strong>Thêm dịch vụ thành công</strong> ' +
    '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
    '    <span aria-hidden="true">&times;</span>\n' +
    '  </button>\n' +
    '</div>')
    res.redirect(`/admin/dichvu/${IDDichVu}`);

})

app.get("/admin/themkhuyenmai",async function (req,res) {
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql;
            
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
            message: req.flash('info'),
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
        } catch (e) {
            res.redirect(`/admin-login`);
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/themkhuyenmai",data);
    }
    else {
        res.redirect(`/admin-login`);
    }

})

app.post("/admin/themkhuyenmai",function (req,res){
    IDDichVu = req.body.iddichvu;
    MaCTKM = req.body.mactkm.toUpperCase();
    PhanTramKM = req.body.phantramkhuyenmai;
    NgayBatDau = req.body.ngaybatdau;
    NgayKetThuc = req.body.ngayketthuc;
    TieuDe = req.body.tieude;
    NoiDung = req.body.noidung;
    const sql_text = "insert into ctkm(mactkm,ngaybatdau,ngayketthuc,phantramkhuyenmai,is_active,iddichvu,tieude,noidung) "+ `values(N'${MaCTKM}','${NgayBatDau}','${NgayKetThuc}',${PhanTramKM},0,${IDDichVu},N'${TieuDe}',N'${NoiDung}')`;
    db.query(sql_text);
    req.flash('info', '<div id="success-add-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
    '  <strong>Thêm khuyến mại thành công</strong> ' +
    '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
    '    <span aria-hidden="true">&times;</span>\n' +
    '  </button>\n' +
    '</div>')
    res.redirect(`/admin/dichvu/${IDDichVu}`);

})

app.get("/admin/themsanpham",async function(req, res)  {
    sess = req.session;
    if(sess.TenDangNhap) {
        const sql_text = default_sql;
        let data = {
            nhomsanpham:[],
            dichvu:[],
            nhomtintuc:[],
            message:null,
        }
        try {
            const rows = await db.query(sql_text);
            data.nhomsanpham = rows.recordsets[0];
            data.dichvu = rows.recordsets[1];
            data.nhomtintuc = rows.recordsets[2];
        } catch (e) {
            res.redirect(`/admin-login`);
        }
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        res.render("admin/themsanpham",data);
    }
    else {
        res.redirect(`/admin-login`);
    }
})

app.post("/admin/themsanpham",function (req,res) {
    IDNhomSanPham=req.body.idnhomsanpham;
    MaSanPham=req.body.masanpham.toUpperCase();
    Is_Active = req.body.is_active;
    TrangThai = req.body.trangthai;
    Gia = req.body.gia;
    TenSanPham = req.body.tensanpham;
    PhuKien = req.body.phukien;
    MoTa = req.body.mota;
    AnhDaiDien = req.body.anhdaidien;
    AnhNoiDung = req.body.anhnoidung;
    const sql_text = "insert into sanpham(idnhomsanpham,masanpham,is_active,trangthai,gia,tensanpham,phukien,mota,anhdaidien,anhnoidung) " + `values(N'${IDNhomSanPham}',N'${MaSanPham}',${Is_Active},${TrangThai},${Gia},N'${PhuKien}',N'${TenSanPham}',N'${MoTa}',N'${AnhDaiDien}',N'${AnhNoiDung}')`;
    db.query(sql_text);
    req.flash('info', '<div id="success-add-alert" class="alert alert-warning alert-dismissible fade show" role="alert">\n' +
    '  <strong>Thêm sản phẩm thành công</strong> ' +
    '  <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n' +
    '    <span aria-hidden="true">&times;</span>\n' +
    '  </button>\n' +
    '</div>')
    res.redirect(`/admin/sanpham/${IDNhomSanPham}`);

})

app.get("/logout",function (req,res) {
    res.redirect(`/admin-login`)
})

app.get("/error",function (req,res) {
    res.render("pages/404");
})

//app.get('*',function(req,res){
//    res.redirect('/error');
//});

