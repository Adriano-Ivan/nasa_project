module.exports = {
  apps : [{
    name   : "nasa_project",
    script : "./src/server.js",
    instances: "max",
    exec_mode: "cluster",
    watch: true,
    env: {
      NODE_ENV: "production",
      PORT: 5000   
    },
    out_file: "./out.log.txt",
    error_file: "./err.log.txt",
  }]
}
