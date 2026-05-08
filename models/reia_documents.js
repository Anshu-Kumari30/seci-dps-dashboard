module.exports = (sequelize, DataTypes) => {
  const REIADocuments = sequelize.define(
    "reia_documents",
    {
      reia_doc_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        default: DataTypes.UUIDV4,
      },
      reia_doc_type: {
        type: DataTypes.ENUM,
        values: ["wind", "hybrid", "data"],
        allowNull: false,
      },
      reia_doc_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_updated_on: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );
  return REIADocuments;
};
