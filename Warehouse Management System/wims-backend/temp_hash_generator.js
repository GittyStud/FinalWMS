const bcrypt = require("bcrypt");

async function generateHash(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log("----------------------------------------------------");
  console.log(`✅ Copy the hash below for the password: ${password}`);
  console.log("----------------------------------------------------");
  console.log(hash);
  console.log("----------------------------------------------------");
}

generateHash("password123");

