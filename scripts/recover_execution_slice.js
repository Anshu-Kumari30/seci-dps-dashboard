const { v5: uuidv5 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize, models } = require('../models');

const EXECUTION_ENTITY_NAMESPACE = '8b58c497-6e6e-4b3c-a59d-0bf40f269f88';

function normalizeProjectKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function buildExecutionEntityId(projectName) {
  const normalized = normalizeProjectKey(projectName);
  if (!normalized) return null;
  return uuidv5(`pmc-execution:${normalized}`, EXECUTION_ENTITY_NAMESPACE);
}

function collectRecoveryProjects(projectRows) {
  const manual = [
    'Abhay', 'ny', 'Deloitte', 'ny3', 'san Francisco', 'Texas', 'ny4', 'ceeri',
    'ny2', 'test', 'ny5', 'Excess', 'Newyork5', 'google', 'Apsara  Pencil',
    'Apsara pencil', 'main2', 'Sapien2346', 'main3', 'Sapien7890'
  ];

  const merged = new Map();

  const add = (name, loaDate, scod) => {
    const projectName = String(name || '').trim();
    if (!projectName) return;
    const key = normalizeProjectKey(projectName);
    if (!key) return;

    const prev = merged.get(key) || {};
    merged.set(key, {
      project_name: projectName,
      loa_date: prev.loa_date || loaDate || null,
      scod: prev.scod || scod || null,
    });
  };

  manual.forEach((n) => add(n, null, null));

  for (const p of projectRows) {
    add(
      p.project_name || p.client || p.project_details,
      p.loa_date || null,
      p.target_date || null
    );
  }

  return Array.from(merged.values());
}

async function run() {
  await sequelize.authenticate();

  const projectRows = await models.PmcProject.findAll({
    where: {
      service_type: { [Op.in]: ['Execution', 'EXECUTION', 'C&E'] },
    },
    attributes: ['project_name', 'client', 'project_details', 'loa_date', 'target_date'],
    raw: true,
  });

  const recoveryProjects = collectRecoveryProjects(projectRows);

  let createdSlice = 0;
  let updatedSlice = 0;
  let createdExec = 0;
  let updatedExec = 0;

  for (const p of recoveryProjects) {
    const stableId = buildExecutionEntityId(p.project_name);
    if (!stableId) continue;

    const existingSlice = await models.PmcSliceMeta.findOne({
      where: { segment: 'pmc-execution', project_name: p.project_name },
    });

    if (existingSlice) {
      await existingSlice.update({
        pmc_entry_id: stableId,
        loa_date: existingSlice.loa_date || p.loa_date || null,
        scod: existingSlice.scod || p.scod || null,
      });
      updatedSlice += 1;
    } else {
      await models.PmcSliceMeta.create({
        segment: 'pmc-execution',
        pmc_entry_id: stableId,
        project_name: p.project_name,
        project_capacity: 0,
        number_of_projects: 1,
        loa_date: p.loa_date || null,
        scod: p.scod || null,
        land: null,
        fields: [],
      });
      createdSlice += 1;
    }

    const existingExec = await models.PmcExecutionMeta.findOne({
      where: { segment: 'pmc-execution', project_name: p.project_name },
    });

    if (existingExec) {
      await existingExec.update({
        pmc_entry_id: stableId,
        loa_date: existingExec.loa_date || p.loa_date || null,
        scod: existingExec.scod || p.scod || null,
      });
      updatedExec += 1;
    } else {
      await models.PmcExecutionMeta.create({
        segment: 'pmc-execution',
        pmc_entry_id: stableId,
        project_name: p.project_name,
        project_capacity: null,
        loa_date: p.loa_date || null,
        scod: p.scod || null,
        land: null,
        fields: [],
      });
      createdExec += 1;
    }
  }

  const cntS = await models.PmcSliceMeta.count({ where: { segment: 'pmc-execution' } });
  const cntE = await models.PmcExecutionMeta.count({ where: { segment: 'pmc-execution' } });

  console.log(JSON.stringify({
    recoveredProjects: recoveryProjects.length,
    createdSlice,
    updatedSlice,
    createdExec,
    updatedExec,
    sliceCount: cntS,
    executionMetaCount: cntE,
  }, null, 2));

  await sequelize.close();
}

run().catch(async (err) => {
  console.error(err);
  try { await sequelize.close(); } catch (e) {}
  process.exit(1);
});
