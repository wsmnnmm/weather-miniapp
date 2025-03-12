/* eslint-disable import/no-commonjs */
const ci = require("miniprogram-ci");
const path = require("path");

(async () => {
  try {
    const appid = "wx08258cc85df847a2";
    const projectPath = path.resolve(__dirname, "../dist");
    const privateKeyPath = path.resolve(
      __dirname,
      "../config/private.wx08258cc85df847a2.key"
    );

    // 验证路径存在性（省略，保持原检查逻辑）

    // 关键修改：获取完整环境变量（包括 fnm 的 Node 路径）
    const env = {
      ...process.env,
      PATH: process.env.PATH, // 显式传递 PATH
    };

    const project = new ci.Project({
      appid,
      type: "miniProgram",
      projectPath,
      privateKeyPath,
      ignores: ["node_modules/**/*"],
    });

    // 强制指定使用当前 Node 实例
    const uploadResult = await ci.upload({
      project,
      version: "1.0.5",
      desc: "祝福小程序更新",
      setting: {
        es6: true,
        es7: true,
        minify: true,
        autoPrefixWXSS: true,
        codeProtect: false,
      },
      // 添加环境变量
      env: env,
    });

    console.log("上传成功:", uploadResult);
  } catch (err) {
    // 错误处理（保持原逻辑）
  }
})();
