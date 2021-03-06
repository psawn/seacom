create table admin(
	id_admin int primary key identity(1,1),
	username varchar(250) unique not null,
	password varchar(250) not null,
	role varchar(250) check (role in(N'admin',N'writer')),
);
insert into admin(username,password,role) values ('admin','admin','admin')
create table nhomtintuc_cap1(
	idnhomtintuc_cap1 int primary key identity(1,1),
	tennhomtintuc_cap1 nvarchar(250) not null
);
create table nhomtintuc_cap2(
	idnhomtintuc_cap2 int primary key identity(1,1),
	idnhomtint_cap1 int references nhomtintuc_cap1(idnhomtintuc_cap1),
	tennhomtintuc_cap2 nvarchar(250) unique not null,
);
create table dichvu(
	iddichvu int primary key identity(1,1),
	tendichvu nvarchar(250) not null,
	mota nvarchar(max),
);
create table dichvucon(
	iddichvucon int primary key identity(1,1),
	iddichvu int references dichvu(iddichvu),
	madichvucon nvarchar(250) unique not null,
	gia decimal(12,4),
	is_active bit,
	trangthai bit,
	noidung nvarchar(max),
	anhdaidien nvarchar(250),
);
create table ctkm (
	idctkm int primary key identity(1,1),
	tieude nvarchar(max),
	noidung nvarchar(max),
	mactkm nvarchar(250) not null,
	ngaybatdau date,
	ngayketthuc date,
	phantramkhuyenmai int,
	is_active bit,
	iddichvu int
);
create table dichvucon_ctkm(
	id int primary key identity(1,1),
	iddichvucon int references dichvucon(iddichvucon),
	idctkm int references ctkm(idctkm)
);
create table lienhekhachhang(
	id int primary key identity(1,1),
	tencongty nvarchar(250) not null,
	tennguoilienhe nvarchar(250) not null,
	sdt varchar(20) not null,
	email varchar(250) not null
	tinnhan nvarchar(max),
	ngaygui date,
);

create table nhomsanpham(
	idnhomsanpham int primary key identity(1,1),
	manhomsanpham nvarchar(250) unique not null,
	tennhomsanpham nvarchar(250) not null,
);
create table sanpham(
	idsanpham int primary key identity(1,1),
	masanpham nvarchar(250) not null,
	tensanpham nvarchar(250) not null,
	idnhomsanpham int references nhomsanpham(idnhomsanpham)
	mota ntext,
	is_active bit,
	trangthai bit,
	gia decimal(12,4),
	anhdaidien nvarchar(250),
	anhnoidung nvarchar(250)
);
create table tintuc(
	idtintuc int primary key identity(1,1),
	idnhomtintuc_cap1 int references nhomtintuc_cap1(idnhomtintuc_cap1),
	idnhomtintuc_cap2 int references nhomtintuc_cap2(idnhomtintuc_cap2),
	tieude nvarchar(250) not null,
	noidung ntext,
	anhdaidien nvarchar(250),
	anhnoidung nvarchar(250),
	caption nvarchar(500),
	ngaydang date not null,
	is_active bit,
);