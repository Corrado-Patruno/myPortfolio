// Preloader elegante - Si mostra solo la prima volta durante la sessione
// Lo script inline nel <head> previene il flash, questo gestisce l'animazione

(function() {
  'use strict';
  
  var loader = document.getElementById("preloader");
  var hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader');
  
  // Se già visto, non fare nulla (già nascosto dallo script inline)
  if (hasSeenPreloader) {
    return;
  }
  
  // Prima volta: esegui l'animazione completa
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (loader) {
        loader.style.display = "none";
      }
      // Salva che l'utente ha visto il preloader
      sessionStorage.setItem('hasSeenPreloader', 'true');
    }, 1300);
  });
  
  // Avvia l'animazione della barra di progresso
  document.addEventListener('DOMContentLoaded', function() {
    progress();
  });
  
  function progress() {
    var progressBar = document.querySelector('.progress-bar');
    var progress = document.querySelector('.progress');
    var percent = document.querySelector('#h1Preload');
    
    // Controllo sicurezza: se gli elementi non esistono, esci
    if (!progressBar || !progress || !percent) return;
    
    var count = 4;
    var per = 10; // Larghezza iniziale della barra di progresso interna
    var padding = parseInt(window.getComputedStyle(progressBar).paddingLeft) + 
                  parseInt(window.getComputedStyle(progressBar).paddingRight);
    var maxWidth = progressBar.clientWidth - padding; // Larghezza interna della progress-bar meno il padding

    var loading = setInterval(animate, 10); // Esegui ogni 10ms per un'animazione fluida

    function animate() {
      if (count >= 100) {
        progress.style.width = maxWidth + 'px'; // Assicurati che la barra non superi la larghezza massima
        percent.textContent = "100%";
        percent.classList.add("text-blink");
        clearInterval(loading); // Ferma l'animazione
      } else {
        count = count + (96 / 100);
        per = per + (maxWidth - 10) / 100; // Incremento proporzionale alla larghezza
        progress.style.width = Math.min(per, maxWidth) + 'px'; // Imposta la larghezza senza superare maxWidth
        percent.textContent = Math.round(count) + '%'; // Arrotonda e imposta il testo di percentuale
      }
    }
  }
  
})();
