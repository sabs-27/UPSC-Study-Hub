const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Data
const subjects = require('./data/subjects.json');
const previousYears = require('./data/previous-years.json');

app.use(express.static('public'));
app.use(express.json());

// View counters (in-memory, simulates KV)
const counters = {};

// API: Get all subjects
app.get('/api/subjects', (req, res) => {
  res.json(subjects);
});

// API: Get topics for a subject
app.get('/api/subjects/:slug/topics', (req, res) => {
  const subject = subjects.find(s => s.slug === req.params.slug);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  res.json(subject.topics);
});

// API: Get previous year papers
app.get('/api/previous-years', (req, res) => {
  res.json(previousYears);
});

// API: Get papers for a specific year
app.get('/api/previous-years/:year', (req, res) => {
  const year = previousYears.find(y => y.year === parseInt(req.params.year));
  if (!year) return res.status(404).json({ error: 'Year not found' });
  res.json(year);
});

// API: Search
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  if (!q) return res.json([]);

  const results = [];
  subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      if (topic.title.toLowerCase().includes(q) || topic.tags.some(t => t.toLowerCase().includes(q))) {
        results.push({ ...topic, subjectName: subject.name, subjectSlug: subject.slug });
      }
    });
  });
  previousYears.forEach(year => {
    year.papers.forEach(paper => {
      if (paper.title.toLowerCase().includes(q)) {
        results.push({ ...paper, type: 'previous-year', year: year.year });
      }
    });
  });
  res.json(results.slice(0, 20));
});

// API: Track views
app.post('/api/views/:id', (req, res) => {
  const id = req.params.id;
  counters[id] = (counters[id] || 0) + 1;
  res.json({ views: counters[id] });
});

app.get('/api/views/:id', (req, res) => {
  res.json({ views: counters[req.params.id] || 0 });
});

app.listen(PORT, () => {
  console.log(`UPSC Portal running at http://localhost:${PORT}`);
});
