/**
 * Bickbeernhof Brokeloh - Interactive Scripts & Animations
 * Scholz & Friese UI/UX Pro Max Standard
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STICKY HEADER ---
  const header = document.querySelector('.main-header');
  const handleScroll = () => {
    if (!header) return;
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
    
    // Self picking: Juli bis ca. Anfang August
    const selfPickingStart = new Date(currentYear, 6, 1); // 6 = Juli
    const selfPickingEnd = new Date(currentYear, 7, 10); // 7 = August

    statusBadges.forEach(badge => {
      const textSpan = badge.querySelector('.status-text');
      
      if (now >= seasonStart && now <= seasonEnd) {
        badge.className = 'status-badge active';
        
        if (now >= selfPickingStart && now <= selfPickingEnd) {
          textSpan.textContent = 'Saison geöffnet • Selbstpflücken aktiv!';
        } else if (now < selfPickingStart) {
          textSpan.textContent = 'Hofcafé & Hofladen geöffnet • Selbstpflücken ab Juli';
        } else {
          textSpan.textContent = 'Hofcafé & Hofladen geöffnet • Selbstpflücken beendet';
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
            to: 'friese.scholz@gmail.com',
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

  // --- STATIC SCROLL REVEAL ANIMATION (OPTIMIZED WITH INTERSECTION OBSERVER) ---
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('[data-fade-in]');
    if (revealElements.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.05
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => {
      observer.observe(el);
    });
  };
  initScrollReveal();

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

    // --- AUTOMATIC INSTAGRAM LIVE FEED FETCHER WITH BEHOLD.SO & HIGH-RES FALLBACK ---
  const initLiveInstagramFeed = () => {
    const container = document.getElementById('instaFeedContainer');
    if (!container) return;

    const username = 'bickbeernhofcafe';
    const profileUrl = `https://www.instagram.com/${username}/`;

    // CONFIGURATION: Replace this with your Behold.so feed ID to connect the official live Instagram feed
    // Behold.so provides a free and stable feed API (1,200 fetches per month).
    const BEHOLD_FEED_ID = ''; // <- Paste your Behold.so ID here, e.g. 'aBcdEfGhIjKlMnOpQrSt'

    const beholdUrl = BEHOLD_FEED_ID ? `https://feeds.behold.so/${BEHOLD_FEED_ID}` : '';
    const rsshubUrl = `https://api.rss2json.com/v1/api.json?rss_url=https://rsshub.app/instagram/user/${username}`;

    const fallbackPosts = [
      {
        img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/Bickbeerenhof/Gallerie/Bickbeernhof_JAWORR_04_ergebnis.webp',
        caption: 'Ein sonniger Tag auf unseren Blaubeerfeldern. Frisch gepflückt schmeckt es am besten! ☀️🌿'
      },
      {
        img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/Bickbeerenhof/uber-uns/DRS_6654_ergebnis.webp',
        caption: 'Fleißige Hände bei der Blaubeerernte. Ökologischer Anbau aus Leidenschaft. 🚜💙'
      },
      {
        img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/Bickbeerenhof/Gallerie/Bl%C3%BCten.webp',
        caption: 'Unsere Blaubeerblüten stehen in voller Pracht. Die Bienen leisten großartige Arbeit! 🐝🌸'
      },
      {
        img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/Bickbeerenhof/uber-uns/DSCF4354_ergebnis.webp',
        caption: 'Unser Hof-Team freut sich auf euren Besuch auf unserer Kaffeeterrasse! Kuchen, Waffeln und Eis stehen bereit. 🍰☕'
      },
      {
        img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/website-datein/bickbeernhof/DRS_7051-e1713436720149.jpg',
        caption: 'Erinnerungen an über 50 Jahre Bickbeernhof. Familiäre Tradition im Herzen von Brokeloh. 🏡❤️'
      },
      {
        img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/Bickbeerenhof/Produkte/bio-blaumelade_ergebnis.webp',
        caption: 'Unsere berühmte Bio-Blaumelade. Jetzt auch im neuen integrierten Onlineshop bestellbar! 📦🍇'
      }
    ];

    const renderPosts = (items, isBehold = false) => {
      let html = '';
      items.forEach((item, index) => {
        if (index >= 6) return;
        const imgSrc = isBehold ? item.mediaUrl : (item.thumbnail || item.enclosure?.link || item.description?.match(/src="([^"]+)"/)?.[1]);
        const caption = isBehold ? item.caption : (item.title || 'Impressionen vom Bickbeernhof');
        const link = isBehold ? item.permalink : (item.link || profileUrl);
        const dateText = isBehold && item.timestamp ? new Date(item.timestamp).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) : 'Neuer Beitrag';

        if (imgSrc) {
          html += `
            <a href="${link}" target="_blank" rel="noopener" class="insta-post-card-large">
              <div class="insta-img-wrapper-large">
                <img src="${imgSrc}" alt="Instagram Post Bickbeernhof" loading="lazy" decoding="async">
                <div class="insta-overlay-chic">
                  <div class="insta-caption-box">
                    <span class="insta-date">${dateText}</span>
                    <p>${caption.length > 120 ? caption.substring(0, 120) + '...' : caption}</p>
                  </div>
                </div>
              </div>
            </a>
          `;
        }
      });
      if (html.length > 50) {
        container.innerHTML = html;
      } else {
        renderFallback();
      }
    };

    const renderFallback = () => {
      let html = '';
      fallbackPosts.forEach(post => {
        html += `
          <a href="${profileUrl}" target="_blank" rel="noopener" class="insta-post-card-large">
            <div class="insta-img-wrapper-large">
              <img src="${post.img}" alt="Instagram Post Bickbeernhof Fallback" loading="lazy" decoding="async">
              <div class="insta-overlay-chic">
                <div class="insta-caption-box">
                  <span class="insta-date">Hof-Impression</span>
                  <p>${post.caption}</p>
                </div>
              </div>
            </div>
          </a>
        `;
      });
      container.innerHTML = html;
    };

    // Try fetching from Behold first, then fallback to RSSHub, then fallback to curated cards
    const urlToFetch = beholdUrl || rsshubUrl;
    
    fetch(urlToFetch)
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then(data => {
        if (beholdUrl && Array.isArray(data) && data.length > 0) {
          renderPosts(data, true);
        } else if (!beholdUrl && data && data.items && data.items.length >= 6) {
          renderPosts(data.items, false);
        } else {
          renderFallback();
        }
      })
      .catch(err => {
        console.warn('Instagram live feed fetch failed, loading fallback cards.', err);
        renderFallback();
      });
  };
  initLiveInstagramFeed();

  // --- UNIFIED PDF MENU READER WITH PAGE FLIPPING & ZOOM LIGHTBOX ---
  const initPdfMenuReader = () => {
    const canvas = document.getElementById('pdfRenderCanvas');
    const fallbackImg = document.getElementById('pdfFallbackImg');
    const prevBtn = document.getElementById('pdfPrevBtn');
    const nextBtn = document.getElementById('pdfNextBtn');
    const currPageSpan = document.getElementById('pdfCurrentPage');
    const totalPageSpan = document.getElementById('pdfTotalPages');
    const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
    const wrapper = document.getElementById('pdfCanvasWrapper');

    // Zoom Lightbox Elements
    const zoomModal = document.getElementById('zoomModal');
    const zoomCloseBtn = document.getElementById('zoomCloseBtn');
    const zoomImg = document.getElementById('zoomImg');
    const zoomWrapper = document.getElementById('zoomWrapper');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');
    const zoomPrevPageBtn = document.getElementById('zoomPrevPageBtn');
    const zoomNextPageBtn = document.getElementById('zoomNextPageBtn');

    if (!wrapper && !zoomModal) return;

    // Default pages
    const pages = [
      'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/website-datein/bickbeernhof/menu_page_1.jpg',
      'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/website-datein/bickbeernhof/menu_page_2.jpg'
    ];

    let currentPage = 1;
    let totalPages = pages.length;
    let zoomScale = 1;

    // Check custom uploaded pdf / url from admin
    const customPdfUrl = localStorage.getItem('bickbeern_menu_pdf_url') || localStorage.getItem('bickbeern_custom_menu_pdf');
    if (customPdfUrl && pdfDownloadBtn) {
      pdfDownloadBtn.href = customPdfUrl;
    }

    const updateReader = () => {
      if (currPageSpan) currPageSpan.textContent = currentPage;
      if (totalPageSpan) totalPageSpan.textContent = totalPages;

      if (fallbackImg) {
        fallbackImg.style.display = 'block';
        fallbackImg.src = pages[currentPage - 1];
      }
      if (canvas) canvas.style.display = 'none';

      if (zoomImg && zoomModal && zoomModal.classList.contains('active')) {
        zoomImg.src = pages[currentPage - 1];
      }

      if (prevBtn) prevBtn.disabled = currentPage === 1;
      if (nextBtn) nextBtn.disabled = currentPage === totalPages;
      if (zoomPrevPageBtn) zoomPrevPageBtn.disabled = currentPage === 1;
      if (zoomNextPageBtn) zoomNextPageBtn.disabled = currentPage === totalPages;
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage > 1) {
          currentPage--;
          updateReader();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage < totalPages) {
          currentPage++;
          updateReader();
        }
      });
    }

    if (zoomPrevPageBtn) {
      zoomPrevPageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage > 1) {
          currentPage--;
          updateReader();
        }
      });
    }

    if (zoomNextPageBtn) {
      zoomNextPageBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage < totalPages) {
          currentPage++;
          updateReader();
        }
      });
    }

    // --- ZOOM MODAL LIGHTBOX CONTROLS ---
    const openZoom = () => {
      if (!zoomModal || !zoomImg) return;
      zoomImg.src = pages[currentPage - 1];
      zoomScale = 1;
      if (zoomImg) zoomImg.style.transform = `scale(1)`;
      zoomModal.classList.add('active');
      document.body.classList.add('no-scroll');
    };

    const closeZoom = () => {
      if (!zoomModal) return;
      zoomModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    };

    if (wrapper) {
      wrapper.addEventListener('click', openZoom);
    }

    if (zoomCloseBtn) {
      zoomCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeZoom();
      });
    }

    if (zoomModal) {
      zoomModal.addEventListener('click', (e) => {
        if (e.target === zoomModal || e.target === zoomWrapper || e.target === zoomCloseBtn) {
          closeZoom();
        }
      });
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomScale = Math.min(zoomScale + 0.25, 3.5);
        if (zoomImg) zoomImg.style.transform = `scale(${zoomScale})`;
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomScale = Math.max(zoomScale - 0.25, 0.8);
        if (zoomImg) zoomImg.style.transform = `scale(${zoomScale})`;
      });
    }
    if (zoomResetBtn) {
      zoomResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomScale = 1;
        if (zoomImg) zoomImg.style.transform = `scale(1)`;
      });
    }

    updateReader();
  };

  initPdfMenuReader();

  // --- DYNAMIC ADMIN DATA SYNC & AUTOMATIC MONTH TABS + DATE SORTING ---
  const GERMAN_MONTHS = {
    1: 'Januar', 2: 'Februar', 3: 'März', 4: 'April', 5: 'Mai', 6: 'Juni',
    7: 'Juli', 8: 'August', 9: 'September', 10: 'Oktober', 11: 'November', 12: 'Dezember'
  };

  const initAdminDataSync = () => {
    const storedEvents = localStorage.getItem('bickbeern_events') || localStorage.getItem('bickbeern_events_custom');
    const eventsGrid = document.getElementById('eventsGrid');
    const monthTabsContainer = document.getElementById('monthTabs');

    if (eventsGrid) {
      let events = [
        { id: 1, month: '5', title: '"Mama" Gottesdienst zum Muttertag', date: 'Sonntag, 10. Mai 2026', time: 'ab 18:00 Uhr', category: 'Kirche & Besinnung', desc: 'Ein feierlicher und stimmungsvoller Gottesdienst in freier Natur.' },
        { id: 2, month: '6', title: 'Kultur in der Natur', date: 'Samstag, 27. Juni 2026', time: 'Ganztägig', category: 'Musik & Kunst', desc: 'Erleben Sie musikalische Beiträge, darstellende Künste und kreative Ausstellungen inmitten unserer grünen Plantagen.' },
        { id: 3, month: '7', title: 'Märchenwaldtag', date: 'Sonntag, 5. Juli 2026', time: 'ab 10:00 Uhr', category: 'Kinder & Familie', desc: 'Ein zauberhafter Erlebnistag für Kinder und Familien im Märchenwald.' },
        { id: 4, month: '8', title: 'Gemeinsames Singen auf unserem Hof', date: 'Samstag, 22. August 2026', time: 'ab 19:00 Uhr', category: 'Gemeinschaft', desc: 'In gemütlicher Atmosphäre am Lagerfeuer stimmen wir altbekannte Weisen an.' },
        { id: 5, month: '9', title: 'Kindertag & Saisonabschluss', date: 'Sonntag, 20. September 2026', time: 'ab 10:00 Uhr', category: 'Saison-Special', desc: 'Unser letzter Saisontag steht ganz im Zeichen der Kinder!' }
      ];

      if (storedEvents) {
        try {
          const parsed = JSON.parse(storedEvents);
          if (Array.isArray(parsed) && parsed.length > 0) {
            events = parsed;
          }
        } catch (e) {
          console.error('Events parse error:', e);
        }
      }

      // Auto-repair month assignments based on date strings (e.g. "10.12.2026" -> month 12)
      events.forEach(ev => {
        if (ev.date) {
          const dStr = ev.date.toLowerCase();
          const numMatch = dStr.match(/\.\s*(\d{1,2})\s*\./);
          if (numMatch && numMatch[1]) {
            const mNum = parseInt(numMatch[1]);
            if (mNum >= 1 && mNum <= 12) {
              ev.month = String(mNum);
              return;
            }
          }
          const mNames = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
          mNames.forEach((name, idx) => {
            if (dStr.includes(name)) {
              ev.month = String(idx + 1);
            }
          });
        }
      });

      // Sort chronologically by month (5, 6, 7, 8, 9, 10, 11, 12...)
      events.sort((a, b) => parseInt(a.month) - parseInt(b.month));

      // Build events HTML
      let html = '';
      events.forEach(ev => {
        const badgeClass = ev.category.includes('Kirche') ? 'badge-kirche' : (ev.category.includes('Musik') ? 'badge-kultur' : 'badge-kinder');
        html += `
          <div class="event-detail-card" data-event-month="${ev.month || '5'}">
            <div class="event-card-header-new">
              <span class="event-badge ${badgeClass}">${ev.category}</span>
              <span class="event-time">🕒 ${ev.time}</span>
            </div>
            <h3 class="event-title-new">${ev.title}</h3>
            <div class="event-date-row">📅 ${ev.date}</div>
            <p class="event-desc-new">${ev.desc}</p>
          </div>
        `;
      });
      eventsGrid.innerHTML = html;

      // Dynamically generate Month Tabs based on present events!
      if (monthTabsContainer) {
        const uniqueMonths = Array.from(new Set(events.map(ev => parseInt(ev.month || '5')))).sort((a, b) => a - b);

        let tabsHtml = `<button class="month-tab active" data-filter="all">Alle Termine</button>`;
        uniqueMonths.forEach(m => {
          const mName = GERMAN_MONTHS[m] || ('Monat ' + m);
          tabsHtml += `<button class="month-tab" data-filter="${m}">${mName}</button>`;
        });
        monthTabsContainer.innerHTML = tabsHtml;

        // Re-bind month filter tab click events
        const newMonthTabs = monthTabsContainer.querySelectorAll('.month-tab');
        newMonthTabs.forEach(tab => {
          tab.addEventListener('click', () => {
            newMonthTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filter = tab.getAttribute('data-filter');
            const allCards = eventsGrid.querySelectorAll('.event-detail-card');

            allCards.forEach(card => {
              const cardMonth = card.getAttribute('data-event-month');
              if (filter === 'all' || cardMonth === filter) {
                card.style.display = 'block';
                card.classList.remove('hidden');
              } else {
                card.style.display = 'none';
                card.classList.add('hidden');
              }
            });
          });
        });
      }
    }
  };

  initAdminDataSync();

  // --- DYNAMIC ANNOUNCEMENT POPUP (Modal) ---
  const initAnnouncementPopup = () => {
    try {
      let settings = null;
      const storedSettings = localStorage.getItem('bickbeern_popup_settings');
      
      if (storedSettings) {
        try {
          settings = JSON.parse(storedSettings);
        } catch (e) {}
      }

      if (!settings) {
        const isActive = localStorage.getItem('bickbeern_popup_active') === 'true';
        const title = localStorage.getItem('bickbeern_popup_title') || 'Eröffnung der Blaubeer-Saison 2026!';
        const text = localStorage.getItem('bickbeern_popup_text') || 'Liebe Gäste, ab Samstag, dem 10. Mai 2026 öffnen wir wieder täglich von 10:00 bis 18:00 Uhr unseren Hofladen und das Hofcafé!';
        if (isActive) {
          settings = { active: true, title, text };
        }
      }

      if (!settings || !settings.active) return;

      // Check if already shown in this session to not annoy users
      if (sessionStorage.getItem('bickbeern_popup_shown') === 'true') return;

      // Create styling dynamically
      const style = document.createElement('style');
      style.innerHTML = `
        .announce-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(7, 9, 20, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .announce-popup-overlay.active {
          opacity: 1;
        }
        .announce-popup-card {
          background: linear-gradient(135deg, #071B33 0%, #030d1c 100%);
          border: 1.5px solid rgba(219, 162, 74, 0.4);
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7), 0 0 40px rgba(219, 162, 74, 0.15);
          border-radius: 28px;
          padding: 40px 30px;
          width: 100%;
          max-width: 520px;
          text-align: center;
          position: relative;
          transform: translateY(30px) scale(0.95);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          color: #FFFFFF;
        }
        .announce-popup-overlay.active .announce-popup-card {
          transform: translateY(0) scale(1);
        }
        .announce-popup-close {
          position: absolute;
          top: 15px;
          right: 20px;
          font-size: 2.2rem;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: color 0.2s ease, transform 0.2s ease;
          line-height: 1;
        }
        .announce-popup-close:hover {
          color: #D9A24A;
          transform: scale(1.1);
        }
        .announce-popup-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: #FFFFFF;
          margin-top: 15px;
          margin-bottom: 15px;
          line-height: 1.3;
        }
        .announce-popup-body {
          color: #FAF6EE;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 30px;
          text-align: left;
          font-weight: 400;
        }
        .announce-popup-body p {
          margin-bottom: 12px;
        }
        .announce-popup-body a {
          color: #D9A24A;
          text-decoration: underline;
          font-weight: 600;
        }
        .announce-popup-btn {
          background: linear-gradient(135deg, #D9A24A 0%, #B88230 100%);
          color: #080A0F;
          font-weight: 700;
          padding: 12px 36px;
          border-radius: 30px;
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          letter-spacing: 0.5px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 8px 25px rgba(217, 162, 74, 0.3);
        }
        .announce-popup-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(217, 162, 74, 0.45);
        }
        @media (max-width: 576px) {
          .announce-popup-card {
            padding: 35px 20px;
          }
          .announce-popup-title {
            font-size: 1.5rem;
          }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(219, 162, 74, 0.4)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 10px rgba(219, 162, 74, 0.8)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(219, 162, 74, 0.4)); }
        }
      `;
      document.head.appendChild(style);

      // Create modal elements
      const overlay = document.createElement('div');
      overlay.className = 'announce-popup-overlay';
      
      overlay.innerHTML = `
        <div class="announce-popup-card">
          <span class="announce-popup-close" id="announceClose">&times;</span>
          <div style="font-size: 3.5rem; margin-bottom: 10px; display: inline-block; animation: pulseGlow 2s infinite;">📢</div>
          <h3 class="announce-popup-title">${settings.title}</h3>
          <div class="announce-popup-body">
            ${settings.text ? settings.text.split('\n').join('<br>') : ''}
          </div>
          <button class="announce-popup-btn" id="announceConfirmBtn">Alles klar!</button>
        </div>
      `;
      
      document.body.appendChild(overlay);

      // Show after a slight delay
      setTimeout(() => {
        overlay.classList.add('active');
        document.body.classList.add('no-scroll');
      }, 800);

      // Close handlers
      const closePopup = () => {
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        sessionStorage.setItem('bickbeern_popup_shown', 'true');
        setTimeout(() => {
          overlay.remove();
        }, 400);
      };

      document.getElementById('announceClose').addEventListener('click', closePopup);
      document.getElementById('announceConfirmBtn').addEventListener('click', closePopup);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePopup();
      });

    } catch (e) {
      console.error('Error rendering popup:', e);
    }
  };

  initAnnouncementPopup();

  // --- DYNAMIC TURNSTILE RENDERING ---
  const initDynamicTurnstile = () => {
    const container = document.getElementById('my-turnstile-container');
    if (!container) return;

    const isProduction = window.location.hostname.includes('bickbeernhof.de');

    if (isProduction) {
      // Use real production key
      const checkAndRender = () => {
        if (typeof turnstile !== 'undefined') {
          turnstile.render('#my-turnstile-container', {
            sitekey: '0x4AAAAAAAEi1Jb0ryqg7GcG',
            theme: 'light',
          });
        } else {
          setTimeout(checkAndRender, 100);
        }
      };
      checkAndRender();
    } else {
      // Render beautiful interactive Mock Turnstile for testing (No "Test warning" or domain issues)
      container.innerHTML = `
        <div class="mock-turnstile-box" style="width: 100%; max-width: 300px; height: 65px; background: #fafafa; border: 1px solid #e2e8f0; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; font-family: sans-serif; box-sizing: border-box; user-select: none; margin: 15px 0;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div id="mock-turnstile-status-icon" style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
              <input type="checkbox" id="mock-turnstile-checkbox" style="width: 20px; height: 20px; cursor: pointer; accent-color: #22c55e;">
            </div>
            <span id="mock-turnstile-text" style="font-size: 0.85rem; color: #475569; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif;">Ich bin ein Mensch</span>
          </div>
          
          <div style="display: flex; flex-direction: column; align-items: flex-end; justify-content: center; line-height: 1.2;">
            <div style="display: flex; align-items: center; gap: 4px;">
              <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; fill: #f97316;" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z"/>
              </svg>
              <span style="font-size: 0.65rem; font-weight: 800; color: #475569; letter-spacing: 0.5px; font-family: 'Plus Jakarta Sans', sans-serif;">CLOUDFLARE</span>
            </div>
            <div style="font-size: 0.55rem; color: #94a3b8; display: flex; gap: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" style="color: #94a3b8; text-decoration: none;">Datenschutz</a>
              <span>•</span>
              <a href="https://www.cloudflare.com/website-terms/" target="_blank" style="color: #94a3b8; text-decoration: none;">Nutzung</a>
            </div>
          </div>
        </div>
      `;

      let hasSolved = false;

      // Define mock global turnstile object
      window.turnstile = {
        getResponse: () => hasSolved ? 'mock-preview-token' : null,
        reset: () => {
          hasSolved = false;
          const statusIcon = document.getElementById('mock-turnstile-status-icon');
          const statusText = document.getElementById('mock-turnstile-text');
          if (statusIcon) {
            statusIcon.innerHTML = `<input type="checkbox" id="mock-turnstile-checkbox" style="width: 20px; height: 20px; cursor: pointer; accent-color: #22c55e;">`;
            bindCheckboxListener();
          }
          if (statusText) {
            statusText.textContent = 'Ich bin ein Mensch';
            statusText.style.color = '#475569';
          }
        }
      };

      const bindCheckboxListener = () => {
        const checkbox = document.getElementById('mock-turnstile-checkbox');
        const statusIcon = document.getElementById('mock-turnstile-status-icon');
        const statusText = document.getElementById('mock-turnstile-text');

        if (checkbox) {
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
              // Hide checkbox, show premium CSS spinner
              statusIcon.innerHTML = `
                <div style="width: 18px; height: 18px; border: 2px solid #cbd5e1; border-top-color: #f97316; border-radius: 50%; animation: mockSpinner 0.8s linear infinite;"></div>
                <style>
                  @keyframes mockSpinner {
                    to { transform: rotate(360deg); }
                  }
                </style>
              `;
              statusText.textContent = 'Prüfung...';

              setTimeout(() => {
                // Show Success tick
                statusIcon.innerHTML = `
                  <svg viewBox="0 0 24 24" style="width: 24px; height: 24px; fill: #22c55e;" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                `;
                statusText.textContent = 'Erfolg!';
                statusText.style.color = '#15803d';
                hasSolved = true;
              }, 800);
            }
          });
        }
      };

      bindCheckboxListener();
    }
  };

  initDynamicTurnstile();
});


/* ==========================================================================
   BICKBEERNHOF SHOP & CART STATE MANAGEMENT (MOLLIE INTEGRATION)
   ========================================================================== */

