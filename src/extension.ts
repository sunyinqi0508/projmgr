import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createProjectDirectory', async () => {
        const config = vscode.workspace.getConfiguration('projectWizard');
        
        let basePath = config.get<string>('baseDirectory');

        if (!basePath) {
            basePath = await vscode.window.showInputBox({
                prompt: 'Enter base directory path (or leave blank to use default)',
                value: basePath
            }) || path.join(os.homedir(), 'Documents', 'projects');
            config.update('baseDirectory', basePath, vscode.ConfigurationTarget.Global);
        }
        

        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }

        await config.update('baseDirectory', basePath, vscode.ConfigurationTarget.Global);

        const projectNameInput = await vscode.window.showInputBox({
            prompt: 'Enter project name (or leave blank for default)',
            placeHolder: 'MyNewProject'
        });

        const projectName = projectNameInput || getNextAvailableProjectName(basePath);

        const projectPath = path.join(basePath, projectName);

        if (fs.existsSync(projectPath)) {
            vscode.window.showErrorMessage('Project directory already exists.');
            return;
        }

        try {
            fs.mkdirSync(projectPath, { recursive: true });
            vscode.window.showInformationMessage(`Project directory '${projectName}' created at ${basePath}`);

            // Open the new project folder in a new VSCode window
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectPath), true);
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Failed to create project directory: ${error.message}`);
            } else {
                vscode.window.showErrorMessage('Failed to create project directory due to an unknown error.');
            }
        }
    });

    context.subscriptions.push(disposable);
}

function getNextAvailableProjectName(basePath: string): string {
    let projectNumber = 1;
    let projectName = `Project${projectNumber}`;

    while (fs.existsSync(path.join(basePath, projectName))) {
        projectNumber++;
        projectName = `Project${projectNumber}`;
    }

    return projectName;
}

export function deactivate() {}
