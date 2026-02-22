const express = require("express");
const router = express.Router();
const dataController = require("../controllers/data_controllers");
const { verifyToken, verifyAdmin } = require("../middleware/verify_token");
const auditLogger = require("../middleware/audit_logger");

// get all milestones for a specific entry
router.get(
  "/bd/milestone/one/:bd_entry_id",
  verifyToken,
  auditLogger("Viewed milestones for a Business Development entry"),
  dataController.getMilestonesByBusinessDevelopmentEntry,
);

router.put(
  "/bd/entry/edit/:bd_entry_id",
  verifyToken,
  auditLogger("Edited a Business Development entry"),
  dataController.editBusinessDevelopmentEntry,
);

router.put(
  "/bd/milestone/edit/:milestone_id",
  verifyToken,
  auditLogger("Edited a Business Development milestone"),
  dataController.editBusinessDevelopmentMilestone,
);

// get all business development entries
router.get(
  "/bd/entry/all",
  verifyToken,
  auditLogger("Viewed all entries in Business Development"),
  dataController.getAllBusinessDevelopmentEntries,
);

router.delete(
  "/bd/milestone/delete/:milestone_id",
  verifyToken,
  auditLogger("Deleted a Business Development milestones"),
  dataController.deleteBusinessDevelopmentMilestone,
);

router.delete(
  "/bd/entry/delete/:bd_entry_id",
  verifyToken,
  auditLogger("Deleted a business development entry"),
  dataController.deleteBusinessDevelopmentEntry,
);

// add a business development milestone
router.post(
  "/bd/milestone/add",
  verifyToken,
  auditLogger("Added entry in Business Development"),
  dataController.createBusinessDevelopmentMilestone,
);

// add a business development entry
router.post(
  "/bd/entry/add",
  verifyToken,
  auditLogger("Added entry in Business Development"),
  dataController.createBusinessDevelopmentEntry,
);

// Contracts Table related routes
router.post(
  "/contracts/add",
  verifyToken,
  auditLogger("Added and entry in the contracts table"),
  dataController.createEntryInContractsTable,
);

router.get(
  "/contracts/all",
  verifyToken,
  auditLogger("Viewed all contract table entries"),
  dataController.getEntriesFromContractsTable,
);

router.delete(
  "/contracts/remove/:entry_id",
  verifyToken,
  auditLogger("Deleted an entry from the contract table"),
  dataController.deleteEntryFromContractsTable,
);

router.get(
  "/mapping/all",
  verifyToken,
  verifyAdmin,
  auditLogger("Viewed all department to user mappings"),
  dataController.getUserDepartmentMappings,
);

// Departments
router.post(
  "/departments/create",
  verifyToken,
  verifyAdmin,
  auditLogger("Created a new department"),
  dataController.createDepartment,
);
router.get(
  "/departments/user/:user_id",
  verifyToken,
  auditLogger("Viewed departments assigned to a user"),
  dataController.getDepartmentsForUser,
);
router.get(
  "/departments/:dept_id",
  verifyToken,
  auditLogger("Viewed department details"),
  dataController.getDepartmentDetails,
);
router.get(
  "/departments",
  verifyToken,
  verifyAdmin,
  dataController.getAllDepartments,
);
router.post(
  "/departments",
  verifyToken,
  auditLogger("Added a new department"),
  dataController.addDepartment,
);
router.put(
  "/departments/:dept_id",
  verifyToken,
  auditLogger("Edited department details"),
  dataController.editDepartment,
);
router.delete(
  "/departments/:dept_id",
  verifyToken,
  verifyAdmin,
  auditLogger("Deleted a department"),
  dataController.deleteDepartment,
);
router.put(
  "/departments/headcount/:dept_id",
  verifyToken,
  verifyAdmin,
  auditLogger("Updated department headcount"),
  dataController.editHeadCount,
);
router.put(
  "/departments/manage/:dept_id",
  verifyToken,
  verifyAdmin,
  auditLogger("Changed department status (enabled/disabled)"),
  dataController.manageDepartment,
);

// Statistics
router.get(
  "/statistics/:dept_id",
  verifyToken,
  auditLogger("Viewed all statistics for a department"),
  dataController.getAllStatistics,
);
router.post(
  "/statistics",
  verifyToken,
  auditLogger("Added a new statistic"),
  dataController.addStatistic,
);
router.put(
  "/statistics/:dept_id/:statistic_id",
  verifyToken,
  auditLogger("Updated statistic details"),
  dataController.editStatistic,
);
router.delete(
  "/statistics/:dept_id/:statistic_id",
  verifyToken,
  auditLogger("Deleted a statistic"),
  dataController.deleteStatistic,
);
router.post(
  "/statistics/home/:dept_id/:statistic_id",
  verifyToken,
  auditLogger("Set statistic to be shown on homepage"),
  dataController.setHomeStatistic,
);

// Entities
router.get(
  "/entities/:dept_id/:statistic_id",
  verifyToken,
  auditLogger("Viewed entities for a department & statistic"),
  dataController.getAllEntities,
);
router.post(
  "/entities",
  verifyToken,
  auditLogger("Added a new entity"),
  dataController.addEntity,
);
router.put(
  "/entities/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  auditLogger("Updated entity details"),
  dataController.editEntity,
);
router.delete(
  "/entities/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  auditLogger("Deleted an entity"),
  dataController.deleteEntity,
);

