// pmc_ce_projects.js
(function () {
  function qs(key) {
    const u = new URL(window.location.href);
    return u.searchParams.get(key) || '';
  }

  let dept_id = qs('dept_id');
  let statistic_id = qs('statistic_id');
  const pmc_ce_entity_id = qs('entity_id'); // This is the pmc_ce_entity_id from the URL
  let dept_entity_id = qs('dept_entity_id') || ''; // The DeptEntity entity_id for documents
  const token = localStorage.getItem('token');
  window.USER_PMC_ACCESS_LEVEL = 'none';

  function getJwtPayload() {
    try { const token = localStorage.getItem('token') || ''; const payload = token.split('.')[1] || ''; return JSON.parse(atob(payload)); } catch (e) { return {}; }
  }
  function normalizeDeptName(name) { return String(name || '').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,''); }
  async function resolveDeptAccessLevelByName(targetName) {
    const payload = getJwtPayload();
    if (payload && payload.role === 'admin') return 'head';
    const userId = payload && payload.user_id;
    if (!userId) return 'none';
    try {
      const res = await fetch(`/api/data/departments/user/${encodeURIComponent(userId)}`, { headers: authHeaders() });
      if (!res.ok) return 'none';
      const data = await res.json();
      const list = Array.isArray(data.departments) ? data.departments : [];
      const targetKey = normalizeDeptName(targetName);
      for (const deptInfo of list) {
        const id = (deptInfo && (deptInfo.dept_id || deptInfo)) || null;
        if (!id) continue;
        try {
          const dres = await fetch(`/api/data/departments/${encodeURIComponent(id)}`, { headers: authHeaders() });
          if (!dres.ok) continue;
          const dept = await dres.json();
          if (!dept) continue;
          if (normalizeDeptName(dept.dept_name) !== targetKey) continue;
          const raw = String((deptInfo && deptInfo.access_level) || '').trim().toLowerCase();
          if (raw === 'view' || raw === 'edit' || raw === 'head') return raw;
          return (deptInfo && deptInfo.can_edit === true) ? 'edit' : 'view';
        } catch (e) { continue; }
      }
      return 'none';
    } catch (e) { return 'none'; }
  }

  function authHeaders() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Normalize helper for matching labels
  function normalizeLabel(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function formatCurrency(val) {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN');
  }

  function formatDateTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-IN');
  }

  // Resolve context (dept_id, statistic_id, dept_entity_id) from pmc_ce_entity_id
  async function resolveContext() {
    if (pmc_ce_entity_id && (!dept_id || !statistic_id || !dept_entity_id)) {
      try {
        // Use the PMC C&E specific context resolver
        const res = await fetch(`/api/data/pmc/ce/context/id/${pmc_ce_entity_id}`, { headers: authHeaders() });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (json.dept_id) dept_id = json.dept_id;
            if (json.statistic_id) statistic_id = json.statistic_id;
            if (json.entity_id) dept_entity_id = json.entity_id; // DeptEntity entity_id
            console.log('Resolved PMC C&E context:', { dept_id, statistic_id, dept_entity_id, pmc_ce_entity_id });
          }
        } else {
          console.warn('Failed to resolve PMC C&E context');
        }
      } catch (err) {
        console.error('resolveContext error:', err);
      }
    }
  }

  // Fetch and display statistic and entity names
  async function fetchTitles() {
    try {
      if (dept_id && statistic_id) {
        const statsRes = await fetch(`/api/data/statistics/${dept_id}`, { headers: authHeaders() });
        if (statsRes.ok) {
          const stats = await statsRes.json();
          const stat = stats.find(s => s.statistic_id == statistic_id);
          if (stat) {
            document.getElementById('statisticTitle').textContent = stat.statistic_name || 'Statistic';
          }
        }
      }

      if (dept_id && statistic_id && dept_entity_id) {
        const entitiesRes = await fetch(`/api/data/entities/${dept_id}/${statistic_id}`, { headers: authHeaders() });
        if (entitiesRes.ok) {
          const entities = await entitiesRes.json();
          const entity = entities.find(e => e.entity_id == dept_entity_id);
          if (entity) {
            document.getElementById('entityTitle').textContent = entity.entity_name || 'Entity';
          }
        }
      }
    } catch (err) {
      console.error('fetchTitles error:', err);
    }
  }

  // Open add pages with current context
  function openAddPage(page) {
    const url = new URL(page, window.location.origin);
    if (dept_id) url.searchParams.set('dept_id', dept_id);
    if (statistic_id) url.searchParams.set('statistic_id', statistic_id);
    // For docs/correspondences, use dept_entity_id as entity_id
    if (dept_entity_id) url.searchParams.set('entity_id', dept_entity_id);
    // Also pass pmc_ce_entity_id for redirect
    if (pmc_ce_entity_id) url.searchParams.set('pmc_ce_entity_id', pmc_ce_entity_id);
    url.searchParams.set('context', 'pmc_ce');
    window.open(url.toString(), '_blank');
  }

  async function fetchDocuments() {
    if (!dept_id || !statistic_id || !dept_entity_id) {
      console.log('Skipping fetchDocuments - missing context', { dept_id, statistic_id, dept_entity_id });
      return;
    }
    const url = `/api/data/pmc/ce/documents/${dept_id}/${statistic_id}/${dept_entity_id}`;
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed fetching documents');
      const docs = await res.json();

      // defensive: handle different response shapes
      const docsArray = Array.isArray(docs) ? docs : (docs && docs.data && Array.isArray(docs.data) ? docs.data : []);

      // Filter and render contract docs (cdoc)
      const contractDocs = docsArray.filter(d => d.doc_type === 'cdoc');
      renderDocTable('#contractDocsTable tbody', contractDocs);

      // Filter and render DPR
      const dprDocs = docsArray.filter(d => d.doc_type === 'dpr');
      renderDocTable('#dprTable tbody', dprDocs);

      // Filter and render MPR
      let mprDocs = docsArray.filter(d => d.doc_type === 'mpr');

      // If no MPRs found from the dedicated endpoint, fallback to grouped endpoint (sometimes documents are returned there)
      if (!mprDocs.length) {
        try {
          console.warn('No MPRs from dedicated documents endpoint — trying grouped endpoint fallback');
          const groupedUrl = `/api/data/pmc/ce/grouped/${dept_id}/${statistic_id}/${dept_entity_id}`;
          const gres = await fetch(groupedUrl, { headers: authHeaders() });
          if (gres.ok) {
            const gjson = await gres.json();
            const gdocs = gjson.documents || (Array.isArray(gjson) ? gjson : []);
            if (Array.isArray(gdocs) && gdocs.length) {
              mprDocs = gdocs.filter(d => d.doc_type === 'mpr');
              console.log('Grouped endpoint returned documents count', gdocs.length, 'mpr found', mprDocs.length);
            } else {
              console.log('Grouped endpoint returned no documents');
            }
          } else {
            console.warn('Grouped endpoint fetch failed', gres.status);
          }
        } catch (e) {
          console.error('Grouped endpoint fallback failed', e);
        }
      }

      renderDocTable('#mprTable tbody', mprDocs);

    } catch (err) {
      console.error('fetchDocuments', err);
    }
  }

  function renderDocTable(selector, docs) {
    const tbody = document.querySelector(selector);
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!docs.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No documents found</td></tr>';
      return;
    }
    docs.forEach((d, i) => {
      const tr = document.createElement('tr');
      const allowEditDocs = (window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head');
      const delHtml = allowEditDocs ? `<button class="btn btn-danger btn-sm" data-doc-id="${d.doc_id}" onclick="deleteDocument('${d.doc_id}')">Delete</button>` : '<span class="text-muted">-</span>';
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${d.doc_name || ''}</td>
        <td data-sort-value="${d.doc_date || ''}">${formatDate(d.doc_date)}</td>
        <td>${d.doc_path ? `<a href="${d.doc_path}" target="_blank" class="btn btn-sm btn-outline-primary">View</a>` : '-'}</td>
        <td data-sort-value="${d.createdAt || ''}">${formatDateTime(d.createdAt)}</td>
        <td>${delHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Delete document
  window.deleteDocument = async function(docId) {
    if (!(window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head')) { alert('You do not have permission to delete documents'); return; }
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/data/documents/${docId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        alert('Document deleted successfully');
        fetchDocuments();
      } else {
        alert('Error deleting document');
      }
    } catch (err) {
      console.error('deleteDocument error:', err);
      alert('Error deleting document');
    }
  };

  async function fetchCorrespondences() {
    if (!dept_id || !statistic_id || !dept_entity_id) {
      console.log('Skipping fetchCorrespondences - missing context', { dept_id, statistic_id, dept_entity_id });
      return;
    }
    const url = `/api/data/pmc/ce/correspondences/${dept_id}/${statistic_id}/${dept_entity_id}`;
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed fetching correspondences');
      const items = await res.json();
      
      // Filter and render contractor correspondences
      const contractorCorr = items.filter(c => (c.correspondence_type || '').toLowerCase() === 'contractor');
      renderCorrTable('#corrContractorTable tbody', contractorCorr);
      
      // Filter and render other correspondences
      const otherCorr = items.filter(c => (c.correspondence_type || '').toLowerCase() !== 'contractor');
      renderCorrTable('#corrOtherTable tbody', otherCorr);
      
    } catch (err) {
      console.error('fetchCorrespondences', err);
    }
  }

  function renderCorrTable(selector, items) {
    const tbody = document.querySelector(selector);
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No correspondences found</td></tr>';
      return;
    }
    items.forEach((c, i) => {
      const tr = document.createElement('tr');
      const allowEditCorr = (window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head');
      const delHtml = allowEditCorr ? `<button class="btn btn-danger btn-sm" onclick="deleteCorrespondence('${c.correspondence_id}')">Delete</button>` : '<span class="text-muted">-</span>';
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${c.subject || ''}</td>
        <td data-sort-value="${c.correspondence_date || ''}">${formatDate(c.correspondence_date)}</td>
        <td>${c.sender || c.from || ''}</td>
        <td>${c.recipient || c.to || ''}</td>
        <td data-sort-value="${c.createdAt || ''}">${formatDateTime(c.createdAt)}</td>
        <td>${c.doc_path ? `<a href="${c.doc_path}" target="_blank" class="btn btn-sm btn-outline-primary">View</a>` : '-'}</td>
        <td>${delHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Delete correspondence
  window.deleteCorrespondence = async function(corrId) {
    if (!(window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head')) { alert('You do not have permission to delete correspondences'); return; }
    if (!confirm('Are you sure you want to delete this correspondence?')) return;
    try {
      const res = await fetch(`/api/data/correspondences/${corrId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        alert('Correspondence deleted successfully');
        fetchCorrespondences();
      } else {
        alert('Error deleting correspondence');
      }
    } catch (err) {
      console.error('deleteCorrespondence error:', err);
      alert('Error deleting correspondence');
    }
  };

  // Fetch and render issues
  async function fetchIssues() {
    if (!dept_id || !statistic_id || !dept_entity_id) {
      console.log('Skipping fetchIssues - missing context', { dept_id, statistic_id, dept_entity_id });
      return;
    }
    // Use the grouped PMC C&E endpoint which returns documents, correspondences, issues and milestones
    const url = `/api/data/pmc/ce/grouped/${dept_id}/${statistic_id}/${dept_entity_id}`;
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed fetching grouped PMC C&E details');
      const json = await res.json();
      const issues = json.issues || json || [];
      renderIssuesTable(issues);
    } catch (err) {
      console.error('fetchIssues', err);
    }
  }

  function renderIssuesTable(issues) {
    const tbody = document.querySelector('#issuesTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!issues.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No issues found</td></tr>';
      return;
    }
    issues.forEach((issue, i) => {
      const tr = document.createElement('tr');
      const allowEditIssues = (window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head');
      const delHtml = allowEditIssues ? `<button class="btn btn-danger btn-sm" onclick="deleteIssue('${issue.issue_id}')">Delete</button>` : '<span class="text-muted">-</span>';
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${issue.issue_description || ''}</td>
        <td>${issue.issue_pertaining_to || ''}</td>
        <td data-sort-value="${issue.issue_date || ''}">${formatDate(issue.issue_date)}</td>
        <td>${issue.issue_doc_path ? `<a href="${issue.issue_doc_path}" target="_blank" class="btn btn-sm btn-outline-primary">View</a>` : '-'}</td>
        <td data-sort-value="${issue.createdAt || ''}">${formatDateTime(issue.createdAt)}</td>
        <td>${delHtml}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Delete issue
  window.deleteIssue = async function(issueId) {
    if (!(window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head')) { alert('You do not have permission to delete issues'); return; }
    if (!confirm('Are you sure you want to delete this issue?')) return;
    try {
      const res = await fetch(`/api/data/issues/${issueId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        alert('Issue deleted successfully');
        fetchIssues();
      } else {
        alert('Error deleting issue');
      }
    } catch (err) {
      console.error('deleteIssue error:', err);
      alert('Error deleting issue');
    }
  };

  // Fetch and render milestones — now shows PROJECT-LEVEL data in the Milestone tab
  // (replaces old fetchMilestones that called a non-existent endpoint)
  var ceProjects = [];
  var openMilestoneDropdown = null;

  function getMilestoneBarClass(invoiceAmount, invoiceRaised, invoiceStatus) {
    var raised = parseFloat(invoiceRaised) || 0;
    var st = String(invoiceStatus || '').trim().toLowerCase();
    if (raised <= 0 && (st === 'pending' || st === 'delayed' || st === 'delay')) return 'summary-bar-orange';
    if (raised > 0 && st === 'pending') return 'summary-bar-yellow';
    if (raised > 0 && st === 'received') return 'summary-bar-green';
    return 'summary-bar-orange';
  }

  function getProgressBarMarkup(ia, ir, is) {
    var amt = parseFloat(ia) || 0;
    var raised = parseFloat(ir) || 0;
    var pct = amt > 0 ? Math.min(100, (raised / amt) * 100) : 0;
    var cls = getMilestoneBarClass(ia, ir, is);
    return '<div class="summary-bar" style="justify-content:center;"><div class="summary-bar-track"><div class="summary-bar-fill ' + cls + '" style="width:' + pct + '%;"></div></div><span class="summary-bar-value">' + pct.toFixed(1) + '%</span></div>';
  }

  function renderSummaryBar(project) {
    var milestones = project.milestones || [];
    var total = parseFloat(project.totalAmount) || 0;
    var received = parseFloat(project.amountReceived) || 0;
    var pct = total > 0 ? Math.min(100, (received / total) * 100) : 0;
    if (!milestones.length) return '<div class="summary-bar"><div class="summary-bar-track"><div class="summary-bar-fill summary-bar-orange" style="width:100%;"></div></div><span class="summary-bar-value">0.0%</span></div>';
    var totalMA = milestones.reduce(function (s, m) { return s + (parseFloat(m.invoice_amount) || 0); }, 0);
    var weights = totalMA > 0 ? milestones.map(function (m) { return (parseFloat(m.invoice_amount) || 0) / totalMA; }) : milestones.map(function () { return 1 / milestones.length; });
    var segs = milestones.map(function (m, i) { return '<div class="summary-bar-segment ' + getMilestoneBarClass(m.invoice_amount, m.invoice_raised, m.status) + '" style="width:' + Math.max(0, weights[i] * 100) + '%;"></div>'; }).join('');
    return '<div class="summary-bar"><div class="summary-bar-track" style="display:flex;">' + segs + '</div><span class="summary-bar-value">' + pct.toFixed(1) + '%</span></div>';
  }

  function buildMilestoneDropdownTable(project) {
    var ms = (project && project.milestones) ? project.milestones : [];
    if (!ms.length) return '<div style="text-align:center;padding:12px;color:#999;">No milestones available</div>';
    var rows = ms.map(function (m, i) {
      return '<tr>' +
        '<td>' + (i + 1) + '</td>' +
        '<td><div class="milestone-text">' + (m.milestone || '') + '</div></td>' +
        '<td>' + (m.stage_payment != null ? m.stage_payment : '') + '</td>' +
        '<td>' + formatCurrency(m.invoice_amount) + '</td>' +
        '<td>' + formatCurrency(m.invoice_raised) + '</td>' +
        '<td>' + formatDate(m.invoice_date) + '</td>' +
        '<td>' + (m.invoice_number || '') + '</td>' +
        '<td><div class="invoice-status">' + (m.status || '') + '</div></td>' +
        '<td>' + getProgressBarMarkup(m.invoice_amount, m.invoice_raised, m.status) + '</td>' +
        '</tr>';
    }).join('');
    return '<div style="overflow-x:auto;"><table class="table table-bordered mb-0"><thead><tr>' +
      '<th>Sr no</th><th>Milestone</th><th>Stage Payment</th><th>Invoice Amount</th><th>Invoice Raised</th><th>Invoice Date</th><th>Invoice Number</th><th>Invoice Status</th><th>Progress</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  window.toggleMilestones = function(btn, projectId) {
    var project = ceProjects.find(function (p) { return p.pmc_entry_id === projectId; });
    if (!project) return;
    var parentRow = btn.closest('tr');
    if (!parentRow) return;
    if (openMilestoneDropdown && openMilestoneDropdown.row) {
      var same = openMilestoneDropdown.projectId === projectId;
      openMilestoneDropdown.row.remove();
      openMilestoneDropdown = null;
      if (same) return;
    }
    var dr = document.createElement('tr');
    dr.className = 'milestone-dropdown-row';
    dr.innerHTML = '<td colspan="15"><div class="milestone-dropdown-container"><div class="milestone-dropdown-title">Milestones - ' + (project.serviceType || '') + ' / ' + (project.client || '') + '</div>' + buildMilestoneDropdownTable(project) + '</div></td>';
    parentRow.parentNode.insertBefore(dr, parentRow.nextSibling);
    openMilestoneDropdown = { row: dr, projectId: projectId };
  };

  async function fetchMilestones() {
    var tbody = document.getElementById('milestoneTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="15" class="text-center text-muted">Loading...</td></tr>';
    try {
      const res = await fetch('/api/data/pmc/entry/all', { headers: authHeaders() });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      var entries = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);

      ceProjects = entries.map(function (p) {
        return {
          pmc_entry_id: p.pmc_entry_id,
          serviceType: p.service_type,
          client: p.client,
          projectDetails: p.project_details,
          loaDate: formatDate(p.loa_date),
          startDate: formatDate(p.start_date),
          endDate: formatDate(p.end_date),
          targetDate: formatDate(p.target_date),
          totalAmount: p.total_amount,
          amountReceived: p.amount_received,
          amountPending: p.amount_pending,
          status: p.status,
          milestones: Array.isArray(p.milestones) ? p.milestones : [],
        };
      });

      // Recalculate amounts from milestones
      ceProjects = ceProjects.map(function (project) {
        var invoiceAmountTotal = (project.milestones || []).reduce(function (s, m) { return s + (parseFloat(m.invoice_amount) || 0); }, 0);
        var invoiceRaisedTotal = (project.milestones || []).reduce(function (s, m) { return s + (parseFloat(m.invoice_raised) || 0); }, 0);
        var statusToShow = project.status;
        if (Array.isArray(project.milestones) && project.milestones.length) {
          // precedence: last with invoice_raised>0, else last received, else last pending
          var raised = project.milestones.filter(function (m) { return parseFloat(m.invoice_raised) > 0; });
          if (raised.length) {
            statusToShow = raised[raised.length - 1].milestone || project.status;
          } else {
            var received = project.milestones.filter(function (m) { return String(m.status || '').toLowerCase() === 'received'; });
            if (received.length) {
              statusToShow = received[received.length - 1].milestone || project.status;
            } else {
              var pending = project.milestones.filter(function (m) { return String(m.status || '').toLowerCase() === 'pending'; });
              if (pending.length) statusToShow = pending[pending.length - 1].milestone || project.status;
            }
          }
        }
        return Object.assign({}, project, { totalAmount: invoiceAmountTotal, amountReceived: invoiceRaisedTotal, amountPending: Math.max(0, invoiceAmountTotal - invoiceRaisedTotal), status: statusToShow });
      });

      // Filter to only C&E service type
      var visible = ceProjects.filter(function (p) {
        var st = String(p.serviceType || '').trim().toUpperCase();
        return st === 'C&E' || st === 'CE' || st === 'C & E' || st === 'EXECUTION' || st === 'EXEC';
      });
      ceProjects = visible;

      if (!visible.length) {
        tbody.innerHTML = '<tr><td colspan="15" class="text-center text-muted">No C&E projects available</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      visible.forEach(function (project, i) {
        var tr = document.createElement('tr');
          var allowEdit = (window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head');
          var actionsHtml = allowEdit ? '<button class="btn btn-sm btn-secondary" onclick="editPmcProject(\'' + project.pmc_entry_id + '\')">Edit</button>' : '<span class="text-muted">-</span>';
          tr.innerHTML =
            '<td>' + (i + 1) + '</td>' +
            '<td>' + (project.serviceType || '') + '</td>' +
            '<td>' + (project.client || '') + '</td>' +
            '<td>' + (project.projectDetails || '') + '</td>' +
            '<td>' + (project.loaDate || '') + '</td>' +
            '<td>' + (project.startDate || '') + '</td>' +
            '<td>' + (project.endDate || '') + '</td>' +
            '<td>' + (project.targetDate || '') + '</td>' +
            '<td>' + formatCurrency(project.totalAmount) + '</td>' +
            '<td>' + formatCurrency(project.amountReceived) + '</td>' +
            '<td>' + formatCurrency(project.amountPending) + '</td>' +
            '<td>' + (project.status || '') + '</td>' +
            '<td>' + renderSummaryBar(project) + '</td>' +
            '<td><button class="btn btn-sm btn-primary" onclick="toggleMilestones(this,\'' + project.pmc_entry_id + '\')">View</button></td>' +
            '<td>' + actionsHtml + '</td>';
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('fetchMilestones error:', err);
      tbody.innerHTML = '<tr><td colspan="15" class="text-center text-muted">Failed to load data</td></tr>';
    }
  }

  function getStatusBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'received' || s === 'completed') return 'bg-success';
    if (s === 'pending') return 'bg-warning text-dark';
    if (s === 'rejected') return 'bg-danger';
    return 'bg-secondary';
  }

  function wire() {
    const allowAdd = (window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head');
    const safeAdd = (page) => {
      if (!allowAdd) { alert('You do not have permission to add'); return; }
      openAddPage(page);
    };
    const byId = id => document.getElementById(id);
    if (byId('addContractDocBtn')) byId('addContractDocBtn').addEventListener('click', () => safeAdd('/add_contract_document.html'));
    if (byId('addDprBtn')) byId('addDprBtn').addEventListener('click', () => safeAdd('/add_dpr.html'));
    if (byId('addMprBtn')) byId('addMprBtn').addEventListener('click', () => safeAdd('/add_mpr.html'));
    if (byId('addCorrContractorBtn')) byId('addCorrContractorBtn').addEventListener('click', () => safeAdd('/add_correspondence_contractor.html'));
    if (byId('addCorrOtherBtn')) byId('addCorrOtherBtn').addEventListener('click', () => safeAdd('/add_correspondence_other.html'));
    if (byId('addIssueBtn')) byId('addIssueBtn').addEventListener('click', () => safeAdd('/add_issues.html'));
    
    // Add milestone button - open project entry form for PMC C&E
    if (byId('addMilestoneBtn')) byId('addMilestoneBtn').addEventListener('click', () => {
      if (!allowAdd) { alert('You do not have permission to add'); return; }
      const url = new URL('/add_pmc_entry.html', window.location.origin);
      url.searchParams.set('from', 'pmc_ce');
      if (pmc_ce_entity_id) url.searchParams.set('pmc_ce_entity_id', pmc_ce_entity_id);
      window.open(url.toString(), '_blank');
    });
  }

  // Expose helpers for actions
  window.editPmcProject = function(id) {
    if (!id) return;
    if (!(window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head')) { alert('You do not have permission to edit this project'); return; }
    const url = new URL('/add_pmc_entry.html', window.location.origin);
    url.searchParams.set('edit', id);
    url.searchParams.set('from', 'pmc_ce');
    if (pmc_ce_entity_id) url.searchParams.set('pmc_ce_entity_id', pmc_ce_entity_id);
    window.open(url.toString(), '_blank');
  };

  // init
  document.addEventListener('DOMContentLoaded', async () => {
    // First resolve context (get dept_id and statistic_id from entity_id)
    await resolveContext();
    // Resolve user's PMC access level and update UI
    try {
      const lvl = await resolveDeptAccessLevelByName('PMC');
      window.USER_PMC_ACCESS_LEVEL = lvl || 'none';
    } catch (e) {
      window.USER_PMC_ACCESS_LEVEL = 'none';
    }
    // Hide add buttons if user doesn't have edit/head
    const allowAdd = (window.USER_PMC_ACCESS_LEVEL === 'edit' || window.USER_PMC_ACCESS_LEVEL === 'head');
    ['addMilestoneBtn','addContractDocBtn','addDprBtn','addMprBtn','addCorrContractorBtn','addCorrOtherBtn','addIssueBtn'].forEach(id=>{
      const el = document.getElementById(id);
      if (!el) return;
      if (!allowAdd) el.style.display = 'none';
    });
    // Fetch and display titles
    await fetchTitles();
    wire();
    fetchDocuments();
    fetchCorrespondences();
    fetchIssues();
    fetchMilestones();
  });

  // Listen for cross-window updates from add/edit forms
  window.addEventListener('storage', function (e) {
    try {
      if (!e || !e.key) return;
      if (e.key.startsWith('pmc_ce_update_')) {
        console.log('Detected pmc_ce update signal', e.key, e.newValue);
        (async () => {
          await resolveContext();
          fetchDocuments();
          fetchCorrespondences();
          fetchIssues();
          fetchMilestones();
        })();
      }
    } catch (err) {
      console.error('storage event handler error', err);
    }
  });
})();
