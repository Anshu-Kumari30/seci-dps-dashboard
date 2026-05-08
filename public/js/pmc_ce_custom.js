document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const dept_id = params.get("dept_id");
  const statistic_id = params.get("statistic_id");
  const entity_id = params.get("entity_id");
  const requestedTab = params.get("tab");

  (async function loadContext(){
    try {
      let resolvedDept = dept_id && dept_id !== 'null' ? dept_id : '';
      let resolvedStat = statistic_id && statistic_id !== 'null' ? statistic_id : '';
      let stats = [];
      let entities = [];
      let grouped = { documents: [], correspondences: [], issues: [], milestones: [] };

      if (resolvedDept && resolvedStat) {
        const [statsRes, entitiesRes, groupedRes] = await Promise.all([
          authFetch(`/api/data/statistics/${resolvedDept}`),
          authFetch(`/api/data/entities/${resolvedDept}/${resolvedStat}`),
          authFetch(`/api/data/pmc/ce/grouped/${resolvedDept}/${resolvedStat}/${entity_id}`),
        ]);
        stats = await statsRes.json();
        entities = await entitiesRes.json();
        grouped = await groupedRes.json();
      } else {
        // try to resolve dept/stat by looking up the entity directly
        if (entity_id && entity_id !== 'null') {
          try {
            const entityRes = await authFetch(`/api/data/entity/${entity_id}`);
            const entityJson = await entityRes.json();
            if (entityJson.success && entityJson.data) {
              resolvedDept = resolvedDept || entityJson.data.dept_id || '';
              resolvedStat = resolvedStat || entityJson.data.statistic_id || '';
            }
          } catch (e) { console.error('Failed to resolve entity:', e); }
        }

        if (resolvedDept && resolvedStat) {
          const [statsRes, entitiesRes, groupedRes] = await Promise.all([
            authFetch(`/api/data/statistics/${resolvedDept}`),
            authFetch(`/api/data/entities/${resolvedDept}/${resolvedStat}`),
            authFetch(`/api/data/pmc/ce/grouped/${resolvedDept}/${resolvedStat}/${entity_id}`),
          ]);
          stats = await statsRes.json();
          entities = await entitiesRes.json();
          grouped = await groupedRes.json();
        } else {
          // couldn't resolve dept/stat — leave grouped empty but still populate tabs so UI is usable
          stats = [];
          entities = [];
          grouped = { documents: [], correspondences: [], issues: [], milestones: [] };
        }
      }

      const stat = stats.find((s) => s.statistic_id == statistic_id) || null;
      const entity = entities.find((e) => e.entity_id == entity_id) || null;
      document.getElementById("statisticTitle").innerText = stat?.statistic_name || "Statistic";
      document.getElementById("entityTitle").innerText = entity?.entity_name || "Entity";

      populateTabs(grouped, resolvedDept, resolvedStat, entity_id);
    } catch (err) {
      console.error('Error loading PMC C&E context', err);
      populateTabs({ documents: [], correspondences: [], issues: [], milestones: [] }, dept_id, statistic_id, entity_id);
    }
  })();

  function populateTabs(data, dept_id, statistic_id, entity_id) {
    const tabList = document.getElementById("customTabs");
    const tabContent = document.getElementById("customTabContent");

    tabList.innerHTML = "";
    tabContent.innerHTML = "";

    const types = [
      { id: "cdoc", label: "Contract Documents", source: "documents" },
      { id: "dpr", label: "Daily Progress Report", source: "documents" },
      { id: "mpr", label: "Monthly Progress Report", source: "documents" },
      { id: "milestone", label: "Milestone", source: "milestones" },
      { id: "cc", label: "Correspondences with Contractors", source: "correspondences", filter: "contractor" },
      { id: "sc", label: "Correspondences with other Stakeholders", source: "correspondences", filter: "other" },
      { id: "is", label: "Key Issues", source: "issues" },
    ];

    const activeTabId = types.some((t) => t.id === requestedTab) ? requestedTab : "milestone";

    types.forEach((type, index) => {
      const tabId = `custom-tab-${type.id}`;
      const isCurrent = type.id === activeTabId;
      const isActive = isCurrent ? "active" : "";
      const isShow = isCurrent ? "show active" : "";

      const tabButton = document.createElement("li");
      tabButton.className = "nav-item";
      tabButton.innerHTML = `
        <button class="nav-link ${isActive}" id="${tabId}-tab" data-bs-toggle="tab" data-bs-target="#${tabId}" type="button" role="tab">
          ${type.label}
        </button>`;
      tabList.appendChild(tabButton);

      const pane = document.createElement("div");
      pane.className = `tab-pane fade ${isShow}`;
      pane.id = tabId;
      pane.role = "tabpanel";

      let items = [];
      if (type.source === "documents") {
        items = (data.documents || []).filter((doc) => doc.doc_type === type.id && doc.statistic_id == statistic_id && doc.entity_id == entity_id);
      } else if (type.source === "correspondences") {
        items = (data.correspondences || []).filter((c) => c.correspondence_type === type.filter && c.statistic_id == statistic_id && c.entity_id == entity_id);
      } else if (type.source === "issues") {
        items = (data.issues || []).filter((issue) => issue.statistic_id == statistic_id && issue.entity_id == entity_id);
      } else if (type.source === "milestones") {
        items = (data.milestones || []).filter((m) => m.statistic_id == statistic_id && m.entity_id == entity_id);
      }

      const addButton = document.createElement("button");
      addButton.className = "btn btn-sm btn-success mb-2";
      addButton.innerText = `+ Add ${type.label}`;
      addButton.onclick = () => {
        if (type.id === "dpr") window.location.href = `/add_dpr_custom.html?dept_id=${dept_id}&statistic_id=${statistic_id}&entity_id=${entity_id}`;
        else if (type.id === "mpr") window.location.href = `/add_mpr_custom.html?dept_id=${dept_id}&statistic_id=${statistic_id}&entity_id=${entity_id}`;
        else if (type.id === "cdoc") window.location.href = `/add_contract_document_custom.html?dept_id=${dept_id}&statistic_id=${statistic_id}&entity_id=${entity_id}`;
        else if (type.id === "cc") window.location.href = `/add_correspondence_contractor_custom.html?dept_id=${dept_id}&statistic_id=${statistic_id}&entity_id=${entity_id}`;
        else if (type.id === "sc") window.location.href = `/add_correspondence_other_custom.html?dept_id=${dept_id}&statistic_id=${statistic_id}&entity_id=${entity_id}`;
        else if (type.id === "is") window.location.href = `/add_issues_custom.html?dept_id=${dept_id}&statistic_id=${statistic_id}&entity_id=${entity_id}`;
        else if (type.id === "milestone") window.location.href = `/add_pmc_entry_custom.html?dept_id=${dept_id}&statistic_id=${statistic_id}&entity_id=${entity_id}`;
        else alert('Coming soon');
      };

      pane.appendChild(addButton);

      const table = buildTable(items, type.id);
      table.className = "table table-bordered table-sm";
      pane.appendChild(table);
      tabContent.appendChild(pane);
    });
  }

  function buildTable(items, type) {
    const table = document.createElement("table");
    table.className = "table table-bordered";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");

    let columns = "";
    if (type === "milestone") {
      // custom milestone columns + in-row Status dropdown
      columns = `
        <tr>
          <th>Sr no</th>
          <th>Milestone</th>
          <th>Stage Payment</th>
          <th>Invoice Amount</th>
          <th>Invoice Raised</th>
          <th>Invoice Date</th>
          <th>Invoice Number</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>`;
    } else if (type === "is") {
      columns = `
        <tr>
          <th>S. No.</th>
          <th>Issue Description</th>
          <th>Issue Pertaining To</th>
          <th>Issue Date</th>
          <th>View</th>
          <th>Uploaded On</th>
          <th>Action</th>
        </tr>`;
    } else {
      columns = `
        <tr>
          <th>S. No.</th>
          <th>Document Name / Subject</th>
          <th>Dated</th>
          <th>View</th>
          <th>Uploaded On</th>
          <th></th>
        </tr>`;
    }

    thead.innerHTML = columns;

    items.forEach((item, idx) => {
      const tr = document.createElement('tr');
      if (type === 'milestone') {
        const statusOptions = ['Pending','Partially Paid','Paid','Cancelled'];
        const selectHtml = `<select class="form-select form-select-sm milestone-status" data-pmc-id="${item.pmc_entry_id || ''}">` +
          statusOptions.map(opt => `<option value="${opt}" ${item.status===opt? 'selected':''}>${opt}</option>`).join('') +
          `</select>`;

        tr.innerHTML = `
          <td>${item.pmc_sno || (idx+1)}</td>
          <td>${item.milestone || ''}</td>
          <td>${item.stage_payment ?? ''}</td>
          <td>${item.invoice_amount ?? ''}</td>
          <td>${item.invoice_raised ?? ''}</td>
          <td>${item.invoice_date ? formatToISTDate(item.invoice_date) : ''}</td>
          <td>${item.invoice_number || ''}</td>
          <td>${selectHtml}</td>
          <td>
            <button class="btn btn-primary btn-sm edit-entry" data-pmc-id="${item.pmc_entry_id||''}">Edit</button>
            <button class="btn btn-danger btn-sm delete-entry" data-pmc-id="${item.pmc_entry_id||''}">Delete</button>
          </td>`;
      } else if (type === 'is') {
        tr.innerHTML = `
          <td>${idx+1}</td>
          <td>${item.issue_description||''}</td>
          <td>${item.issue_pertaining_to||''}</td>
          <td>${formatToISTDate(item.issue_date)}</td>
          <td>${item.issue_doc_path ? `<a href="${item.issue_doc_path}" target="_blank" class="btn btn-sm btn-outline-primary">View</a>` : ''}</td>
          <td>${formatToISTDate(item.createdAt)}</td>
          <td><button class="btn btn-danger btn-sm" data-issue-id="${item.issue_id||''}">Delete</button></td>`;
      } else {
        tr.innerHTML = `
          <td>${idx+1}</td>
          <td>${item.doc_name||item.subject||''}</td>
          <td>${formatToISTDate(item.doc_date||item.correspondence_date)}</td>
          <td>${item.doc_path ? `<a href="${item.doc_path}" target="_blank" class="btn btn-sm btn-outline-primary">View</a>` : ''}</td>
          <td>${formatToISTDate(item.createdAt)}</td>
          <td></td>`;
      }
      tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    // hook events for milestone selects and buttons
    setTimeout(() => {
      document.querySelectorAll('.milestone-status').forEach(select => {
        select.addEventListener('change', (e) => {
          const pmcId = select.getAttribute('data-pmc-id');
          const newStatus = select.value;
          if (!pmcId) return;
          authFetch(`/api/data/pmc/ce/entry/${pmcId}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
            .then(res => { if (!res.ok) throw new Error('Failed'); alert('Status updated'); })
            .catch(err => { console.error(err); alert('Could not update status'); });
        });
      });

      document.querySelectorAll('.edit-entry').forEach(btn => btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-pmc-id'); if (id) window.location.href = `/add_pmc_entry_custom.html?edit=${id}`;
      }));

      document.querySelectorAll('.delete-entry').forEach(btn => btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-pmc-id');
        if (!id) return;
        if (!confirm('Delete this milestone?')) return;
        authFetch(`/api/data/pmc/ce/entry/${id}`, { method: 'DELETE' })
          .then(res => { if (!res.ok) throw new Error('Failed'); btn.closest('tr')?.remove(); })
          .catch(err => { console.error(err); alert('Could not delete'); });
      }));
    }, 50);

    return table;
  }

  function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = { 'Content-Type': 'application/json' };
    if (token) defaultHeaders.Authorization = `Bearer ${token}`;
    const fetchOptions = { cache: 'no-store', ...options, headers: { ...defaultHeaders, ...(options.headers||{}) } };
    return fetch(url, fetchOptions).then(res => {
      if (res.status === 401) { localStorage.clear(); window.location.href = '/'; throw new Error('Unauthorized'); }
      return res;
    });
  }

  function formatToISTDate(d) {
    if (!d) return '';
    const date = new Date(d);
    const istOffset = 5.5 * 60 * 60000;
    const istDate = new Date(date.getTime() + istOffset);
    const day = String(istDate.getUTCDate()).padStart(2,'0');
    const month = String(istDate.getUTCMonth()+1).padStart(2,'0');
    const year = istDate.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

});
