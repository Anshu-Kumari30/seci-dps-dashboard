module.exports = (sequelize, DataTypes) => {
  const EntityDocs = sequelize.define(
    "entity_docs",
    {
      dept_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "dept_master",
          key: "dept_id",
        },
      },
      statistic_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "dept_statistic",
          key: "statistic_id",
        },
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
          model: "dept_entity",
          key: "entity_id",
        },
      },
      doc_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      doc_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      doc_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      doc_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      doc_type: {
        type: DataTypes.ENUM("mpr", "dpr", "cdoc"),
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

  return EntityDocs;
};