const BICKBEERNHOF_PRODUCTS = [
  {
    id: 'p3',
    title: 'Bio-Blaumelade® (210g)',
    category: 'aufstriche',
    price: 3.80,
    unitPrice: '18,10 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Bio-Blaumelade%20210g%2C%203%2C80%E2%82%AC_03.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Blaumelade_neu_203x59_dr_final3.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Blaumelade_neu_203x59_dr_final3.pdf',
    inStock: true,
    badge: 'Bestseller',
    fruitContent: '87,1% Blaubeeren',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh (eigener Bio-Anbau)',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Unsere berühmte, samtig-feine Bio-Blaumelade®. Nach bewährtem Hofrezept eingekocht mit 87,1% handverlesenen Bio-Heidelbeeren. Höchster Fruchtaufstrich-Genuss fürs Frühstücksbrot.',
    ingredients: 'Blaubeeren* (87,1%), Rübenzucker*, Zitronensaft*, Wasser, Geliermittel: Pektin, Saccharose. *aus kontrolliert ökologischem Anbau.',
    servingTip: 'Brot, Brötchen, Croissants, Toast, Joghurt, Quark, Desserts.',
    nutrition: {
      energy: '690 kJ / 163 kcal',
      fat: '0,6 g',
      fatSat: '0,0 g',
      carbs: '36,4 g',
      sugar: '36,3 g',
      protein: '0,6 g',
      salt: '0,02 g'
    }
  },
  {
    id: 'p1',
    title: 'Bio-Beerenkompott (210g)',
    category: 'aufstriche',
    price: 3.80,
    unitPrice: '18,10 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Bio-Beerenkompott%20210g%2C%203%2C80%E2%82%AC_01.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Blaubeerkompott_210g_203x59_dr_final5.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Blaubeerkompott_210g_203x59_dr_final5.pdf',
    inStock: true,
    badge: null,
    fruitContent: '111g Blaubeeren je 100g',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh (eigener Bio-Anbau)',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Fruchtiges Bio-Blaubeerkompott: Für die Herstellung von 100g Kompott wurden 111g sonnengereifte Bio-Blaubeeren schonend verarbeitet. Perfekt zu Waffeln, Pfannkuchen, Milchreis, Vanilleeis oder Joghurt.',
    ingredients: 'Blaubeeren*, Rübenzucker*, Zitronensaft*, Geliermittel: (Pektin*, Saccharose). *aus kontrolliert ökologischem Anbau.',
    servingTip: 'Kartoffelpuffer, Pfannkuchen, Waffeln, Milchreis, Eis, Joghurt, Quark, Desserts.',
    nutrition: {
      energy: '489 kJ / 116 kcal',
      fat: '0,6 g',
      fatSat: '0,0 g',
      carbs: '23,8 g',
      sugar: '23,8 g',
      protein: '0,7 g',
      salt: '0,02 g'
    }
  },
  {
    id: 'p2',
    title: 'Bio-Beerenkompott (420g)',
    category: 'aufstriche',
    price: 5.20,
    unitPrice: '12,38 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Bio-Beerenkompott%20420g%2C%205%2C20%E2%82%AC_02.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Blaubeerkompott_420g_265x65_dr_final5.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Blaubeerkompott_420g_265x65_dr_final5.pdf',
    inStock: true,
    badge: null,
    fruitContent: '111g Blaubeeren je 100g',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh (eigener Bio-Anbau)',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Das große 420g-Mehrwegglas: Reiner Bio-Heidelbeergenuss. Schonend eingekocht mit 111g ganzen Früchten je 100g Kompott. Ideal für die ganze Familie.',
    ingredients: 'Blaubeeren*, Rübenzucker*, Zitronensaft*, Geliermittel: (Pektin*, Saccharose). *aus kontrolliert ökologischem Anbau.',
    servingTip: 'Kartoffelpuffer, Pfannkuchen, Waffeln, Milchreis, Eis, Joghurt, Quark, Desserts.',
    nutrition: {
      energy: '489 kJ / 116 kcal',
      fat: '0,6 g',
      fatSat: '0,0 g',
      carbs: '23,8 g',
      sugar: '23,8 g',
      protein: '0,7 g',
      salt: '0,02 g'
    }
  },
  {
    id: 'p4',
    title: 'Bio-Heidelbeersaft (700ml)',
    category: 'getraenke',
    price: 6.90,
    unitPrice: '9,86 € / l',
    vat: 'inkl. 19% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Bio-Heidelbeersaft%20700ml%2C%206%2C90%E2%82%AC_04.webp',
    labelImg: null,
    pdfUrl: null,
    inStock: true,
    badge: null,
    fruitContent: '100% Fruchtgehalt',
    isVegan: true,
    bioCode: 'DE-ÖKO-006 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: true,
    isBottle: true,
    isJar: false,
    hasDeposit: false,
    deposit: 0.00,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: '100% purer Bio-Muttersaft aus erster Kaltpressung. Reich an wertvollen Antioxidantien, ohne Zuckerzusatz und ohne künstliche Zusätze.',
    ingredients: '100% Bio-Blaubeersaft (Direktsaft, nicht aus Konzentrat).',
    nutrition: {
      energy: '195 kJ / 46 kcal',
      fat: '< 0,1 g',
      fatSat: '< 0,05 g',
      carbs: '10,5 g',
      sugar: '9,8 g',
      protein: '0,3 g',
      salt: '< 0,01 g'
    }
  },
  {
    id: 'p5',
    title: 'Bio-Smoothie (1,5L Großpackung)',
    category: 'getraenke',
    price: 15.90,
    unitPrice: '10,60 € / l',
    vat: 'inkl. 19% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Bio-Smoothie%201%2C5L%2015%2C90%E2%82%AC_05.webp',
    labelImg: null,
    pdfUrl: null,
    inStock: true,
    badge: null,
    fruitContent: '100% Bio-Frucht',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: false,
    hasDeposit: false,
    deposit: 0.00,
    minQty: 1,
    shippingNote: 'Vorratsformat. Sicher verpackt im Spezialversand.',
    description: 'Der fruchtige Frischekick im praktischen 1,5-Liter-Vorratsformat! Pur gepresste Bio-Blaubeeren für den täglichen Energieschub im Müsli oder Glas.',
    ingredients: '100% Bio-Heidelbeeren püriert & Bio-Heidelbeersaft.',
    nutrition: {
      energy: '221,6 kJ / 50,5 kcal',
      fat: '0,8 g',
      fatSat: '0,1 g',
      carbs: '7,6 g',
      sugar: '7,6 g',
      protein: '0,8 g',
      salt: '0,0 g'
    }
  },
  {
    id: 'p6',
    title: 'Bio-Smoothie pur (420g)',
    category: 'getraenke',
    price: 7.90,
    unitPrice: '18,81 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Bio-Smoothie%207%2C90%E2%82%AC%2C%20420g_06.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Blaubeermoothie_420g_265x65_dr.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Blaubeermoothie_420g_265x65_dr.pdf',
    inStock: true,
    badge: null,
    fruitContent: '100% Blaubeeren*',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Großes 420g-Mehrwegglas: 100% sonnengereifte Bio-Blaubeeren pur und samtig püriert. Tipp: Kühl genießen oder zu Joghurt, Bowls und Müsli.',
    ingredients: 'Blaubeeren* (100%). *aus kontrolliert ökologischem Anbau.',
    servingTip: 'Pur genießen oder zu Joghurt, Bowls, Müsli, frischen Snacks und vielem mehr.',
    nutrition: {
      energy: '221,6 kJ / 50,5 kcal',
      fat: '0,8 g',
      fatSat: '0,1 g',
      carbs: '7,6 g',
      sugar: '7,6 g',
      protein: '0,8 g',
      salt: '0,0 g'
    }
  },
  {
    id: 'p7',
    title: 'Bio-Smoothie pur (210g)',
    category: 'getraenke',
    price: 4.90,
    unitPrice: '23,33 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Bio-Smoothie%20210g%204%2C90%E2%82%AC_07.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Blaubeersmoothie_pur_203x59_dr_final3.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Blaubeersmoothie_pur_203x59_dr_final3.pdf',
    inStock: true,
    badge: null,
    fruitContent: '100% Blaubeeren*',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Die 210g-Portion im Circujar-Mehrwegglas: 100% pure pürierte Bio-Blaubeeren. Voller Geschmack, reich an Nährstoffen und komplett ohne Zuckerzusatz.',
    ingredients: 'Blaubeeren* (100%). *aus kontrolliert ökologischem Anbau.',
    servingTip: 'Pur genießen oder zu Joghurt, Bowls, Müsli, frischen Snacks und vielem mehr.',
    nutrition: {
      energy: '221,6 kJ / 50,5 kcal',
      fat: '0,8 g',
      fatSat: '0,1 g',
      carbs: '7,6 g',
      sugar: '7,6 g',
      protein: '0,8 g',
      salt: '0,0 g'
    }
  },
  {
    id: 'p8',
    title: 'Bio-Smoothie mit Apfel (210g)',
    category: 'getraenke',
    price: 4.90,
    unitPrice: '23,33 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Bio-Smoothie%20mit%20Apfel%20210g%2C%204%2C90%E2%82%AC_08.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Blaubeersmoothie_mitApfel_203x59_dr_final3.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Blaubeersmoothie_mitApfel_203x59_dr_final3.pdf',
    inStock: true,
    badge: null,
    fruitContent: '60% Blaubeeren, 34,6% Apfel',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Fruchtig-milde Komposition aus sonnengereiften Bio-Blaubeeren (60%) und feinstem Bio-Apfelsaft (34,6%), abgerundet mit einem Hauch Agavendicksaft.',
    ingredients: 'Blaubeeren* (60%), Apfelsaft* (34,6%), Zitronensaft*, Agavendicksaft*, Stabilisator: Johannisbrotkernmehl*. *aus kontrolliert ökologischem Anbau.',
    servingTip: 'Pur genießen oder zu Joghurt, Bowls, Müsli, frischen Snacks und vielem mehr.',
    nutrition: {
      energy: '256 kJ / 61 kcal',
      fat: '0,5 g',
      fatSat: '0,0 g',
      carbs: '12,2 g',
      sugar: '12,2 g',
      protein: '0,6 g',
      salt: '0,00 g'
    }
  },
  {
    id: 'p9',
    title: 'Blaue Liebe Heidelbeer-Dressing (210g)',
    category: 'feinkost',
    price: 5.90,
    unitPrice: '28,10 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Blaue%20Liebe%20Heidelbeer-Dressing%2C%20250ml%2C%205%2C90%E2%82%AC_09.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Dressing_neu_203x59_dr_final3.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Dressing_neu_203x59_dr_final3.pdf',
    inStock: true,
    badge: null,
    fruitContent: '39,0% Bio-Blaubeeren',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Unser legendäres Salatdressing „Blaue Liebe“: 39% fruchtige Bio-Blaubeeren kombiniert mit Rapsöl, Apfelessig, Agavendicksaft und edlem Senf. Perfekt für bunte Blattsalate, Rohkost und Antipasti.',
    ingredients: 'Blaubeeren* (39,0 %), Rapsöl* (23,0%), Apfelessig* (13,7%), Agavendicksaft*, SENF - (Wasser, SENFSAATEN*, Branntweinessig*, Meersalz, Gewürze*, Kräuter*), Wasser, Meersalz, Stabilisator: Johannisbrotkernmehl*, Schwarzer Pfeffer*. *aus kontrolliert ökologischem Anbau. Kann Spuren enthalten von: Sellerie.',
    servingTip: 'Frische Salate, Blattsalate, Rohkost, Antipasti und vieles mehr.',
    nutrition: {
      energy: '1052 kJ / 254 kcal',
      fat: '22,2 g',
      fatSat: '1,5 g',
      carbs: '11,5 g',
      sugar: '11,4 g',
      protein: '0,8 g',
      salt: '1,07 g'
    }
  },
  {
    id: 'p10',
    title: 'Getrocknete Heidelbeeren (20g)',
    category: 'snacks',
    price: 3.20,
    unitPrice: '160,00 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/getrocknete%20Heidelbeeren%2020g%2C%203%2C20%E2%82%AC_10.webp',
    labelImg: null,
    pdfUrl: null,
    inStock: true,
    badge: null,
    fruitContent: '100% Bio-Beeren',
    isVegan: true,
    bioCode: 'DE-ÖKO-006 • Deutsche Landwirtschaft',
    origin: 'Brokeloh (eigener Bio-Anbau)',
    isGlass: false,
    hasDeposit: false,
    deposit: 0.00,
    minQty: 1,
    shippingNote: 'Aromaschutzbeutel. Flexibel zu jeder Bestellung hinzufügbar.',
    description: 'Schonend getrocknete Bio-Heidelbeeren mit konzentrierter Beerenkraft. Perfekt als gesunder Snack für unterwegs oder im Müsli.',
    ingredients: '100% getrocknete Bio-Heidelbeeren, ungeschwefelt, ohne Zuckerzusatz.',
    nutrition: {
      energy: '1320 kJ / 315 kcal',
      fat: '1,2 g',
      fatSat: '0,2 g',
      carbs: '65,0 g',
      sugar: '52,0 g',
      protein: '3,8 g',
      salt: '0,01 g'
    }
  },
  {
    id: 'p11',
    title: 'Getrocknete Heidelbeeren (40g)',
    category: 'snacks',
    price: 5.20,
    unitPrice: '130,00 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/getrocknete%20Heidelbeeren%2040g%205%2C20%E2%82%AC_11.webp',
    labelImg: null,
    pdfUrl: null,
    inStock: true,
    badge: null,
    fruitContent: '100% Bio-Beeren',
    isVegan: true,
    bioCode: 'DE-ÖKO-006 • Deutsche Landwirtschaft',
    origin: 'Brokeloh (eigener Bio-Anbau)',
    isGlass: false,
    hasDeposit: false,
    deposit: 0.00,
    minQty: 1,
    shippingNote: 'Aromaschutzbeutel. Flexibel zu jeder Bestellung hinzufügbar.',
    description: 'Die mittlere Packung: 40g reine, ungeschwefelte Bio-Blaubeeren mit intensivem Beerengeschmack.',
    ingredients: '100% getrocknete Bio-Heidelbeeren, ungeschwefelt, ohne Zuckerzusatz.',
    nutrition: {
      energy: '1320 kJ / 315 kcal',
      fat: '1,2 g',
      fatSat: '0,2 g',
      carbs: '65,0 g',
      sugar: '52,0 g',
      protein: '3,8 g',
      salt: '0,01 g'
    }
  },
  {
    id: 'p12',
    title: 'Getrocknete Heidelbeeren (80g)',
    category: 'snacks',
    price: 8.50,
    unitPrice: '106,25 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/getrocknete%20Heidelbeeren%2080g%2C%208%2C50%E2%82%AC_12.webp',
    labelImg: null,
    pdfUrl: null,
    inStock: true,
    badge: null,
    fruitContent: '100% Bio-Beeren',
    isVegan: true,
    bioCode: 'DE-ÖKO-006 • Deutsche Landwirtschaft',
    origin: 'Brokeloh (eigener Bio-Anbau)',
    isGlass: false,
    hasDeposit: false,
    deposit: 0.00,
    minQty: 1,
    shippingNote: 'Großer Aromaschutzbeutel. Flexibel zu jeder Bestellung hinzufügbar.',
    description: 'Der 80g-Vorratsbeutel: Konzentrierte Bio-Heidelbeeren für den täglichen Genuss in Müslis, Bowls und Backkreationen.',
    ingredients: '100% getrocknete Bio-Heidelbeeren, ungeschwefelt, ohne Zuckerzusatz.',
    nutrition: {
      energy: '1320 kJ / 315 kcal',
      fat: '1,2 g',
      fatSat: '0,2 g',
      carbs: '65,0 g',
      sugar: '52,0 g',
      protein: '3,8 g',
      salt: '0,01 g'
    }
  },
  {
    id: 'p13',
    title: 'Heidelbeerblütenhonig (245g)',
    category: 'feinkost',
    price: 6.50,
    unitPrice: '26,53 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Heidelbeerbl%C3%BCte%2C%20245g%2C%206%2C50%E2%82%AC_13.webp',
    labelImg: null,
    pdfUrl: null,
    inStock: true,
    badge: null,
    fruitContent: '100% Bienenhonig',
    isVegan: false,
    bioCode: 'Echter Deutscher Honig',
    origin: 'Hof-Imkerei Brokeloh',
    isGlass: true,
    hasDeposit: false,
    deposit: 0.00,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Cremig-feiner Sortenhonig von unseren Bienenvölkern direkt an den blühenden Bickbeernhof-Pflanzungen. Blumig und zart schmelzend.',
    ingredients: '100% Reiner Deutscher Heidelbeerblütenhonig.',
    nutrition: {
      energy: '1283 kJ / 302 kcal',
      fat: '0,0 g',
      fatSat: '0,0 g',
      carbs: '75,0 g',
      sugar: '75,0 g',
      protein: '0,4 g',
      salt: '< 0,01 g'
    }
  },
  {
    id: 'p14',
    title: 'Heidelbeer-Senf Oskar (210g)',
    category: 'feinkost',
    price: 3.90,
    unitPrice: '18,57 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Heidelbeer-Senf%20Oskar%20210g%2C%203%2C90%E2%82%AC_14.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Senf_Oscar_neu_203x59_dr_final3.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Senf_Oscar_neu_203x59_dr_final3.pdf',
    inStock: true,
    badge: null,
    fruitContent: '39,6% Bio-Blaubeeren',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: '„Oskar – Dein frecher Senf“: Pikant-würziger Bio-Senf (49,5%) veredelt mit 39,6% Bio-Blaubeeren, Honig, Apfelessig und feinen Gewürzen. Großartig zu Fleisch, Wurst, Käse, Burger und Sandwiches.',
    ingredients: 'SENF* (49,5%) - (Wasser, Senfsaaten*, Branntweinessig*, Meersalz, Gewürze*, Kräuter*), Blaubeeren* (39,6%), Grobkörniger SENF*, Honig*, Apfelessig*, Rübenzucker*, Geliermittel (Pektin, Saccharose), Meersalz, Schwarzer Pfeffer*, Piment-Gewürz*. *aus kontrolliert ökologischem Anbau. Kann Spuren enthalten von: Sellerie, Senf.',
    servingTip: 'Fleisch, Wurst, Käse, Gegrilltes, deftige Speisen, Sandwiches, Burger.',
    nutrition: {
      energy: '610 kJ / 134 kcal',
      fat: '4,4 g',
      fatSat: '0,5 g',
      carbs: '17,0 g',
      sugar: '16,9 g',
      protein: '4,2 g',
      salt: '2,92 g'
    }
  },
  {
    id: 'p15',
    title: 'Heidelbeerwein (700ml)',
    category: 'getraenke',
    price: 8.90,
    unitPrice: '12,71 € / l',
    vat: 'inkl. 19% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Heidelbeerwein%20700ml%2C%208%2C90%E2%82%AC_15.webp',
    labelImg: null,
    pdfUrl: null,
    inStock: true,
    badge: null,
    fruitContent: '11,0% vol. Alkohol',
    isVegan: true,
    bioCode: 'Fruchtwein-Spezialität',
    origin: 'Deutschland',
    isGlass: true,
    isBottle: true,
    isJar: false,
    hasDeposit: false,
    deposit: 0.00,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: 'Samtig-fruchtiger Heidelbeerwein: Tief dunkelrot mit eleganter Beerenfrucht im Abgang. Ein Genuss zu Wildgerichten, Käseplatten oder für besondere Abende.',
    ingredients: 'Heidelbeerwein, enthält Sulfite. Alkoholgehalt: 11,0% vol.',
    nutrition: null
  },
  {
    id: 'p16',
    title: 'Lottchen Heidelbeersirup (250ml)',
    category: 'getraenke',
    price: 4.20,
    unitPrice: '16,80 € / l',
    vat: 'inkl. 19% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Lottchen%20250ml%2C%204%2C20%E2%82%AC_16.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Etikett_Lottchen_Sirup_dr.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Etikett_Lottchen_Sirup_dr.pdf',
    inStock: true,
    badge: null,
    fruitContent: 'Heidelbeer-Apfel-Sirup',
    isVegan: true,
    bioCode: 'Hof-Spezialität',
    origin: 'Brokeloh',
    isGlass: true,
    hasDeposit: false,
    deposit: 0.00,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: '„Lottchen – Dein Brausesirup“: Heidelbeer-Apfel-Sirup für erfrischende Brausen, Schorlen, Cocktails oder als Topping über Waffeln und Eis.',
    ingredients: 'Blaubeersaft, Zucker, Säuerungsmittel: Zitronensaft.',
    servingTip: 'Mit Mineralwasser aufsprudeln, für Cocktails oder Desserts.',
    nutrition: {
      energy: '887,1 kJ / 209,3 kcal',
      fat: '0,3 g',
      fatSat: '0,1 g',
      carbs: '48,9 g',
      sugar: '48,5 g',
      protein: '0,5 g',
      salt: '0,0 g'
    }
  },
  {
    id: 'p17',
    title: 'Scharfer Hannes Currysauce (210g)',
    category: 'feinkost',
    price: 4.90,
    unitPrice: '23,33 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Scharfer%20Hannes%2C%20210g%2C%204%2C90%E2%82%AC_17.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Currysauce_Hannes_203x59_dr_final3.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Currysauce_Hannes_203x59_dr_final3.pdf',
    inStock: true,
    badge: null,
    fruitContent: 'Pikante Manufaktur',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: '„Scharfer Hannes – Deine Blaubeer-Currywurstsauce“: Feurige Currysauce mit Tomatenmark (55,8%), Apfelsaft (31,4%), sonnengereiften Bio-Blaubeeren, Zwiebeln und feinsten Currygewürzen.',
    ingredients: 'Ketchup - (Tomatenmark* (75%), Zucker*, Branntweinessig*, Meersalz, Gewürze*, Kräuter*) (55,8%), Apfelsaft* (31,4%), Blaubeeren*, Wasser, Zwiebeln*, Rübenzucker*, Currypulver*, Rapsöl*, Meersalz, Paprika edelsüß*, Zimt*, Cayennepfeffer*, Piment-Gewürz*. *aus kontrolliert ökologischem Anbau. Kann Spuren enthalten von: Sellerie, Senf.',
    servingTip: 'Bratwurst, Pommes, Gegrilltes, deftige Snacks, Sandwiches, Burger.',
    nutrition: {
      energy: '1525 kJ / 357 kcal',
      fat: '1,7 g',
      fatSat: '0,1 g',
      carbs: '78,0 g',
      sugar: '77,4 g',
      protein: '5,0 g',
      salt: '3,95 g'
    }
  },
  {
    id: 'p18',
    title: 'Süße Hilde Heidelbeerketchup (210g)',
    category: 'feinkost',
    price: 3.90,
    unitPrice: '18,57 € / kg',
    vat: 'inkl. 7% MwSt.',
    img: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/S%C3%BC%C3%9Fe%20Hilde%20210g%203%2C90%E2%82%AC_18.webp',
    labelImg: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/label_Ketchup_Hilde_neu_253x59_dr_final3.webp',
    pdfUrl: 'https://pub-b33108412309406a9a941ddc51e9a5b9.r2.dev/bickbeernhof/Produkte/Ketchup_Hilde_neu_253x59_dr_final3.pdf',
    inStock: true,
    badge: null,
    fruitContent: '46,8% Blaubeeren',
    isVegan: true,
    bioCode: 'DE-ÖKO-012 • Deutsche Landwirtschaft',
    origin: 'Brokeloh',
    isGlass: true,
    hasDeposit: true,
    deposit: 0.25,
    minQty: 1,
    shippingNote: 'Frei kombinierbar im bruchsicheren 6er-Versandkarton.',
    description: '„Süße Hilde – Dein Beeren-Ketchup“: Fruchtig-milder Feinschmeckerketchup mit 46,8% Blaubeeren und 37,5% Tomatenmark. Für 100g Ketchup wurden 187g Tomaten schonend verarbeitet.',
    ingredients: 'Tomaten*, Rübenzucker*, Wasser, Blaubeeren* (46,8 %), Tomatenmark* (37,5%), Apfelsaft*, Apfelessig, Meersalz, SENF - (Wasser, Senfsaaten*, Branntweinessig*, Meersalz, Gewürze*, Kräuter*), Paprika edelsüß*, Schwarzer Pfeffer*. Kann Spuren enthalten von: Sellerie, Senf.',
    servingTip: 'Pommes, Würstchen, Gegrilltes, Snacks, deftige Speisen, Burger.',
    nutrition: {
      energy: '1525 kJ / 357 kcal',
      fat: '1,7 g',
      fatSat: '0,1 g',
      carbs: '78,0 g',
      sugar: '77,4 g',
      protein: '5,0 g',
      salt: '3,95 g'
    }
  }
];

