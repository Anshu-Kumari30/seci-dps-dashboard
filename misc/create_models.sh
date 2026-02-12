#!/bin/bash

# Create the models directory if it doesn't exist
mkdir -p models

# Function to write a model file
write_model() {
  local filename=$1
  local content=$2
  echo "$content" > "models/$filename.js"
}

# Model: dept_master
write_model "dept_master" "$(cat <<EOF
module.exports = (sequelize, DataTypes) => {
  const DeptMaster = sequelize.define('dept_master', {
    dept_id: DataTypes.STRING,
    dept_name: DataTypes.STRING,
    regular_count: DataTypes.STRING,
    yp_count: DataTypes.STRING,
    contractual_count: DataTypes.STRING
  }, {
    timestamps: false
  });
  return DeptMaster;
};
EOF
)"

# Model: dept_statistic
write_model "dept_statistic" "$(cat <<EOF
module.exports = (sequelize, DataTypes) => {
  const DeptStatistic = sequelize.define('dept_statistic', {
    dept_id: DataTypes.STRING,
    statistic_id: DataTypes.STRING,
    statistic_name: DataTypes.STRING
  }, {
    timestamps: false
  });
  return DeptStatistic;
};
EOF
)"

# Model: dept_entity
write_model "dept_entity" "$(cat <<EOF
module.exports = (sequelize, DataTypes) => {
  const DeptEntity = sequelize.define('dept_entity', {
    dept_id: DataTypes.STRING,
    statistic_id: DataTypes.STRING,
    entity_id: DataTypes.STRING,
    entity_name: DataTypes.STRING
  }, {
    timestamps: false
  });
  return DeptEntity;
};
EOF
)"

# Model: entity_fields
write_model "entity_fields" "$(cat <<EOF
module.exports = (sequelize, DataTypes) => {
  const EntityFields = sequelize.define('entity_fields', {
    dept_id: DataTypes.STRING,
    statistic_id: DataTypes.STRING,
    entity_id: DataTypes.STRING,
    field_id: DataTypes.STRING,
    field_name: DataTypes.STRING,
    field_value: DataTypes.STRING,
    field_unit: DataTypes.STRING
  }, {
    timestamps: false
  });
  return EntityFields;
};
EOF
)"

# Model: entity_docs
write_model "entity_docs" "$(cat <<EOF
module.exports = (sequelize, DataTypes) => {
  const EntityDocs = sequelize.define('entity_docs', {
    dept_id: DataTypes.STRING,
    statistic_id: DataTypes.STRING,
    entity_id: DataTypes.STRING,
    doc_id: DataTypes.STRING,
    doc_name: DataTypes.STRING,
    doc_path: DataTypes.STRING,
    created_at: DataTypes.STRING,
    doc_type: DataTypes.STRING
  }, {
    timestamps: false
  });
  return EntityDocs;
};
EOF
)"

# Model: entity_correspondence
write_model "entity_correspondence" "$(cat <<EOF
module.exports = (sequelize, DataTypes) => {
  const EntityCorrespondence = sequelize.define('entity_correspondence', {
    dept_id: DataTypes.STRING,
    statistic_id: DataTypes.STRING,
    entity_id: DataTypes.STRING,
    correspondence_id: DataTypes.STRING,
    subject: DataTypes.STRING,
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    created_at: DataTypes.STRING,
    correspondence_date: DataTypes.STRING,
    doc_path: DataTypes.STRING,
    correspondence_type: DataTypes.STRING
  }, {
    timestamps: false
  });
  return EntityCorrespondence;
};
EOF
)"

# Model: tariff_petition
write_model "tariff_petition" "$(cat <<EOF
module.exports = (sequelize, DataTypes) => {
  const TariffPetition = sequelize.define('tariff_petition', {
    // structure to be defined later
  }, {
    timestamps: false
  });
  return TariffPetition;
};
EOF
)"

echo "✅ All Sequelize model files generated in ./models"