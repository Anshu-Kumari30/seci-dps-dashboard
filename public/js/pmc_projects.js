// pmc_projects.js - For PMC DPR/PFR and BMS projects
(function () {
  function qs(key) {
    const u = new URL(window.location.href);
    return u.searchParams.get(key) || '';
  }

  // Accept multiple query parameter names for robustness
  const pmc_entry_id = qs('pmc_entry_id') || qs('id') || qs('entry_id') || qs('pmcEntryId');
  const segment = qs('segment') || '';
  const openTab = qs('open_tab') || '';
  const token = localStorage.getItem('token');

  function authHeaders() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN');
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-IN');
  }

  function formatCurrency(val) {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Fetch PMC entry with milestones
  async function fetchPmcEntry() {
    if (!pmc_entry_id) {
      console.error('No pmc_entry_id provided');
      return null;
    }
    
    try {
      const res = await fetch(`/api/data/pmc/entry/one/${pmc_entry_id}`, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch PMC entry');
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('fetchPmcEntry error:', err);
      return null;
    }
  }

  // Update page titles
  function updateTitles(project) {
    if (!project) return;
    document.getElementById('projectTitle').textContent = project.project_details || 'Project';
    document.getElementById('clientTitle').textContent = `${project.service_type || ''} - ${project.client || ''}`;
  }

  // Render milestones table
  function renderMilestones(milestones) {
    const tbody = document.querySelector('#milestonesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!milestones || !milestones.length) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No milestones found</td></tr>';
      return;
    }

    milestones.forEach((m, i) => {
      const invoiceAmount = parseFloat(m.invoice_amount) || 0;
      const invoiceRaised = parseFloat(m.invoice_raised) || 0;
      const percentage = invoiceAmount > 0 ? ((invoiceRaised / invoiceAmount) * 100).toFixed(1) : 0;
      
      // Determine bar color based on percentage
      let barColor = '#dc3545'; // red
      if (percentage >= 100) barColor = '#198754'; // green
      else if (percentage >= 50) barColor = '#ffc107'; // yellow
      else if (percentage > 0) barColor = '#fd7e14'; // orange

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${m.sr_no || i + 1}</td>
        <td>${m.milestone || ''}</td>
        <td>${parseFloat(m.stage_payment || 0).toFixed(2)}</td>
        <td>${formatCurrency(m.invoice_amount)}</td>
        <td>${formatCurrency(m.invoice_raised)}</td>
        <td data-sort-value="${m.invoice_date || ''}">${m.invoice_date ? formatDate(m.invoice_date) : ''}</td>
        <td>${m.invoice_number || ''}</td>
        <td>${m.status || 'Pending'}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 5px;">
            <div style="width: 60px; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden;">
              <div style="width: ${Math.min(percentage, 100)}%; height: 100%; background: ${barColor};"></div>
            </div>
            <span style="font-size: 0.75rem; color: ${barColor};">${percentage}%</span>
          </div>
        </td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editMilestone('${pmc_entry_id}')">Edit</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  function activateMilestonesIfAny(milestones) {
    try {
      if (Array.isArray(milestones) && milestones.length) {
        const tabBtn = document.getElementById('milestone-tab');
        if (tabBtn && window.bootstrap && typeof window.bootstrap.Tab === 'function') {
          const t = new window.bootstrap.Tab(tabBtn);
          t.show();
        } else if (tabBtn) {
          // fallback: add active classes
          tabBtn.classList.add('active');
          const pane = document.getElementById('milestones');
          if (pane) pane.classList.add('show', 'active');
        }
      }
    } catch (e) {
      console.debug('activateMilestonesIfAny failed', e);
    }
  }

  // Fetch and render contract documents using grouped endpoint when dept/stat/entity available
  async function fetchContractDocuments(project) {
    const tbody = document.querySelector('#contractDocsTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Loading...</td></tr>';
    try {
      let url;
      if (project && project.dept_id && project.statistic_id && project.entity_id) {
        url = `/api/data/documents/grouped/${project.dept_id}/${project.statistic_id}/${project.entity_id}`;
      } else {
        url = `/api/data/documents?entity_id=${encodeURIComponent(pmc_entry_id)}`;
      }

      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const json = await res.json();
      const docs = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      if (!docs.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No documents found</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      docs.forEach((d, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td>${d.doc_name || ''}</td>
          <td>${d.doc_date ? new Date(d.doc_date).toLocaleDateString('en-IN') : ''}</td>
          <td>${d.doc_path ? `<a href="${d.doc_path}" target="_blank">View</a>` : ''}</td>
          <td>${d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-IN') : ''}</td>
          <td></td>
        `;
        
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('fetchContractDocuments error', err);
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Failed to load documents</td></tr>';
    }
  }

  // Fetch and render correspondences (tries generic correspondences endpoint with entity_id)
  async function fetchCorrespondences(project) {
    const tbody = document.querySelector('#corrOtherTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Loading...</td></tr>';
    try {
      let url;
      if (project && project.dept_id && project.statistic_id && project.entity_id) {
        url = `/api/data/correspondences/${project.dept_id}/${project.statistic_id}/${project.entity_id}`;
      } else {
        url = `/api/data/correspondences?entity_id=${encodeURIComponent(pmc_entry_id)}`;
      }

      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed to fetch correspondences');
      const json = await res.json();
      const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
      if (!items.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No correspondences found</td></tr>';
        return;
      }
      tbody.innerHTML = '';
      items.forEach((c, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i + 1}</td>
          <td>${c.subject || ''}</td>
          <td>${c.correspondence_date ? new Date(c.correspondence_date).toLocaleDateString('en-IN') : ''}</td>
          <td>${c.sender || ''}</td>
          <td>${c.recipient || ''}</td>
          <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : ''}</td>
          <td>${c.doc_path ? `<a href="${c.doc_path}" target="_blank">View</a>` : ''}</td>
          <td></td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('fetchCorrespondences error', err);
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Failed to load correspondences</td></tr>';
    }
  }

  // Edit milestone - opens add_pmc_entry.html in edit mode
  window.editMilestone = function(entryId) {
    window.location.href = `/add_pmc_entry.html?edit=${entryId}`;
  };

  // Wire button click handlers
  function wire() {
    // Add milestone button - opens add_pmc_entry.html
    const addMilestoneBtn = document.getElementById('addMilestoneBtn');
    if (addMilestoneBtn) {
      addMilestoneBtn.addEventListener('click', () => {
        if (pmc_entry_id) {
          // Open project entry form (edit mode) so user can add/edit milestones
          const url = new URL('/add_pmc_entry.html', window.location.origin);
          url.searchParams.set('edit', pmc_entry_id);
          url.searchParams.set('context', 'pmc');
          window.open(url.toString(), '_blank');
        } else {
          window.open('/add_pmc_entry.html', '_blank');
        }
      });
    }

    // Helper to open add forms with PMC C&E context and include dept/stat/entity when available
    function openAddPage(page) {
      const url = new URL(page, window.location.origin);
      const proj = window.__pmc_project || null;
      // If project has dept/stat/entity, include them so add pages can store under PMC C&E tables
      if (proj && proj.dept_id) url.searchParams.set('dept_id', proj.dept_id);
      if (proj && proj.statistic_id) url.searchParams.set('statistic_id', proj.statistic_id);
      if (proj && proj.entity_id) url.searchParams.set('entity_id', proj.entity_id);
      // For PMC C&E, also include a pmc_ce_entity_id if provided by the project
      if (proj && proj.pmc_ce_entity_id) url.searchParams.set('pmc_ce_entity_id', proj.pmc_ce_entity_id);
      // mark context so add pages will use PMC C&E endpoints
      url.searchParams.set('context', 'pmc_ce');
      window.open(url.toString(), '_blank');
    }

    // Add contract document button - open existing add page with pmc context
    const addContractDocBtn = document.getElementById('addContractDocBtn');
    if (addContractDocBtn) {
      addContractDocBtn.addEventListener('click', () => openAddPage('/add_contract_document.html'));
    }

    // Add correspondence button - open existing add correspondence page with pmc context
    const addCorrOtherBtn = document.getElementById('addCorrOtherBtn');
    if (addCorrOtherBtn) {
      addCorrOtherBtn.addEventListener('click', () => openAddPage('/add_correspondence_other.html'));
    }
  }

  // Disable tabs that should not be clickable when coming from a performance segment (DPR/PFR/BMS)
  function enforceTabAccessBySegment() {
    try {
      if (!segment) return;
      // Only allow these tab ids to be clickable for PMC entries
      const allowed = new Set(['contract-docs', 'milestones', 'corr-other']);
      const tabButtons = document.querySelectorAll('#projectTabs .nav-item .nav-link');
      tabButtons.forEach(btn => {
        const target = btn.getAttribute('data-bs-target') || btn.getAttribute('data-target') || '';
        // target like '#milestones' -> extract without #
        const id = (target || '').replace('#', '');
        if (!allowed.has(id)) {
          btn.classList.add('disabled');
          btn.removeAttribute('data-bs-toggle');
          btn.removeAttribute('data-bs-target');
          // make non-clickable
          btn.style.pointerEvents = 'none';
          btn.title = 'Not available for this segment';
        }
      });
    } catch (e) {
      console.debug('enforceTabAccessBySegment failed', e);
    }
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', async () => {
    if (!pmc_entry_id) {
      alert('No PMC entry ID provided');
      window.location.href = '/pmc_performance.html';
      return;
    }

    wire();
    enforceTabAccessBySegment();
    
    const project = await fetchPmcEntry();
    if (project) {
      // expose project to openAddPage helper
      window.__pmc_project = project;
      updateTitles(project);
      const ms = project.milestones || [];
      // Only render/show Milestones when caller explicitly requested it via open_tab=milestones
      if (String(openTab || '').toLowerCase() === 'milestones') {
        renderMilestones(ms);
      } else {
        // hide milestone pane so the UI resembles other tab views (contract docs / correspondences)
        try {
          const pane = document.getElementById('milestones');
          if (pane) pane.style.display = 'none';
        } catch (e) { /* ignore */ }
      }
      // Do not auto-activate Milestones tab based on data presence. Activation will be controlled
      // by the caller via open_tab parameter or user interaction to avoid surprising tab switches.
    }
    
    // Fetch documents/correspondences using available project dept/stat/entity when possible
    fetchContractDocuments(project);
    fetchCorrespondences(project);
    // If caller requested a specific tab to open, handle it (e.g., open_tab=milestones)
    try {
      const openTab = qs('open_tab') || '';
      if (openTab && openTab.toLowerCase() === 'milestones') {
        const tabBtn = document.getElementById('milestone-tab');
        if (tabBtn && window.bootstrap && typeof window.bootstrap.Tab === 'function') {
          new window.bootstrap.Tab(tabBtn).show();
        } else if (tabBtn) {
          tabBtn.classList.add('active');
          const pane = document.getElementById('milestones');
          if (pane) pane.classList.add('show', 'active');
        }
      }
    } catch (e) { console.debug('open_tab handling failed', e); }
  });
})();
