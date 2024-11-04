/*=============== SERVICES MODAL ===============*/
const modal = document.querySelectorAll('.services__modal'),
    modalButton = document.querySelectorAll('.services__button'),
    modalClose = document.querySelectorAll('.services__modal-close')

let activeModal = (ModalClick) => {
    modal[ModalClick].classList.add('active-modal')
}

modalButton.forEach((modalButton, i) => {
    modalButton.addEventListener('click', () => {
        activeModal(i)
    })
})

modalClose.forEach((modalClose) => {
    modalClose.addEventListener('click', () => {
        modal.forEach((modalRemove) => {
            modalRemove.classList.remove('active-modal')
        })
    })
})

/*=============== SWIPER TESTIMONIAL ===============*/
const swiperTestimonial = new Swiper('.testimonial__swiper', {
    loop: true,
    spaceBetween: 32,
    grabCursor: true,

    pagination: {
        el: '.swiper-pagination1',
        dynamicBullets: true,
        clickable: true,
    },
})

/*=============== SWIPER WORKS EXPERIENCE ===============*/
  
    var swiper = new Swiper(".mySwiper", {
      slidesPerView: 3,
    spaceBetween:30,
     grabCursor: true,
     pagination: {
        el: '.swiper-pagination2',
        dynamicBullets: true,
        clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
      breakpoints: {
        "@0.00": {
          slidesPerView: 1,
          spaceBetween: 10,
        },
        "@0.75": {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        "@1.00": {
          slidesPerView: 3,
          spaceBetween: 30,
        },
        "@1.50": {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },
    });

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
    const scrollUp = document.getElementById('scroll-up')
    // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
    this.scrollY >= 350 ? scrollUp.classList.add('show-scroll')
        : scrollUp.classList.remove('show-scroll')
}
window.addEventListener('scroll', scrollUp)
