// models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const contracts_table = require("./contracts_table");
const config = require("../config");
require("dotenv").config(); // Load .env variables

//select database to use
let DB_NAME = process.env.DB_NAME_TESTING;
if (process.env.NODE_ENV === "PRODUCTION") {
  DB_NAME = process.env.DB_NAME_PRODUCTION;
}

const sequelize = new Sequelize(
  config.DB_NAME,
  config.DB_USER,
  config.DB_PASS,
  {
    host: config.DB_HOST,
    port: config.DB_PORT,
    dialect: "mysql",
    logging: false,
    pool: {
      max: Number(process.env.DB_POOL_MAX) || 20,
      min: Number(process.env.DB_POOL_MIN) || 5,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 60000,
    },
  },
);

const models = {
  DeptMaster: require("./dept_master")(sequelize, DataTypes),
  DeptStatistic: require("./dept_statistic")(sequelize, DataTypes),
  DeptEntity: require("./dept_entity")(sequelize, DataTypes),
  EntityFields: require("./entity_fields")(sequelize, DataTypes),
  EntityDocs: require("./entity_docs")(sequelize, DataTypes),
  EntityCorrespondence: require("./entity_correspondence")(
    sequelize,
    DataTypes,
  ),
  EntityIssues: require("./entity_issues")(sequelize, DataTypes),
  StateWiseData: require("./state_wise_data")(sequelize, DataTypes),
  StateWiseRegulationFile: require("./state_wise_regulation_file")(
    sequelize,
    DataTypes,
  ),
  User: require("./user")(sequelize, DataTypes),
  UserEditAccess: require("./user_edit_access")(sequelize, DataTypes),
  UserLogs: require("./user_logs")(sequelize, DataTypes),
  ContractsTable: require("./contracts_table")(sequelize, DataTypes),
  BusinessDevelopmentTable: require("./bd_table")(sequelize, DataTypes),
  BusinessDevelopmentMilestones: require("./bd_milestones")(
    sequelize,
    DataTypes,
  ),
  OMDGR: require("./om_dgr")(sequelize, DataTypes),
  REIADocuments: require("./reia_documents")(sequelize, DataTypes),
  OMProjectTypeMapping: require("./om_project_type_mapping")(
    sequelize,
    DataTypes,
  ),
  OmProjectTypeIssuesActions: require("./om_project_type_Issues_actions")(
    sequelize,
    DataTypes,
  ),
  OMDGRSolar: require("./om_dgr_solar")(sequelize, DataTypes),
  OMDGRSolarBESS: require("./om_dgr_solar_bess")(sequelize, DataTypes),
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = { sequelize, models };
