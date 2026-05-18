const notifyUsers = (io, userIds, message, task = null) => {
  if (!io || !userIds?.length) return;
  const payload = { message, task, createdAt: Date.now() };
  userIds.forEach((id) => {
    io.to(`user_${id.toString()}`).emit('notification', payload);
  });
};

module.exports = { notifyUsers };
