/**
 * Portfolio Website - Main JavaScript
 * Handles dynamic content rendering, navigation, filtering, and interactions
 */

// ==================== DATA LOADING ====================
const DataLoader = {
  async loadJSON(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Failed to load ${path}`);
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${path}:`, error);
      return null;
    }
  },

  async loadAllData() {
    const [projects, education, skills] = await Promise.all([
      this.loadJSON('data/projects.json'),
      this.loadJSON('data/education.json'),
      this.loadJSON('data/skills.json')
    ]);
    return { projects, education, skills };
  }
};

// ==================== PROJECT RENDERER ====================
const ProjectRenderer = {
  projectsData: [],
  currentFilter: 'all',
  searchQuery: '',

  init(projects) {
    this.projectsData = projects || [];
    this.renderFilterTags();
    this.renderProjects();
    this.setupEventListeners();
  },

  renderFilterTags() {
    const tagsContainer = document.getElementById('filter-tags');
    if (!tagsContainer || !this.projectsData.length) return;

    // Get unique tags
    const allTags = new Set();
    this.projectsData.forEach(project => {
      if (project.tags) {
        project.tags.forEach(tag => allTags.add(tag));
      }
    });

    // Create tag buttons
    const tagsHTML = Array.from(allTags).map(tag =>
      `<button class="filter__tag" data-filter="${tag}">${tag}</button>`
    ).join('');

    tagsContainer.innerHTML = `
      <button class="filter__tag active" data-filter="all">All</button>
      ${tagsHTML}
    `;
  },

  renderProjects() {
    const filteredProjects = this.getFilteredProjects();
    const featuredProjects = filteredProjects.filter(p => p.featured);
    const allProjects = filteredProjects;

    this.renderProjectGrid('featured-grid', featuredProjects);
    this.renderProjectGrid('projects-grid', allProjects);

    // Show/hide featured section
    const featuredSection = document.getElementById('featured-projects');
    if (featuredSection) {
      featuredSection.style.display = featuredProjects.length && this.currentFilter === 'all' && !this.searchQuery
        ? 'block'
        : 'none';
    }

    // Show/hide empty state
    const emptyState = document.getElementById('projects-empty');
    if (emptyState) {
      emptyState.style.display = allProjects.length === 0 ? 'block' : 'none';
    }
  },

  renderProjectGrid(containerId, projects) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = projects.map(project => this.createProjectCard(project)).join('');
  },

  createProjectCard(project) {
    const tagsHTML = project.tags
      ? project.tags.map(tag => `<span class="project-card__tag">${tag}</span>`).join('')
      : '';

    const demoButton = project.liveDemoAvailable
      ? `<a href="${project.liveDemoUrl}" target="_blank" rel="noopener noreferrer" class="project-card__btn project-card__btn--demo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Live Demo
        </a>`
      : `<button class="project-card__btn project-card__btn--disabled" disabled>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
          Demo Unavailable
        </button>`;

    return `
      <article class="project-card">
        <div class="project-card__image">
          <img
            src="${project.image}"
            alt="${project.title}"
            class="project-card__img"
            onerror="this.parentElement.innerHTML='<div class=\\'placeholder-img\\'><svg width=\\'48\\' height=\\'48\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\' ry=\\'2\\'></rect><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'></circle><polyline points=\\'21 15 16 10 5 21\\'></polyline></svg></div>'"
          >
        </div>
        <div class="project-card__content">
          <div class="project-card__tags">${tagsHTML}</div>
          <h3 class="project-card__title">${project.title}</h3>
          <p class="project-card__description">${project.description}</p>
          <div class="project-card__buttons">
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-card__btn project-card__btn--github">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            ${demoButton}
          </div>
        </div>
      </article>
    `;
  },

  getFilteredProjects() {
    return this.projectsData.filter(project => {
      // Filter by tag
      const matchesFilter = this.currentFilter === 'all' ||
        (project.tags && project.tags.includes(this.currentFilter));

      // Filter by search query
      const matchesSearch = !this.searchQuery ||
        project.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (project.tags && project.tags.some(tag =>
          tag.toLowerCase().includes(this.searchQuery.toLowerCase())
        ));

      return matchesFilter && matchesSearch;
    });
  },

  setupEventListeners() {
    // Filter tags click
    const tagsContainer = document.getElementById('filter-tags');
    if (tagsContainer) {
      tagsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter__tag')) {
          // Update active state
          tagsContainer.querySelectorAll('.filter__tag').forEach(tag =>
            tag.classList.remove('active')
          );
          e.target.classList.add('active');

          // Update filter and re-render
          this.currentFilter = e.target.dataset.filter;
          this.renderProjects();
        }
      });
    }

    // Search input
    const searchInput = document.getElementById('project-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderProjects();
      });
    }
  }
};