// Documents
router.get(
  "/documents/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  auditLogger("Viewed documents for an entity"),
  dataController.getAllDocuments,
);
router.get(
  "/documents/single/:dept_id",
  verifyToken,
  auditLogger("Viewed contract-related documents"),
  dataController.getContractDocuments,
);
router.put(
  "/documents/:dept_id/:statistic_id/:entity_id/:doc_id",
  verifyToken,
  auditLogger("Updated a document"),
  dataController.editDocument,
);
router.delete(
  "/documents/:doc_id",
  verifyToken,
  auditLogger("Deleted a document"),
  dataController.deleteDocument,
);
router.get(
  "/documents/grouped/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  auditLogger("Viewed grouped documents by statistic"),
  dataController.getGroupedDocumentsByStatistic,
);

// Correspondences
router.get(
  "/correspondences/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  auditLogger("Viewed correspondences for an entity"),
  dataController.getAllCorrespondences,
);
router.put(
  "/correspondences/:dept_id/:statistic_id/:entity_id/:correspondence_id",
  verifyToken,
  auditLogger("Updated a correspondence"),
  dataController.editCorrespondence,
);
router.delete(
  "/correspondences/:correspondence_id",
  verifyToken,
  auditLogger("Deleted a correspondence"),
  dataController.deleteCorrespondence,
);
router.get(
  "/correspondences/single/:dept_id",
  verifyToken,
  auditLogger("Viewed department-level correspondences"),
  dataController.getCorrespondencesForDepartment,
);

// Issues
router.delete(
  "/issues/:issue_id",
  verifyToken,
  auditLogger("Deleted a reported issue"),
  dataController.deleteIssue,
);

// Fields
router.get(
  "/fields/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  auditLogger("Viewed custom fields for an entity"),
  dataController.getFieldsForDepartmentEntityStatistic,
);

// Combined create/edit statistic
router.post(
  "/combined/newstat/:dept_id/:user_id",
  verifyToken,
  auditLogger("Created new statistic with department, entity and fields"),
  dataController.createNewStatisticWithDepartmentEntityFields,
);
router.put(
  "/combined/newstat/:dept_id/:statistic_id",
  verifyToken,
  auditLogger("Edited statistic along with associated data"),
  dataController.editNewStatisticWithDepartmentEntityFields,
);

/**
 * O&M routes
 */

router.get(
  "/om/all/data",
  verifyToken,
  auditLogger("Get O&M Data for particular date"),
  dataController.getOMProjectsByDate,
);

router.post(
  "/om/new/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  auditLogger("Created a new entry in O&M"),
  dataController.addOMDGR,
);

router.get(
  "/om/get/filtered/:dept_id/:statistic_id/:entity_id",
  verifyToken,
  auditLogger("Viewed O&M entries for a specific project"),
  dataController.getFilteredActiveOMDGRs,
);

router.delete(
  "/om/remove/:om_dgr_id",
  verifyToken,
  auditLogger("Deleted a DGR in O&M"),
  dataController.deleteOMDGR,
);

router.put(
  "/om/edit/:om_dgr_id",
  verifyToken,
  auditLogger("Edited a DGR in O&M"),
  dataController.editOMDGR,
);

router.get(
  "/reia/documents/all",
  verifyToken,
  auditLogger("Viewed all REIA details"),
  dataController.getREIAData,
);

router.get(
  "/om/mapping/check",
  verifyToken,
  auditLogger("Checked an O&M Project Mapping"),
  dataController.checkOMProjectTypeMapping,
);

router.get(
  "/om/mapping/assign",
  verifyToken,
  auditLogger("Assigned mapping to a project type"),
  dataController.assignOMProjectMapping,
);

router.get(
  "/project/find/name",
  verifyToken,
  auditLogger("Fetched the project name"),
  dataController.getProjectName,
);

router.get(
  "/om/solar_bess/all",
  verifyToken,
  auditLogger("Fetched all OM Solar+BESS entries"),
  dataController.getOAllMSolarBESSData,
);

router.post(
  "/om/solar_bess/date/one",
  verifyToken,
  auditLogger("Fetched the OM Solar+BESS data for a specific date"),
  dataController.getOMSolarBESSDataForDate,
);

router.post(
  "/om/solar_bess/data/one/update",
  verifyToken,
  auditLogger("Updated the OM Solar+BESS data for a specific date"),
  dataController.updateOMDGRSolarBESSForOneDate,
);

router.post(
  "/om/solar/data/one/update",
  verifyToken,
  auditLogger("Updated the OM Solar data for a specific date"),
  dataController.updateOMDGRSolarForOneDate,
);

router.post(
  "/om/solar/date/one",
  verifyToken,
  auditLogger("Fetched the OM Solar data for a specific date"),
  dataController.getOMSolarDataForDate,
);

router.get(
  "/om/project/capacity",
  verifyToken,
  auditLogger("Get project capacity"),
  dataController.getProjectCapacity,
);

router.get(
  "/om/solar/excel",
  verifyToken,
  auditLogger("Download Excel"),
  dataController.downloadOMSolarExcel,
);

router.get(
  "/om/solar_bess/excel",
  verifyToken,
  auditLogger("Download Excel"),
  dataController.downloadOMSolarBESSExcel,
);

router.get(
  "/get/issues_action",
  verifyToken,
  auditLogger("Get Key Issues and Action Plan"),
  dataController.getIssuesAndActionPlan,
);

router.post(
  "/upsert/issues_action",
  verifyToken,
  auditLogger("Upsert Key Issues and Action Plan"),
  dataController.upsertIssuesAndActionPlan,
);

router.get(
  "/get/all/issues_action",
  // verifyToken,
  auditLogger("Get All Key Issues and Action Plan"),
  dataController.getAllIssuesAndActions,
);

module.exports = router;
