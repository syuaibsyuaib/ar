let iduser = localStorage.getItem("iduser");


const socket = io();
socket.emit("join room", iduser);
socket.on("status join", pesan => {
   console.log(`%cBerhasil masuk room : ${pesan}`, 'color:yellow;font-size:20px')
});


//TEMPLATE MODAL SELAMAT
function templateModal(pesan, judul) {
  let modalTemplate = `<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                        <div class="modal-dialog">
                          <div class="modal-content">
                            <div class="modal-header bg-warning text-primary">
                              <h5 class="modal-title" id="staticBackdropLabel">${judul}</h5>
                            </div>
                            <div class="modal-body">
                              ${pesan}
                            </div>
                            <div class="modal-footer">
                              <button id="btnModal" type="button" class="btn btn-danger text-light" data-bs-dismiss="modal">Kami sudah siap</button>
                            </div>
                          </div>
                        </div>
                      </div>`;
  
  return modalTemplate
}

async function pesanModal(pesan, judul){
  let modalTemplate = await templateModal(pesan, judul)
  await $("body").prepend(modalTemplate);
  let modalObj = new bootstrap.Modal(document.getElementById("staticBackdrop"));
  let btnModal = document.getElementById("btnModal");
  let arrModalObj = [modalObj, btnModal];
  return arrModalObj;
}


function templateToken(){
  let modalToken = `<div class="modal fade" id="modalInputToken" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                      <div class="modal-dialog">
                        <div class="modal-content">
                          <div class="modal-header bg-danger text-light">
                            <h5 class="modal-title" id="staticBackdropLabel">MASUKKAN KODE TOKEN KALIAN DISINI</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                          </div>
                          <div class="modal-body">
                            <div class="text-center">
                            <a href="https://www.freepnglogos.com/pics/key" title="Image from freepnglogos.com"><img src="https://www.freepnglogos.com/uploads/key-png/key-keys-successful-performance-david-reed-brown-14.png" width="200" alt="key, keys successful performance david reed brown" /></a>
                              <br/>
                              <input type="text" style="width:80%; margin:auto" class="form-control border-danger mt-3"></input>
                            </div>
                          </div>
                          <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                            <button id="btnInputToken" type="button" class="btn btn-success">Konfirmasi</button>
                          </div>
                        </div>
                      </div>
                    </div>`

  return modalToken
}

async function modalInputToken(){
  let tokenTemplate = await templateToken();
  $("body").prepend(tokenTemplate);
  let modalObj = new bootstrap.Modal(document.getElementById("modalInputToken"));
  let btnInputToken = document.getElementById("btnInputToken");
  let arrModalObj = [modalObj, btnInputToken];
  return arrModalObj;
}





//ASET MEMBESAR KLO DI KLIK
let aset = document.getElementsByClassName("aset");

for (let i = 0; i < aset.length; i++) {
  aset[i].addEventListener("click", () => {
    if (aset[i].className != "aset asetbesar") {
      aset[i].setAttribute("class", "aset asetbesar");
    } else {
      aset[i].setAttribute("class", "aset");
    }
  });
}

// ALTERNATIF SOCKET ==> KLO LAMA TIDAK SCAN QR, MUNCUL PESAN DAN MATIKAN SEMENTARA PENGECEKAN SERVER
function cekServer() {
  console.log("cekServer running..");
  fetch("/", {
    method: "POST",
    body: JSON.stringify({
      cek: true,
      iduser: localStorage.getItem("iduser")
    })
  })
    .then(res => {
      return res.json();
    })
    .then(resp => {
      if (resp.ke) {
        location.assign(resp.ke);
      }
    });
}


function cekStatus(pesan, judul) {
  let modali = document.getElementById("modali");
  
  let interv = setInterval(cekServer, 5000);

  setTimeout(() => {
    clearInterval(interv);
    modali.innerHTML = pesanModal(pesan, judul);
    let myModal = new bootstrap.Modal(
      document.getElementById("staticBackdrop")
    );
    let btnModal = document.getElementById("btnModal");

    myModal.show();

    btnModal.addEventListener("click", function() {
      myModal.hide();
      cekStatus();
    });
  }, 60000);
}
