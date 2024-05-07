var loader = document.getElementById("preloader");

window.addEventListener("load", function () {
  // Imposta un timer di 2 secondi (2000 millisecondi)
  setTimeout(function () {
    loader.style.display = "none";
  }, 1300); // 2000 millisecondi equivalgono a 2 secondi
});

function progress() {
  var progressBar = document.querySelector('.progress-bar');
  var progress = document.querySelector('.progress');
  var percent = document.querySelector('#h1Preload');
  var count = 4;
  var per = 10; // Larghezza iniziale della barra di progresso interna
  var padding = parseInt(window.getComputedStyle(progressBar).paddingLeft) + parseInt(window.getComputedStyle(progressBar).paddingRight);
  var maxWidth = progressBar.clientWidth - padding; // Larghezza interna della progress-bar meno il padding

  var loading = setInterval(animate, 10); // Esegui ogni 10 millisecondi per completare in 1 secondo

  function animate() {
    if (count >= 100) {
      progress.style.width = maxWidth + 'px'; // Assicurati che la barra non superi la larghezza massima
      percent.textContent = "100%";
      percent.classList.add("text-blink");
      clearInterval(loading); // Ferma il setInterval
    } else {
      count = count + (96 / 100); // Incrementa count per completare in 1 secondo
      per = per + (maxWidth - 10) / 100; // Incrementa per in base alla larghezza della barra di progresso esterna
      progress.style.width = Math.min(per, maxWidth) + 'px'; // Imposta la larghezza senza superare maxWidth
      percent.textContent = Math.round(count) + '%'; // Arrotonda e imposta il testo di percentuale
    }
  }
}

// Considera di avviare questa funzione quando il documento è completamente caricato
document.addEventListener('DOMContentLoaded', progress);