let bickbeernhofCart = JSON.parse(localStorage.getItem('bickbeernhof_cart')) || [];

function saveCart() {
  localStorage.setItem('bickbeernhof_cart', JSON.stringify(bickbeernhofCart));
  updateCartUI();
}

function updateCartUI() {
  const totalCount = bickbeernhofCart.reduce((sum, item) => sum + item.qty, 0);
  
  // Update header badges
  const headerBadges = document.querySelectorAll('.cart-badge');
  headerBadges.forEach(b => b.textContent = totalCount);

  const cartContainer = document.getElementById('cartItemsContainer');
  const subtotalEl = document.getElementById('cartSubtotal');
  const pfandEl = document.getElementById('cartPfandCost');
  const pfandRow = document.getElementById('cartPfandRow');
  const shippingEl = document.getElementById('cartShippingCost');
  const totalSumEl = document.getElementById('cartTotalSum');
  const boxTrackerEl = document.getElementById('cartBoxTracker');
  const freeShippingText = document.getElementById('freeShippingText');
  const freeShippingFill = document.getElementById('freeShippingFill');
  const startCheckoutBtn = document.getElementById('startCheckoutBtn');

  if (!cartContainer) return;

  let subtotal = 0;
  let totalPfand = 0;
  let totalBottleItems = 0;
  let totalJarItems = 0;

  cartContainer.innerHTML = '';

  if (bickbeernhofCart.length === 0) {
    cartContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--color-text-muted);">
        <p style="font-size: 3rem; margin-bottom: 10px;">🧺</p>
        <p style="font-weight: 700; font-size: 1.1rem; color: var(--color-primary);">Ihr Warenkorb ist leer</p>
        <p style="font-size: 0.88rem;">Stöbern Sie durch unsere Köstlichkeiten und fügen Sie Ihre Lieblingsprodukte hinzu.</p>
      </div>
    `;
    if (boxTrackerEl) boxTrackerEl.innerHTML = '';
    if (pfandRow) pfandRow.style.display = 'none';
  } else {
    bickbeernhofCart.forEach(item => {
      const prod = BICKBEERNHOF_PRODUCTS.find(p => p.id === item.id);
      if (!prod) return;

      const itemTotal = prod.price * item.qty;
      subtotal += itemTotal;

      if (prod.hasDeposit) {
        totalPfand += (prod.deposit || 0.25) * item.qty;
      }
      if (prod.isBottle || prod.id === 'p4' || prod.id === 'p15') {
        totalBottleItems += item.qty;
      } else if (prod.isJar || prod.isGlass) {
        totalJarItems += item.qty;
      }

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row';
      itemRow.innerHTML = `
        <img src="${prod.img}" alt="${prod.title}" class="cart-item-img">
        <div class="cart-item-info">
          <div class="cart-item-title">${prod.title}</div>
          <div class="cart-item-price">${itemTotal.toFixed(2).replace('.', ',')} €</div>
          ${prod.hasDeposit ? `<div style="font-size: 0.74rem; color: #15803d; font-weight: 600;">+ ${(prod.deposit * item.qty).toFixed(2).replace('.', ',')} € Pfand</div>` : ''}
          <div class="cart-quantity-controls">
            <button class="cart-qty-btn" onclick="changeCartQty('${prod.id}', -1)">-</button>
            <span style="font-weight: 700; font-size: 0.9rem;">${item.qty}</span>
            <button class="cart-qty-btn" onclick="changeCartQty('${prod.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-delete" onclick="removeFromCart('${prod.id}')" title="Artikel entfernen">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      cartContainer.appendChild(itemRow);
    });

    // Getrennte 6er-Kartonagen für Flaschen (0,7l / 0,75l) & Gläser (Kompott/Aufstriche)
    if (boxTrackerEl) {
      if (totalBottleItems > 0 || totalJarItems > 0) {
        let trackerHtml = '';

        // 1. Flaschen-Karton (0,7l & 0,75l)
        if (totalBottleItems > 0) {
          const remB = totalBottleItems % 6;
          const fullB = (remB === 0);
          const neededB = fullB ? 0 : (6 - remB);
          const countB = Math.ceil(totalBottleItems / 6);

          if (fullB) {
            trackerHtml += `
              <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 12px; padding: 10px 14px; margin: 8px 0; font-size: 0.82rem; color: #166534;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700;">
                  <span>🍾 6er-Flaschenkarton: ${totalBottleItems} Flaschen</span>
                  <span style="background: #22C55E; color: #FFFFFF; font-size: 0.7rem; padding: 2px 7px; border-radius: 10px;">${countB}x Karton voll</span>
                </div>
                <div style="font-size: 0.75rem; margin-top: 3px; color: #15803d;">0,7l &amp; 0,75l Flaschen sind bruchsicher verpackt.</div>
              </div>
            `;
          } else {
            const pctB = (remB / 6) * 100;
            trackerHtml += `
              <div style="background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 12px; padding: 10px 14px; margin: 8px 0; font-size: 0.82rem; color: #92400E;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700; margin-bottom: 4px;">
                  <span>🍾 Flaschenkarton (0,7l/0,75l): ${remB} von 6</span>
                  <span style="font-size: 0.74rem; color: #B45309; font-weight: 800;">Noch ${neededB} ${neededB === 1 ? 'Flasche' : 'Flaschen'}</span>
                </div>
                <div style="background: #FDE68A; border-radius: 10px; height: 5px; overflow: hidden; margin-bottom: 5px;">
                  <div style="background: #F59E0B; height: 100%; width: ${pctB}%; border-radius: 10px;"></div>
                </div>
                <div style="font-size: 0.74rem; line-height: 1.35; color: #78350F;">Flaschen werden in separaten 6er-Kartons versandt. Bitte noch <strong>${neededB} ${neededB === 1 ? 'Flasche' : 'Flaschen'}</strong> hinzufügen.</div>
              </div>
            `;
          }
        }

        // 2. Gläser-Karton (Aufstriche, Kompott, Smoothies)
        if (totalJarItems > 0) {
          const remJ = totalJarItems % 6;
          const fullJ = (remJ === 0);
          const neededJ = fullJ ? 0 : (6 - remJ);
          const countJ = Math.ceil(totalJarItems / 6);

          if (fullJ) {
            trackerHtml += `
              <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 12px; padding: 10px 14px; margin: 8px 0; font-size: 0.82rem; color: #166534;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700;">
                  <span>🫙 6er-Gläserkarton: ${totalJarItems} Gläser</span>
                  <span style="background: #22C55E; color: #FFFFFF; font-size: 0.7rem; padding: 2px 7px; border-radius: 10px;">${countJ}x Karton voll</span>
                </div>
                <div style="font-size: 0.75rem; margin-top: 3px; color: #15803d;">Gläser (Kompott, Aufstriche etc.) sind bruchsicher verpackt.</div>
              </div>
            `;
          } else {
            const pctJ = (remJ / 6) * 100;
            trackerHtml += `
              <div style="background: #FFFBEB; border: 1.5px solid #FDE68A; border-radius: 12px; padding: 10px 14px; margin: 8px 0; font-size: 0.82rem; color: #92400E;">
                <div style="display: flex; justify-content: space-between; align-items: center; font-weight: 700; margin-bottom: 4px;">
                  <span>🫙 Gläserkarton: ${remJ} von 6 Gläsern</span>
                  <span style="font-size: 0.74rem; color: #B45309; font-weight: 800;">Noch ${neededJ} ${neededJ === 1 ? 'Glas' : 'Gläser'}</span>
                </div>
                <div style="background: #FDE68A; border-radius: 10px; height: 5px; overflow: hidden; margin-bottom: 5px;">
                  <div style="background: #F59E0B; height: 100%; width: ${pctJ}%; border-radius: 10px;"></div>
                </div>
                <div style="font-size: 0.74rem; line-height: 1.35; color: #78350F;">Gläser werden in separaten 6er-Kartons versandt. Bitte noch <strong>${neededJ} ${neededJ === 1 ? 'Glas' : 'Gläser'}</strong> hinzufügen (Sorten frei mixbar!).</div>
              </div>
            `;
          }
        }

        boxTrackerEl.innerHTML = trackerHtml;
      } else {
        boxTrackerEl.innerHTML = '';
      }
    }
  }

  // Pfand Row display
  if (pfandRow && pfandEl) {
    if (totalPfand > 0) {
      pfandRow.style.display = 'flex';
      pfandEl.textContent = totalPfand.toFixed(2).replace('.', ',') + ' €';
    } else {
      pfandRow.style.display = 'none';
    }
  }

  const shippingCost = (subtotal === 0) ? 0 : 5.60;
  const totalSum = subtotal + totalPfand + shippingCost;

  if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
  if (shippingEl) shippingEl.textContent = shippingCost === 0 ? '0,00 €' : '5,60 €';
  if (totalSumEl) totalSumEl.textContent = totalSum.toFixed(2).replace('.', ',') + ' €';

  // Checkout button state based on STRICT Separate 6er-Karton rules (Bottles vs Jars)
  if (startCheckoutBtn) {
    const isBottlesValid = (totalBottleItems === 0) || (totalBottleItems % 6 === 0);
    const isJarsValid = (totalJarItems === 0) || (totalJarItems % 6 === 0);
    const isCartValid = isBottlesValid && isJarsValid;

    if (bickbeernhofCart.length === 0) {
      startCheckoutBtn.disabled = true;
      startCheckoutBtn.innerHTML = '💳 Warenkorb ist leer';
      startCheckoutBtn.style.opacity = '0.5';
      startCheckoutBtn.style.cursor = 'not-allowed';
      startCheckoutBtn.style.background = '#94a3b8';
      startCheckoutBtn.style.color = '#ffffff';
    } else if (!isCartValid) {
      const neededB = 6 - (totalBottleItems % 6);
      const neededJ = 6 - (totalJarItems % 6);
      startCheckoutBtn.disabled = false;
      startCheckoutBtn.setAttribute('data-cart-blocked', 'true');
      
      let warnText = '';
      if (!isBottlesValid && !isJarsValid) {
        warnText = `⛔ Kartons unvollständig (${neededB} Fl. & ${neededJ} Gl. fehlen)`;
      } else if (!isBottlesValid) {
        warnText = `⛔ Noch ${neededB} ${neededB === 1 ? 'Flasche' : 'Flaschen'} bis zum 6er-Karton`;
      } else {
        warnText = `⛔ Noch ${neededJ} ${neededJ === 1 ? 'Glas' : 'Gläser'} bis zum 6er-Karton`;
      }

      startCheckoutBtn.innerHTML = warnText;
      startCheckoutBtn.style.opacity = '0.85';
      startCheckoutBtn.style.cursor = 'not-allowed';
      startCheckoutBtn.style.background = '#cbd5e1';
      startCheckoutBtn.style.color = '#475569';
    } else {
      startCheckoutBtn.disabled = false;
      startCheckoutBtn.removeAttribute('data-cart-blocked');
      startCheckoutBtn.innerHTML = '💳 Sicher zur Kasse';
      startCheckoutBtn.style.opacity = '1';
      startCheckoutBtn.style.cursor = 'pointer';
      startCheckoutBtn.style.background = '';
      startCheckoutBtn.style.color = '';
    }
  }


}

