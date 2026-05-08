// Shared PMC module: fetch data and render PMC charts + summary
// Usage: call `pmcModule.initAll({ chart1Id, chart2Id, chart3Id, summaryTbodyId })`
(function () {
  const charts = {};

  function normalizeServiceTypes(rawTypes) {
    const list = Array.isArray(rawTypes) ? rawTypes : (rawTypes ? [rawTypes] : []);
    return Array.from(new Set(list
      .map(t => String(t || '').trim().toUpperCase())
      .filter(Boolean)
      .map(t => (t === 'PFR' || t === 'DPR/PFR' || t === 'DPR-PFR' || t === 'DPR_PFR') ? 'DPR' : t)
    ));
  }

  function inferServiceFromSegment(segment) {
    const seg = String(segment || '').toLowerCase();
    if (seg.includes('dpr') || seg.includes('pfr')) return 'DPR';
    if (seg.includes('bms')) return 'BMS';
    if (seg.includes('exec')) return 'EXECUTION';
    return '';
  }

  async function fetchPmcEntries() {
    try {
      const res = await authFetch('/api/data/pmc/entry/all');
      if (!res.ok) return [];
      const j = await res.json();
      return Array.isArray(j.data) ? j.data : [];
    } catch (err) {
      console.error('pmcModule: fetchPmcEntries error', err);
      return [];
    }
  } 

  async function fetchPmcSliceMeta(segment) {
    try {
      const seg = segment || 'pmc';
      const res = await authFetch(`/api/data/pmc/slice_editor/segment/${encodeURIComponent(seg)}`);
      if (!res || !res.ok) return [];
      const j = await res.json();
      return Array.isArray(j.items) ? j.items : (Array.isArray(j.data) ? j.data : (j.items || j.data || []));
    } catch (err) {
      console.error('pmcModule: fetchPmcSliceMeta error', err);
      return [];
    }
  }

  async function fetchPmcCeEntities() {
    try {
      const res = await authFetch('/api/data/pmc/ce/entities/all');
      if (!res.ok) return [];
      const j = await res.json();
      return Array.isArray(j.data) ? j.data : [];
    } catch (err) {
      console.error('pmcModule: fetchPmcCeEntities error', err);
      return [];
    }
  }

  // Aggregate milestone data by service type/category
  function aggregateMilestonesByType(entries) {
    const aggregated = {};
    entries.forEach(entry => {
      const serviceType = String(entry.service_type || 'Other').toUpperCase();
      const key = (serviceType === 'DPR' || serviceType === 'PFR') ? 'DPR/PFR' : serviceType;
      if (!aggregated[key]) {
        aggregated[key] = { count: 0, totalAmount: 0, totalRaised: 0, projects: [] };
      }
      const milestones = Array.isArray(entry.milestones) ? entry.milestones : [];
      aggregated[key].count += milestones.length;
      milestones.forEach(m => {
        aggregated[key].totalAmount += Number(m.invoice_amount || 0);
        aggregated[key].totalRaised += Number(m.invoice_raised || 0);
      });
      aggregated[key].projects.push({
        pmc_entry_id: entry.pmc_entry_id,
        client: entry.client,
        milestoneCount: milestones.length
      });
    });
    return aggregated;
  }

  // Get color for service type
  function getServiceTypeColor(serviceType) {
    const st = String(serviceType || '').trim().toUpperCase();
    if (st === 'BMS') return '#a85dc0';
    if (st === 'DPR' || st === 'PFR' || st === 'DPR/PFR') return '#0b5ed7';
    if (st === 'EXECUTION' || st === 'C&E') return '#17a2b8';
    return '#6c757d';
  }

  function ensureChart(id, config) {
    const el = document.getElementById(id);
    if (!el) return null;
    const ctx = el.getContext('2d');
    // If a Chart instance already exists on this canvas (created elsewhere), destroy it first
    try {
      const existing = Chart.getChart(el);
      if (existing) {
        try { existing.destroy(); } catch (e) { /* ignore */ }
      }
    } catch (e) {
      /* Chart.getChart may not be available in older Chart versions; ignore */
    }

    // create new managed chart instance
    charts[id] = new Chart(ctx, config);
    
    // Store chart3 instance globally for external access
    if (id === 'pmcChart3') {
      window.pmcChart3Instance = charts[id];
    }
    
    return charts[id];
  }

  // Try to resolve a project/slice selection into dept/statistic/entity and open add_issues.html
  async function tryOpenAddIssuesForProject(segmentKey, projectName, pmcSliceMetaId, contextLabel) {
    try {
      // Try lookup saved pmc entry by project_name
      var lookupUrl = '/api/data/pmc/entry/all?segment=' + encodeURIComponent(segmentKey || '') + (projectName ? '&project_name=' + encodeURIComponent(projectName) : '');
      var res = await authFetch(lookupUrl);
      if (!res.ok) throw new Error('entry lookup failed: ' + res.status);
      var payload = await res.json();
      var list = Array.isArray(payload.data) ? payload.data : [];
      if (!list.length) throw new Error('no saved entry');
      var resolvedId = String(list[0].pmc_entry_id || '');
      if (!resolvedId) throw new Error('no pmc_entry_id');

      // Resolve entity context for the resolved pmc_entry_id
      var ctxRes = await authFetch('/api/data/entities/context/' + encodeURIComponent(resolvedId));
      if (!ctxRes.ok) throw new Error('context resolve failed: ' + ctxRes.status);
      var ctx = await ctxRes.json();

      // Build add_issues URL with dept/statistic/entity when available
      var href = '/add_issues.html';
      var sep = '?';
      if (ctx.dept_id) { href += sep + 'dept_id=' + encodeURIComponent(ctx.dept_id); sep = '&'; }
      if (ctx.statistic_id) { href += sep + 'statistic_id=' + encodeURIComponent(ctx.statistic_id); sep = '&'; }
      if (ctx.entity_id) { href += sep + 'entity_id=' + encodeURIComponent(ctx.entity_id); sep = '&'; }
      // include context so add_issues knows where it came from
      if (contextLabel) href += sep + 'context=' + encodeURIComponent(contextLabel);
      // include original slice/project indicator
      if (pmcSliceMetaId) href += '&pmc_slice_meta_id=' + encodeURIComponent(pmcSliceMetaId);
      if (projectName) href += '&project_name=' + encodeURIComponent(projectName);

      window.open(href, '_blank');
      return true;
    } catch (e) {
      console.warn('tryOpenAddIssuesForProject failed:', e);
      return false;
    }
  }

  // Resolve the entity UUID for a saved PMC entry for a given project name
  async function resolveEntityUuidForProject(segmentKey, projectName) {
    try {
      var lookupUrl = '/api/data/pmc/entry/all?segment=' + encodeURIComponent(segmentKey || '') + (projectName ? '&project_name=' + encodeURIComponent(projectName) : '');
      var res = await authFetch(lookupUrl);
      if (!res || !res.ok) return null;
      var payload = await res.json();
      var list = Array.isArray(payload.data) ? payload.data : [];
      if (!list.length) return null;
      var resolvedId = String(list[0].pmc_entry_id || '');
      if (!resolvedId) return null;
      var ctxRes = await authFetch('/api/data/entities/context/' + encodeURIComponent(resolvedId));
      if (!ctxRes || !ctxRes.ok) return null;
      var ctx = await ctxRes.json();
      return ctx && ctx.entity_id ? String(ctx.entity_id) : null;
    } catch (e) {
      console.warn('resolveEntityUuidForProject failed:', e);
      return null;
    }
  }

  function renderDprPfrChart(chartId, entries, sliceMeta) {
    // For DPR/PFR donuts, use ONLY slice-meta data from the Add/Edit form
    // Do NOT use PMC milestone data
    const sliceMetaItems = Array.isArray(sliceMeta) ? sliceMeta.filter(s => {
      const explicitTypes = normalizeServiceTypes(s.types_of_service || s.type_of_service);
      const inferredType = inferServiceFromSegment(s.segment);
      const hasDprType = explicitTypes.includes('DPR');
      const hasDprSegment = inferredType === 'DPR';
      // Accept row when either explicit types are DPR-like OR segment clearly belongs to DPR.
      return hasDprType || hasDprSegment;
    }) : [];
    
    // Group by project name so repeated saves/legacy rows do not create hundreds of tiny slices.
    const groupedMap = new Map();
    sliceMetaItems.forEach((s) => {
      const projectName = String(s.project_name || '').trim();
      const key = projectName ? projectName.toLowerCase() : String(s.pmc_slice_meta_id || '').toLowerCase();
      const value = Number(s.number_of_projects ?? s.project_capacity ?? 0);

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          client: projectName || 'Project',
          project_details: projectName || 'Project',
          pmc_entry_id: s.pmc_slice_meta_id || ('slice-' + (projectName || '').slice(0, 6)),
          total_amount: value > 0 ? value : 1,
          number_of_projects: Number(s.number_of_projects ?? (value > 0 ? value : 1)),
          project_capacity: Number(s.project_capacity ?? 0),
          loa_date: s.loa_date || null,
          scod: s.scod || null,
          fields: Array.isArray(s.fields) ? s.fields : [],
          row_count: 1,
          isOthers: false,
        });
        return;
      }

      const existing = groupedMap.get(key);
      existing.total_amount += (value > 0 ? value : 1);
      existing.number_of_projects += Number(s.number_of_projects ?? (value > 0 ? value : 1));
      existing.project_capacity += Number(s.project_capacity ?? 0);
      existing.row_count += 1;
      if (!existing.loa_date && s.loa_date) existing.loa_date = s.loa_date;
      if (!existing.scod && s.scod) existing.scod = s.scod;
      if ((!existing.fields || !existing.fields.length) && Array.isArray(s.fields) && s.fields.length) {
        existing.fields = s.fields;
      }
    });

    const combined = Array.from(groupedMap.values()).sort((a, b) => Number(b.total_amount || 0) - Number(a.total_amount || 0));

    const labels = combined.map(e => e.client || e.project_details || e.pmc_entry_id || 'Project');
    const data = combined.map(e => (Number(e.total_amount || 0) > 0 ? Number(e.total_amount || 0) : 1));
    const base = ['#1f77b4', '#ff7f0e', '#2ca02c', '#9467bd', '#17becf', '#bcbd22', '#e377c2'];
    const bg = labels.length ? labels.map((_, i) => base[i % base.length]) : ['#dee2e6'];
    
    // Totals for display (only from slice-meta)
    const totalProjects = sliceMetaItems.length;
    const totalPoValue = sliceMetaItems.reduce((sum, item) => {
      return sum + (Number(item.number_of_projects ?? item.project_capacity ?? 0));
    }, 0);

    // center text plugin removed — no center text shown

    const config = {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          data: data.length ? data : [1],
          backgroundColor: bg,
          borderColor: (labels.length ? labels : ['No Data']).map(() => '#ffffff'),
          borderWidth: 2
        }]
      },
      options: {
        cutout: '65%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title(items) {
                if (!items.length) return '';
                const p = combined[items[0].dataIndex];
                return p ? (p.client || p.project_details || 'Project') : '';
              },
              label(ctx) {
                const p = combined[ctx.dataIndex];
                if (!p) return '';
                const n = p.number_of_projects > 0 ? p.number_of_projects : p.total_amount;
                return 'Projects: ' + Number(n || 0);
              },
              afterLabel(ctx) {
                const p = combined[ctx.dataIndex];
                if (!p) return '';
                const lines = [];
                if (p.loa_date) lines.push('LOA: ' + String(p.loa_date).split('T')[0]);
                if (p.scod) lines.push('SCOD: ' + String(p.scod).split('T')[0]);
                (p.fields || []).forEach(f => {
                  const name = f.field_name || f.name || 'Field';
                  const value = f.field_value ?? f.value ?? '';
                  const unit = f.unit ? (' ' + f.unit) : '';
                  lines.push(name + ': ' + value + unit);
                });
                return lines;
              }
            }
          }
        },
        onClick: async (evt, activeEls) => {
          if (!activeEls.length) return;
          const idx = activeEls[0].index;
          const sel = combined[idx];
          if (!sel) return;
          const projectName = sel.client || sel.project_details || '';
          // Prefer navigating to the DPR projects page with the resolved entity UUID
          const entityUuid = await resolveEntityUuidForProject('pmc_dpr', projectName);
          if (entityUuid) {
            window.location.href = `/pmc_dpr_projects.html?pmc_entry_id=${encodeURIComponent(entityUuid)}`;
            return;
          }
          // If we couldn't resolve an entity UUID, try opening add_issues as before
          var opened = await tryOpenAddIssuesForProject('pmc_dpr', projectName, sel.pmc_entry_id || sel.pmc_slice_meta_id || '', 'pmc_dpr');
          if (opened) return;
          // fallback: navigate to DPR/PFR projects page using project name as query
          const qs = projectName
            ? `?segment=pmc_dpr&project_name=${encodeURIComponent(projectName)}`
            : `?segment=pmc_dpr`;
          window.location.href = `/pmc_dpr_projects.html${qs}`;
        }
      },
      
    };

    const ch = ensureChart(chartId, config);
    if (ch) {
      ch.data.labels = config.data.labels;
      ch.data.datasets[0].data = config.data.datasets[0].data;
      ch.data.datasets[0].backgroundColor = config.data.datasets[0].backgroundColor;
      ch.update();
    }
  }

  function renderBmsChart(chartId, entries, sliceMeta) {
    // For BMS donuts, use ONLY slice-meta data from the Add/Edit form
    // Do NOT use PMC milestone data
    const sliceMetaItems = Array.isArray(sliceMeta) ? sliceMeta.filter(s => 
      Array.isArray(s.types_of_service || s.type_of_service) ? 
      (s.types_of_service || s.type_of_service).includes('BMS') : false
    ) : [];
    
    // Transform slice-meta items into chart data (grouped by client/project_name)
    // Also keep track of the pmc_slice_meta_id for each project for click navigation
    const counts = {};
    const grouped = {};
    const projectMetaMap = {}; // Map from project_name to pmc_slice_meta_id
    sliceMetaItems.forEach(item => {
      const clientName = (item.project_name || 'Unknown').trim();
      const value = Number(item.number_of_projects ?? item.project_capacity ?? 0);
      counts[clientName] = (counts[clientName] || 0) + (value > 0 ? value : 1);
      if (!grouped[clientName]) grouped[clientName] = [];
      grouped[clientName].push(item);
      // Store the meta ID for this project (use the first one encountered)
      if (!projectMetaMap[clientName]) {
        projectMetaMap[clientName] = item.pmc_slice_meta_id || item.id;
      }
    });
    
    const labels = Object.keys(counts);
    const data = labels.map(l => counts[l]);
    const base = ['#2ca02c', '#1f77b4', '#ff7f0e', '#9467bd', '#17becf', '#bcbd22'];
    const bg = labels.map((_, i) => base[i % base.length]);

    // Totals for display (only from slice-meta)
    const totalBmsProjects = sliceMetaItems.length;
    const totalBmsPoValue = sliceMetaItems.reduce((sum, item) => {
      return sum + (Number(item.number_of_projects ?? item.project_capacity ?? 0));
    }, 0);

    // center text for BMS removed — no center text shown

    const config = { 
      type:'doughnut', 
      data: { 
        labels: labels.length ? labels : ['BMS'], 
        datasets: [{ 
          data: data.length ? data : [0], 
          backgroundColor: bg, 
          borderColor: labels.map(() => '#ffffff'), 
          borderWidth: 2,
          hoverOffset: 12
        }] 
      }, 
      
       options: { 
        cutout: '65%',
        responsive: true, 
        maintainAspectRatio: false, 
        plugins: { 
            legend: { display: false },
            tooltip: {
              callbacks: {
                title(items) {
                  if (!items.length) return '';
                  return labels[items[0].dataIndex] || '';
                },
                label(ctx) {
                  const projectName = labels[ctx.dataIndex];
                  const items = grouped[projectName] || [];
                  const projects = items.reduce((s, it) => s + Number(it.number_of_projects ?? it.project_capacity ?? 0), 0);
                  return 'Projects: ' + Number(projects || counts[projectName] || 0);
                },
                afterLabel(ctx) {
                  const projectName = labels[ctx.dataIndex];
                  const items = grouped[projectName] || [];
                  if (!items.length) return '';
                  const first = items[0];
                  const lines = [];
                  if (first.loa_date) lines.push('LOA: ' + String(first.loa_date).split('T')[0]);
                  if (first.scod) lines.push('SCOD: ' + String(first.scod).split('T')[0]);
                  (first.fields || []).forEach(f => {
                    const name = f.field_name || f.name || 'Field';
                    const value = f.field_value ?? f.value ?? '';
                    const unit = f.unit ? (' ' + f.unit) : '';
                    lines.push(name + ': ' + value + unit);
                  });
                  return lines;
                }
              }
            }
        },
        onClick: async (evt, activeEls) => {
          if (!activeEls.length) return;
          const idx = activeEls[0].index;
          const projectName = String(labels[idx] || '').trim();
          if (!projectName) return;
          // Keep URL semantics correct: project label goes in project_name, not pmc_entry_id.
          window.location.href = `/pmc_bms_projects.html?segment=pmc-bms&project_name=${encodeURIComponent(projectName)}`;
        }
      },
      
    };
    const ch = ensureChart(chartId, config);
    if (ch) { ch.data.labels = config.data.labels; ch.data.datasets[0].data = config.data.datasets[0].data; ch.update(); }
    
    // Also attach canvas-level click listener as fallback
    const canvas = document.getElementById(chartId);
    if (canvas && charts[chartId]) {
      canvas.onclick = async function (evt) {
        const points = charts[chartId].getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
        if (points && points.length) {
          const idx = points[0].index;
          const projectName = String(labels[idx] || '').trim();
          if (!projectName) return;
          window.location.href = `/pmc_bms_projects.html?segment=pmc-bms&project_name=${encodeURIComponent(projectName)}`;
        }
      };
    }
  }

  function renderCeFieldsChart(chartId, ceEntities, entries = []) {
    // Build project-level slices: one per project, capacity as value, fields shown on hover
    const ceProjects = ceEntities.map(ent => {
      const name = ent.project_name || ent.projectName || ent.entity_name || ent.entityName || 'Project';
      const id = ent.entity_id || ent.id || ent.pmc_ce_entity_id || null;
      // Normalize slice ID - could be any of these depending on which table it came from (pmc_execution_meta_id, pmc_dpr_meta_id, pmc_bms_meta_id, or pmc_slice_meta_id)
      const sliceMetaId = ent.pmc_slice_meta_id || ent.pmc_execution_meta_id || ent.pmc_dpr_meta_id || ent.pmc_bms_meta_id || null;
      const rawCap = parseFloat(String(ent.project_capacity || ent.projectCapacity || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const rawProjects = parseFloat(String(ent.number_of_projects || ent.numberOfProjects || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const fields = (ent.fields||[]).map(f => {
        const fname = f.field_name || f.name || f.fieldName || 'Field';
        const rawVal = String(f.field_value ?? f.value ?? f.fieldValue ?? '0');
        const num = parseFloat(String(rawVal).replace(/[^0-9.\-]/g, ''));
        const unit = f.unit || f.field_unit || '';
        return { name: fname, value: Number.isFinite(num) ? num : 0, unit };
      });
      const fieldSum = fields.reduce((s, f) => s + f.value, 0);
      // Determine slice value using project-level data (prefer project totals),
      // do not rely on milestones. This ensures donut is filled by project.
      let sliceValue = 0;
      try {
        const match = entries.find(e => {
          const eId = e.pmc_ce_entity_id || e.entity_id || e.id || e.pmcEntryId || null;
          return eId && id && String(eId) === String(id);
        });
        // Prefer explicit project-level total/amount values on the PMC entry
        if (match) {
          const total = Number(match.total_amount || match.totalAmount || match.project_value || 0);
          if (Number.isFinite(total) && total > 0) sliceValue = total;
        }
      } catch (e) {
        console.warn('Error resolving project-level slice value', e);
      }

      // fallback order: explicit project total -> project_capacity -> number_of_projects -> sum(fields)
      const capacity = sliceValue > 0 ? sliceValue : (rawCap > 0 ? rawCap : (rawProjects > 0 ? rawProjects : fieldSum));
      return { entity_id: id, pmc_slice_meta_id: sliceMetaId, name, capacity, fields, segment: ent.segment };
    }).filter(p => p.capacity > 0 || p.fields.length > 0);

    const labels = ceProjects.length ? ceProjects.map(p => p.name) : ['No Data'];
    const values = ceProjects.length ? ceProjects.map(p => p.capacity > 0 ? p.capacity : 1) : [1];
    const base = ['#4e79a7', '#59a14f', '#f28e2b', '#76b7b2', '#edc949', '#af7aa1', '#ff9da7'];
    const bg = labels.map((_, i) => base[i % base.length]);

    const config = {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: bg, borderColor: labels.map(() => '#ffffff'), borderWidth: 2, hoverOffset: 12 }] },
      options: {
        cutout: '65%',
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title(items) {
                if (!items.length) return '';
                const p = ceProjects[items[0].dataIndex];
                return p ? p.name : '';
              },
              afterTitle(items) {
                if (!items.length) return '';
                const p = ceProjects[items[0].dataIndex];
                return p ? 'Value: ' + p.capacity : '';
              },
              label(ctx) {
                const p = ceProjects[ctx.dataIndex];
                if (!p || !p.fields.length) return '';
                return p.fields.map(f => '  ' + f.name + ': ' + f.value + (f.unit ? ' ' + f.unit : ''));
              }
            }
          }
        }
      }
    };
    const ch = ensureChart(chartId, config);
    if (ch) { ch.data.labels = config.data.labels; ch.data.datasets[0].data = config.data.datasets[0].data; ch.update(); }
    // attach click navigation
    const canvas = document.getElementById(chartId);
    if (canvas && charts[chartId]) {
      canvas.onclick = function (evt) {
        const points = charts[chartId].getElementsAtEventForMode(evt, 'nearest', { intersect: true }, false);
        if (points && points.length) {
          const idx = points[0].index;
          const sel = ceProjects[idx];
          if (!sel) return;
          
          // Route based on segment
          const segment = String(sel.segment || '').toLowerCase();
          if (segment.includes('execution')) {
            const projectName = sel.name || '';
            const qs = projectName
              ? `?segment=pmc-execution&project_name=${encodeURIComponent(projectName)}`
              : `?segment=pmc-execution`;
            window.location.href = `/pmc_execution_projects.html${qs}`;
          } else {
            // Navigate to C&E projects page with entity_id
            if (sel.entity_id) {
              window.location.href = `/pmc_ce_projects.html?entity_id=${encodeURIComponent(sel.entity_id)}`;
            }
          }
        }
      };
    }
  }

  function renderSummaryTable(tbodyId, entries) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    
    // Group entries by service_type
    const grouped = (Array.isArray(entries) ? entries : []).reduce((acc, item) => {
      const type = (item.service_type || item.serviceType || 'Other').toUpperCase();
      if (!acc[type]) acc[type] = [];
      acc[type].push(item);
      return acc;
    }, {});
    
    // Define order for service types - DPR, PFR, BMS, EXECUTION
    const order = ['DPR', 'PFR', 'BMS', 'EXECUTION'];
    // Ensure the preferred order is preserved when types exist, then append any other types
    const allTypes = order.filter(t => Boolean(grouped[t])).concat(
      Object.keys(grouped).filter(t => !order.includes(t))
    );
    
    if (!allTypes.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#999;font-family:Arial, Helvetica, sans-serif;font-size:1rem;">No data available</td></tr>';
      return;
    }
    
    tbody.innerHTML = '';
    let grandTotalProjects = 0;
    let grandTotalPoValue = 0;
    let grandTotalInvoiceRaised = 0;
    let grandTotalPoPending = 0;
    
    // Create summary rows for each type
    allTypes.forEach((type, typeIdx) => {
      const items = grouped[type] || [];
      if (!items.length) return;
      
      const typeProjects = items.length;
      const typePoValue = items.reduce((sum, item) => sum + (Number(item.total_amount || item.totalAmount || 0)), 0);
      const typeInvoiceRaised = items.reduce((sum, item) => {
        const milestones = Array.isArray(item.milestones) ? item.milestones : [];
        const totalRaised = milestones.reduce((s, m) => s + (Number(m.invoice_raised || m.invoiceRaised || 0)), 0);
        return sum + totalRaised;
      }, 0);
      const typePoPending = typePoValue - typeInvoiceRaised;
      
      // Update grand totals
      grandTotalProjects += typeProjects;
      grandTotalPoValue += typePoValue;
      grandTotalInvoiceRaised += typeInvoiceRaised;
      grandTotalPoPending += typePoPending;
      
      // Create summary row for this type
      const tr = document.createElement('tr');
      tr.className = 'summary-type-row';
      
      const contentId = 'summaryContent_' + typeIdx;
      
      tr.innerHTML = `
        <td style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">${typeIdx + 1}</td>
        <td style="text-align: center; font-weight: 600; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">${type}</td>
        <td style="text-align: center; font-weight: 600; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">${typeProjects}</td>
        <td style="text-align: right; font-weight: 600; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">₹${typePoValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="text-align: right; font-weight: 600; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">₹${typeInvoiceRaised.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="text-align: right; font-weight: 600; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">₹${typePoPending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        <td style="text-align: center;">
          <button class="btn btn-sm btn-primary view-btn-summary" data-dropdown-id="${contentId}" style="white-space: nowrap;">View ▼</button>
        </td>
      `;
      tbody.appendChild(tr);
      
      // Add event listener to the button (not onclick)
      const viewBtn = tr.querySelector('.view-btn-summary');
      if (viewBtn) {
        viewBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          window.toggleSummaryDropdown(contentId);
        });
        // Preserve open state across periodic dashboard refreshes
        if (window.openDropdowns && window.openDropdowns.has(contentId)) {
          viewBtn.textContent = 'Hide ▲';
        }
      }
      
      // Build detailed projects table HTML
      let projectsTableHTML = `
        <td colspan="12" style="padding: 0;">
          <div style="background: #fff; border: 1px solid #e0e6ef; border-radius: 4px; margin: 12px; padding: 0; overflow: hidden;">
            <div style="padding: 12px 16px; background: linear-gradient(90deg, #0b5ed7, #1f4e79); color: #fff; font-weight: 600; border-bottom: 1px solid #e0e6ef; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">
              Projects - ${type}
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; font-family: Arial, Helvetica, sans-serif;">
                <thead>
                  <tr style="background: #e9ecef;">
                    <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">S.No</th>
                    <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Type of Service</th>
                    <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Client</th>
                    <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Project Details</th>
                    <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">LOA to SECI</th>
                    <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Start Date</th>
                    <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">End Date</th>
                    <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Target Date</th>
                    <th style="padding: 10px; text-align: right; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">P O Value</th>
                    <th style="padding: 10px; text-align: right; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Invoice Raised</th>
                    <th style="padding: 10px; text-align: right; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Amount Pending</th>
                    <th style="padding: 10px; text-align: center; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Actions</th>
                  </tr>
                </thead>
                <tbody>
      `;
      
      items.forEach((item, itemIdx) => {
        const totalAmount = Number(item.total_amount || item.totalAmount || 0);
        const milestones = Array.isArray(item.milestones) ? item.milestones : [];
        const totalInvoiceRaised = milestones.reduce((s, m) => s + (Number(m.invoice_raised || m.invoiceRaised || 0)), 0);
        const amountPending = totalAmount - totalInvoiceRaised;
        const startDate = item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '-';
        const endDate = item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '-';
        const loaDate = item.loa_date ? new Date(item.loa_date).toISOString().split('T')[0] : '-';
        
        // Calculate progress percentage
        const progressPct = totalAmount > 0 ? ((totalInvoiceRaised / totalAmount) * 100).toFixed(1) : 0;
        
        // Determine status
        let status = 'Pending';
        if (progressPct == 100) status = 'Completed';
        else if (progressPct > 50) status = 'In Progress';
        
        const milestonesDropdownId = 'projectMilestones_' + typeIdx + '_' + itemIdx;
        
        projectsTableHTML += `
          <tr style="border-bottom: 1px solid #e9ecef; background: #fafafa;">
            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${itemIdx + 1}</td>
            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${type}</td>
            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${item.client || '-'}</td>
            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${item.project_details || item.projectDetails || '-'}</td>
            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${loaDate}</td>
            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${startDate}</td>
            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${endDate}</td>
            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${item.target_date ? new Date(item.target_date).toISOString().split('T')[0] : '-'}</td>
            <td style="padding: 10px; text-align: right; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">₹${totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td style="padding: 10px; text-align: right; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">₹${totalInvoiceRaised.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td style="padding: 10px; text-align: right; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">₹${amountPending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td style="padding: 10px; text-align: center;">
              <button class="btn btn-sm btn-info view-btn-milestone" data-dropdown-id="${milestonesDropdownId}" style="white-space: nowrap;">View ▼</button>
            </td>
          </tr>
          <tr id="${milestonesDropdownId}" style="display: none; background: #f8f9fa;">
            <td colspan="12" style="padding: 0;">
              <div style="background: #fff; border: 1px solid #e0e6ef; border-radius: 4px; margin: 12px; padding: 0; overflow: hidden;">
                <div style="padding: 12px 16px; background: linear-gradient(90deg, #17a2b8, #138496); color: #fff; font-weight: 600; border-bottom: 1px solid #e0e6ef; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">
                  Milestones - ${item.client || 'Project'}
                </div>
                <div style="overflow-x: auto;">
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; font-family: Arial, Helvetica, sans-serif;">
                    <thead>
                      <tr style="background: #e9ecef;">
                        <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Sr No</th>
                        <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Milestone</th>
                        <th style="padding: 10px; text-align: right; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Stage Payment (%)</th>
                        <th style="padding: 10px; text-align: right; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Invoice Amount</th>
                        <th style="padding: 10px; text-align: right; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Invoice Raised</th>
                        <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Invoice Date</th>
                        <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Invoice Number</th>
                        <th style="padding: 10px; text-align: center; border-right: 1px solid #ddd; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Invoice Status</th>
                        <th style="padding: 10px; text-align: center; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${milestones.length === 0 ? '<tr><td colspan="9" style="padding: 10px; text-align: center; color: #999; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">No milestones</td></tr>' : ''}
                      ${milestones.map((ms, msIdx) => {
                        const msStatus = (ms.status || 'Pending').charAt(0).toUpperCase() + (ms.status || 'Pending').slice(1);
                        const msInvoiceRaised = Number(ms.invoice_raised || ms.invoiceRaised || 0);
                        const msInvoiceAmount = Number(ms.invoice_amount || ms.invoiceAmount || 0);
                        const msInvoiceDate = ms.invoice_date ? new Date(ms.invoice_date).toISOString().split('T')[0] : '-';
                        const msInvoiceNumber = ms.invoice_number || '-';
                        const msStagePayment = Number(ms.stage_payment || ms.stagePayment || 0);
                        const msMilestoneProgressPct = msInvoiceAmount > 0 ? ((msInvoiceRaised / msInvoiceAmount) * 100).toFixed(1) : 0;
                        
                        let statusColor = '#6c757d';
                        if (msStatus.toLowerCase() === 'received') statusColor = '#198754';
                        else if (msStatus.toLowerCase() === 'pending') statusColor = '#ffc107';
                        else if (msStatus.toLowerCase() === 'delayed') statusColor = '#dc3545';
                        
                        return `
                          <tr style="border-bottom: 1px solid #e9ecef;">
                            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${msIdx + 1}</td>
                            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${ms.milestone || '-'}</td>
                            <td style="padding: 10px; text-align: right; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${msStagePayment.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}%</td>
                            <td style="padding: 10px; text-align: right; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">₹${msInvoiceAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td style="padding: 10px; text-align: right; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">₹${msInvoiceRaised.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${msInvoiceDate}</td>
                            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0; font-family: Arial, Helvetica, sans-serif; font-size: 0.95rem;">${msInvoiceNumber}</td>
                            <td style="padding: 10px; text-align: center; border-right: 1px solid #f0f0f0;">
                              <span style="background: ${statusColor}; color: #fff; padding: 3px 6px; border-radius: 3px; font-size: 0.85rem; font-family: Arial, Helvetica, sans-serif;">${msStatus}</span>
                            </td>
                            <td style="padding: 10px; text-align: center;">
                              <div style="width: 50px; height: 20px; background: #e9ecef; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">
                                ${msMilestoneProgressPct}%
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        `;
      });
      
      projectsTableHTML += `
                </tbody>
              </table>
            </div>
          </div>
        </td>
      `;
      
      // Create and configure content row for projects
      const contentRow = document.createElement('tr');
      contentRow.id = contentId;
      contentRow.style.display = 'none';
      contentRow.style.backgroundColor = '#f8f9fa';
      contentRow.innerHTML = projectsTableHTML;
      // Preserve open state across periodic dashboard refreshes
      if (window.openDropdowns && window.openDropdowns.has(contentId)) {
        contentRow.style.display = 'table-row';
      }
      // Add click handler to prevent closing when clicking inside
      contentRow.addEventListener('click', function(e) {
        e.stopPropagation();
      });
      tbody.appendChild(contentRow);
      
      // Add event listeners for milestone View buttons
      const viewMilestoneButtons = contentRow.querySelectorAll('.view-btn-milestone');
      viewMilestoneButtons.forEach(button => {
        button.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          const dropdownId = this.getAttribute('data-dropdown-id');
          const dropdown = contentRow.querySelector(`#${dropdownId}`);
          const currentlyHidden = !dropdown || dropdown.style.display === 'none' || dropdown.style.display === '';
          // Use shared toggle so we track open dropdowns centrally
          window.toggleProjectMilestones(dropdownId);
          // Update button text based on previous state
          this.textContent = currentlyHidden ? 'Hide ▲' : 'View ▼';
        });
        // Preserve open state of nested milestone rows across refreshes
        const dropdownId = button.getAttribute('data-dropdown-id');
        if (window.openDropdowns && dropdownId && window.openDropdowns.has(dropdownId)) {
          button.textContent = 'Hide ▲';
          const dd = contentRow.querySelector(`#${dropdownId}`);
          if (dd) dd.style.display = 'table-row';
        }
      });
    });
    
    // Add Grand Total row
    const gtRow = document.createElement('tr');
    gtRow.className = 'summary-grandtotal-row';
    
    gtRow.innerHTML = `
      <td style="text-align: center; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">-</td>
      <td style="text-align: center; font-weight: 700; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">All</td>
      <td style="text-align: center; font-weight: 700; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">${grandTotalProjects}</td>
      <td style="text-align: right; font-weight: 700; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">₹${grandTotalPoValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td style="text-align: right; font-weight: 700; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">₹${grandTotalInvoiceRaised.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td style="text-align: right; font-weight: 700; font-family: Arial, Helvetica, sans-serif; font-size: 1rem;">₹${grandTotalPoPending.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
      <td style="text-align: center;">
        <button class="btn btn-sm btn-secondary" onclick="alert('Grand Total Edit - Summary data management')">Edit</button>
      </td>
    `;
    tbody.appendChild(gtRow);
  }
  
  // Simple global state to track which dropdowns are open
  window.openDropdowns = new Set();

  // Toggle function for summary type dropdown - SIMPLE AND RELIABLE
  window.toggleSummaryDropdown = function(contentId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const contentRow = document.getElementById(contentId);
    if (!contentRow) return false;
    
    const isOpen = window.openDropdowns.has(contentId);
    
    if (isOpen) {
      // Close it
      contentRow.style.display = 'none';
      window.openDropdowns.delete(contentId);
    } else {
      // Open it
      contentRow.style.display = 'table-row';
      window.openDropdowns.add(contentId);
      setTimeout(() => {
        contentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
    
    return false;
  };
  
  // Intentionally no outside-click auto-close for summary/milestone dropdowns.
  // They close only when the corresponding View/Hide button is clicked again.

  // Toggle function for project milestones dropdown - SIMPLE AND RELIABLE
  window.toggleProjectMilestones = function(contentId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const contentRow = document.getElementById(contentId);
    if (!contentRow) return false;
    
    const isOpen = window.openDropdowns.has(contentId);
    
    if (isOpen) {
      // Close it
      contentRow.style.display = 'none';
      window.openDropdowns.delete(contentId);
    } else {
      // Open it
      contentRow.style.display = 'table-row';
      window.openDropdowns.add(contentId);
      setTimeout(() => {
        contentRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
    
    return false;
  };

  // --- Tariff Petition chart integration ---
  function _readTariffMap() {
    try {
      const raw = localStorage.getItem('tariffPetitions') || '{}';
      return JSON.parse(raw || '{}');
    } catch (e) { return {}; }
  }

  function updateChartsWithTariffData(detail) {
    try {
      const map = _readTariffMap();
      const chartIds = ['pmcChart2','pmcChart3','pmcChart1'];
      chartIds.forEach(cid => {
        const ch = window[cid + 'Instance'] || (window.pmcChart && (window.pmcChart.id === cid ? window.pmcChart : null));
        // fallback to Chart.getChart
        let chart = ch;
        try { if (!chart) chart = Chart.getChart(document.getElementById(cid)); } catch(e){}
        if (!chart || !chart.data || !Array.isArray(chart.data.labels)) return;
        const labels = chart.data.labels || [];
        const cfields = labels.map(label => {
          const entries = Array.isArray(map[label]) ? map[label] : [];
          const sumReq = entries.reduce((s, it) => s + (Number(it.requestTariff || 0) || 0), 0);
          const sumApp = entries.reduce((s, it) => s + (Number(it.approvedTariff || 0) || 0), 0);
          const fields = [];
          if (entries.length) {
            fields.push({ name: 'Tariff Petitions', value: entries.length, unit: 'count' });
          }
          if (sumReq) fields.push({ name: 'Request Tariff (sum)', value: sumReq, unit: 'Rs/Kwh' });
          if (sumApp) fields.push({ name: 'Approved Tariff (sum)', value: sumApp, unit: 'Rs/Kwh' });
          return fields;
        });
        try {
          if (!chart.data.datasets[0]) chart.data.datasets[0] = chart.data.datasets[0] || {};
          chart.data.datasets[0].customFields = cfields;
          chart.update();
        } catch (e) { console.warn('Failed to attach tariff customFields to', cid, e); }
      });
    } catch (e) { console.warn('updateChartsWithTariffData failed', e); }
  }

  // Listen for updates from tariff UI and apply to charts
  window.addEventListener('tariffPetitionUpdated', function(e){
    try { updateChartsWithTariffData(e && e.detail ? e.detail : null); } catch (err) { console.warn(err); }
  });

  // Apply any existing tariff data on module load (if charts already present)
  try { setTimeout(() => updateChartsWithTariffData(), 300); } catch(e){}

  async function initAll(opts = {}) {
    const chart1Id = opts.chart1Id || 'pmcChart1';
    const chart2Id = opts.chart2Id || 'pmcChart2';
    const chart3Id = opts.chart3Id || 'pmcChart3';
    const summaryId = opts.summaryTbodyId || 'pmcSummaryTbody';
    // also fetch slice meta for the three segments so editor data appears on charts
    const segDpr = 'pmc_dpr';
    const segBms = 'pmc-bms';
    const segExec = 'pmc-execution';
    const [entries, ceEntities, sliceDpr, sliceBms, sliceExec] = await Promise.all([
      fetchPmcEntries(), fetchPmcCeEntities(), fetchPmcSliceMeta(segDpr), fetchPmcSliceMeta(segBms), fetchPmcSliceMeta(segExec)
    ]);
    // Store entries globally so toggleMilestones can access them
    window.globalPmcEntries = entries;
    try { renderDprPfrChart(chart1Id, entries, sliceDpr); } catch(e){console.warn(e);} 
    try { renderBmsChart(chart3Id, entries, sliceBms); } catch(e){console.warn(e);} 
    try { renderCeFieldsChart(chart2Id, ceEntities.concat(sliceExec || []), entries.concat(sliceExec || [])); } catch(e){console.warn(e);} 
    try { renderSummaryTable(summaryId, entries); } catch(e){console.warn(e);}
  }

  async function deletePmcEntry(entryId) {
    if (!entryId || !confirm('Are you sure you want to delete this PMC entry?')) return;
    
    try {
      const res = await authFetch(`/api/data/pmc/entry/delete/${entryId}`, { method: 'DELETE' });
      if (res.ok) {
        alert('PMC entry deleted successfully');
        // Refresh the page to reload data
        location.reload();
      } else {
        const err = await res.json().catch(() => ({ message: 'Failed to delete' }));
        alert('Error: ' + (err.message || 'Could not delete entry'));
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Error deleting entry: ' + e.message);
    }
  }

  window.pmcModule = {
    initAll,
    fetchPmcEntries,
    fetchPmcCeEntities,
    renderDprPfrChart,
    renderBmsChart,
    renderCeFieldsChart,
    renderSummaryTable
  };

  // Make deletePmcEntry globally available
  window.deletePmcEntry = deletePmcEntry;

  // Listen for external updates (e.g., slice editor saved) and refresh charts
  window.addEventListener('message', (ev) => {
    try {
      const d = ev.data || {};
      if (d && d.type === 'pmc_slice_saved') {
        // refresh with default ids
        setTimeout(() => { initAll(); }, 200);
      }
    } catch (e) { /* ignore */ }
  });

})();
