
let modali = document.getElementById('modali');
let modalTemplate = `<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title" id="staticBackdropLabel">Pengembaraan Virtual</h5>
      </div>
      <div class="modal-body">
        Pindah kode QR menggunakan pemindai QR apa saja di HP kamu, kalau belum ada, silahkan download di playstore/appstore terlebih dahulu
      </div>
      <div class="modal-footer">
        <button id="btnModal" type="button" class="btn btn-secondary" data-bs-dismiss="modal">Kami sudah siap</button>
      </div>
    </div>
  </div>
</div>`

function cekServer() {
  console.log("cekServer running..")
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
      if(resp.ke){
          location.assign(resp.ke);
       }
    });
}

function cekStatus() {
  let interv = setInterval(cekServer, 5000);
  
  setTimeout(()=>{
    clearInterval(interv)
    modali.innerHTML = modalTemplate;
    let myModal = new bootstrap.Modal(document.getElementById('staticBackdrop'))
    let btnModal = document.getElementById('btnModal')
      
    myModal.show()
    
    btnModal.addEventListener('click', function(){
        myModal.hide();
        cekStatus()
    })
      
  }, 60000)
}

let aset = document.getElementsByClassName('aset');

for(let i = 0; i < aset.length; i++){
  aset[i].addEventListener('click', ()=>{
    if(aset[i].className != 'aset asetbesar'){
    aset[i].setAttribute('class', 'aset asetbesar');
    }else{
      aset[i].setAttribute('class', 'aset');
    }
  })
}