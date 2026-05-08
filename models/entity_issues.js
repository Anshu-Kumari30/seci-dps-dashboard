module.exports = (sequelize, DataTypes) => {
    const EntityIssues = sequelize.define(
      "entity_issues",
      {
        dept_id: {
          type: DataTypes.UUID,
          primaryKey: true,
          references: {
            model: "dept_master",
            key: "dept_id",
          },
        },
        statistic_id: {
          type: DataTypes.UUID,
          primaryKey: true,
          references: {
            model: "dept_statistic",
            key: "statistic_id",
          },
        },
        entity_id: {
          type: DataTypes.UUID,
          primaryKey: true,
          references: {
            model: "dept_entity",
            key: "entity_id",
          },
        },
        issue_id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        issue_description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        issue_pertaining_to: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        issue_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        issue_doc_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        is_active: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
      },
      {
        timestamps: true,
        freezeTableName: true,
      }
    );
    return EntityIssues;
  };
  