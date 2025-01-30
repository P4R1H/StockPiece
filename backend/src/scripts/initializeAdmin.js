import Admin from "../models/admin.models.js";

const initializeAdmin = async () => {
  //here first i need to check if an admin exists
  const ExistingSuperAdmin = await Admin.findOne({ isSuperAdmin: true });

  if (ExistingSuperAdmin) {
    console.log("super admin already exists");
    return;
  }

  const _admin = await Admin.create({
    username: process.env.SUPER_ADMIN_USERNAME,
    password: process.env.SUPER_ADMIN_PASSWORD,
    isSuperAdmin: true,
  });
  console.log(`super admin created`);
};

export default initializeAdmin;
