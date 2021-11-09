/*
1. user buka https://tarry-tree-increase.glitch.me/
2. user scan qr
3. user buka link yg dari qr
4. scanner kirim iduser ke sheet
5. index cek apakah sudah ada iduser di sheet
6. klo sudah ada, ==> pindah ke pos1.hbs
7. klo blm, ==> setelah 1 menit,  hentikan setInterval dan munculkan tombol "buka kembali", untuk hemat kuota sheet API
8. pos1 tampilkan peta dan aset1
9. user scan aset1
10. video
*/
const qr = require("qrcode");
const idunik = require("uniqid");
const path = require("path");
const { google } = require("googleapis");
const urlss =
  "https://script.google.com/macros/s/AKfycbx1cFRpqw-d_Ck-LdKZ286HrtxdQ-koiOOnEiDhergAN4VPU0E/exec";
const fs = require("fs");
const ytdl = require("ytdl-core");

const auth = new google.auth.GoogleAuth({
  keyFile: "./src/credential.json",
  scopes: "https://www.googleapis.com/auth/spreadsheets"
});

const spreadsheetId = "1AzVP6Sv3Bk5y7tOqpEVlLx7HAMlARXQus3xf1NgXfmE";

const fastify = require("fastify")({
  logger: false
});

const favorites = [];

// fastify.register(require("fastify-axios"));

fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

fastify.register(require("fastify-formbody"));

fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});

  

//===================================================================
fastify.get("/google533aa18bac16ee48.html", function(request, reply) {
  reply.view("/google533aa18bac16ee48.html", {});
});

fastify.get("/", function(request, reply) {
  // ytdl('https://www.youtube.com/watch?v=v5839hUuTGE')
  // .pipe(fs.createWriteStream('video.mp4'));
  
  const idbaru = idunik();
  let alamat = "https://spicy-carbonated-den.glitch.me/scanner?id=" + idbaru;
  favorites.push(idbaru);

  qr.toDataURL(alamat).then(url => {
    let params = { iduser: idbaru, qrurl: url };
    reply.view("/src/pages/index.hbs", params);
  });
  
});

//  POS 1
fastify.get("/syuaib", function(request, reply) {
  reply.view("./src/pages/pos1.hbs", {});
});

// SETELAH USER SCAN QR, SCANNER TERBUKA, DAN IDUSER DICATAT DI G.SHEETS
fastify.get("/scanner", async function(request, reply) {
  let params = { iduser: request.query.id };
  const absen = await barisUser(params.iduser);

  if (!absen) {
    await append(params.iduser);
    reply.view("/src/pages/scanner.hbs", params);
  }else{
    reply.view("/src/pages/scanner.hbs", params);
  }
});

//======================================================================
fastify.post("/", async function(request, reply) {
  let isi = JSON.parse(request.body);
  console.log(isi)
  let params = {
    iduser: isi.iduser,
    pos: isi.pos,
    aset: isi.aset,
    cek: isi.cek
  };

  // apakah id siswa sudah ada di sheets
  if (params.cek) {
    const absen = await barisUser(params.iduser);

      console.log(absen)
    if (absen) {
      reply.send({ ke: "/syuaib" });
      const hasil = await posisiTerakhir(params.iduser);

      let tulisdi = {
        posisi: `${keHuruf(hasil.kolom + 1)}${hasil.baris}`
      };

      keHuruf(hasil.kolom);

      if (hasil.value.includes("pos")) {
        reply.send(tulisdi);
      } else {
        reply.send(false);
      }
    }
    // if(baris) {
    //   reply.send({ ke: "/syuaib" });
    // }
  }
});

// TIAP ASSET HARUS kirim iduser, pos berapa, asset apa
fastify.post("/scanner", async function(request, reply) {
  let isi = JSON.parse(request.body);
  let params = {
    iduser: isi.iduser,
    pos: isi.pos,
    aset: isi.aset,
    cek: isi.cek
  };

  // posisi kolom terakhirnya dimana?
  const hasil = await posisiTerakhir(params.iduser);
  const kolom = keHuruf(hasil.kolom + 1);
  const baris = await barisUser(params.iduser);
  let ok;

  if (!params.pos) {
    ok = await tulis(params.pos + params.aset, `${kolom}${baris}`);
  } else {
    ok = await tulis(params.iduser, `A${baris}`);
  }
  reply.send(ok);
});



async function updatePosisi(iduser, isix){
  // kolom, baris value
  const posisi = await posisiTerakhir(iduser);
  const kolomHuruf = keHuruf(posisi.kolom);
  await tulis(isix, `${kolomHuruf}${posisi.baris}`);
  return "ok";
  }

function keHuruf(num) {
  return String.fromCharCode(num - 1 + 65);
}

async function posisiTerakhir(iduser) {
  // [[a, b, c, d]]
  let baris = await barisUser(iduser);
  const hasil = await baca(`B${baris}:AR${baris}`);
  return {
    kolom: hasil.data.values[0].length + 1,
    baris: baris,
    value: hasil.data.values[0][hasil.data.values[0].length - 1]
  };
}

async function barisUser(iduser) {
  let posisi = "";
  const hasilBaca = await baca("A:A", "COLUMNS");
  let strHasilBaca = hasilBaca.data.values[0];

  for (let i = 0; i < strHasilBaca.length; i++) {
    if (strHasilBaca[i] == iduser) {
      posisi = strHasilBaca.indexOf(strHasilBaca[i]) + 1;
    }
  }

  return posisi;
}

async function autorisasi() {
  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  return googleSheets;
}

async function tulis(isi, rangex) {
  const googleSheets = await autorisasi();
  // update value
  const hasilUpdate = await googleSheets.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: `Sheet1!${rangex}`,
    valueInputOption: "RAW",
    resource: {
      values: [[isi]]
    }
  });

  return hasilUpdate;
}

async function append(isi) {
  const googleSheets = await autorisasi();
  // append data
  const hasilAppend = await googleSheets.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: "Sheet1!A:A",
    valueInputOption: "RAW",
    resource: {
      values: [[isi]]
    }
  });

  return hasilAppend;
}

async function baca(rangex, dimensi = "ROWS") {
  const googleSheets = await autorisasi();

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: `Sheet1!${rangex}`,
    majorDimension: dimensi
  });

  return getRows;
}

async function hapus(rangex) {
  const googleSheets = await autorisasi();

  // hapus
  const hasilHapus = await googleSheets.spreadsheets.values.clear({
    auth,
    spreadsheetId,
    range: `Sheet1!${rangex}`,
    resource: {}
  });

  return hasilHapus;
}

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
