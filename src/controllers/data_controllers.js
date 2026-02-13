const {
  DeptMaster,
  DeptStatistic,
  DeptEntity,
  EntityDocs,
  EntityCorrespondence,
  UserEditAccess,
  EntityFields,
  EntityIssues,
  User,
  ContractsTable,
  BusinessDevelopmentTable,
  BusinessDevelopmentMilestones,
  OMDGR,
  REIADocuments,
  OMProjectTypeMapping,
  OMDGRSolarBESS,
  OMDGRSolar,
  OmProjectTypeIssuesActions,
  StateWiseData,
} = require("../models").models;

const { Sequelize, Op } = require("sequelize");
const { streamExcel } = require("../utils/helper");

exports.getMilestonesByBusinessDevelopmentEntry = async (req, res) => {
  try {
    const { bd_entry_id } = req.params;

    if (!bd_entry_id) {
      return res.status(400).json({
        success: false,
        message: "bd_entry_id is required in the URL.",
      });
    }

    const milestones = await BusinessDevelopmentMilestones.findAll({
      where: { bd_entry_id },
      order: [["milestone_date", "ASC"]], // Optional: order by date
    });

    return res.status(200).json({
      success: true,
      message: `Milestones for bd_entry_id ${bd_entry_id} fetched successfully.`,
      data: milestones,
    });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching milestones.",
      error: error.message,
    });
  }
};

exports.editBusinessDevelopmentEntry = async (req, res) => {
  try {
    const { bd_entry_id } = req.params;

    // Extract fields from request body
    const {
      business_partner,
      location,
      action_plan,
      action_pending_with,
      anticipated_capacity,
      target,
    } = req.body;

    // Check if the entry exists
    const entry = await BusinessDevelopmentTable.findByPk(bd_entry_id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Business development entry not found.",
      });
    }

    // Update the entry
    await entry.update({
      business_partner,
      location,
      action_plan,
      action_pending_with,
      anticipated_capacity,
      target,
    });

    return res.status(200).json({
      success: true,
      message: "Entry updated successfully.",
      data: entry,
    });
  } catch (error) {
    console.error("Error updating business development entry:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the entry.",
      error: error.message,
    });
  }
};

exports.editBusinessDevelopmentMilestone = async (req, res) => {
  try {
    const { milestone_id } = req.params;

    // Extract fields from request body
    const { milestone_name, milestone_date, is_active } = req.body;

    // Find milestone by primary key (milestone_id)
    const milestone = await BusinessDevelopmentMilestones.findOne({
      where: { milestone_id },
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found.",
      });
    }

    // Update the milestone fields
    await milestone.update({
      milestone_name,
      milestone_date,
      is_active,
    });

    return res.status(200).json({
      success: true,
      message: "Milestone updated successfully.",
      data: milestone,
    });
  } catch (error) {
    console.error("Error updating milestone:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the milestone.",
      error: error.message,
    });
  }
};

exports.getAllBusinessDevelopmentEntries = async (req, res) => {
  try {
    const entries = await BusinessDevelopmentTable.findAll();

    return res.status(200).json({
      success: true,
      message: "Business development entries fetched successfully.",
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching business development entries:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching entries.",
      error: error.message,
    });
  }
};

exports.createBusinessDevelopmentMilestone = async (req, res) => {
  try {
    const {
      bd_entry_id,
      milestone_name,
      milestone_date,
      is_active = true, // default true if not provided
    } = req.body;

    // Validate required fields
    if (!bd_entry_id || !milestone_name || !milestone_date) {
      return res.status(400).json({
        success: false,
        message:
          "bd_entry_id, milestone_name, and milestone_date are required.",
      });
    }

    // Check if bd_entry_id exists in bd_table
    const existingEntry = await BusinessDevelopmentTable.findByPk(bd_entry_id);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message:
          "No business development entry found with the given bd_entry_id.",
      });
    }

    // Create the milestone
    const newMilestone = await BusinessDevelopmentMilestones.create({
      bd_entry_id,
      milestone_name,
      milestone_date,
      is_active,
    });

    return res.status(201).json({
      success: true,
      message: "Milestone created successfully.",
      data: newMilestone,
    });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the milestone.",
      error: error.message,
    });
  }
};

/**
 * Controller to create a Business Development Entry
 *
 */
exports.createBusinessDevelopmentEntry = async (req, res) => {
  try {
    const {
      business_partner,
      location,
      action_plan,
      action_pending_with,
      anticipated_capacity,
      target,
    } = req.body;

    // Basic validation
    if (
      !business_partner ||
      !location ||
      !action_plan ||
      !action_pending_with ||
      !anticipated_capacity ||
      !target
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Create new entry
    const newEntry = await BusinessDevelopmentTable.create({
      business_partner,
      location,
      action_plan,
      action_pending_with,
      anticipated_capacity,
      target,
    });

    return res.status(201).json({
      success: true,
      message: "Business development entry created successfully.",
      data: newEntry,
    });
  } catch (error) {
    console.error("Error creating BD entry:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the entry.",
      error: error.message,
    });
  }
};

exports.deleteBusinessDevelopmentEntry = async (req, res) => {
  try {
    const { bd_entry_id } = req.params;

    // Validate bd_entry_id
    if (!bd_entry_id) {
      return res.status(400).json({
        success: false,
        message: "Business development entry ID is required.",
      });
    }

    // Find and delete the entry
    const deletedEntry = await BusinessDevelopmentTable.destroy({
      where: { bd_entry_id },
    });

    // Check if an entry was deleted
    if (!deletedEntry) {
      return res.status(404).json({
        success: false,
        message: "Business development entry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Business development entry deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting BD entry:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the entry.",
      error: error.message,
    });
  }
};

exports.deleteBusinessDevelopmentMilestone = async (req, res) => {
  try {
    const { milestone_id } = req.params;

    const deletedCount = await BusinessDevelopmentMilestones.destroy({
      where: {
        milestone_id,
      },
    });

    if (deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Milestone not found or already deleted.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Milestone deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting milestone", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the milestone.",
      error: error.message,
    });
  }
};

/**
 * Controller to get user-to-department access mappings.
 *
 * @route GET /api/user-access-mappings
 * @returns {Object} JSON object in the format:
 *   {
 *     "Alice": ["Finance", "HR"],
 *     "Bob": ["IT"]
 *   }
 * @access Protected (depends on your middleware)
 */
