const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const User = require('../models/User');
const Message = require('../models/Message');

async function removeUsers(targets) {
  if (!Array.isArray(targets) || targets.length === 0) {
    console.log('❌ Please provide at least one username or email to remove.');
    process.exit(1);
  }

  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const identifier of targets) {
      const query = {
        $or: [
          { username: new RegExp(`^${identifier}$`, 'i') },
          { email: new RegExp(`^${identifier}$`, 'i') }
        ]
      };

      const user = await User.findOne(query);
      if (!user) {
        console.log(`ℹ️ User "${identifier}" not found. Skipping.`);
        continue;
      }

      console.log(`🧹 Removing user ${user.username} (${user.email}) and their messages...`);

      const messageResult = await Message.deleteMany({
        $or: [
          { senderId: user._id },
          { receiverId: user._id }
        ]
      });
      console.log(`   💬 Deleted ${messageResult.deletedCount} messages linked to ${user.username}`);

      await User.deleteOne({ _id: user._id });
      console.log(`   👋 Removed user ${user.username}`);
    }

    console.log('🎉 Finished removing requested users.');
  } catch (error) {
    console.error('❌ Error removing users:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  const targets = process.argv.slice(2);
  // Default to known demo accounts if nothing passed
  const identifiers = targets.length > 0 ? targets : ['lal', 'nil', 'lal@gmail.com', 'nil@gmail.com'];
  removeUsers(identifiers);
}

module.exports = removeUsers;
