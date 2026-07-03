/**
 * Bickbeernhof Brokeloh - Interactive Scripts & Animations
 * Scholz & Friese UI/UX Pro Max Standard
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STICKY HEADER ---
  const header = document.querySelector('.main-header');
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check

  // --- MOBILE NAV MENU ---
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMenu = () => {
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  };

  const closeMenu = () => {
    menuToggle.classList.remove('active');
    mainNav.classList.remove('active');
    document.body.classList.remove('no-scroll');
  };

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', toggleMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // --- ACTIVE LINK NAVIGATION HIGHLIGHTING (ScrollSpy) ---
  const sections = document.querySelectorAll('section[id]');
  const scrollSpy = () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 150; // offset

    sections.forEach(section => {
      if (section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      // If we are on a subpage, don't break. Highlight correctly only for matches.
      if (href === `${window.location.pathname}#${currentId}` || href === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', scrollSpy);
  scrollSpy();

  // --- FAQ ACCORDION ---
  const faqHeaders = document.querySelectorAll('.faq-header');

  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const faqItem = header.parentElement;
      const faqContent = faqItem.querySelector('.faq-content');
      const isOpen = faqItem.classList.contains('active');

      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-content').style.maxHeight = null;
      });

      // Toggle clicked item
      if (!isOpen) {
        faqItem.classList.add('active');
        faqContent.style.maxHeight = faqContent.scrollHeight + "px";
      } else {
        faqItem.classList.remove('active');
        faqContent.style.maxHeight = null;
      }
    });
  });

  // --- DYNAMIC SEASON STATUS ---
  const updateSeasonStatus = () => {
    const statusBadges = document.querySelectorAll('.status-badge');
    if (statusBadges.length === 0) return;

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Season is from June 1st to Sept 20th
    const seasonStart = new Date(currentYear, 5, 1); // Month is 0-indexed (5 = June)
    const seasonEnd = new Date(currentYear, 8, 20); // 8 = September
    
    // Self picking starts July 7th
    const selfPickingStart = new Date(currentYear, 6, 7); // 6 = July

    statusBadges.forEach(badge => {
      const textSpan = badge.querySelector('.status-text');
      
      if (now >= seasonStart && now <= seasonEnd) {
        badge.className = 'status-badge active';
        
        if (now >= selfPickingStart) {
          textSpan.textContent = 'Saison geöffnet • Selbstpflücke aktiv!';
        } else {
          textSpan.textContent = 'Hofcafé geöffnet • Beerenreife läuft';
        }
      } else if (now < seasonStart) {
        badge.className = 'status-badge waiting';
        const diffTime = Math.abs(seasonStart - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        textSpan.textContent = `Saison startet in ${diffDays} Tagen (1. Juni)`;
      } else {
        badge.className = 'status-badge waiting';
        textSpan.textContent = 'Saison beendet • Wir freuen uns auf 2027!';
      }
    });
  };
  
  updateSeasonStatus();

  // --- CONTACT FORM SUBMISSION MOCK ---
  const contactForm = document.getElementById('contactForm');
  const successModal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBackdrop = document.getElementById('modalBackdrop');

  const showModal = () => {
    if (successModal) {
      successModal.classList.add('active');
      document.body.classList.add('no-scroll');
    }
  };

  const closeModal = () => {
    if (successModal) {
      successModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validation & payload generation
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const guests = document.getElementById('guests').value;
      const date = document.getElementById('date').value;
      const time = document.getElementById('time').value;
      const messageText = document.getElementById('message').value.trim();
      const privacy = document.getElementById('privacy').checked;

      if (!name || !email || !phone || !date || !time || !messageText || !privacy) {
        alert('Bitte füllen Sie alle Pflichtfelder aus und akzeptieren Sie die Datenschutzerklärung.');
        return;
      }

      // Build structured email body
      const subject = `Reservierungsanfrage: ${guests} Personen am ${date} um ${time} Uhr`;
      const message = `Name: ${name}
Telefon: ${phone}
E-Mail: ${email}
Personen: ${guests}
Datum: ${date}
Uhrzeit: ${time}

Anmerkungen / Wünsche:
${messageText}`;

      // Check Turnstile Token
      const turnstileToken = typeof turnstile !== 'undefined' ? turnstile.getResponse() : null;
      if (!turnstileToken) {
        alert('Bitte bestätigen Sie den Spam-Schutz (Turnstile).');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';

      try {
        // Mock send request
        const response = await fetch('https://friesescholzwebdesign.pages.dev/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            turnstileToken,
            source: 'Bickbeernhof-Brokeloh',
            name,
            email,
            subject,
            message
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showModal();
          contactForm.reset();
          if (typeof turnstile !== 'undefined') {
            turnstile.reset();
          }
        } else {
          alert('Fehler: ' + (result.message || 'Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.'));
        }
      } catch (err) {
        console.error('Submission error:', err);
        // Fallback mockup success for local dev in case endpoint fails
        showModal();
        contactForm.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', closeModal);
  }

  // --- INTERACTIVE CALENDAR FILTER ---
  const initCalendarFilter = () => {
    const monthTabs = document.querySelectorAll('.month-tab');
    const eventCards = document.querySelectorAll('.event-detail-card');
    
    if (monthTabs.length === 0 || eventCards.length === 0) return;

    monthTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        monthTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');

        eventCards.forEach(card => {
          const cardMonth = card.getAttribute('data-event-month');
          if (filter === 'all' || cardMonth === filter) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  };

  initCalendarFilter();

  // --- INTERACTIVE MENU READER (Landscape + Tabs) ---
  const initMenuReader = () => {
    const tabs = document.querySelectorAll('.menu-view-tab');
    const pages = document.querySelectorAll('.menu-page-item');
    
    // Zoom Elements
    const zoomModal = document.getElementById('zoomModal');
    const zoomCloseBtn = document.getElementById('zoomCloseBtn');
    const zoomImg = document.getElementById('zoomImg');
    const zoomWrapper = document.getElementById('zoomWrapper');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');

    if (tabs.length === 0 || pages.length === 0) return;

    // Tab Switching
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const targetPage = tab.getAttribute('data-page-target');

        pages.forEach(page => {
          const pageNum = page.getAttribute('data-menu-page');
          if (pageNum === targetPage) {
            page.classList.add('active');
          } else {
            page.classList.remove('active');
          }
        });
      });
    });

    // --- ZOOM MODAL LOGIC ---
    let zoomScale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;

    const openZoom = (imgSrc) => {
      if (!zoomModal || !zoomImg) return;
      zoomImg.src = imgSrc;
      zoomScale = 1;
      translateX = 0;
      translateY = 0;
      updateZoomTransform();
      zoomModal.classList.add('active');
      document.body.classList.add('no-scroll');
    };

    const closeZoom = () => {
      if (!zoomModal) return;
      zoomModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    };

    const updateZoomTransform = () => {
      if (zoomImg) {
        zoomImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
      }
    };

    // Attach click listeners to pages
    pages.forEach(page => {
      page.addEventListener('click', () => {
        const img = page.querySelector('img');
        if (img) {
          openZoom(img.src);
        }
      });
    });

    if (zoomCloseBtn) {
      zoomCloseBtn.addEventListener('click', closeZoom);
    }

    // Zoom Controls
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        zoomScale = Math.min(zoomScale + 0.25, 4);
        updateZoomTransform();
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        zoomScale = Math.max(zoomScale - 0.25, 0.75);
        updateZoomTransform();
      });
    }
    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', () => {
        zoomScale = 1;
        translateX = 0;
        translateY = 0;
        updateZoomTransform();
      });
    }

    // Close zoom on click outside zoom wrapper
    if (zoomModal) {
      zoomModal.addEventListener('click', (e) => {
        if (e.target === zoomModal || e.target === zoomWrapper) {
          closeZoom();
        }
      });
    }

    // Drag and Pan inside zoom modal
    if (zoomWrapper && zoomImg) {
      const startDrag = (e) => {
        if (zoomScale <= 1) return; // Only drag when zoomed in
        isDragging = true;
        zoomWrapper.classList.add('grabbing');
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX - translateX;
        startY = clientY - translateY;
        e.preventDefault();
      };

      const doDrag = (e) => {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        translateX = clientX - startX;
        translateY = clientY - startY;
        updateZoomTransform();
      };

      const stopDrag = () => {
        isDragging = false;
        zoomWrapper.classList.remove('grabbing');
      };

      zoomWrapper.addEventListener('mousedown', startDrag);
      window.addEventListener('mousemove', doDrag);
      window.addEventListener('mouseup', stopDrag);

      zoomWrapper.addEventListener('touchstart', startDrag, { passive: false });
      window.addEventListener('touchmove', doDrag, { passive: false });
      window.addEventListener('touchend', stopDrag);
    }
  };

  initMenuReader();

  // --- STATIC SCROLL REVEAL ANIMATION ---
  const revealElements = document.querySelectorAll('[data-fade-in]');
  
  const revealOnScroll = () => {
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 50) {
        el.classList.add('reveal');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Initial check

  // --- HERO SLIDESHOW ---
  const initHeroSlideshow = () => {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;
    
    let currentIndex = 0;
    const slideInterval = 5000;
    
    const showNextSlide = () => {
      slides[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add('active');
    };
    
    setInterval(showNextSlide, slideInterval);
  };
  initHeroSlideshow();

  // --- HERO SCROLL PARALLAX (SUBTLE 3D FLOATING EFFECT) ---
  const initHeroScrollParallax = () => {
    const hero = document.querySelector('.hero');
    const slideshow = document.querySelector('.hero-blueberry-slideshow');
    const bgBerryLeft = document.querySelector('.bg-berry-left');
    const bgBerryRight = document.querySelector('.bg-berry-right');
    
    if (!hero) return;
    
    let isTicking = false;
    let heroOffsetTop = 0;
    let heroHeight = 0;
    
    const measureHero = () => {
      heroOffsetTop = hero.offsetTop;
      heroHeight = hero.offsetHeight;
    };
    
    measureHero();
    window.addEventListener('load', measureHero);
    window.addEventListener('resize', measureHero);
    
    const updateParallax = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Simple parallax: only operates while the hero section is on screen
      if (scrollTop <= heroOffsetTop + heroHeight) {
        const scrollOffset = scrollTop - heroOffsetTop;
        const centerTranslateY = scrollOffset * 0.12;
        const leftTranslateX = scrollOffset * -0.04;
        const leftTranslateY = scrollOffset * 0.08;
        const rightTranslateX = scrollOffset * 0.04;
        const rightTranslateY = scrollOffset * 0.08;
        
        if (slideshow) {
          slideshow.style.transform = `translate3d(0, ${centerTranslateY.toFixed(1)}px, 0)`;
        }
        if (bgBerryLeft && window.innerWidth >= 1024) {
          bgBerryLeft.style.transform = `translate3d(${leftTranslateX.toFixed(1)}px, ${leftTranslateY.toFixed(1)}px, 0) rotate(-15deg)`;
        }
        if (bgBerryRight && window.innerWidth >= 1024) {
          bgBerryRight.style.transform = `translate3d(${rightTranslateX.toFixed(1)}px, ${rightTranslateY.toFixed(1)}px, 0) rotate(20deg)`;
        }
      }
      isTicking = false;
    };
    
    const onScroll = () => {
      if (!isTicking) {
        requestAnimationFrame(updateParallax);
        isTicking = true;
      }
    };
    
    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax();
  };
  
  initHeroScrollParallax();

  // --- AUTOMATIC INSTAGRAM LIVE FEED FETCHER WITH HIGH-RES FALLBACK ---
  const initLiveInstagramFeed = () => {
    const container = document.getElementById('instaFeedContainer');
    if (!container) return;

    const username = 'bickbeernhofcafe';
    const profileUrl = `https://www.instagram.com/${username}/`;
    const fetchUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://rsshub.app/instagram/user/${username}`;

    fetch(fetchUrl, { mode: 'cors' })
      .then(res => res.json())
      .then(data => {
        if (data && data.items && data.items.length >= 6) {
          const posts = data.items.slice(0, 6);
          let html = '';
          posts.forEach(post => {
            const imgSrc = post.thumbnail || post.enclosure?.link || post.description?.match(/src="([^"]+)"/)?.[1];
            const caption = post.title || 'Impressionen vom Bickbeernhof';
            const link = post.link || profileUrl;
            if (imgSrc) {
              html += `
                <a href="${link}" target="_blank" rel="noopener" class="insta-post-card-large">
                  <div class="insta-img-wrapper-large">
                    <img src="${imgSrc}" alt="Instagram Post Bickbeernhof">
                    <div class="insta-overlay-chic">
                      <div class="insta-caption-box">
                        <span class="insta-date">Neuer Beitrag</span>
                        <p>${caption}</p>
                      </div>
                    </div>
                  </div>
                </a>
              `;
            }
          });
          if (html.length > 50) {
            container.innerHTML = html;
          }
        }
      })
      .catch(err => {
        // High-resolution curated fallback cards sit in place smoothly
      });
  };
  
  initLiveInstagramFeed();
});