exports.getUserDepartmentMappings = async (req, res) => {
  try {
    // Fetch all user-department mappings
    const userDepartmentMappings = await UserEditAccess.findAll();

    const mappingMap = new Map();

    for (const mapping of userDepartmentMappings) {
      const { user_id, dept_id } = mapping;

      // Fetch department name
      const dept = await DeptMaster.findOne({
        where: { dept_id },
        attributes: ["dept_name"],
      });

      // Fetch user name
      const user = await User.findOne({
        where: { user_id },
        attributes: ["name"],
      });

      // Skip if either record is missing (possible orphaned FK)
      if (!dept || !user) continue;

      const userName = user.name;
      const deptName = dept.dept_name;

      // Add or update entry in the map
      if (mappingMap.has(userName)) {
        mappingMap.get(userName).push(deptName);
      } else {
        mappingMap.set(userName, [deptName]);
      }
    }

    // Convert Map to plain JSON-compatible object
    const result = Object.fromEntries(mappingMap);

    // Send the result
    res.json(result);
  } catch (error) {
    console.error("Error in getUserDepartmentMappings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ========== GROUPED DOCUMENTS BY STATISTIC ==========
exports.getGroupedDocumentsByStatistic = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;

    const statisticExists = await DeptStatistic.findOne({
      where: { dept_id, statistic_id, is_active: true },
    });

    if (!statisticExists)
      return res.json({ documents: [], correspondences: [], issues: [], stateWiseData: [] });

    const [docs, corrs, issues, stateWiseData] = await Promise.all([
      EntityDocs.findAll({
        where: {
          dept_id,
          statistic_id,
          entity_id,
          is_active: true,
        },
      }),
      EntityCorrespondence.findAll({
        where: {
          dept_id,
          statistic_id,
          entity_id,
          is_active: true,
        },
      }),
      EntityIssues.findAll({
        where: {
          dept_id,
          statistic_id,
          entity_id,
          is_active: true,
        },
      }),
      StateWiseData.findAll({
        where: {
          dept_id,
          statistic_id,
          entity_id,
          is_active: true,
        },
      }),
    ]);

    res.json({
      documents: docs,
      correspondences: corrs,
      issues: issues,
      stateWiseData: stateWiseData,
    });
  } catch (err) {
    console.error("Error in getGroupedDocumentsByStatistic:", err);
    res.status(500).json({ error: "Failed to fetch grouped documents" });
  }
};

// ========== ISSUES ==========
exports.deleteIssue = async (req, res) => {
  try {
    const { issue_id } = req.params;

    await EntityIssues.update(
      { is_active: false },
      {
        where: {
          issue_id: issue_id,
        },
      },
    );
    res.json({ message: "Issue deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to issue" });
  }
};

// ========== DEPARTMENTS ==========
exports.createDepartment = async (req, res) => {
  try {
    const { dept_name } = req.body;

    // Validate required field
    if (!dept_name) {
      return res.status(400).json({ error: "Department name is required" });
    }

    const newDepartment = await DeptMaster.create({
      dept_name,
      // Other fields use default values from the model definition
    });

    return res.status(201).json({
      message: "Department created successfully",
      department: newDepartment,
    });
  } catch (error) {
    console.error("Error creating department:", error);
    return res.status(500).json({
      error: "An error occurred while creating the department",
    });
  }
};

exports.manageDepartment = async (req, res) => {
  try {
    const { dept_id } = req.params;
    const { is_active } = req.body;
    await DeptMaster.update({ is_active: is_active }, { where: { dept_id } });
    //log it
    res.json({ message: "Department Status updated" });
  } catch (err) {
    console.error("Error updating department:", err);
    res.status(500).json({ error: "Failed to update department" });
  }
};

exports.editHeadCount = async (req, res) => {
  try {
    const { dept_id } = req.params;
    const { yp_count, regular_count, contractual_count } = req.body;
    await DeptMaster.update(
      {
        yp_count: yp_count,
        regular_count: regular_count,
        contractual_count: contractual_count,
      },
      {
        where: { dept_id },
      },
    );
    res.json({ message: "Edited headcount successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to edit headcount" });
  }
};

exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await DeptMaster.findAll({
      attributes: [
        "dept_id",
        "dept_name",
        "regular_count",
        "yp_count",
        "contractual_count",
        "is_active",
      ],
    });
    res.status(200).json(departments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
};
exports.getDepartmentsForUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const accessList = await UserEditAccess.findAll({
      where: { user_id },
      attributes: ["dept_id"],
    });

    const deptIds = accessList.map((item) => item.dept_id);

    const departments = await DeptMaster.findAll({
      where: {
        dept_id: deptIds,
        is_active: true,
      },
      attributes: [
        "dept_id",
        "dept_name",
        "regular_count",
        "yp_count",
        "contractual_count",
      ],
    });

    const deptResponse = departments.map((item) => item.dept_id);

    res.json({ departments: deptResponse });
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments for user" });
  }
};

exports.getDepartmentDetails = async (req, res) => {
  try {
    const { dept_id } = req.params;
    const department = await DeptMaster.findOne({
      where: { dept_id: dept_id, is_active: true },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    res.status(200).json(department);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch department details" });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const dept = await DeptMaster.create(req.body);
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: "Failed to add department" });
  }
};

exports.editDepartment = async (req, res) => {
  try {
    const { dept_id } = req.params;
    await DeptMaster.update(req.body, { where: { dept_id } });
    res.json({ message: "Department updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update department" });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { dept_id } = req.params;
    await DeptMaster.update({ is_active: false }, { where: { dept_id } });
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete department" });
  }
};

// ========== STATISTICS ==========

