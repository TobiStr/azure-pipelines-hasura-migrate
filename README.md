# Hasura Migrate Task for Azure Pipelines

[Get it here](https://marketplace.visualstudio.com/items?itemName=Tobias-Streng.hasura-migrate)

Azure DevOps Pipeline Extension to automatically apply migrations, metadata and seeds to hasura.

The extension will first apply all migrations, then all seeds and then metadata.

## How to Use

In your pipeline.yml File add as Task:

```yaml
# Install Hasura CLI
- script: |
        npm i -g hasura-cli
      displayName: Install NPM Dependencies
      workingDirectory: $(WORKING_DIRECTORY)

# Add Migration Task
- task: hasura-migrate-task@2
    displayName: Hasura Migrate
    inputs:
      adminSecret: "<admin-secret>" # Required
      workingDirectory: "<path-to-config-yaml-directory>" # Optional
      endpoint: "https://<name>.hasura.app" # Optional (default: read from config.yaml)
      databaseName: "default" # Optional (default: "default")
      logLevel: "INFO" # Optional (default: INFO, possible values: DEBUG, INFO, WARN, ERROR, FATAL)
```
