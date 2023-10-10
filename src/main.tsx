/*
 * Copyright (c) 2000, 2099, ducesoft and/or its affiliates. All rights reserved.
 * DUCESOFT PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 *
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/main.css';
import "@arco-design/web-react/dist/css/arco.css";
import SQLEditor from "@/editor";


const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<SQLEditor/>);