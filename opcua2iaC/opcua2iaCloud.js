/**
 * Copyright 2022 Atsushi SHIRAISHI on the ia-cloud project
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

module.exports = function (RED) {
    
    function opcua2iaCloud(config) {
        
        RED.nodes.createNode(this, config);
        const node = this;
        
        this._objs = [];
        node.status({fill:"green", shape:"dot", text:"runtime.ready"});

        this.registerInfo = function (in_msg){
            let self = this;
            // just push to object list
            this._objs.push(in_msg);
        }
        
        this.sendToIaC = function (in_msg){
            let self = this;
            self._objs.forEach(obj => {
                obj.objectContent.contentData.forEach(item => {
                    if(item.nodeId == in_msg.topic){
                        //  create message
                        let ia_msg={ request: "store", dataObject: { objectContent: {} } };
            
                        ia_msg.dataObject.objectKey = obj.objectKey;
                        ia_msg.dataObject.timestamp = in_msg.sourceTimestamp;
                        ia_msg.dataObject.objectType = "iaCloudObject";
                        ia_msg.dataObject.objectDescription = obj.objectDescription;
                        ia_msg.dataObject.objectContent.contentType = obj.objectContent.contentType;
                        ia_msg.dataObject.quality = "good";
                        
                        let contentData = [];
                        let contentItem = {
                            dataName: item.dataName,
                            dataValue: in_msg.payload,
                            quality: in_msg.statusCode.value == 0 ? "good" : "bad"
                         };
                         if (item.unit && (item.unit != "")) {
                            contentItem.unit = item.unit;
                         }
                        contentData.push(contentItem);
                        ia_msg.dataObject.objectContent.contentData = contentData;
                        ia_msg.payload = contentData;
                        self.send(ia_msg);
                        self.status({fill:"green", shape:"dot", text:"runtime.sent"});
                    }
                });
            });
        };

        this.on("input", function (msg) {
            let self = this;
            if (msg.topic != undefined) {
                //  topic is there
                self.sendToIaC(msg);
            }
            else {
                //  no topic -> register information
                self.registerInfo(msg);
            }
        });
    }

    RED.nodes.registerType("opcua2iaCloud", opcua2iaCloud);
}