function addToCart(productId, qty = 1) {
  const prod = BICKBEERNHOF_PRODUCTS.find(p => p.id === productId);
  if (!prod || !prod.inStock) return;

  const addAmount = Math.max(1, parseInt(qty) || 1);
  const existing = bickbeernhofCart.find(i => i.id === productId);

  if (existing) {
    existing.qty += addAmount;
  } else {
    bickbeernhofCart.push({ id: productId, qty: addAmount });
  }

  saveCart();
  openCartDrawer();
}

function changeCartQty(productId, delta) {
  const prod = BICKBEERNHOF_PRODUCTS.find(p => p.id === productId);
  const existing = bickbeernhofCart.find(i => i.id === productId);
  if (!existing || !prod) return;

  existing.qty += delta;
  if (existing.qty <= 0) {
    bickbeernhofCart = bickbeernhofCart.filter(i => i.id !== productId);
  }
  saveCart();
}

function removeFromCart(productId) {
  bickbeernhofCart = bickbeernhofCart.filter(i => i.id !== productId);
  saveCart();
}

// --- GLOBALER MOLLIE CHECKOUT HANDLER ---
async function handleMollieCheckoutSubmit(e) {
  e.preventDefault();

  if (!bickbeernhofCart || bickbeernhofCart.length === 0) {
    alert('Ihr Warenkorb ist leer.');
    return;
  }

  // Check 6er-Karton validity
  let totalGlass = 0;
  bickbeernhofCart.forEach(it => {
    const prod = BICKBEERNHOF_PRODUCTS.find(p => p.id === it.id);
    if (prod && prod.isGlass) totalGlass += it.qty;
  });

  if (totalGlass > 0 && totalGlass % 6 !== 0) {
    const needed = 6 - (totalGlass % 6);
    alert(`📦 Bitte füllen Sie Ihren 6er-Versandkarton:

Aktuell haben Sie ${totalGlass} Gläser/Flaschen im Warenkorb. Für den bruchsicheren Versand werden immer 6er-Kartonagen benötigt. Bitte fügen Sie noch ${needed} Glas/Gläser hinzu (Sorten beliebig kombinierbar!).`);
    return;
  }

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '🔒 Jetzt sicher bestellen & bezahlen';

  const firstNameEl = form.querySelector('#coFirstName') || document.getElementById('coFirstName');
  const lastNameEl = form.querySelector('#coLastName') || document.getElementById('coLastName');
  const emailEl = form.querySelector('#coEmail') || document.getElementById('coEmail');
  const streetEl = form.querySelector('#coStreet') || document.getElementById('coStreet');
  const zipEl = form.querySelector('#coZip') || document.getElementById('coZip');
  const cityEl = form.querySelector('#coCity') || document.getElementById('coCity');

  const customer = {
    firstName: firstNameEl ? firstNameEl.value.trim() : '',
    lastName: lastNameEl ? lastNameEl.value.trim() : '',
    email: emailEl ? emailEl.value.trim() : '',
    street: streetEl ? streetEl.value.trim() : '',
    zip: zipEl ? zipEl.value.trim() : '',
    city: cityEl ? cityEl.value.trim() : '',
  };

  let subtotal = 0;
  let totalPfand = 0;
  let pfandCount = 0;

  const items = bickbeernhofCart.map(item => {
    const p = BICKBEERNHOF_PRODUCTS.find(prod => prod.id === item.id);
    const itemPrice = p ? p.price : 0;
    subtotal += itemPrice * item.qty;

    if (p && p.hasDeposit) {
      totalPfand += (p.deposit || 0.25) * item.qty;
      pfandCount += item.qty;
    }

    return {
      id: item.id,
      title: p ? p.title : 'Hofladen Artikel',
      price: itemPrice,
      qty: item.qty
    };
  });

  // Circujar deposit as dedicated transparent line item
  if (totalPfand > 0) {
    items.push({
      id: 'circujar-pfand',
      title: `Circujar Mehrwegpfand (${pfandCount}x 0,25 €)`,
      price: 0.25,
      qty: pfandCount
    });
  }

  const shipping = (subtotal === 0) ? 0 : 5.60;
  const total = subtotal + totalPfand + shipping;

  try {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳ Verbindung zur sicheren Kasse...</span>';
    }

    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer,
        items,
        shipping,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.checkoutUrl) {
      throw new Error(data.error || 'Zahlung konnte nicht initialisiert werden.');
    }

    // Bestelldaten für die Bestätigungsseite zwischenspeichern
    sessionStorage.setItem('last_bickbeernhof_order', JSON.stringify({
      orderId: data.orderId,
      paymentId: data.paymentId,
      customer,
      items,
      subtotal: subtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
      createdAt: new Date().toISOString(),
    }));

    // Zur gesicherten Mollie Zahlungsseite weiterleiten
    window.location.href = data.checkoutUrl;

  } catch (err) {
    console.error('Fehler beim Mollie Checkout:', err);
    alert('Entschuldigung, beim Verbinden mit dem Zahlungsdienstleister ist ein Fehler aufgetreten: ' + err.message);
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

function ensureCartDrawerDOM() {
  if (document.getElementById('cartDrawer')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="cart-drawer-overlay" id="cartOverlay"></div>
    <aside class="cart-drawer" id="cartDrawer">
      <div class="cart-drawer-header">
        <h3>🛍️ Ihr Warenkorb</h3>
        <button class="cart-drawer-close" id="closeCartBtn" aria-label="Warenkorb schließen">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="free-shipping-bar-container" style="display: none;">
        <div class="free-shipping-text" id="freeShippingText">Noch 50,00 € bis zum kostenlosen Versand!</div>
        <div class="free-shipping-progress">
          <div class="free-shipping-fill" id="freeShippingFill" style="width: 0%;"></div>
        </div>
      </div>

      <div id="cartBoxTracker" style="padding: 0 20px;"></div>

      <div class="cart-drawer-body" id="cartItemsContainer"></div>

      <div class="cart-drawer-footer">
        <div class="cart-summary-row">
          <span>Zwischensumme Artikel:</span>
          <strong id="cartSubtotal">0,00 €</strong>
        </div>
        <div class="cart-summary-row smaller" id="cartPfandRow" style="display: none; color: #15803d; font-weight: 600;">
          <span>Circujar Mehrwegpfand:</span>
          <span id="cartPfandCost">0,00 €</span>
        </div>
        <div class="cart-summary-row smaller">
          <span>Versandkosten:</span>
          <span id="cartShippingCost">5,60 €</span>
        </div>
        <div class="cart-summary-row total">
          <span>Gesamtsumme (inkl. MwSt.):</span>
          <strong id="cartTotalSum">5,60 €</strong>
        </div>

        <button class="btn btn-secondary btn-special-glow btn-checkout-mollie" id="startCheckoutBtn" style="width: 100%; margin-top: 15px;">
          💳 Sicher zur Kasse
        </button>
        
        <div class="mollie-security-note">
          <span>🔒 Gesicherte SSL-Bezahlung (PayPal, Kreditkarte, Klarna)</span>
          <div class="mollie-icons-row">
            <span>PayPal</span> • <span>Klarna</span> • <span>Visa / MC</span> • <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </aside>

    <div class="shop-modal-overlay" id="checkoutModalOverlay"></div>
    <div class="checkout-modal" id="checkoutModal">
      <button class="modal-close-btn" id="closeCheckoutModalBtn" aria-label="Schließen">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      
      <div class="checkout-modal-header">
        <h2>💳 Kasse &amp; Bezahlung</h2>
        <p>Geben Sie Ihre Lieferadresse für den Versand ein.</p>
      </div>

      <form id="mollieCheckoutForm" class="checkout-form">
        <div class="form-row-2">
          <div class="form-group">
            <label for="coFirstName">Vorname *</label>
            <input type="text" id="coFirstName" class="form-control" placeholder="Max" required>
          </div>
          <div class="form-group">
            <label for="coLastName">Nachname *</label>
            <input type="text" id="coLastName" class="form-control" placeholder="Mustermann" required>
          </div>
        </div>

        <div class="form-group">
          <label for="coEmail">E-Mail-Adresse für Bestellbestätigung *</label>
          <input type="email" id="coEmail" class="form-control" placeholder="max.mustermann@beispiel.de" required>
        </div>

        <div class="form-group">
          <label for="coStreet">Straße &amp; Hausnummer *</label>
          <input type="text" id="coStreet" class="form-control" placeholder="Musterstraße 12" required>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label for="coZip">Postleitzahl *</label>
            <input type="text" id="coZip" class="form-control" placeholder="31628" required>
          </div>
          <div class="form-group">
            <label for="coCity">Ort *</label>
            <input type="text" id="coCity" class="form-control" placeholder="Landesbergen" required>
          </div>
        </div>

        <div class="checkout-payment-notice-box" style="background: rgba(44, 94, 59, 0.05); border: 1px solid rgba(44, 94, 59, 0.12); border-radius: 12px; padding: 14px 16px; margin: 15px 0; text-align: left;">
          <div style="font-size: 0.86rem; color: var(--color-text-dark); line-height: 1.45;">
            <strong style="color: var(--color-primary); display: block; margin-bottom: 3px;">Sichere Bezahlung:</strong>
            Die Auswahl Ihrer Zahlungsart (<strong>PayPal, Klarna, Kreditkarte, Apple Pay, Überweisung</strong> etc.) erfolgt im nächsten Schritt direkt auf der gesicherten Zahlungsseite.
          </div>
        </div>

        <div class="checkout-order-summary-box">
          <div class="summary-line"><span>Artikel im Warenkorb:</span> <strong id="modalSummaryCount">0</strong></div>
          <div class="summary-line"><span>Gesamtsumme inkl. MwSt., Pfand &amp; Versand:</span> <strong id="modalSummaryTotal" style="color: var(--color-secondary); font-size: 1.2rem;">0,00 €</strong></div>
        </div>

        <button type="submit" class="btn btn-secondary btn-special-glow" style="width: 100%; margin-top: 20px; padding: 14px;">
          🔒 Jetzt sicher bestellen & bezahlen
        </button>
        
        <p style="font-size: 0.78rem; text-align: center; color: var(--color-text-muted); margin-top: 12px;">
          Mit Klick auf Bestellbutton akzeptieren Sie unsere <a href="agb.html" target="_blank" style="color: var(--color-secondary);">AGB</a> und <a href="widerruf.html" target="_blank" style="color: var(--color-secondary);">Widerrufsbelehrung</a>.
        </p>
      </form>
    </div>
  `;
  document.body.appendChild(wrapper);
  bindCartEvents();
  updateCartUI();
}

function openCartDrawer() {
  ensureCartDrawerDOM();
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.add('active');
  if (overlay) overlay.classList.add('active');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

function bindCartEvents() {
  const closeCartBtn = document.getElementById('closeCartBtn');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);

  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  const startCheckoutBtn = document.getElementById('startCheckoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutOverlay = document.getElementById('checkoutModalOverlay');
  const closeCheckoutBtn = document.getElementById('closeCheckoutModalBtn');

  if (startCheckoutBtn && checkoutModal) {
    startCheckoutBtn.addEventListener('click', () => {
                  if (bickbeernhofCart.length === 0) {
        alert('Ihr Warenkorb ist leer.');
        return;
      }
      
      // Strict Separate 6er-Karton Verification (Bottles vs Jars)
      let countBottles = 0;
      let countJars = 0;
      bickbeernhofCart.forEach(item => {
        const prod = BICKBEERNHOF_PRODUCTS.find(p => p.id === item.id);
        if (prod) {
          if (prod.isBottle || prod.id === 'p4' || prod.id === 'p15') countBottles += item.qty;
          else if (prod.isJar || prod.isGlass) countJars += item.qty;
        }
      });

      const bValid = (countBottles === 0) || (countBottles % 6 === 0);
      const jValid = (countJars === 0) || (countJars % 6 === 0);

      if (!bValid || !jValid) {
        const needB = 6 - (countBottles % 6);
        const needJ = 6 - (countJars % 6);
        let msg = 'Bestellung noch nicht möglich:\n\nAus Gründen der Bruchsicherheit versenden wir Flaschen (0,7l & 0,75l) und Gläser (Kompott & Aufstriche) in getrennten 6er-Spezialkartonagen.\n\n';
        if (!bValid) {
          msg += `• 🍾 Flaschen (0,7l/0,75l): Aktuell ${countBottles} Flaschen. Es fehlen noch ${needB} ${needB === 1 ? 'Flasche' : 'Flaschen'} für einen vollen 6er-Karton.\n`;
        }
        if (!jValid) {
          msg += `• 🫙 Gläser: Aktuell ${countJars} Gläser. Es fehlen noch ${needJ} ${needJ === 1 ? 'Glas' : 'Gläser'} für einen vollen 6er-Karton.\n`;
        }
        msg += '\nBitte passen Sie Ihre Mengen in 6er-Einheiten an.';
        alert(msg);
        return;
      }

      closeCartDrawer();
      
      let subtotal = 0;
      let totalPfand = 0;
      bickbeernhofCart.forEach(item => {
        const p = BICKBEERNHOF_PRODUCTS.find(prod => prod.id === item.id);
        if (p) {
          subtotal += p.price * item.qty;
          if (p.hasDeposit) totalPfand += (p.deposit || 0.25) * item.qty;
        }
      });

      const totalCount = bickbeernhofCart.reduce((sum, item) => sum + item.qty, 0);
      const shipping = (subtotal === 0) ? 0 : 5.60;
      const total = subtotal + totalPfand + shipping;

      if (document.getElementById('modalSummaryCount')) document.getElementById('modalSummaryCount').textContent = totalCount + ' Artikel';
      if (document.getElementById('modalSummaryTotal')) document.getElementById('modalSummaryTotal').textContent = total.toFixed(2).replace('.', ',') + ' €';

      checkoutModal.classList.add('active');
      if (checkoutOverlay) checkoutOverlay.classList.add('active');
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => {
      if (checkoutModal) checkoutModal.classList.remove('active');
      if (checkoutOverlay) checkoutOverlay.classList.remove('active');
    });
  }
  if (checkoutOverlay) {
    checkoutOverlay.addEventListener('click', () => {
      if (checkoutModal) checkoutModal.classList.remove('active');
      checkoutOverlay.classList.remove('active');
    });
  }

  const checkoutForm = document.getElementById('mollieCheckoutForm');
  if (checkoutForm) {
    checkoutForm.removeEventListener('submit', handleMollieCheckoutSubmit);
    checkoutForm.addEventListener('submit', handleMollieCheckoutSubmit);
  }
}

function renderShopProducts(categoryFilter = 'all', searchQuery = '') {
  const grid = document.getElementById('shopProductsGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = BICKBEERNHOF_PRODUCTS.filter(p => {
    if (p.hideFromGrid) return false;
    const matchesCat = (categoryFilter === 'all') || (p.category === categoryFilter);
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <p style="font-size: 2.5rem;">🔍</p>
        <h3>Keine Produkte gefunden</h3>
        <p style="color: var(--color-text-muted);">Bitte wählen Sie eine andere Kategorie oder ändern Sie Ihren Suchbegriff.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'shop-product-card';
    card.innerHTML = `
      ${!p.inStock ? `
        <div style="position: absolute; top: 14px; left: 14px; z-index: 2;">
          <span class="product-card-badge outofstock" style="position: static;">Ausverkauft</span>
        </div>
      ` : ''}

      <div class="product-card-img-wrapper" onclick="window.location.href='produkt.html?id=${p.id}'" title="${p.title} ansehen">
        <img src="${p.img}" alt="${p.title}" loading="lazy">
        ${p.labelImg ? `<span class="product-card-label-indicator">2 Ansichten (inkl. Etikett)</span>` : ''}
      </div>

      <div class="product-card-content">
        <div>
          <div class="product-card-meta">${p.origin || 'Brokeloh • Eigener Bio-Anbau'}</div>
          <h3 class="product-card-title"><a href="produkt.html?id=${p.id}" style="color: inherit; text-decoration: none;">${p.title}</a></h3>
          
          <div class="product-card-price-box">
            <div class="product-price-line">
              <span class="product-price-main">${p.price.toFixed(2).replace('.', ',')} €</span>
              ${p.hasDeposit ? `<span class="product-deposit-note">zzgl. 0,25 € Pfand</span>` : ''}
            </div>
            <span class="product-unit-info">${p.unitPrice ? p.unitPrice + ' • ' : ''}${p.vat}</span>
          </div>
        </div>

        <div class="product-card-actions" style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 8px;">
          <a href="produkt.html?id=${p.id}" class="btn btn-outline" style="text-align: center; text-decoration: none; padding: 10px 8px; font-size: 0.84rem; font-weight: 700;">Details</a>
          ${p.inStock ? 
            `<button class="btn btn-secondary product-btn-add" onclick="addToCart('${p.id}', 1); openCartDrawer();" style="padding: 10px 8px; font-size: 0.84rem;">+ In den Korb</button>` : 
            `<button class="btn" style="background: #e2e8f0; color: #94a3b8; cursor: not-allowed; padding: 10px 8px; font-size: 0.84rem;" disabled>Ausverkauft</button>`
          }
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function openProductModal(productId) {
  const p = BICKBEERNHOF_PRODUCTS.find(item => item.id === productId);
  if (!p) return;

  const modal = document.getElementById('productDetailModal');
  const overlay = document.getElementById('productModalOverlay');
  const content = document.getElementById('productModalContent');

  if (!modal || !content) return;

  let nutritionHTML = '';
  if (p.nutrition) {
    nutritionHTML = `
      <div style="margin-top: 15px; background: rgba(30,34,69,0.03); border-radius: 12px; padding: 14px; border: 1px solid rgba(0,0,0,0.06);">
        <strong style="display: block; font-size: 0.85rem; color: var(--color-primary); margin-bottom: 8px;">📊 Nährwerte pro 100g:</strong>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 0.82rem; color: var(--color-text-dark);">
          <div>Brennwert: <strong>${p.nutrition.energy}</strong></div>
          <div>Kohlenhydrate: <strong>${p.nutrition.carbs}</strong></div>
          <div>Fett: <strong>${p.nutrition.fat}</strong></div>
          <div>Eiweiß: <strong>${p.nutrition.protein}</strong></div>
        </div>
      </div>
    `;
  }

  content.innerHTML = `
    <div>
      <div style="background: #FAF6F0; border-radius: 18px; padding: 20px; text-align: center;">
        <img src="${p.img}" alt="${p.title}" class="modal-product-img" style="max-height: 280px; object-fit: contain;">
      </div>
    </div>
    <div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
        ${!p.inStock ? `<span class="product-card-badge outofstock" style="position: static;">Ausverkauft</span>` : ''}
        
        ${p.hasDeposit ? `<span class="product-card-badge" style="position: static; background: #15803d; color: #fff;">0,25 € Circujar-Pfand</span>` : ''}
      </div>

      <h2 id="modalProductTitle" style="font-family: var(--font-title); color: var(--color-primary); margin-bottom: 8px; font-size: 1.5rem;">${p.title}</h2>
      
      <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px;">
        <span id="modalProductPrice" style="font-size: 1.6rem; font-weight: 800; color: var(--color-secondary);">${p.price.toFixed(2).replace('.', ',')} €</span>
        ${p.unitPrice ? `<span style="font-size: 0.88rem; color: var(--color-text-muted);">(${p.unitPrice})</span>` : ''}
        <span style="font-size: 0.76rem; color: #888888;">${p.vat}</span>
      </div>

      ${p.hasDeposit ? `
        <div style="background: #F0FDF4; border: 1.5px solid #BBF7D0; border-radius: 12px; padding: 12px 14px; font-size: 0.82rem; margin-bottom: 14px; color: #166534; line-height: 1.5;">
          <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; margin-bottom: 3px;">
            <span style="font-weight: 700;">Circujar-Mehrwegglas (0,25 € Pfand)</span>
          </div>
          Rückgabe in allen Supermärkten mit Circujar-Pfandsystem sowie direkt bei uns vor Ort möglich. 
          <a href="https://circujar.com/" target="_blank" rel="noopener" style="color: #15803d; font-weight: 700; text-decoration: underline;">Website besuchen ↗</a>
        </div>
      ` : ''}

      ${p.isGlass ? `
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 10px 14px; font-size: 0.82rem; margin-bottom: 14px; color: #334155;">
          <strong>📦 Bruchsicherer 6er-Versandkarton:</strong> Sie können beliebige Gläser &amp; Flaschen frei kombinieren. Wir versenden immer in vollen 6er-Kartonagen (6, 12, 18...).
        </div>
      ` : ''}

      ${p.pdfUrl ? `
        <div style="background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 12px 16px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.6rem;">📄</span>
            <div>
              <strong style="display: block; font-size: 0.86rem; color: var(--color-primary);">Offizielles Produktetikett</strong>
              <span style="font-size: 0.76rem; color: var(--color-text-muted);">Druckvorlage, Zutaten &amp; Nährwerte als PDF</span>
            </div>
          </div>
          <a href="${p.pdfUrl}" target="_blank" rel="noopener" class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 8px; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; font-weight: 700;">
            PDF ansehen ↗
          </a>
        </div>
      ` : ''}
      
      <p style="font-size: 0.92rem; line-height: 1.6; margin-bottom: 15px; color: var(--color-text-dark);">${p.description}</p>

      ${p.isVoucher ? `
        <div style="margin-bottom: 18px; text-align: left;">
          <label for="voucherValueSelect" style="font-weight: 700; font-size: 0.82rem; color: var(--color-primary); display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">Gutscheinwert auswählen:</label>
          <select id="voucherValueSelect" onchange="updateVoucherModalValue(this.value)" style="padding: 12px; border-radius: 12px; width: 100%; border: 1.5px solid rgba(0,0,0,0.15); font-weight: 700; color: var(--color-primary); background-color: #ffffff; cursor: pointer; outline: none; transition: border-color 0.2s;">
            <option value="v1">25,00 €</option>
            <option value="v2">50,00 €</option>
            <option value="v3">75,00 €</option>
            <option value="v4">100,00 €</option>
          </select>
        </div>
      ` : ''}

      ${!p.isVoucher ? `
        <div style="background: var(--color-bg-light); padding: 14px 18px; border-radius: 14px; font-size: 0.84rem; margin-bottom: 15px; border: 1px solid rgba(0,0,0,0.06);">
          <p style="margin-bottom: 4px;"><strong>🧪 Zutaten:</strong> ${p.ingredients}</p>
          ${p.bioCode ? `<p style="margin-bottom: 4px;"><strong>🌿 Zertifizierung:</strong> ${p.bioCode}</p>` : ''}
          <p style="margin-bottom: 0;"><strong>📍 Herkunft:</strong> ${p.origin}</p>
        </div>
      ` : ''}

      ${nutritionHTML}

      <div style="margin-top: 20px;">
        ${p.inStock ? `
          <div style="display: flex; gap: 12px; align-items: center;">
            <input type="number" id="modalQtyInput" value="1" min="1" max="60" style="width: 80px; padding: 10px; border-radius: 12px; border: 1.5px solid rgba(0,0,0,0.15); text-align: center; font-weight: 700;">
            <button id="modalAddToCartBtn" class="btn btn-secondary btn-special-glow" style="flex-grow: 1;" onclick="addToCart('${p.id}', parseInt(document.getElementById('modalQtyInput').value || 1)); closeProductModal();">
              🛍️ In den Warenkorb legen
            </button>
          </div>
        ` : `
          <div style="color: #ef4444; font-weight: 700; background: #fee2e2; padding: 12px; border-radius: 12px; text-align: center;">
            Dieser Artikel ist aktuell ausverkauft.
          </div>
        `}
      </div>
    </div>
  `;

  modal.classList.add('active');
  if (overlay) overlay.classList.add('active');
}

function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  const overlay = document.getElementById('productModalOverlay');
  if (modal) modal.classList.remove('active');
  if (overlay) overlay.classList.remove('active');
}

// Global Shop Init
function initShopModule() {
  initProduktSubpage();
  updateCartUI();

  // Cart Drawer Triggers
  const openCartBtns = document.querySelectorAll('#openCartBtn, .header-cart-btn');
  openCartBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openCartDrawer();
  }));

  const closeCartBtn = document.getElementById('closeCartBtn');
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);

  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

  // Modals Overlay Close
  const productModalOverlay = document.getElementById('productModalOverlay');
  if (productModalOverlay) productModalOverlay.addEventListener('click', closeProductModal);

  const closeProductModalBtn = document.getElementById('closeProductModalBtn');
  if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);

  // Render initial shop products if grid exists
  const grid = document.getElementById('shopProductsGrid');
  if (grid) {
    renderShopProducts('all', '');

    // Category Pills
    const pills = document.querySelectorAll('#shopCategoryFilters .category-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-category');
        const query = document.getElementById('shopSearchInput')?.value || '';
        renderShopProducts(cat, query);
      });
    });

    // Search Input
    const searchInput = document.getElementById('shopSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const activePill = document.querySelector('#shopCategoryFilters .category-pill.active');
        const cat = activePill ? activePill.getAttribute('data-category') : 'all';
        renderShopProducts(cat, e.target.value);
      });
    }
  }

  // Checkout Modal Triggers
  const startCheckoutBtn = document.getElementById('startCheckoutBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutOverlay = document.getElementById('checkoutModalOverlay');
  const closeCheckoutBtn = document.getElementById('closeCheckoutModalBtn');

  if (startCheckoutBtn && checkoutModal) {
    startCheckoutBtn.addEventListener('click', () => {
      if (bickbeernhofCart.length === 0) {
        alert('Ihr Warenkorb ist leer.');
        return;
      }
      closeCartDrawer();
      
      let subtotal = 0;
      let totalPfand = 0;
      bickbeernhofCart.forEach(item => {
        const p = BICKBEERNHOF_PRODUCTS.find(prod => prod.id === item.id);
        if (p) {
          subtotal += p.price * item.qty;
          if (p.hasDeposit) totalPfand += (p.deposit || 0.25) * item.qty;
        }
      });
      const totalCount = bickbeernhofCart.reduce((sum, item) => sum + item.qty, 0);
      const shipping = (subtotal === 0) ? 0 : 5.60;
      const total = subtotal + totalPfand + shipping;

      if (document.getElementById('modalSummaryCount')) document.getElementById('modalSummaryCount').textContent = totalCount + ' Artikel';
      if (document.getElementById('modalSummaryTotal')) document.getElementById('modalSummaryTotal').textContent = total.toFixed(2).replace('.', ',') + ' €';

      checkoutModal.classList.add('active');
      if (checkoutOverlay) checkoutOverlay.classList.add('active');
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => {
      if (checkoutModal) checkoutModal.classList.remove('active');
      if (checkoutOverlay) checkoutOverlay.classList.remove('active');
    });
  }
  if (checkoutOverlay) {
    checkoutOverlay.addEventListener('click', () => {
      if (checkoutModal) checkoutModal.classList.remove('active');
      checkoutOverlay.classList.remove('active');
    });
  }

  // Checkout form submit binding
  const checkoutForm = document.getElementById('mollieCheckoutForm');
  if (checkoutForm) {
    checkoutForm.removeEventListener('submit', handleMollieCheckoutSubmit);
    checkoutForm.addEventListener('submit', handleMollieCheckoutSubmit);
  }

  // Zahlungsabbruch-Hinweis auf shop.html prüfen
  if (window.location.pathname.includes('shop') && window.location.search.includes('payment=cancelled')) {
    setTimeout(() => {
      alert('ℹ️ Ihre Zahlung bei Mollie wurde abgebrochen. Ihre ausgewählten Artikel befinden sich weiterhin im Warenkorb.');
      openCartDrawer();
    }, 400);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShopModule);
} else {
  initShopModule();
}





/* ==========================================================================
   Hero Centerpiece Blueberry Roll-Out Scroll Animation
   Desktop: Classic dynamic roll-out
   Mobile: Stays stationary in hero, zero layout disruption
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const cluster = document.querySelector('.blueberry-cluster');
  if (!cluster) return;

  const handleScroll = () => {
    const scrollY = window.scrollY;
    // On desktop (min-width: 992px), classic dynamic roll-out
    if (window.innerWidth >= 992) {
      if (scrollY < 1200) {
        const translateX = scrollY * 0.65;
        const translateY = scrollY * 0.48;
        const rotation = scrollY * 0.28;
        cluster.style.transform = `translate3d(${translateX.toFixed(1)}px, ${translateY.toFixed(1)}px, 0) rotate(${rotation.toFixed(1)}deg)`;
        cluster.style.opacity = scrollY < 200 ? '1' : Math.max(0, 1 - (scrollY - 200) / 850).toFixed(3);
      } else {
        cluster.style.transform = 'translate3d(800px, 600px, 0) rotate(360deg)';
        cluster.style.opacity = '0';
      }
    } else {
      // On mobile, stay stationary inside the hero
      cluster.style.transform = 'none';
      cluster.style.opacity = '1';
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});


/* ==========================================================================
   Voucher Value Switcher for Product Details Modal
   ========================================================================== */
window.updateVoucherModalValue = function(prodId) {
  const p = BICKBEERNHOF_PRODUCTS.find(item => item.id === prodId);
  if (!p) return;
  
  // Update modal title
  const titleEl = document.getElementById('modalProductTitle');
  if (titleEl) titleEl.textContent = p.title;

  // Update modal price
  const priceEl = document.getElementById('modalProductPrice');
  if (priceEl) priceEl.textContent = p.price.toFixed(2).replace('.', ',') + ' €';

  // Update onclick action on the Add to Cart button
  const cartBtn = document.getElementById('modalAddToCartBtn');
  if (cartBtn) {
    cartBtn.setAttribute('onclick', `addToCart('${p.id}', parseInt(document.getElementById('modalQtyInput').value || 1)); closeProductModal();`);
  }
};


/* ==========================================================================
   Dedicated Single Product Subpage Logic (produkt.html)
   ========================================================================== */
function initProduktSubpage() {
  if (!document.body.classList.contains('page-produkt-subpage')) return;

  const urlParams = new URLSearchParams(window.location.search);
  const prodId = urlParams.get('id') || 'p1';
  const p = BICKBEERNHOF_PRODUCTS.find(item => item.id === prodId) || BICKBEERNHOF_PRODUCTS[0];
  if (!p) return;

  // Title & breadcrumb
  document.title = `${p.title} | Bickbeernhof Onlineshop`;
  const bcTitle = document.getElementById('pBreadcrumbTitle');
  if (bcTitle) bcTitle.textContent = p.title;

  const titleEl = document.getElementById('pProductTitle');
  if (titleEl) titleEl.textContent = p.title;

  const originEl = document.getElementById('pOriginEyebrow');
  if (originEl) originEl.textContent = p.origin || 'Brokeloh (eigener Bio-Anbau)';

  // Main Image & Badge
  const mainImg = document.getElementById('pMainStageImg');
  if (mainImg) {
    mainImg.src = p.img;
    mainImg.alt = p.title;
  }
  const stageBadge = document.getElementById('pStageBadge');
  if (stageBadge) stageBadge.style.display = 'none';

  // Thumbnails (Photo & Label)
  const thumbPhotoImg = document.getElementById('pThumbPhotoImg');
  if (thumbPhotoImg) thumbPhotoImg.src = p.img;

  const thumbLabel = document.getElementById('pThumbLabel');
  const thumbLabelImg = document.getElementById('pThumbLabelImg');
  if (p.labelImg && thumbLabel && thumbLabelImg) {
    thumbLabelImg.src = p.labelImg;
    thumbLabel.style.display = 'flex';
  } else if (thumbLabel) {
    thumbLabel.style.display = 'none';
  }

  // PDF Action Box
  const pdfBox = document.getElementById('pPdfActionBox');
  const pdfLink = document.getElementById('pPdfLinkBtn');
  if (p.pdfUrl && pdfBox && pdfLink) {
    pdfLink.href = p.pdfUrl;
    pdfBox.style.display = 'flex';
  } else if (pdfBox) {
    pdfBox.style.display = 'none';
  }

  // Price & Deposit
  const priceEl = document.getElementById('pProductPrice');
  if (priceEl) priceEl.textContent = p.price.toFixed(2).replace('.', ',') + ' €';

  const depositTag = document.getElementById('pDepositTag');
  if (depositTag) {
    if (p.hasDeposit) {
      depositTag.textContent = '0,25 € Circujar-Pfand';
      depositTag.style.display = 'inline-block';
    } else {
      depositTag.style.display = 'none';
    }
  }

  const unitPriceEl = document.getElementById('pProductUnitPrice');
  if (unitPriceEl) {
    unitPriceEl.textContent = `${p.unitPrice ? p.unitPrice + ' • ' : ''}${p.vat}, zzgl. Versand`;
  }

  // Shipping Box Notice
  const shippingNotice = document.getElementById('pShippingBoxNotice');
  if (shippingNotice) {
    shippingNotice.style.display = p.isGlass ? 'block' : 'none';
  }

  // Description
  const descEl = document.getElementById('pProductDescription');
  if (descEl) descEl.textContent = p.description;

  // Circujar Card
  const circujarCard = document.getElementById('pCircujarCard');
  if (circujarCard) {
    circujarCard.style.display = p.hasDeposit ? 'block' : 'none';
  }

  // Ingredients Tab
  const ingBody = document.getElementById('pIngredientsBody');
  if (ingBody) {
    ingBody.innerHTML = `
      <p style="margin-bottom: 8px;"><strong>Zutaten:</strong> ${p.ingredients}</p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; font-size: 0.8rem; color: #64748b; margin-top: 10px;">
        ${p.fruitContent ? `<span>🍇 ${p.fruitContent}</span>` : ''}
        ${p.bioCode ? `<span>🌿 ${p.bioCode}</span>` : ''}
        ${p.isVegan ? `<span>🌱 100% Vegan</span>` : ''}
      </div>
    `;
  }

  // Nutrition Tab
  const nutItem = document.getElementById('accNutritionItem');
  const nutBody = document.getElementById('pNutritionBody');
  if (p.nutrition && nutItem && nutBody) {
    nutItem.style.display = 'block';
    nutBody.innerHTML = `
      <table class="nutrition-table">
        <thead>
          <tr>
            <th>Durchschnittliche Nährwerte</th>
            <th style="text-align: right;">pro 100 g</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Brennwert</td>
            <td style="text-align: right;"><strong>${p.nutrition.energy}</strong></td>
          </tr>
          <tr>
            <td>Fett</td>
            <td style="text-align: right;"><strong>${p.nutrition.fat}</strong></td>
          </tr>
          <tr>
            <td style="padding-left: 20px; color: #64748b;">- davon gesättigte Fettsäuren</td>
            <td style="text-align: right;">${p.nutrition.fatSat || '0,0 g'}</td>
          </tr>
          <tr>
            <td>Kohlenhydrate</td>
            <td style="text-align: right;"><strong>${p.nutrition.carbs}</strong></td>
          </tr>
          <tr>
            <td style="padding-left: 20px; color: #64748b;">- davon Zucker</td>
            <td style="text-align: right;">${p.nutrition.sugar || p.nutrition.carbs}</td>
          </tr>
          ${p.nutrition.fiber ? `
          <tr>
            <td>Ballaststoffe</td>
            <td style="text-align: right;">${p.nutrition.fiber}</td>
          </tr>` : ''}
          <tr>
            <td>Eiweiß</td>
            <td style="text-align: right;"><strong>${p.nutrition.protein}</strong></td>
          </tr>
          <tr>
            <td>Salz</td>
            <td style="text-align: right;"><strong>${p.nutrition.salt || '0,00 g'}</strong></td>
          </tr>
        </tbody>
      </table>
      ${p.labelImg ? `
        <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button type="button" class="btn btn-outline" onclick="openProductLightbox('label')" style="font-size: 0.82rem; padding: 7px 14px; border-radius: 8px; font-weight: 600;">
            🔍 Original-Etikett in Vollbild öffnen
          </button>
          ${p.pdfUrl ? `
            <a href="${p.pdfUrl}" target="_blank" rel="noopener" class="btn btn-outline" style="font-size: 0.82rem; padding: 7px 14px; border-radius: 8px; font-weight: 600; text-decoration: none;">
              📄 Offizielle PDF öffnen ↗
            </a>
          ` : ''}
        </div>
      ` : ''}
    `;
  } else if (nutItem) {
    nutItem.style.display = 'none';
  }

  // Related Products
  const relatedGrid = document.getElementById('pRelatedGrid');
  if (relatedGrid) {
    const related = BICKBEERNHOF_PRODUCTS.filter(item => item.id !== p.id && (item.category === p.category || !item.category)).slice(0, 3);
    const pool = related.length === 3 ? related : BICKBEERNHOF_PRODUCTS.filter(item => item.id !== p.id).slice(0, 3);
    relatedGrid.innerHTML = '';
    pool.forEach(rel => {
      const card = document.createElement('div');
      card.className = 'shop-product-card';
      card.innerHTML = `
        <div class="product-card-img-wrapper" onclick="window.location.href='produkt.html?id=${rel.id}'">
          <img src="${rel.img}" alt="${rel.title}" loading="lazy">
        </div>
        <div class="product-card-content">
          <div>
            <div class="product-card-meta">${rel.origin || 'Brokeloh'}</div>
            <h3 class="product-card-title"><a href="produkt.html?id=${rel.id}" style="color: inherit; text-decoration: none;">${rel.title}</a></h3>
            <div class="product-card-price-box">
              <div class="product-price-line">
                <span class="product-price-main">${rel.price.toFixed(2).replace('.', ',')} €</span>
                ${rel.hasDeposit ? `<span class="product-deposit-note">zzgl. 0,25 € Pfand</span>` : ''}
              </div>
              <span class="product-unit-info">${rel.unitPrice || ''}</span>
            </div>
          </div>
          <div class="product-card-actions" style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 8px;">
            <a href="produkt.html?id=${rel.id}" class="btn btn-outline" style="text-align: center; text-decoration: none; padding: 10px 8px; font-size: 0.84rem; font-weight: 700;">Details</a>
            <button class="btn btn-secondary product-btn-add" onclick="addToCart('${rel.id}', 1); openCartDrawer();" style="padding: 10px 8px; font-size: 0.84rem;">+ In den Korb</button>
          </div>
        </div>
      `;
      relatedGrid.appendChild(card);
    });
  }

  // Window helper functions for produkt.html
  window.switchProductView = function(view) {
    const mainImg = document.getElementById('pMainStageImg');
    const thumbPhoto = document.getElementById('pThumbPhoto');
    const thumbLabel = document.getElementById('pThumbLabel');
    if (!mainImg) return;

    mainImg.style.opacity = '0.3';
    setTimeout(() => {
      if (view === 'label' && p.labelImg) {
        mainImg.src = p.labelImg;
        if (thumbLabel) thumbLabel.classList.add('active');
        if (thumbPhoto) thumbPhoto.classList.remove('active');
      } else {
        mainImg.src = p.img;
        if (thumbPhoto) thumbPhoto.classList.add('active');
        if (thumbLabel) thumbLabel.classList.remove('active');
      }
      mainImg.style.opacity = '1';
    }, 150);
  };

  window.adjustProductPageQty = function(delta) {
    const input = document.getElementById('productPageQtyInput');
    if (!input) return;
    let val = parseInt(input.value || 1) + delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    input.value = val;
  };

  window.addProductPageToCart = function() {
    const input = document.getElementById('productPageQtyInput');
    const qty = parseInt(input ? input.value : 1) || 1;
    addToCart(p.id, qty);
    openCartDrawer();
  };

  
  // Lightbox Viewport Controllers
  let currentLightboxView = 'photo';
  window.openProductLightbox = function(view = null) {
    const lb = document.getElementById('productLightbox');
    const lbImg = document.getElementById('lightboxMainImg');
    const lbTitle = document.getElementById('lightboxTitle');
    const lbBtnLabel = document.getElementById('lbBtnLabel');
    const lbPdfLink = document.getElementById('lbPdfLink');
    if (!lb || !lbImg) return;

    if (lbTitle) lbTitle.textContent = p.title;

    if (p.labelImg && lbBtnLabel) {
      lbBtnLabel.style.display = 'inline-flex';
    } else if (lbBtnLabel) {
      lbBtnLabel.style.display = 'none';
    }

    if (p.pdfUrl && lbPdfLink) {
      lbPdfLink.href = p.pdfUrl;
      lbPdfLink.style.display = 'inline-flex';
    } else if (lbPdfLink) {
      lbPdfLink.style.display = 'none';
    }

    currentLightboxView = view || currentLightboxView || 'photo';
    window.switchLightboxView(currentLightboxView);

    lb.style.display = 'flex';
    document.body.classList.add('no-scroll');
  };

  window.closeProductLightbox = function() {
    const lb = document.getElementById('productLightbox');
    if (lb) lb.style.display = 'none';
    document.body.classList.remove('no-scroll');
  };

  window.switchLightboxView = function(view) {
    currentLightboxView = view;
    const lbImg = document.getElementById('lightboxMainImg');
    const btnPhoto = document.getElementById('lbBtnPhoto');
    const btnLabel = document.getElementById('lbBtnLabel');
    if (!lbImg) return;

    if (view === 'label' && p.labelImg) {
      lbImg.src = p.labelImg;
      if (btnLabel) btnLabel.classList.add('active');
      if (btnPhoto) btnPhoto.classList.remove('active');
    } else {
      lbImg.src = p.img;
      if (btnPhoto) btnPhoto.classList.add('active');
      if (btnLabel) btnLabel.classList.remove('active');
    }
  };

  // Close lightbox on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeProductLightbox();
  });

  window.toggleProductAccordion = function(itemId) {
    const item = document.getElementById(itemId);
    if (!item) return;
    const isActive = item.classList.contains('active');
    item.classList.toggle('active');
    const icon = item.querySelector('.p-acc-icon');
    if (icon) icon.textContent = isActive ? '+' : '−';
  };
}