// ==================== EDUCATION RENDERER ====================
const EducationRenderer = {
  init(education) {
    const container = document.getElementById('education-timeline');
    if (!container || !education) return;

    container.innerHTML = education.map(item => this.createEducationItem(item)).join('');
  },

  createEducationItem(item) {
    const notesHTML = item.notes && item.notes.length
      ? `<div class="education__notes">
          <ul>
            ${item.notes.map(note => `<li>${note}</li>`).join('')}
          </ul>
        </div>`
      : '';

    return `
      <div class="education__item">
        <div class="education__card">
          <div class="education__header">
            <h3 class="education__institution">${item.institution}</h3>
            <p class="education__program">${item.program}</p>
            <div class="education__meta">
              <span class="education__meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                ${item.startDate} - ${item.endDate}
              </span>
              ${item.location ? `
                <span class="education__meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  ${item.location}
                </span>
              ` : ''}
            </div>
          </div>
          ${notesHTML}
        </div>
      </div>
    `;
  }
};

// ==================== SKILLS RENDERER ====================
const SkillsRenderer = {
  init(skills) {
    const container = document.getElementById('skills-container');
    if (!container || !skills) return;

    container.innerHTML = skills.map(category => this.createSkillCategory(category)).join('');
  },

  createSkillCategory(category) {
    const itemsHTML = category.items.map(item => {
      const levelClass = `skill__level--${item.level.toLowerCase()}`;
      return `
        <div class="skill__item">
          <i class="${item.icon}"></i>
          <span class="skill__name">${item.name}</span>
          <span class="skill__level ${levelClass}">${item.level}</span>
        </div>
      `;
    }).join('');

    return `
      <div class="skills__category">
        <h3 class="skills__category-title">${category.category}</h3>
        <div class="skills__list">
          ${itemsHTML}
        </div>
      </div>
    `;
  }
};

// ==================== NAVIGATION ====================
const Navigation = {
  init() {
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupActiveHighlight();
    this.setupStickyHeader();
  },

  setupMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
      });
    }

    if (navClose && navMenu) {
      navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
      });
    }

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu) navMenu.classList.remove('show-menu');
      });
    });
  },

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  },

  setupActiveHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    const highlightActiveSection = () => {
      const scrollY = window.scrollY;

      sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', highlightActiveSection);
    highlightActiveSection();
  },

  setupStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;

      if (currentScroll > 100) {
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
      } else {
        header.style.boxShadow = 'none';
      }

      lastScroll = currentScroll;
    });
  }
};

// ==================== BACK TO TOP ====================
const BackToTop = {
  init() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    });

    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};

// ==================== CONTACT INTERACTIONS ====================
const ContactInteractions = {
  init() {
    this.setupDiscordCopy();
  },

  setupDiscordCopy() {
    const copyBtn = document.getElementById('copy-discord');
    const usernameEl = document.getElementById('discord-username');

    if (copyBtn && usernameEl) {
      copyBtn.addEventListener('click', async () => {
        const username = usernameEl.textContent;

        try {
          await navigator.clipboard.writeText(username);
          this.showToast('Discord username copied!');
        } catch (err) {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = username;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          this.showToast('Discord username copied!');
        }
      });
    }
  },

  showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    if (toast && toastMessage) {
      toastMessage.textContent = message;
      toast.classList.add('show');

      setTimeout(() => {
        toast.classList.remove('show');
      }, 2500);
    }
  }
};

// ==================== HERO IMAGE FALLBACK ====================
const HeroImage = {
  init() {
    const heroImg = document.getElementById('hero-img');
    if (heroImg) {
      heroImg.addEventListener('error', () => {
        heroImg.parentElement.innerHTML = `
          <div class="placeholder-img" style="width: 100%; height: 100%; border-radius: 50%;">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        `;
      });
    }
  }
};

// ==================== FOOTER YEAR ====================
const Footer = {
  init() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize navigation and UI first
  Navigation.init();
  BackToTop.init();
  ContactInteractions.init();
  HeroImage.init();
  Footer.init();

  // Load and render data
  const data = await DataLoader.loadAllData();

  if (data.projects) {
    ProjectRenderer.init(data.projects);
  }

  if (data.education) {
    EducationRenderer.init(data.education);
  }

  if (data.skills) {
    SkillsRenderer.init(data.skills);
  }
});
