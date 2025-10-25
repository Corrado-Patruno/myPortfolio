// Google Analytics 4 - Eventi personalizzati
// Tracciamento delle interazioni importanti del portfolio

/**
 * Traccia il download del CV
 */
function trackCVDownload(fileName, pageLocation) {
  if (typeof gtag === 'function') {
    gtag('event', 'download_cv', {
      'event_category': 'engagement',
      'event_label': fileName,
      'file_name': fileName,
      'page_location': pageLocation,
      'value': 1
    });
    console.log('📊 GA4: CV download tracked -', fileName, 'from', pageLocation);
  }
}

/**
 * Traccia click sui progetti
 */
function trackProjectClick(projectName, projectURL) {
  if (typeof gtag === 'function') {
    gtag('event', 'click_project', {
      'event_category': 'engagement',
      'event_label': projectName,
      'project_name': projectName,
      'project_url': projectURL
    });
    console.log('📊 GA4: Project click tracked -', projectName);
  }
}

/**
 * Traccia invio form contatti
 */
function trackFormSubmission(formName, success) {
  if (typeof gtag === 'function') {
    gtag('event', success ? 'form_submit_success' : 'form_submit_error', {
      'event_category': 'conversion',
      'event_label': formName,
      'form_name': formName,
      'success': success
    });
    console.log('📊 GA4: Form submission tracked -', formName, success ? '✅' : '❌');
  }
}

/**
 * Traccia click sui social links
 */
function trackSocialClick(platform, section) {
  if (typeof gtag === 'function') {
    gtag('event', 'click_social', {
      'event_category': 'engagement',
      'event_label': platform,
      'social_platform': platform,
      'section': section
    });
    console.log('📊 GA4: Social click tracked -', platform, 'in', section);
  }
}

/**
 * Traccia lettura articoli blog
 */
function trackArticleRead(articleTitle, articleSlug, readTime) {
  if (typeof gtag === 'function') {
    gtag('event', 'article_read', {
      'event_category': 'engagement',
      'event_label': articleTitle,
      'article_title': articleTitle,
      'article_slug': articleSlug,
      'read_time_seconds': readTime
    });
    console.log('📊 GA4: Article read tracked -', articleTitle, `(${readTime}s)`);
  }
}

// ============================================================================
// AUTO-ATTACH TRACKING
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  
  // 1. SOCIAL LINKS TRACKING (tutti i social nel sito)
  const socialLinks = document.querySelectorAll('.home__social-link, .footer__social-link');
  socialLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      let platform = 'unknown';
      let section = 'unknown';
      
      // Identifica la piattaforma dall'icona
      if (this.querySelector('.ri-linkedin-box-fill')) platform = 'linkedin';
      else if (this.querySelector('.ri-github-fill')) platform = 'github';
      else if (this.querySelector('.ri-twitter-x-fill, .ri-twitter-x-line')) platform = 'twitter';
      else if (this.querySelector('.ri-instagram-line')) platform = 'instagram';
      
      // Identifica la sezione
      if (this.classList.contains('home__social-link')) section = 'home';
      else if (this.classList.contains('footer__social-link')) section = 'footer';
      
      trackSocialClick(platform, section);
    });
  });
  
  // 2. PROGETTI TRACKING (link nella pagina work)
  const projectLinks = document.querySelectorAll('.work__link');
  projectLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      const projectCard = this.closest('.work__card');
      const projectTitle = projectCard ? projectCard.querySelector('.work__title')?.textContent : 'Unknown Project';
      const projectURL = this.href;
      
      trackProjectClick(projectTitle, projectURL);
    });
  });
  
  // 3. BLOG ARTICLES TRACKING (tempo di lettura)
  if (window.location.pathname.includes('post.html')) {
    let startTime = Date.now();
    
    // Traccia quando l'utente lascia la pagina
    window.addEventListener('beforeunload', function() {
      const readTime = Math.floor((Date.now() - startTime) / 1000);
      const articleTitle = document.querySelector('.post-title')?.textContent || 'Unknown Article';
      const articleSlug = new URLSearchParams(window.location.search).get('slug') || 'unknown';
      
      // Traccia solo se ha letto per almeno 10 secondi
      if (readTime >= 10) {
        trackArticleRead(articleTitle, articleSlug, readTime);
      }
    });
  }
  
  console.log('📊 GA4 Events: Tracking initialized');
});
