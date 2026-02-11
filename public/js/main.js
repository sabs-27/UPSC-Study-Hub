// ===== UPSC Prep Portal - Main JS =====
(function () {
  'use strict';

  // State
  let subjects = [];
  let previousYears = [];
  let currentSection = 'home';
  let viewerBackTarget = 'subjects';

  // DOM refs
  const sections = {
    home: document.getElementById('section-home'),
    subjects: document.getElementById('section-subjects'),
    'subject-detail': document.getElementById('section-subject-detail'),
    'previous-years': document.getElementById('section-previous-years'),
    'year-detail': document.getElementById('section-year-detail'),
    viewer: document.getElementById('section-viewer'),
  };

  // Init
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    await loadData();
    renderHomeSubjects();
    renderSubjects();
    renderPreviousYears();
    setupNavigation();
    setupSearch();
    lucide.createIcons();
  }

  // ===== Data Loading =====
  async function loadData() {
    const [subjectsRes, yearsRes] = await Promise.all([
      fetch('/api/subjects'),
      fetch('/api/previous-years'),
    ]);
    subjects = await subjectsRes.json();
    previousYears = await yearsRes.json();
  }

  // ===== Navigation =====
  function setupNavigation() {
    // Nav links
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.section);
      });
    });

    // Dropdown items
    document.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.section);
      });
    });

    // Mobile nav
    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(link.dataset.section);
        closeMobileNav();
      });
    });

    // Hamburger
    const hamburger = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (hamburger && overlay) {
      hamburger.addEventListener('click', () => {
        overlay.classList.toggle('active');
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeMobileNav();
      });
    }

    // Logo goes home
    document.getElementById('logo-home').addEventListener('click', () => navigateTo('home'));

    // Hero buttons
    document.querySelectorAll('[data-goto]').forEach((btn) => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.goto));
    });

    // Back buttons
    document.getElementById('btn-back-subjects').addEventListener('click', () => navigateTo('subjects'));
    document.getElementById('btn-back-years').addEventListener('click', () => navigateTo('previous-years'));
    document.getElementById('btn-back-viewer').addEventListener('click', () => navigateTo(viewerBackTarget));
  }

  function navigateTo(section) {
    // Hide all
    Object.values(sections).forEach((s) => s.classList.remove('active'));

    // Show target
    if (sections[section]) {
      sections[section].classList.add('active');
      currentSection = section;
    }

    // Update nav active
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.section === section || 
        (section === 'subject-detail' && link.dataset.section === 'subjects') ||
        (section === 'year-detail' && link.dataset.section === 'previous-years') ||
        (section === 'viewer' && (link.dataset.section === 'subjects' || link.dataset.section === 'previous-years'))
      );
    });

    // Update mobile nav active
    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.classList.toggle('active', link.dataset.section === section ||
        (section === 'subject-detail' && link.dataset.section === 'subjects') ||
        (section === 'year-detail' && link.dataset.section === 'previous-years')
      );
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Re-init icons
    lucide.createIcons();
  }

  // ===== Render Home Subjects =====
  function renderHomeSubjects() {
    const grid = document.getElementById('home-subjects-grid');
    grid.innerHTML = subjects.map((s) => subjectCardHTML(s)).join('');
    attachSubjectCardListeners(grid);
  }

  // ===== Render Subjects =====
  function renderSubjects() {
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = subjects.map((s) => subjectCardHTML(s)).join('');
    attachSubjectCardListeners(grid);
  }

  function subjectCardHTML(subject) {
    return `
      <div class="subject-card" data-slug="${subject.slug}" style="--card-accent: ${subject.color}; --icon-bg: ${subject.color}20;">
        <div class="subject-card-icon">
          <i data-lucide="${subject.icon}"></i>
        </div>
        <h3>${subject.name}</h3>
        <p>${subject.description}</p>
        <div class="topic-count">
          <i data-lucide="layers"></i>
          ${subject.topics.length} topics available
        </div>
      </div>
    `;
  }

  function attachSubjectCardListeners(container) {
    container.querySelectorAll('.subject-card').forEach((card) => {
      card.addEventListener('click', () => openSubjectDetail(card.dataset.slug));
    });
  }

  // ===== Subject Detail =====
  function openSubjectDetail(slug) {
    const subject = subjects.find((s) => s.slug === slug);
    if (!subject) return;

    // Header
    document.getElementById('subject-detail-header').innerHTML = `
      <h2 class="section-title" style="color: ${subject.color}">
        <i data-lucide="${subject.icon}"></i> ${subject.name}
      </h2>
      <p class="section-desc">${subject.description}</p>
    `;

    // Topics
    const grid = document.getElementById('topics-grid');
    grid.innerHTML = subject.topics
      .map(
        (topic, i) => `
      <div class="topic-card" data-file="${topic.file}" data-title="${topic.title}" data-id="${topic.id}">
        <div class="topic-card-number">${i + 1}</div>
        <div class="topic-card-content">
          <h4>${topic.title}</h4>
          <div class="topic-card-meta">
            <span class="topic-difficulty difficulty-${(topic.difficulty || 'medium').toLowerCase()}">${topic.difficulty || 'Medium'}</span>
            ${(topic.tags || []).slice(0, 3).map((t) => `<span class="topic-tag">${t}</span>`).join('')}
          </div>
        </div>
        <div class="topic-card-arrow"><i data-lucide="chevron-right"></i></div>
      </div>
    `
      )
      .join('');

    // Listeners
    grid.querySelectorAll('.topic-card').forEach((card) => {
      card.addEventListener('click', () => {
        viewerBackTarget = 'subject-detail';
        openViewer(card.dataset.file, card.dataset.title, card.dataset.id);
      });
    });

    navigateTo('subject-detail');
  }

  // ===== Render Previous Years =====
  function renderPreviousYears() {
    const grid = document.getElementById('previous-years-grid');
    grid.innerHTML = previousYears
      .map(
        (y) => `
      <div class="year-card" data-year="${y.year}">
        <div class="year-number">${y.year}</div>
        <div class="year-papers-count">${y.papers.length} papers available</div>
      </div>
    `
      )
      .join('');

    grid.querySelectorAll('.year-card').forEach((card) => {
      card.addEventListener('click', () => openYearDetail(parseInt(card.dataset.year)));
    });
  }

  // ===== Year Detail =====
  function openYearDetail(year) {
    const yearData = previousYears.find((y) => y.year === year);
    if (!yearData) return;

    document.getElementById('year-detail-header').innerHTML = `
      <h2 class="section-title"><i data-lucide="calendar-clock"></i> UPSC ${year} Papers</h2>
      <p class="section-desc">Previous year question papers for ${year}</p>
    `;

    const grid = document.getElementById('papers-grid');
    grid.innerHTML = yearData.papers
      .map(
        (paper, i) => `
      <div class="topic-card" data-file="${paper.file}" data-title="${paper.title}" data-id="${paper.id}">
        <div class="topic-card-number">${i + 1}</div>
        <div class="topic-card-content">
          <h4>${paper.title}</h4>
          <div class="topic-card-meta">
            <span class="topic-tag">${paper.category}</span>
            <span class="topic-tag">${year}</span>
          </div>
        </div>
        <div class="topic-card-arrow"><i data-lucide="chevron-right"></i></div>
      </div>
    `
      )
      .join('');

    grid.querySelectorAll('.topic-card').forEach((card) => {
      card.addEventListener('click', () => {
        viewerBackTarget = 'year-detail';
        openViewer(card.dataset.file, card.dataset.title, card.dataset.id);
      });
    });

    navigateTo('year-detail');
  }

  // ===== Viewer =====
  function openViewer(file, title, id) {
    document.getElementById('viewer-title').textContent = title;
    document.getElementById('simulation-iframe').src = file;
    navigateTo('viewer');

    // Track view
    if (id) {
      fetch(`/api/views/${id}`, { method: 'POST' });
    }
  }

  // ===== Search =====
  function setupSearch() {
    const input = document.getElementById('search-input');
    const resultsDiv = document.getElementById('search-results');
    let debounceTimer;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 2) {
        resultsDiv.classList.remove('active');
        return;
      }
      debounceTimer = setTimeout(async () => {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const results = await res.json();
        if (results.length === 0) {
          resultsDiv.innerHTML = '<div class="search-result-item"><span class="result-title">No results found</span></div>';
        } else {
          resultsDiv.innerHTML = results
            .map(
              (r) => `
            <div class="search-result-item" data-file="${r.file}" data-title="${r.title}" data-id="${r.id}">
              <div class="result-title">${r.title}</div>
              <div class="result-meta">${r.subjectName || (r.type === 'previous-year' ? `Previous Year - ${r.year}` : '')}</div>
            </div>
          `
            )
            .join('');
        }
        resultsDiv.classList.add('active');

        resultsDiv.querySelectorAll('.search-result-item[data-file]').forEach((item) => {
          item.addEventListener('click', () => {
            viewerBackTarget = currentSection === 'home' ? 'home' : currentSection;
            openViewer(item.dataset.file, item.dataset.title, item.dataset.id);
            resultsDiv.classList.remove('active');
            input.value = '';
          });
        });
      }, 300);
    });

    // Close search on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-bar')) {
        resultsDiv.classList.remove('active');
      }
    });
  }

  function closeMobileNav() {
    const overlay = document.getElementById('mobile-nav-overlay');
    if (overlay) overlay.classList.remove('active');
  }
})();
