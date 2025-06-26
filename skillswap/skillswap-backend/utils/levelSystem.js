// utils/levelSystem.js

export const awardXp = (user, amount) => {
  user.xp += amount;

  const newBadges = [];

  // 🏆 Award XP Milestone Badges
  const xpMilestones = [100, 500, 1000, 2000];
  xpMilestones.forEach((milestone) => {
    if (user.xp >= milestone && !user.badges.includes(`XP ${milestone}`)) {
      user.badges.push(`XP ${milestone}`);
      newBadges.push(`XP ${milestone}`);
    }
  });

  // 🧠 Level Up Logic with Badges
  let leveledUp = false;
  const xpForNextLevel = user.level * 100;
  while (user.xp >= xpForNextLevel) {
    user.xp -= xpForNextLevel;
    user.level += 1;
    leveledUp = true;

    const levelBadge = `Level ${user.level}`;
    if (!user.badges.includes(levelBadge)) {
      user.badges.push(levelBadge);
      newBadges.push(levelBadge);
    }
  }

  // 🧑‍🏫 Optional Mentorship Badges
  if (user.sessionHistory) {
    const taughtCount = user.sessionHistory.filter(s => s.role === 'taught').length;
    const learnedCount = user.sessionHistory.filter(s => s.role === 'learned').length;

    if (taughtCount >= 5 && !user.badges.includes('Mentor Lv1')) {
      user.badges.push('Mentor Lv1');
      newBadges.push('Mentor Lv1');
    }

    if (learnedCount >= 5 && !user.badges.includes('Learner Lv1')) {
      user.badges.push('Learner Lv1');
      newBadges.push('Learner Lv1');
    }
  }

  return {
    updatedUser: user,
    newBadges,
    leveledUp,
  };
};
