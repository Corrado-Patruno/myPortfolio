/*=============== EMAIL JS ===============*/
// Gestione invio form contatti tramite EmailJS.
// NOTE: sostituire serviceID/templateID/publicKey con i propri valori di produzione.
const contactForm = document.getElementById('contact-form'),
    contactMessage = document.getElementById('contact__message')

const sendEmail = (e) => {
    e.preventDefault()

    // serviceID - templateID - #form - publicKey
    emailjs.sendForm('service_yy09ugj', 'template_cfdzotq', '#contact-form', '5-uHiiY7aJFzWTdgU')
        .then(() => {
            // Show sent message
            contactMessage.textContent = 'Message sent successfully ✅'
            
            // Track successful form submission
            if (typeof trackFormSubmission === 'function') {
                trackFormSubmission('contact_form', true);
            }

            // Remove message after five seconds
            setTimeout(() => {
                contactMessage.textContent = ' '
            }, 5000)

            // Clear input fields
            contactForm.reset()
        }, () => {
            // Show error message
            contactMessage.textContent = 'Message not sent (service error) ❌'
            
            // Track failed form submission
            if (typeof trackFormSubmission === 'function') {
                trackFormSubmission('contact_form', false);
            }
        })
}

contactForm.addEventListener('submit', sendEmail);
