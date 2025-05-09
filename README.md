# Ogmios GitHub Action

## Overview
This GitHub Action facilitates the integration of ogmios into workflows, enabling easy access and manipulation of ogmios tasks in your CI/CD pipelines.

## Features
Automatically downloads and installs the v6.3.0 ogmios.
Configures the environment to make the tools accessible throughout the workflow.

## Usage
To use this action in your workflow just add the following lines to your workflow file:

```yaml
- name: Install ogmios
  uses: milos-ethernal/ogmios-action@{sha}
  with:
    tag: 'v6.11.2'
```
Tag is optional parameter, if not defined action will use ogmios release version v6.3.0.

After this step ogmios will be available in your workflow.
You can use them in your scripts or directly execute them in your workflow steps.

##Contributing
Contributions to this action are welcome! Please follow the standard pull request process to suggest improvements or add new features.