const initPortfolio = () => {
  // 1. Preloader
  const preloader = document.getElementById('preloader');
  let preloaderHidden = false;

  const hidePreloader = () => {
    if (!preloader || preloaderHidden) return;
    preloaderHidden = true;
    preloader.classList.add('is-hidden');
  };

  window.addEventListener('load', hidePreloader, { once: true });
  window.addEventListener('pageshow', hidePreloader, { once: true });
  setTimeout(hidePreloader, 1800);

  // 2. Scroll Progress, Sticky Navbar, Scroll-to-Top, Active Link Tracking
  const scrollProgress = document.getElementById('scroll-progress');
  const scrollTopBtn = document.getElementById('scroll-top');
  const navbar = document.querySelector('.navbar');
  const sections = document.querySelectorAll('section[id], header[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  function onScroll() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    scrollProgress.style.width = `${progress}%`;

    navbar.classList.toggle('scrolled', window.scrollY > 50);
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);

    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 120) {
        current = section.getAttribute('id');
      }
    });

    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 3. Mobile Navigation Menu Toggle
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.getElementById('nav-links');

  mobileMenu.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    mobileMenu.classList.toggle('active', isOpen);
    mobileMenu.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  navAnchors.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenu.classList.remove('active');
      mobileMenu.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-label', 'Open menu');
    });
  });

  // 4. Scroll Reveal Animations
  const revealTargets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  // 5. Typing Text Effect (role line in the hero)
  class TypeWriter {
    constructor(txtElement, words, wait = 2000) {
      this.txtElement = txtElement;
      this.words = words;
      this.txt = '';
      this.wordIndex = 0;
      this.wait = parseInt(wait, 10);
      this.isDeleting = false;
      this.type();
    }

    type() {
      const current = this.wordIndex % this.words.length;
      const fullTxt = this.words[current];

      this.txt = this.isDeleting
        ? fullTxt.substring(0, this.txt.length - 1)
        : fullTxt.substring(0, this.txt.length + 1);

      this.txtElement.textContent = this.txt;
      let typeSpeed = this.isDeleting ? 45 : 90;

      if (!this.isDeleting && this.txt === fullTxt) {
        typeSpeed = this.wait;
        this.isDeleting = true;
      } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.wordIndex++;
        typeSpeed = 400;
      }

      setTimeout(() => this.type(), typeSpeed);
    }
  }

  const txtElement = document.querySelector('.txt-type');
  if (txtElement) {
    const words = JSON.parse(txtElement.getAttribute('data-words'));
    const wait = txtElement.getAttribute('data-wait');
    new TypeWriter(txtElement, words, wait);
  }

  // 6. Dark / Light Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggle(savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
    syncGameColors();
  });

  function updateThemeToggle(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fas fa-sun';
      themeToggle.setAttribute('aria-label', 'Switch to light theme');
    } else {
      icon.className = 'fas fa-moon';
      themeToggle.setAttribute('aria-label', 'Switch to dark theme');
    }
  }

  // 7. Skills Bar Fill (runs once, driven by the reveal observer's section)
  const skillsSection = document.getElementById('skills');
  if (skillsSection && 'IntersectionObserver' in window) {
    const skillsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.skill-progress').forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    skillsObserver.observe(skillsSection);
  } else if (skillsSection) {
    document.querySelectorAll('.skill-progress').forEach(bar => {
      bar.style.width = bar.getAttribute('data-width');
    });
  }

  // 8. Helper: build a "media frame" with an image + auto placeholder fallback.
  // Drop a real file at the given `src` path and the placeholder disappears
  // automatically the next time the image loads successfully.
  function buildMediaFrame(src, alt, extraClass = '') {
    return `
      <div class="media-frame ${extraClass}">
        <img src="${src}" alt="${alt}" loading="lazy" onerror="this.closest('.media-frame').classList.add('media-error')">
        <div class="media-fallback"><i class="fas fa-image" aria-hidden="true"></i><span>Add image: ${src}</span></div>
      </div>
    `;
  }

  // ==========================================
  // 9. Certificates — data, carousel render, modal gallery
  // ==========================================
  const certificates = [
    {
      title: 'Introduction to Artificial Intelligence (AI)',
      year: '2026',
      description: 'Advancing digital skills through Artificial Intelligence to unlock new opportunities and innovation.',
      icon: 'fa-award',
      image: 'images/certificates/intro_to_ai.jpg'
    },
    {
      title: 'Introduction to Cybersecurity',
      year: '2026',
      description: 'Equipping individuals with essential cybersecurity skills to identify threats, protect information, and strengthen digital resilience.',
      icon: 'fa-pen-ruler',
      image: 'images/certificates/cybersecurity.jpg'
    },
    {
      title: 'Introduction to Data Analytics',
      year: '2026',
      description: 'Building essential data analytics skills to solve problems, improve performance, and drive innovation through data.',
      icon: 'fa-lock',
      image: 'images/certificates/data_analystic.jpg'
    },
    {
      title: 'C++ Essentials 1',
      year: '2026',
      description: 'Empowering learners with foundational C++ skills to develop logical thinking and programming proficiency.',
      icon: 'fa-database',
      image: 'images/certificates/c1.jpg'
    },
    {
      title: 'C++ Essentials 2',
      year: '2026',
      description: 'Advancing C++ programming skills through object-oriented programming, data structures, and real-world application development.',
      icon: 'fa-people-arrows',
      image: 'images/certificates/c2.jpg'
    },
    {
      title: 'Computer Hardware Basics',
      year: '2026',
      description: 'Providing the essential hardware knowledge needed to build, maintain, and troubleshoot computer systems with confidence.',
      icon: 'fa-laptop-code',
      image: 'images/certificates/chb.jpg'
    },
    {
      title: 'Getting Started with Cisco Packet Tracer',
      year: '2024',
      description: 'Learning the fundamentals of networking through hands-on simulation with Cisco Packet Tracer.',
      icon: 'fa-network-wired',
      image: 'images/certificates/cisco.jpg'
    },
    {
      title: 'HTML Essentials',
      year: '2026',
      description: 'Learning the fundamentals of HTML to build and structure web content.',
      icon: 'fa-code',
      image: 'images/certificates/html.jpg'
    },
    {
      title: 'Introduction to Greenhouse Gas Accounting for IT',
      year: '2026',
      description: 'Developing foundational knowledge of greenhouse gas accounting to help drive sustainability and informed decision-making in information technology.',
      icon: 'fa-network-wired',
      image: 'images/certificates/intro_greengas.jpg'
    },
    {
      title: 'Introduction to Modern AI',
      year: '2025',
      description: 'Empowering learners with foundational knowledge of modern Artificial Intelligence to drive innovation, creativity, and informed decision-making.',
      icon: 'fa-network-wired',
      image: 'images/certificates/intro_modern_ai.jpg'
    },
    {
      title: 'Exploring the Internet of Things (IoT) with Cisco Packet Tracer',
      year: '2024',
      description: 'Developing practical IoT skills by exploring connected devices, network communication, and smart technologies with Cisco Packet Tracer.',
      icon: 'fa-award',
      image: 'images/certificates/iot.jpg'
    },
    {
      title: 'JavaScript Essentials 1',
      year: '2026',
      description: 'Learning the fundamentals of JavaScript to build interactive web applications.',
      icon: 'fa-code',
      image: 'images/certificates/js1.jpg'
    },
    {
      title: 'Networking Devices and Basic Configuration',
      year: '2024',
      description: 'Learning the fundamentals of networking devices and their basic configuration.',
      icon: 'fa-network-wired',
      image: 'images/certificates/networking_device.jpg'
    },
    {
      title: 'Python Essentials 1',
      year: '2026',
      description: 'Learning the fundamentals of Python for programming and automation.',
      icon: 'fa-code',
      image: 'images/certificates/python.jpg'
    },
    {
      title: 'Networking Basics and Fundamentals',
      year: '2026',
      description: 'Learning the fundamentals of networking and their practical applications.',
      icon: 'fa-network-wired',
      image: 'images/certificates/networkingbasic.jpg'
    }
  ];

  const carouselTrack = document.getElementById('carouselTrack');
  const certificateCarousel = document.getElementById('certificatesCarousel');

  function renderNetflixCarousel() {
    if (!carouselTrack) return;

    carouselTrack.innerHTML = certificates.map((cert, index) => `
      <div class="netflix-card" data-index="${index}" tabindex="0" role="button" aria-label="View certificate: ${cert.title}">
        ${buildMediaFrame(cert.image, `${cert.title} certificate`)}
        <div class="netflix-card-overlay">
          <div class="netflix-card-info">
            <h3 class="netflix-card-title">${cert.title}</h3>
            <div class="netflix-card-meta">
              <span class="netflix-card-year">${cert.year}</span>
              <span><i class="fas ${cert.icon}" aria-hidden="true"></i></span>
            </div>
            <div class="netflix-card-actions">
              <button class="netflix-action-btn netflix-info-btn" data-index="${index}" type="button" title="View credential" tabindex="-1">
                <i class="fas fa-circle-info" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    carouselTrack.querySelectorAll('.netflix-card').forEach(card => {
      const index = Number(card.dataset.index);
      card.addEventListener('click', () => openCertModalWithExpand(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCertModalWithExpand(index);
        }
      });
    });

    carouselTrack.querySelectorAll('.netflix-info-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCertModal(Number(btn.dataset.index));
      });
    });
  }

  renderNetflixCarousel();

  // Gentle auto-scroll through the certificate carousel; pauses on interaction.
  function startAutoScroll() {
    const scrollContainer = certificateCarousel;
    if (!scrollContainer) return;

    let currentCardIndex = 0;
    let isAutoScrolling = true;
    let autoScrollTimeout = null;

    const getCardWidth = () => {
      const firstCard = scrollContainer.querySelector('.netflix-card');
      if (!firstCard) return 0;
      const styles = window.getComputedStyle(firstCard);
      const margin = parseFloat(styles.marginRight) + parseFloat(styles.marginLeft);
      return firstCard.offsetWidth + margin;
    };

    const scrollToCard = (index) => {
      scrollContainer.scrollTo({ left: index * getCardWidth(), behavior: 'smooth' });
    };

    const advanceToNextCard = () => {
      if (!isAutoScrolling) return;
      const totalCards = scrollContainer.querySelectorAll('.netflix-card').length;
      currentCardIndex = (currentCardIndex + 1) % totalCards;
      scrollToCard(currentCardIndex);
      autoScrollTimeout = setTimeout(advanceToNextCard, 1500);
    };

    const pauseAutoScroll = () => {
      isAutoScrolling = false;
      if (autoScrollTimeout) clearTimeout(autoScrollTimeout);
    };

    const resumeAutoScroll = () => {
      if (isAutoScrolling) return;
      isAutoScrolling = true;
      autoScrollTimeout = setTimeout(advanceToNextCard, 2000);
    };

    scrollContainer.addEventListener('wheel', pauseAutoScroll, { passive: true });
    scrollContainer.addEventListener('touchstart', pauseAutoScroll, { passive: true });
    scrollContainer.addEventListener('mousedown', pauseAutoScroll);
    scrollContainer.addEventListener('focusin', pauseAutoScroll);
    scrollContainer.addEventListener('mouseup', () => { autoScrollTimeout = setTimeout(resumeAutoScroll, 3000); });
    scrollContainer.addEventListener('touchend', () => { autoScrollTimeout = setTimeout(resumeAutoScroll, 3000); });
    scrollContainer.addEventListener('mouseleave', () => { autoScrollTimeout = setTimeout(resumeAutoScroll, 2000); });

    autoScrollTimeout = setTimeout(advanceToNextCard, 2000);
  }

  startAutoScroll();

  // Certificate modal
  const certModal = document.getElementById('certificateModal');
  const certModalImage = document.getElementById('modalCertImage');
  const certModalYear = document.getElementById('certificateModalYear');
  const certModalTitle = document.getElementById('certificateModalTitle');
  const certModalText = document.getElementById('certificateModalText');
  const certModalCounter = document.getElementById('certificateModalCounter');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const prevCertBtn = document.getElementById('prevCertBtn');
  const nextCertBtn = document.getElementById('nextCertBtn');

  let activeCertIndex = 0;
  let certModalTrigger = null;

  function fillCertModal(index) {
    const cert = certificates[index];
    certModalImage.src = cert.image;
    certModalImage.alt = `${cert.title} certificate`;
    certModalImage.closest('.modal-image-frame').classList.remove('media-error');
    certModalYear.textContent = cert.year;
    certModalTitle.textContent = cert.title;
    certModalText.textContent = cert.description;
    certModalCounter.textContent = `${index + 1} / ${certificates.length}`;
  }

  function openCertModal(index) {
    activeCertIndex = index;
    certModalTrigger = document.activeElement;
    fillCertModal(activeCertIndex);
    certModal.classList.add('is-open');
    certModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalCloseBtn.focus();
  }

  function openCertModalWithExpand(index) {
    activeCertIndex = index;
    certModalTrigger = document.activeElement;
    fillCertModal(activeCertIndex);
    certModal.classList.add('expanding');

    setTimeout(() => {
      certModal.classList.remove('expanding');
      certModal.classList.add('is-open');
      modalCloseBtn.focus();
    }, 100);

    document.body.style.overflow = 'hidden';
    certModal.setAttribute('aria-hidden', 'false');
  }

  function closeCertModal() {
    certModal.classList.remove('is-open');
    certModal.classList.add('closing');

    setTimeout(() => {
      certModal.classList.remove('closing');
      certModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (certModalTrigger) certModalTrigger.focus();
    }, 300);
  }

  function showCert(step) {
    activeCertIndex = (activeCertIndex + step + certificates.length) % certificates.length;
    fillCertModal(activeCertIndex);
  }

  if (prevCertBtn) prevCertBtn.addEventListener('click', () => showCert(-1));
  if (nextCertBtn) nextCertBtn.addEventListener('click', () => showCert(1));
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCertModal);

  if (certModal) {
    certModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('certificate-modal-backdrop')) closeCertModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!certModal || !certModal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeCertModal();
    if (e.key === 'ArrowRight') showCert(1);
    if (e.key === 'ArrowLeft') showCert(-1);
  });

  (function addCertSwipeSupport() {
    const panel = document.querySelector('.certificate-modal-panel');
    if (!panel) return;
    let touchStartX = 0;
    panel.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    panel.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) < 40) return;
      delta < 0 ? showCert(1) : showCert(-1);
    }, { passive: true });
  })();

  // ==========================================
  // 10. Projects — data, filtered grid render, "View More", modal
  // ==========================================
  const projects = [
    {
      title: 'Furcare AI Assistant',
      tag: 'Fullstack',
      category: 'fullstack',
      description: 'An AI-powered assistant for managing and automating fur care services.',
      image: 'images/projects/furcare.png'
    },
    {
      title: 'Leaf Book Review System',
      tag: 'Fullstack',
      category: 'fullstack',
      description: 'A system for reviewing and rating books with a focus on user engagement and community interaction.',
      image: 'images/projects/leaf.png'
    },
    {
      title: 'RFID Door Access Control System',
      tag: 'Internet of Things (IoT)',
      category: 'iot',
      description: 'A system for controlling door access using RFID technology that records access logs and provides real-time monitoring.',
      image: 'images/projects/rfid.png'
    },
    {
      title: 'Choi - Co - Lates Inventory',
      tag: 'Fullstack',
      category: 'fullstack',
      description: 'A system for managing and tracking inventory with real-time updates and reporting capabilities.',
      image: 'images/projects/choi-co-lates.png'
    },
    {
      title: 'Techbee Accounting System',
      tag: 'Fullstack',
      category: 'fullstack',
      description: 'A comprehensive accounting system for managing financial records, generating reports, and ensuring compliance with accounting standards.',
      image: 'images/projects/techbee.jpg'
    }
  ];

  const PROJECT_PAGE_SIZE = 2;
  let projectsVisibleCount = Math.min(PROJECT_PAGE_SIZE, projects.length);
  let activeFilter = 'all';
  let filteredProjects = [];

  const projectsGrid = document.getElementById('projectsGrid');
  const viewMoreProjectsBtn = document.getElementById('viewMoreProjectsBtn');
  const filterButtons = document.querySelectorAll('.filter-btn');

  function getFilteredProjects() {
    return activeFilter === 'all'
      ? projects
      : projects.filter(project => project.category === activeFilter);
  }

  function renderProjects() {
    if (!projectsGrid) return;
    filteredProjects = getFilteredProjects();

    projectsGrid.innerHTML = filteredProjects.slice(0, projectsVisibleCount).map((project, index) => `
      <div class="project-card" data-index="${index}" tabindex="0" role="button" aria-label="View project: ${project.title}">
        ${buildMediaFrame(project.image, `${project.title} screenshot`, 'project-thumb')}
        <div class="project-info">
          <span class="proj-tag">${project.tag}</span>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </div>
      </div>
    `).join('');

    if (viewMoreProjectsBtn) {
      viewMoreProjectsBtn.classList.toggle('is-hidden', projectsVisibleCount >= filteredProjects.length);
    }

    projectsGrid.querySelectorAll('.project-card').forEach((card) => {
      const index = Number(card.dataset.index);
      card.addEventListener('click', () => openProjectModalWithExpand(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProjectModalWithExpand(index);
        }
      });
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      projectsVisibleCount = Math.min(PROJECT_PAGE_SIZE, getFilteredProjects().length);
      renderProjects();
    });
  });

  if (viewMoreProjectsBtn) {
    viewMoreProjectsBtn.addEventListener('click', () => {
      projectsVisibleCount = Math.min(projectsVisibleCount + PROJECT_PAGE_SIZE, getFilteredProjects().length);
      renderProjects();
    });
  }

  renderProjects();

  // Project modal
  const projectModal = document.getElementById('projectModal');
  const modalProjectImage = document.getElementById('modalProjectImage');
  const projectModalTag = document.getElementById('projectModalTag');
  const projectModalTitle = document.getElementById('projectModalTitle');
  const projectModalDescription = document.getElementById('projectModalDescription');
  const projectModalCounter = document.getElementById('projectModalCounter');
  const projectModalCloseBtn = document.getElementById('projectModalCloseBtn');
  const prevProjectBtn = document.getElementById('prevProjectBtn');
  const nextProjectBtn = document.getElementById('nextProjectBtn');

  let activeProjectIndex = 0;
  let projectModalTrigger = null;

  function fillProjectModal(index) {
    const project = filteredProjects[index];
    modalProjectImage.src = project.image;
    modalProjectImage.alt = `${project.title} screenshot`;
    modalProjectImage.closest('.modal-image-frame').classList.remove('media-error');
    projectModalTag.textContent = project.tag;
    projectModalTitle.textContent = project.title;
    projectModalDescription.textContent = project.description;
    projectModalCounter.textContent = `${index + 1} / ${filteredProjects.length}`;
  }

  function openProjectModalWithExpand(index) {
    activeProjectIndex = index;
    projectModalTrigger = document.activeElement;
    fillProjectModal(activeProjectIndex);
    projectModal.classList.add('expanding');

    setTimeout(() => {
      projectModal.classList.remove('expanding');
      projectModal.classList.add('is-open');
      projectModalCloseBtn.focus();
    }, 100);

    document.body.style.overflow = 'hidden';
    projectModal.setAttribute('aria-hidden', 'false');
  }

  function closeProjectModal() {
    projectModal.classList.remove('is-open');
    projectModal.classList.add('closing');

    setTimeout(() => {
      projectModal.classList.remove('closing');
      projectModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (projectModalTrigger) projectModalTrigger.focus();
    }, 300);
  }

  function showProject(step) {
    activeProjectIndex = (activeProjectIndex + step + filteredProjects.length) % filteredProjects.length;
    fillProjectModal(activeProjectIndex);
  }

  if (prevProjectBtn) prevProjectBtn.addEventListener('click', () => showProject(-1));
  if (nextProjectBtn) nextProjectBtn.addEventListener('click', () => showProject(1));
  if (projectModalCloseBtn) projectModalCloseBtn.addEventListener('click', closeProjectModal);

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('project-modal-backdrop')) closeProjectModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!projectModal || !projectModal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeProjectModal();
    if (e.key === 'ArrowRight') showProject(1);
    if (e.key === 'ArrowLeft') showProject(-1);
  });

  (function addProjectSwipeSupport() {
    const panel = document.querySelector('.project-modal-panel');
    if (!panel) return;
    let touchStartX = 0;
    panel.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    panel.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) < 40) return;
      delta < 0 ? showProject(1) : showProject(-1);
    }, { passive: true });
  })();

  // ==========================================
  // 11. Contact Form — lightweight client-side validation
  // ==========================================
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        feedback.style.color = '#d97757';
        feedback.textContent = 'Please fill in your name, a valid email, and a message before sending.';
        form.reportValidity();
        return;
      }

      feedback.style.color = 'var(--matcha-mist)';
      feedback.textContent = 'Thank you! Your message was sent successfully.';
      form.reset();
    });
  }

  // ==========================================
  // 12. Mini Arcade — Flappy-style plane game
  // ==========================================
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const gameBtn = document.getElementById('game-btn');
  const scoreDisplay = document.getElementById('game-score');
  const highScoreDisplay = document.getElementById('game-high-score');

  let animationFrameId;
  let gameRunning = false;
  let gameStarted = false;
  let score = 0;
  let highScore = Number(localStorage.getItem('highScore')) || 0;
  highScoreDisplay.textContent = `High Score: ${highScore}`;

  // Canvas fillStyle can't read CSS variables directly, so resolve the
  // actual color values once (and again on theme toggle) and cache them.
  // These are intentionally a fixed, high-contrast palette of their own
  // (see --game-sky / --game-pipe in style.css) so the obstacles can never
  // end up the same color as the background, in either site theme.
  let gameColors = {
    sky: '#10321f',
    skyAlt: '#0c2718',
    ground: '#0a1d12',
    pipe: '#e8b978',
    pipeDark: '#b5762a',
    bird: '#ffffff'
  };

  function syncGameColors() {
    const styles = getComputedStyle(document.documentElement);
    gameColors.sky = styles.getPropertyValue('--game-sky').trim() || gameColors.sky;
    gameColors.skyAlt = styles.getPropertyValue('--game-sky-alt').trim() || gameColors.skyAlt;
    gameColors.ground = styles.getPropertyValue('--game-ground').trim() || gameColors.ground;
    gameColors.pipe = styles.getPropertyValue('--game-pipe').trim() || gameColors.pipe;
    gameColors.pipeDark = styles.getPropertyValue('--game-pipe-dark').trim() || gameColors.pipeDark;
    gameColors.bird = styles.getPropertyValue('--game-bird').trim() || gameColors.bird;
    if (!gameRunning) drawStartScreen();
  }

  const GROUND_HEIGHT = 14;
  let bird = { x: 50, y: 150, width: 24, height: 18, gravity: 0.35, lift: -6, velocity: 0 };
  let obstacles = [];
  let frameCount = 0;
  const obstacleSpacing = 110;

  function initGame() {
    bird.y = 150;
    bird.velocity = 0;
    obstacles = [];
    score = 0;
    frameCount = 0;
    scoreDisplay.textContent = `Score: ${score}`;
  }

  function createObstacle() {
    const gap = 100;
    const minHeight = 30;
    const maxHeight = canvas.height - GROUND_HEIGHT - gap - 30;
    const height = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
    obstacles.push({ x: canvas.width, topHeight: height, bottomY: height + gap, width: 38, passed: false });
  }

  function updateGame() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.height > canvas.height - GROUND_HEIGHT) {
      bird.y = canvas.height - GROUND_HEIGHT - bird.height;
      endGame();
    }
    if (bird.y < 0) {
      bird.y = 0;
      bird.velocity = 0;
    }

    if (frameCount % obstacleSpacing === 0) {
      createObstacle();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= 2.2;

      if (
        bird.x < obs.x + obs.width &&
        bird.x + bird.width > obs.x &&
        (bird.y < obs.topHeight || bird.y + bird.height > obs.bottomY)
      ) {
        endGame();
      }

      if (!obs.passed && obs.x + obs.width < bird.x) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        obs.passed = true;
      }

      if (obs.x + obs.width < 0) {
        obstacles.splice(i, 1);
      }
    }

    frameCount++;
  }

  function drawSky() {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, gameColors.sky);
    skyGradient.addColorStop(1, gameColors.skyAlt);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawGround() {
    ctx.fillStyle = gameColors.ground;
    ctx.fillRect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT);
    ctx.fillStyle = gameColors.pipe;
    for (let x = -(frameCount % 20); x < canvas.width; x += 20) {
      ctx.fillRect(x, canvas.height - GROUND_HEIGHT, 10, 3);
    }
  }

  // Pipes are drawn with a bright fill, a darker cap, and a solid outline
  // so the gap the bird needs to fly through always reads clearly against
  // the sky, no matter what the site's light/dark theme is doing.
  function drawPipe(obs) {
    const capHeight = 14;

    ctx.fillStyle = gameColors.pipe;
    ctx.strokeStyle = gameColors.pipeDark;
    ctx.lineWidth = 3;

    // Top pipe
    ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
    ctx.strokeRect(obs.x + 1.5, 0, obs.width - 3, obs.topHeight);
    ctx.fillStyle = gameColors.pipeDark;
    ctx.fillRect(obs.x - 3, obs.topHeight - capHeight, obs.width + 6, capHeight);

    // Bottom pipe
    const bottomHeight = (canvas.height - GROUND_HEIGHT) - obs.bottomY;
    ctx.fillStyle = gameColors.pipe;
    ctx.fillRect(obs.x, obs.bottomY, obs.width, bottomHeight);
    ctx.strokeRect(obs.x + 1.5, obs.bottomY, obs.width - 3, bottomHeight);
    ctx.fillStyle = gameColors.pipeDark;
    ctx.fillRect(obs.x - 3, obs.bottomY, obs.width + 6, capHeight);
  }

  function drawBird() {
    const cx = bird.x + bird.width / 2;
    const cy = bird.y + bird.height / 2;
    const angle = Math.max(-0.4, Math.min(0.9, bird.velocity * 0.08));

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    // Body with a dark outline so it stands out against the sky and pipes
    ctx.fillStyle = gameColors.bird;
    ctx.strokeStyle = gameColors.pipeDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eye + beak for a clear front-facing orientation
    ctx.fillStyle = gameColors.pipeDark;
    ctx.beginPath();
    ctx.arc(bird.width / 4, -2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = gameColors.pipe;
    ctx.beginPath();
    ctx.moveTo(bird.width / 2 - 2, 0);
    ctx.lineTo(bird.width / 2 + 7, 2);
    ctx.lineTo(bird.width / 2 - 2, 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawGame() {
    drawSky();
    obstacles.forEach(drawPipe);
    drawGround();
    drawBird();
  }

  function drawStartScreen() {
    drawSky();
    drawGround();
    drawBird();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '700 20px "Sora", sans-serif';
    ctx.fillText('Mini Arcade', canvas.width / 2, canvas.height / 2 - 12);
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Press Play, then click / tap / Space to fly', canvas.width / 2, canvas.height / 2 + 14);
  }

  function loop() {
    if (!gameRunning) return;
    updateGame();
    drawGame();
    animationFrameId = requestAnimationFrame(loop);
  }

  function jump() {
    if (gameRunning) bird.velocity = bird.lift;
  }

  function startGame() {
    initGame();
    gameRunning = true;
    gameStarted = true;
    gameBtn.textContent = 'Restart';
    loop();
  }

  function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
      highScoreDisplay.textContent = `High Score: ${highScore}`;
    }
    drawGame();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.68)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.font = '700 20px "Sora", sans-serif';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
    gameBtn.textContent = 'Play Again';
  }

  drawStartScreen();

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') return;
    if (gameRunning) {
      e.preventDefault();
      jump();
    } else if (document.activeElement === canvas) {
      e.preventDefault();
      startGame();
    }
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    gameRunning ? jump() : startGame();
  });

  canvas.addEventListener('mousedown', () => {
    gameRunning ? jump() : startGame();
  });

  gameBtn.addEventListener('click', () => startGame());
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio, { once: true });
} else {
  initPortfolio();
}