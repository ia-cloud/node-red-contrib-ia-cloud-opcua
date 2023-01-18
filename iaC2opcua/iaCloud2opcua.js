/**
 * Copyright 2019 Hiro Hashimukai on the ia-cloud project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";
const moment = require("moment");

module.exports = function(RED) {

    function iaCloud2opcua(config) {

        RED.nodes.createNode(this, config);

        const node = this;
        const ns = config.ns;
        const objRoot = config.folder;
        const initialDelay = config.initialDelay * 1000;

        let msgs = [];
        // message out for register name space to OPC server
        /*
        msgs.push({
            payload: {"opcuaCommand":"registerNamespace"},
            topic: namespace
        });
        */
        // message out for addFolder to OPC serve
        msgs.push({
            payload: {"opcuaCommand":"addFolder"},
            topic: "ns=" + ns + ";s=" + objRoot
        });

        let opcuaInfo = {nodeId: node.id, userFolder: objRoot, folderList: [], nodeList: []}

        setTimeout(function(){

            node.send([msgs,]);
            // update node status
            node.status({fill:"green", shape:"dot", text:"runtime.ready"});
    
        }, initialDelay)
        


        // input message listener
        this.on("input",function(msg, send) {
            // payload not exist,empty or no rule, do nothing
            if (msg.request !== "store" || !msg.dataObject) return;

            let addMsg = [], writeMsg = [];

            const writeVariable = function (folder, nodeId, value) {

                // dataType of value
                let dataType = "String";
                if (typeof value !== "object") {
                    if (typeof value === "boolean") dataType = "Boolean";
                    else if (typeof value === "number") dataType = "Double";
                }
                else if (Array.isArray(value)){
                    if (typeof value[0] === "boolean") {
                        dataType = "BooleanArray[" + value.length + "]";
                        value = value.toString();
                    }
                    else if (typeof value[0] === "number") {
                        dataType = "DoubleArray[" + value.length + "]";
                        value = value.toString();
                    }
                    else if (typeof value[0] === "string") {
                        dataType = "StringArray[" + value.length + "]";
                        value = value.toString();
                    }
                    else {
                        value = JSON.stringify(value);
                    }
                } else {
                    //if value is not premitive or array, make it JSON string
                    value = JSON.stringify(value);
                }
                let msg;
                let idValue = opcuaInfo.nodeList.find(elm => elm.node === nodeId);
                // nodeId already exist ?
                if (!idValue){

                    // folder already exist ?
                    let fld = opcuaInfo.folderList.find(elm => elm === folder);
                    // if not, add folder
                    if (!fld){
                        // prepering set folder message
                        msg = {};
                        msg.payload = {"opcuaCommand":"setFolder"};
                        msg.topic = "ns=" + ns + ";s=" + opcuaInfo.userFolder;
                        // prepering add folder message
                        addMsg.push(msg);

                        msg = {};
                        msg.payload = {"opcuaCommand":"addFolder"};
                        msg.topic = "ns=" + ns + ";s=" + folder;
                        // save message to message buffer
                        addMsg.push(msg);

                        // store folder information to opcuaInfo
                        opcuaInfo.folderList.push(folder);
                    }
                    else {
                        // prepering set folder message
                        msg = {};
                        msg.payload = {"opcuaCommand":"setFolder"};
                        msg.topic = "ns=" + ns + ";s=" + fld;
                        // prepering add folder message
                        addMsg.push(msg);
                    }
                    // prepering add variable message
                    msg = {};
                    msg.payload = {"opcuaCommand":"addVariable"};
                    msg.topic = "ns=" + ns + ";s=" + nodeId 
                                + ";datatype=" + dataType
                                + ";value=" + value;
                    // save message to message buffer
                    addMsg.push(msg);
                    // save nodeId to OPC-UA information
                    // store previouse value as JSON string for object of value
                    opcuaInfo.nodeList.push({node: nodeId, preValue: JSON.stringify(value)});
                }
                else {
                    // value changed ?
                    if (idValue.preValue !== JSON.stringify(value)) {
                        // prepering write variable message
                        msg = {};
                        msg.payload = value;
                        msg.topic = "ns=" + ns + ";s=" + nodeId;
                        msg.datatype = dataType;
    
                        // save message to message buffer
                        writeMsg.push(msg);
                    }
                }
            }

            let objectKey = msg.dataObject.objectKey;
            // if not exists, addFolder for nodeId of ia-cloud object properties
            for (let prop in msg.dataObject) {
                if (prop === "objectContent") {
                    if (msg.dataObject[prop].contentType) {
                        writeVariable(objectKey, objectKey + ".contentType", msg.dataObject[prop].contentType);  
                    }
                    continue;
                }
                writeVariable(objectKey, objectKey + "." + prop, msg.dataObject[prop]);   
            }

            let contentData = msg.dataObject.objectContent.contentData;
            for (let i = 0; i < contentData.length; i++) {
                let name = contentData[i].commonName ? contentData[i].commonName: contentData[i].dataName; 
                // addFolder for nodeId of ia-cloud data item properties 
                for (let prop in contentData[i]) {
                    writeVariable(objectKey, objectKey + "." + name + "." + prop, contentData[i][prop]);   
                }
            }

            // send message to OPC-UA server to add variable
            send([addMsg,writeMsg]);
            node.status({fill:"green", shape:"dot", text:"runtime.output"});

        }); 
    }

    RED.nodes.registerType("iaCloud2opcua",iaCloud2opcua);
}

/*  memo for OPC-UA nodeId structure */
/*
no commonName in data item
```
ia-cloud-data
    ├── objectKey + ".obkectKey"
    ├── objectKey + ".cobjectDescription"
    ├── objectKey + ".objectContet"
    ├── objectKey + ".contentType"
    ├── objectKey.dataName + ".dataName"
    ├── objectKey.dataName + ".dataValue"
    ├── objectKey.dataName + ".unit"
    ├── objectKey.dataName + ".dataName"
    ├── objectKey.dataName + ".dataValue"
    └── objectKey.dataName + ".unit"
```
commonName dose exists in data item
```
ia-cloud-data
    ├── objectKey + ".obkectKey"
    ├── objectKey + ".cobjectDescription"
    ├── objectKey + ".objectContet"
    ├── objectKey + ".contentType"
    ├── objectKey.commonName + ".commonName"
    ├── objectKey.commonName + ".dataName"
    ├── objectKey.commonName + ".dataValue"
    ├── objectKey.commonName + ".unit"
    ├── objectKey.commonName + ".commonName"
    ├── objectKey.commonName + ".dataName"
    ├── objectKey.commonName + ".dataValue"
    └── objectKey.commonName + ".unit"
```
*/
