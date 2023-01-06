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

var moment = require("moment");

module.exports = function (RED) {
    
    function registerOpcuaNode(config) {
        
        RED.nodes.createNode(this, config);
        const node = this;
        
        // プロパティを読み込んでオブジェクトを生成
        this._obj = { objectContent: {} };
        this._obj.objectKey = config.objectKey;
        this._obj.objectDescription = config.objectDescription;
        this._obj.objectContent.contentType = config.contentType;
        this._obj.objectContent.contentData = [];
        config.dataItems.forEach(item => { this._obj.objectContent.contentData.push(Object.assign({}, item)); })

        this._sent = false;
        this.sendMsg = function() {
            let self = this;

            //  create 1st message to register information
            //  only first time
            let regMsg = null;
            if (!self._sent){
                regMsg = self._obj;
                self._sent = true;
            }

            //  create 2nd message to read from OPC UA node
            let nodeIdsMsg = [];
            let nodeIds = [];
            self._obj.objectContent.contentData.forEach(function(item) {
                let nodeId = { topic: item.nodeId };
                nodeIds.push(nodeId);
            });
            nodeIdsMsg.push(nodeIds)

            self.send([regMsg, nodeIds]);
            self.status({fill:"green", shape:"dot", text:"runtime.sent"});
        };

        let initialDelay = config.delay;
        if (!initialDelay){ //  if delay value is undefined or null, set 0
            initialDelay = 0;
        }
        this._interval = config.interval;

        //  for check interval.
        this._lastInterval = Date.now() - (this._interval * 1000) + (initialDelay * 1000);
        //  every 500ms to check the interval.
        this._timerid = setInterval(function(){
            let self = this;
            node.status({fill:"green", shape:"dot", text:"runtime.ready"});

            let current = Date.now();
            if (self._interval > 0) {
                if (current - (self._lastInterval) >= (self._interval * 1000)) {
                    self._lastInterval = current;
                    self.sendMsg();
                }
            }
        }.bind(this), 500, this);

        //  input -> output message
        this.on("input", function (msg) {
            let self = this;
            self.sendMsg();
        });
    }

    RED.nodes.registerType("registerOpcuaNode", registerOpcuaNode);
}
