export default {
  blacklist: [
    { username: "用户1", phone: "13800138000", idCard: "110101199003077654", addTime: "2023-01-01 10:00:00", banTime: "2023-01-15 14:30:00", policy: "全局禁用", source: "短信系统" },
    { username: "用户2", phone: "13900139000", idCard: "310115198502128765", addTime: "2023-02-01 09:15:00", banTime: "2023-02-10 11:20:00", policy: "全局禁用", source: "AI外呼-九四" },
    { username: "用户4", phone: "13600136000", idCard: "510104199208156543", addTime: "2023-03-05 16:20:00", banTime: "2023-03-20 09:45:00", policy: "全局禁用", source: "AI外呼-百应" },
    { username: "用户5", phone: "13500135000", idCard: "330106199107189876", addTime: "2023-04-10 11:30:00", banTime: "2023-04-25 14:15:00", policy: "全局禁用", source: "人工电销" },
    { username: "用户6", phone: "13400134000", idCard: "420102199309123210", addTime: "2023-05-15 08:40:00", banTime: "2023-05-30 16:50:00", policy: "全局禁用", source: "AI外呼-百应" }
  ],
  unbanned: [
    { username: "用户3", phone: "13700137000", idCard: "440305199512123456", addTime: "2022-12-01 08:00:00", banTime: "2022-12-20 10:00:00", unbanTime: "2023-01-05 15:00:00", policy: "全局禁用", source: "客服系统" },
    { username: "用户7", phone: "13300133000", idCard: "320103199410154321", addTime: "2023-01-10 09:20:00", banTime: "2023-01-25 11:40:00", unbanTime: "2023-02-10 14:30:00", policy: "全局禁用", source: "人工电销" },
    { username: "用户8", phone: "13200132000", idCard: "130105199605167890", addTime: "2023-02-15 13:10:00", banTime: "2023-03-01 15:25:00", unbanTime: "2023-03-15 10:20:00", policy: "全局禁用", source: "AI外呼-百应" }
  ],
  channels: [
    { id: 1, name: "短信渠道", status: "启用", quota: 1000, used: 350 },
    { id: 2, name: "邮件渠道", status: "启用", quota: 500, used: 120 }
  ]
}
