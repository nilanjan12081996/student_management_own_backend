require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User } = require('./src/models');

async function createAdmin() {
  const email = process.argv[2] || 'admin@yopmail.com';
  const password = process.argv[3] || '123456';
  const name = process.argv[4] || 'Admin User';

  console.log(`Creating/Updating admin: ${email}...`);

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user, created] = await User.findOrCreate({
    where: { email: email.trim().toLowerCase() },
    defaults: {
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      organization_id: 1
    }
  });

  if (!created) {
    user.password = hashedPassword;
    user.role = 'admin';
    user.status = 'active';
    await user.save();
    console.log(`✅ Admin user '${email}' already exists. Password updated to '${password}' and role set to 'admin'.`);
  } else {
    console.log(`✅ Admin user '${email}' created successfully with role 'admin' and status 'active'!`);
  }
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error('❌ Error creating admin:', err.message);
  process.exit(1);
});

