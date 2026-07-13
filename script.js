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
    const customPdfUrl = localStorage.getItem('bickbeern_menu_pdf_url');
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
    const storedEvents = localStorage.getItem('bickbeern_events_custom');
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
    const storedSettings = localStorage.getItem('bickbeern_popup_settings');
    if (!storedSettings) return;

    try {
      const settings = JSON.parse(storedSettings);
      if (!settings.active) return;

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
            ${settings.text.replace(/\n/g, '<br>')}
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
