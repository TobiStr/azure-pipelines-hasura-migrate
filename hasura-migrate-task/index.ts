import tl = require("azure-pipelines-task-lib/task");
import util = require("util");

const exec = util.promisify(require("child_process").exec);

async function run() {
  try {
    console.log("Running hasura-migrate-task.");

    const adminSecret: string | undefined = tl.getInput("adminSecret", true);

    const workingDirectory =
      tl.getInput("workingDirectory") ||
      tl.getVariable("System.DefaultWorkingDirectory");

    tl.cd(<string>workingDirectory);

    const endpoint: string | undefined = tl.getInput("endpoint");
    const databaseName = tl.getInput("databaseName") || "default";
    const logLevel = tl.getInput("logLevel") || "INFO";

    // Fixes bug for metadata apply "error in converting sdl to metadata"
    process.env["NODE_OPTIONS"] = "";

    const params = getHasuraParameters(endpoint, adminSecret, logLevel);

    await runMigration(databaseName, params);
    //Run seeds before metadata, due to possible inconsistencies with e.g. enums
    await runSeed(databaseName, params);
    await runMetadata(params);

    console.log("Finished hasura-migrate-task. Check Logs above for errors.");
  } catch (err) {
    tl.setResult(tl.TaskResult.Failed, (<Error>err).message);
  }
}

async function runMigration(databaseName: string, params: string) {
  console.log(`Running hasura migrate apply...`);
  const migrationLog = await exec(
    `hasura migrate apply --database-name ${databaseName} ${params}`
  );
  console.log("Migration Result:");
  console.log(migrationLog);
}

async function runSeed(databaseName: string, params: string) {
  // When no seeds configured, this will throw an error, but can be ignored
  try {
    console.log(`Running hasura seed apply...`);
    const seedLog = await exec(
      `hasura seed apply --database-name ${databaseName} ${params}`
    );
    console.log("Seed Result:");
    console.log(seedLog);
  } catch (error: any) {
    console.log(
      "If no seeds are configured, the following warning can be ignored:"
    );
    console.warn(error.message);
  }
}

async function runMetadata(params: string) {
  console.log(`Running hasura metadata apply...`);
  const metadataLog = await exec(`hasura metadata apply ${params}`);
  console.log("Metadata Result:");
  console.log(metadataLog);
}

function getHasuraParameters(
  endpoint: string | undefined,
  adminSecret: string | undefined,
  logLevel: string
) {
  if (endpoint) {
    return `--endpoint ${endpoint} --admin-secret ${adminSecret} --log-level ${logLevel}`;
  }
  return `--admin-secret ${adminSecret} --log-level ${logLevel}`;
}

run();