//toggle showing statistics in the home screen
exports.setHomeStatistic = async (req, res) => {
  try {
    const { dept_id, statistic_id } = req.params;

    // Step 1: Reset all statistics for the department
    await DeptStatistic.update(
      { is_shown_on_home: false },
      { where: { dept_id } },
    );

    // Step 2: Set the selected statistic to true
    await DeptStatistic.update(
      { is_shown_on_home: true },
      { where: { dept_id, statistic_id } },
    );

    res.json({ success: true, message: "Home statistic updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllStatistics = async (req, res) => {
  //get all statistics for a specific department
  try {
    const { dept_id } = req.params;
    const statistics = await DeptStatistic.findAll({
      where: { dept_id: dept_id, is_active: true },
    });
    res.status(200).json(statistics);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

exports.addStatistic = async (req, res) => {
  try {
    const stat = await DeptStatistic.create(req.body);
    res.json(stat);
  } catch (err) {
    res.status(500).json({ error: "Failed to add statistic" });
  }
};

exports.editStatistic = async (req, res) => {
  try {
    const { dept_id, statistic_id } = req.params;
    await DeptStatistic.update(req.body, { where: { dept_id, statistic_id } });
    res.json({ message: "Statistic updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update statistic" });
  }
};

exports.deleteStatistic = async (req, res) => {
  try {
    const { dept_id, statistic_id } = req.params;
    await DeptStatistic.update(
      { is_active: false },
      {
        where: { dept_id, statistic_id },
      },
    );
    res.json({ message: "Statistic deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete statistic" });
  }
};

// ========== ENTITIES ==========

exports.getAllEntities = async (req, res) => {
  try {
    const { dept_id, statistic_id } = req.params;
    const entities = await DeptEntity.findAll({
      where: { dept_id: dept_id, statistic_id: statistic_id, is_active: true },
    });
    res.status(200).json(entities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entities" });
  }
};

exports.addEntity = async (req, res) => {
  try {
    const entity = await DeptEntity.create(req.body);
    res.json(entity);
  } catch (err) {
    res.status(500).json({ error: "Failed to add entity" });
  }
};

exports.editEntity = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;
    await DeptEntity.update(req.body, {
      where: { dept_id, statistic_id, entity_id },
    });
    res.json({ message: "Entity updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update entity" });
  }
};

exports.deleteEntity = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;
    await DeptEntity.update(
      { is_active: false },
      {
        where: { dept_id, statistic_id, entity_id },
      },
    );
    res.json({ message: "Entity deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete entity" });
  }
};

// ========== DOCUMENTS ==========

exports.getAllDocuments = async (req, res) => {
  try {
    const { dept_id, statistic_id } = req.params;
    const documents = await EntityDocs.findAll({
      where: { dept_id, statistic_id },
    });
    res.status(200).json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

exports.getContractDocuments = async (req, res) => {
  try {
    const { dept_id } = req.params;

    // 1. Get active statistics for dept_id
    const statistics = await DeptStatistic.findAll({
      where: { dept_id, is_active: true },
      attributes: ["statistic_id"],
    });

    const statIds = statistics.map((stat) => stat.statistic_id);
    if (statIds.length === 0) return res.json([]);

    // 3. Fetch all documents in one go
    const docs = await EntityDocs.findAll({
      where: {
        dept_id,
        statistic_id: entities.map((e) => e.statistic_id),
        // Uncomment if needed:
        // is_active: true
      },
    });

    res.json(docs);
  } catch (err) {
    console.error("Error in getContractDocuments:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.editDocument = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id, doc_id } = req.params;
    await EntityDoc.update(req.body, {
      where: { dept_id, statistic_id, entity_id, doc_id },
    });
    res.json({ message: "Document updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update document" });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { doc_id } = req.params;
    await EntityDocs.update(
      { is_active: false },
      {
        where: { doc_id: doc_id },
      },
    );
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete document" });
  }
};

// ========== CORRESPONDENCES ==========

exports.getAllCorrespondences = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;
    const correspondences = await EntityCorrespondence.findAll({
      where: {
        dept_id: dept_id,
        statistic_id: statistic_id,
        is_active: true,
      },
    });
    res.status(200).json(correspondences);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch correspondences" });
  }
};

exports.getCorrespondencesForDepartment = async (req, res) => {
  try {
    const { dept_id } = req.params;

    // 1. Find all active statistics for the department
    const statistics = await DeptStatistic.findAll({
      where: { dept_id, is_active: true },
      attributes: ["statistic_id"],
    });

    const statIds = statistics.map((stat) => stat.statistic_id);
    if (statIds.length === 0) return res.json([]);

    // 3. Find all active correspondences for those entities
    const correspondences = await EntityCorrespondence.findAll({
      where: {
        dept_id,
        statistic_id: entities.map((e) => e.statistic_id),

        is_active: true,
      },
    });

    res.json(correspondences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch correspondences" });
  }
};

exports.editCorrespondence = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id, correspondence_id } = req.params;
    await EntityCorrespondence.update(req.body, {
      where: { dept_id, statistic_id, entity_id, correspondence_id },
    });
    res.json({ message: "Correspondence updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update correspondence" });
  }
};

exports.deleteCorrespondence = async (req, res) => {
  try {
    const { correspondence_id } = req.params;
    await EntityCorrespondence.update(
      { is_active: false },
      {
        where: { correspondence_id: correspondence_id },
      },
    );
    res.json({ message: "Correspondence deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete correspondence" });
  }
};

// ========== FIELDS ==========
exports.getFieldsForDepartmentEntityStatistic = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;
    const foundEntityFields = await EntityFields.findAll({
      where: {
        dept_id: dept_id,
        statistic_id: statistic_id,
        entity_id: entity_id,
        is_active: true,
      },
    });
    res.json(foundEntityFields);
  } catch (err) {
    res.status(500).json({ error: "Failed to get entity fields" });
  }
};

//edit an existing statistic along with its entities and fields
// exports.editNewStatisticWithDepartmentEntityFields = async (req, res) => {
//   const { dept_id, statistic_id } = req.params;
//   const { statistic_name, entities } = req.body;

//   if (!Array.isArray(entities)) {
//     return res.status(400).json({ error: "Entities must be an array" });
//   }

//   const transaction = await DeptStatistic.sequelize.transaction();

//   try {
//     // Validate statistic_name
//     if (!statistic_name || !statistic_name.trim()) {
//       await transaction.rollback();
//       return res.status(400).json({ error: "Statistic name is required" });
//     }

//     // Update statistic name
//     await DeptStatistic.update(
//       { statistic_name: statistic_name.trim() },
//       { where: { dept_id, statistic_id }, transaction }
//     );

//     // Fetch all current entities with fields
//     const existingEntities = await DeptEntity.findAll({
//       where: { dept_id, statistic_id, is_active: true },
//       include: [
//         {
//           model: EntityFields,
//           as: "fields",
//           where: { is_active: true },
//           required: false,
//         },
//       ],
//       transaction,
//     });

//     // Collect entity IDs sent from client (to detect deletions)
//     const incomingEntityIds = entities
//       .filter((e) => e.entity_id)
//       .map((e) => e.entity_id);

//     // Soft-delete entities removed by client
//     for (const dbEntity of existingEntities) {
//       if (!incomingEntityIds.includes(dbEntity.entity_id)) {
//         await dbEntity.update({ is_active: false }, { transaction });

//         // Also deactivate related fields
//         await EntityFields.update(
//           { is_active: false },
//           { where: { entity_id: dbEntity.entity_id }, transaction }
//         );
//       }
//     }

//     // Process each incoming entity
//     for (const entity of entities) {
//       // Validate entity fields array
//       if (!Array.isArray(entity.fields)) {
//         await transaction.rollback();
//         return res
//           .status(400)
//           .json({ error: "Each entity must have an array of fields" });
//       }

//       // Validate required entity fields
//       if (!entity.entity_name || typeof entity.entity_value !== "number") {
//         await transaction.rollback();
//         return res.status(400).json({
//           error: "Entity name (string) and numeric entity value are required",
//         });
//       }

//       let entityRecord;

//       if (entity.entity_id) {
//         // Update existing entity
//         entityRecord = await DeptEntity.findOne({
//           where: { dept_id, statistic_id, entity_id: entity.entity_id },
//           transaction,
//         });

//         if (!entityRecord) {
//           await transaction.rollback();
//           return res
//             .status(400)
//             .json({ error: `Entity with id ${entity.entity_id} not found` });
//         }

