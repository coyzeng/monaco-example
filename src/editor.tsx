/*
 * Copyright (c) 2000, 2099, ducesoft and/or its affiliates. All rights reserved.
 * DUCESOFT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 *
 */

import {useEffect, useRef, useState} from 'react';
import * as monaco from 'monaco-editor';
import {CloseAction, ErrorAction, MessageTransports} from "vscode-languageclient";
import {initServices, MonacoLanguageClient} from "monaco-languageclient";
import {toSocket, WebSocketMessageReader, WebSocketMessageWriter} from "vscode-ws-jsonrpc";
import "monaco-editor/esm/vs/basic-languages/monaco.contribution.js";
import "@/github";

const lang = 'mysql';

const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
    return new MonacoLanguageClient({
        name: 'USQL',
        clientOptions: {
            documentSelector: [lang],
            errorHandler: {
                error: () => ({action: ErrorAction.Continue}),
                closed: () => ({action: CloseAction.DoNotRestart})
            },
            initializationOptions: {
                alias: 'galaxy',
                driver: 'mysql',
                dataSourceName: '',
                proto: 'tcp',
                user: 'root',
                passwd: '',
                host: '127.0.0.1',
                port: 3310,
                path: '',
                dbName: 'galaxy',
                params: {
                    autocommit: 'true',
                },
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => {
                return Promise.resolve(transports);
            }
        }
    });
};

const initMonacoService = initServices({
    debugLogging: true
});

const createWebSocket = async (url: string): Promise<WebSocket> => {
    const webSocket = new WebSocket(url);
    webSocket.onopen = async () => {
        console.log(0)
        await initMonacoService;
        console.log(1)
        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        const languageClient = createLanguageClient({reader, writer});
        languageClient.start().then(() => {
            reader.onClose(() => languageClient.stop());
        })
    };
    window.onbeforeunload = () => {
        // On page reload/exit, close web socket connection
        webSocket.close();
    };
    return webSocket;
};

const socket = createWebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/usql/lsp`);

monaco.languages.register({
    id: lang,
    extensions: ['.sql'],
    aliases: ['SQL', 'sql'],
    mimetypes: ['application/sql']
});

export default function SQLEditor() {

    const monacoEl = useRef();
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();
    const [script, setScript] = useState('');

    useEffect(() => {
        if (editor) {
            return;
        }
        setEditor((cache) => {
            if (cache) {
                return cache;
            }
            const editor = monaco.editor.create(monacoEl.current!, {
                value: script,
                language: lang,
                screenReaderAnnounceInlineSuggestion: true,
                minimap: {
                    enabled: false,
                },
                theme: 'usql',
                tabSize: 4,
                automaticLayout: true,
                lightbulb: {
                    enabled: true,
                }
            });
            editor.addAction({
                id: "run-usql",
                label: "Run",
                keybindings: [
                    monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd, monaco.KeyCode.KeyR),
                ],
                contextMenuGroupId: "navigation",
                contextMenuOrder: 1.5,
                run: function (ed) {
                    alert("i'm running => " + ed.getPosition());
                },
            });
            return editor;
        });

        // return () => {
        //     editor?.dispose();
        // };
    }, [monacoEl.current]);

    // @ts-ignore
    return <div style={{width: '100vw', height: '100vh'}} ref={monacoEl}></div>;
};
