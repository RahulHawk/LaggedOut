const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Role = require("../model/roleModel");

dotenv.config({ path: "./.env" });

const seedRoles = async () => {
  await mongoose.connect(process.env.MONGOURL);

  const roles = [
    { name: "player", description: "Regular player who buys and plays games" },
    { name: "developer", description: "Game developer who uploads and manages games" },
    { name: "admin", description: "Administrator with full control" }
  ];

  for (let role of roles) {
    const exists = await Role.findOne({ name: role.name });
    if (!exists) {
      await Role.create(role);
      console.log(`✅ Role ${role.name} created`);
    } else {
      console.log(`⚡ Role ${role.name} already exists`);
    }
  }

  mongoose.connection.close();
};

seedRoles();