//         await entityRecord.update(
//           {
//             entity_name: entity.entity_name.trim(),
//             entity_value: entity.entity_value,
//             is_active: true,
//           },
//           { transaction }
//         );
//       } else {
//         // Create new entity or reactivate existing by name
//         const [createdEntity, created] = await DeptEntity.findOrCreate({
//           where: {
//             dept_id,
//             statistic_id,
//             entity_name: entity.entity_name.trim(),
//           },
//           defaults: {
//             entity_value: entity.entity_value,
//             is_active: true,
//           },
//           transaction,
//         });

//         if (!created) {
//           await createdEntity.update(
//             { entity_value: entity.entity_value, is_active: true },
//             { transaction }
//           );
//         }

//         entityRecord = createdEntity;
//       }

//       // Fetch existing active fields for this entity
//       const existingFields = await EntityFields.findAll({
//         where: { entity_id: entityRecord.entity_id, is_active: true },
//         transaction,
//       });

//       const incomingFieldIds = entity.fields
//         .filter((f) => f.field_id)
//         .map((f) => f.field_id);

//       // Soft-delete removed fields
//       for (const dbField of existingFields) {
//         if (!incomingFieldIds.includes(dbField.field_id)) {
//           await dbField.update({ is_active: false }, { transaction });
//         }
//       }

//       // Process each field for this entity
//       for (const field of entity.fields) {
//         // Validate required field fields
//         if (!field.field_name || field.field_value === undefined) {
//           await transaction.rollback();
//           return res.status(400).json({
//             error: "Field name and field value are required",
//           });
//         }

//         if (field.field_id) {
//           // Update existing field
//           await EntityFields.update(
//             {
//               field_name: field.field_name.trim(),
//               field_value: field.field_value,
//               field_unit: field.field_unit ? field.field_unit.trim() : "MW",
//               is_active: true,
//             },
//             {
//               where: {
//                 entity_id: entityRecord.entity_id,
//                 field_id: field.field_id,
//               },
//               transaction,
//             }
//           );
//         } else {
//           // Create new field or reactivate existing by name
//           const [createdField, created] = await EntityFields.findOrCreate({
//             where: {
//               entity_id: entityRecord.entity_id,
//               field_name: field.field_name.trim(),
//             },
//             defaults: {
//               dept_id, // add this
//               statistic_id,
//               field_value: field.field_value,
//               field_unit: field.field_unit ? field.field_unit.trim() : "MW",
//               is_active: true,
//             },
//             transaction,
//           });

//           if (!created) {
//             await createdField.update(
//               {
//                 field_value: field.field_value,
//                 field_unit: field.field_unit ? field.field_unit.trim() : "MW",
//                 is_active: true,
//               },
//               { transaction }
//             );
//           }
//         }
//       }
//     }

//     await transaction.commit();

//     return res.status(200).json({
//       message: "Statistic and related entities updated successfully",
//     });
//   } catch (err) {
//     await transaction.rollback();
//     console.error(err);
//     return res.status(500).json({
//       error: "Failed to update statistic with entities and fields",
//       details: err.message,
//     });
//   }
// };

// Edit an existing statistic along with its entities and fields
exports.editNewStatisticWithDepartmentEntityFields = async (req, res) => {
  const { dept_id, statistic_id } = req.params;
  const { statistic_name, entities } = req.body;

  if (!Array.isArray(entities)) {
    return res.status(400).json({ error: "Entities must be an array" });
  }

  const transaction = await DeptStatistic.sequelize.transaction();

  try {
    // Validate statistic_name
    if (!statistic_name || !statistic_name.trim()) {
      await transaction.rollback();
      return res.status(400).json({ error: "Statistic name is required" });
    }

    // Update statistic name
    await DeptStatistic.update(
      { statistic_name: statistic_name.trim() },
      { where: { dept_id, statistic_id }, transaction },
    );

    // Fetch all current entities with fields
    const existingEntities = await DeptEntity.findAll({
      where: { dept_id, statistic_id, is_active: true },
      include: [
        {
          model: EntityFields,
          as: "fields",
          where: { is_active: true },
          required: false,
        },
      ],
      transaction,
    });

    // Collect entity IDs sent from client (to detect deletions)
    const incomingEntityIds = entities
      .filter((e) => e.entity_id)
      .map((e) => e.entity_id);

    // Soft-delete entities removed by client
    for (const dbEntity of existingEntities) {
      if (!incomingEntityIds.includes(dbEntity.entity_id)) {
        await dbEntity.update({ is_active: false }, { transaction });

        // Also deactivate related fields
        await EntityFields.update(
          { is_active: false },
          { where: { entity_id: dbEntity.entity_id }, transaction },
        );
      }
    }

    // Process each incoming entity
    for (const entity of entities) {
      // Validate entity fields array
      if (!Array.isArray(entity.fields)) {
        await transaction.rollback();
        return res
          .status(400)
          .json({ error: "Each entity must have an array of fields" });
      }

      // Validate required entity fields
      if (!entity.entity_name || typeof entity.entity_value !== "number") {
        await transaction.rollback();
        return res.status(400).json({
          error: "Entity name (string) and numeric entity value are required",
        });
      }

      let entityRecord;

      if (entity.entity_id) {
        // Update existing entity
        entityRecord = await DeptEntity.findOne({
          where: { dept_id, statistic_id, entity_id: entity.entity_id },
          transaction,
        });

        if (!entityRecord) {
          await transaction.rollback();
          return res
            .status(400)
            .json({ error: `Entity with id ${entity.entity_id} not found` });
        }

        await entityRecord.update(
          {
            entity_name: entity.entity_name.trim(),
            entity_value: entity.entity_value,
            is_active: true,
          },
          { transaction },
        );
      } else {
        // Create new entity or reactivate existing by name
        const [createdEntity, created] = await DeptEntity.findOrCreate({
          where: {
            dept_id,
            statistic_id,
            entity_name: entity.entity_name.trim(),
          },
          defaults: {
            entity_value: entity.entity_value,
            is_active: true,
          },
          transaction,
        });

        if (!created) {
          await createdEntity.update(
            { entity_value: entity.entity_value, is_active: true },
            { transaction },
          );
        }

        entityRecord = createdEntity;
      }

      // Fetch existing active fields for this entity
      const existingFields = await EntityFields.findAll({
        where: { entity_id: entityRecord.entity_id, is_active: true },
        transaction,
      });

      const incomingFieldIds = entity.fields
        .filter((f) => f.field_id)
        .map((f) => f.field_id);

      const incomingFieldNames = entity.fields
        .filter((f) => f.field_name)
        .map((f) => f.field_name.trim());

      // Soft-delete fields not included in the incoming payload
      for (const dbField of existingFields) {
        const isStillPresent = entity.fields.some(
          (f) =>
            (f.field_id && f.field_id === dbField.field_id) ||
            (f.field_name && f.field_name.trim() === dbField.field_name.trim()),
        );

        if (!isStillPresent) {
          await dbField.update({ is_active: false }, { transaction });
        }
      }

      // Process each field for this entity
      for (const field of entity.fields) {
        // Validate required field fields
        if (!field.field_name || field.field_value === undefined) {
          await transaction.rollback();
          return res.status(400).json({
            error: "Field name and field value are required",
          });
        }

        if (field.field_id) {
          // Update existing field
          await EntityFields.update(
            {
              field_name: field.field_name.trim(),
              field_value: field.field_value,
              field_unit: field.field_unit ? field.field_unit.trim() : "MW",
              is_active: true,
            },
            {
              where: {
                entity_id: entityRecord.entity_id,
                field_id: field.field_id,
              },
              transaction,
            },
          );
        } else {
          // Create new field or reactivate existing by name
          const [createdField, created] = await EntityFields.findOrCreate({
            where: {
              entity_id: entityRecord.entity_id,
              field_name: field.field_name.trim(),
            },
            defaults: {
              dept_id,
              statistic_id,
              field_value: field.field_value,
              field_unit: field.field_unit ? field.field_unit.trim() : "MW",
              is_active: true,
            },
            transaction,
          });

          if (!created) {
            await createdField.update(
              {
                field_value: field.field_value,
                field_unit: field.field_unit ? field.field_unit.trim() : "MW",
                is_active: true,
              },
              { transaction },
            );
          }
        }
      }
    }

    await transaction.commit();

    return res.status(200).json({
      message: "Statistic and related entities updated successfully",
    });
  } catch (err) {
    await transaction.rollback();
    console.error(err);
    return res.status(500).json({
      error: "Failed to update statistic with entities and fields",
      details: err.message,
    });
  }
};

