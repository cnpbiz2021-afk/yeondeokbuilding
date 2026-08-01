/* ==========================================================================
   Yeondeok Building Premium Landing Page Script
   Handles Header transitions, Mobile navigation, Swiper initialization,
   Scroll-reveal animations, Statistics count-up, and Form validation.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- Header Scroll Effect ---
  const header = document.querySelector('.main-header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Run once in case page starts scrolled

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMobileMenu = () => {
    mobileMenuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
    
    // Prevent body scroll when menu is active
    if (navMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

  // Close menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  // --- Initialize Swiper Slider ---
  const heroSwiper = new Swiper('.hero-swiper', {
    loop: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    speed: 1200,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.animate-fade-in');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // --- Statistics Count-up Animation ---
  const statsSection = document.querySelector('.stats-section');
  const statNumbers = document.querySelectorAll('.stat-num');
  let countUpTriggered = false;

  const countUp = (element) => {
    const target = parseInt(element.getAttribute('data-target'), 10);
    const duration = 1800; // 1.8 seconds
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing out quadratic function
      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);

      element.textContent = currentValue.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    requestAnimationFrame(updateCount);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countUpTriggered) {
        statNumbers.forEach(num => countUp(num));
        countUpTriggered = true;
        statsObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.25
  });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // --- Smooth Scrolling for Navigation ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const offsetPosition = targetElement.offsetTop - header.offsetHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Lease Contact Form (Google Sheets 연동) ---
  const leaseForm = document.getElementById('lease-form');
  const toastMessage = document.getElementById('toast-message');

  // ↓↓↓ Apps Script 배포 후 발급받은 웹 앱 URL을 여기에 붙여넣으세요 ↓↓↓
  const https://script.google.com/macros/s/AKfycbztSHKQfBGIaJCJUfBdEfaWWC-ZNQm6-oFV4DETHOAAcIzkpvr6auAsa2r6RLnz2fzR/exec = 'YOUR_DEPLOYED_WEB_APP_URL_HERE';

  if (leaseForm) {
    leaseForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation check
      const nameInput = document.getElementById('user-name');
      const phoneInput = document.getElementById('user-phone');
      const typeInput = document.getElementById('inquiry-type');
      const msgInput = document.getElementById('message');
      const agreement = document.getElementById('privacy-agreement');

      if (!nameInput.value.trim() || !phoneInput.value.trim() || !msgInput.value.trim()) {
        alert('필수 입력 항목을 모두 작성해 주세요.');
        return;
      }

      if (!agreement.checked) {
        alert('개인정보 수집 및 이용 동의가 필요합니다.');
        return;
      }

      const submitBtn = leaseForm.querySelector('.btn-submit');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.innerHTML = `<span>전송 중...</span> <i data-lucide="loader-2" class="animate-spin"></i>`;

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      const formData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        type: typeInput ? typeInput.value : '',
        message: msgInput.value.trim()
      };

      const resetSubmitBtn = () => {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        submitBtn.innerHTML = originalBtnText;
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      };

      const showToast = () => {
        toastMessage.classList.add('show');
        leaseForm.reset();
        setTimeout(() => {
          toastMessage.classList.remove('show');
        }, 3500);
      };

      // text/plain 으로 보내면 Apps Script 쪽에서 CORS preflight 없이 바로 받을 수 있습니다.
      fetch(GOOGLE_SHEET_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData)
      })
        .then(() => {
          resetSubmitBtn();
          showToast();
        })
        .catch((error) => {
          console.error('문의 전송 실패:', error);
          resetSubmitBtn();
          alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        });
    });
  }
});
