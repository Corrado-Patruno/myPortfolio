/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById('nav-menu'),
    navToggle = document.getElementById('nav-toggle'),
    navClose = document.getElementById('nav-close')

/* Menu show */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu')
    })
}

/* Menu hidden */
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu')
    })
}

/*=============== CHANGE BACKGROUND HEADER ===============*/
const bgHeader = () => {
    const header = document.getElementById('header')
    // Add a class if the bottom offset is greater than 50 of the viewport
    this.scrollY >= 50 ? header.classList.add('bg-header')
        : header.classList.remove('bg-header')
}
window.addEventListener('scroll', bgHeader)


/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button');
const darkTheme = 'dark-theme';
const iconTheme = 'ri-sun-line';

// Function to check the current theme
const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light';
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'ri-moon-line' : 'ri-sun-line';

// Function to update the theme and images based on the current theme
function updateThemeAndImages() {
    const currentTheme = getCurrentTheme();
    const logo = document.getElementById('logo');
    if (logo) { // Verifica che l'elemento logo esista effettivamente
        logo.src = currentTheme === 'dark' ? 'assets/img/Accenture-Logo-dark.png' : 'assets/img/Accenture-Logo.png';
    }

    // Update the images for cards
    const images = document.querySelectorAll('.work__img');
    images.forEach(img => {
        // Ensure the src changes only after the opacity transition has finished
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = currentTheme === 'dark' ? 'assets/img/Coming_Soon_dark.png' : 'assets/img/Coming_Soon.png';
            img.style.opacity = '1';
        }, 100); // The delay here should match the CSS transition time
    });
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    document.body.classList.toggle(darkTheme);
    themeButton.classList.toggle(iconTheme);

    // Save the current theme and icon
    localStorage.setItem('selected-theme', getCurrentTheme());
    localStorage.setItem('selected-icon', getCurrentIcon());

    // Update the theme and images
    updateThemeAndImages();
});

// Initialize theme and images on page load
document.addEventListener('DOMContentLoaded', () => {
    // Apply the saved theme if any
    const selectedTheme = localStorage.getItem('selected-theme');
    const selectedIcon = localStorage.getItem('selected-icon');
    if (selectedTheme) {
        document.body.classList.add(selectedTheme === 'dark' ? darkTheme : '');
        themeButton.classList.add(selectedIcon === 'ri-moon-line' ? iconTheme : '');
    }

    updateThemeAndImages();
});