//create a new statistic with entities and fields
exports.createNewStatisticWithDepartmentEntityFields = async (req, res) => {
  try {
    const { dept_id, user_id } = req.params;
    const { statistic_name, entities } = req.body;
    //first create the statistic with this name
    await DeptStatistic.create({
      statistic_name: statistic_name,
      dept_id: dept_id,
    }).then((createdStatistic) => {
      //then create the entities for the statistic
      entities.forEach(async (entity) => {
        await DeptEntity.create({
          dept_id: dept_id,
          statistic_id: createdStatistic.statistic_id,
          entity_name: entity.entity_name,
          entity_value: entity.entity_value,
        }).then(async (createdEntity) => {
          entity.fields.forEach(async (field) => {
            await EntityFields.create({
              dept_id: dept_id,
              statistic_id: createdStatistic.statistic_id,
              entity_id: createdEntity.entity_id,
              field_name: field.field_name,
              field_value: field.field_value,
              field_unit: field.field_unit,
            });
          });
        });
      });
    });

    res.json({ message: "Statistic added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add statistic" });
  }
};

// Routes related to contracts table

exports.createEntryInContractsTable = async (req, res) => {
  try {
    /** Creates an entry in the contracts table */
    const createdEntry = await ContractsTable.create(req.body);
    res.status(201).json({
      message: "entry created successfully",
      data: createdEntry,
    });
  } catch (err) {
    console.error("Error creating contract:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getEntriesFromContractsTable = async (req, res) => {
  try {
    const activeContracts = await ContractsTable.findAll({
      where: { is_active: true },
    });

    res.status(200).json({
      message: "Active contracts fetched successfully",
      data: activeContracts,
    });
  } catch (err) {
    console.error("Error fetching active contracts:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteEntryFromContractsTable = async (req, res) => {
  const { entry_id } = req.params;

  try {
    const deletedCount = await ContractsTable.destroy({
      where: { entry_id },
    });

    if (deletedCount === 0) {
      return res.status(404).json({ error: "Contract not found" });
    }

    res.status(200).json({
      message: "Contract deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting contract:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 *
 * O&M Controllers
 *
 */
exports.addOMDGR = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;
    const {
      date,
      generation,
      error_correction,
      radiation,
      machine_availability,
      grid_availability,
      cumulative_generation,
      is_active,
    } = req.body;

    // Basic validation (optional, can be expanded)
    if (
      date == null ||
      generation == null ||
      error_correction == null ||
      radiation == null ||
      machine_availability == null ||
      grid_availability == null ||
      cumulative_generation == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let parsedDate = new Date(date);

    let cuf_till_date =
      cumulative_generation /
      (grid_availability * 24.0 * 100.0 * parsedDate.getDate());

    const newRecord = await OMDGR.create({
      dept_id,
      statistic_id,
      entity_id,
      date,
      generation,
      error_correction,
      radiation,
      machine_availability,
      grid_availability,
      cumulative_generation,
      cuf_till_date,
      is_active: is_active !== undefined ? is_active : true,
    });

    return res.status(201).json({
      message: "OMDGR record created successfully.",
      data: newRecord,
    });
  } catch (error) {
    console.error("Error in addOMDGR:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getActiveOMDGRs = async (req, res) => {
  try {
    const data = await OMDGR.findAll({
      where: {
        is_active: true,
      },
      order: [["createdAt", "DESC"]], // Optional: latest first
    });

    return res.status(200).json({
      message: "Active OMDGR records retrieved successfully.",
      data,
    });
  } catch (error) {
    console.error("Error fetching active OMDGR records:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getFilteredActiveOMDGRs = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;

    // Build the filter dynamically
    const whereClause = {
      is_active: true,
    };

    if (dept_id) whereClause.dept_id = dept_id;
    if (statistic_id) whereClause.statistic_id = statistic_id;
    if (entity_id) whereClause.entity_id = entity_id;

    const data = await OMDGR.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      message: "Filtered active OMDGR records retrieved successfully.",
      data,
    });
  } catch (error) {
    console.error("Error fetching filtered active OMDGR records:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.deleteOMDGR = async (req, res) => {
  try {
    const { om_dgr_id } = req.params;

    if (!om_dgr_id) {
      return res.status(400).json({ message: "Missing om_dgr_id parameter." });
    }

    // Find the record
    const record = await OMDGR.findOne({ where: { om_dgr_id } });

    if (!record) {
      return res.status(404).json({ message: "OMDGR record not found." });
    }

    // Soft delete: set is_active to false
    record.is_active = false;
    await record.save();

    return res.status(200).json({
      message: "OMDGR record marked as inactive (soft deleted).",
      data: record,
    });
  } catch (error) {
    console.error("Error in deleteOMDGR:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.editOMDGR = async (req, res) => {
  try {
    const { om_dgr_id } = req.params;
    const {
      date,
      generation,
      error_correction,
      radiation,
      machine_availability,
      grid_availability,
      cumulative_generation,
      is_active,
    } = req.body;

    // Basic validation (optional, can be expanded)
    if (
      date == null ||
      generation == null ||
      error_correction == null ||
      radiation == null ||
      machine_availability == null ||
      grid_availability == null ||
      cumulative_generation == null
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Find the existing record
    const recordToUpdate = await OMDGR.findOne({
      where: {
        om_dgr_id,
      },
    });

    // If the record doesn't exist, return an error
    if (!recordToUpdate) {
      return res.status(404).json({ message: "OMDGR record not found." });
    }

    // Recalculate `cuf_till_date` (you can adjust the logic if needed)
    let parsedDate = new Date(date);
    let cuf_till_date =
      cumulative_generation /
      (grid_availability * 24.0 * 100.0 * parsedDate.getDate());

    // Update the record
    const updatedRecord = await recordToUpdate.update({
      date,
      generation,
      error_correction,
      radiation,
      machine_availability,
      grid_availability,
      cumulative_generation,
      cuf_till_date,
    });

    return res.status(200).json({
      message: "OMDGR record updated successfully.",
      data: updatedRecord,
    });
  } catch (error) {
    console.error("Error in editOMDGR:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getREIAData = async (req, res) => {
  try {
    const foundREIAData = await REIADocuments.findAll();
    res.status(200).json({
      data: foundREIAData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// returns if the given O&M project is mapped to a project type
exports.checkOMProjectTypeMapping = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;
    const foundProjectMapping = await OMProjectTypeMapping.findOne({
      where: {
        dept_id: dept_id,
        statistic_id: statistic_id,
        entity_id: entity_id,
      },
    });

    const foundEntity = await DeptEntity.findOne({
      where: {
        dept_id: dept_id,
        statistic_id: statistic_id,
        entity_id: entity_id,
      },
    });

    const foundEntityName = foundEntity.entity_name;

    return res.status(200).json({
      message: "Successfully found mappings",
      data: foundProjectMapping,
      entity_name: foundEntityName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.assignOMProjectMapping = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id, om_project_type } = req.query;

    let messageResponse = "Mapping already exists";
    const existingMapping = await OMProjectTypeMapping.findOne({
      where: {
        dept_id: dept_id,
        entity_id: entity_id,
        statistic_id: statistic_id,
      },
    });

    // create the new entry
    if (!existingMapping) {
      await OMProjectTypeMapping.create({
        dept_id: dept_id,
        statistic_id: statistic_id,
        entity_id: entity_id,
        om_project_type: om_project_type,
      });
      messageResponse = "Mapping updated successfully";
    }

    return res.status(200).json({
      message: messageResponse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getProjectName = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;
    const foundEntity = await DeptEntity.findOne({
      where: {
        dept_id: dept_id,
        statistic_id: statistic_id,
        entity_id: entity_id,
      },
    });

    return res.status(200).json({
      message: "Found Project Name",
      project_name: foundEntity.entity_name,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getOAllMSolarBESSData = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;
    const foundData = await OMDGRSolarBESS.findAll({
      where: {
        dept_id: dept_id,
        statistic_id: statistic_id,
        entity_id: entity_id,
      },
    });
    return res.status(200).json({
      message: "Found Solar+BESS data",
      data: foundData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getOMSolarBESSDataForDate = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;
    const { requestedDate } = req.body;

    if (!requestedDate) {
      return res.status(400).json({
        message: "requestedDate is required",
      });
    }

    /* ---------- Date helpers ---------- */
    const shiftDate = (dateStr, days) => {
      const d = new Date(dateStr + "T00:00:00");
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };

    const last7DaysStart = shiftDate(requestedDate, -7);
    const last7DaysEnd = shiftDate(requestedDate, 0);

    const d = new Date(requestedDate + "T00:00:00");
    d.setFullYear(d.getFullYear() - 1);
    const lastYearSameDate = d.toISOString().slice(0, 10);
    const lastYear7DaysStart = shiftDate(lastYearSameDate, -6);

    /* ---------- Current date ---------- */
    const foundDataForParticularDate = await OMDGRSolarBESS.findOne({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: requestedDate,
      },
    });

    if (!foundDataForParticularDate) {
      return res.status(204).json({
        message: "Data not found for this date",
      });
    }

    /* ---------- Last 7 days (current year) ---------- */
    const last7DaysData = await OMDGRSolarBESS.findAll({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: {
          [Sequelize.Op.between]: [last7DaysStart, last7DaysEnd],
        },
      },
      order: [["date", "ASC"]],
    });

    /* ---------- Last year – same 7-day window ---------- */
    const lastYear7DaysData = await OMDGRSolarBESS.findAll({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: {
          [Sequelize.Op.between]: [lastYear7DaysStart, lastYearSameDate],
        },
      },
      order: [["date", "ASC"]],
    });

    /* ---------- Last year March 31 ---------- */
    const reqYear = new Date(requestedDate + "T00:00:00").getFullYear();
    const lastYearMarch31 = `${reqYear - 1}-03-31`;

    const lastYearMarch31Data = await OMDGRSolarBESS.findOne({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: lastYearMarch31,
      },
    });

    return res.status(200).json({
      message: "Found data for date",
      data: {
        currentDate: foundDataForParticularDate,
        last7Days: last7DaysData,
        lastYearLast7Days: lastYear7DaysData,
        lastYearMarch31: lastYearMarch31Data,
      },
    });
  } catch (error) {
    console.error("Fetch OM Solar + BESS by date error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.downloadOMSolarBESSExcel = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id, fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "fromDate and toDate are required",
      });
    }

    const records = await OMDGRSolarBESS.findAll({
      attributes: {
        exclude: [
          "dept_id",
          "statistic_id",
          "entity_id",
          "om_dgr_solar_id",
          "is_active",
          "createdAt",
          "updatedAt",
        ],
      },
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: {
          [Sequelize.Op.between]: [fromDate, toDate],
        },
      },
      order: [["date", "ASC"]],
      raw: true,
    });

    console.log("records ==>", records);

    if (!records.length) {
      return res.status(204).json({
        message: "No data found for given date range",
      });
    }

    await streamExcel({
      res,
      sheetName: "OM Solar + BESS Data",
      fileName: `OM_Solar_BESS_${fromDate}_to_${toDate}.xlsx`,
      data: records,
    });
  } catch (error) {
    console.error("Solar+BESS Excel download error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.updateOMDGRSolarBESSForOneDate = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;

    const {
      date,
      days,
      generation,
      radiation,
      bess_export,
      bess_import,
      plant_availability,
      bess_availability,
      grid_availability,
      peak_power,
      cumulative_generation,
      cumulative_bess_export,
      cumulative_bess_import,
      daily_cuf_worc,
      cuf_till_date,
      remarks,
      is_active,
      action,
    } = req.body;

    console.log("req.body", req.body);

    if (!action || !["add", "update"].includes(action)) {
      return res.status(400).json({
        message: "Invalid or missing action flag (add / update required)",
      });
    }

    const existingRecord = await OMDGRSolarBESS.findOne({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date,
      },
    });

    /* ---------------- ADD ---------------- */
    if (action === "add") {
      if (existingRecord) {
        return res.status(409).json({
          message: "Data already exists for this date. Use update instead.",
        });
      }

      await OMDGRSolarBESS.create({
        dept_id,
        statistic_id,
        entity_id,
        date,
        days,
        generation,
        radiation,
        bess_export,
        bess_import,
        plant_availability,
        bess_availability,
        grid_availability,
        peak_power,
        cumulative_generation,
        cumulative_bess_export,
        cumulative_bess_import,
        daily_cuf_worc,
        cuf_till_date,
        remarks,
        is_active,
      });

      return res.status(201).json({
        message: "OM DGR Solar + BESS data added successfully",
      });
    }

    /* ---------------- UPDATE ---------------- */
    if (action === "update") {
      if (!existingRecord) {
        return res.status(404).json({
          message: "No data found for this date to update",
        });
      }

      await existingRecord.update({
        days,
        generation,
        radiation,
        bess_export,
        bess_import,
        plant_availability,
        bess_availability,
        grid_availability,
        peak_power,
        cumulative_generation,
        cumulative_bess_export,
        cumulative_bess_import,
        daily_cuf_worc,
        cuf_till_date,
        remarks,
        is_active,
      });

      return res.status(200).json({
        message: "OM DGR Solar + BESS data updated successfully",
      });
    }
  } catch (error) {
    console.error("OM DGR Solar + BESS error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getOMSolarDataForDate = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;
    const { requestedDate } = req.body;

    if (!requestedDate) {
      return res.status(400).json({
        message: "requestedDate is required",
      });
    }

    const shiftDate = (dateStr, days) => {
      const d = new Date(dateStr + "T00:00:00");
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };

    const last7DaysStart = shiftDate(requestedDate, -7);
    const last7DaysEnd = shiftDate(requestedDate, 0);
    const d = new Date(requestedDate + "T00:00:00");
    d.setFullYear(d.getFullYear() - 1);
    const lastYearSameDate = d.toISOString().slice(0, 10);
    const lastYear7DaysStart = shiftDate(lastYearSameDate, -6);

    const foundDataForParticularDate = await OMDGRSolar.findOne({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: requestedDate,
      },
    });

    if (!foundDataForParticularDate) {
      return res.status(204).json({
        message: "Data not found for this date",
      });
    }

    // 🔹 Last 7 days data (current year)
    const last7DaysData = await OMDGRSolar.findAll({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: {
          [Sequelize.Op.between]: [last7DaysStart, last7DaysEnd],
        },
      },
      order: [["date", "ASC"]],
    });

    // 🔹 Last year – same 7-day range
    const lastYear7DaysData = await OMDGRSolar.findAll({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: {
          [Sequelize.Op.between]: [lastYear7DaysStart, lastYearSameDate],
        },
      },
      order: [["date", "ASC"]],
    });

    const reqYear = new Date(requestedDate + "T00:00:00").getFullYear();
    const lastYearMarch31 = `${reqYear - 1}-03-31`;

    const lastYearMarch31Data = await OMDGRSolar.findOne({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: lastYearMarch31,
      },
    });

    return res.status(200).json({
      message: "Found data for date",
      data: {
        currentDate: foundDataForParticularDate,
        last7Days: last7DaysData,
        lastYearLast7Days: lastYear7DaysData,
        lastYearMarch31: lastYearMarch31Data,
      },
    });
  } catch (error) {
    console.error("Fetch OM Solar by date error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.downloadOMSolarExcel = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id, fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "fromDate and toDate are required",
      });
    }

    const records = await OMDGRSolar.findAll({
      attributes: {
        exclude: [
          "dept_id",
          "statistic_id",
          "entity_id",
          "om_dgr_solar_id",
          "is_active",
          "createdAt",
          "updatedAt",
        ],
      },
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date: {
          [Sequelize.Op.between]: [fromDate, toDate],
        },
      },
      order: [["date", "ASC"]],
      raw: true,
    });

    console.log("records ==>", records);

    if (!records.length) {
      return res.status(204).json({
        message: "No data found",
      });
    }

    await streamExcel({
      res,
      sheetName: "OM Solar Data",
      fileName: `OM_Solar_${fromDate}_to_${toDate}.xlsx`,
      data: records,
    });
  } catch (error) {
    console.error("Excel download error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.updateOMDGRSolarForOneDate = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;

    const {
      date,
      days,
      generation,
      radiation,
      machine_availability,
      grid_availability,
      peak_power,
      cumulative_generation,
      cuf,
      cuf_till_date,
      remarks,
      is_active,
      action,
    } = req.body;

    console.log("req.body", req.body);

    if (!action || !["add", "update"].includes(action)) {
      return res.status(400).json({
        message: "Invalid or missing action flag (add / update required)",
      });
    }

    const existingRecord = await OMDGRSolar.findOne({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        date,
      },
    });

    if (action === "add") {
      if (existingRecord) {
        return res.status(409).json({
          message: "Data already exists for this date. Use update instead.",
        });
      }

      await OMDGRSolar.create({
        dept_id,
        statistic_id,
        entity_id,
        date,
        days,
        generation,
        radiation,
        machine_availability,
        grid_availability,
        peak_power,
        cumulative_generation,
        cuf,
        cuf_till_date,
        remarks,
        is_active,
      });

      return res.status(201).json({
        message: "OM DGR Solar data added successfully",
      });
    }

    if (action === "update") {
      if (!existingRecord) {
        return res.status(404).json({
          message: "No data found for this date to update",
        });
      }

      await existingRecord.update({
        days,
        generation,
        radiation,
        machine_availability,
        grid_availability,
        peak_power,
        cumulative_generation,
        cuf,
        cuf_till_date,
        remarks,
        is_active,
      });

      return res.status(200).json({
        message: "OM DGR Solar data updated successfully",
      });
    }
  } catch (error) {
    console.error("OM DGR Solar error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getProjectCapacity = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;

    const entityCapacity = await DeptEntity.findOne({
      attributes: ["entity_value"],
      where: {
        entity_id: entity_id,
        dept_id: dept_id,
        statistic_id: statistic_id,
      },
      raw: true,
    });

    return res.status(200).json({
      message: "Found capacity for entity_id",
      data: {
        capacity: entityCapacity ? entityCapacity.entity_value : null,
      },
    });
  } catch (error) {
    console.error("Fetch OM Solar by date error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getOMProjectsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    // 🔹 Calculate last year's 31 March
    const inputDate = new Date(date);
    const lastYear = inputDate.getFullYear() - 1;
    const lastYearMarch31 = `${lastYear}-03-31`;

    // 1️⃣ Fetch project mappings
    const projectMappings = await OMProjectTypeMapping.findAll({
      attributes: ["entity_id", "om_project_type"],
      raw: true,
    });

    if (!projectMappings.length) {
      return res.status(404).json({ message: "No project mappings found" });
    }

    // 2️⃣ Fetch entity names
    const entityIds = projectMappings.map((p) => p.entity_id);

    const entities = await DeptEntity.findAll({
      where: {
        entity_id: entityIds,
        is_active: 1,
      },
      attributes: ["entity_id", "entity_name"],
      raw: true,
    });

    const entityNameMap = {};
    entities.forEach((e) => {
      entityNameMap[e.entity_id] = e.entity_name;
    });

    // 3️⃣ Split by project type
    const solarEntityIds = [];
    const solarBessEntityIds = [];

    projectMappings.forEach((p) => {
      if (p.om_project_type === "solar") solarEntityIds.push(p.entity_id);
      if (p.om_project_type === "solar_bess")
        solarBessEntityIds.push(p.entity_id);
    });

    // 4️⃣ Fetch O&M data (selected date + last year March 31)
    const [solarData, solarBessData, solarLastYearData, solarBessLastYearData] =
      await Promise.all([
        solarEntityIds.length
          ? OMDGRSolar.findAll({
              where: { entity_id: solarEntityIds, date, is_active: 1 },
            })
          : [],

        solarBessEntityIds.length
          ? OMDGRSolarBESS.findAll({
              where: { entity_id: solarBessEntityIds, date, is_active: 1 },
            })
          : [],

        solarEntityIds.length
          ? OMDGRSolar.findAll({
              where: {
                entity_id: solarEntityIds,
                date: lastYearMarch31,
                is_active: 1,
              },
            })
          : [],

        solarBessEntityIds.length
          ? OMDGRSolarBESS.findAll({
              where: {
                entity_id: solarBessEntityIds,
                date: lastYearMarch31,
                is_active: 1,
              },
            })
          : [],
      ]);

    // 5️⃣ Attach entity_name
    const attachEntityName = (rows) =>
      rows.map((row) => ({
        ...row.toJSON(),
        entity_name: entityNameMap[row.entity_id] || null,
      }));

    return res.status(200).json({
      message: "OM project data fetched successfully",
      date,
      last_year_march_31: lastYearMarch31,
      data: {
        solar: {
          current: attachEntityName(solarData),
          lastFYYear: attachEntityName(solarLastYearData),
        },
        solar_bess: {
          current: attachEntityName(solarBessData),
          lastFYYear: attachEntityName(solarBessLastYearData),
        },
      },
    });
  } catch (error) {
    console.error("Fetch OM projects by date error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getIssuesAndActionPlan = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.query;

    const record = await OmProjectTypeIssuesActions.findOne({
      where: {
        dept_id,
        statistic_id,
        entity_id,
      },
      raw: true,
    });

    return res.status(200).json({
      message: "Fetched issues and action plan successfully",
      data: record || null,
    });
  } catch (error) {
    console.error("Fetch issues/action error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.upsertIssuesAndActionPlan = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id, key_issues, action_plan } =
      req.body;

    const [record, created] = await OmProjectTypeIssuesActions.upsert({
      dept_id,
      statistic_id,
      entity_id,
      key_issues,
      action_plan,
    });

    return res.status(200).json({
      message: created ? "Created successfully" : "Updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Upsert issues/action error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getAllIssuesAndActions = async (req, res) => {
  try {

    // 1️⃣ Fetch all issues
    const issues = await OmProjectTypeIssuesActions.findAll({
      attributes: [
        "dept_id",
        "statistic_id",
        "entity_id",
        "key_issues",
        "action_plan",
        "updatedAt",
      ],
      raw: true,
    });

    if (!issues.length) {
      return res.status(404).json({
        message: "No issues found",
      });
    }

    // 2️⃣ Get entity IDs
    const entityIds = issues.map((i) => i.entity_id);

    // 3️⃣ Fetch project names
    const entities = await DeptEntity.findAll({
      where: {
        entity_id: entityIds,
        is_active: 1,
      },
      attributes: ["entity_id", "entity_name"],
      raw: true,
    });

    // 4️⃣ Create map
    const entityNameMap = {};
    entities.forEach((e) => {
      entityNameMap[e.entity_id] = e.entity_name;
    });

    // 5️⃣ Attach project name
    const formatted = issues.map((issue) => ({
      ...issue,
      project_name: entityNameMap[issue.entity_id] || null,
    }));

    return res.status(200).json({
      message: "Fetched all issues successfully",
      count: formatted.length,
      data: formatted,
    });

  } catch (error) {
    console.error("Fetch issues error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ========== STATE-WISE DATA ==========
exports.getStateWiseData = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;

    const data = await StateWiseData.findAll({
      where: {
        dept_id,
        statistic_id,
        entity_id,
        is_active: true,
      },
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "State-wise data fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error fetching state-wise data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch state-wise data",
      error: error.message,
    });
  }
};

exports.addStateWiseData = async (req, res) => {
  try {
    const { dept_id, statistic_id, entity_id } = req.params;
    const { name, psa_signed_mw, commissioned_mw, regulations_policy, report_path } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    const swd = await StateWiseData.create({
      dept_id,
      statistic_id,
      entity_id,
      name,
      psa_signed_mw: psa_signed_mw || 0,
      commissioned_mw: commissioned_mw || 0,
      regulations_policy: regulations_policy || null,
      report_path: report_path || null,
    });

    return res.status(201).json({
      success: true,
      message: "State-wise data entry created successfully",
      data: swd,
    });
  } catch (error) {
    console.error("Error creating state-wise data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create state-wise data",
      error: error.message,
    });
  }
};

exports.updateStateWiseData = async (req, res) => {
  try {
    const { swd_id } = req.params;
    const { name, psa_signed_mw, commissioned_mw, regulations_policy, report_path } = req.body;

    const swd = await StateWiseData.findByPk(swd_id);

    if (!swd) {
      return res.status(404).json({
        success: false,
        message: "State-wise data entry not found",
      });
    }

    await swd.update({
      name: name || swd.name,
      psa_signed_mw: psa_signed_mw !== undefined ? psa_signed_mw : swd.psa_signed_mw,
      commissioned_mw: commissioned_mw !== undefined ? commissioned_mw : swd.commissioned_mw,
      regulations_policy: regulations_policy !== undefined ? regulations_policy : swd.regulations_policy,
      report_path: report_path !== undefined ? report_path : swd.report_path,
    });

    return res.status(200).json({
      success: true,
      message: "State-wise data entry updated successfully",
      data: swd,
    });
  } catch (error) {
    console.error("Error updating state-wise data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update state-wise data",
      error: error.message,
    });
  }
};

exports.deleteStateWiseData = async (req, res) => {
  try {
    const { swd_id } = req.params;

    const swd = await StateWiseData.findByPk(swd_id);

    if (!swd) {
      return res.status(404).json({
        success: false,
        message: "State-wise data entry not found",
      });
    }

    await swd.update({ is_active: false });

    return res.status(200).json({
      success: true,
      message: "State-wise data entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting state-wise data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete state-wise data",
      error: error.message,
    });
  }
};

