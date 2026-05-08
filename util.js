const { models } = require("./models");

let dummyOMDeptID = "";
let dummyOMStatisticID = "";
let dummyOMEntityID = "";

async function insertTestData() {
  const {
    User,
    DeptMaster,
    DeptStatistic,
    DeptEntity,
    EntityFields,
    EntityDocs,
    UserEditAccess,
    OMDGR,
    OMDGRSolarBESS,
  } = models;

  console.log("🔧 Starting test data insertion...");

  const bcrypt = require("bcrypt");

  const excludedDepartments = ["Business Development"];

  const hashedPassword = await bcrypt.hash("admin1234", 10);
  const adminUsers = await User.bulkCreate([
    {
      name: "Director Power Systems",
      email: "dir-ps@seci.co.in",
      password: hashedPassword,
      role: "admin",
    },
    {
      name: "Prashant Soni",
      email: "p.soni@seci.co.in",
      password: hashedPassword,
      role: "admin",
    },
    {
      name: "IT Admin",
      email: "it.division@seci.co.in",
      password: hashedPassword,
      role: "admin",
    },
    {
      name: "Administrator",
      email: "admin@seci.co.in",
      password: hashedPassword,
      role: "admin",
    },
  ]);
  console.log("✅ Created admin users.");

  const departmentData = require("./config/departmentData");
  const departments = Object.keys(departmentData);

  for (const deptName of departments) {
    const dept = await DeptMaster.create({
      dept_name: deptName,
      regular_count: Math.floor(Math.random() * 10),
      yp_count: Math.floor(Math.random() * 5),
      contractual_count: Math.floor(Math.random() * 20),
    });
    console.log(`✅ Created department: ${deptName}`);

    for (const admin of adminUsers) {
      await UserEditAccess.create({
        user_id: admin.user_id,
        dept_id: dept.dept_id,
      });
    }

    if (!excludedDepartments.includes(deptName)) {
      const stats = departmentData[deptName];

      for (let s = 0; s < stats.length; s++) {
        const stat = await DeptStatistic.create({
          dept_id: dept.dept_id,
          statistic_name: stats[s].name,
          is_shown_on_home: s === 0,
        });
        console.log(`✅ Created statistic '${stats[s].name}' for ${deptName}`);

        for (const field of stats[s].fields) {
          const entity = await DeptEntity.create({
            dept_id: dept.dept_id,
            statistic_id: stat.statistic_id,
            entity_name: field.label,
            entity_value: field.value,
          });
          console.log(`✅ Created entity '${field.label}'`);

          if (
            dummyOMDeptID === "" &&
            dummyOMEntityID === "" &&
            dummyOMEntityID === "" &&
            deptName === "O&M" &&
            entity.entity_name === "Badi Sid, Rajasthan"
          ) {
            dummyOMDeptID = dept.dept_id;
            dummyOMStatisticID = stat.statistic_id;
            dummyOMEntityID = entity.entity_id;
          }

          const fieldsToInsert = field.tooltipData.map((item) => ({
            dept_id: dept.dept_id,
            statistic_id: stat.statistic_id,
            entity_id: entity.entity_id,
            field_name: item.key,
            field_value: item.value,
            field_unit: "",
          }));

          await EntityFields.bulkCreate(fieldsToInsert);
          console.log(
            `✅ Inserted ${fieldsToInsert.length} fields for '${field.label}'`
          );

          const docsToInsert = (field.tableData || []).map((issue, i) => ({
            dept_id: dept.dept_id,
            statistic_id: stat.statistic_id,
            entity_id: entity.entity_id,
            doc_name: `${issue.issues.replace(/\s+/g, "_")}_${i + 1}.pdf`,
            doc_path: "/uploads/demo.pdf",
            created_at: new Date(issue.date || Date.now()),
            doc_type: "mpr",
          }));

          if (docsToInsert.length > 0) {
            await EntityDocs.bulkCreate(docsToInsert);
            console.log(
              `📄 Created ${docsToInsert.length} documents for '${field.label}'`
            );
          }
        }
      }
    }
  }

  const users = [
    {
      dept_name: "Business Development",
      user_details: [
        {
          name: "Avnish Parashar",
          email: "avnish.parashar@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Pardeep Kumar",
          email: "pardeep.kumar@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "AK Naik",
          email: "aknaik@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
      ],
    },
    {
      dept_name: "PMC",
      user_details: [
        {
          name: "ISK Reddy",
          email: "iskreddy@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Priyank Jain",
          email: "priyank.j@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Shreedhar Singh",
          email: "shreedhar.singh@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
      ],
    },
    {
      dept_name: "Contracts & Procurement",
      user_details: [
        {
          name: "Sandeep Rana",
          email: "sandeeprana@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Pratik Prasun",
          email: "pratikpr@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "AK Naik",
          email: "aknaik@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
      ],
    },
    {
      dept_name: "Energy Mangement",
      user_details: [
        {
          name: "Sanjeev Singh",
          email: "sanjeev@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Shibashish Das",
          email: "shibasish@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "AK Naik",
          email: "aknaik@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
      ],
    },
    {
      dept_name: "Projects",
      user_details: [
        {
          name: "Ankit",
          email: "aagrawal@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Debojyoti",
          email: "debajyoti.b@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "P Venkatesan",
          email: "venkatesan@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Shreedhar Singh",
          email: "shreedhar.singh@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
      ],
    },
    {
      dept_name: "Engineering/QA",
      user_details: [
        {
          name: "Muthuraj R",
          email: "muthurajr@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Jaya",
          email: "jaya.chauhan@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Manish Kumar",
          email: "Manish.kumar.verma@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Shreedhar Singh",
          email: "shreedhar.singh@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
      ],
    },
    {
      dept_name: "O&M",
      user_details: [
        {
          name: "Shubham Asrani",
          email: "shubham.asrani205@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Shreedhar Singh",
          email: "shreedhar.singh@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
      ],
    },
    {
      dept_name: "RESCO",
      user_details: [
        {
          name: "Anita",
          email: "anitaag@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
        {
          name: "Shreedhar Singh",
          email: "shreedhar.singh@seci.co.in",
          password: await bcrypt.hash("dept1234", 10),
          role: "user",
        },
      ],
    },
  ];

  for (const { dept_name, user_details } of users) {
    // Find department from earlier inserted ones
    const dept = await DeptMaster.findOne({ where: { dept_name } });
    if (!dept) {
      console.warn(`⚠️ Department not found: ${dept_name}`);
      continue;
    }

    for (const userData of user_details) {
      // Create the user if not exists, else use existing user
      let user = await User.findOne({ where: { email: userData.email } });

      if (!user) {
        user = await User.create(userData);
        console.log(`✅ Created user ${user.name} for department ${dept_name}`);
      } else {
        console.log(`ℹ️ User already exists: ${user.name} (${user.email})`);
      }

      // Give the user edit access to their department
      await UserEditAccess.create({
        user_id: user.user_id,
        dept_id: dept.dept_id,
      });
      console.log(`🔐 Assigned edit access for ${user.name} to ${dept_name}`);
    }
  }

  const omDept = await DeptMaster.findOne({ where: { dept_name: "O&M" } });
  if (omDept) {
    const stats = await DeptStatistic.findAll({
      where: { dept_id: omDept.dept_id },
    });

    for (const stat of stats) {
      const entities = await DeptEntity.findAll({
        where: {
          dept_id: omDept.dept_id,
          statistic_id: stat.statistic_id,
        },
      });

      for (const entity of entities) {
        await OMDGR.create({
          dept_id: omDept.dept_id,
          statistic_id: stat.statistic_id,
          entity_id: entity.entity_id,
          date: new Date(),
          generation: Math.random() * 1000,
          error_correction: Math.random() * 5,
          radiation: Math.random() * 100,
          machine_availability: 98 + Math.random(),
          grid_availability: 99 + Math.random(),
          cumulative_generation: 10000 + Math.random() * 5000,
          cuf_till_date: 18 + Math.random() * 5,
        });

        console.log(`⚡ Inserted OMDGR record for ${entity.entity_name}`);
      }
    }
  }

  console.log("🎉 All department data inserted.");
}
const axios = require("axios");
const jwtDecode = require("jwt-decode");
const user_logs = require("./models/user_logs");

async function testAllApis() {
  const BASE_URL = "http://localhost:3000"; // change if needed
  const credentials = {
    email: "admin@seci.co.in",
    password: "admin1234",
  };

  console.log("🔐 Attempting to login as admin@seci.co.in...");

  try {
    const loginRes = await axios.post(
      `${BASE_URL}/api/auth/login`,
      credentials
    );
    const token = loginRes.data.login_token;

    if (!token) {
      console.error("❌ Login failed: No token received.");
      return;
    }

    console.log("✅ Login successful.\n");

    // Decode token to get user_id and role
    const parsedToken = JSON.parse(atob(token.split(".")[1]));
    const userId = parsedToken.user_id;
    const role = parsedToken.role || "user";

    console.log(`👤 Logged in as: ${parsedToken.name || "Unknown Name"}`);
    console.log(`🔑 Role: ${role}`);
    console.log(`🆔 User ID (from token): ${userId}\n`);

    const headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const testEndpoint = async (label, method, url) => {
      try {
        const response = await axios[method](`${BASE_URL}${url}`, headers);
        console.log(`✅ ${label} → ${url}`);
        return response.data;
      } catch (err) {
        const status = err.response?.status;
        const data = err.response?.data;
        console.error(`❌ Failed: ${label} → ${url}`);
        console.error(`   Status: ${status}`);
        console.error(`   Message: ${JSON.stringify(data)}`);
        console.error("");
        return null;
      }
    };

    // 1. Fetch Departments
    const departments = await testEndpoint(
      "Get All Departments",
      "get",
      "/api/data/departments"
    );
    if (!departments?.length) return;

    const dept_id = departments[0].dept_id;

    // 2. Departments User Has Access To
    await testEndpoint(
      "Get User Departments",
      "get",
      `/api/data/departments/user/${userId}`
    );

    // 3. Get Statistics for First Department
    const stats = await testEndpoint(
      "Get Statistics",
      "get",
      `/api/data/statistics/${dept_id}`
    );
    if (!stats?.length) return;

    const statistic_id = stats[0].statistic_id;

    // 4. Get Entities for Department & Statistic
    const entities = await testEndpoint(
      "Get Entities",
      "get",
      `/api/data/entities/${dept_id}/${statistic_id}`
    );
    if (!entities?.length) return;

    const entity_id = entities[0].entity_id;

    // 5. Get Documents for Entity
    await testEndpoint(
      "Get Documents",
      "get",
      `/api/data/documents/${dept_id}/${statistic_id}/${entity_id}`
    );

    // 6. Get Correspondences for Entity
    await testEndpoint(
      "Get Correspondences",
      "get",
      `/api/data/correspondences/${dept_id}/${statistic_id}/${entity_id}`
    );

    console.log("\n🎉 API test completed successfully.");
  } catch (err) {
    const status = err.response?.status;
    const data = err.response?.data;
    console.error(err);
    console.error("❌ Login failed.");
    console.error(`   Status: ${status}`);
    console.error(`   Message: ${JSON.stringify(data)}`);
  }
}

async function insertOMSolarBESSDummyData() {
  const { models } = require("./models");
  const { OMDGRSolarBESS } = models;

  // Starting dates for the data
  const startDate2025 = new Date("2025-01-01");
  const startDate2024 = new Date("2024-01-01");

  // Function to generate the dummy data for continuous days
  const generateDummyDataForDays = (startDate, numDays) => {
    const dummyData = [];
    for (let i = 0; i < numDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      dummyData.push({
        dept_id: dummyOMDeptID,
        statistic_id: dummyOMStatisticID,
        entity_id: dummyOMEntityID,
        date: currentDate,
        days: i + 1,
        generation: 1200 + Math.random() * 500,
        radiation: 5.0 + Math.random() * 2,
        bess_export: 400 + Math.random() * 100,
        bess_import: 300 + Math.random() * 100,
        plant_availability: 95 + Math.random() * 5,
        bess_availability: 90 + Math.random() * 6,
        grid_availability: 98 + Math.random() * 2,
        peak_power: 500 + Math.random() * 100,
        cumulative_generation: 25000 + Math.random() * 5000,
        cumulative_bess_export: 12000 + Math.random() * 3000,
        cumulative_bess_import: 8000 + Math.random() * 2000,
        daily_cuf_worc: 18 + Math.random() * 3,
        cuf_till_date: 90 + Math.random() * 10,
        is_active: true,
      });
    }
    return dummyData;
  };

  // Generate the dummy data for both years
  const dummyData2025 = generateDummyDataForDays(startDate2025, 12);
  const dummyData2024 = generateDummyDataForDays(startDate2024, 12);

  // Merge the datasets
  const finalData = [...dummyData2024, ...dummyData2025];

  try {
    const result = await OMDGRSolarBESS.bulkCreate(finalData);
    console.log(
      `${result.length} dummy rows inserted into OMDGRSolarBESS (2024 + 2025).`
    );
  } catch (err) {
    console.error("❌ Error inserting dummy data:", err);
  }
}

module.exports = { insertTestData, insertOMSolarBESSDummyData, testAllApis };
