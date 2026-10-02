import * as vscode from 'vscode';

const TICK_MS = 100;

interface PetInfo {
    label: string;
    root: string;
    facing: 'left' | 'right';
}

// root is the media path before "_<animation>_8fps.gif".
const PETS: Record<string, PetInfo> = {
    zin: { label: 'Zin', root: 'zin/zin', facing: 'left' },
    zin_v2: { label: 'Zin v2', root: 'zin_v2/zin_v2', facing: 'left' },
    chicken: { label: 'Chicken', root: 'chicken/brown', facing: 'right' },
};
const DEFAULT_PET = 'zin_v2';
const LAST_PET_KEY = 'lastPet';

export function activate(context: vscode.ExtensionContext) {
    const provider = new PetViewProvider(context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            PetViewProvider.viewType,
            provider,
        ),
        vscode.commands.registerCommand('vscode-mh.start', async () => {
            const choice = await vscode.window.showQuickPick(
                Object.entries(PETS).map(([id, pet]) => ({
                    label: pet.label,
                    id,
                })),
                { placeHolder: 'Pick a pet' },
            );
            if (!choice) {
                return;
            }
            await context.globalState.update(LAST_PET_KEY, choice.id);
            provider.render();
            await vscode.commands.executeCommand(
                `${PetViewProvider.viewType}.focus`,
            );
        }),
    );

    const item = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100,
    );
    item.text = '$(squirrel) Monster Hunter';
    item.command = 'vscode-mh.start';
    item.show();
    context.subscriptions.push(item);
}

// The pet lives in the Explorer sidebar. It shows the last pet chosen.
class PetViewProvider implements vscode.WebviewViewProvider {
    static readonly viewType = 'vscode-mh.petView';
    private view: vscode.WebviewView | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(view: vscode.WebviewView) {
        this.view = view;
        view.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
            ],
        };
        this.render();

        // The webview has no timer of its own, the extension sends the ticks.
        const timer = setInterval(() => {
            if (view.visible) {
                void view.webview.postMessage({ command: 'tick' });
            }
        }, TICK_MS);
        view.onDidDispose(() => {
            clearInterval(timer);
            this.view = undefined;
        });
    }

    render() {
        if (!this.view) {
            return;
        }
        const lastId = this.context.globalState.get<string>(
            LAST_PET_KEY,
            DEFAULT_PET,
        );
        this.view.webview.html = getHtml(
            this.view.webview,
            this.context.extensionUri,
            PETS[lastId] ?? PETS[DEFAULT_PET],
        );
    }
}

function getHtml(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    pet: PetInfo,
): string {
    const mediaUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media'),
    );
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media', 'main.js'),
    );
    const styleUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'media', 'style.css'),
    );
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="${styleUri}" rel="stylesheet">
    <title>Monster Hunter</title>
</head>
<body data-media="${mediaUri}" data-pet-root="${pet.root}" data-facing="${pet.facing}">
    <img id="pet" alt="pet">
    <div id="bubble">👋</div>
    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function getNonce(): string {
    const chars =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

export function deactivate() {}
